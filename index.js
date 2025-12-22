// main-app/index.js
const express = require('express');
const path = require('path');
const bookingRoutes = require('./routes/client/booking.route');
// Mock booking API (for local testing)
const mockBookingApi = require('./routes/api/bookings.route');
const moviesApi = require('./routes/api/movies.route');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from this app (if any)
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Also serve static assets from the Booking_Service so booking views can load CSS/JS/images
app.use('/assets', express.static(path.join(__dirname, '..', 'Booking_Service', 'public', 'assets')));

// Mount booking routes
app.use('/booking', bookingRoutes);

// Mount mock booking API at /api/bookings so controller can call it locally
app.use('/api/bookings', mockBookingApi);

// Movies API
app.use('/api/movies', moviesApi);

// Minimal home route to allow navigation
app.get('/', (req, res) => {
	res.render('client/pages/home', { pageTitle: 'Trang chủ', user: null });
});

app.listen(PORT, () => {
	console.log(`Main app listening on http://localhost:${PORT}`);
});