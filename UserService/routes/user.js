const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

router.post('/register', async (req, res) => {
  const { email, name, password, address } = req.body;

  if (!email || !name || !password || !address) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email đã tồn tại' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo ID cho địa chỉ mới theo định dạng AD001
  const formattedId = 'AD001';

  const defaultAddress = {
    id: formattedId,
    receiver_name: name,
    phone: address.phone,
    address: address.address,
    default: true
  };

  const newUser = new User({
    email,
    name,
    password: hashedPassword,
    role: 'customer',
    address: [defaultAddress]
  });

  await newUser.save();
  return res.status(201).json({ message: 'Đăng ký thành công' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' });

  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json({ message: 'Email không tồn tại' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(401).json({ message: 'Mật khẩu không đúng' });

  user.isActive = true; // cập nhật trạng thái isActive
  await user.save();
//   const token = jwt.sign(
//     { userId: user._id, role: user.role },
//     'your_secret_key_here',
//     { expiresIn: '7d' }
//   );

  res.json({
    message: 'Đăng nhập thành công',
    // token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Gửi mã OTP về email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    // Tạo mã OTP ngẫu nhiên 6 chữ số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

//    // Lưu OTP và thời gian tạo (tuỳ cách bạn muốn lưu - tạm thời response cho đơn giản)
//    user.otpCode = otpCode;
//    user.otpExpires = Date.now() + 5 * 60 * 1000; // hết hạn sau 5 phút
//    await user.save();

    // Gửi email qua Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nhomcnpm1@gmail.com',
        pass: 'abfk znlx ggfn ycpk',
      },
    });

    const mailOptions = {
      from: 'Flutter@gmail.com',
      to: email,
      subject: 'OTP Reset Password',
      text: `Mã OTP đặt lại mật khẩu của bạn là: ${otpCode}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'OTP đã được gửi đến email của bạn', otp: otpCode});
  } catch (error) {
  console.error('Gửi mail lỗi:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu mới' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { email },
      { $set: { password: hashed } }
    );

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.get('/profile/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/:email/addresses', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    res.json(user.address || []);
  } catch (error) {
    console.error('Lỗi lấy địa chỉ:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.get('/:email/addresses', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.address);
});

router.post('/:email/addresses', async (req, res) => {
  const { email } = req.params;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // B1: Tìm số lớn nhất trong các id dạng "ADxxx"
const existingIds = user.address
  .map(a => a.id) // ✅ đúng: lấy field id của mỗi address
  .filter(id => /^AD\d{3}$/.test(id))
  .map(id => parseInt(id.slice(2)));

  const nextNumber = (existingIds.length > 0 ? Math.max(...existingIds) : 0) + 1;
  const formattedId = `AD${nextNumber.toString().padStart(3, '0')}`;

  // B2: Gán ID mới
  const newAddress = {
    ...req.body,
    id: formattedId,
  };

  // B3: Reset default nếu cần
  if (newAddress.default) {
    user.address.forEach(a => a.default = false);
  }

  // B4: Thêm vào danh sách
  user.address.push(newAddress);
  await user.save();

  res.json({ message: 'Address added', addressList: user.address });
});

router.put('/:email/addresses/:id', async (req, res) => {
  const { email, id } = req.params;
  const updated = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const index = user.address.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ message: 'Address not found' });

  if (updated.default) user.address.forEach(a => a.default = false);
  user.address[index] = updated;
  await user.save();

  res.json({ message: 'Address updated', addressList: user.address });
});

router.delete('/:email/addresses/:id', async (req, res) => {
  const { email, id } = req.params;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const index = user.address.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ message: 'Address not found' });

  const wasDefault = user.address[index].default;
  user.address.splice(index, 1);

  if (wasDefault && user.address.length > 0) {
    user.address[0].default = true;
  }

  await user.save();
  res.json({ message: 'Address deleted', addressList: user.address });
});

router.put('/:email/addresses/:id/set-default', async (req, res) => {
  const { email, id } = req.params;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const index = user.address.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ message: 'Address not found' });

  // Reset all to false
  user.address.forEach(addr => addr.default = false);

  // Set selected address to true
  user.address[index].default = true;

  await user.save();
  res.json({ message: 'Default address updated', addressList: user.address });
});

// Cập nhật tên và email người dùng
router.put('/update-profile/:email', async (req, res) => {
  const { email } = req.params;
  const { name, newEmail } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Kiểm tra nếu email mới khác email cũ và đã tồn tại
    if (newEmail && newEmail !== email) {
      const existed = await User.findOne({ email: newEmail });
      if (existed) {
        return res.status(409).json({ message: 'Email đã được sử dụng' });
      }
    }

    user.name = name;
    if (newEmail) user.email = newEmail;

    await user.save();
    res.json({ message: 'Cập nhật thông tin thành công', user });
  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const role = req.query.role || 'customer'; // mặc định là customer nếu không có query
    const users = await User.find({ role });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi tải danh sách người dùng' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        birthday: req.body.birthday,
        phone: req.body.phone,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: 'Không thể cập nhật người dùng' });
  }
});

router.patch('/status/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

    user.status = req.body.status; // 'active' hoặc 'inactive'
    await user.save();

    res.json({ message: 'Cập nhật trạng thái thành công', status: user.status });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
    res.status(400).json({ error: 'Không thể cập nhật trạng thái', detail: err.message });
  }
});

router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('name email avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/loyalty-point', async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ loyalty_point: user.loyalty_point });
});

router.get('/check-email/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  res.json({ exists: !!user });
});

router.patch('/loyalty/:email', async (req, res) => {
  const { change } = req.body;
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ message: 'User không tồn tại' });

  user.loyalty_point += change;
  if (user.loyalty_point < 0) user.loyalty_point = 0;
  await user.save();
  res.json({ message: 'Cập nhật điểm thành công', newPoint: user.loyalty_point });
});

// PUT /api/users/avatar
router.put('/profile/avatar', async (req, res) => {
  const { email, avatar } = req.body;

  console.log('📥 Body:', req.body);
  console.log('📧 Email:', email);
  console.log('🖼 Avatar length:', avatar?.length);

  if (!email || typeof avatar !== 'string' || avatar.trim().length < 100) {
    return res.status(400).json({ message: 'Thiếu hoặc dữ liệu ảnh không hợp lệ' });
  }

  try {
    const result = await User.findOneAndUpdate(
      { email },
      { avatar },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    return res.status(200).json({ message: 'Cập nhật ảnh thành công', avatar: result.avatar });
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật avatar:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
