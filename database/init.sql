-- Database initialization script for 25 Days Anniversary App
-- Migration 001: Initial Schema

-- Create countdown_days table
CREATE TABLE countdown_days (
    id SERIAL PRIMARY KEY,
    day_number INTEGER NOT NULL UNIQUE CHECK (day_number >= 1 AND day_number <= 25),
    title VARCHAR(255) NOT NULL,
    content_html TEXT,
    release_datetime_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media_assets table
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    file_key VARCHAR(500) NOT NULL UNIQUE,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    day_number INTEGER REFERENCES countdown_days(day_number)
);

-- Create admin_sessions table
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes
CREATE INDEX idx_countdown_days_day_number ON countdown_days(day_number);
CREATE INDEX idx_countdown_days_release_datetime ON countdown_days(release_datetime_utc);
CREATE INDEX idx_media_assets_day_number ON media_assets(day_number);
CREATE INDEX idx_media_assets_file_key ON media_assets(file_key);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Insert initial countdown days data
-- Day 25 starts July 20, 2025 at 05:00 AM GMT-4 (09:00 UTC)
-- Each subsequent day unlocks 24 hours later
INSERT INTO countdown_days (day_number, title, release_datetime_utc) VALUES
(25, 'Day 25', '2025-07-20 09:00:00+00'),
(24, 'Day 24', '2025-07-21 09:00:00+00'),
(23, 'Day 23', '2025-07-22 09:00:00+00'),
(22, 'Day 22', '2025-07-23 09:00:00+00'),
(21, 'Day 21', '2025-07-24 09:00:00+00'),
(20, 'Day 20', '2025-07-25 09:00:00+00'),
(19, 'Day 19', '2025-07-26 09:00:00+00'),
(18, 'Day 18', '2025-07-27 09:00:00+00'),
(17, 'Day 17', '2025-07-28 09:00:00+00'),
(16, 'Day 16', '2025-07-29 09:00:00+00'),
(15, 'Day 15', '2025-07-30 09:00:00+00'),
(14, 'Day 14', '2025-07-31 09:00:00+00'),
(13, 'Day 13', '2025-08-01 09:00:00+00'),
(12, 'Day 12', '2025-08-02 09:00:00+00'),
(11, 'Day 11', '2025-08-03 09:00:00+00'),
(10, 'Day 10', '2025-08-04 09:00:00+00'),
(9, 'Day 9', '2025-08-05 09:00:00+00'),
(8, 'Day 8', '2025-08-06 09:00:00+00'),
(7, 'Day 7', '2025-08-07 09:00:00+00'),
(6, 'Day 6', '2025-08-08 09:00:00+00'),
(5, 'Day 5', '2025-08-09 09:00:00+00'),
(4, 'Day 4', '2025-08-10 09:00:00+00'),
(3, 'Day 3', '2025-08-11 09:00:00+00'),
(2, 'Day 2', '2025-08-12 09:00:00+00'),
(1, 'Day 1', '2025-08-13 09:00:00+00');

-- Migration 002: Sectioned Content and Enhanced Media
-- Create sections table for structured day content
CREATE TABLE day_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_number INTEGER NOT NULL REFERENCES countdown_days(day_number) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('title', 'text', 'image', 'video', 'audio', 'quote', 'divider')),
    content_text TEXT,
    position_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Style configuration
    style_config JSONB DEFAULT '{}',
    
    -- Media reference
    media_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    
    UNIQUE(day_number, position_order)
);

-- Add enhanced media configuration to media_assets
ALTER TABLE media_assets ADD COLUMN media_config JSONB DEFAULT '{}';

-- Add indexes for sections
CREATE INDEX idx_day_sections_day_number ON day_sections(day_number);
CREATE INDEX idx_day_sections_position ON day_sections(day_number, position_order);
CREATE INDEX idx_day_sections_media_asset ON day_sections(media_asset_id);

-- Add background audio configuration to countdown_days
ALTER TABLE countdown_days ADD COLUMN background_audio_id UUID REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE countdown_days ADD COLUMN audio_config JSONB DEFAULT '{}';

-- Create index for background audio
CREATE INDEX idx_countdown_days_background_audio ON countdown_days(background_audio_id); 