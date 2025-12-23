// main-app/controllers/client/booking.controller.js
const axios = require('axios');
const path = require('path');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3001';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || '';

// Helper function
const callBookingService = async (path, method = 'GET', data = null) => {
  try {
    const config = {
      method: method,
      url: `${BOOKING_SERVICE_URL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': SERVICE_TOKEN
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Error calling booking service:', error.message);
    throw error;
  }
};

// [GET] /booking/combo
module.exports.combo = async (req, res) => {
  try {
    // ✅ SERVE HTML FILE
    res.sendFile(path.join(__dirname, '../../views/client/pages/booking-combo.html'));
  } catch (error) {
    console.error('Error in combo page:', error);
    res.redirect('/');
  }
};

// [GET] /booking/checkout
module.exports.checkout = async (req, res) => {
  try {
    // ✅ SERVE HTML FILE
    res.sendFile(path.join(__dirname, '../../views/client/pages/booking-checkout.html'));
  } catch (error) {
    console.error('Error in checkout page:', error);
    res.redirect('/');
  }
};

// [GET] /booking/success
module.exports.success = async (req, res) => {
  try {
    const { bookingId } = req.query;
    
    if (!bookingId) {
      return res.redirect('/');
    }
    
    // ✅ Lấy data từ API để JavaScript trong HTML có thể fetch
    // HTML file sẽ tự fetch data qua /api/bookings/:id
    res.sendFile(path.join(__dirname, '../../views/client/pages/booking-success.html'));
    
  } catch (error) {
    console.error('Error in success page:', error);
    res.redirect('/');
  }
};

// [POST] /booking/create - API ENDPOINT
module.exports.create = async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Gọi booking service hoặc mock API
    const result = await callBookingService('/api/bookings/create', 'POST', bookingData);
    
    res.json(result);
    
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      code: 'error',
      message: 'Không thể tạo booking'
    });
  }
};

// [GET] /booking/booked-seats - API ENDPOINT
module.exports.bookedSeats = async (req, res) => {
  try {
    const { movieId, cinema, date, time } = req.query;
    
    const result = await callBookingService(
      `/api/bookings/seats/booked?movieId=${movieId}&cinema=${encodeURIComponent(cinema)}&date=${date}&time=${encodeURIComponent(time)}`
    );
    
    res.json(result);
    
  } catch (error) {
    console.error('Error getting booked seats:', error);
    res.status(500).json({
      code: 'error',
      message: 'Không thể lấy danh sách ghế đã đặt'
    });
  }
};