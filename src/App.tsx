import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { CustomThemeProvider } from './context/ThemeContext';
import { AudioProvider } from './context/AudioContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Playlist from './pages/Playlist';
import LikedSongs from './pages/LikedSongs';

import Auth from './pages/Auth';
import Profile from './pages/Profile';

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <AudioProvider>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
              <Route path="/liked" element={<LikedSongs />} />
              <Route path="/playlist/:id" element={<Playlist />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </AudioProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
};

export default App;
