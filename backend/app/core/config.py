from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str
    groq_api_key: str = ""
    openai_api_key: str = ""
    llm_provider: str = "groq"  # groq | openai
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    embedding_model: str = "all-MiniLM-L6-v2"
    app_env: str = "development"
    log_level: str = "INFO"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
