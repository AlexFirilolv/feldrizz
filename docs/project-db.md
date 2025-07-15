# Database Schema Documentation

## Overview
PostgreSQL database schema for the 25 Days Anniversary App. The database stores countdown day content, sectioned content structure, media references, and audio configurations.

## Tables

### countdown_days
Stores the content and metadata for each of the 25 countdown days.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, SERIAL | Unique identifier |
| day_number | INTEGER | NOT NULL, UNIQUE, CHECK (day_number >= 1 AND day_number <= 25) | Day number (1-25) |
| title | VARCHAR(255) | NOT NULL | Day title/heading |
| content_html | TEXT | | Legacy HTML content from WYSIWYG editor |
| background_audio_id | UUID | REFERENCES media_assets(id) | Background audio file reference |
| audio_config | JSONB | DEFAULT '{}' | Audio configuration settings |
| release_datetime_utc | TIMESTAMP WITH TIME ZONE | NOT NULL | When the day unlocks (UTC) |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update time |

#### Audio Configuration Schema (JSONB)
```json
{
  "autoplay": boolean,           // Auto-start background audio
  "loop": boolean,               // Loop background audio
  "volume": number,              // Base volume (0.0-1.0)
  "background_mode": boolean,    // True for ambient, false for interactive
  "fade_on_video": boolean,      // Fade when video plays
  "video_volume_ratio": number   // Volume during video playback (0.0-1.0)
}
```

### day_sections
Stores structured content sections for each countdown day.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| day_number | INTEGER | NOT NULL, REFERENCES countdown_days(day_number) ON DELETE CASCADE | Associated day |
| section_type | VARCHAR(50) | NOT NULL, CHECK (section_type IN ('title', 'text', 'image', 'video', 'audio', 'quote', 'divider')) | Type of content section |
| content_text | TEXT | | Text content for the section |
| position_order | INTEGER | NOT NULL | Display order (0-based) |
| style_config | JSONB | DEFAULT '{}' | Styling configuration |
| media_asset_id | UUID | REFERENCES media_assets(id) ON DELETE SET NULL | Associated media file |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update time |

#### Style Configuration Schema (JSONB)
```json
{
  "alignment": "left|center|right",     // Text alignment
  "font_size": "small|medium|large",    // Font size
  "color": "#RRGGBB",                   // Text color (hex)
  "background_color": "#RRGGBB",        // Background color (hex)
  "margin": "small|normal|large"        // Margin spacing
}
```

#### Section Types
- **title**: Large headings for sections
- **text**: Regular paragraph content
- **quote**: Styled blockquotes with special formatting
- **image**: Image display with captions
- **video**: Video playback with controls
- **audio**: Audio playback with controls
- **divider**: Visual separator elements

### media_assets
Stores metadata for uploaded media files (images, videos, audio).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| filename | VARCHAR(255) | NOT NULL | Original filename |
| file_key | VARCHAR(500) | NOT NULL, UNIQUE | S3 object key |
| file_size | BIGINT | NOT NULL | File size in bytes |
| mime_type | VARCHAR(100) | NOT NULL | MIME type of the file |
| media_config | JSONB | DEFAULT '{}' | Media-specific configuration |
| uploaded_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Upload timestamp |
| day_number | INTEGER | FOREIGN KEY REFERENCES countdown_days(day_number) | Associated day (nullable) |

#### Media Configuration Schema (JSONB)
```json
{
  // Audio-specific settings
  "autoplay": boolean,        // Auto-start playback
  "loop": boolean,           // Loop playback
  "volume": number,          // Default volume (0.0-1.0)
  "background_mode": boolean, // Background vs interactive mode
  "controls": boolean,       // Show player controls
  
  // Video-specific settings
  "muted": boolean,          // Start muted
  "poster": "url",           // Poster image URL
  
  // Image-specific settings
  "alt_text": "string",      // Accessibility text
  "caption": "string"        // Image caption
}
```

### admin_sessions
Stores admin authentication sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Session identifier |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Session creation time |
| expires_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Session expiration time |
| is_active | BOOLEAN | DEFAULT TRUE | Session status |

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_countdown_days_day_number ON countdown_days(day_number);
CREATE INDEX idx_countdown_days_release_datetime ON countdown_days(release_datetime_utc);
CREATE INDEX idx_countdown_days_background_audio ON countdown_days(background_audio_id);

CREATE INDEX idx_day_sections_day_number ON day_sections(day_number);
CREATE INDEX idx_day_sections_position ON day_sections(day_number, position_order);
CREATE INDEX idx_day_sections_media_asset ON day_sections(media_asset_id);

CREATE INDEX idx_media_assets_day_number ON media_assets(day_number);
CREATE INDEX idx_media_assets_file_key ON media_assets(file_key);

CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);
```

## Relationships

### Primary Relationships
- `countdown_days.background_audio_id` → `media_assets.id` (background audio)
- `day_sections.day_number` → `countdown_days.day_number` (section ownership)
- `day_sections.media_asset_id` → `media_assets.id` (section media)
- `media_assets.day_number` → `countdown_days.day_number` (media organization)

### Cascade Rules
- Deleting a countdown day removes all its sections (CASCADE)
- Deleting a media asset sets section references to NULL (SET NULL)
- Background audio deletion sets countdown day reference to NULL (SET NULL)

## Data Flow

### Content Creation Flow
1. Admin creates/edits a countdown day
2. Sections are created with position order
3. Media files are uploaded to S3 and registered in media_assets
4. Sections reference media via media_asset_id
5. Background audio is set via background_audio_id

### Content Retrieval Flow
1. Query countdown day with sections (JOIN)
2. Load media assets for sections (JOIN)
3. Construct section objects with media URLs
4. Apply styling configuration from style_config
5. Render in position_order sequence

## Migrations

### Migration 001: Initial Schema (Legacy)
```sql
-- Create basic countdown_days table
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
```

### Migration 002: Sectioned Content and Enhanced Media
```sql
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

-- Add background audio configuration to countdown_days
ALTER TABLE countdown_days ADD COLUMN background_audio_id UUID REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE countdown_days ADD COLUMN audio_config JSONB DEFAULT '{}';

-- Add indexes for new features
CREATE INDEX idx_day_sections_day_number ON day_sections(day_number);
CREATE INDEX idx_day_sections_position ON day_sections(day_number, position_order);
CREATE INDEX idx_day_sections_media_asset ON day_sections(media_asset_id);
CREATE INDEX idx_countdown_days_background_audio ON countdown_days(background_audio_id);
```

## Initial Data Setup

The database is pre-populated with 25 countdown day records with calculated release dates:
- Day 25: July 20, 2025 at 05:00 AM GMT-4 (09:00 UTC)
- Day 24: July 21, 2025 at 05:00 AM GMT-4 (09:00 UTC)
- ...
- Day 1: August 13, 2025 at 05:00 AM GMT-4 (09:00 UTC)

```sql
INSERT INTO countdown_days (day_number, title, release_datetime_utc) VALUES
(25, 'Day 25', '2025-07-20 09:00:00+00'),
(24, 'Day 24', '2025-07-21 09:00:00+00'),
(23, 'Day 23', '2025-07-22 09:00:00+00'),
-- ... (continues for all 25 days)
(1, 'Day 1', '2025-08-13 09:00:00+00');
```

## Query Examples

### Get Day with Sections and Media
```sql
SELECT 
    cd.*,
    ds.id as section_id,
    ds.section_type,
    ds.content_text,
    ds.position_order,
    ds.style_config,
    ma.id as media_id,
    ma.filename,
    ma.file_key,
    ma.media_config,
    bg_audio.filename as background_audio_filename
FROM countdown_days cd
LEFT JOIN day_sections ds ON cd.day_number = ds.day_number
LEFT JOIN media_assets ma ON ds.media_asset_id = ma.id
LEFT JOIN media_assets bg_audio ON cd.background_audio_id = bg_audio.id
WHERE cd.day_number = $1
ORDER BY ds.position_order;
```

### Get Media Usage Statistics
```sql
SELECT 
    ma.mime_type,
    COUNT(*) as usage_count,
    SUM(ma.file_size) as total_size
FROM media_assets ma
JOIN day_sections ds ON ma.id = ds.media_asset_id
GROUP BY ma.mime_type;
```

### Find Days with Background Audio
```sql
SELECT 
    cd.day_number,
    cd.title,
    ma.filename as background_audio,
    cd.audio_config
FROM countdown_days cd
JOIN media_assets ma ON cd.background_audio_id = ma.id
WHERE cd.background_audio_id IS NOT NULL;
```

## Backup and Maintenance

### Regular Maintenance
- **Index Maintenance**: REINDEX monthly for optimal performance
- **VACUUM**: Run VACUUM ANALYZE weekly
- **Statistics Update**: Ensure pg_stat_statements is enabled

### Backup Strategy
- **Full Backup**: Daily full database backup
- **Media Backup**: S3 versioning and cross-region replication
- **Point-in-Time Recovery**: WAL archiving for transaction-level recovery

### Performance Monitoring
- Monitor JSONB query performance on style_config and media_config
- Track media_assets table growth and S3 storage usage
- Watch for N+1 queries in section loading 