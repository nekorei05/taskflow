<<<<<<< HEAD

#  TaskFlow API
=======
# TaskFlow API
>>>>>>> 7ee1e32 (updated readme and postman doc)

A production-ready REST API with JWT authentication, role-based access control, and a modern light-themed frontend.

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: SQLite + Sequelize
- Auth: JWT (Access + Refresh Tokens)
- Validation: express-validator
- Security: Helmet, CORS, Rate Limiting
- Frontend: Vanilla JS + CSS

<<<<<<< HEAD
## Project Structure
=======
## Quick Start
>>>>>>> 7ee1e32 (updated readme and postman doc)

1. Install Dependencies
In the backend folder: npm install
In the frontend folder: npm install

<<<<<<< HEAD
## Quick Start

### 1. Install Dependencies
```bash
# In backend/
npm install

# In frontend/
npm install
```

### 2. Seed Database
This will create the SQLite file and populate test accounts.
```bash
=======
2. Seed Database
This will create the database and test accounts.
>>>>>>> 7ee1e32 (updated readme and postman doc)
cd backend
node src/utils/seed.js

Test Accounts:
- admin@test.com / Admin123 (Admin)
- alice@test.com / Alice123 (User)
- bob@test.com / Bob12345 (User)

3. Start the Application
Start Backend (Port 5002):
cd backend
npm run dev

Start Frontend (Port 62321):
cd frontend
npm run dev

## Documentation

### Postman Collection
A full Postman collection is provided for testing.
Path: docs/TaskFlow.postman_collection.json

<<<<<<< HEAD
## Scalability & Production Note
=======
To use it:
1. Open Postman.
2. Click Import.
3. Select the docs/TaskFlow.postman_collection.json file.
>>>>>>> 7ee1e32 (updated readme and postman doc)

## Scalability Note

<<<<<<< HEAD
1.  **Database Migration:** Move from SQLite to a managed **PostgreSQL** or **MySQL** instance (e.g., AWS RDS). Sequelize makes this transition seamless by only changing the connection string.
2.  **Caching:** Implement **Redis** to cache frequently accessed data (like user profiles or task counts) and to store the JWT blacklist for immediate token revocation.
3.  **Microservices:** The Auth, Task, and User services can be separated into independent microservices communicating via **gRPC** or a message broker like **RabbitMQ** to handle high load independently.
4.  **Load Balancing:** Use **NGINX** as a reverse proxy and load balancer to distribute traffic across multiple Node.js instances running in a **Docker Swarm** or **Kubernetes** cluster.
5.  **Background Processing:** Use **BullMQ** or **Agenda** for heavy tasks like generating PDF reports or sending email notifications, keeping the main API thread responsive.

##  Security Best Practices Implemented
- **Password Hashing:** Argon2/Bcrypt for secure storage.
- **Role-Based Access (RBAC):** Granular control over endpoints.
- **Dual-Token System:** Short-lived Access Tokens + long-lived Refresh Tokens.
- **Rate Limiting:** Protects against brute-force attacks.
- **Helmet.js:** Sets secure HTTP headers.
- **CORS:** Restricted origins for frontend security.

##  API Reference

### Auth Endpoints — `/api/v1/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT pair |
| POST | `/refresh` | Public | Refresh access token |
| POST | `/logout` | Private | Invalidate refresh token |
| GET | `/me` | Private | Get current user |

### Task Endpoints — `/api/v1/tasks`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | List tasks (paginated, filtered) |
| POST | `/` | Private | Create task |
| GET | `/:id` | Private | Get single task |
| PATCH | `/:id` | Private | Update task |
| DELETE | `/:id` | Private | Delete task |
| GET | `/stats` | Admin | Task statistics |

### User Endpoints — `/api/v1/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin | List all users |
| GET | `/:id` | Admin | Get user by ID |
| PATCH | `/:id` | Admin | Update user role/status |
| DELETE | `/:id` | Admin | Delete user |

##  Authentication

All protected routes require:
```
Authorization: Bearer <accessToken>
```

Access tokens expire in **7 days**. Refresh tokens in **30 days**. The frontend auto-refreshes tokens transparently.

## 🛡 Security Features

- **Password hashing** — bcrypt with salt rounds of 12
- **JWT dual-token** — short-lived access + long-lived refresh tokens
- **Rate limiting** — 100 req/15min globally, 20 req/15min on auth routes
- **Input sanitization** — `express-mongo-sanitize` prevents NoSQL injection
- **Helmet** — Sets 11 security HTTP headers
- **CORS** — Configured per-origin
- **Role-based access** — `user` vs `admin` enforced at route level
- **Input validation** — express-validator on all mutation endpoints

## 📊 Database Schema

### User
```js
{ name, email (unique), password (hashed), role: ['user','admin'],
  refreshToken, isActive, lastLogin, timestamps }
```

### Task
```js
{ title, description, status: ['pending','in-progress','completed'],
  priority: ['low','medium','high'], dueDate, tags[], owner (→ User), timestamps }
// Compound indexes: (owner, status), (owner, createdAt)
// Virtual: isOverdue
```

##  Scalability Notes

1. **API Versioning** — All routes are prefixed `/api/v1/`. Adding v2 requires no breaking changes.
2. **Modular Architecture** — Controllers, routes, validators, and models are fully separated. New modules (e.g., `notes`, `products`) follow the same pattern.
3. **Database Indexing** — Compound indexes on `(owner, status)` and `(owner, createdAt)` ensure fast queries even with millions of records.
4. **Stateless Auth** — JWT-based auth means horizontal scaling (multiple instances) works out of the box — no sticky sessions needed.
5. **Graceful Shutdown** — Server drains in-flight requests before exiting, safe for rolling deployments.
6. **Optional Enhancements** (next steps):
   - **Redis caching** — Cache user profiles and frequently read task lists
   - **Docker** — `Dockerfile` + `docker-compose.yml` for containerization
   - **Message queue** — Bull/BullMQ for background jobs (emails, reports)
   - **Microservices** — Auth service, Task service, and Notification service can be split when traffic grows

## Testing with Postman

Import the collection from `docs/TaskFlow.postman_collection.json` or use the Swagger UI at `/api/docs`.

---

Built with efforts for Primetrade.ai hiring assignment.
=======
For production, this system can be scaled by:
1. Database: Moving to PostgreSQL or MySQL.
2. Caching: Adding Redis for user sessions.
3. Infrastructure: Using NGINX as a load balancer and Docker for containerization.
4. Services: Splitting into microservices if needed.
>>>>>>> 7ee1e32 (updated readme and postman doc)
