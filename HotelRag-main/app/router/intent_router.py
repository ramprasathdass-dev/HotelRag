from typing import Dict

from app.core.security import guardrail_check


class IntentRouter:
    def route(self, message: str) -> str:
        lowered = message.lower()
        if guardrail_check(message):
            return "chitchat"
        if "book" in lowered or "reservation" in lowered or "cancel" in lowered or "room" in lowered:
            return "tool"
        if "policy" in lowered or "cancellation" in lowered or "check-in" in lowered or "check out" in lowered:
            return "rag"
        return "chitchat"
