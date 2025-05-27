const Comment = require('../models/Comment');
const axios = require('axios');
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

// Get comments for a movie
exports.getComments = async (req, res) => {
    try {
        const { movieId } = req.params;

        // Verify movie exists in TMDB
        try {
            await axios.get(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        } catch (error) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const comments = await Comment.find({ movie: movieId })
            .populate('user', 'username')
            .sort('-createdAt');

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error.message);
        res.status(500).json({ message: 'Failed to fetch comments' });
    }
};

// Add a comment
exports.addComment = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { content, rating } = req.body;

        if (!content || !rating) {
            return res.status(400).json({ message: 'Content and rating are required' });
        }

        // Verify movie exists in TMDB
        try {
            await axios.get(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        } catch (error) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const comment = new Comment({
            user: req.user.id,
            movie: movieId,
            content,
            rating
        });

        const savedComment = await comment.save();
        await savedComment.populate('user', 'username');
        
        res.status(201).json(savedComment);
    } catch (error) {
        console.error('Error adding comment:', error.message);
        res.status(400).json({ message: 'Failed to add comment' });
    }
};

// Update a comment
exports.updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this comment' });
        }

        if (req.body.content) comment.content = req.body.content;
        if (req.body.rating) comment.rating = req.body.rating;

        const updatedComment = await comment.save();
        await updatedComment.populate('user', 'username');
        
        res.json(updatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 