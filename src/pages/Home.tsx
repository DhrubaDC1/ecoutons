import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, IconButton, Menu, MenuItem } from '@mui/material';
import GlassCard from '../components/GlassCard';
import { type Track } from '../data/tracks';
import { useAudio } from '../context/AudioContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { fetchTrendingMusic, searchTracks } from '../services/api';
import { getRecommendations } from '../services/gemini';
import AddToPlaylistDialog from '../components/AddToPlaylistDialog';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Track[]>([]);
  const [recommended, setRecommended] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, toggleLike, likedSongs, history } = useAudio();
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, track: Track) => {
    setAnchorEl(event.currentTarget);
    setSelectedTrack(track);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTrack(null);
  };

  const handleAddToPlaylistClick = () => {
    setAnchorEl(null);
    setDialogOpen(true);
  };

  const isLiked = (trackId: number | string) => likedSongs.some(t => t.id === trackId);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Trending
        const trendingData = await fetchTrendingMusic();
        setTrending(trendingData);

        // Load Recommendations based on history
        if (history.length > 0) {
          try {
            const suggestions = await getRecommendations(history);
            console.log("Gemini Recommendations:", suggestions);
            
            if (suggestions.length > 0) {
              const searchPromises = suggestions.map(song => searchTracks(song));
              const searchResults = await Promise.all(searchPromises);
              
              const tracks = searchResults
                .map(res => res[0])
                .filter(track => track !== undefined);
                
              // Filter out songs already in history
              const historyIds = new Set(history.map(h => h.id));
              setRecommended(tracks.filter(t => !historyIds.has(t.id)));
            }
          } catch (err) {
            console.error("Failed to get AI recommendations", err);
          }
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [history.length]); // Re-run if history length changes significantly

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const renderTrackList = (tracks: Track[], title: string) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>{title}</Typography>
      <Grid container spacing={2}>
        {tracks.map((track) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={track.id}>
            <GlassCard 
              hoverEffect 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 0, 
                width: '100%',
                height: 80,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
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
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, track)}
                  sx={{ color: 'white' }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleAddToPlaylistClick}>Add to Playlist</MenuItem>
      </Menu>

      <AddToPlaylistDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        track={selectedTrack} 
      />
    </Box>
  );

  return (
    <Box>
      {/* Recently Played */}
      {history.length > 0 && renderTrackList(history.slice(0, 4), "Recently Played")}

      {/* Recommended */}
      {recommended.length > 0 && renderTrackList(recommended, "Recommended for You")}

      {/* Trending */}
      {renderTrackList(trending, "Trending Now")}
    </Box>
  );
};

export default Home;
