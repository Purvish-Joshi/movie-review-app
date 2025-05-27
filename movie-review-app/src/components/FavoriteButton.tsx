import React, { useState, useEffect, useCallback } from 'react';
import { IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface FavoriteButtonProps {
    movieId: string;
    onChange?: () => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ movieId, onChange }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const { user } = useAuth();

    const checkFavoriteStatus = useCallback(async () => {
        if (!user) return;
        try {
            const response = await api.get(`/favorites/check/${movieId}`);
            setIsFavorite(response.data.isFavorite);
        } catch (error: any) {
            if (error.response?.status === 401) {
                setError('Please log in again to manage favorites');
            } else {
                setError(error.response?.data?.message || 'Failed to check favorite status');
            }
        }
    }, [movieId, user]);

    useEffect(() => {
        checkFavoriteStatus();
    }, [checkFavoriteStatus]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            setError('Please log in to add favorites');
            return;
        }
        
        setIsLoading(true);
        try {
            if (isFavorite) {
                await api.delete(`/favorites/${movieId}`);
                setIsFavorite(false);
            } else {
                await api.post(`/favorites/${movieId}`);
                setIsFavorite(true);
            }
            
            onChange?.();
        } catch (error: any) {
            if (error.response?.status === 401) {
                setError('Please log in again to manage favorites');
            } else {
                setError(error.response?.data?.message || 'Failed to update favorite status');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseError = () => {
        setError('');
    };

    if (!user) return null;

    return (
        <>
            <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                <IconButton
                    onClick={handleToggleFavorite}
                    disabled={isLoading}
                    sx={{
                        color: isFavorite ? 'error.main' : 'action.active',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                            color: 'error.main',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                    }}
                >
                    {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
            </Tooltip>
            
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
};

export default FavoriteButton; 