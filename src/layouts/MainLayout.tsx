import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Drawer, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';
import { Outlet } from 'react-router-dom';

import { useAppTheme } from '../context/ThemeContext';

import GithubIssues from '../components/GithubIssues';

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const { gradient } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ bgcolor: 'black', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box component="img" src="/logo.png" sx={{ height: 40, mr: 2 }} />
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <Box
        component="nav"
        sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, bgcolor: 'black' },
          }}
        >
          <Sidebar onClose={() => setMobileOpen(false)} />
        </Drawer>

        {/* Desktop Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, bgcolor: 'black', borderRight: '1px solid rgba(255,255,255,0.1)' },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          pt: { xs: 10, md: 3 }, // Add padding top for mobile app bar
          pb: 12, // Space for player
          overflowY: 'auto',
          background: gradient, // Dynamic gradient
          width: { xs: '100%', md: `calc(100% - 240px)` }
        }}
      >
        <Outlet />
      </Box>

      {/* GitHub Issues Floating Icon */}
      <GithubIssues />

      {/* Player */}
      <Player />
    </Box>
  );
};

export default MainLayout;
