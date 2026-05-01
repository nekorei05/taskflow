const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const assignedRole = role === 'admin' ? 'user' : (role || 'user');

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, role: assignedRole });
    const { accessToken, refreshToken } = generateTokens(user.id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`New user registered: ${email}`);

    const userData = user.toJSON();
    userData._id = userData.id;

    res.status(201).json({ success: true, message: 'Account created successfully', data: { user: userData, accessToken, refreshToken } });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    const userData = user.toJSON();
    userData._id = userData.id;

    logger.info(`User logged in: ${email}`);
    res.status(200).json({ success: true, message: 'Logged in successfully', data: { user: userData, accessToken, refreshToken } });
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token is required' });

    let decoded;
    try { decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); }
    catch { return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' }); }

    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Token mismatch' });
    }

    const tokens = generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({ success: true, message: 'Tokens refreshed', data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } });
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    await User.update({ refreshToken: null }, { where: { id: req.user.id } });
    logger.info(`User logged out: ${req.user.email}`);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

const getMe = async (req, res) => {
  const userData = req.user.toJSON();
  userData._id = userData.id;
  res.status(200).json({ success: true, data: { user: userData } });
};

module.exports = { register, login, refresh, logout, getMe };
