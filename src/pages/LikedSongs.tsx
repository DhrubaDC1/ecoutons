import React from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { useAudio } from '../context/AudioContext';
import FavoriteIcon from '@mui/icons-material/Favorite';

const LikedSongs: React.FC = () => {
  const { likedSongs, playTrack, currentTrack, toggleLike } = useAudio();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, mb: 4, p: 3, background: 'linear-gradient(transparent 0, rgba(0,0,0,0.5) 100%), #5038a0' }}>
        <Box sx={{ width: 232, height: 232, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 5 }}>
          <FavoriteIcon sx={{ fontSize: 80, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="caption" fontWeight="bold">PLAYLIST</Typography>
          <Typography variant="h2" fontWeight="900" sx={{ my: 1 }}>Liked Songs</Typography>
          <Typography variant="subtitle2">{likedSongs.length} songs</Typography>
        </Box>
      </Box>

      <List>
        {likedSongs.map((track, index) => (
          <ListItem 
            key={track.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => toggleLike(track)}>
                <FavoriteIcon color="primary" />
              </IconButton>
            }
            sx={{ 
              borderRadius: 2, 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              cursor: 'pointer'
            }}
            onClick={() => playTrack(track)}
          >
            <Typography variant="body2" sx={{ width: 30, color: 'text.secondary' }}>{index + 1}</Typography>
            <ListItemAvatar>
              <Avatar src={track.cover} variant="rounded" />
            </ListItemAvatar>
            <ListItemText 
              primary={
                <Typography color={currentTrack?.id === track.id ? 'primary' : 'text.primary'}>
                  {track.title}
                </Typography>
              }
              secondary={track.artist} 
            />
            <Typography variant="caption" color="text.secondary">
              {Math.floor(track.duration / 60)}:{Math.floor(track.duration % 60).toString().padStart(2, '0')}
            </Typography>
          </ListItem>
        ))}
        {likedSongs.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Songs you like will appear here</Typography>
          </Box>
        )}
      </List>
    </Box>
  );
};

export default LikedSongs;
