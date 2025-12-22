// main-app/controllers/client/booking.controller.js
const axios = require('axios');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3000';

// Helper function để gọi booking service
const callBookingService = async (path, method = 'GET', data = null) => {
  try {
    const config = {
      method: method,
      url: `${BOOKING_SERVICE_URL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': process.env.SERVICE_TOKEN
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
    const { movieId } = req.query;
    
    if (!movieId) {
      return res.redirect('/');
    }
    
    // Lấy thông tin phim từ database của main-app
    const Movie = require('../../models/movie.model');
    const movieDetail = await Movie.findOne({ 
      _id: movieId, 
      deleted: false 
    });
    
    if (!movieDetail) {
      return res.redirect('/');
    }
    
    // Danh sách combo
    const combos = [
      { id: 'popcorn', name: 'Bắp Rang Bơ', price: 45000, description: '1 bắp rang bơ (L)' },
      { id: 'coke', name: 'Nước Ngọt', price: 35000, description: '1 ly nước ngọt (L)' },
      { id: 'hotdog', name: 'Hotdog', price: 30000, description: '1 hotdog' },
      { id: 'water', name: 'Nước Suối', price: 15000, description: '1 chai nước suối' },
      { id: 'comboset', name: 'Combo Set', price: 95000, description: '1 bắp (L) + 2 nước ngọt (L)' }
    ];
    
    // Prepare a demo bookingData for testing (one default seat)
    const defaultShowtime = (movieDetail.showtimes && movieDetail.showtimes[0]) || { cinema: 'Cinema A', date: new Date().toISOString().split('T')[0], time: '19:00' };
    const demoBookingData = {
      movieId: movieDetail._id,
      movieName: movieDetail.name,
      movieAvatar: movieDetail.avatar,
      cinema: defaultShowtime.cinema,
      showtimeDate: defaultShowtime.date,
      showtimeTime: defaultShowtime.time,
      // seats intentionally empty — user must select seats first
      seats: [],
      ticketPrice: 0
    };

    res.render('client/pages/booking-combo', {
      pageTitle: 'Chọn Combo - ' + movieDetail.name,
      movieDetail: {
        id: movieDetail._id,
        name: movieDetail.name,
        avatar: movieDetail.avatar,
        ageRating: movieDetail.ageRating,
        language: movieDetail.language
      },
      combos: combos,
      demoBookingData: demoBookingData,
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
    
    // Lấy thông tin phim
    const Movie = require('../../models/movie.model');
    const movieDetail = await Movie.findOne({ 
      _id: movieId, 
      deleted: false 
    });
    
    if (!movieDetail) {
      return res.redirect('/');
    }
    
    const defaultShowtime2 = (movieDetail.showtimes && movieDetail.showtimes[0]) || { cinema: 'Cinema A', date: new Date().toISOString().split('T')[0], time: '19:00' };
    const demoBookingData2 = {
      movieId: movieDetail._id,
      movieName: movieDetail.name,
      movieAvatar: movieDetail.avatar,
      cinema: defaultShowtime2.cinema,
      showtimeDate: defaultShowtime2.date,
      showtimeTime: defaultShowtime2.time,
      // seats intentionally empty — user must select seats first
      seats: [],
      ticketPrice: 0
    };

    res.render('client/pages/booking-checkout', {
      pageTitle: 'Xác Nhận Đặt Vé - ' + movieDetail.name,
      movieDetail: {
        id: movieDetail._id,
        name: movieDetail.name,
        avatar: movieDetail.avatar,
        ageRating: movieDetail.ageRating,
        language: movieDetail.language
      },
      demoBookingData: demoBookingData2,
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
    
    // Gọi booking service để tạo booking
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
    
    // Lấy thông tin booking từ booking service
    const bookingResult = await callBookingService(`/api/bookings/${bookingId}`);
    
    if (bookingResult.code !== 'success') {
      return res.redirect('/');
    }
    
    const bookingDetail = bookingResult.data.booking;
    
    // Format dữ liệu
    bookingDetail.showtimeDateFormat = new Date(bookingDetail.showtime.date).toLocaleDateString('vi-VN');
    bookingDetail.createdAtFormat = new Date(bookingDetail.createdAt).toLocaleString('vi-VN');
    
    // Map payment method name
    const paymentMethods = {
      'money': 'Tiền mặt',
      'zalopay': 'ZaloPay',
      'momo': 'Momo',
      'bank': 'Chuyển khoản'
    };
    bookingDetail.paymentMethodName = paymentMethods[bookingDetail.paymentMethod] || bookingDetail.paymentMethod;
    
    // Map payment status name
    const paymentStatus = {
      'unpaid': 'Chưa thanh toán',
      'paid': 'Đã thanh toán'
    };
    bookingDetail.paymentStatusName = paymentStatus[bookingDetail.paymentStatus] || bookingDetail.paymentStatus;
    
    // Map booking status name
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