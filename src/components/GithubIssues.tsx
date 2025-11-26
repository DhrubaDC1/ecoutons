import React, { useState } from 'react';
import { Box, Fab, Paper, Typography, List, ListItem, ListItemText, ListItemIcon, CircularProgress, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { fetchIssues, type Issue } from '../services/github';

const GithubIssues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
    if (!fetched && !loading) {
      setLoading(true);
      fetchIssues().then(data => {
        setIssues(data);
        setLoading(false);
        setFetched(true);
      });
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 120,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {hovered && (
        <Paper
          elevation={4}
          sx={{
            mb: 2,
            width: 300,
            maxHeight: 400,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(0,0,0,0.2)' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Active Issues
            </Typography>
          </Box>
          
          <Box sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: 340 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : issues.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No open issues found.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {issues.slice(0, 5).map((issue) => (
                  <ListItem 
                    key={issue.id} 
                    component="a" 
                    href={issue.html_url} 
                    target="_blank"
                    sx={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {issue.state === 'open' ? (
                        <ErrorOutlineIcon color="error" fontSize="small" />
                      ) : (
                        <CheckCircleOutlineIcon color="success" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={issue.title}
                      primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                      secondary={`#${issue.number} opened by ${issue.user.login}`}
                      secondaryTypographyProps={{ variant: 'caption', fontSize: '0.7rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          
          <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', bgcolor: 'rgba(0,0,0,0.2)' }}>
            <Link 
              href="https://github.com/DhrubaDC1/ecoutons/issues" 
              target="_blank" 
              underline="hover" 
              variant="caption"
              color="primary"
            >
              View all issues on GitHub
            </Link>
          </Box>
        </Paper>
      )}

      <Fab
        color="primary"
        aria-label="github"
        component="a"
        href="https://github.com/DhrubaDC1/ecoutons/issues"
        target="_blank"
        sx={{
          bgcolor: 'black',
          color: 'white',
          '&:hover': {
            bgcolor: '#333',
          },
        }}
      >
        <GitHubIcon />
      </Fab>
    </Box>
  );
};

export default GithubIssues;
