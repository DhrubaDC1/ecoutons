import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import GlassCard from '../components/GlassCard';
import { useAudio } from '../context/AudioContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useNavigate } from 'react-router-dom';

const Library: React.FC = () => {
  const { playlists, likedSongs } = useAudio();
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Your Library</Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Liked Songs Card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GlassCard 
            hoverEffect 
            sx={{ 
              height: 250, 
              background: 'linear-gradient(135deg, #450af5 0%, #c4efd9 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/liked')}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" fontWeight="bold">Liked Songs</Typography>
              <Typography variant="subtitle1">{likedSongs.length} liked songs</Typography>
            </Box>
            <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
               <FavoriteIcon sx={{ fontSize: 40 }} />
            </Box>
          </GlassCard>
        </Grid>

        {/* Playlists */}
        {playlists.map((playlist) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={playlist.id}>
            <GlassCard 
              hoverEffect 
              sx={{ 
                height: 250, 
                bgcolor: '#181818',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            >
              <MusicNoteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">{playlist.name}</Typography>
              <Typography variant="caption" color="text.secondary">Playlist</Typography>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Library;
