# TaskFlow — Collaborative Team Task Manager

A modern full-stack collaborative task management platform inspired by tools like Trello and Asana.

Built with the MERN stack, TaskFlow enables teams to create projects, assign tasks, manage workflows through Kanban boards, and track productivity with role-based access control and dashboard analytics.

---

## Live Demo

Frontend: https://taskflow-frontend-rosy-seven.vercel.app

Backend API: https://taskflow-api-e9jc.onrender.com

---

## Features

### Authentication & Security

* JWT Authentication
* Refresh Token Rotation
* Protected Routes
* Role-Based Access Control (RBAC)
* Password Hashing with bcrypt
* Rate Limiting
* Secure Environment Variables

### Project Collaboration

* Create collaborative projects
* Project-scoped Admin & Member roles
* Add/remove project members
* Team-based task workflows

### Task Management

* Create and assign tasks
* Priority & due date management
* Status tracking:

  * To Do
  * In Progress
  * Done
* Drag-and-drop Kanban workflow
* Overdue task highlighting
* Task filtering & sorting

### Dashboard & Analytics

* Tasks by status
* Tasks per user
* Project progress tracking
* Overdue task analytics
* Activity timeline feed

### Activity Feed

Track important project actions such as:

* Task creation
* Task assignment
* Status updates
* Project activity changes

---

# Tech Stack

## Frontend

* React.js
* Vite
* React Router
* Tailwind CSS
* Recharts

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

## Authentication & Security

* JWT
* bcrypt
* express-rate-limit
* Helmet

## Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

# Architecture

The application follows a scalable MVC architecture:

```bash
backend/
 ├── controllers/
 ├── middleware/
 ├── models/
 ├── routes/
 ├── utils/
 └── services/

frontend/
 ├── components/
 ├── pages/
 ├── context/
 ├── hooks/
 └── layouts/
```

---

# Role-Based Access

## Admin

* Manage projects
* Add/remove members
* Create and assign tasks
* View project analytics

## Member

* View assigned projects
* Update assigned tasks
* Use Kanban workflow
* Track project activity

---

# API Highlights

## Authentication

* POST `/api/v1/auth/register`
* POST `/api/v1/auth/login`
* POST `/api/v1/auth/refresh`

## Projects

* GET `/api/v1/projects`
* POST `/api/v1/projects`
* PATCH `/api/v1/projects/:id`

## Tasks

* GET `/api/v1/tasks`
* POST `/api/v1/tasks`
* PATCH `/api/v1/tasks/:id`

---

# Local Setup

## Clone Repository

```bash
git clone https://github.com/nekorei05/taskflow.git
cd taskflow
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Run frontend:

```bash
npm run dev
```

---

# Deployment

## Frontend

Deployed on Vercel.

## Backend

Deployed on Render.

## Database

Hosted on MongoDB Atlas.

---

# Assignment Requirements Covered

* JWT Authentication
* Team Project Management
* Task Assignment
* Dashboard Analytics
* RBAC
* REST APIs
* Database Relationships
* Deployment
* Environment Variables
* Publicly Accessible Full-Stack App

---

# Future Improvements

* Real-time collaboration
* Notifications
* File attachments
* Comments on tasks
* Calendar integration

---

# Demo Credentials

```txt
Admin:
admin@test.com
Admin123

Member:
arjun@test.com
Arjun123
```

---

# Author

Rei Khandekar

Built as a full-stack internship assignment project focused on collaborative workflow management and scalable backend architecture.
