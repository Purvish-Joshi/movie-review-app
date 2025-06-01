import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box, IconButton } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import MovieList from './components/MovieList';
import MovieDetails from './components/MovieDetails';
import Favorites from './components/Favorites';

// Create theme based on mode
const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#2c3e50' : '#3498db',
      light: mode === 'light' ? '#34495e' : '#5dade2',
      dark: mode === 'light' ? '#1a252f' : '#2980b9',
    },
    secondary: {
      main: mode === 'light' ? '#e74c3c' : '#e74c3c',
      light: mode === 'light' ? '#ff6b6b' : '#ff7675',
      dark: mode === 'light' ? '#c0392b' : '#d63031',
    },
    background: {
      default: mode === 'light' ? '#f5f6fa' : '#1a1a2e',
      paper: mode === 'light' ? '#ffffff' : '#2d3436',
    },
    text: {
      primary: mode === 'light' ? '#2c3e50' : '#dfe6e9',
      secondary: mode === 'light' ? '#7f8c8d' : '#b2bec3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 4px 6px rgba(0,0,0,0.1)'
            : '0 4px 6px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light'
            ? '0 2px 4px rgba(0,0,0,0.1)'
            : '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' 
            ? 'rgba(44, 62, 80, 0.1)'
            : 'rgba(52, 152, 219, 0.2)',
        },
      },
    },
  },
});

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: 'background.default',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Navbar>
              <IconButton 
                onClick={toggleColorMode} 
                color="inherit"
                sx={{ ml: 2 }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Navbar>
            <Container 
              maxWidth="xl" 
              sx={{ 
                mt: 4, 
                mb: 4,
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Routes>
                <Route path="/" element={<MovieList />} />
                <Route path="/movies" element={<MovieList />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
