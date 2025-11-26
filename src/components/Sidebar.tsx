import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AddBoxIcon from '@mui/icons-material/AddBox';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

import ThemeSelector from './ThemeSelector';

import { Avatar, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createPlaylist, playlists } = useAudio();
  const { user } = useAuth();

  const handleCreatePlaylist = () => {
    const name = `My Playlist #${playlists.length + 1}`;
    createPlaylist(name);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', gap: 2, overflowX: 'hidden' }}>
      <Box sx={{ px: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box onClick={() => handleNavigation('/')} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="img" src="/logo.png" sx={{ height: 32, width: 32 }} />
          <Typography variant="h5" color="primary" fontWeight="bold">
            Ecoutons
          </Typography>
        </Box>
        <ThemeSelector />
      </Box>

      {/* User Profile Snippet */}
      {user ? (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            px: 2, 
            py: 1, 
            mb: 1, 
            borderRadius: 2, 
            bgcolor: 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
          onClick={() => handleNavigation('/profile')}
        >
          <Avatar src={user.avatar} alt={user.name} sx={{ width: 32, height: 32 }} />
          <Typography variant="subtitle2" noWrap>{user.name}</Typography>
        </Box>
      ) : (
        <Button 
          variant="outlined" 
          startIcon={<PersonIcon />} 
          onClick={() => handleNavigation('/login')}
          sx={{ mb: 2, mx: 2 }}
        >
          Log In
        </Button>
      )}
      
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            sx={{ borderRadius: 2, bgcolor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            onClick={() => handleNavigation('/')}
          >
            <ListItemIcon><HomeIcon color={isActive('/') ? "primary" : "inherit"} /></ListItemIcon>
            <ListItemText primary="Home" primaryTypographyProps={{ color: isActive('/') ? "primary" : "inherit" }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            sx={{ borderRadius: 2, bgcolor: isActive('/search') ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            onClick={() => handleNavigation('/search')}
          >
            <ListItemIcon><SearchIcon color={isActive('/search') ? "primary" : "inherit"} /></ListItemIcon>
            <ListItemText primary="Search" primaryTypographyProps={{ color: isActive('/search') ? "primary" : "inherit" }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            sx={{ borderRadius: 2, bgcolor: isActive('/library') ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            onClick={() => handleNavigation('/library')}
          >
            <ListItemIcon><LibraryMusicIcon color={isActive('/library') ? "primary" : "inherit"} /></ListItemIcon>
            <ListItemText primary="Your Library" primaryTypographyProps={{ color: isActive('/library') ? "primary" : "inherit" }} />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ mt: 2 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2 }} onClick={handleCreatePlaylist}>
              <ListItemIcon><AddBoxIcon color="inherit" /></ListItemIcon>
              <ListItemText primary="Create Playlist" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              sx={{ borderRadius: 2, bgcolor: isActive('/liked') ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              onClick={() => handleNavigation('/liked')}
            >
              <ListItemIcon><FavoriteIcon color="error" /></ListItemIcon>
              <ListItemText primary="Liked Songs" primaryTypographyProps={{ color: isActive('/liked') ? "primary" : "inherit" }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />

      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <List dense>
          {playlists.map((playlist) => (
            <ListItem key={playlist.id} disablePadding>
              <ListItemButton 
                sx={{ borderRadius: 1 }}
                onClick={() => handleNavigation(`/playlist/${playlist.id}`)}
              >
                <ListItemText primary={playlist.name} primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.9rem' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
