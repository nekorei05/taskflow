# TaskFlow API

A production-ready REST API with JWT authentication, role-based access control, and a modern light-themed frontend.

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: SQLite + Sequelize
- Auth: JWT (Access + Refresh Tokens)
- Validation: express-validator
- Security: Helmet, CORS, Rate Limiting
- Frontend: Vanilla JS + CSS

## Quick Start

1. Install Dependencies
In the backend folder: npm install
In the frontend folder: npm install

2. Seed Database
This will create the database and test accounts.
cd backend
node src/utils/seed.js

Test Accounts:
- admin@test.com / Admin123 (Admin)
- arjun@test.com / Arjun123 (User)
- diya@test.com / Diya123 (User)

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

To use it:
1. Open Postman.
2. Click Import.
3. Select the docs/TaskFlow.postman_collection.json file.

## Scalability Note

For production, this system can be scaled by:
1. Database: Moving to PostgreSQL or MySQL.
2. Caching: Adding Redis for user sessions.
3. Infrastructure: Using NGINX as a load balancer and Docker for containerization.
4. Services: Splitting into microservices if needed.

## Security Best Practices
- Password Hashing: Bcrypt with salt rounds of 12.
- RBAC: Enforced at route level.
- Rate Limiting: Protected auth endpoints.
- Input Validation: Strict validation using express-validator.
