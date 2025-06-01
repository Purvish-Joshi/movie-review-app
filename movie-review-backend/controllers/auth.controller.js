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
        
        if (!token) {
            console.error('No token provided in request body');
            return res.status(400).json({
                message: 'No token provided'
            });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('GOOGLE_CLIENT_ID not configured in environment');
            return res.status(500).json({
                message: 'Server configuration error'
            });
        }

        console.log('Attempting to verify token with Google...');
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        }).catch(error => {
            console.error('Google token verification error:', error);
            throw new Error('Failed to verify Google token: ' + error.message);
        });

        console.log('Token verified successfully');
        const googleData = ticket.getPayload();
        
        if (!googleData || !googleData.email) {
            console.error('Invalid payload from Google token');
            return res.status(400).json({
                message: 'Invalid token payload'
            });
        }

        // Check if user exists
        let user = await User.findOne({ 
            $or: [
                { email: googleData.email },
                { googleId: googleData.sub }
            ]
        }).catch(error => {
            console.error('Database query error:', error);
            throw new Error('Database error: ' + error.message);
        });

        if (user) {
            // If user exists but hasn't used Google before, update their Google ID
            if (!user.googleId) {
                try {
                    user.googleId = googleData.sub;
                    user.picture = googleData.picture;
                    user.authProvider = 'google';
                    await user.save();
                    console.log('Updated existing user with Google data');
                } catch (error) {
                    console.error('Error updating user with Google data:', error);
                    throw new Error('Failed to update user with Google data');
                }
            }

            // Generate token
            const token = generateToken(user);

            return res.json({
                token,
                user: {
                    id: user._id,
                    username: user.username || googleData.name,
                    email: user.email,
                    picture: user.picture || googleData.picture
                }
            });
        }

        // If user doesn't exist, create a new user
        try {
            const newUser = await User.create({
                username: googleData.name,
                email: googleData.email,
                googleId: googleData.sub,
                picture: googleData.picture,
                authProvider: 'google',
                password: Math.random().toString(36).slice(-8) // Random password for Google users
            });

            const token = generateToken(newUser);

            return res.json({
                token,
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    picture: newUser.picture
                }
            });
        } catch (error) {
            console.error('Error creating new user:', error);
            throw new Error('Failed to create new user: ' + error.message);
        }
    } catch (error) {
        console.error('Google auth error:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            message: 'Error with Google authentication',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}; 