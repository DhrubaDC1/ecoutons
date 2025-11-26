import React from 'react';
import { Box } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import type { Playlist } from '../data/tracks';

interface PlaylistThumbnailProps {
  playlist: Playlist;
  sx?: any;
}

const PlaylistThumbnail: React.FC<PlaylistThumbnailProps> = ({ playlist, sx = {} }) => {
  // 1. Custom Cover
  if (playlist.cover) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '100%', 
          ...sx 
        }}
      >
        <img 
          src={playlist.cover} 
          alt={playlist.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
        />
      </Box>
    );
  }

  const tracksWithCovers = playlist.tracks.filter(t => t.cover);

  // 2. Empty Playlist
  if (tracksWithCovers.length === 0) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '100%', 
          bgcolor: 'grey.900', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...sx 
        }}
      >
        <MusicNoteIcon sx={{ fontSize: '40%', color: 'grey.700' }} />
      </Box>
    );
  }

  // 3. Less than 4 songs (show first song's cover)
  if (tracksWithCovers.length < 4) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '100%', 
          ...sx 
        }}
      >
        <img 
          src={tracksWithCovers[0].cover} 
          alt={playlist.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
        />
      </Box>
    );
  }

  // 4. 4 or more songs (show 2x2 grid)
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexWrap: 'wrap',
        ...sx 
      }}
    >
      {tracksWithCovers.slice(0, 4).map((track) => (
        <Box 
          key={track.id} 
          sx={{ 
            width: '50%', 
            height: '50%' 
          }}
        >
          <img 
            src={track.cover} 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
          />
        </Box>
      ))}
    </Box>
  );
};

export default PlaylistThumbnail;
