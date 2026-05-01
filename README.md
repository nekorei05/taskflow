# TaskFlow API

A production‑ready REST API with JWT authentication, role‑based access control, and a modern light‑themed frontend.

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: SQLite + Sequelize
- Auth: JWT (Access + Refresh Tokens)
- Validation: express-validator
- Security: Helmet, CORS, Rate Limiting
- Frontend: Vanilla JS + CSS (original) **and** React (new conversion)

## Quick Start

1. **Install Backend**
   ```bash
   cd backend
   npm install
   ```

2. **Seed Database** (adds Indian names)
   ```bash
   node src/utils/seed.js
   ```

3. **Run Backend** (port 5002)
   ```bash
   npm run dev
   ```

4. **Run Frontend – Vanilla JS**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Run Frontend – React**
   ```bash
   cd frontend-react
   npm install
   npm run dev
   ```

## Documentation

### Postman Collection
A full Postman collection is provided for testing.
Path: `docs/TaskFlow.postman_collection.json`

## Scalability Note
- **Database Migration:** Move from SQLite to PostgreSQL/MySQL.
- **Caching:** Add Redis for session and frequent data caching.
- **Load Balancing:** Use NGINX reverse proxy.
- **Microservices:** Split Auth, Task, User services when needed.
- **Containerisation:** Docker + Docker‑Compose for easy deployment.

---

Built for Primetrade.ai backend intern assignment.
