require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// ===== LOCAL ROUTES (Mock data - không proxy) =====
// ✅ Route này sẽ dùng model local thay vì gọi movie-service
const moviesApiRoute = require('./routes/api/movies.route');
app.use('/api/movies', moviesApiRoute);

// ===== CLIENT ROUTES =====
const clientBookingRoutes = require('./routes/client/booking.route');
const clientPaymentRoutes = require('./routes/client/payment.route');

app.use('/booking', clientBookingRoutes);
app.use('/payment', clientPaymentRoutes);

// ===== HOME & MOVIE DETAIL ROUTES =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'client', 'pages', 'home.html'));
});

app.get('/movie/detail/:movieId', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'client', 'pages', 'movie-detail.html'));
});

// ===== PROXY ROUTES (cho booking & payment services) =====
const bookingApiProxy = require('./routes/booking.route');
const paymentApiProxy = require('./routes/payment.route');

app.use('/api/bookings', bookingApiProxy);
app.use('/api/payments', paymentApiProxy);

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
  console.log(`✓ Using LOCAL movie data (mock)`);
});

module.exports = app;