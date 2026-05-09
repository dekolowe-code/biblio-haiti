from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://biblio_user:biblio_password@localhost:5432/biblio_haiti"
    
    # Security
    SECRET_KEY: str = "change-this-to-a-secure-random-string-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    # Backblaze B2
    BACKBLAZE_BUCKET_NAME: Optional[str] = None
    BACKBLAZE_KEY_ID: Optional[str] = None
    BACKBLAZE_APP_KEY: Optional[str] = None
    BACKBLAZE_ENDPOINT: str = "https://s3.us-west-004.backblazeb2.com"
    
    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    
    # MonCash
    MONCASH_CLIENT_ID: Optional[str] = None
    MONCASH_CLIENT_SECRET: Optional[str] = None
    MONCASH_ENVIRONMENT: str = "sandbox"  # or 'production'
    
    # Application
    APP_NAME: str = "Biblio-Haïti"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:8081"
    
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Copyright API
    COPYRIGHT_API_URL: Optional[str] = None
    COPYRIGHT_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
