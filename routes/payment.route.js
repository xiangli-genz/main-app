const express = require('express');
const router = express.Router();
const axios = require('axios');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || '';

// Forward request to Payment Service
const forwardToPaymentService = async (req, res) => {
  try {
    const method = req.method.toLowerCase();
    const path = req.originalUrl.replace('/api/payments', '');
    
    const config = {
      method: method,
      url: `${PAYMENT_SERVICE_URL}/api/payments${path}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': SERVICE_TOKEN
      }
    };
    
    if (['post', 'put', 'patch'].includes(method)) {
      config.data = req.body;
    }
    
    if (method === 'get' && Object.keys(req.query).length > 0) {
      config.params = req.query;
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Error forwarding to payment service:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        code: 'error',
        message: 'Không thể kết nối với payment service'
      });
    }
  }
};

// ===== ROUTES =====
router.post('/create', forwardToPaymentService);
router.get('/:id', forwardToPaymentService);
router.get('/booking/:bookingId', forwardToPaymentService);

module.exports = router;