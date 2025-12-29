const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/booking.controller');

console.log('✓ Loading client booking routes...');

// ===== HTML PAGES =====
router.get('/seat', controller.seat);
router.get('/combo', controller.combo);
router.get('/checkout', controller.checkout);
router.get('/success', controller.success);

// ===== API ENDPOINTS =====
// ✅ THÊM POST /create - QUAN TRỌNG!
router.post('/create', controller.create);

// Các route khác
router.get('/seats/booked', controller.bookedSeats);
router.get('/:id', controller.getById);

console.log('✓ Client booking routes loaded');

module.exports = router;