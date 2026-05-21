# TaskFlow — Collaborative Team Task Manager

> Full-stack internship assignment - a real-world team task management platform built with the MERN stack.

### Live Demo


| Application | URL |
| :--- | :--- |
| TaskFlow Frontend | https://taskflow-frontend-rosy-seven.vercel.app |


**Demo credentials**

| Role | Email | Password |
|---|---|---|
| Admin | admin@test.com | Admin123 |
| Member | arjun@test.com | Arjun123 |

---

## Covers

| Requirement | Status |
|---|---|
| JWT Authentication | ✅ |
| Team Project Management | ✅ |
| Task Assignment & CRUD | ✅ |
| Dashboard Analytics | ✅ |
| Role-Based Access Control | ✅ |
| RESTful APIs | ✅ |
| Database Relationships | ✅ |
| Deployment (Frontend + Backend) | ✅ |
| Environment Variables | ✅ |
| Publicly Accessible App | ✅ |

---

## Features

### Authentication & Security
- JWT access tokens + refresh token rotation
- Password hashing with bcrypt
- Rate limiting & Helmet headers
- Protected routes with RBAC

### Project Collaboration
- Create projects (creator becomes admin automatically)
- Add / remove project members
- Project-scoped Admin & Member roles
- Team-based task workflows

### Task Management
- Create, assign, edit, and delete tasks
- Priority levels: Low / Medium / High
- Status tracking: To Do → In Progress → Done
- Due dates with overdue highlighting
- Drag-and-drop Kanban board
- Filter & sort tasks

### Dashboard & Analytics
- Tasks by status (donut chart)
- Tasks per user breakdown
- Overdue task count
- Project progress tracking
- Activity timeline feed

---

## Tech Stack

### Frontend
- React.js + Vite
- React Router
- Recharts (analytics)
- CSS custom properties (theming)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcrypt
- express-rate-limit + Helmet

### Deployment
- **Frontend** → Vercel
- **Backend** → Render
- **Database** → MongoDB Atlas

---

##  Architecture

```
taskflow/
├── backend/
│   ├── controllers/      # Route handlers
│   ├── middleware/        # Auth, rate limiting, error handling
│   ├── models/            # Mongoose schemas (User, Project, Task)
│   ├── routes/            # API route definitions
│   ├── utils/             # Helpers & token utilities
│   └── services/          # Business logic
│
└── frontend/
    ├── components/        # Reusable UI components
    ├── pages/             # Route-level pages
    ├── context/           # Auth & Project context
    ├── hooks/             # Custom React hooks
    └── layouts/           # App shell & sidebar
```

---

## Role-Based Access

| Action | Admin | Member |
|---|---|---|
| Create project | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Create & assign tasks | ✅ | ❌ |
| Update assigned tasks | ✅ | ✅ |
| View Kanban board | ✅ | ✅ |
| View dashboard analytics | ✅ | ✅ |

---

## API Reference

### Auth
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
```

### Projects
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
POST   /api/v1/projects/:id/members
DELETE /api/v1/projects/:id/members/:userId
```

### Tasks
```
GET    /api/v1/tasks
POST   /api/v1/tasks
GET    /api/v1/tasks/:id
PATCH  /api/v1/tasks/:id
DELETE /api/v1/tasks/:id
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone
```bash
git clone https://github.com/nekorei05/taskflow.git
cd taskflow
```

### 2. Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

```bash
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Deployment

| Layer | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys from `main` branch |
| Backend | Render | Web service, free tier |
| Database | MongoDB Atlas | Free M0 cluster |

---
