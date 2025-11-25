from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    n8n_webhook_url: str
    allowed_origins: str = "*"  # Comma-separated list of allowed origins, or "*" for all

    class Config:
        env_file = ".env"

settings = Settings()
