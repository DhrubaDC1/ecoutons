import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Menu, MenuItem, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, deletePlaylist, removeFromPlaylist, playTrack } = useAudio();
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | number | null>(null);

  const playlist = playlists.find(p => p.id === Number(id) || p.id === id);

  if (!playlist) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Playlist not found</Typography>
        <Button onClick={() => navigate('/library')} sx={{ mt: 2 }}>Back to Library</Button>
      </Box>
    );
  }

  const handleDeletePlaylist = () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(playlist.id);
      navigate('/library');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, trackId: string | number) => {
    setAnchorEl(event.currentTarget);
    setSelectedTrackId(trackId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTrackId(null);
  };

  const handleRemoveTrack = () => {
    if (selectedTrackId) {
      removeFromPlaylist(playlist.id, selectedTrackId);
      handleMenuClose();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, mb: 4, p: 3, bgcolor: '#282828', position: 'relative' }}>
        <Box sx={{ width: 232, height: 232, bgcolor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 5 }}>
          <MusicNoteIcon sx={{ fontSize: 80, color: 'grey.500' }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" fontWeight="bold">PLAYLIST</Typography>
          <Typography variant="h2" fontWeight="900" sx={{ my: 1 }}>{playlist.name}</Typography>
          <Typography variant="subtitle2">{playlist.tracks.length} songs</Typography>
        </Box>
        <IconButton onClick={handleDeletePlaylist} color="error" title="Delete Playlist">
          <DeleteIcon />
        </IconButton>
      </Box>

      <List>
        {playlist.tracks.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">This playlist is empty</Typography>
          </Box>
        ) : (
          playlist.tracks.map((track, index) => (
            <ListItem 
              key={track.id}
              secondaryAction={
                <IconButton edge="end" onClick={(e) => handleMenuOpen(e, track.id)}>
                  <MoreVertIcon />
                </IconButton>
              }
              sx={{ 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                borderRadius: 1
              }}
            >
              <Box 
                sx={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }}
                onClick={() => playTrack(track)}
              >
                <Typography variant="body2" sx={{ width: 30, color: 'text.secondary' }}>{index + 1}</Typography>
                <ListItemAvatar>
                  <Avatar src={track.cover} variant="rounded" />
                </ListItemAvatar>
                <ListItemText primary={track.title} secondary={track.artist} />
              </Box>
            </ListItem>
          ))
        )}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRemoveTrack}>Remove from Playlist</MenuItem>
      </Menu>
    </Box>
  );
};

export default Playlist;
