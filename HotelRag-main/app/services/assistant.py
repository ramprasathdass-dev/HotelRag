import re
from pathlib import Path
from typing import Any, Dict, Optional

from app.core.pii import mask_pii
from app.core.security import guardrail_check
from app.rag.chunker import RecursiveChunker
from app.rag.embedder import Embedder
from app.rag.loader import PDFLoader
from app.rag.retriever import Retriever
from app.rag.vector_store import FAISSVectorStore
from app.router.intent_router import IntentRouter
from app.tools.reservation_tools import cancel_reservation, create_reservation, view_reservation


class AssistantService:
    def __init__(self):
        self.router = IntentRouter()
        self.embedder = Embedder()
        self.vector_store = FAISSVectorStore()
        self.chunker = RecursiveChunker()
        self.retriever = Retriever(self.vector_store, self.embedder)
        self._initialize_rag_index()

    def _initialize_rag_index(self) -> None:
        pdf_path = Path("data/hotel_policy.pdf")
        if not pdf_path.exists():
            self.vector_store.index = None
            return
        loader = PDFLoader(str(pdf_path))
        text = loader.load()
        chunks = self.chunker.chunk(text)
        if not chunks:
            self.vector_store.index = None
            return
        embeddings = self.embedder.embed(chunks)
        self.vector_store.build(embeddings, chunks)

    def _clean_context(self, text: str, max_length: int = 420) -> str:
        compact = re.sub(r"\s+", " ", text).strip()
        if len(compact) <= max_length:
            return compact
        return compact[: max_length - 3].rstrip() + "..."

    def _answer_from_rag(self, question: str) -> str:
        if self.vector_store.index is None:
            return "The information is not available in the provided hotel document."
        contexts = self.retriever.retrieve(question, top_k=3)
        if not contexts:
            return "The information is not available in the provided hotel document."
        primary = self._clean_context(contexts[0])
        if len(contexts) == 1:
            return f"According to the hotel guide: {primary}"
        secondary = self._clean_context(contexts[1], max_length=220)
        return f"According to the hotel guide: {primary}\n\nAlso useful: {secondary}"

    def handle_message(self, message: str) -> Dict[str, Any]:
        masked_message = mask_pii(message)
        if guardrail_check(masked_message):
            return {
                "answer": "I can only help with hotel policy and reservation questions.",
                "intent": "chitchat",
                "sources": [],
            }
        intent = self.router.route(masked_message)
        if intent == "rag":
            answer = self._answer_from_rag(masked_message)
            return {"answer": answer, "intent": intent, "sources": ["hotel_policy.pdf"]}
        if intent == "tool":
            answer = (
                "I can help with reservations. Use the booking form to create a stay, "
                "or use your reservation ID and access token in the manage section to view or cancel it."
            )
            return {"answer": answer, "intent": intent, "sources": []}
        return {
            "answer": "I can help with hotel policies, check-in details, cancellations, and reservations.",
            "intent": intent,
            "sources": [],
        }

    def create_reservation(
        self,
        *,
        guest_name: str,
        email: str,
        room_type: str,
        check_in: str,
        check_out: str,
        guest_count: int = 1,
        arrival_time: Optional[str] = None,
        occasion: Optional[str] = None,
        add_on_summary: Optional[str] = None,
        special_request: Optional[str] = None,
    ) -> Dict[str, Any]:
        payload = create_reservation(
            guest_name=guest_name,
            email=email,
            room_type=room_type,
            check_in=check_in,
            check_out=check_out,
            guest_count=guest_count,
            arrival_time=arrival_time,
            occasion=occasion,
            add_on_summary=add_on_summary,
            special_request=special_request,
        )
        payload["message"] = "Reservation confirmed. Save your access token to manage the booking later."
        return payload

    def view_reservation(self, reservation_id: str, access_token: Optional[str] = None) -> Dict[str, Any]:
        result = view_reservation(
            reservation_id,
            access_token=access_token,
            include_access_token=access_token is not None,
        )
        if result is None:
            raise ValueError("Reservation not found or access token invalid")
        result["message"] = "Reservation located successfully."
        return result

    def cancel_reservation(self, reservation_id: str, access_token: Optional[str] = None) -> Dict[str, Any]:
        result = cancel_reservation(
            reservation_id,
            access_token=access_token,
            include_access_token=access_token is not None,
        )
        result["message"] = "Reservation cancelled successfully."
        return result
