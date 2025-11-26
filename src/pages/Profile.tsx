import React, { useState, useRef } from 'react';
import { Box, Typography, TextField, Button, Avatar, Stack, Switch, FormControlLabel, Alert } from '@mui/material';
import { updatePassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const Profile: React.FC = () => {
  const { user, updateProfile, exportUserData, deleteAccount, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ name, email });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };



// ... inside component ...

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    if (!auth.currentUser) return;

    try {
      await updatePassword(auth.currentUser, password);
      setPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password changed successfully' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to change password. You may need to re-login.' });
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>Account Settings</Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Profile Info */}
        <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
          <GlassCard sx={{ textAlign: 'center', p: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar 
                src={user.avatar} 
                alt={user.name}
                sx={{ width: 120, height: 120, mx: 'auto', border: '4px solid #E50914' }}
              />
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <Button
                size="small"
                variant="contained"
                sx={{ position: 'absolute', bottom: 0, right: 0, minWidth: 'auto', p: 1, borderRadius: '50%' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <CloudUploadIcon fontSize="small" />
              </Button>
            </Box>
            <Typography variant="h6" fontWeight="bold">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Typography variant="caption" display="block" mt={1} color="text.secondary">
              Joined: {new Date(user.joinedAt).toLocaleDateString()}
            </Typography>
            
            <Button variant="outlined" color="error" sx={{ mt: 3 }} onClick={logout}>
              Log Out
            </Button>
          </GlassCard>
        </Box>

        {/* Edit Details */}
        <Box sx={{ flexGrow: 1 }}>
          <Stack spacing={3}>
            <GlassCard>
              <Typography variant="h6" mb={2}>Edit Profile</Typography>
              <Stack spacing={2}>
                <TextField 
                  label="Display Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  fullWidth 
                  sx={{ input: { color: 'white' } }}
                />
                <TextField 
                  label="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  fullWidth 
                  sx={{ input: { color: 'white' } }}
                />
                <Button variant="contained" onClick={handleUpdateProfile}>Save Changes</Button>
              </Stack>
            </GlassCard>

            <GlassCard>
              <Typography variant="h6" mb={2}>Change Password</Typography>
              <Stack spacing={2}>
                <TextField 
                  label="New Password" 
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  fullWidth 
                  sx={{ input: { color: 'white' } }}
                />
                <TextField 
                  label="Confirm Password" 
                  type="password"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  fullWidth 
                  sx={{ input: { color: 'white' } }}
                />
                <Button variant="contained" onClick={handleChangePassword}>Update Password</Button>
              </Stack>
            </GlassCard>

            <GlassCard>
              <Typography variant="h6" mb={2}>Preferences</Typography>
              <Stack spacing={1}>
                <FormControlLabel 
                  control={<Switch defaultChecked={user.preferences.contentFilter} />} 
                  label="Explicit Content Filter" 
                />
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Email Notifications" 
                />
              </Stack>
            </GlassCard>

            <GlassCard>
              <Typography variant="h6" mb={2} color="error">Danger Zone</Typography>
              <Stack spacing={2} direction="row">
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  onClick={exportUserData}
                >
                  Download My Data
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<DeleteForeverIcon />}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      deleteAccount();
                    }
                  }}
                >
                  Delete Account
                </Button>
              </Stack>
            </GlassCard>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default Profile;
