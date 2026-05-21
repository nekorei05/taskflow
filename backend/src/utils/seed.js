require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const seed = async () => {
  try {
    await connectDB();
    console.log('✓ Connected to MongoDB');

    if (process.env.NODE_ENV === 'development') {
      console.log('Clearing existing data...');
      await Activity.deleteMany({});
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

    const tasks = await Task.insertMany([
      {
        title: 'Complete Backend API',
        description: 'Finalize JWT auth, refresh tokens, and MongoDB project/task APIs.',
        status: 'completed',
        priority: 'high',
        projectId: productProject._id,
        createdBy: admin._id,
        assignedTo: user1._id,
        ownerId: user1._id,
        dueDate: inDays(-5),
        tags: ['backend', 'auth'],
      },
      {
        title: 'Review TaskFlow Design',
        description: 'Check light theme contrast, spacing, and mobile layout.',
        status: 'completed',
        priority: 'medium',
        projectId: productProject._id,
        createdBy: user1._id,
        assignedTo: user1._id,
        ownerId: user1._id,
        dueDate: inDays(-2),
        tags: ['frontend', 'design'],
      },
      {
        title: 'Create Postman Collection',
        description: 'Document v1 auth, projects, tasks, and dashboard endpoints.',
        status: 'in-progress',
        priority: 'high',
        projectId: productProject._id,
        createdBy: admin._id,
        assignedTo: user2._id,
        ownerId: user1._id,
        dueDate: inDays(3),
        tags: ['docs'],
      },
      {
        title: 'Test Indian Name Integration',
        description: 'Verify UTF-8 names persist and display in UI and exports.',
        status: 'pending',
        priority: 'medium',
        projectId: productProject._id,
        createdBy: user1._id,
        assignedTo: user2._id,
        dueDate: inDays(-3),
        ownerId: user2._id,
        tags: ['database', 'qa'],
      },
      {
        title: 'Build Kanban Board UI',
        description: 'Drag tasks between To Do, In Progress, and Done columns.',
        status: 'in-progress',
        priority: 'high',
        projectId: productProject._id,
        createdBy: admin._id,
        assignedTo: user1._id,
        ownerId: admin._id,
        dueDate: inDays(7),
        tags: ['frontend'],
      },
      {
        title: 'Security Audit',
        description: 'Review rate limits, Helmet, CORS, and project RBAC rules.',
        status: 'completed',
        priority: 'high',
        projectId: opsProject._id,
        createdBy: user2._id,
        assignedTo: admin._id,
        ownerId: user2._id,
        dueDate: inDays(-1),
        tags: ['security'],
      },
      {
        title: 'Deploy to Railway',
        description: 'Deploy API + React app with env vars and public MongoDB URI.',
        status: 'pending',
        priority: 'high',
        projectId: opsProject._id,
        createdBy: user2._id,
        assignedTo: user2._id,
        dueDate: inDays(-3),
        ownerId: admin._id,
        tags: ['devops'],
      },
    ]);

    await Activity.insertMany([
      {
        projectId: productProject._id,
        taskId: tasks[0]._id,
        actorId: admin._id,
        type: 'task_created',
        message: 'Vikram Singh created "Complete Backend API"',
      },
      {
        projectId: productProject._id,
        taskId: tasks[2]._id,
        actorId: admin._id,
        type: 'task_assigned',
        message: 'Vikram Singh assigned "Create Postman Collection" to Diya Sharma',
        meta: { assigneeName: 'Diya Sharma' },
      },
      {
        projectId: productProject._id,
        taskId: tasks[4]._id,
        actorId: user1._id,
        type: 'status_changed',
        message: 'Arjun Mehta moved "Build Kanban Board UI" to In Progress',
        meta: { from: 'pending', to: 'in-progress' },
      },
    ]);

    console.log('Seeded successfully! (7 tasks, 2 projects)');
    console.log('-----------------------------------------');
    console.log('Admin:  admin@test.com  / Admin123');
    console.log('User 1: arjun@test.com  / Arjun123');
    console.log('User 2: diya@test.com   / Diya123');
    console.log('TaskFlow Product: 5 tasks | DevOps: 2 tasks');
    console.log('-----------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
