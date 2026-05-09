from typing import Any
import logging

from fastapi_mail import FastMail, MessageSchema

from backend.core.settings import settings

logger = logging.getLogger(__name__)


async def send_email(
    *,
    subject: str,
    email_to: str,
    template_name: str,
    template_context: dict[str, Any] | None = None,
) -> None:
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        template_body=template_context or {},
        subtype="html",
    )
    fm = FastMail(settings.mail_config)
    try:
        await fm.send_message(message, template_name=template_name)
    except Exception as e:
        logger.warning("Email sending failed: %s (SMTP not configured?)", e)
