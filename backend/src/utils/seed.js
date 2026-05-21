require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

const seed = async () => {
  try {
    await connectDB();
    console.log('✓ Connected to MongoDB');

    if (process.env.NODE_ENV === 'development') {
      console.log('Clearing existing data...');
      await Task.deleteMany({});
      await Project.deleteMany({});
      await User.deleteMany({});
      console.log('✓ Existing data cleared');
    }

    const admin = await User.create({
      name: 'Vikram Singh',
      email: 'admin@test.com',
      password: 'Admin123',
      role: 'admin',
    });

    const user1 = await User.create({
      name: 'Arjun Mehta',
      email: 'arjun@test.com',
      password: 'Arjun123',
      role: 'user',
    });

    const user2 = await User.create({
      name: 'Diya Sharma',
      email: 'diya@test.com',
      password: 'Diya123',
      role: 'user',
    });

    const productProject = await Project.create({
      name: 'TaskFlow Product',
      description: 'Core product backlog and sprint tasks',
      createdBy: admin._id,
      members: [
        { userId: admin._id, role: 'admin' },
        { userId: user1._id, role: 'admin' },
        { userId: user2._id, role: 'member' },
      ],
    });

    const opsProject = await Project.create({
      name: 'DevOps & Deployment',
      description: 'Infrastructure and release tasks',
      createdBy: user2._id,
      members: [
        { userId: user2._id, role: 'admin' },
        { userId: admin._id, role: 'member' },
      ],
    });

    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - 3);

    await Task.insertMany([
      {
        title: 'Complete Backend API',
        description: 'Finalize JWT authentication and MongoDB integration',
        status: 'completed',
        priority: 'high',
        projectId: productProject._id,
        createdBy: admin._id,
        assignedTo: user1._id,
        ownerId: user1._id,
        tags: ['backend', 'auth'],
      },
      {
        title: 'Review TaskFlow Design',
        description: 'Check the bright light theme for accessibility',
        status: 'completed',
        priority: 'medium',
        projectId: productProject._id,
        createdBy: user1._id,
        assignedTo: user1._id,
        ownerId: user1._id,
        tags: ['frontend', 'design'],
      },
      {
        title: 'Create Postman Collection',
        description: 'Document all v1 endpoints for the team',
        status: 'in-progress',
        priority: 'high',
        projectId: productProject._id,
        createdBy: admin._id,
        assignedTo: user2._id,
        ownerId: user1._id,
        tags: ['docs'],
      },
      {
        title: 'Test Indian Name Integration',
        description: 'Verify localized names in the database',
        status: 'pending',
        priority: 'medium',
        projectId: productProject._id,
        createdBy: user1._id,
        assignedTo: user2._id,
        dueDate: overdueDate,
        ownerId: user2._id,
        tags: ['database'],
      },
      {
        title: 'Security Audit',
        description: 'Check rate limits and Helmet configurations',
        status: 'completed',
        priority: 'high',
        projectId: opsProject._id,
        createdBy: user2._id,
        assignedTo: admin._id,
        ownerId: user2._id,
        tags: ['security'],
      },
      {
        title: 'Deploy to Railway',
        description: 'Deploy full-stack app with environment variables',
        status: 'pending',
        priority: 'high',
        projectId: opsProject._id,
        createdBy: user2._id,
        assignedTo: user2._id,
        dueDate: overdueDate,
        ownerId: admin._id,
        tags: ['devops'],
      },
    ]);

    // Repair legacy tasks missing projectId (so they show in the app)
    const repaired = await Task.updateMany(
      { $or: [{ projectId: null }, { projectId: { $exists: false } }] },
      {
        $set: {
          projectId: productProject._id,
          createdBy: admin._id,
        },
      }
    );
    if (repaired.modifiedCount > 0) {
      console.log(`✓ Repaired ${repaired.modifiedCount} tasks missing projectId`);
    }

    console.log('Seeded successfully!');
    console.log('-----------------------------------------');
    console.log('Admin:  admin@test.com  / Admin123 (Vikram Singh)');
    console.log('User 1: arjun@test.com  / Arjun123 (Arjun Mehta)');
    console.log('User 2: diya@test.com   / Diya123 (Diya Sharma)');
    console.log('Projects: TaskFlow Product, DevOps & Deployment');
    console.log('-----------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
