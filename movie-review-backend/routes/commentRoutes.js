const express = require('express');
const router = express.Router();
const {
    getComments,
    addComment,
    updateComment,
    deleteComment
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Get comments for a movie (public)
router.get('/:movieId', getComments);

// Add a comment to a movie (requires auth)
router.post('/:movieId', auth, addComment);

// Update a comment (requires auth)
router.put('/:movieId/:commentId', auth, updateComment);

// Delete a comment (requires auth)
router.delete('/:movieId/:commentId', auth, deleteComment);

module.exports = router; 