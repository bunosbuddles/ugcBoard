// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Layout Components
import MainLayout from './components/Layouts/MainLayout';

// Pages
import Dashboard from './components/Dashboard/Dashboard';
import DealsPage from './components/Deals/DealsPage';
import DealDetails from './components/Deals/DealDetails';
import DocumentsPage from './components/Documents/DocumentsPage';
import DocumentUpload from './components/Documents/DocumentUpload';
import ProfilePage from './components/Profile/ProfilePage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Create theme with the specified color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#2d523a', // Dark green
    },
    secondary: {
      main: '#a4b69d', // Light green
    },
    background: {
      default: '#e8e4db', // Cream
      paper: '#ffffff',   // White
    },
    text: {
      primary: '#2d523a', // Dark green for text
      secondary: '#666666',
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="deals" element={<DealsPage />} />
              <Route path="deals/:id" element={<DealDetails />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="documents/upload" element={<DocumentUpload />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;