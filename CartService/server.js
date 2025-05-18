// server.js
const express = require('express');
const connectDB = require('./dtb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const tableRoutes = require('./routes/table');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart'); // thêm dòng này

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Kết nối MongoDB
connectDB();

// Routes
app.use('/api/table', tableRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);    // mount route của CartService

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`🚀 OrderingService chạy trên cổng ${PORT}`);
});
