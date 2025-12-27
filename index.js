require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// ✅ CLIENT ROUTES
const clientBookingRoutes = require('./routes/client/booking.route');
const clientPaymentRoutes = require('./routes/client/payment.route');  // ← THÊM

// ✅ API ROUTES - Proxies
const bookingApiProxy = require('./routes/booking.route');
const movieApiProxy = require('./routes/movie.route');
const paymentApiProxy = require('./routes/payment.route');  // ← THÊM

// ✅ Forward API requests
app.use('/api/bookings', bookingApiProxy);
app.use('/api/movies', movieApiProxy);
app.use('/api/payments', paymentApiProxy);  // ← THÊM

// ✅ CLIENT ROUTES
app.use('/booking', clientBookingRoutes);
app.use('/payment', clientPaymentRoutes);  // ← THÊM

// ✅ HOME & MOVIE DETAIL ROUTES
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