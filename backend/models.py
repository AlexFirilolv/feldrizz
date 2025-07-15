from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, BigInteger, ForeignKey, CheckConstraint, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class CountdownDay(Base):
    __tablename__ = "countdown_days"
    
    id = Column(Integer, primary_key=True, index=True)
    day_number = Column(Integer, unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    content_html = Column(Text)  # Legacy HTML content (for backward compatibility)
    release_datetime_utc = Column(DateTime(timezone=True), nullable=False)
    background_audio_id = Column(UUID(as_uuid=True), ForeignKey("media_assets.id"))
    audio_config = Column(JSONB, default={})  # Configuration for background audio
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    media_assets = relationship("MediaAsset", back_populates="countdown_day", foreign_keys="MediaAsset.day_number")
    sections = relationship("DaySection", back_populates="countdown_day", cascade="all, delete-orphan", order_by="DaySection.position_order")
    background_audio = relationship("MediaAsset", foreign_keys=[background_audio_id])
    
    __table_args__ = (
        CheckConstraint('day_number >= 1 AND day_number <= 25', name='check_day_number_range'),
    )

class DaySection(Base):
    __tablename__ = "day_sections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    day_number = Column(Integer, ForeignKey("countdown_days.day_number", ondelete="CASCADE"), nullable=False)
    section_type = Column(String(50), nullable=False)  # title, text, image, video, audio, quote, divider
    content_text = Column(Text)
    position_order = Column(Integer, nullable=False)
    style_config = Column(JSONB, default={})  # Styling configuration (alignment, colors, etc.)
    media_asset_id = Column(UUID(as_uuid=True), ForeignKey("media_assets.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    countdown_day = relationship("CountdownDay", back_populates="sections")
    media_asset = relationship("MediaAsset", foreign_keys=[media_asset_id])
    
    __table_args__ = (
        CheckConstraint("section_type IN ('title', 'text', 'image', 'video', 'audio', 'quote', 'divider')", name='check_section_type'),
    )

class MediaAsset(Base):
    __tablename__ = "media_assets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    file_key = Column(String(500), unique=True, nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), nullable=False)
    media_config = Column(JSONB, default={})  # Configuration for media (autoplay, volume, loop, etc.)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    day_number = Column(Integer, ForeignKey("countdown_days.day_number"))
    
    # Relationship to countdown day
    countdown_day = relationship("CountdownDay", back_populates="media_assets", foreign_keys=[day_number])

class AdminSession(Base):
    __tablename__ = "admin_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True) 