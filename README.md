# Consulting Platform

A comprehensive platform for consulting businesses to manage clients, projects, case studies, and more.

## Features

- User management with role-based access control
- Organization management for clients and consulting firms
- Project management with milestones and team assignments
- Case studies for showcasing successful projects
- Blog for content marketing
- Application Tracking System (ATS) for job postings and applications
- Responsive dashboard built with Next.js and Material UI

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication with Passport.js
- Role-based access control
- RESTful API architecture

### Frontend
- Next.js with TypeScript
- Material UI components
- Responsive design
- Recharts for data visualization
- Axios for API communication

## Setup Instructions

### Prerequisites
- Node.js 18+
- Docker and Docker Compose (for MongoDB)
- npm or bun

### Setting Up the Database

1. Start MongoDB using Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. MongoDB will be available at `mongodb://admin:password@localhost:27017/consulting-platform?authSource=admin`
3. You can access Mongo Express UI at http://localhost:8081 for database management

### Setting Up the Server

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the example (already done in this repository)

4. Start the server:
   ```bash
   npm run dev
   ```

5. The server will run on http://localhost:5000

### Setting Up the Client

1. Navigate to the project root directory

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The client will run on http://localhost:3000

## API Documentation

The API is organized around REST. All requests should be made to endpoints beginning with `/api/v1/`.

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login a user
- `GET /api/v1/auth/verify-email/:token` - Verify email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password/:token` - Reset password

### User Endpoints
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/update-profile` - Update user profile
- `PATCH /api/v1/users/change-password` - Change password
- `GET /api/v1/users` - Get all users (admin only)
- `POST /api/v1/users` - Create a user (admin only)
- `GET /api/v1/users/:id` - Get a user by ID
- `PATCH /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user

### Organization Endpoints
- `GET /api/v1/organizations/me` - Get current user's organization
- `GET /api/v1/organizations` - Get all organizations (admin only)
- `POST /api/v1/organizations` - Create an organization
- `GET /api/v1/organizations/:id` - Get an organization by ID
- `PATCH /api/v1/organizations/:id` - Update an organization
- `DELETE /api/v1/organizations/:id` - Delete an organization
- `GET /api/v1/organizations/:id/members` - Get organization members
- `POST /api/v1/organizations/:id/members` - Add a member to organization
- `PATCH /api/v1/organizations/:id/members/:userId` - Update member role
- `DELETE /api/v1/organizations/:id/members/:userId` - Remove member

### Project Endpoints
- `GET /api/v1/projects/me` - Get current user's projects
- `GET /api/v1/projects/organization/:organizationId` - Get projects by organization
- `GET /api/v1/projects` - Get all projects
- `POST /api/v1/projects` - Create a project
- `GET /api/v1/projects/:id` - Get a project by ID
- `PATCH /api/v1/projects/:id` - Update a project
- `DELETE /api/v1/projects/:id` - Delete a project
- `PATCH /api/v1/projects/:id/status` - Update project status
- `GET /api/v1/projects/:id/team` - Get project team
- `POST /api/v1/projects/:id/team` - Add a member to project team
- `PATCH /api/v1/projects/:id/team/:userId` - Update team member
- `DELETE /api/v1/projects/:id/team/:userId` - Remove team member
- `POST /api/v1/projects/:id/milestones` - Add project milestone
- `PATCH /api/v1/projects/:id/milestones/:milestoneId` - Update milestone

### Case Study Endpoints
- `GET /api/v1/case-studies` - Get all case studies
- `GET /api/v1/case-studies/organization/:organizationId` - Get case studies by organization
- `GET /api/v1/case-studies/view/:idOrSlug` - Get case study by ID or slug
- `GET /api/v1/case-studies/:id/related` - Get related case studies
- `POST /api/v1/case-studies` - Create a case study
- `PATCH /api/v1/case-studies/:id` - Update a case study
- `DELETE /api/v1/case-studies/:id` - Delete a case study
- `PATCH /api/v1/case-studies/:id/testimonial` - Update testimonial
- `POST /api/v1/case-studies/:id/images` - Add an image
- `DELETE /api/v1/case-studies/:id/images/:imageId` - Remove an image
- `PATCH /api/v1/case-studies/:id/seo` - Update SEO info

## License

This project is proprietary and confidential.

Copyright (c) 2025 Consulting Platform Inc.
