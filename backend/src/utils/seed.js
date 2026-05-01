require('dotenv').config();
const { sequelize } = require('../config/db');
const User = require('../models/User');
const Task = require('../models/Task');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to SQLite');

    // Sync models and drop existing tables
    await sequelize.sync({ force: true });
    console.log('Database synced & existing data cleared');

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin123',
      role: 'admin',
    });

    // Create regular users
    const user1 = await User.create({ name: 'Alice Johnson', email: 'alice@test.com', password: 'Alice123', role: 'user' });
    const user2 = await User.create({ name: 'Bob Smith', email: 'bob@test.com', password: 'Bob12345', role: 'user' });

    // Create tasks
    await Task.bulkCreate([
      { title: 'Set up authentication system', description: 'Implement JWT auth with refresh tokens', status: 'completed', priority: 'high', ownerId: user1.id, tags: ['backend', 'auth'] },
      { title: 'Design database schema', description: 'Create SQL schemas for users and tasks', status: 'completed', priority: 'high', ownerId: user1.id, tags: ['database'] },
      { title: 'Build REST API endpoints', description: 'CRUD operations for tasks with role-based access', status: 'in-progress', priority: 'high', ownerId: user1.id, tags: ['backend', 'api'] },
      { title: 'Write API documentation', description: 'Comprehensive Postman collection for all endpoints', status: 'pending', priority: 'medium', ownerId: user1.id, tags: ['docs'] },
      { title: 'Create frontend UI', description: 'React frontend that connects to the API', status: 'in-progress', priority: 'medium', ownerId: user2.id, tags: ['frontend'] },
      { title: 'Add input validation', description: 'Sanitize and validate all request inputs', status: 'completed', priority: 'high', ownerId: user2.id, tags: ['security'] },
      { title: 'Implement rate limiting', description: 'Protect auth endpoints from brute force', status: 'completed', priority: 'medium', ownerId: admin.id, tags: ['security'] },
      { title: 'Set up logging', description: 'Winston logger for errors and HTTP requests', status: 'completed', priority: 'low', ownerId: admin.id, tags: ['devops'] },
      { title: 'Deploy to production', description: 'Docker containerization and cloud deploy', status: 'pending', priority: 'high', dueDate: new Date('2026-06-01'), ownerId: user2.id, tags: ['devops'] },
      { title: 'Add Redis caching', description: 'Cache frequently accessed data', status: 'pending', priority: 'low', ownerId: admin.id, tags: ['performance'] },
    ]);

    console.log('Seeded successfully!');
    console.log('─────────────────────────────────────────');
    console.log('Admin:  admin@test.com  / Admin123');
    console.log('User 1: alice@test.com  / Alice123');
    console.log('User 2: bob@test.com    / Bob12345');
    console.log('─────────────────────────────────────────');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
