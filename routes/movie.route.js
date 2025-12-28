// // main-app/routes/movie.route.js
// const express = require('express');
// const router = express.Router();
// const axios = require('axios');

// const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3001';
// const SERVICE_TOKEN = process.env.SERVICE_TOKEN || '';

// // Forward request to Movie Service
// const forwardToMovieService = async (req, res) => {
//   try {
//     const method = req.method.toLowerCase();
//     const path = req.originalUrl.replace('/api/movies', '');
    
//     const config = {
//       method: method,
//       url: `${MOVIE_SERVICE_URL}/api/movies${path}`,
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Service-Token': SERVICE_TOKEN
//       }
//     };
    
//     if (['post', 'put', 'patch'].includes(method)) {
//       config.data = req.body;
//     }
    
//     if (method === 'get' && Object.keys(req.query).length > 0) {
//       config.params = req.query;
//     }
    
//     const response = await axios(config);
//     res.status(response.status).json(response.data);
    
//   } catch (error) {
//     console.error('Error forwarding to movie service:', error.message);
    
//     if (error.response) {
//       res.status(error.response.status).json(error.response.data);
//     } else {
//       res.status(500).json({
//         code: 'error',
//         message: 'Không thể kết nối với movie service'
//       });
//     }
//   }
// };

// // ===== ROUTES =====
// router.get('/:id', forwardToMovieService);    // GET /api/movies/:id
// router.get('/', forwardToMovieService);       // GET /api/movies

// module.exports = router;