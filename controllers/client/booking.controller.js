// ============================================
// FILE 3: controllers/client/booking.controller.js - FIXED
// ============================================
const axios = require('axios');
const path = require('path');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3001';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || '';

console.log('📡 [MAIN-APP] Config:');
console.log('  - Booking Service:', BOOKING_SERVICE_URL);
console.log('  - Movie Service:', MOVIE_SERVICE_URL);

// ===== HELPER: Call Booking Service =====
const callBookingService = async (path, method = 'GET', data = null) => {
  try {
    const config = {
      method: method,
      url: `${BOOKING_SERVICE_URL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': SERVICE_TOKEN
      },
      timeout: 10000
    };
    
    if (data) {
      config.data = data;
    }
    
    console.log(`📡 [MAIN-APP] ${method} ${config.url}`);
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('❌ [MAIN-APP] Error calling booking service:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    throw error;
  }
};

// ===== HELPER: Call Movie Service =====
const callMovieService = async (path, method = 'GET') => {
  try {
    const config = {
      method: method,
      url: `${MOVIE_SERVICE_URL}${path}`,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };
    
    console.log(`📡 [MAIN-APP] ${method} ${config.url}`);
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('❌ [MAIN-APP] Error calling movie service:', error.message);
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

// ===== [POST] /booking/create - API ENDPOINT =====
module.exports.create = async (req, res) => {
  try {
    const bookingData = req.body;
    
    console.log('=== [MAIN-APP] POST /booking/create ===');
    console.log('Movie ID:', bookingData.movieId);
    console.log('Cinema:', bookingData.cinema);
    console.log('Seats:', bookingData.seats?.length || 0);
    
    // ✅ VALIDATE: Kiểm tra dữ liệu đầu vào
    if (!bookingData.movieId) {
      return res.status(400).json({
        code: 'error',
        message: 'movieId is required'
      });
    }
    
    if (!bookingData.seats || bookingData.seats.length === 0) {
      return res.status(400).json({
        code: 'error',
        message: 'At least one seat is required'
      });
    }
    
    // 🔥 OPTION 1: Validate với Movie Service (nếu Movie Service đang chạy)
    // Nếu Movie Service KHÔNG chạy, comment đoạn này lại
    /*
    console.log('→ Validating with Movie Service...');
    try {
      const movieResponse = await callMovieService(`/api/movies/${bookingData.movieId}`);
      
      if (movieResponse.code !== 'success' || !movieResponse.data) {
        return res.status(404).json({
          code: 'error',
          message: 'Movie not found in Movie Service'
        });
      }
      
      const movie = movieResponse.data;
      console.log('✓ Movie validated:', movie.name);
      
      // Validate showtime
      const showtimeExists = movie.showtimes?.some(st => {
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
          message: 'Showtime not found'
        });
      }
      
      // Validate seat prices
      if (bookingData.seats && movie.prices) {
        for (const seat of bookingData.seats) {
          const expectedPrice = movie.prices[seat.type];
          
          if (!expectedPrice) {
            return res.status(400).json({
              code: 'error',
              message: `Invalid seat type: ${seat.type}`
            });
          }
          
          if (seat.price !== expectedPrice) {
            return res.status(400).json({
              code: 'error',
              message: `Invalid price for seat ${seat.seatNumber}`
            });
          }
        }
      }
      
      console.log('✓ Validation passed');
    } catch (movieError) {
      console.warn('⚠️  Movie Service validation failed:', movieError.message);
      // Continue anyway - let Booking Service handle it
    }
    */
    
    // 🔥 OPTION 2: Gửi trực tiếp đến Booking Service
    console.log('→ Sending to Booking Service...');
    const result = await callBookingService('/api/bookings/create', 'POST', bookingData);
    
    console.log('✅ Booking created:', result.data?.bookingCode);
    
    return res.json(result);
    
  } catch (error) {
    console.error('❌ [MAIN-APP] Error in /booking/create:', error.message);
    
    // Return error from downstream service
    if (error.response?.data) {
      return res.status(error.response.status || 500).json(error.response.data);
    }
    
    // Generic error
    return res.status(500).json({
      code: 'error',
      message: 'Failed to create booking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===== [GET] /booking/seats/booked =====
module.exports.bookedSeats = async (req, res) => {
  try {
    const { movieId, cinema, date, time } = req.query;
    
    if (!movieId || !cinema || !date || !time) {
      return res.status(400).json({
        code: 'error',
        message: 'Missing required parameters'
      });
    }
    
    const result = await callBookingService(
      `/api/bookings/seats/booked?movieId=${movieId}&cinema=${encodeURIComponent(cinema)}&date=${date}&time=${encodeURIComponent(time)}`
    );
    
    res.json(result);
    
  } catch (error) {
    console.error('Error getting booked seats:', error);
    res.status(500).json({
      code: 'error',
      message: 'Failed to get booked seats'
    });
  }
};

// ===== [GET] /booking/:id =====
module.exports.getById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const result = await callBookingService(`/api/bookings/${bookingId}`);
    
    res.json(result);
    
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({
      code: 'error',
      message: 'Failed to get booking'
    });
  }
};