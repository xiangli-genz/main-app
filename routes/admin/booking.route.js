// services/main-app/routes/admin/booking.route.js
const express = require('express');
const router = express.Router();
const path = require('path');

// Trang danh sách
router.get('/list', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/admin/pages/booking-list.html'));
});

// Trang chỉnh sửa
router.get('/edit', (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/admin/pages/booking-edit.html'));
});

module.exports = router;