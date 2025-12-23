// main-app/routes/client/booking.route.js
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/booking.controller');

// ✅ HTML PAGES (Serve static HTML)
router.get('/combo', controller.combo);
router.get('/checkout', controller.checkout);
router.get('/success', controller.success);

// ✅ API ENDPOINTS (Return JSON)
router.post('/create', controller.create);
router.get('/booked-seats', controller.bookedSeats);

module.exports = router;