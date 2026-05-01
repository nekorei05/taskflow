const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

class Task extends Model {
  get isOverdue() {
    if (!this.dueDate) return false;
    return new Date(this.dueDate) < new Date() && this.status !== 'completed';
  }
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
      defaultValue: 'pending',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: true,
      get() {
        const value = this.getDataValue('tags');
        return value ? (typeof value === 'string' ? JSON.parse(value) : value) : [];
      },
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Task',
    indexes: [
      { fields: ['ownerId', 'status'] },
      { fields: ['ownerId', 'createdAt'] },
    ],
  }
);

// Define Associations
User.hasMany(Task, { foreignKey: 'ownerId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

module.exports = Task;
