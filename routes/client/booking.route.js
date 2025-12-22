// main-app/routes/client/booking.route.js
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/booking.controller');

// Trang chi tiết phim & chọn suất chiếu
router.get('/detail/:movieId', controller.detail);

// Trang chọn combo
router.get('/combo', controller.combo);

// Trang checkout
router.get('/checkout', controller.checkout);

// Trang thành công
router.get('/success', controller.success);

// API tạo booking
router.post('/create', controller.create);

// API lấy ghế đã đặt
router.get('/booked-seats', controller.bookedSeats);

module.exports = router;