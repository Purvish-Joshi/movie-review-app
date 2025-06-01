const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    movie: {
        type: String, // TMDB movie ID
        required: true,
        index: true
    },
    addedAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ensure a user can't favorite the same movie twice
favoriteSchema.index({ user: 1, movie: 1 }, { unique: true });

// Virtual for time since favorited
favoriteSchema.virtual('timeSince').get(function() {
    const now = new Date();
    const diffInSeconds = Math.floor((now - this.addedAt) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
});

// Static method to get user's favorite count
favoriteSchema.statics.getUserFavoriteCount = async function(userId) {
    return await this.countDocuments({ user: userId });
};

// Static method to check if movie is favorited by user
favoriteSchema.statics.isMovieFavorited = async function(userId, movieId) {
    const favorite = await this.findOne({ user: userId, movie: movieId });
    return !!favorite;
};

// Static method to get movie's favorite count
favoriteSchema.statics.getMovieFavoriteCount = async function(movieId) {
    return await this.countDocuments({ movie: movieId });
};

// Static method to get user's favorite movies with pagination
favoriteSchema.statics.getUserFavorites = async function(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [favorites, total] = await Promise.all([
        this.find({ user: userId })
            .sort({ addedAt: -1 })
            .skip(skip)
            .limit(limit),
        this.countDocuments({ user: userId })
    ]);

    return {
        favorites,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

module.exports = mongoose.model('Favorite', favoriteSchema); 