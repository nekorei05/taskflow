const Activity = require('../models/Activity');

const logActivity = async ({ projectId, taskId, actorId, type, message, meta = {} }) => {
  try {
    await Activity.create({
      projectId,
      taskId: taskId || null,
      actorId,
      type,
      message,
      meta,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
};

const statusLabel = (s) =>
  ({ pending: 'To Do', 'in-progress': 'In Progress', completed: 'Done' }[s] || s);

module.exports = { logActivity, statusLabel };
