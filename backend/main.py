from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional, List
import io
from PIL import Image

# Local imports
from config import settings
from database import get_db, engine
from models import Base, CountdownDay, MediaAsset, DaySection
from schemas import (
    AdminLoginRequest, AdminLoginResponse, 
    CountdownDayResponse, CountdownDayUpdate,
    PublicCountdownDayResponse, CountdownOverviewResponse,
    MediaUploadResponse, ValidationResponse,
    DaySectionCreate, DaySectionUpdate, DaySectionResponse,
    SectionsUpdateRequest, SectionsResponse,
    MediaAssetUpdate, AudioConfig, MediaConfig
)
from auth import (
    verify_admin_password, create_admin_session, get_current_admin,
    is_content_unlocked, get_current_time_utc
)
from s3_service import s3_service

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": get_current_time_utc()}

# Helper function to add media URLs
def add_media_urls(obj):
    """Add public URLs to media assets"""
    if hasattr(obj, 'url') and hasattr(obj, 'file_key'):
        obj.url = s3_service.get_public_url(obj.file_key)
    return obj

# Public endpoints for countdown display
@app.get("/api/countdown", response_model=CountdownOverviewResponse)
async def get_countdown_overview(db: Session = Depends(get_db)):
    """Get overview of all countdown days with unlock status."""
    days = db.query(CountdownDay).options(
        joinedload(CountdownDay.sections).joinedload(DaySection.media_asset),
        joinedload(CountdownDay.background_audio)
    ).order_by(CountdownDay.day_number.desc()).all()
    
    current_time = get_current_time_utc()
    
    # Find the currently unlocked day (highest day number that's unlocked)
    current_day = None
    
    public_days = []
    for day in days:
        is_unlocked = is_content_unlocked(day.release_datetime_utc)
        
        # Set current day to the highest unlocked day number
        if is_unlocked and (current_day is None or day.day_number > current_day):
            current_day = day.day_number
        
        # Only include content for unlocked days
        content_html = day.content_html if is_unlocked else None
        sections = []
        background_audio = None
        audio_config = None
        
        if is_unlocked:
            # Add sections with media URLs
            for section in day.sections:
                section_dict = {
                    "id": section.id,
                    "section_type": section.section_type,
                    "content_text": section.content_text,
                    "position_order": section.position_order,
                    "style_config": section.style_config,
                    "media_asset": None
                }
                
                if section.media_asset:
                    section_dict["media_asset"] = add_media_urls(section.media_asset)
                
                sections.append(section_dict)
            
            # Add background audio
            if day.background_audio:
                background_audio = add_media_urls(day.background_audio)
            audio_config = day.audio_config
        
        public_days.append({
            "day_number": day.day_number,
            "title": day.title,
            "content_html": content_html,
            "sections": sections,
            "background_audio": background_audio,
            "audio_config": audio_config,
            "is_unlocked": is_unlocked
        })
    
    return CountdownOverviewResponse(
        days=public_days,
        current_day=current_day,
        total_days=25
    )

@app.get("/api/countdown/{day_number}", response_model=PublicCountdownDayResponse)
async def get_countdown_day(
    day_number: int,
    preview_token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get specific countdown day content."""
    if day_number < 1 or day_number > 25:
        raise HTTPException(status_code=404, detail="Day not found")
    
    day = db.query(CountdownDay).options(
        joinedload(CountdownDay.sections).joinedload(DaySection.media_asset),
        joinedload(CountdownDay.background_audio)
    ).filter(CountdownDay.day_number == day_number).first()
    
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    # Check if content is unlocked
    unlocked = is_content_unlocked(day.release_datetime_utc, preview_token)
    
    if not unlocked:
        # Return limited info for locked content
        return PublicCountdownDayResponse(
            day_number=day.day_number,
            title=day.title,
            content_html=None,
            sections=[],
            background_audio=None,
            audio_config=None,
            is_unlocked=False
        )
    
    # Prepare sections with media URLs
    sections = []
    for section in day.sections:
        section_dict = {
            "id": section.id,
            "section_type": section.section_type,
            "content_text": section.content_text,
            "position_order": section.position_order,
            "style_config": section.style_config,
            "media_asset": None
        }
        
        if section.media_asset:
            section_dict["media_asset"] = add_media_urls(section.media_asset)
        
        sections.append(section_dict)
    
    # Add background audio URL
    background_audio = None
    if day.background_audio:
        background_audio = add_media_urls(day.background_audio)
    
    return PublicCountdownDayResponse(
        day_number=day.day_number,
        title=day.title,
        content_html=day.content_html,
        sections=sections,
        background_audio=background_audio,
        audio_config=day.audio_config,
        is_unlocked=True
    )

# Admin authentication endpoints
@app.post("/api/admin/login", response_model=AdminLoginResponse)
async def admin_login(login_data: AdminLoginRequest, db: Session = Depends(get_db)):
    """Admin login endpoint."""
    if not verify_admin_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin password"
        )
    
    access_token = create_admin_session(db)
    return AdminLoginResponse(access_token=access_token)

@app.post("/api/admin/validate-token", response_model=ValidationResponse)
async def validate_admin_token(current_admin: dict = Depends(get_current_admin)):
    """Validate admin token."""
    return ValidationResponse(valid=True, message="Token is valid")

# Admin countdown management endpoints
@app.get("/api/admin/countdown", response_model=List[CountdownDayResponse])
async def get_admin_countdown_overview(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all countdown days for admin with full details."""
    days = db.query(CountdownDay).options(
        joinedload(CountdownDay.sections).joinedload(DaySection.media_asset),
        joinedload(CountdownDay.media_assets),
        joinedload(CountdownDay.background_audio)
    ).order_by(CountdownDay.day_number.desc()).all()
    
    result = []
    for day in days:
        # Add computed field for unlock status
        day_dict = {
            "id": day.id,
            "day_number": day.day_number,
            "title": day.title,
            "content_html": day.content_html,
            "background_audio_id": day.background_audio_id,
            "audio_config": day.audio_config,
            "release_datetime_utc": day.release_datetime_utc,
            "created_at": day.created_at,
            "updated_at": day.updated_at,
            "is_unlocked": is_content_unlocked(day.release_datetime_utc),
            "sections": [],
            "media_assets": [],
            "background_audio": None
        }
        
        # Add sections with media URLs
        for section in day.sections:
            section_dict = {
                "id": section.id,
                "section_type": section.section_type,
                "content_text": section.content_text,
                "position_order": section.position_order,
                "style_config": section.style_config,
                "media_asset_id": section.media_asset_id,
                "day_number": section.day_number,
                "created_at": section.created_at,
                "updated_at": section.updated_at,
                "media_asset": None
            }
            
            if section.media_asset:
                section_dict["media_asset"] = add_media_urls(section.media_asset)
            
            day_dict["sections"].append(section_dict)
        
        # Add media assets URLs
        for media in day.media_assets:
            day_dict["media_assets"].append(add_media_urls(media))
        
        # Add background audio
        if day.background_audio:
            day_dict["background_audio"] = add_media_urls(day.background_audio)
        
        result.append(day_dict)
    
    return result

@app.get("/api/admin/countdown/{day_number}", response_model=CountdownDayResponse)
async def get_admin_countdown_day(
    day_number: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get specific countdown day for admin."""
    if day_number < 1 or day_number > 25:
        raise HTTPException(status_code=404, detail="Day not found")
    
    day = db.query(CountdownDay).options(
        joinedload(CountdownDay.sections).joinedload(DaySection.media_asset),
        joinedload(CountdownDay.media_assets),
        joinedload(CountdownDay.background_audio)
    ).filter(CountdownDay.day_number == day_number).first()
    
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    # Prepare response
    day_dict = {
        "id": day.id,
        "day_number": day.day_number,
        "title": day.title,
        "content_html": day.content_html,
        "background_audio_id": day.background_audio_id,
        "audio_config": day.audio_config,
        "release_datetime_utc": day.release_datetime_utc,
        "created_at": day.created_at,
        "updated_at": day.updated_at,
        "is_unlocked": is_content_unlocked(day.release_datetime_utc),
        "sections": [],
        "media_assets": [],
        "background_audio": None
    }
    
    # Add sections with media URLs
    for section in day.sections:
        section_dict = {
            "id": section.id,
            "section_type": section.section_type,
            "content_text": section.content_text,
            "position_order": section.position_order,
            "style_config": section.style_config,
            "media_asset_id": section.media_asset_id,
            "day_number": section.day_number,
            "created_at": section.created_at,
            "updated_at": section.updated_at,
            "media_asset": None
        }
        
        if section.media_asset:
            section_dict["media_asset"] = add_media_urls(section.media_asset)
        
        day_dict["sections"].append(section_dict)
    
    # Add media assets URLs
    for media in day.media_assets:
        day_dict["media_assets"].append(add_media_urls(media))
    
    # Add background audio
    if day.background_audio:
        day_dict["background_audio"] = add_media_urls(day.background_audio)
    
    return day_dict

@app.put("/api/admin/countdown/{day_number}", response_model=CountdownDayResponse)
async def update_countdown_day(
    day_number: int,
    update_data: CountdownDayUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update countdown day content."""
    if day_number < 1 or day_number > 25:
        raise HTTPException(status_code=404, detail="Day not found")
    
    day = db.query(CountdownDay).filter(CountdownDay.day_number == day_number).first()
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    # Update fields
    if update_data.title is not None:
        day.title = update_data.title
    if update_data.content_html is not None:
        day.content_html = update_data.content_html
    if update_data.background_audio_id is not None:
        day.background_audio_id = update_data.background_audio_id
    if update_data.audio_config is not None:
        day.audio_config = update_data.audio_config.dict() if update_data.audio_config else {}
    
    day.updated_at = get_current_time_utc()
    
    db.commit()
    db.refresh(day)
    
    # Return updated day
    return await get_admin_countdown_day(day_number, current_admin, db)

# Section management endpoints
@app.get("/api/admin/countdown/{day_number}/sections", response_model=SectionsResponse)
async def get_day_sections(
    day_number: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all sections for a specific day."""
    if day_number < 1 or day_number > 25:
        raise HTTPException(status_code=404, detail="Day not found")
    
    sections = db.query(DaySection).options(
        joinedload(DaySection.media_asset)
    ).filter(DaySection.day_number == day_number).order_by(DaySection.position_order).all()
    
    sections_data = []
    for section in sections:
        section_dict = {
            "id": section.id,
            "section_type": section.section_type,
            "content_text": section.content_text,
            "position_order": section.position_order,
            "style_config": section.style_config,
            "media_asset_id": section.media_asset_id,
            "day_number": section.day_number,
            "created_at": section.created_at,
            "updated_at": section.updated_at,
            "media_asset": None
        }
        
        if section.media_asset:
            section_dict["media_asset"] = add_media_urls(section.media_asset)
        
        sections_data.append(section_dict)
    
    return SectionsResponse(sections=sections_data)

@app.put("/api/admin/countdown/{day_number}/sections", response_model=SectionsResponse)
async def update_day_sections(
    day_number: int,
    sections_data: SectionsUpdateRequest,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update all sections for a specific day."""
    if day_number < 1 or day_number > 25:
        raise HTTPException(status_code=404, detail="Day not found")
    
    # Verify day exists
    day = db.query(CountdownDay).filter(CountdownDay.day_number == day_number).first()
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    # Delete existing sections
    db.query(DaySection).filter(DaySection.day_number == day_number).delete()
    
    # Create new sections
    for section_data in sections_data.sections:
        section = DaySection(
            day_number=day_number,
            section_type=section_data.section_type,
            content_text=section_data.content_text,
            position_order=section_data.position_order,
            style_config=section_data.style_config.dict() if section_data.style_config else {},
            media_asset_id=section_data.media_asset_id
        )
        db.add(section)
    
    # Update day timestamp
    day.updated_at = get_current_time_utc()
    
    db.commit()
    
    # Return updated sections
    return await get_day_sections(day_number, current_admin, db)

# Media upload endpoints
@app.post("/api/admin/upload", response_model=MediaUploadResponse)
async def upload_media(
    file: UploadFile = File(...),
    day_number: Optional[int] = Form(None),
    media_config: Optional[str] = Form("{}"),  # JSON string for media configuration
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Upload media file for a countdown day."""
    # Validate file
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    if file.content_type not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type. Allowed types: {', '.join(settings.ALLOWED_MIME_TYPES)}"
        )
    
    # Validate day_number if provided
    if day_number is not None:
        if day_number < 1 or day_number > 25:
            raise HTTPException(status_code=400, detail="Invalid day number")
        
        # Check if day exists
        day = db.query(CountdownDay).filter(CountdownDay.day_number == day_number).first()
        if not day:
            raise HTTPException(status_code=404, detail="Day not found")
    
    try:
        # Parse media config
        import json
        parsed_config = {}
        if media_config and media_config != "{}":
            parsed_config = json.loads(media_config)
        
        # Upload to S3
        file_content = io.BytesIO(await file.read())
        file_key, public_url = s3_service.upload_file(
            file_content, 
            file.filename, 
            file.content_type,
            day_number
        )
        
        # Save to database
        media_asset = MediaAsset(
            filename=file.filename,
            file_key=file_key,
            file_size=file.size,
            mime_type=file.content_type,
            media_config=parsed_config,
            day_number=day_number
        )
        
        db.add(media_asset)
        db.commit()
        db.refresh(media_asset)
        
        return MediaUploadResponse(
            id=media_asset.id,
            filename=media_asset.filename,
            file_key=media_asset.file_key,
            file_size=media_asset.file_size,
            mime_type=media_asset.mime_type,
            url=public_url,
            uploaded_at=media_asset.uploaded_at,
            media_config=media_asset.media_config
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.put("/api/admin/media/{media_id}", response_model=MediaUploadResponse)
async def update_media_config(
    media_id: str,
    config_data: MediaAssetUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update media asset configuration."""
    media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    if config_data.media_config is not None:
        media.media_config = config_data.media_config.dict()
    
    db.commit()
    db.refresh(media)
    
    return MediaUploadResponse(
        id=media.id,
        filename=media.filename,
        file_key=media.file_key,
        file_size=media.file_size,
        mime_type=media.mime_type,
        url=s3_service.get_public_url(media.file_key),
        uploaded_at=media.uploaded_at,
        media_config=media.media_config
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 