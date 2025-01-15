from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class ConversionBase(BaseModel):
    url: HttpUrl

class ConversionCreate(ConversionBase):
    pass

class ConversionUpdate(ConversionBase):
    status: Optional[str] = None
    error_message: Optional[str] = None

class Conversion(ConversionBase):
    id: int
    user_id: int
    output_filename: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class ConversionStats(BaseModel):
    total_conversions: int
    remaining_conversions: int
    tier: str
