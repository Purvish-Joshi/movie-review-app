const path = require('path');

// Load environment variables from root directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');
const authRoutes = require('../routes/auth.routes');
const userRoutes = require('../routes/userRoutes');
const movieRoutes = require('../routes/movieRoutes');
const favoriteRoutes = require('../routes/favoriteRoutes');
const commentRoutes = require('../routes/commentRoutes');

// Connect to database
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://movie-review-app-blush.vercel.app',
        'https://movie-review-pq6pb2k8b-purvish-joshis-projects.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cross-Origin-Opener-Policy'
    ],
    exposedHeaders: ['Content-Type', 'Authorization', 'Cross-Origin-Opener-Policy'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS middleware before other middleware
app.use(cors(corsOptions));

// Add Cross-Origin-Opener-Policy header
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});

// Other middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
    res.send('Movie Review API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
    console.log('\n=================================');
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 MongoDB Cloud Status: Connected`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log('=================================\n');
}); 