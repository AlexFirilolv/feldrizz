# 25 Days Anniversary App

## Project Overview
A personalized web application serving as a 25-day countdown calendar to celebrate a 6-month anniversary. The app counts down from 25 to 1, with each day unlocking a new custom-designed page with memories, starting from July 20th, 2025 until August 13th, 2025.

## Technology Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Infrastructure**: Docker Compose
- **Storage**: AWS S3 for media assets

## Architecture Overview
- Single-page React application with countdown grid interface
- FastAPI REST API backend with time-based content unlocking
- PostgreSQL database storing day content and metadata
- Admin panel with WYSIWYG editor for content management
- Secure authentication system with preview capabilities

## Key Features
1. **Countdown Grid**: 25 cards numbered 25 down to 1
2. **Time-locked Content**: Cards unlock daily at 5:00 AM GMT-4
3. **Rich Content Pages**: Each day displays custom HTML content
4. **Admin Panel**: WYSIWYG editor for content creation
5. **Preview Mode**: Admin can preview locked content
6. **Responsive Design**: Romantic aesthetic with warm color palette

## Security Features
- Admin authentication with password protection
- Time-based content access enforcement
- Preview token validation for admin access
- Secure media upload handling

## Color Palette
- Light Yellow: #FEF9E7
- Warm Orange: #FEB47B
- Soft Pink: #F8BBD9
- Supporting neutrals and gradients

## Project Structure
```
25Days-Python/
├── backend/          # FastAPI application
├── frontend/         # React application
├── database/         # SQL schemas and migrations
├── docker/           # Docker configurations
├── docs/             # Project documentation
└── docker-compose.yml
```

## Development Workflow
1. Backend development with FastAPI
2. Database schema design and migration
3. Frontend React components and routing
4. Admin panel and WYSIWYG integration
5. Styling with Tailwind CSS
6. Docker containerization
7. AWS S3 integration for media uploads 