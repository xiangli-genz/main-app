// main-app/index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const Movie = require('./models/movie.model');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Routes
const bookingRoutes = require('./routes/client/booking.route');
app.use('/booking', bookingRoutes);

// Home route
app.get('/', async (req, res) => {
  try {
    const movies = await Movie.find({ deleted: false, status: 'active' });
    
    res.render('client/pages/home', {
      pageTitle: 'Trang chủ - Đặt vé xem phim',
      nowShowingMovies: movies,
      comingSoonMovies: [],
      user: null
    });
  } catch (error) {
    console.error('Error in home:', error);
    res.render('client/pages/home', {
      pageTitle: 'Trang chủ',
      nowShowingMovies: [],
      comingSoonMovies: [],
      user: null
    });
  }
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
  console.log(`✓ Main app listening on http://localhost:${PORT}`);
});

module.exports = app;