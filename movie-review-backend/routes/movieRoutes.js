const express = require('express');
const router = express.Router();
const {
    getMovies,
    getMovie,
    getMoviesByGenre,
    searchMovies
} = require('../controllers/movieController');

// Public routes (no authentication required)
router.get('/', getMovies);
router.get('/search', searchMovies);
router.get('/genre/:genre', getMoviesByGenre);
router.get('/:id', getMovie);

module.exports = router; 