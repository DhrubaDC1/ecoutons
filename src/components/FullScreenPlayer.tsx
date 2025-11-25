import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Slider, Stack } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAudio } from '../context/AudioContext';
import GlassCard from './GlassCard';

interface FullScreenPlayerProps {
  open: boolean;
  onClose: () => void;
}

const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({ open, onClose }) => {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrev, volume, setVolume, progress, setProgress, duration, toggleLike, likedSongs } = useAudio();
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(20).fill(10));

  const isLiked = currentTrack ? likedSongs.some(t => t.id === currentTrack.id) : false;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Simulated Visualizer Animation
  useEffect(() => {
    let interval: any;
    if (open && isPlaying) {
      interval = setInterval(() => {
        setVisualizerBars(prev => prev.map(() => Math.random() * 80 + 20));
      }, 100);
    } else {
      setVisualizerBars(new Array(20).fill(10));
    }
    return () => clearInterval(interval);
  }, [open, isPlaying]);

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1300,
            background: '#000',
            overflow: 'hidden'
          }}
        >
          {/* Background Blur */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${currentTrack.cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(80px) brightness(0.4)',
              zIndex: -1
            }}
          />

          {/* Simulated Visualizer Layer */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              width: '100%',
              height: '400px',
              zIndex: 0,
              opacity: 0.5
            }}
          >
            {visualizerBars.map((height, index) => (
              <motion.div
                key={index}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{
                  width: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                }}
              />
            ))}
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4
            }}
          >
            {/* Close Button */}
            <IconButton 
              onClick={onClose} 
              sx={{ position: 'absolute', top: 40, left: 40, color: 'white' }}
            >
              <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
            </IconButton>

            {/* Album Art */}
            <GlassCard
              sx={{
                width: { xs: 280, md: 400 },
                height: { xs: 280, md: 400 },
                p: 0,
                mb: 6,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}
            >
              <Box
                component="img"
                src={currentTrack.cover}
                alt={currentTrack.title}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </GlassCard>

            {/* Track Info */}
            <Box sx={{ textAlign: 'center', mb: 4, width: '100%', maxWidth: 600 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                  <Typography variant="h4" fontWeight="bold" noWrap>{currentTrack.title}</Typography>
                  <Typography variant="h6" color="text.secondary" noWrap>{currentTrack.artist}</Typography>
                </Box>
                <IconButton onClick={() => toggleLike(currentTrack)} color={isLiked ? "primary" : "default"}>
                  {isLiked ? <FavoriteIcon sx={{ fontSize: 32 }} /> : <FavoriteBorderIcon sx={{ fontSize: 32 }} />}
                </IconButton>
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
              <Slider
                value={progress}
                max={duration || 100}
                onChange={(_, value) => setProgress(value as number)}
                sx={{
                  color: 'white',
                  height: 4,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    transition: '0.2s',
                    '&:hover, &.Mui-active': {
                      boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)',
                    },
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.28,
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">{formatTime(progress)}</Typography>
                <Typography variant="caption" color="text.secondary">{formatTime(duration)}</Typography>
              </Box>
            </Box>

            {/* Controls */}
            <Stack direction="row" spacing={4} alignItems="center" sx={{ mb: 6 }}>
              <IconButton color="inherit" onClick={playPrev} size="large">
                <SkipPreviousIcon sx={{ fontSize: 48 }} />
              </IconButton>
              <IconButton 
                color="primary" 
                onClick={togglePlay} 
                sx={{ 
                  bgcolor: 'white', 
                  color: 'black',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' },
                  p: 2
                }}
              >
                {isPlaying ? <PauseCircleFilledIcon sx={{ fontSize: 56 }} /> : <PlayCircleFilledWhiteIcon sx={{ fontSize: 56 }} />}
              </IconButton>
              <IconButton color="inherit" onClick={playNext} size="large">
                <SkipNextIcon sx={{ fontSize: 48 }} />
              </IconButton>
            </Stack>

            {/* Volume */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', maxWidth: 300 }}>
              <VolumeUpIcon color="action" />
              <Slider
                value={volume}
                onChange={(_, value) => setVolume(value as number)}
                sx={{ color: 'white' }}
              />
            </Stack>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenPlayer;
