const { toIdString } = require('./memberId');

const isTaskAssignee = (task, userId) => {
  if (!task?.assignedTo || !userId) return false;
  return toIdString(task.assignedTo) === toIdString(userId);
};

const MEMBER_UPDATE_FIELDS = ['status', 'description'];

const canMemberUpdateTask = (task, userId, body) => {
  if (!isTaskAssignee(task, userId)) return false;
  return MEMBER_UPDATE_FIELDS.some((k) => body[k] !== undefined);
};

module.exports = { isTaskAssignee, canMemberUpdateTask, MEMBER_UPDATE_FIELDS };
