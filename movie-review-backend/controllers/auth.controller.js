const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('GOOGLE_CLIENT_ID not configured in environment');
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not configured in environment');
    }
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email,
            authProvider: user.authProvider 
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide email and password'
            });
        }

        // Check if user already exists with this email
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.authProvider === 'google' 
                    ? 'This email is already registered with Google. Please login with Google.'
                    : 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password,
            authProvider: 'local'
        });

        // Generate token
        const authToken = generateToken(user);

        res.status(201).json({
            token: authToken,
            user: user.getPublicProfile()
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

        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        try {
            // This will throw an error if it's a Google account
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const authToken = generateToken(user);

        res.json({
            token: authToken,
            user: user.getPublicProfile()
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
        const { token: googleToken } = req.body;
        
        console.log('Google auth attempt started');
        console.log('Token received:', googleToken ? 'Yes' : 'No');
        
        if (!googleToken) {
            console.log('No token provided');
            return res.status(400).json({
                message: 'No token provided'
            });
        }

        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('GOOGLE_CLIENT_ID not configured');
            return res.status(500).json({
                message: 'Server configuration error - GOOGLE_CLIENT_ID missing'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET not configured');
            return res.status(500).json({
                message: 'Server configuration error - JWT_SECRET missing'
            });
        }

        console.log('Attempting to verify Google token...');
        
        // Verify Google token
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            console.log('Google token verified successfully');
        } catch (tokenError) {
            console.error('Google token verification failed:', tokenError);
            return res.status(400).json({
                message: 'Invalid Google token',
                error: tokenError.message
            });
        }

        const googleData = ticket.getPayload();
        
        if (!googleData || !googleData.email) {
            console.error('Invalid token payload:', googleData);
            return res.status(400).json({
                message: 'Invalid token payload'
            });
        }

        console.log('Google data extracted:', {
            email: googleData.email,
            name: googleData.name,
            sub: googleData.sub
        });

        // Check if user exists
        console.log('Checking if user exists...');
        let user;
        try {
            user = await User.findOne({ 
                $or: [
                    { email: googleData.email.toLowerCase() },
                    { googleId: googleData.sub }
                ]
            });
            console.log('User lookup completed:', user ? 'User found' : 'No user found');
        } catch (dbError) {
            console.error('Database error during user lookup:', dbError);
            return res.status(500).json({
                message: 'Database error during user lookup',
                error: dbError.message
            });
        }

        if (user) {
            // If user exists but with local auth
            if (user.authProvider === 'local') {
                console.log('User exists with local auth');
                return res.status(400).json({
                    message: 'This email is already registered. Please login with email and password.'
                });
            }

            // Update Google data if needed
            if (user.googleId !== googleData.sub || user.picture !== googleData.picture) {
                console.log('Updating user Google data...');
                try {
                    user.googleId = googleData.sub;
                    user.picture = googleData.picture;
                    await user.save();
                    console.log('User Google data updated');
                } catch (updateError) {
                    console.error('Error updating user Google data:', updateError);
                    // Continue anyway, this isn't critical
                }
            }

            // Update last login
            try {
                user.lastLogin = new Date();
                await user.save();
                console.log('Last login updated');
            } catch (loginUpdateError) {
                console.error('Error updating last login:', loginUpdateError);
                // Continue anyway, this isn't critical
            }

            // Generate token
            console.log('Generating auth token for existing user...');
            const authToken = generateToken(user);

            return res.json({
                token: authToken,
                user: user.getPublicProfile()
            });
        }

        // If user doesn't exist, create a new one
        console.log('Creating new user...');
        try {
            user = await User.create({
                username: googleData.name,
                email: googleData.email.toLowerCase(),
                googleId: googleData.sub,
                picture: googleData.picture,
                authProvider: 'google'
            });
            console.log('New user created successfully');
        } catch (createError) {
            console.error('Error creating new user:', createError);
            return res.status(500).json({
                message: 'Error creating user account',
                error: createError.message
            });
        }

        // Generate token
        console.log('Generating auth token for new user...');
        const authToken = generateToken(user);

        res.status(201).json({
            token: authToken,
            user: user.getPublicProfile()
        });
        
        console.log('Google auth completed successfully');
        
    } catch (error) {
        console.error('Unexpected error in Google auth:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            message: 'Error authenticating with Google',
            error: error.message
        });
    }
};