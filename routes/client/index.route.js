// main-app/routes/client/index.route.js
const homeRoutes = require('./home.route');
const movieRoutes = require('./movie.route');
const categoryRoutes = require('./category.route');
const userRoutes = require('./user.route');
const bookingRoutes = require('./booking.route'); // Thêm dòng này
const contactRoutes = require('./contact.route');

module.exports = (app) => {
  app.use('/', homeRoutes);
  app.use('/movie', movieRoutes);
  app.use('/category', categoryRoutes);
  app.use('/user', userRoutes);
  app.use('/booking', bookingRoutes); // Thêm dòng này
  app.use('/contact', contactRoutes);
};