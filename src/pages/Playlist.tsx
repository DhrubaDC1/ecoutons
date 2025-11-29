import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Menu, MenuItem, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';

import PlaylistThumbnail from '../components/PlaylistThumbnail';
import { generatePlaylistCoverPrompt, generateImage } from '../services/gemini';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { CircularProgress } from '@mui/material';

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, deletePlaylist, removeFromPlaylist, playTrack, updatePlaylist, addToQueue } = useAudio();
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | number | null>(null);

  // Edit Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCover, setEditCover] = useState('');
  const [generatingCover, setGeneratingCover] = useState(false);

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

  const handleEditOpen = () => {
    setEditName(playlist.name);
    setEditDescription(playlist.description || '');
    setEditCover(playlist.cover || '');
    setIsEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editName.trim()) {
      updatePlaylist(playlist.id, {
        name: editName,
        description: editDescription,
        cover: editCover
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleGenerateCover = async () => {
    if (playlist.tracks.length === 0) {
      alert("Add some songs to the playlist first!");
      return;
    }
    
    setGeneratingCover(true);
    try {
      const prompt = await generatePlaylistCoverPrompt(playlist.tracks);
      const imageUrl = generateImage(prompt);
      setEditCover(imageUrl);
    } catch (error) {
      console.error("Failed to generate cover", error);
    } finally {
      setGeneratingCover(false);
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

  const handleAddToQueue = () => {
    if (selectedTrackId) {
      const track = playlist.tracks.find(t => t.id === selectedTrackId);
      if (track) {
        addToQueue(track);
      }
      handleMenuClose();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, mb: 4, p: 3, bgcolor: '#282828', position: 'relative' }}>
        <Box sx={{ width: 232, height: 232, bgcolor: '#333', boxShadow: 5, overflow: 'hidden' }}>
          <PlaylistThumbnail playlist={playlist} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" fontWeight="bold">PLAYLIST</Typography>
          <Typography variant="h2" fontWeight="900" sx={{ my: 1 }}>{playlist.name}</Typography>
          {playlist.description && <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>{playlist.description}</Typography>}
          <Typography variant="subtitle2">{playlist.tracks.length} songs</Typography>
        </Box>
        <IconButton onClick={handleEditOpen} title="Edit Details" sx={{ mr: 1 }}>
          <EditIcon />
        </IconButton>
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
        <MenuItem onClick={handleAddToQueue}>Add to Queue</MenuItem>
        <MenuItem onClick={handleRemoveTrack}>Remove from Playlist</MenuItem>
      </Menu>

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Playlist Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
            <TextField
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Cover Image URL"
              value={editCover}
              onChange={(e) => setEditCover(e.target.value)}
              fullWidth
              placeholder="https://example.com/image.jpg"
            />
            <Button 
              startIcon={generatingCover ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
              onClick={handleGenerateCover}
              disabled={generatingCover || playlist.tracks.length === 0}
              variant="outlined"
              color="secondary"
            >
              {generatingCover ? "Dreaming up cover..." : "Generate AI Cover"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Playlist;
