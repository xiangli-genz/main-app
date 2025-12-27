const axios = require('axios');
const path = require('path');

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || '';

const callPaymentService = async (path, method = 'GET', data = null) => {
  try {
    const config = {
      method: method,
      url: `${PAYMENT_SERVICE_URL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': SERVICE_TOKEN
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Error calling payment service:', error.message);
    throw error;
  }
};

// [GET] /payment/processing
module.exports.processing = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../../views/client/pages/payment-processing.html'));
  } catch (error) {
    console.error('Error in processing page:', error);
    res.redirect('/');
  }
};

// [GET] /payment/failed
module.exports.failed = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../../views/client/pages/payment-failed.html'));
  } catch (error) {
    console.error('Error in failed page:', error);
    res.redirect('/');
  }
};

// [POST] /payment/create - API ENDPOINT
module.exports.create = async (req, res) => {
  try {
    const paymentData = req.body;
    
    const result = await callPaymentService('/api/payments/create', 'POST', paymentData);
    
    res.json(result);
    
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      code: 'error',
      message: 'Không thể tạo payment'
    });
  }
};

// [GET] /payment/status/:paymentId - API ENDPOINT
module.exports.status = async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    
    const result = await callPaymentService(`/api/payments/${paymentId}`);
    
    res.json(result);
    
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      code: 'error',
      message: 'Không thể lấy trạng thái payment'
    });
  }
};