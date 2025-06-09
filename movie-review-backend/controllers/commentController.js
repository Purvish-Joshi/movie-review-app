const Comment = require('../models/Comment');
const axios = require('axios');

// Validate environment variables
if (!process.env.TMDB_API_KEY || !process.env.TMDB_BASE_URL) {
    console.error('Missing required TMDB environment variables');
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

// Helper function to validate movieId
const validateMovieId = async (movieId) => {
    if (!movieId) {
        throw new Error('Movie ID is required');
    }

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('Movie not found');
        }
        throw new Error('Failed to validate movie');
    }
};

// Helper function to validate rating
const validateRating = (rating) => {
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        throw new Error('Rating must be a number between 1 and 5');
    }
    return numRating;
};

// Get comments for a movie - NO AUTH REQUIRED
exports.getComments = async (req, res) => {
    try {
        const { movieId } = req.params;

        // Verify movie exists in TMDB
        try {
            await validateMovieId(movieId);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }

        const comments = await Comment.find({ movie: movieId })
            .populate('user', 'username email')
            .sort('-createdAt');

        // Map comments and check ownership only if user is authenticated
        const mappedComments = comments.map(comment => ({
            ...comment.toObject(),
            isOwner: req.user ? comment.user._id.toString() === req.user.id : false
        }));

        res.json(mappedComments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ 
            message: 'Failed to fetch comments',
            error: error.message 
        });
    }
};

// Add a comment - AUTH REQUIRED
exports.addComment = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { movieId } = req.params;
        const { content, rating } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Content is required' });
        }

        // Validate rating
        let validatedRating;
        try {
            validatedRating = validateRating(rating);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        // Verify movie exists in TMDB
        try {
            await validateMovieId(movieId);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }

        // Check if user already commented on this movie
        const existingComment = await Comment.findOne({
            user: req.user.id,
            movie: movieId
        });

        if (existingComment) {
            return res.status(400).json({ 
                message: 'You have already commented on this movie',
                existingComment
            });
        }

        const comment = new Comment({
            user: req.user.id,
            movie: movieId,
            content: content.trim(),
            rating: validatedRating
        });

        const savedComment = await comment.save();
        await savedComment.populate('user', 'username email');
        
        res.status(201).json({
            message: 'Comment added successfully',
            comment: {
                ...savedComment.toObject(),
                isOwner: true
            }
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ 
            message: 'Failed to add comment',
            error: error.message 
        });
    }
};

// Update a comment - AUTH REQUIRED
exports.updateComment = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { commentId } = req.params;
        const { content, rating } = req.body;

        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this comment' });
        }

        // Validate content if provided
        if (content !== undefined) {
            if (!content || content.trim().length === 0) {
                return res.status(400).json({ message: 'Content cannot be empty' });
            }
            comment.content = content.trim();
        }

        // Validate rating if provided
        if (rating !== undefined) {
            try {
                const validatedRating = validateRating(rating);
                comment.rating = validatedRating;
            } catch (error) {
                return res.status(400).json({ message: error.message });
            }
        }

        const updatedComment = await comment.save();
        await updatedComment.populate('user', 'username email');
        
        res.json({
            message: 'Comment updated successfully',
            comment: {
                ...updatedComment.toObject(),
                isOwner: true
            }
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ 
            message: 'Failed to update comment',
            error: error.message 
        });
    }
};

// Delete a comment - AUTH REQUIRED
exports.deleteComment = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();
        res.json({ 
            message: 'Comment deleted successfully',
            deletedCommentId: commentId
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ 
            message: 'Failed to delete comment',
            error: error.message 
        });
    }
};