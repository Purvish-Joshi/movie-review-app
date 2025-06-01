import React, { useState, useEffect } from 'react';
import { Container, Typography, Alert, Box } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import MovieCard from '../components/MovieCard';
import { Movie } from '../types/movie';

const Favorites = () => {
    const [favorites, setFavorites] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await api.get('/favorites');
                setFavorites(response.data);
                setError('');
            } catch (err) {
                console.error('Error fetching favorites:', err);
                setError('Failed to load favorite movies');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchFavorites();
        }
    }, [user]);

    if (!user) {
        return (
            <Container>
                <Alert severity="info" sx={{ mt: 4 }}>
                    Please log in to view your favorite movies.
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
                My Favorite Movies
            </Typography>

            {favorites.length === 0 ? (
                <Alert severity="info">
                    You haven't added any movies to your favorites yet.
                </Alert>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px',
                    padding: '24px 0'
                }}>
                    {favorites.map((movie) => (
                        <MovieCard 
                            key={movie._id}
                            movie={movie} 
                            onFavoriteChange={() => {
                                setFavorites(favorites.filter(f => f._id !== movie._id));
                            }} 
                        />
                    ))}
                </div>
            )}
        </Container>
    );
};

export default Favorites; 