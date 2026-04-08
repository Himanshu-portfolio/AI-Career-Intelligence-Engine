from app.core.config import get_settings

s = get_settings()
print("DB:", s.database_url[:40] + "..." if s.database_url else "MISSING")
print("Groq:", "SET" if s.groq_api_key else "MISSING")
print("Provider:", s.llm_provider)
