const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: function() {
            return this.authProvider === 'local';
        },
        trim: true,
        sparse: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() {
            return this.authProvider === 'local';
        },
        minlength: [6, 'Password must be at least 6 characters long']
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    picture: {
        type: String
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, {
    timestamps: true
});

// Indexes for faster queries
userSchema.index({ email: 1, authProvider: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        // Only hash the password if it's being modified and auth provider is local
        if (!this.isModified('password') || this.authProvider !== 'local') {
            return next();
        }

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Update lastLogin timestamp
userSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('lastLogin')) {
        this.lastLogin = new Date();
    }
    next();
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        if (this.authProvider !== 'local') {
            throw new Error('This account uses Google Sign-In. Please login with Google.');
        }
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method to check if user can use Google auth
userSchema.methods.canUseGoogleAuth = function() {
    return this.authProvider === 'google' || !this.password;
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        picture: this.picture,
        authProvider: this.authProvider
    };
};

module.exports = mongoose.model('User', userSchema); 