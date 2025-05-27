const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movie: {
        type: String, // TMDB movie ID
        required: true
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
commentSchema.index({ movie: 1, createdAt: -1 });
commentSchema.index({ user: 1, movie: 1 });

module.exports = mongoose.model('Comment', commentSchema); 