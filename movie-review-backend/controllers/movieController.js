const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

// Get all movies (with optional search and filtering)
exports.getMovies = async (req, res) => {
    try {
        const { search, genre, year } = req.query;
        let endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

        if (search) {
            endpoint = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(search)}&language=en-US&page=1`;
        }

        const response = await axios.get(endpoint);
        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching movies:', error.message);
        res.status(500).json({ message: 'Failed to fetch movies' });
    }
};

// Get single movie
exports.getMovie = async (req, res) => {
    try {
        const response = await axios.get(
            `${TMDB_BASE_URL}/movie/${req.params.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
        );
        res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        console.error('Error fetching movie:', error.message);
        res.status(500).json({ message: 'Failed to fetch movie details' });
    }
};

// Get movies by genre
exports.getMoviesByGenre = async (req, res) => {
    try {
        const { genre } = req.params;
        const response = await axios.get(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genre}&language=en-US&page=1`
        );
        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching movies by genre:', error.message);
        res.status(500).json({ message: 'Failed to fetch movies by genre' });
    }
};

// Search movies
exports.searchMovies = async (req, res) => {
    try {
        const { query } = req.query;
        const response = await axios.get(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
        );
        res.json(response.data.results);
    } catch (error) {
        console.error('Error searching movies:', error.message);
        res.status(500).json({ message: 'Failed to search movies' });
    }
}; 