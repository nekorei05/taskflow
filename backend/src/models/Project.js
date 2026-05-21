const mongoose = require('mongoose');
const { toIdString } = require('../utils/memberId');

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: {
      type: [memberSchema],
      default: [],
    },
  },
  { timestamps: true }
);

projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ createdBy: 1, createdAt: -1 });

projectSchema.methods.getMemberRole = function (userId) {
  const uid = toIdString(userId);
  const member = this.members.find((m) => toIdString(m.userId) === uid);
  return member ? member.role : null;
};

projectSchema.methods.isMember = function (userId) {
  return !!this.getMemberRole(userId);
};

projectSchema.methods.isAdmin = function (userId) {
  return this.getMemberRole(userId) === 'admin';
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
