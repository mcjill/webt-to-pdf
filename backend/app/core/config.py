from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Web2PDF"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./web2pdf.db"  # Using SQLite instead

    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]  # Frontend URL
    
    # Storage
    PDF_STORAGE_PATH: str = "pdfs"

    class Config:
        case_sensitive = True

settings = Settings()
