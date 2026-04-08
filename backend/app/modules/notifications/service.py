from telegram import Bot
from app.core.config import get_settings


async def send_telegram_alert(message: str):
    settings = get_settings()
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return
    bot = Bot(token=settings.telegram_bot_token)
    await bot.send_message(chat_id=settings.telegram_chat_id, text=message, parse_mode="Markdown")


async def notify_job_match(job_title: str, company: str, score: float, priority: str, url: str = ""):
    if priority == "SKIP" or score < 60:
        return  # Only notify high-quality matches
    msg = (
        f"🎯 *New Job Match*\n\n"
        f"*{job_title}* at *{company}*\n"
        f"Match Score: *{score}/100*\n"
        f"Priority: *{priority}*\n"
        f"{f'Link: {url}' if url else ''}"
    )
    await send_telegram_alert(msg)
