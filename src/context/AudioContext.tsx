import React, { createContext, useState, useContext, type ReactNode, useRef, useEffect } from 'react';
import { type Track, type Playlist } from '../data/tracks';
import YouTube, { type YouTubeProps } from 'react-youtube';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  progress: number;
  setProgress: (progress: number) => void;
  duration: number;
  likedSongs: Track[];
  toggleLike: (track: Track) => void;
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: number | string, track: Track) => void;
  history: Track[];
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(50);
  const [progress, setProgressState] = useState(0);
  const [duration, setDuration] = useState(0);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  
  const playerRef = useRef<any>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ecoutons_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ecoutons_history', JSON.stringify(history));
  }, [history]);

  // Sync volume with player when it changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const addToHistory = (track: Track) => {
    setHistory(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 20); // Keep last 20 tracks
    });
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgressState(0);
    addToHistory(track);
    // Duration will be updated by onReady or onStateChange
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    // Logic for next track (mock for now, or could use playlist context)
    console.log("Next track");
  };

  const playPrev = () => {
    console.log("Prev track");
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    playerRef.current?.setVolume(val);
  };

  const setProgress = (val: number) => {
    setProgressState(val);
    playerRef.current?.seekTo(val, true);
  };

  const toggleLike = (track: Track) => {
    setLikedSongs(prev => {
      const exists = prev.some(t => t.id === track.id);
      if (exists) {
        return prev.filter(t => t.id !== track.id);
      }
      return [...prev, track];
    });
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now(),
      name,
      tracks: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const addToPlaylist = (playlistId: number | string, track: Track) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        // Check if track already exists in playlist to prevent duplicates
        if (!p.tracks.some(t => t.id === track.id)) {
          return { ...p, tracks: [...p.tracks, track] };
        }
      }
      return p;
    }));
  };

  // YouTube Player Event Handlers
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange = (event: any) => {
    // 1 = Playing, 2 = Paused, 0 = Ended
    if (event.data === 1) {
      setIsPlaying(true);
      setDuration(event.target.getDuration());
    } else if (event.data === 2) {
      setIsPlaying(false);
    } else if (event.data === 0) {
      setIsPlaying(false);
      playNext();
    }
  };

  // Poll for progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const currentTime = playerRef.current.getCurrentTime();
        setProgressState(currentTime);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      origin: window.location.origin,
    },
  };

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      playTrack,
      togglePlay,
      playNext,
      playPrev,
      volume,
      setVolume,
      progress,
      setProgress,
      duration,
      likedSongs,
      toggleLike,
      playlists,
      createPlaylist,
      addToPlaylist,
      history
    }}>
      {children}
      {currentTrack && (
        <div style={{ display: 'none' }}>
           <YouTube 
             videoId={String(currentTrack.id)} 
             opts={opts} 
             onReady={onPlayerReady}
             onStateChange={onPlayerStateChange}
           />
        </div>
      )}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
