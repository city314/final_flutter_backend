const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');

const connectOrderingDB = async () => {
    try {
        const uri = process.env.MONGO_URI; // Lấy URI từ .env
        if (!uri) {
            throw new Error("Chưa cấu hình MONGO_URI trong file .env");
        }

        await mongoose.connect(uri);
        console.log("✅ Kết nối UserService MongoDB thành công!");
    } catch (error) {
        console.error("❌ Lỗi kết nối MongoDB:", error.message);
        process.exit(1);
    }
};

module.exports = connectOrderingDB;
