const express = require('express');
const router = express.Router();
const {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkFavorite
} = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get user's favorites
router.get('/', getFavorites);

// Check if movie is in favorites
router.get('/check/:movieId', checkFavorite);

// Add to favorites
router.post('/:movieId', addFavorite);

// Remove from favorites
router.delete('/:movieId', removeFavorite);

module.exports = router; 