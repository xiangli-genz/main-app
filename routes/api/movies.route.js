// main-app/routes/api/movies.route.js
// ✅ LOCAL ROUTE - Dùng mock data từ model
const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie.model');

// GET /api/movies - Lấy tất cả phim
router.get('/', async (req, res) => {
  try {
    console.log('📡 [LOCAL] Getting all movies from model...');
    
    const movies = await Movie.find({ deleted: false, status: 'active' });
    
    console.log(`✅ [LOCAL] Found ${movies.length} movies`);
    
    res.json({ 
      code: 'success', 
      data: { movies } 
    });
    
  } catch (err) {
    console.error('❌ [LOCAL] Error in GET /api/movies:', err);
    res.status(500).json({ 
      code: 'error', 
      message: 'Server error',
      details: err.message
    });
  }
});

// GET /api/movies/:id - Lấy chi tiết phim
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('📡 [LOCAL] Getting movie by ID:', id);
    
    const movie = await Movie.findOne({ _id: id });
    
    if (!movie) {
      console.log('❌ [LOCAL] Movie not found:', id);
      return res.status(404).json({ 
        code: 'not_found', 
        message: 'Movie not found' 
      });
    }
    
    console.log('✅ [LOCAL] Movie found:', movie.name);
    res.json({ 
      code: 'success', 
      data: { movie } 
    });
    
  } catch (err) {
    console.error('❌ [LOCAL] Error in GET /api/movies/:id:', err);
    res.status(500).json({ 
      code: 'error', 
      message: 'Server error',
      details: err.message
    });
  }
});

module.exports = router;