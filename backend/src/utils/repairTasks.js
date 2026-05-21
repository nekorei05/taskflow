/**
 * One-off: attach orphan tasks to the first project. Run: node src/utils/repairTasks.js
 */
require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const Task = require('../models/Task');
const Project = require('../models/Project');

(async () => {
  await connectDB();
  const project = await Project.findOne().sort({ createdAt: 1 });
  if (!project) {
    console.log('No projects found. Run npm run seed first.');
    process.exit(1);
  }
  const result = await Task.updateMany(
    { $or: [{ projectId: null }, { projectId: { $exists: false } }] },
    { $set: { projectId: project._id } }
  );
  console.log(`Repaired ${result.modifiedCount} tasks → project "${project.name}"`);
  const total = await Task.countDocuments({ projectId: project._id });
  console.log(`Tasks now on that project: ${total}`);
  await disconnectDB();
  process.exit(0);
})();
