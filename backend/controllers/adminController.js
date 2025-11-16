const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');

const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const messageCount = await ChatMessage.countDocuments();
    res.status(200).json({ userCount, messageCount });
  } catch (error) {
    res.status(500).json({ message: '❌ Error fetching stats' });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: '❌ Error fetching users' });
  }
};

const listMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find().populate('user', 'name email');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: '❌ Error fetching messages' });
  }
};

module.exports = {
  getStats,
  listUsers,
  listMessages
};
