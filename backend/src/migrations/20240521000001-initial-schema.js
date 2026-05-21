'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Users table with UUID primary key
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
      refreshToken: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for Users
    await queryInterface.addIndex('Users', ['email'], { unique: true, name: 'idx_users_email_unique' });
    await queryInterface.addIndex('Users', ['role'], { name: 'idx_users_role' });
    await queryInterface.addIndex('Users', ['isActive'], { name: 'idx_users_is_active' });

    // Create Tasks table
    await queryInterface.createTable('Tasks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      },
      status: {
        type: Sequelize.ENUM('pending', 'in-progress', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for Tasks (critical for performance)
    // Composite index for filtering user tasks by status
    await queryInterface.addIndex('Tasks', ['ownerId', 'status'], { name: 'idx_tasks_owner_status' });

    // Composite index for sorting user tasks by creation date
    await queryInterface.addIndex('Tasks', ['ownerId', 'createdAt'], { name: 'idx_tasks_owner_created' });

    // Index for priority queries
    await queryInterface.addIndex('Tasks', ['priority'], { name: 'idx_tasks_priority' });

    // Index for due date queries
    await queryInterface.addIndex('Tasks', ['dueDate'], { name: 'idx_tasks_due_date' });

    // Admin statistics queries
    await queryInterface.addIndex('Tasks', ['status', 'createdAt'], { name: 'idx_tasks_status_created' });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop Tasks table first (has foreign key to Users)
    await queryInterface.dropTable('Tasks');

    // Drop Users table
    await queryInterface.dropTable('Users');
  },
};
