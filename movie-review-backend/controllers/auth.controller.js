const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { username, email, password, googleData } = req.body;

        // Check if user already exists with this email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email'
            });
        }

        // Create user
        const userData = {
            username,
            email,
            password: password || Math.random().toString(36).slice(-8), // Random password for Google users
            authProvider: googleData ? 'google' : 'local'
        };

        // If Google data is provided, add Google-specific fields
        if (googleData) {
            userData.googleId = googleData.sub;
            userData.picture = googleData.picture;
        }

        const user = await User.create(userData);

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Error registering user',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if this is a Google user trying to login with password
        if (user.authProvider === 'google') {
            return res.status(400).json({
                message: 'This account uses Google Sign-In. Please login with Google.'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error logging in',
            error: error.message
        });
    }
};

// @desc    Google OAuth
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const googleData = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email: googleData.email });

        if (user) {
            // If user exists but hasn't used Google before, update their Google ID
            if (!user.googleId) {
                user.googleId = googleData.sub;
                user.picture = googleData.picture;
                user.authProvider = 'google';
                await user.save();
            }

            // Generate token
            const token = generateToken(user);

            return res.json({
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    picture: user.picture
                }
            });
        }

        // If user doesn't exist, send Google data to frontend for registration
        return res.status(404).json({
            message: 'User not found',
            googleData: {
                email: googleData.email,
                sub: googleData.sub,
                picture: googleData.picture,
                name: googleData.name
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            message: 'Error with Google authentication',
            error: error.message
        });
    }
}; 