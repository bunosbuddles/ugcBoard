// src/components/Auth/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../contexts/AuthContext';

const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(2)
}));

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 450,
  width: '100%',
  boxShadow: theme.shadows[3]
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(3)
}));

const LockIcon = styled(Paper)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.main,
  color: 'white'
}));

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, clearError, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    clearError();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    clearError();
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!username.trim() || !password.trim()) {
      return;
    }
    
    // Attempt login
    const success = await login(username, password);
    
    // Redirect on successful login
    if (success) {
      navigate('/');
    }
  };

  return (
    <LoginContainer>
      <StyledCard>
        <CardContent sx={{ p: 4 }}>
          <IconContainer>
            <LockIcon>
              <LockOutlinedIcon fontSize="large" />
            </LockIcon>
          </IconContainer>
          
          <Typography variant="h5" align="center" gutterBottom>
            UGC Agency Dashboard
          </Typography>
          
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 4 }}>
            Sign in to access your dashboard
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={handleUsernameChange}
              required
              autoFocus
            />
            
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            {/* Sign Up Button */}
            <Button
              component={Link}
              to="/register"
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Don't have an account? Sign Up
            </Button>
          </form>
        </CardContent>
      </StyledCard>
    </LoginContainer>
  );
};

export default LoginPage;