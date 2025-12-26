// main-app/routes/booking.route.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// URL của booking service
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';

// Middleware để forward request tới booking service
const forwardToBookingService = async (req, res) => {
  try {
    const method = req.method.toLowerCase();
    const path = req.originalUrl.replace('/booking', '');
    
    const config = {
      method: method,
      url: `${BOOKING_SERVICE_URL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': process.env.SERVICE_TOKEN
      }
    };
    
    if (['post', 'put', 'patch'].includes(method)) {
      config.data = req.body;
    }
    
    if (method === 'get' && Object.keys(req.query).length > 0) {
      config.params = req.query;
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Error forwarding to booking service:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        code: 'error',
        message: 'Không thể kết nối với booking service'
      });
    }
  }
};

// ===== ROUTES - Forward tất cả requests tới booking service =====

// Tạo booking
router.post('/create', forwardToBookingService);

// Cập nhật combo
router.patch('/:id/combos', forwardToBookingService);

// Xác nhận booking
router.patch('/:id/confirm', forwardToBookingService);

// Lấy thông tin booking
router.get('/:id', forwardToBookingService);

// Kiểm tra trạng thái
router.get('/:id/status', forwardToBookingService);

// Lấy danh sách ghế đã đặt
router.get('/seats/booked', forwardToBookingService);

// Hủy booking
router.delete('/:id', forwardToBookingService);

// Callback từ payment service
router.patch('/:id/payment-completed', forwardToBookingService);

// Thống kê
router.get('/statistics', forwardToBookingService);

module.exports = router;