const express = require('express');
const router = express.Router();

const Movie = require('../../../models/movie.model');

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await Movie.findOne({ _id: id });
    if (!movie) return res.status(404).json({ code: 'not_found', message: 'Movie not found' });
    res.json({ code: 'success', data: { movie } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 'error', message: 'Server error' });
  }
});

module.exports = router;
