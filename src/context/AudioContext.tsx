import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import YouTube, { type YouTubePlayer } from 'react-youtube';
import { type Track, type Playlist } from '../data/tracks';
import { useAuth } from './AuthContext';
import { useAppTheme } from './ThemeContext';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (time: number) => void;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (volume: number) => void;
  addToPlaylist: (playlistId: string | number, track: Track) => void;
  removeFromPlaylist: (playlistId: string | number, trackId: string | number) => void;
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string | number) => void;
  playlists: Playlist[];
  toggleLike: (track: Track) => void;
  isLiked: (trackId: string | number) => boolean;
  likedSongs: Track[];
  history: Track[];
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { setDynamicColor } = useAppTheme();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(50);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  
  const playerRef = useRef<YouTubePlayer | null>(null);

  // Sync with Firestore
  useEffect(() => {
    if (!user) {
      setPlaylists([]);
      setLikedSongs([]);
      setHistory([]);
      return;
    }

    const docRef = doc(db, 'users', user.id);
    
    // Listen for real-time updates
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPlaylists(data.playlists || []);
        setLikedSongs(data.likedSongs || []);
        setHistory(data.history || []);
      }
    });

    return unsubscribe;
  }, [user]);

  // Extract Color from Cover Art
  useEffect(() => {
    if (currentTrack?.cover) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = currentTrack.cover;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 1;
        canvas.height = 1;
        
        // Draw image to 1x1 canvas to get average color
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        
        const color = `rgb(${r}, ${g}, ${b})`;
        setDynamicColor(color);
      };

      img.onerror = () => {
        // Fallback or keep previous color
        console.warn("Could not extract color from image");
      };
    }
  }, [currentTrack]);

  const saveToFirestore = async (field: string, data: any) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.id);
    await updateDoc(docRef, { [field]: data });
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    // Add to history
    const newHistory = [track, ...history.filter(t => t.id !== track.id)].slice(0, 50);
    setHistory(newHistory);
    saveToFirestore('history', newHistory);
  };

  const togglePlay = () => {
    if (isPlaying) {
      playerRef.current?.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current?.playVideo();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    // Implement queue logic later
    console.log("Next track");
  };

  const playPrev = () => {
    // Implement queue logic later
    console.log("Prev track");
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    playerRef.current?.seekTo(time);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    playerRef.current?.setVolume(vol);
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: [],
    };
    const newPlaylists = [...playlists, newPlaylist];
    setPlaylists(newPlaylists);
    saveToFirestore('playlists', newPlaylists);
  };

  const deletePlaylist = (playlistId: string | number) => {
    const newPlaylists = playlists.filter(p => p.id !== playlistId);
    setPlaylists(newPlaylists);
    saveToFirestore('playlists', newPlaylists);
  };

  const addToPlaylist = (playlistId: string | number, track: Track) => {
    const newPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        // Check if track already exists
        if (p.tracks.some(t => t.id === track.id)) return p;
        return { ...p, tracks: [...p.tracks, track] };
      }
      return p;
    });
    setPlaylists(newPlaylists);
    saveToFirestore('playlists', newPlaylists);
  };

  const removeFromPlaylist = (playlistId: string | number, trackId: string | number) => {
    const newPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
      }
      return p;
    });
    setPlaylists(newPlaylists);
    saveToFirestore('playlists', newPlaylists);
  };

  const toggleLike = (track: Track) => {
    let newLikedSongs;
    if (likedSongs.some(t => t.id === track.id)) {
      newLikedSongs = likedSongs.filter(t => t.id !== track.id);
    } else {
      newLikedSongs = [...likedSongs, track];
    }
    setLikedSongs(newLikedSongs);
    saveToFirestore('likedSongs', newLikedSongs);
  };

  const isLiked = (trackId: string | number) => {
    return likedSongs.some(t => t.id === trackId);
  };

  // YouTube Player Event Handlers
  const onReady = (event: any) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    if (isPlaying) {
      playerRef.current.playVideo();
    }
  };

  const onStateChange = (event: any) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
      setDuration(playerRef.current.getDuration());
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === YouTube.PlayerState.ENDED) {
      setIsPlaying(false);
      playNext();
    }
  };

  // Progress Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      playTrack,
      togglePlay,
      playNext,
      playPrev,
      seekTo,
      currentTime,
      duration,
      volume,
      setVolume,
      addToPlaylist,
      removeFromPlaylist,
      createPlaylist,
      deletePlaylist,
      playlists,
      toggleLike,
      isLiked,
      likedSongs,
      history
    }}>
      {children}
      {currentTrack && (
        <div style={{ display: 'none' }}>
          <YouTube
            videoId={currentTrack.id.toString()}
            opts={{
              height: '0',
              width: '0',
              playerVars: {
                autoplay: 1,
                controls: 0,
                origin: window.location.origin,
              },
            }}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        </div>
      )}
    </AudioContext.Provider>
  );
};
