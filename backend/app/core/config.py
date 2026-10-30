import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "BenefitLens: Transparent Government Benefit Disbursement Tracker"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "postgresql://postgres:12345@127.0.0.1:12345/benefit_govt_db"
    DB_FALLBACK_SQLITE: bool = False
    
    JWT_SECRET: str = "super_secret_benefitlens_secure_key_2026_x7a9q2!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    SMS_GATEWAY_PROVIDER: str = "simulated"
    SMS_GATEWAY_API_KEY: str = "test_sms_key_benefitlens"
    SMS_SENDER_ID: str = "BNFLNS"
    
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
