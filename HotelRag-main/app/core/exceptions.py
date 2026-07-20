class AssistantError(Exception):
    """Base exception for assistant operations."""


class GuardrailViolationError(AssistantError):
    """Raised when a request violates guardrails."""
