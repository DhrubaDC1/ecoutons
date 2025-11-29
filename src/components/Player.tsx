import React from 'react';
import { Box, Typography, IconButton, Slider, Stack } from '@mui/material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import GlassCard from './GlassCard';
import { useAudio } from '../context/AudioContext';
import QueueList from './QueueList';

import FullScreenPlayer from './FullScreenPlayer';

const Player: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrev, volume, setVolume, currentTime, seekTo, duration } = useAudio();
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [isQueueOpen, setIsQueueOpen] = React.useState(false);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (_: Event, newValue: number | number[]) => {
    seekTo(newValue as number);
  };

  if (!currentTrack) {
    return (
      <GlassCard 
        sx={{ 
          height: 90, 
          width: '100%', 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          borderRadius: 0, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          zIndex: 1000
        }}
      >
        <Typography variant="body2" color="text.secondary">Select a track to start listening</Typography>
      </GlassCard>
    );
  }

  return (
    <>
      <GlassCard 
        sx={{ 
          height: 90, 
          width: { xs: '100%', md: 'calc(100% - 240px)' },
          position: 'fixed', 
          bottom: 0, 
          left: { xs: 0, md: 240 },
          right: 0, 
          borderRadius: 0, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          zIndex: 1000
        }}
      >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: { xs: '60%', md: '30%' }, 
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 }
        }}
        onClick={() => setIsFullScreen(true)}
      >
        <Box 
          component="img"
          src={currentTrack.cover}
          alt={currentTrack.title}
          sx={{ width: { xs: 40, md: 56 }, height: { xs: 40, md: 56 }, borderRadius: 1, mr: 2, objectFit: 'cover' }}
        />
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle1" noWrap sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>{currentTrack.title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{currentTrack.artist}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: { xs: '40%', md: '40%' } }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton color="inherit" onClick={playPrev} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}><SkipPreviousIcon /></IconButton>
          <IconButton color="primary" onClick={togglePlay} sx={{ fontSize: 'large' }}>
            {isPlaying ? <PauseCircleFilledIcon sx={{ fontSize: { xs: 32, md: 40 } }} /> : <PlayCircleFilledWhiteIcon sx={{ fontSize: { xs: 32, md: 40 } }} />}
          </IconButton>
          <IconButton color="inherit" onClick={playNext}><SkipNextIcon /></IconButton>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', display: { xs: 'none', md: 'flex' } }}>
          <Typography variant="caption">{formatTime(currentTime)}</Typography>
          <Slider 
            size="small" 
            value={currentTime} 
            max={duration || 100}
            onChange={handleSeek}
            sx={{ 
              color: 'white',
              '& .MuiSlider-thumb': {
                width: 0,
                height: 0,
                transition: '0.2s',
              },
              '&:hover .MuiSlider-thumb': {
                width: 12,
                height: 12,
              }
            }} 
          />
          <Typography variant="caption">{formatTime(duration)}</Typography>
        </Stack>
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', width: '30%', justifyContent: 'flex-end' }}>
        <IconButton onClick={() => setIsQueueOpen(true)} color="inherit" sx={{ mr: 2 }}>
          <QueueMusicIcon />
        </IconButton>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: 150 }}>
          <VolumeUpIcon />
          <Slider 
            size="small" 
            value={volume} 
            onChange={(_, value) => setVolume(value as number)}
            sx={{ color: 'white' }} 
          />
        </Stack>
      </Box>
      </GlassCard>

      <FullScreenPlayer open={isFullScreen} onClose={() => setIsFullScreen(false)} />
      <QueueList open={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
};

export default Player;
