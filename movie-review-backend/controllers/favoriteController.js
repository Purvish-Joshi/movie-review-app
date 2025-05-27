const Favorite = require('../models/Favorite');
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL;

// Add movie to favorites
exports.addFavorite = async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user.id;

        // Check if movie exists in TMDB
        try {
            await axios.get(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        } catch (error) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const favorite = new Favorite({
            user: userId,
            movie: movieId
        });

        await favorite.save();
        res.status(201).json({ message: 'Movie added to favorites', isFavorite: true });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Movie already in favorites' });
        }
        console.error('Error adding favorite:', error.message);
        res.status(500).json({ message: 'Failed to add movie to favorites' });
    }
};

// Remove movie from favorites
exports.removeFavorite = async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user.id;

        const result = await Favorite.findOneAndDelete({ user: userId, movie: movieId });
        if (!result) {
            return res.status(404).json({ message: 'Movie not found in favorites' });
        }
        res.json({ message: 'Movie removed from favorites', isFavorite: false });
    } catch (error) {
        console.error('Error removing favorite:', error.message);
        res.status(500).json({ message: 'Failed to remove movie from favorites' });
    }
};

// Get user's favorite movies
exports.getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id });
        
        // Fetch movie details from TMDB for each favorite
        const moviePromises = favorites.map(favorite => 
            axios.get(`${TMDB_BASE_URL}/movie/${favorite.movie}?api_key=${TMDB_API_KEY}&append_to_response=credits`)
        );
        
        const movieResponses = await Promise.all(moviePromises);
        const movies = movieResponses.map(response => {
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
        });
        
        res.json(movies);
    } catch (error) {
        console.error('Error getting favorites:', error.message);
        res.status(500).json({ message: 'Failed to fetch favorite movies' });
    }
};

// Check if a movie is favorited
exports.checkFavorite = async (req, res) => {
    try {
        const { movieId } = req.params;
        
        // Check if movie exists in TMDB
        try {
            await axios.get(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        } catch (error) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const favorite = await Favorite.findOne({
            user: req.user.id,
            movie: movieId
        });
        res.json({ isFavorite: !!favorite });
    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({ message: error.message });
    }
}; 