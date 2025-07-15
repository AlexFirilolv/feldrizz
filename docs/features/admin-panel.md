# Admin Panel & Content Management

## Overview
The admin panel provides a comprehensive content management system for creating and editing the countdown day content using a powerful WYSIWYG editor.

## Key Features

### 1. Authentication System
- **Password Protection**: Single admin password (`vibeCoding2025!`)
- **JWT Sessions**: Secure token-based authentication with 24-hour expiration
- **Session Management**: Automatic logout on token expiration
- **Protected Routes**: All admin routes require authentication

### 2. Admin Dashboard
- **Overview Grid**: Visual grid showing all 25 days with status indicators
- **Quick Actions**: Edit and Preview buttons for each day
- **Status Indicators**: 
  - Green: Day is unlocked
  - Gray: Day is locked
  - Content status: "Content added" or "No content yet"

### 3. WYSIWYG Content Editor
- **Rich Text Editing**: Full-featured editor powered by React Quill
- **Media Integration**: Direct upload and embedding of images, videos, and audio
- **Formatting Options**: Headers, fonts, colors, alignment, lists, quotes
- **Real-time Preview**: Live preview of content as you type

## Technical Implementation

### Authentication Flow
```typescript
// Login process
1. User enters password
2. Backend validates against ADMIN_PASSWORD
3. JWT token generated and stored
4. Token included in all subsequent requests
5. Backend validates token on protected routes
```

### Editor Components
- `AdminLogin` - Password authentication
- `AdminDashboard` - Day overview and management
- `AdminDayEditor` - Rich content editor with media upload

### API Endpoints
```
POST /api/admin/login          # Authentication
POST /api/admin/validate-token # Token validation
GET  /api/admin/countdown      # Admin day overview
GET  /api/admin/countdown/{id} # Admin day details
PUT  /api/admin/countdown/{id} # Update day content
POST /api/admin/upload         # Media file upload
```

## WYSIWYG Editor Features

### Text Formatting
- **Headers**: H1-H6 with custom styling
- **Text Styles**: Bold, italic, underline, strikethrough
- **Colors**: Text and background color selection
- **Fonts**: Multiple font family options
- **Alignment**: Left, center, right, justify

### Rich Content
- **Lists**: Ordered and unordered lists with nesting
- **Quotes**: Blockquotes with romantic styling
- **Code**: Inline code and code blocks
- **Links**: URL linking with preview

### Media Management
- **Image Upload**: Drag-and-drop or click to upload
- **Video Embedding**: Direct video file upload and embedding
- **Audio Files**: Audio upload for special messages
- **File Organization**: Files organized by day in S3 storage
- **Automatic Resize**: Images optimized for web display

### Editor Configuration
```javascript
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ]
};
```

## Security Features

### Access Control
- **Route Protection**: React Router guards prevent unauthorized access
- **Token Validation**: Backend validates JWT on every request
- **Session Timeout**: Automatic logout after 24 hours
- **Preview Tokens**: Separate token system for content preview

### File Upload Security
- **File Type Validation**: Only allowed MIME types accepted
- **File Size Limits**: Maximum 50MB per file
- **Virus Scanning**: (Can be added with AWS S3 integrations)
- **Access Control**: S3 bucket permissions configured

## User Experience

### Admin Workflow
1. **Login**: Simple password entry with show/hide toggle
2. **Dashboard**: Quick overview of all days with visual status
3. **Edit Day**: Click edit to open full editor
4. **Content Creation**: Use WYSIWYG editor to create rich content
5. **Media Upload**: Drag-and-drop or use upload buttons
6. **Preview**: Real-time preview and separate preview page
7. **Save**: Automatic change detection with save reminders

### Editor UX Features
- **Auto-save Indication**: Visual indicator for unsaved changes
- **Upload Progress**: Loading indicators during file upload
- **Error Handling**: Clear error messages for failed operations
- **Responsive Design**: Works on all screen sizes
- **Keyboard Shortcuts**: Standard editor shortcuts (Ctrl+B, etc.)

## Content Storage

### Database Schema
```sql
-- Content stored as HTML in database
content_html TEXT
title VARCHAR(255) NOT NULL
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### Media Storage (AWS S3)
```
s3://bucket-name/
├── days/
│   ├── day-01/
│   │   ├── uuid-image.jpg
│   │   └── uuid-video.mp4
│   ├── day-02/
│   └── ...
└── general/
    └── uuid-file.ext
```

## Preview System

### Admin Preview Mode
- **URL Pattern**: `/day/{number}?preview_token=vibeCoding2025!`
- **Bypass Timing**: Preview token allows viewing locked content
- **Visual Indicator**: "Preview Mode" badge displayed
- **New Tab Opening**: Preview opens in new tab for easy comparison

### Real-time Preview
- **Side-by-side**: Editor and preview can be viewed together
- **Live Updates**: Content updates as you type
- **Responsive Preview**: Shows how content looks on different devices

## Error Handling

### Common Scenarios
- **Invalid Login**: Clear error message with password hint
- **Session Expired**: Automatic redirect to login with explanation
- **Upload Failures**: Detailed error messages for file issues
- **Network Issues**: Retry mechanisms with user feedback
- **Validation Errors**: Real-time validation with helpful hints

## Performance Optimizations

### Editor Performance
- **Lazy Loading**: Editor components loaded on demand
- **Debounced Updates**: Change detection optimized to prevent excessive API calls
- **Image Optimization**: Automatic compression during upload
- **Caching**: Media URLs cached for faster loading

### Upload Optimization
- **Progress Indication**: Real-time upload progress
- **Error Recovery**: Automatic retry for failed uploads
- **Background Processing**: Non-blocking upload experience

## Customization Options

### Editor Customization
```javascript
// Add custom fonts
fonts: ['Arial', 'Comic Sans MS', 'Courier New', 'Dancing Script']

// Custom color palette
colors: ['#FEF9E7', '#FEB47B', '#F8BBD9', '#FF6B6B']

// Custom toolbar configuration
toolbar: [...custom configuration]
```

### Styling Customization
- Quill editor styles in `index.css`
- Custom romantic theme integration
- Responsive breakpoints for mobile editing

## Future Enhancements

### Planned Features
- **Collaborative Editing**: Multiple admin users
- **Version History**: Content version control
- **Scheduled Publishing**: Schedule content updates
- **Template System**: Pre-designed day templates
- **Bulk Operations**: Edit multiple days at once

### Technical Improvements
- **Auto-save**: Automatic content saving
- **Offline Editing**: PWA capabilities for offline work
- **Advanced Media**: Video thumbnails, audio waveforms
- **Analytics**: Track editing activity and popular content 