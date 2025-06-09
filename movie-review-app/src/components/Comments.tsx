import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Paper,
    Alert,
    Snackbar,
    Stack,
    Rating
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

interface Comment {
    _id: string;
    content: string;
    rating: number;
    user: {
        _id: string;
        username: string;
    };
    createdAt: string;
}

interface CommentsProps {
    movieId: string;
}

const Comments: React.FC<CommentsProps> = ({ movieId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [editRating, setEditRating] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/comments/${movieId}`);
            
            // Handle both array response and object with comments property
            const commentsData = Array.isArray(response.data) 
                ? response.data 
                : response.data.comments || [];
                
            setComments(commentsData);
            setError('');
        } catch (err: any) {
            console.error('Error fetching comments:', err);
            setError(err.response?.data?.message || 'Failed to load comments');
        } finally {
            setLoading(false);
        }
    }, [movieId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !newRating) return;

        try {
            await api.post(`/comments/${movieId}`, { 
                content: newComment,
                rating: newRating
            });
            setNewComment('');
            setNewRating(null);
            setSuccessMessage('Comment added successfully!');
            await fetchComments();
            setError('');
        } catch (err: any) {
            console.error('Error adding comment:', err);
            setError(err.response?.data?.message || 'Failed to add comment. Please try logging in again.');
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            await api.delete(`/comments/${movieId}/${commentId}`);
            setSuccessMessage('Comment deleted successfully!');
            await fetchComments();
            setError('');
        } catch (err: any) {
            console.error('Error deleting comment:', err);
            setError(err.response?.data?.message || 'Failed to delete comment');
        }
    };

    const handleEdit = (comment: Comment) => {
        setEditingCommentId(comment._id);
        setEditText(comment.content);
        setEditRating(comment.rating);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditText('');
        setEditRating(null);
    };

    const handleUpdate = async (commentId: string) => {
        if (!editText.trim() || !editRating) return;

        try {
            await api.put(`/comments/${movieId}/${commentId}`, { 
                content: editText,
                rating: editRating
            });
            setSuccessMessage('Comment updated successfully!');
            setEditingCommentId(null);
            setEditText('');
            setEditRating(null);
            await fetchComments();
            setError('');
        } catch (err: any) {
            console.error('Error updating comment:', err);
            setError(err.response?.data?.message || 'Failed to update comment');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Comments & Reviews
            </Typography>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
            >
                <Alert severity="success" onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            </Snackbar>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {user ? (
                <Paper sx={{ p: 2, mb: 2 }}>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 2 }}>
                            <Typography component="legend">Rating</Typography>
                            <Rating
                                value={newRating}
                                onChange={(_, value) => setNewRating(value)}
                                precision={0.5}
                            />
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            placeholder="Write a review..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!newComment.trim() || !newRating}
                        >
                            Post Review
                        </Button>
                    </form>
                </Paper>
            ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Please log in to add reviews.
                </Alert>
            )}

            {loading ? (
                <Typography>Loading comments...</Typography>
            ) : (
                <List>
                    {comments.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            No comments yet. Be the first to review this movie!
                        </Typography>
                    ) : (
                        comments.map((comment, index) => (
                            <React.Fragment key={comment._id}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: 1
                                    }}
                                >
                                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" color="primary">
                                                {comment.user.username}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(comment.createdAt)}
                                            </Typography>
                                        </Box>
                                        {user && user.id === comment.user._id && (
                                            <Stack direction="row" spacing={1}>
                                                {editingCommentId === comment._id ? (
                                                    <>
                                                        <IconButton
                                                            onClick={() => handleUpdate(comment._id)}
                                                            sx={{ color: 'success.main' }}
                                                        >
                                                            <SaveIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={handleCancelEdit}
                                                            sx={{ color: 'warning.main' }}
                                                        >
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </>
                                                ) : (
                                                    <>
                                                        <IconButton
                                                            onClick={() => handleEdit(comment)}
                                                            sx={{ color: 'primary.main' }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDelete(comment._id)}
                                                            sx={{ color: 'error.main' }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </Stack>
                                        )}
                                    </Box>

                                    <Box sx={{ width: '100%' }}>
                                        <Rating value={comment.rating} readOnly precision={0.5} />
                                        {editingCommentId === comment._id ? (
                                            <Box sx={{ mt: 1 }}>
                                                <Rating
                                                    value={editRating}
                                                    onChange={(_, value) => setEditRating(value)}
                                                    precision={0.5}
                                                />
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    variant="outlined"
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    sx={{ mt: 1 }}
                                                />
                                            </Box>
                                        ) : (
                                            <Typography variant="body1" sx={{ mt: 1 }}>
                                                {comment.content}
                                            </Typography>
                                        )}
                                    </Box>
                                </ListItem>
                                {index < comments.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    )}
                </List>
            )}
        </Box>
    );
};

export default Comments;