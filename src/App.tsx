import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import MainLayout from './layouts/MainLayout';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Playlist from './pages/Playlist';
import LikedSongs from './pages/LikedSongs';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/liked" element={<LikedSongs />} />
          <Route path="/playlist/:id" element={<Playlist />} />
        </Routes>
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
