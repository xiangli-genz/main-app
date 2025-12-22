// main-app/controllers/client/booking.controller.js
const axios = require('axios');
const Movie = require('../../models/movie.model');

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

// [GET] /booking/detail/:movieId
module.exports.detail = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const movieDetail = await Movie.findOne({ _id: movieId, deleted: false });
    
    if (!movieDetail) {
      return res.redirect('/');
    }
    
    // Group showtimes
    const showtimesGrouped = {};
    (movieDetail.showtimes || []).forEach(st => {
      if (!showtimesGrouped[st.cinema]) {
        showtimesGrouped[st.cinema] = {};
      }
      
      const dateKey = st.date;
      if (!showtimesGrouped[st.cinema][dateKey]) {
        const dateObj = new Date(st.date);
        showtimesGrouped[st.cinema][dateKey] = {
          dateFormat: dateObj.toLocaleDateString('vi-VN'),
          dayOfWeek: dateObj.toLocaleDateString('vi-VN', { weekday: 'long' }),
          times: st.times || [],
          format: st.format
        };
      }
    });
    
    // Danh sách rạp
    const cinemaList = Object.keys(showtimesGrouped).map(name => ({ name }));
    
    res.render('client/pages/movie-detail', {
      pageTitle: movieDetail.name,
      movieDetail: movieDetail,
      showtimesGrouped: showtimesGrouped,
      cinemaList: cinemaList,
      user: req.user || null
    });
    
  } catch (error) {
    console.error('Error in detail page:', error);
    res.redirect('/');
  }
};

// [GET] /booking/combo
module.exports.combo = async (req, res) => {
  try {
    const { movieId } = req.query;
    
    if (!movieId) {
      return res.redirect('/');
    }
    
    const movieDetail = await Movie.findOne({ _id: movieId, deleted: false });
    
    if (!movieDetail) {
      return res.redirect('/');
    }
    
    const combos = [
      { id: 'popcorn', name: 'Bắp Rang Bơ', price: 45000, description: '1 bắp rang bơ (L)' },
      { id: 'coke', name: 'Nước Ngọt', price: 35000, description: '1 ly nước ngọt (L)' },
      { id: 'hotdog', name: 'Hotdog', price: 30000, description: '1 hotdog' },
      { id: 'water', name: 'Nước Suối', price: 15000, description: '1 chai nước suối' },
      { id: 'comboset', name: 'Combo Set', price: 95000, description: '1 bắp (L) + 2 nước ngọt (L)' }
    ];
    
    res.render('client/pages/booking-combo', {
      pageTitle: 'Chọn Combo - ' + movieDetail.name,
      movieDetail: movieDetail,
      combos: combos,
      user: req.user || null
    });
    
  } catch (error) {
    console.error('Error in combo page:', error);
    res.redirect('/');
  }
};

// [GET] /booking/checkout
module.exports.checkout = async (req, res) => {
  try {
    const { movieId } = req.query;
    
    if (!movieId) {
      return res.redirect('/');
    }
    
    const movieDetail = await Movie.findOne({ _id: movieId, deleted: false });
    
    if (!movieDetail) {
      return res.redirect('/');
    }
    
    res.render('client/pages/booking-checkout', {
      pageTitle: 'Xác nhận đặt vé',
      movieDetail: movieDetail,
      user: req.user || null
    });
    
  } catch (error) {
    console.error('Error in checkout page:', error);
    res.redirect('/');
  }
};

// [POST] /booking/create
module.exports.create = async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Gọi booking service
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

// [GET] /booking/success
module.exports.success = async (req, res) => {
  try {
    const { bookingId } = req.query;
    
    if (!bookingId) {
      return res.redirect('/');
    }
    
    const bookingResult = await callBookingService(`/api/bookings/${bookingId}`);
    
    if (bookingResult.code !== 'success') {
      return res.redirect('/');
    }
    
    const bookingDetail = bookingResult.data.booking;
    
    // Format dates
    bookingDetail.showtimeDateFormat = new Date(bookingDetail.showtime.date).toLocaleDateString('vi-VN');
    bookingDetail.createdAtFormat = new Date(bookingDetail.createdAt).toLocaleString('vi-VN');
    
    // Payment method mapping
    const paymentMethods = {
      'money': 'Tiền mặt',
      'zalopay': 'ZaloPay',
      'momo': 'Momo',
      'bank': 'Chuyển khoản'
    };
    bookingDetail.paymentMethodName = paymentMethods[bookingDetail.paymentMethod] || bookingDetail.paymentMethod;
    
    // Payment status mapping
    const paymentStatus = {
      'unpaid': 'Chưa thanh toán',
      'paid': 'Đã thanh toán'
    };
    bookingDetail.paymentStatusName = paymentStatus[bookingDetail.paymentStatus] || bookingDetail.paymentStatus;
    
    // Booking status mapping
    const bookingStatus = {
      'pending': 'Đang giữ chỗ',
      'initial': 'Chờ thanh toán',
      'confirmed': 'Đã xác nhận',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'expired': 'Hết hạn'
    };
    bookingDetail.statusName = bookingStatus[bookingDetail.status] || bookingDetail.status;
    
    res.render('client/pages/booking-success', {
      pageTitle: 'Đặt Vé Thành Công',
      bookingDetail: bookingDetail,
      user: req.user || null
    });
    
  } catch (error) {
    console.error('Error in success page:', error);
    res.redirect('/');
  }
};

// [GET] /booking/booked-seats (API)
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