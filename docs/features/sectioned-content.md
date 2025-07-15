# Sectioned Content & Media Management

## Overview
The sectioned content system replaces the single WYSIWYG editor with a flexible, structured approach to content creation. This allows for better organization, enhanced media integration, and sophisticated audio management.

## Core Features

### Content Sections

#### Section Types
- **Title Sections**: Large, prominent headings for content organization
- **Text Sections**: Rich text content with formatting options
- **Quote Sections**: Stylized blockquotes with romantic aesthetic
- **Image Sections**: High-quality image display with captions
- **Video Sections**: Full-featured video playback with controls
- **Audio Sections**: Interactive audio players with configuration
- **Divider Sections**: Visual separators with heart icons

#### Section Management
- **Drag-and-Drop Reordering**: Intuitive position management
- **Live Preview**: Real-time content preview as you edit
- **Section Controls**: Move up/down, delete, and configure each section
- **Position Tracking**: Automatic position order management

### Enhanced Media System

#### Upload Experience
- **Drag-and-Drop Upload**: Modern file upload interface
- **Progress Tracking**: Real-time upload progress with status indicators
- **Format Validation**: Automatic file type and size validation
- **Preview Generation**: Immediate preview of uploaded media

#### Media Configuration
- **Per-File Settings**: Individual configuration for each media asset
- **Playback Controls**: Autoplay, loop, volume, and control visibility
- **Interactive vs Background**: Toggle between user-controlled and ambient audio
- **Quality Settings**: Compression and format optimization

#### Media Library
- **Centralized Management**: View all uploaded media in one place
- **Usage Tracking**: See which sections use each media file
- **Storage Statistics**: File sizes and storage usage monitoring
- **Quick Access**: Easy media selection when editing sections

### Advanced Audio Features

#### Background Audio System
- **Day-Level Audio**: Set background music for entire days
- **Smart Fading**: Automatic volume reduction when videos play
- **Volume Management**: Precise control over audio levels
- **Browser Compatibility**: Handles autoplay restrictions gracefully

#### Audio Configuration
```json
{
  "autoplay": false,           // Auto-start on page load
  "loop": true,                // Loop background audio
  "volume": 0.7,               // Base volume (0-100%)
  "background_mode": true,     // Ambient vs interactive
  "fade_on_video": true,       // Fade when video plays
  "video_volume_ratio": 0.3    // Volume during video (0-100%)
}
```

#### Interactive Controls
- **Play/Pause Buttons**: User control for non-background audio
- **Volume Sliders**: Real-time volume adjustment
- **Visual Indicators**: Show audio status and playback state
- **Keyboard Shortcuts**: Space bar for play/pause (planned)

### Section Styling System

#### Styling Options
- **Text Alignment**: Left, center, right alignment for any section
- **Font Sizing**: Small, medium, large text options
- **Spacing Control**: Margin adjustments for visual hierarchy
- **Color Customization**: Text and background color options (planned)

#### Style Configuration
```json
{
  "alignment": "center",        // left, center, right
  "font_size": "large",        // small, medium, large
  "color": "#333333",          // Text color (hex)
  "background_color": "#f9f9f9", // Background color (hex)
  "margin": "large"            // small, normal, large
}
```

#### Responsive Design
- **Mobile Optimization**: Touch-friendly controls and responsive layouts
- **Flexible Sizing**: Content adapts to screen size automatically
- **High-DPI Support**: Crisp media display on retina screens

## User Experience

### For Content Creators (Admin)

#### Section Editor Interface
1. **Add Section Menu**: Quick access to all section types with icons
2. **Inline Editing**: Edit content directly in preview mode
3. **Section Controls**: Hover controls for move, delete, and configure
4. **Configuration Panel**: Expandable settings for each section
5. **Media Upload**: Direct upload from section editing interface

#### Workflow
1. Create day title using title section
2. Add content sections in desired order
3. Upload and configure media as needed
4. Set background audio and volume preferences
5. Preview content before publishing
6. Save all changes atomically

### For End Users (Recipients)

#### Content Display
- **Progressive Loading**: Fast initial load with lazy media loading
- **Smooth Playback**: Seamless audio-video interactions
- **Mobile-Friendly**: Touch controls and responsive media players
- **Accessibility**: Screen reader support and keyboard navigation

#### Audio Experience
- **Smart Defaults**: Sensible audio settings that work across browsers
- **User Control**: Optional manual controls for interactive audio
- **Visual Feedback**: Clear indicators for audio state and controls
- **Cross-Fade Logic**: Smooth transitions between audio and video

## Technical Implementation

### Database Schema

#### Sections Table
```sql
CREATE TABLE day_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_number INTEGER NOT NULL REFERENCES countdown_days(day_number),
    section_type VARCHAR(50) NOT NULL,
    content_text TEXT,
    position_order INTEGER NOT NULL,
    style_config JSONB DEFAULT '{}',
    media_asset_id UUID REFERENCES media_assets(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(day_number, position_order)
);
```

#### Enhanced Media Assets
```sql
ALTER TABLE media_assets ADD COLUMN media_config JSONB DEFAULT '{}';
ALTER TABLE countdown_days ADD COLUMN background_audio_id UUID;
ALTER TABLE countdown_days ADD COLUMN audio_config JSONB DEFAULT '{}';
```

### API Endpoints

#### Section Management
- `GET /api/admin/countdown/{day}/sections` - Get all sections for a day
- `PUT /api/admin/countdown/{day}/sections` - Update all sections atomically
- `POST /api/admin/upload` - Upload media with configuration
- `PUT /api/admin/media/{id}` - Update media configuration

#### Data Flow
1. **Section Creation**: Client sends section data to API
2. **Media Upload**: Files uploaded to S3, metadata saved to database
3. **Reference Linking**: Sections reference media via foreign keys
4. **Atomic Updates**: All sections for a day updated in single transaction

### Performance Optimizations

#### Frontend
- **Lazy Loading**: Media only loads when visible
- **Debounced Updates**: Prevent excessive API calls during editing
- **Optimistic UI**: Immediate feedback before server confirmation
- **Caching**: Smart caching of media assets and configurations

#### Backend
- **Efficient Queries**: JOINs to load sections and media in single query
- **S3 Integration**: Direct uploads to reduce server load
- **Database Indexes**: Optimized queries for section ordering and media lookup
- **JSONB Performance**: Efficient storage and querying of configuration data

### Browser Support

#### Media Features
- **HTML5 Audio/Video**: Modern playback with fallbacks
- **Autoplay Handling**: Graceful degradation for restricted autoplay
- **Format Support**: Multiple formats for maximum compatibility
- **Progressive Enhancement**: Core functionality works everywhere

#### JavaScript Features
- **ES6+ Syntax**: Modern JavaScript with transpilation for older browsers
- **Web APIs**: File API, Drag and Drop, Intersection Observer
- **Polyfills**: Ensures compatibility with older browsers
- **Service Workers**: Planned for offline support and caching

## Content Migration

### Legacy HTML Support
- **Backward Compatibility**: Existing HTML content continues to work
- **Dual Rendering**: System supports both HTML and sectioned content
- **Optional Migration**: Admin can choose when to convert content
- **No Data Loss**: Original HTML preserved during migration

### Migration Tools (Planned)
- **HTML Parser**: Automatic conversion of HTML to sections
- **Media Extraction**: Extract embedded media from HTML content
- **Style Preservation**: Maintain formatting during conversion
- **Preview Mode**: Review migrated content before publishing

## Security Considerations

### File Upload Security
- **Type Validation**: Strict MIME type checking
- **Size Limits**: Configurable upload size restrictions
- **Virus Scanning**: Integration with file scanning services (planned)
- **Content Sanitization**: Remove potentially harmful metadata

### Access Control
- **Admin-Only Uploads**: Media upload restricted to authenticated admins
- **Preview Tokens**: Secure preview access for locked content
- **Rate Limiting**: Prevent abuse of upload endpoints
- **CORS Configuration**: Proper cross-origin resource sharing

### Data Protection
- **S3 Security**: Proper bucket policies and access controls
- **Database Security**: Encrypted connections and parameterized queries
- **Configuration Validation**: Sanitize and validate all JSON configurations
- **Audit Logging**: Track all content and media changes

## Future Enhancements

### Advanced Features
- **Rich Text Editing**: Enhanced text formatting options
- **Animation Support**: Entrance animations and transitions
- **Interactive Elements**: Polls, quizzes, and interactive content
- **Template System**: Pre-designed section layouts and themes

### Performance Improvements
- **Image Optimization**: Next-gen formats and adaptive sizing
- **Video Streaming**: HLS/DASH for large video files
- **Audio Compression**: Adaptive bitrate for different connection speeds
- **Progressive Web App**: Offline support and app-like experience

### User Experience
- **Keyboard Shortcuts**: Faster editing with keyboard controls
- **Bulk Operations**: Multi-select and batch editing
- **Version History**: Track and restore previous versions
- **Collaborative Editing**: Real-time collaboration features (long-term)

## Monitoring and Analytics

### Performance Metrics
- **Upload Success Rate**: Track failed uploads and retry logic
- **Media Load Times**: Monitor lazy loading performance
- **Audio Playback Issues**: Track autoplay failures and user interactions
- **Section Rendering**: Measure time to render complex content

### Usage Analytics
- **Popular Section Types**: Track which sections are used most
- **Media Usage Patterns**: Understand media consumption preferences
- **Audio Engagement**: Measure background audio effectiveness
- **Mobile vs Desktop**: Track platform-specific behaviors

### Error Tracking
- **Upload Failures**: Log and alert on media upload issues
- **Playback Errors**: Track audio/video playback problems
- **Database Errors**: Monitor section save/load operations
- **API Performance**: Track endpoint response times and errors 