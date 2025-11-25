import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Grid, IconButton, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GlassCard from '../components/GlassCard';
import { type Track } from '../data/tracks';
import { useAudio } from '../context/AudioContext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { searchTracks } from '../services/api';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { playTrack, currentTrack, isPlaying, toggleLike, likedSongs } = useAudio();

  const isLiked = (trackId: number | string) => likedSongs.some(t => t.id === trackId);

  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      setLoading(true);
      try {
        const data = await searchTracks(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const categories = [
    { color: '#E91429', title: 'Pop' },
    { color: '#27856A', title: 'Hip-Hop' },
    { color: '#1E3264', title: 'Rock' },
    { color: '#8D67AB', title: 'Indie' },
    { color: '#E8115B', title: 'Latin' },
    { color: '#148A08', title: 'Charts' },
    { color: '#503750', title: 'Mood' },
    { color: '#B02897', title: 'Party' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="What do you want to listen to? (Press Enter)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.primary' }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: 'white',
              borderRadius: 5,
              color: 'black',
              '& .MuiInputBase-input': { p: 1.5 }
            }
          }}
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {results.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Top Results</Typography>
          <Grid container spacing={2}>
            {results.map((track) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={track.id}>
                <GlassCard 
                  hoverEffect 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 0, 
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover .action-buttons': {
                      opacity: 1
                    }
                  }}
                  onClick={() => playTrack(track)}
                >
                  <Box 
                    component="img"
                    src={track.cover}
                    alt={track.title}
                    sx={{ width: 80, height: 80, objectFit: 'cover' }} 
                  />
                  <Box sx={{ ml: 2, flexGrow: 1, overflow: 'hidden' }}>
                    <Typography variant="h6" noWrap sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{track.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{track.artist}</Typography>
                  </Box>
                  
                  <Box 
                    className="action-buttons"
                    sx={{ 
                      position: 'absolute', 
                      right: 8, 
                      opacity: currentTrack?.id === track.id ? 1 : 0, 
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton 
                      size="small" 
                      onClick={() => toggleLike(track)}
                      color={isLiked(track.id) ? "primary" : "default"}
                    >
                      {isLiked(track.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        borderRadius: '50%',
                        p: 1,
                        boxShadow: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                      onClick={() => playTrack(track)}
                    >
                      {currentTrack?.id === track.id && isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </Box>
                  </Box>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Browse all</Typography>
      <Grid container spacing={2}>
        {categories.map((cat) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={cat.title}>
            <GlassCard 
              hoverEffect 
              sx={{ 
                height: 180, 
                bgcolor: cat.color, 
                position: 'relative', 
                overflow: 'hidden',
                border: 'none'
              }}
            >
              <Typography variant="h5" fontWeight="bold">{cat.title}</Typography>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: -10, 
                  right: -10, 
                  width: 100, 
                  height: 100, 
                  bgcolor: 'rgba(0,0,0,0.2)', 
                  transform: 'rotate(25deg)',
                  borderRadius: 2
                }} 
              />
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Search;
