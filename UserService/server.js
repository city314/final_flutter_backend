const express = require('express');
const connectDB = require('./dtb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');

const userRoutes = require('./routes/user');
const supportRoutes = require('./routes/customer_support');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});
app.set('io', io);
// Khi có kết nối socket
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('send_message', async (data) => {
    const { customer_email, text, image, isUser, senderEmail } = data;

    const CustomerSupport = require('./models/CustomerSupport');
    let chat = await CustomerSupport.findOne({ customer_email });
    if (!chat) chat = new CustomerSupport({ customer_email, messages: [] });

    const newMsg = { text, image, isUser, senderEmail };
    chat.messages.push(newMsg);
    await chat.save();

    io.emit('receive_message', { ...newMsg, time: new Date(), customer_email });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Kết nối MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/customer-support', supportRoutes);

// Khởi chạy server
server.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Cổng ${PORT} đã được sử dụng. Vui lòng chọn cổng khác.`);
  } else {
    throw err;
  }
});

