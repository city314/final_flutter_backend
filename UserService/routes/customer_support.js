const express = require('express');
const router = express.Router();
const CustomerSupport = require('../models/CustomerSupport');
const User = require('../models/User');

// Tạo mới phiên chat hoặc thêm tin nhắn vào phiên chat đã có
router.post('/support/sendMessage', async (req, res) => {
  const { customer_email, text, image, isUser } = req.body;

  try {
    // Tìm phiên chat hiện tại
    let chat = await CustomerSupport.findOne({ customer_email });

    if (!chat) {
      // Nếu chưa có, tạo mới phiên chat
      chat = new CustomerSupport({
        customer_email,
        messages: [],
      });
    }

    // Thêm tin nhắn mới vào phiên chat
    chat.messages.push({ text, isUser, image });
    await chat.save();

    res.status(200).json({
      message: chat.messages.length === 1
        ? 'Chat created and message added'
        : 'Message added to existing chat',
      chatId: chat._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Lấy danh sách các cuộc trò chuyện
router.get('/', async (req, res) => {
  try {
    const chats = await CustomerSupport.find();

    const chatList = await Promise.all(
      chats.map(async (chat) => {
        const user = await User.findOne({ email: chat.customer_email });
        const lastMessage = chat.messages[chat.messages.length - 1];

        return {
          customerEmail: user.email,
          avatarUrl: user.avatar,
          isActive: user.isActive,
          lastMessage: lastMessage.text,
          lastMessageTime: lastMessage.time,
        };
      })
    );

    res.status(200).json(chatList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Lấy toàn bộ tin nhắn của một cuộc trò chuyện theo email
router.get('/getMessages/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const chat = await CustomerSupport.findOne({ customer_email: email });

    if (!chat) {
      return res.status(404).json({ message: 'No conversation found for this user.' });
    }

    res.status(200).json({
      chatId: chat._id,
      messages: chat.messages
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
