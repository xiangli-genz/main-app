const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Mock booked seats
router.get('/seats/booked', (req, res) => {
  // Return some sample booked seats for the requested movie/showtime
  res.json({
    code: 'success',
    data: {
      seats: [
        { row: 'A', number: 1 },
        { row: 'A', number: 2 },
        { row: 'B', number: 5 }
      ]
    }
  });
});

// Create booking (mock)
router.post('/create', (req, res) => {
  const payload = req.body || {};
  const bookingId = 'bk_' + uuidv4().split('-')[0];

  const booking = Object.assign({
    bookingId,
    status: 'initial',
    paymentStatus: 'unpaid',
    paymentMethod: payload.paymentMethod || 'money',
    seats: payload.seats || [],
    showtime: payload.showtime || { date: new Date().toISOString(), time: '19:00' },
    createdAt: new Date().toISOString()
  }, payload);

  res.json({
    code: 'success',
    data: {
      booking: booking,
      bookingId: bookingId
    }
  });
});

// Get booking by id (mock)
router.get('/:id', (req, res) => {
  const id = req.params.id;
  // Return a sample booking
  const booking = {
    bookingId: id,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'zalopay',
    seats: [ { row: 'A', number: 3 }, { row: 'A', number: 4 } ],
    showtime: { date: new Date().toISOString(), time: '19:00' },
    createdAt: new Date().toISOString()
  };
  res.json({ code: 'success', data: { booking } });
});

module.exports = router;
