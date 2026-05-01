const User = require('../models/User');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const where = {};

    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: users } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const mappedUsers = users.map(u => {
      const uObj = u.toJSON();
      uObj._id = uObj.id;
      return uObj;
    });

    res.status(200).json({
      success: true,
      data: {
        users: mappedUsers,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
      },
    });
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const uObj = user.toJSON();
    uObj._id = uObj.id;
    res.status(200).json({ success: true, data: { user: uObj } });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;

    if (req.params.id === req.user.id && role && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    logger.info(`User ${req.params.id} updated by admin ${req.user.email}`);
    
    const uObj = user.toJSON();
    uObj._id = uObj.id;
    res.status(200).json({ success: true, message: 'User updated', data: { user: uObj } });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.destroy();
    logger.info(`User ${req.params.id} deleted by admin ${req.user.email}`);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
