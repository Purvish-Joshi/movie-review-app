const Favorite = require('../models/Favorite');
const axios = require('axios');

// Validate environment variables
if (!process.env.TMDB_API_KEY || !process.env.TMDB_BASE_URL || !process.env.TMDB_IMAGE_BASE_URL) {
    console.error('Missing required TMDB environment variables');
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

// Helper function to validate movieId
const validateMovieId = async (movieId) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('Movie not found');
        }
        throw new Error('Failed to validate movie');
    }
};

// Add movie to favorites
exports.addFavorite = async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user.id;

        if (!movieId) {
            return res.status(400).json({ message: 'Movie ID is required' });
        }

        // Check if movie exists in TMDB
        try {
            await validateMovieId(movieId);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({ user: userId, movie: movieId });
        if (existingFavorite) {
            return res.status(400).json({ message: 'Movie already in favorites' });
        }

        const favorite = new Favorite({
            user: userId,
            movie: movieId
        });

        await favorite.save();
        res.status(201).json({ message: 'Movie added to favorites', isFavorite: true });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ message: 'Failed to add movie to favorites' });
    }
};

// Remove movie from favorites
exports.removeFavorite = async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user.id;

        if (!movieId) {
            return res.status(400).json({ message: 'Movie ID is required' });
        }

        const result = await Favorite.findOneAndDelete({ user: userId, movie: movieId });
        if (!result) {
            return res.status(404).json({ message: 'Movie not found in favorites' });
        }
        res.json({ message: 'Movie removed from favorites', isFavorite: false });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Failed to remove movie from favorites' });
    }
};

// Get user's favorite movies
exports.getFavorites = async (req, res) => {
    try {
        if (!TMDB_API_KEY) {
            throw new Error('TMDB API key not configured');
        }

        const favorites = await Favorite.find({ user: req.user.id });
        
        if (!favorites.length) {
            return res.json([]);
        }

        // Fetch movie details from TMDB for each favorite
        const moviePromises = favorites.map(async favorite => {
            try {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/movie/${favorite.movie}?api_key=${TMDB_API_KEY}&append_to_response=credits`
                );
                const movie = response.data;
                const director = movie.credits.crew.find(person => person.job === 'Director')?.name || 'Unknown';
                
                return {
                    _id: movie.id.toString(),
                    title: movie.title,
                    description: movie.overview,
                    releaseYear: new Date(movie.release_date).getFullYear(),
                    genre: movie.genres.map(g => g.name),
                    director: director,
                    posterUrl: movie.poster_path 
                        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                        : '/placeholder-poster.jpg',
                    averageRating: movie.vote_average / 2,
                    totalReviews: movie.vote_count
                };
            } catch (error) {
                console.error(`Error fetching movie ${favorite.movie}:`, error);
                return null;
            }
        });
        
        const movies = (await Promise.all(moviePromises)).filter(movie => movie !== null);
        res.json(movies);
    } catch (error) {
        console.error('Error getting favorites:', error);
        res.status(500).json({ 
            message: 'Failed to fetch favorite movies',
            error: error.message 
        });
    }
};

// Check if a movie is favorited
exports.checkFavorite = async (req, res) => {
    try {
        const { movieId } = req.params;
        
        if (!movieId) {
            return res.status(400).json({ message: 'Movie ID is required' });
        }

        // Check if movie exists in TMDB
        try {
            await validateMovieId(movieId);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }

        const favorite = await Favorite.findOne({
            user: req.user.id,
            movie: movieId
        });
        
        res.json({ isFavorite: !!favorite });
    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({ 
            message: 'Failed to check favorite status',
            error: error.message 
        });
    }
}; 