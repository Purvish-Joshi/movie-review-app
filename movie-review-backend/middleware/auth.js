const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user by ID and email (both should match)
            const user = await User.findOne({
                _id: decoded.id,
                email: decoded.email
            });
            
            if (!user) {
                console.error('User not found:', decoded);
                return res.status(401).json({ message: 'User not found' });
            }

            // Attach user info to request
            req.user = {
                id: user._id.toString(),
                username: user.username,
                email: user.email
            };
            
            next();
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    } catch (err) {
        console.error('Auth Error:', err.message);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ message: 'Server error during authentication' });
    }
};

module.exports = auth; 