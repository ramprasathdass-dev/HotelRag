import re

EMAIL_PATTERN = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_PATTERN = re.compile(r"\+?\d[\d\s().-]{7,}\d")


def mask_pii(text: str) -> str:
    masked = EMAIL_PATTERN.sub("[REDACTED_EMAIL]", text)
    masked = PHONE_PATTERN.sub("[REDACTED_PHONE]", masked)
    return masked
