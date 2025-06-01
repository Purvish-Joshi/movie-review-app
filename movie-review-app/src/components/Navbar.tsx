import React, { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import MovieIcon from '@mui/icons-material/Movie';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  children?: ReactNode;
}

interface User {
  id: string;
  username?: string;
  email: string;
  picture?: string;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Get the display name for the avatar
  const getAvatarText = (user: User | null): string => {
    if (!user) return '';
    if (user.username) return user.username.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  // Get the display name for the user
  const getDisplayName = (user: User | null): string => {
    if (!user) return '';
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '64px' }}>
          <MovieIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 4,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              letterSpacing: '.1rem',
            }}
          >
            MOVIE REVIEWS
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{
                fontWeight: isActive('/') ? 600 : 400,
                color: isActive('/') ? 'primary.main' : 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Movies
            </Button>
            
            {user && (
              <Button
                component={RouterLink}
                to="/favorites"
                color="inherit"
                startIcon={<FavoriteIcon />}
                sx={{
                  fontWeight: isActive('/favorites') ? 600 : 400,
                  color: isActive('/favorites') ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                Favorites
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {user.picture ? (
                    <Avatar 
                      src={user.picture}
                      sx={{ 
                        width: 32, 
                        height: 32,
                      }}
                    />
                  ) : (
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      {getAvatarText(user)}
                    </Avatar>
                  )}
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {getDisplayName(user)}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '20px',
                    px: 3,
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  sx={{
                    fontWeight: isActive('/login') ? 600 : 400,
                    color: isActive('/login') ? 'primary.main' : 'text.primary',
                  }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: '20px',
                    px: 3,
                  }}
                >
                  Register
                </Button>
              </>
            )}
            {children}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 