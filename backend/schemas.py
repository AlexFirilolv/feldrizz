from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from uuid import UUID

# Admin Authentication Schemas
class AdminLoginRequest(BaseModel):
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Section Schemas
class SectionStyleConfig(BaseModel):
    alignment: Optional[str] = "left"  # left, center, right
    font_size: Optional[str] = "medium"  # small, medium, large
    color: Optional[str] = None
    background_color: Optional[str] = None
    margin: Optional[str] = "normal"  # small, normal, large

class DaySectionBase(BaseModel):
    section_type: str = Field(..., pattern="^(title|text|image|video|audio|quote|divider)$")
    content_text: Optional[str] = None
    position_order: int = Field(..., ge=0)
    style_config: Optional[SectionStyleConfig] = None
    media_asset_id: Optional[UUID] = None

class DaySectionCreate(DaySectionBase):
    day_number: int = Field(..., ge=1, le=25)

class DaySectionUpdate(BaseModel):
    section_type: Optional[str] = Field(None, pattern="^(title|text|image|video|audio|quote|divider)$")
    content_text: Optional[str] = None
    position_order: Optional[int] = Field(None, ge=0)
    style_config: Optional[SectionStyleConfig] = None
    media_asset_id: Optional[UUID] = None

class DaySectionResponse(DaySectionBase):
    id: UUID
    day_number: int
    created_at: datetime
    updated_at: datetime
    media_asset: Optional['MediaAssetResponse'] = None
    
    class Config:
        from_attributes = True

# Audio Configuration Schemas
class AudioConfig(BaseModel):
    autoplay: bool = False
    loop: bool = False
    volume: float = Field(1.0, ge=0.0, le=1.0)
    background_mode: bool = False  # True for background, False for interactive
    fade_on_video: bool = True  # Whether to fade background audio when video plays
    video_volume_ratio: float = Field(0.3, ge=0.0, le=1.0)  # Background audio volume when video plays

class MediaConfig(BaseModel):
    # Audio specific config
    autoplay: bool = False
    loop: bool = False
    volume: float = Field(1.0, ge=0.0, le=1.0)
    background_mode: bool = False
    controls: bool = True
    
    # Video specific config
    muted: bool = False
    poster: Optional[str] = None
    
    # Image specific config
    alt_text: Optional[str] = None
    caption: Optional[str] = None

# Countdown Day Schemas
class CountdownDayBase(BaseModel):
    day_number: int = Field(..., ge=1, le=25)
    title: str = Field(..., max_length=255)
    content_html: Optional[str] = None  # Legacy support
    background_audio_id: Optional[UUID] = None
    audio_config: Optional[AudioConfig] = None

class CountdownDayCreate(CountdownDayBase):
    pass

class CountdownDayUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content_html: Optional[str] = None
    background_audio_id: Optional[UUID] = None
    audio_config: Optional[AudioConfig] = None

class CountdownDayResponse(CountdownDayBase):
    id: int
    release_datetime_utc: datetime
    created_at: datetime
    updated_at: datetime
    is_unlocked: bool = False  # Computed field
    sections: List[DaySectionResponse] = []
    media_assets: List['MediaAssetResponse'] = []
    background_audio: Optional['MediaAssetResponse'] = None
    
    class Config:
        from_attributes = True

# Section Management Schemas
class SectionsUpdateRequest(BaseModel):
    sections: List[DaySectionCreate]

class SectionsResponse(BaseModel):
    sections: List[DaySectionResponse]

# Media Asset Schemas
class MediaAssetBase(BaseModel):
    filename: str
    file_size: int
    mime_type: str
    media_config: Optional[MediaConfig] = None

class MediaAssetCreate(MediaAssetBase):
    file_key: str
    day_number: Optional[int] = None

class MediaAssetUpdate(BaseModel):
    media_config: Optional[MediaConfig] = None

class MediaAssetResponse(MediaAssetBase):
    id: UUID
    file_key: str
    uploaded_at: datetime
    day_number: Optional[int] = None
    url: str = ""  # Computed field for S3 URL
    
    class Config:
        from_attributes = True

class MediaUploadResponse(BaseModel):
    id: UUID
    filename: str
    file_key: str
    file_size: int
    mime_type: str
    url: str
    uploaded_at: datetime
    media_config: Optional[MediaConfig] = None

# Public API Schemas (limited information for non-admin users)
class PublicDaySectionResponse(BaseModel):
    id: UUID
    section_type: str
    content_text: Optional[str] = None
    position_order: int
    style_config: Optional[Dict[str, Any]] = None
    media_asset: Optional[MediaAssetResponse] = None
    
    class Config:
        from_attributes = True

class PublicCountdownDayResponse(BaseModel):
    day_number: int
    title: str
    content_html: Optional[str] = None  # Legacy support
    sections: List[PublicDaySectionResponse] = []
    background_audio: Optional[MediaAssetResponse] = None
    audio_config: Optional[AudioConfig] = None
    is_unlocked: bool = False
    
    class Config:
        from_attributes = True

class CountdownOverviewResponse(BaseModel):
    days: List[PublicCountdownDayResponse]
    current_day: Optional[int] = None  # Currently unlocked day
    total_days: int = 25

# Validation Response
class ValidationResponse(BaseModel):
    valid: bool
    message: str = ""

# Error Response
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None

# Forward reference resolution
DaySectionResponse.model_rebuild()
CountdownDayResponse.model_rebuild()
MediaAssetResponse.model_rebuild() 