// main-app/index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const Movie = require('./models/movie.model');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ KHÔNG CẦN VIEW ENGINE - DÙNG HTML TĨNH
// Không cần: app.set('view engine', 'pug');

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ STATIC FILES
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// ✅ ROUTES
const clientBookingRoutes = require('./routes/client/booking.route');
const mockBookingApi = require('./routes/api/bookings.route');
const mockMoviesApi = require('./routes/api/movies.route');

// ✅ API ROUTES (phải đặt trước client routes)
app.use('/api/bookings', mockBookingApi);
app.use('/api/movies', mockMoviesApi);

// ✅ CLIENT ROUTES
app.use('/booking', clientBookingRoutes);

// ✅ HOME ROUTE - Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'client', 'pages', 'home.html'));
});

// ✅ MOVIE DETAIL ROUTE
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
  console.log(`✓ Movie detail: http://localhost:${PORT}/movie/detail/demo1`);
  console.log(`✓ Booking combo: http://localhost:${PORT}/booking/combo`);
  console.log(`✓ Booking checkout: http://localhost:${PORT}/booking/checkout`);
});

module.exports = app;