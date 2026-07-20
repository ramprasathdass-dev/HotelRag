import re

PROMPT_INJECTION_PATTERN = re.compile(r"ignore previous instructions|reveal secrets|system prompt|developer prompt", re.IGNORECASE)


def guardrail_check(text: str) -> bool:
    return bool(PROMPT_INJECTION_PATTERN.search(text))
