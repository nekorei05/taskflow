# TaskFlow API

A production-ready REST API with JWT authentication, role-based access control, and a modern light-themed frontend.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite + Sequelize
- **Auth:** JWT (Access + Refresh Tokens)
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate Limiting
- **Frontend:** Vanilla JS + CSS

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
cd backend
node src/utils/seed.js
```
**Test Accounts:**
- admin@test.com / Admin123 (Admin)
- alice@test.com / Alice123 (User)
- bob@test.com / Bob12345 (User)

### 3. Start the Application
**Start Backend (Port 5002):**
```bash
cd backend
npm run dev
```
**Start Frontend (Port 62321):**
```bash
cd frontend
npm run dev
```

## Documentation
### Postman Collection
A full Postman collection is provided for testing.
**Path:** `docs/TaskFlow.postman_collection.json`

**To use it:**
1. Open Postman.
2. Click **Import**.
3. Select the `docs/TaskFlow.postman_collection.json` file.

## API Reference
### Auth Endpoints — `/api/v1/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT pair |
| GET | `/me` | Private | Get current user |

### Task Endpoints — `/api/v1/tasks`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | List tasks (paginated, filtered) |
| POST | `/` | Private | Create task |
| PATCH | `/:id` | Private | Update task |
| DELETE | `/:id` | Private | Delete task |

## Security Features
- **Password Hashing:** Bcrypt for secure storage.
- **Dual-Token System:** Access Tokens + Refresh Tokens.
- **Rate Limiting:** Protects against brute-force.
- **Role-Based Access:** `user` vs `admin` levels.

## Scalability Notes
1. **Database:** Easy migration to PostgreSQL/MySQL via Sequelize.
2. **Caching:** Ready for Redis integration for sessions.
3. **Architecture:** Modular structure allows splitting into microservices.

---
Built for Primetrade.ai hiring assignment.
