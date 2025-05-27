import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Comments from './Comments';
import FavoriteButton from './FavoriteButton';
import axios from 'axios';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../config/tmdb';
import { Movie } from '../types/movie';

interface TMDBMovieDetails {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    genres: Array<{ id: number; name: string }>;
    poster_path: string | null;
    vote_average: number;
    vote_count: number;
    credits: {
        crew: Array<{
            job: string;
            name: string;
        }>;
    };
}

const MovieDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await axios.get<TMDBMovieDetails>(
                    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
                );
                
                const director = response.data.credits.crew.find(person => person.job === 'Director')?.name || 'Unknown';
                
                setMovie({
                    _id: response.data.id.toString(),
                    title: response.data.title,
                    description: response.data.overview,
                    releaseYear: new Date(response.data.release_date).getFullYear(),
                    genre: response.data.genres.map(g => g.name),
                    director: director,
                    posterUrl: response.data.poster_path 
                        ? `${TMDB_IMAGE_BASE_URL}${response.data.poster_path}`
                        : '/placeholder-poster.jpg',
                    averageRating: response.data.vote_average / 2, // Convert to 5-star scale
                    totalReviews: response.data.vote_count
                });
                setError('');
            } catch (err) {
                console.error('Error fetching movie:', err);
                setError('Failed to load movie details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMovie();
        }
    }, [id]);

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
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    if (!movie) {
        return (
            <Container>
                <Typography>Movie not found</Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Back
            </Button>
            <Card sx={{ display: { md: 'flex' }, mb: 4 }}>
                <CardMedia
                    component="img"
                    sx={{ width: { xs: '100%', md: 300 }, height: { xs: 400, md: 450 } }}
                    image={movie.posterUrl}
                    alt={movie.title}
                />
                <CardContent sx={{ flex: '1 1 auto', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {movie.title}
                        </Typography>
                        <FavoriteButton movieId={movie._id} />
                    </Box>
                    <Typography variant="body1" paragraph>
                        {movie.description}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        <strong>Director:</strong> {movie.director}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        <strong>Release Year:</strong> {movie.releaseYear}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        <strong>Genres:</strong> {movie.genre.join(', ')}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        <strong>Rating:</strong> {movie.averageRating.toFixed(1)} / 5 ({movie.totalReviews} reviews)
                    </Typography>
                </CardContent>
            </Card>
            <Comments movieId={movie._id} />
        </Container>
    );
};

export default MovieDetails; 