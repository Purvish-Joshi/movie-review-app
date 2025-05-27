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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            console.error('User not found with ID:', decoded.userId);
            throw new Error('User not found');
        }

        // Attach user info to request
        req.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email
        };
        
        next();
    } catch (err) {
        console.error('Auth Error:', err.message, err.stack);
        res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
};

module.exports = auth; 