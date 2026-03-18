# Klyron Consulting - BIM Coordination Landing Page PRD

## Original Problem Statement
Build a landing page for BIM Coordination (Clash Detection) business, showcasing portfolio and services, introduction about the civil engineer, and meeting scheduling functionality with date/time selection.

## Business Information
- **Company Name**: Klyron Consulting
- **Owner**: Mario Quissico Junior (Civil Engineer & BIM Specialist)
- **Services**: BIM Coordination, Clash Detection, 4D Scheduling, Constructability Review

## User Personas
1. **Construction Project Managers** - Looking for clash detection services to prevent costly on-site conflicts
2. **Architects & Engineers** - Need BIM coordination for multi-discipline model integration
3. **General Contractors** - Seeking expert review of building models before construction

## Core Requirements (Static)
- [x] Professional landing page with dark theme (slate/blue accents)
- [x] Hero section with value proposition
- [x] About section with engineer profile
- [x] Services grid showcasing capabilities
- [x] Portfolio section with project showcase
- [x] Meeting scheduler with calendar date/time selection
- [x] Contact form for inquiries
- [x] Responsive design for mobile/desktop
- [x] Backend API for meeting scheduling and contact forms

## What's Been Implemented (December 2025)
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI with MongoDB
- **Components**: Navbar, Hero, About, Services, Portfolio, MeetingScheduler, Contact, Footer
- **API Endpoints**:
  - `GET /api/health` - Health check
  - `POST /api/contact` - Contact form submission
  - `GET /api/contact` - Get contact messages
  - `POST /api/meetings` - Schedule meeting
  - `GET /api/meetings` - Get meeting requests
  - `GET /api/available-slots?date=YYYY-MM-DD` - Get available time slots
  - `PATCH /api/meetings/{id}/status` - Update meeting status

## Prioritized Backlog

### P0 (Critical) - Completed ✅
- Landing page with all sections
- Meeting scheduler with date/time picker
- Contact form
- Backend API integration

### P1 (High Priority) - Future
- Google Calendar integration (requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
- Email notifications for meeting requests
- Admin dashboard for managing meetings/contacts

### P2 (Medium Priority) - Future
- Portfolio image uploads
- Blog/Case studies section
- SEO optimization
- Analytics integration

### P3 (Nice to Have)
- Multi-language support
- Client testimonials section
- Live chat widget

## Next Tasks
1. Set up Google Calendar OAuth credentials for real-time calendar sync
2. Add email notification service (SendGrid/Resend)
3. Create admin panel for managing inquiries
4. Add more portfolio projects with actual images
