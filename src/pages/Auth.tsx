import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signup(email, password, name);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #111 0%, #000 100%)'
      }}
    >
      <GlassCard sx={{ width: '100%', maxWidth: 400, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom color="primary">
          Ecoutons
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 3 }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {!isLogin && (
              <TextField
                label="Display Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
              />
            )}
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ input: { color: 'white' }, label: { color: 'gray' } }}
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              fullWidth 
              disabled={loading}
              sx={{ mt: 2, fontWeight: 'bold' }}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
            </Button>
          </Stack>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Button 
              color="primary" 
              onClick={() => setIsLogin(!isLogin)}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </Button>
          </Typography>
        </Box>
      </GlassCard>
    </Box>
  );
};

export default Auth;
