// main-app/routes/api/movies.route.js
// ✅ FIXED - Expose movie API từ local model
const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie.model');

// GET /api/movies - Lấy tất cả phim
router.get('/', async (req, res) => {
  try {
    console.log('📡 [MAIN-APP] GET /api/movies');
    
    const movies = await Movie.find({ 
      deleted: false, 
      status: 'active' 
    });
    
    console.log(`✅ [MAIN-APP] Found ${movies.length} movies`);
    
    res.json({ 
      code: 'success', 
      data: { movies } 
    });
    
  } catch (err) {
    console.error('❌ [MAIN-APP] Error in GET /api/movies:', err);
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
    console.log('📡 [MAIN-APP] GET /api/movies/' + id);
    
    const movie = await Movie.findOne({ _id: id });
    
    if (!movie) {
      console.log('❌ [MAIN-APP] Movie not found:', id);
      return res.status(404).json({ 
        code: 'not_found', 
        message: 'Movie not found' 
      });
    }
    
    console.log('✅ [MAIN-APP] Movie found:', movie.name);
    res.json({ 
      code: 'success', 
      data: { movie } 
    });
    
  } catch (err) {
    console.error('❌ [MAIN-APP] Error in GET /api/movies/:id:', err);
    res.status(500).json({ 
      code: 'error', 
      message: 'Server error',
      details: err.message
    });
  }
});

module.exports = router;