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
      name: 'Vikram Singh',
      email: 'admin@test.com',
      password: 'Admin123',
      role: 'admin',
    });

    // Create regular users
    const user1 = await User.create({ 
      name: 'Arjun Mehta', 
      email: 'arjun@test.com', 
      password: 'Arjun123', 
      role: 'user' 
    });
    
    const user2 = await User.create({ 
      name: 'Diya Sharma', 
      email: 'diya@test.com', 
      password: 'Diya123', 
      role: 'user' 
    });

    // Create tasks
    await Task.bulkCreate([
      { 
        title: 'Complete Backend API', 
        description: 'Finalize the JWT authentication and SQL integration', 
        status: 'completed', 
        priority: 'high', 
        ownerId: user1.id, 
        tags: ['backend', 'auth'] 
      },
      { 
        title: 'Review TaskFlow Design', 
        description: 'Check the new bright light theme for accessibility', 
        status: 'completed', 
        priority: 'medium', 
        ownerId: user1.id, 
        tags: ['frontend', 'design'] 
      },
      { 
        title: 'Create Postman Collection', 
        description: 'Document all v1 endpoints for the team', 
        status: 'in-progress', 
        priority: 'high', 
        ownerId: user1.id, 
        tags: ['docs'] 
      },
      { 
        title: 'Test Indian Name Integration', 
        description: 'Verify that the database stores localized names correctly', 
        status: 'pending', 
        priority: 'medium', 
        ownerId: user2.id, 
        tags: ['database'] 
      },
      { 
        title: 'Security Audit', 
        description: 'Check rate limits and Helmet configurations', 
        status: 'completed', 
        priority: 'high', 
        ownerId: user2.id, 
        tags: ['security'] 
      },
      { 
        title: 'Deploy to Cloud', 
        description: 'Set up Docker and NGINX for the production environment', 
        status: 'pending', 
        priority: 'high', 
        ownerId: admin.id, 
        tags: ['devops'] 
      }
    ]);

    console.log('Seeded successfully!');
    console.log('-----------------------------------------');
    console.log('Admin:  admin@test.com  / Admin123 (Vikram Singh)');
    console.log('User 1: arjun@test.com  / Arjun123 (Arjun Mehta)');
    console.log('User 2: diya@test.com   / Diya123 (Diya Sharma)');
    console.log('-----------------------------------------');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
