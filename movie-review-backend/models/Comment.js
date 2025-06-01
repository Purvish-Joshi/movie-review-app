const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
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
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [1000, 'Comment cannot be longer than 1000 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    edited: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add indexes for better query performance
commentSchema.index({ movie: 1, createdAt: -1 });
commentSchema.index({ user: 1, movie: 1 });

// Update the edited flag when content is modified
commentSchema.pre('save', function(next) {
    if (this.isModified('content')) {
        this.edited = true;
    }
    next();
});

// Virtual for time since comment
commentSchema.virtual('timeSince').get(function() {
    const now = new Date();
    const diffInSeconds = Math.floor((now - this.createdAt) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
});

// Method to check if user can edit comment
commentSchema.methods.canEdit = function(userId) {
    return this.user.toString() === userId.toString();
};

// Static method to get user's comment count
commentSchema.statics.getUserCommentCount = async function(userId) {
    return await this.countDocuments({ user: userId });
};

// Static method to get movie's average rating
commentSchema.statics.getMovieStats = async function(movieId) {
    const stats = await this.aggregate([
        { $match: { movie: movieId } },
        { 
            $group: {
                _id: '$movie',
                averageRating: { $avg: '$rating' },
                totalComments: { $sum: 1 },
                ratings: {
                    $push: '$rating'
                }
            }
        }
    ]);

    if (stats.length === 0) {
        return { averageRating: 0, totalComments: 0, ratingDistribution: {} };
    }

    // Calculate rating distribution
    const ratingDistribution = stats[0].ratings.reduce((acc, rating) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
    }, {});

    return {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalComments: stats[0].totalComments,
        ratingDistribution
    };
};

module.exports = mongoose.model('Comment', commentSchema); 