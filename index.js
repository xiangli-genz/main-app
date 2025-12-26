// main-app/index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
// ❌ XÓA: const Movie = require('./models/movie.model');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// ✅ CLIENT ROUTES (giữ nguyên)
const clientBookingRoutes = require('./routes/client/booking.route');

// ❌ XÓA: const mockBookingApi = require('./routes/api/bookings.route');
// ❌ XÓA: const mockMoviesApi = require('./routes/api/movies.route');

// ✅ API ROUTES - Forward sang các services
const bookingApiProxy = require('./routes/booking.route'); // ← GIỮ LẠI (proxy)

// ✅ Forward API requests
app.use('/api/bookings', bookingApiProxy);

// ✅ GỌI MOVIE SERVICE (thêm mới)
const movieApiProxy = require('./routes/movie.route'); // ← TẠO MỚI
app.use('/api/movies', movieApiProxy);

// ✅ CLIENT ROUTES
app.use('/booking', clientBookingRoutes);

// ✅ HOME & MOVIE DETAIL ROUTES (giữ nguyên)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'client', 'pages', 'home.html'));
});

app.get('/movie/detail/:movieId', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'client', 'pages', 'movie-detail.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500 - Server Error');
});

app.listen(PORT, () => {
  console.log(`✓ Main app running on http://localhost:${PORT}`);
});

module.exports = app;