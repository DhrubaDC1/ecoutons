import React from 'react';
import { Box, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useAudio } from '../context/AudioContext';

interface QueueListProps {
  open: boolean;
  onClose: () => void;
}

const QueueList: React.FC<QueueListProps> = ({ open, onClose }) => {
  const { queue, removeFromQueue, clearQueue, playTrack } = useAudio();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          bgcolor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          color: 'white'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h6" fontWeight="bold">Queue</Typography>
        <IconButton onClick={onClose} color="inherit">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        {queue.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
            <Typography>Your queue is empty</Typography>
            <Typography variant="caption">Add songs to play next</Typography>
          </Box>
        ) : (
          <List>
            {queue.map((track, index) => (
              <ListItem
                key={`${track.id}-${index}`}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => removeFromQueue(index)} size="small" sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'error.main' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={track.cover} variant="rounded" sx={{ width: 40, height: 40 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={track.title}
                  secondary={track.artist}
                  primaryTypographyProps={{ noWrap: true, variant: 'body2', fontWeight: 500 }}
                  secondaryTypographyProps={{ noWrap: true, variant: 'caption', color: 'rgba(255,255,255,0.7)' }}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => playTrack(track)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {queue.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<ClearAllIcon />}
            onClick={clearQueue}
          >
            Clear Queue
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default QueueList;
