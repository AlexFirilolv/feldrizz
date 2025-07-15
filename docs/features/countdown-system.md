# Countdown System Features

## Overview
The countdown system is the core feature of the 25 Days Anniversary App, providing a daily unlock mechanism for personalized content.

## Core Features

### Time-locked Content Release
- **Daily Unlock Schedule**: Each day unlocks at 5:00 AM GMT-4
- **Sequential Access**: Days unlock in descending order from 25 to 1
- **Countdown Logic**: Starts July 20, 2025 (Day 25) and ends August 13, 2025 (Day 1)
- **Preview Access**: Admin can preview locked content using preview tokens

### Content Management System

#### Sectioned Content Structure
- **Dynamic Sections**: Content is organized into customizable sections instead of single HTML blocks
- **Section Types**: 
  - Title: Large headings for content sections
  - Text: Regular paragraph content with formatting options
  - Quote: Styled blockquotes with romantic formatting
  - Image: Media display with captions and alt text
  - Video: Video playback with controls and configuration
  - Audio: Audio players with interactive controls
  - Divider: Visual separators with heart icons

#### Section Configuration
- **Positioning**: Drag-and-drop reordering with position index management
- **Styling Options**:
  - Text alignment (left, center, right)
  - Font size (small, medium, large)
  - Margin spacing (small, normal, large)
  - Custom colors and backgrounds (planned)
- **Media Integration**: Direct media upload and association with sections

### Enhanced Media Support

#### Media Types
- **Images**: JPG, PNG, GIF, WebP with lazy loading and responsive sizing
- **Videos**: MP4, WebM with custom controls, autoplay, and poster images
- **Audio**: MP3, WAV, OGG with interactive and background playback modes

#### Media Configuration
- **Playback Settings**: Autoplay, loop, volume control, muted start
- **Interactive vs Background**: Toggle between user-controlled and ambient audio
- **Video Integration**: Smart background audio fading when videos play
- **Quality Optimization**: Automatic compression and format optimization

### Background Audio System

#### Audio Modes
- **Interactive Mode**: User-controlled playback with visible controls
- **Background Mode**: Ambient audio that plays automatically (where permitted)
- **Smart Fading**: Automatic volume reduction when videos start playing

#### Volume Management
- **Base Volume**: Configurable background audio volume (0-100%)
- **Video Fade Volume**: Separate volume level when videos are playing
- **User Controls**: Play/pause buttons for non-background audio
- **Cross-fade Logic**: Smooth transitions between audio states

#### Browser Compatibility
- **Autoplay Policies**: Respects browser autoplay restrictions
- **Fallback Controls**: Manual play buttons when autoplay is blocked
- **Progressive Enhancement**: Graceful degradation for older browsers

### Legacy Content Support

#### Backward Compatibility
- **HTML Content**: Existing WYSIWYG content remains fully functional
- **Migration Path**: Seamless transition from HTML to sectioned content
- **Dual Rendering**: Supports both legacy HTML and new section-based content

#### Content Migration
- **Preservation**: Existing content is never lost during system updates
- **Optional Upgrade**: Admins can choose to convert HTML to sections
- **Hybrid Support**: Days can have both HTML and sectioned content

### User Experience Features

#### Visual Design
- **Romantic Aesthetic**: Warm color palette with pink, orange, and yellow tones
- **Responsive Layout**: Mobile-first design with touch-friendly controls
- **Loading States**: Elegant loading spinners and progress indicators
- **Error Handling**: Graceful error messages with recovery options

#### Navigation
- **Day Navigation**: Previous/next day buttons with smart availability
- **Countdown Grid**: Visual overview of all days with unlock status
- **Direct Access**: URL-based navigation to specific days
- **Preview Links**: Admin preview access with token validation

#### Accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility for all controls
- **Alt Text**: Image descriptions and media accessibility features
- **Color Contrast**: WCAG compliant color combinations

### Admin Management

#### Content Creation
- **Section Editor**: Intuitive drag-and-drop section management
- **Media Library**: Centralized media asset management
- **Live Preview**: Real-time preview of content changes
- **Auto-save**: Prevents data loss with change tracking

#### Audio Configuration
- **Background Audio Selection**: Choose from uploaded audio files
- **Playback Settings**: Configure autoplay, loop, and volume settings
- **Video Interaction**: Set fade behavior and volume ratios
- **Testing Tools**: Preview audio behavior before publishing

#### Media Management
- **Upload Interface**: Drag-and-drop file uploads with progress tracking
- **File Organization**: Automatic organization by day and media type
- **Format Support**: Wide range of media formats with automatic optimization
- **Storage Integration**: Seamless AWS S3 integration for scalable storage

### Technical Implementation

#### Database Structure
- **Sectioned Storage**: Normalized section data with positioning and styling
- **Media References**: Foreign key relationships for media asset association
- **Configuration Storage**: JSON-based configuration for flexible audio settings
- **Migration Support**: Database migrations for feature updates

#### Performance Optimization
- **Lazy Loading**: Progressive media loading for faster page loads
- **Caching Strategy**: Intelligent caching of media assets and content
- **Compression**: Automatic media compression and optimization
- **CDN Integration**: Fast global content delivery via AWS S3

#### Security Features
- **Access Control**: Time-based content access with server-side validation
- **Preview Tokens**: Secure admin preview access with token validation
- **File Validation**: Comprehensive file type and size validation
- **CORS Protection**: Proper cross-origin resource sharing configuration

### Future Enhancements

#### Planned Features
- **Advanced Styling**: Custom CSS and theme options for sections
- **Animation Support**: Entrance animations and transitions
- **Interactive Elements**: Polls, quizzes, and interactive content
- **Social Sharing**: Shareable content with privacy controls

#### Performance Improvements
- **Progressive Web App**: Offline support and app-like experience
- **Advanced Caching**: Service worker implementation for faster loading
- **Image Optimization**: Next-gen image formats and adaptive sizing
- **Audio Streaming**: Streaming audio for larger files

## Technical Specifications

### Supported Media Formats
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, AVI, MOV (auto-converted to web formats)
- **Audio**: MP3, WAV, OGG, AAC, FLAC

### File Size Limits
- **Images**: Up to 10MB per file
- **Videos**: Up to 100MB per file  
- **Audio**: Up to 50MB per file
- **Total Storage**: Unlimited with AWS S3 integration

### Browser Support
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Audio Support**: HTML5 audio with fallback controls
- **Video Support**: HTML5 video with multiple format support 