# 25 Days Anniversary App 💕

A beautiful, romantic web application that serves as a 25-day countdown calendar to celebrate your 6-month anniversary. Each day unlocks a new, custom-designed page with memories, photos, videos, and heartfelt content.

![Anniversary App](https://img.shields.io/badge/Love-Level%20∞-ff69b4)
![Tech Stack](https://img.shields.io/badge/Tech-FastAPI%20%2B%20React%20%2B%20PostgreSQL-blue)
![Status](https://img.shields.io/badge/Status-Ready%20for%20Love-green)

## ✨ Features

### For Your Loved One
- **🎯 25-Day Countdown**: Cards numbered 25 down to 1, unlocking daily from July 20 to August 13, 2025
- **🔐 Time-Based Unlocking**: Each day automatically unlocks at 5:00 AM GMT-4
- **📱 Responsive Design**: Beautiful on all devices with a romantic color palette
- **💖 Rich Content**: Each day can contain text, images, videos, and audio
- **🎨 Beautiful UI**: Romantic design with light yellow, warm orange, and soft pink colors

### For You (Admin)
- **🛡️ Secure Admin Panel**: Password-protected content management
- **✍️ WYSIWYG Editor**: Rich text editor for creating beautiful content
- **📸 Media Upload**: Easy drag-and-drop upload for images, videos, and audio
- **👀 Preview Mode**: Preview locked content before it goes live
- **📊 Dashboard**: Overview of all days with edit/preview capabilities

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- AWS S3 bucket (for media storage)
- Basic knowledge of environment variables

### 1. Clone and Setup
```bash
git clone <your-repo>
cd 25Days-Python

# Copy environment file and configure
cp .env.example .env
# Edit .env with your AWS credentials and other settings
```

### 2. Configure AWS S3
1. Create an S3 bucket for media storage
2. Get your AWS access key and secret key
3. Update the `.env` file with your AWS credentials

### 3. Start the Application
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application
- **Public Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Documentation**: http://localhost:8000/docs

### 5. Admin Setup
1. Go to http://localhost:3000/admin
2. Login with password: `vibeCoding2025!`
3. Start creating content for each day!

## 🏗️ Architecture

```
25Days-Python/
├── backend/          # FastAPI application
│   ├── main.py       # Main application
│   ├── models.py     # Database models
│   ├── schemas.py    # Pydantic schemas
│   ├── auth.py       # Authentication
│   └── s3_service.py # AWS S3 integration
├── frontend/         # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
├── database/         # Database initialization
├── docs/            # Project documentation
└── docker-compose.yml
```

## 🔧 Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **File Storage**: AWS S3
- **Authentication**: JWT tokens
- **Containerization**: Docker & Docker Compose

## 📅 Timeline

The countdown is configured for:
- **Start Date**: July 20, 2025 (Day 25 unlocks)
- **End Date**: August 13, 2025 (Day 1 unlocks)
- **Unlock Time**: 5:00 AM GMT-4 daily

## 🎨 Design Philosophy

The app features a romantic aesthetic with:
- **Colors**: Light yellow (#FEF9E7), warm orange (#FEB47B), soft pink (#F8BBD9)
- **Typography**: Dancing Script for romantic text, Playfair Display for headers
- **Animations**: Gentle bounces, fades, and heart-shaped loading indicators
- **Responsive**: Works beautifully on mobile, tablet, and desktop

## 🔐 Security Features

- Admin password authentication
- JWT token-based sessions
- Time-based content access enforcement
- Preview token for admin content review
- Secure file upload with validation

## 🛠️ Development

### Running in Development Mode
```bash
# Backend only
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend only
cd frontend
npm install
npm start

# Database only
docker-compose up postgres
```

### Environment Variables
See `.env.example` for all configuration options.

## 📝 Content Creation Guide

1. **Login to Admin**: Navigate to `/admin` and login
2. **Access Dashboard**: View all 25 days with their status
3. **Edit a Day**: Click "Edit" on any day card
4. **Add Content**: Use the rich text editor to add:
   - Formatted text with colors and styles
   - Images, videos, and audio files
   - Lists, quotes, and headers
5. **Preview**: Use the preview button to see how it looks
6. **Save**: Your changes are saved and will be visible when the day unlocks

## 🎯 Key URLs

- `/` - Main countdown grid
- `/day/{number}` - Individual day view
- `/day/{number}?preview_token=vibeCoding2025!` - Admin preview
- `/admin` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/edit/{number}` - Edit specific day

## 💝 Customization

### Changing Dates
Edit the database initialization in `database/init.sql` to modify unlock dates.

### Changing Colors
Update the Tailwind config in `frontend/tailwind.config.js`.

### Changing Password
Update `ADMIN_PASSWORD` in your `.env` file.

## 🐛 Troubleshooting

### Common Issues

1. **Can't login to admin**
   - Check that `ADMIN_PASSWORD` is set correctly in `.env`

2. **Images not uploading**
   - Verify AWS S3 credentials in `.env`
   - Check S3 bucket permissions

3. **Days not unlocking**
   - Verify system time is correct
   - Check that unlock dates are in the future

4. **Database errors**
   - Run `docker-compose down -v` to reset database
   - Then `docker-compose up --build`

## 📞 Support

This app was built with love for celebrating your special relationship! If you need help customizing it for your own anniversary, the code is well-documented and modular.

## 💕 Made With Love

Created to celebrate 6 months together and counting down to many more beautiful memories. Every line of code was written with love and care to make your anniversary extra special.

---

*"Love is not about counting days, but making the days count."* ❤️ 