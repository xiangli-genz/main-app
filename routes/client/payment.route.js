const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/payment.controller');

// ===== HTML PAGES =====
router.get('/processing', controller.processing);
router.get('/failed', controller.failed);

// ===== API ENDPOINTS =====
router.post('/create', controller.create);
router.get('/status/:paymentId', controller.status);

module.exports = router;