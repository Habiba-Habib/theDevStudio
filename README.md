# TheDevStudio

TheDevStudio is a full-stack web development learning platform built as a university project. It brings together courses, coding challenges, role-based dashboards, authentication, and AI-assisted features in one place, giving learners a practical environment to study, practice, and grow as developers.

## Overview

The platform is designed for three main user roles:

- Students can browse courses, enroll in learning paths, solve coding challenges, track progress, and interact with an AI-powered chatbot.
- Instructors can create and manage course content and become part of the teaching experience.
- Admins can manage users, oversee content, and generate challenge drafts with AI support.

The project combines a modern learning experience with a full backend system for authentication, sessions, storage, and user management.

## Key Features

- User authentication with email/password and social login via Google and GitHub
- Role-based access for students, instructors, and admins
- Public landing and informational pages
- Course browsing and course detail pages
- Student dashboard with enrolled courses, progress tracking, and challenge activity
- Challenge platform with coding practice and submission flow
- AI-powered chatbot integration
- AI-assisted challenge generation for admins
- File upload support for instructor verification and media assets
- Session-based authentication and MongoDB persistence
- Responsive frontend with custom CSS and JavaScript

## Tech Stack

### Frontend
- HTML, CSS, JavaScript
- EJS templates for server-rendered pages
- Static assets located in the public folder

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Passport.js for authentication
- Express Session for session management
- EJS for templating

### Integrations
- Cloudinary for file and image uploads
- Groq API for AI-based features
- Google OAuth and GitHub OAuth
- Nodemailer for email-based flows

## Project Structure

```text
theDevStudioo/
├── public/               # Static frontend assets (CSS, JS, images, pages)
├── server/               # Backend application
│   ├── app.js            # Main Express server entry point
│   ├── config/           # Database, passport, cloudinary config
│   ├── controllers/      # Request handlers and business logic
│   ├── middleware/       # Auth, upload, localization middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # Route definitions
│   ├── services/         # External service integrations
│   ├── views/            # EJS templates
│   └── package.json      # Backend dependencies and scripts
├── package.json          # Root scripts and dependency wrapper
└── README.md             # Project documentation