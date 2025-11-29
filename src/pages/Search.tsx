import React, { useState } from 'react';
import { Box, Typography, InputBase, Grid, IconButton, CircularProgress, Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import GlassCard from '../components/GlassCard';
import { type Track } from '../data/tracks';
import { useAudio } from '../context/AudioContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { searchTracks } from '../services/api';
import { getMoodSongs } from '../services/gemini';
import AddToPlaylistDialog from '../components/AddToPlaylistDialog';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [moodQuery, setMoodQuery] = useState('');
  const [isMoodSearch, setIsMoodSearch] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { playTrack, currentTrack, toggleLike, likedSongs, addToQueue } = useAudio();
  
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

  const handleAddToQueue = () => {
    if (selectedTrack) {
      addToQueue(selectedTrack);
      setAnchorEl(null);
    }
  };

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


  const handleMoodSearch = async () => {
    if (!moodQuery.trim()) return;
    
    setLoading(true);
    setIsMoodSearch(true);
    setResults([]);
    
    try {
      const suggestedSongs = await getMoodSongs(moodQuery);
      console.log("Gemini suggestions:", suggestedSongs);
      
      const searchPromises = suggestedSongs.map(song => searchTracks(song));
      const searchResults = await Promise.all(searchPromises);
      
      // Flatten and take first result from each search
      const tracks = searchResults
        .map(res => res[0])
        .filter(track => track !== undefined);
        
      setResults(tracks);
    } catch (error) {
      console.error("Mood search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setMoodQuery('');
    setIsMoodSearch(false);
    setResults([]);
  };

  const categories = [
    { color: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', title: 'Pop', textColor: '#000' },
    { color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', title: 'Hip-Hop', textColor: '#000' },
    { color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', title: 'Rock', textColor: '#000' },
    { color: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', title: 'Indie', textColor: '#000' },
    { color: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)', title: 'Latin', textColor: '#fff' },
    { color: 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)', title: 'Charts', textColor: '#000' },
    { color: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', title: 'Mood', textColor: '#000' },
    { color: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', title: 'Party', textColor: '#fff' },
  ];

  const handleCategoryClick = async (category: string) => {
    setQuery(category);
    setLoading(true);
    try {
      const data = await searchTracks(category);
      setResults(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* Apple-style Large Header */}
      <Typography variant="h2" fontWeight="bold" sx={{ mb: 4, letterSpacing: '-0.02em' }}>
        Search
      </Typography>

      {/* Glassmorphic Search Bar */}
      <Box sx={{ mb: 6, position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            p: '12px 24px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            '&:focus-within': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              transform: 'scale(1.01)'
            }
          }}
        >
          <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)', mr: 2, fontSize: 32 }} />
          <InputBase
            fullWidth
            placeholder="Artists, Songs, Lyrics, and more"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            sx={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 500,
              '& ::placeholder': {
                color: 'rgba(255,255,255,0.5)',
                opacity: 1
              }
            }}
          />
          {query && (
            <IconButton onClick={handleClear} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <ClearIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Mood Search Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: 'secondary.main' }} />
          Find songs for your mood
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <InputBase
            fullWidth
            placeholder="How are you feeling? (e.g., 'Rainy day jazz', 'High energy workout')"
            value={moodQuery}
            onChange={(e) => setMoodQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleMoodSearch()}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              p: '10px 20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              flexGrow: 1,
              '&:focus-within': {
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }
            }}
          />
          <IconButton 
            onClick={handleMoodSearch}
            sx={{ 
              bgcolor: 'secondary.main', 
              color: 'white',
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: 'secondary.dark' },
              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
            disabled={loading || !moodQuery.trim()}
          >
            <AutoAwesomeIcon />
          </IconButton>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress color="inherit" size={60} thickness={2} />
        </Box>
      )}

      {results.length > 0 ? (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Top Results</Typography>
          <Grid container spacing={3}>
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
                    overflow: 'hidden',
                    '&:hover .action-buttons': { opacity: 1 }
                  }}
                  onClick={() => playTrack(track)}
                >
                  <Box 
                    component="img"
                    src={track.cover}
                    alt={track.title}
                    sx={{ width: 100, height: 100, objectFit: 'cover' }} 
                  />
                  <Box sx={{ ml: 2.5, flexGrow: 1, overflow: 'hidden', py: 2, pr: 12 }}>
                    <Typography variant="h6" noWrap sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 0.5 }}>{track.title}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{track.artist}</Typography>
                  </Box>
                  
                  <Box 
                    className="action-buttons"
                    sx={{ 
                      position: 'absolute', 
                      right: 16, 
                      opacity: currentTrack?.id === track.id ? 1 : 0, 
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton 
                      onClick={() => toggleLike(track)}
                      sx={{ 
                        color: isLiked(track.id) ? '#E91429' : 'white',
                        bgcolor: 'rgba(0,0,0,0.3)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
                      }}
                    >
                      {isLiked(track.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, track)}
                      sx={{ 
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.3)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        !loading && (
          <>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Browse Categories</Typography>
            <Grid container spacing={3}>
              {categories.map((cat) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={cat.title}>
                  <GlassCard 
                    hoverEffect 
                    onClick={() => handleCategoryClick(cat.title)}
                    sx={{ 
                      height: 200, 
                      background: cat.color, 
                      position: 'relative', 
                      overflow: 'hidden',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      p: 3,
                      cursor: 'pointer'
                    }}
                  >
                    <Typography variant="h5" fontWeight="900" sx={{ color: cat.textColor, zIndex: 2 }}>
                      {cat.title}
                    </Typography>
                    
                    {/* Decorative Circle */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: -20, 
                        right: -20, 
                        width: 120, 
                        height: 120, 
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        transform: 'rotate(25deg)',
                      }} 
                    />
                  </GlassCard>
                </Grid>
              ))}
            </Grid>
          </>
        )
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleAddToQueue}>Add to Queue</MenuItem>
        <MenuItem onClick={handleAddToPlaylistClick}>Add to Playlist</MenuItem>
      </Menu>

      <AddToPlaylistDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        track={selectedTrack} 
      />
    </Box>
  );
};

export default Search;
