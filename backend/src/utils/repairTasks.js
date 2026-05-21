
require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

(async () => {
  await connectDB();

  let product = await Project.findOne({ name: 'TaskFlow Product' });
  const admin = await User.findOne({ email: 'admin@test.com' });
  const arjun = await User.findOne({ email: 'arjun@test.com' });
  const diya = await User.findOne({ email: 'diya@test.com' });

  if (!admin || !arjun || !diya) {
    console.log('Run npm run seed first (need demo users).');
    process.exit(1);
  }

  if (!product) {
    product = await Project.create({
      name: 'TaskFlow Product',
      description: 'Core product backlog and sprint tasks',
      createdBy: admin._id,
      members: [
        { userId: admin._id, role: 'admin' },
        { userId: arjun._id, role: 'admin' },
        { userId: diya._id, role: 'member' },
      ],
    });
  }

  let ops = await Project.findOne({ name: 'DevOps & Deployment' });
  if (!ops) {
    ops = await Project.create({
      name: 'DevOps & Deployment',
      description: 'Infrastructure and release tasks',
      createdBy: diya._id,
      members: [
        { userId: diya._id, role: 'admin' },
        { userId: admin._id, role: 'member' },
      ],
    });
  }

  const demoTasks = [
    {
      title: 'Complete Backend API',
      description: 'Finalize JWT auth, refresh tokens, and MongoDB project/task APIs.',
      status: 'completed',
      priority: 'high',
      projectId: product._id,
      createdBy: admin._id,
      assignedTo: arjun._id,
      dueDate: inDays(-5),
      tags: ['backend', 'auth'],
    },
    {
      title: 'Review TaskFlow Design',
      description: 'Check light theme contrast, spacing, and mobile layout.',
      status: 'completed',
      priority: 'medium',
      projectId: product._id,
      createdBy: arjun._id,
      assignedTo: arjun._id,
      dueDate: inDays(-2),
      tags: ['frontend', 'design'],
    },
    {
      title: 'Create Postman Collection',
      description: 'Document v1 auth, projects, tasks, and dashboard endpoints.',
      status: 'in-progress',
      priority: 'high',
      projectId: product._id,
      createdBy: admin._id,
      assignedTo: diya._id,
      dueDate: inDays(3),
      tags: ['docs'],
    },
    {
      title: 'Test Indian Name Integration',
      description: 'Verify UTF-8 names persist and display in UI and exports.',
      status: 'pending',
      priority: 'medium',
      projectId: product._id,
      createdBy: arjun._id,
      assignedTo: diya._id,
      dueDate: inDays(-3),
      tags: ['database', 'qa'],
    },
    {
      title: 'Build Kanban Board UI',
      description: 'Drag tasks between To Do, In Progress, and Done columns.',
      status: 'in-progress',
      priority: 'high',
      projectId: product._id,
      createdBy: admin._id,
      assignedTo: arjun._id,
      dueDate: inDays(7),
      tags: ['frontend'],
    },
    {
      title: 'Security Audit',
      description: 'Review rate limits, Helmet, CORS, and project RBAC rules.',
      status: 'completed',
      priority: 'high',
      projectId: ops._id,
      createdBy: diya._id,
      assignedTo: admin._id,
      dueDate: inDays(-1),
      tags: ['security'],
    },
    {
      title: 'Deploy to Railway',
      description: 'Deploy API + React app with env vars and public MongoDB URI.',
      status: 'pending',
      priority: 'high',
      projectId: ops._id,
      createdBy: diya._id,
      assignedTo: diya._id,
      dueDate: inDays(-3),
      tags: ['devops'],
    },
  ];

  await Task.deleteMany({});
  await Task.insertMany(demoTasks.map((t) => ({ ...t, ownerId: t.createdBy })));

  const counts = await Task.aggregate([
    { $group: { _id: '$projectId', n: { $sum: 1 } } },
  ]);
  console.log('✓ Reset to 7 demo tasks');
  for (const c of counts) {
    const p = await Project.findById(c._id);
    console.log(`  - ${p?.name}: ${c.n} tasks`);
  }

  await disconnectDB();
  process.exit(0);
})();
