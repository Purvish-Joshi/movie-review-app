const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movie: {
        type: String, // TMDB movie ID
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can't favorite the same movie twice
favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema); 