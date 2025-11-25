import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { playlists } = useAudio();
  
  const playlist = playlists.find(p => p.id === Number(id));

  if (!playlist) {
    return <Typography>Playlist not found</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, mb: 4, p: 3, bgcolor: '#282828' }}>
        <Box sx={{ width: 232, height: 232, bgcolor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 5 }}>
          <MusicNoteIcon sx={{ fontSize: 80, color: 'grey.500' }} />
        </Box>
        <Box>
          <Typography variant="caption" fontWeight="bold">PLAYLIST</Typography>
          <Typography variant="h2" fontWeight="900" sx={{ my: 1 }}>{playlist.name}</Typography>
          <Typography variant="subtitle2">{playlist.tracks.length} songs</Typography>
        </Box>
      </Box>

      <List>
        {playlist.tracks.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">This playlist is empty</Typography>
          </Box>
        ) : (
          playlist.tracks.map((track, index) => (
            <ListItem key={track.id}>
              <Typography variant="body2" sx={{ width: 30, color: 'text.secondary' }}>{index + 1}</Typography>
              <ListItemAvatar>
                <Avatar src={track.cover} variant="rounded" />
              </ListItemAvatar>
              <ListItemText primary={track.title} secondary={track.artist} />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default Playlist;
