import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  ListItemIcon, 
  TextField, 
  Button, 
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAudio } from '../context/AudioContext';
import { type Track } from '../data/tracks';

interface AddToPlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  track: Track | null;
}

import PlaylistThumbnail from './PlaylistThumbnail';

const AddToPlaylistDialog: React.FC<AddToPlaylistDialogProps> = ({ open, onClose, track }) => {
  const { playlists, addToPlaylist, createPlaylist } = useAudio();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleAddToPlaylist = (playlistId: string | number) => {
    if (track) {
      addToPlaylist(playlistId, track);
      onClose();
    }
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      // Ideally we'd get the ID of the new playlist and add the track immediately,
      // but for now we'll just close the creation mode and let the user select it.
      // Or we can just close the dialog if we assume it's added to the end.
      // Let's just reset creation mode.
      setIsCreating(false);
      setNewPlaylistName('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add to Playlist</DialogTitle>
      <DialogContent>
        {isCreating ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField 
              autoFocus
              label="Playlist Name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreatePlaylist}>Create</Button>
            </Box>
          </Box>
        ) : (
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setIsCreating(true)}>
                <ListItemIcon><AddIcon /></ListItemIcon>
                <ListItemText primary="New Playlist" />
              </ListItemButton>
            </ListItem>
            {playlists.map((playlist) => (
              <ListItem key={playlist.id} disablePadding>
                <ListItemButton onClick={() => handleAddToPlaylist(playlist.id)}>
                  <ListItemIcon>
                    <Box sx={{ width: 40, height: 40, overflow: 'hidden', borderRadius: 1 }}>
                      <PlaylistThumbnail playlist={playlist} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={playlist.name} 
                    secondary={`${playlist.tracks.length} songs`} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistDialog;
