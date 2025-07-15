from decouple import config
from typing import Any

class Settings:
    # Database
    DATABASE_URL: str = config('DATABASE_URL', default='postgresql://user:password@localhost:5432/anniversary_db')
    
    # Security
    SECRET_KEY: str = config('SECRET_KEY', default='your-secret-key-change-in-production')
    ADMIN_PASSWORD: str = config('ADMIN_PASSWORD', default='vibeCoding2025!')
    PREVIEW_TOKEN: str = config('PREVIEW_TOKEN', default='vibeCoding2025!')
    
    # AWS S3
    AWS_ACCESS_KEY_ID: str = config('AWS_ACCESS_KEY_ID', default='')
    AWS_SECRET_ACCESS_KEY: str = config('AWS_SECRET_ACCESS_KEY', default='')
    AWS_REGION: str = config('AWS_REGION', default='us-east-1')
    S3_BUCKET_NAME: str = config('S3_BUCKET_NAME', default='anniversary-app-media')
    
    # App Settings
    API_VERSION: str = "v1"
    PROJECT_NAME: str = "25 Days Anniversary App"
    
    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",  # React dev server
        "http://localhost:8080",  # Production frontend
        "http://frontend:3000",   # Docker container
    ]
    
    # File Upload
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_MIME_TYPES: set[str] = {
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg',
        'audio/mp3', 'audio/wav', 'audio/ogg'
    }

settings = Settings() 