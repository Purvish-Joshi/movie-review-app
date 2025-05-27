import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/movie';
import FavoriteButton from './FavoriteButton';

interface MovieCardProps {
    movie: Movie;
    onFavoriteChange?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onFavoriteChange }) => {
    const navigate = useNavigate();

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = '/movie-placeholder.jpg';
        e.currentTarget.onerror = null;
    };

    return (
        <Card 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                maxWidth: '300px',
                margin: '0 auto',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                }
            }}
            onClick={() => navigate(`/movie/${movie._id}`)}
        >
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                <FavoriteButton 
                    movieId={movie._id} 
                    onChange={onFavoriteChange}
                />
            </Box>
            
            <Box sx={{ 
                position: 'relative',
                paddingTop: '150%',
                width: '100%',
                overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.05)',
            }}>
                <CardMedia
                    component="img"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    }}
                    image={movie.posterUrl}
                    alt={movie.title}
                    onError={handleImageError}
                />
            </Box>
            
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        mb: 1,
                        height: '2.4em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {movie.title}
                </Typography>
                
                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        height: '3em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {movie.description}
                </Typography>

                <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span style={{ fontWeight: 500 }}>Year:</span> {movie.releaseYear}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span style={{ fontWeight: 500 }}>Director:</span> {movie.director}
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {movie.genre.map((genre, index) => (
                                <Chip
                                    key={index}
                                    label={genre}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(44, 62, 80, 0.1)',
                                        color: 'primary.main',
                                        fontWeight: 500,
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default MovieCard; 