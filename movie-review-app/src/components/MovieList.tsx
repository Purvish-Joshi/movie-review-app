import React, { useEffect, useState } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    TextField, 
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    Alert,
    CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MovieCard from './MovieCard';
import axios from 'axios';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../config/tmdb';

interface TMDBMovie {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    genre_ids: number[];
    poster_path: string | null;
    vote_average: number;
    vote_count: number;
}

interface Genre {
    id: number;
    name: string;
}

const MovieList = () => {
    const [movies, setMovies] = useState<TMDBMovie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');

    // Get unique years from movies
    const years = Array.from(
        new Set(
            movies.map(movie => 
                movie.release_date ? new Date(movie.release_date).getFullYear() : 0
            )
        )
    ).sort((a, b) => b - a);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
                );
                setGenres(response.data.genres);
            } catch (err) {
                console.error('Error fetching genres:', err);
            }
        };

        fetchGenres();
    }, []);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                let endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
                
                if (searchTerm) {
                    endpoint = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&language=en-US&page=1`;
                }

                const response = await axios.get(endpoint);
                setMovies(response.data.results);
                setError('');
            } catch (err) {
                setError('Failed to load movies');
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchMovies();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    // Filter movies based on genre and year
    const filteredMovies = movies.filter(movie => {
        if (selectedGenre && !movie.genre_ids.includes(parseInt(selectedGenre))) {
            return false;
        }
        if (selectedYear && new Date(movie.release_date).getFullYear() !== parseInt(selectedYear)) {
            return false;
        }
        return true;
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{ mb: 4 }}>
                <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 600,
                        color: 'primary.main',
                        mb: 3
                    }}
                >
                    Discover Movies
                </Typography>

                <Box sx={{ display: 'grid', gap: 2, mb: 4, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' } }}>
                    <Box sx={{ gridColumn: { xs: '1', md: '1 / span 1' } }}>
                        <TextField
                            fullWidth
                            placeholder="Search movies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <FormControl fullWidth>
                        <InputLabel>Genre</InputLabel>
                        <Select
                            value={selectedGenre}
                            label="Genre"
                            onChange={(e) => setSelectedGenre(e.target.value)}
                        >
                            <MenuItem value="">All Genres</MenuItem>
                            {genres.map((genre) => (
                                <MenuItem key={genre.id} value={genre.id.toString()}>
                                    {genre.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={selectedYear}
                            label="Year"
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <MenuItem value="">All Years</MenuItem>
                            {years.map((year) => (
                                <MenuItem key={year} value={year.toString()}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Active filters */}
                {(selectedGenre || selectedYear || searchTerm) && (
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        {searchTerm && (
                            <Chip
                                label={`Search: ${searchTerm}`}
                                onDelete={() => setSearchTerm('')}
                                color="primary"
                                variant="outlined"
                            />
                        )}
                        {selectedGenre && (
                            <Chip
                                label={`Genre: ${selectedGenre}`}
                                onDelete={() => setSelectedGenre('')}
                                color="primary"
                                variant="outlined"
                            />
                        )}
                        {selectedYear && (
                            <Chip
                                label={`Year: ${selectedYear}`}
                                onDelete={() => setSelectedYear('')}
                                color="primary"
                                variant="outlined"
                            />
                        )}
                    </Stack>
                )}

                {/* Results count */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Showing {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'}
                </Typography>
            </Box>

            {filteredMovies.length === 0 ? (
                <Alert severity="info">
                    No movies found matching your criteria. Try adjusting your filters.
                </Alert>
            ) : (
                <Box sx={{ 
                    display: 'grid', 
                    gap: 3,
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)'
                    }
                }}>
                    {filteredMovies.map((movie) => (
                        <Box key={movie.id}>
                            <MovieCard 
                                movie={{
                                    _id: movie.id.toString(),
                                    title: movie.title,
                                    description: movie.overview,
                                    releaseYear: new Date(movie.release_date).getFullYear(),
                                    genre: movie.genre_ids.map(id => 
                                        genres.find(g => g.id === id)?.name || 'Unknown'
                                    ),
                                    director: '', // TMDB doesn't provide director in basic movie list
                                    posterUrl: movie.poster_path 
                                        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                                        : '/placeholder-poster.jpg',
                                    averageRating: movie.vote_average / 2, // Convert to 5-star scale
                                    totalReviews: movie.vote_count
                                }} 
                            />
                        </Box>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default MovieList; 