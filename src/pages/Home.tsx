import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import GlassCard from '../components/GlassCard';
import { type Track } from '../data/tracks';
import { useAudio } from '../context/AudioContext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import { fetchTrendingMusic, searchTracks } from '../services/api';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Track[]>([]);
  const [recommended, setRecommended] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying, toggleLike, likedSongs, history } = useAudio();

  const isLiked = (trackId: number | string) => likedSongs.some(t => t.id === trackId);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Trending
        const trendingData = await fetchTrendingMusic();
        setTrending(trendingData);

        // Load Recommendations based on history
        if (history.length > 0) {
          const artistCounts: Record<string, number> = {};
          history.forEach(track => {
            artistCounts[track.artist] = (artistCounts[track.artist] || 0) + 1;
          });
          
          const topArtist = Object.keys(artistCounts).reduce((a, b) => artistCounts[a] > artistCounts[b] ? a : b);
          
          if (topArtist) {
            const recData = await searchTracks(topArtist);
            // Filter out songs already in history to keep recommendations fresh
            const historyIds = new Set(history.map(h => h.id));
            setRecommended(recData.filter(t => !historyIds.has(t.id)).slice(0, 6));
          }
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [history.length]); // Re-run if history length changes significantly (though usually on mount is enough)

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
