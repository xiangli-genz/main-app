// main-app/controllers/client/booking.controller.js
const axios = require('axios');
const path = require('path');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3002';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || '';

// ===== HELPER: Call Booking Service =====
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

// ===== HELPER: Call Movie Service =====
const callMovieService = async (path, method = 'GET') => {
  try {
    const response = await axios({
      method: method,
      url: `${MOVIE_SERVICE_URL}${path}`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error calling movie service:', error.message);
    throw error;
  }
};

// ===== [GET] /booking/seat =====
module.exports.seat = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../../views/client/pages/booking-seat.html'));
  } catch (error) {
    console.error('Error in seat page:', error);
    res.redirect('/');
  }
};

// ===== [GET] /booking/combo =====
module.exports.combo = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../../views/client/pages/booking-combo.html'));
  } catch (error) {
    console.error('Error in combo page:', error);
    res.redirect('/');
  }
};

// ===== [GET] /booking/checkout =====
module.exports.checkout = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../../views/client/pages/booking-checkout.html'));
  } catch (error) {
    console.error('Error in checkout page:', error);
    res.redirect('/');
  }
};

// ===== [GET] /booking/success =====
module.exports.success = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../../views/client/pages/booking-success.html'));
  } catch (error) {
    console.error('Error in success page:', error);
    res.redirect('/');
  }
};

// ===== [POST] /api/bookings/create - API ENDPOINT =====
module.exports.create = async (req, res) => {
  try {
    const bookingData = req.body;
    
    console.log('=== MAIN APP: Creating booking ===');
    console.log('Movie ID:', bookingData.movieId);
    
    // 🔥 VALIDATE VỚI MOVIE SERVICE TRƯỚC KHI GỬI ĐẾN BOOKING SERVICE
    console.log('→ Validating with Movie Service...');
    
    const movieResponse = await callMovieService(`/api/catalog/client/movies/${bookingData.movieId}`);
    
    if (movieResponse.code !== 'success' || !movieResponse.data) {
      return res.status(404).json({
        code: 'error',
        message: 'Phim không tồn tại!'
      });
    }
    
    const movie = movieResponse.data;
    console.log('✓ Movie found:', movie.name);
    
    // Validate showtime tồn tại
    const showtimeExists = movie.showtimes.some(st => {
      const stDate = new Date(st.date);
      const reqDate = new Date(bookingData.showtimeDate);
      
      return (
        st.cinema === bookingData.cinema &&
        stDate.toDateString() === reqDate.toDateString() &&
        st.times.includes(bookingData.showtimeTime)
      );
    });
    
    if (!showtimeExists) {
      return res.status(400).json({
        code: 'error',
        message: 'Suất chiếu không tồn tại hoặc đã hết!'
      });
    }
    
    console.log('✓ Showtime validated');
    
    // Validate giá vé
    if (bookingData.seats && bookingData.seats.length > 0) {
      for (const seat of bookingData.seats) {
        const expectedPrice = movie.prices[seat.type];
        
        if (!expectedPrice) {
          return res.status(400).json({
            code: 'error',
            message: `Loại ghế "${seat.type}" không hợp lệ!`
          });
        }
        
        if (seat.price !== expectedPrice) {
          return res.status(400).json({
            code: 'error',
            message: `Giá ghế ${seat.seatNumber} không đúng! Mong đợi ${expectedPrice}đ, nhận ${seat.price}đ`
          });
        }
      }
    }
    
    console.log('✓ Seat prices validated');
    
    // 🔥 GỬI BOOKING DATA ĐẾN BOOKING SERVICE
    // Booking Service sẽ validate lại lần nữa (double-check)
    console.log('→ Sending to Booking Service...');
    const result = await callBookingService('/api/bookings/create', 'POST', bookingData);
    
    console.log('✅ Booking created:', result.data?.bookingCode);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    
    // Parse error từ downstream services
    if (error.response && error.response.data) {
      return res.status(error.response.status || 500).json(error.response.data);
    }
    
    res.status(500).json({
      code: 'error',
      message: 'Không thể tạo booking'
    });
  }
};

// ===== [GET] /api/bookings/seats/booked - API ENDPOINT =====
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

// ===== [GET] /api/bookings/:id - API ENDPOINT =====
module.exports.getById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const result = await callBookingService(`/api/bookings/${bookingId}`);
    
    res.json(result);
    
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({
      code: 'error',
      message: 'Không thể lấy thông tin booking'
    });
  }
};