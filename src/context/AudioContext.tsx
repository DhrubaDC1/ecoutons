import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import YouTube, { type YouTubePlayer } from 'react-youtube';
import { type Track, type Playlist } from '../data/tracks';
import { useAuth } from './AuthContext';
import { useAppTheme } from './ThemeContext';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getNextSongSuggestion } from '../services/gemini';
import { searchTracks } from '../services/api';

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
  updatePlaylist: (playlistId: string | number, updates: Partial<Playlist>) => void;
  playlists: Playlist[];
  toggleLike: (track: Track) => void;
  isLiked: (trackId: string | number) => boolean;
  likedSongs: Track[];
  history: Track[];
  frequencyData: Uint8Array | null; // For visualization
  queue: Track[];
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
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
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  
  // Player Refs
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Web Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Determine player type
  const isYouTube = currentTrack?.url.includes('youtube.com') || currentTrack?.url.includes('youtu.be');

  // Initialize Audio Element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    // Event listeners
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      playNext();
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256; // Trade-off between resolution and performance
      
      const source = audioCtx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      return () => {
        audioCtx.close();
      };
    } catch (e) {
      console.warn("Web Audio API not supported or failed to initialize", e);
    }
  }, []);

  // Animation Loop for Frequency Data
  const updateFrequencyData = () => {
    if (analyserRef.current && isPlaying && !isYouTube) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      setFrequencyData(dataArray);
      animationFrameRef.current = requestAnimationFrame(updateFrequencyData);
    }
  };

  useEffect(() => {
    if (isPlaying && !isYouTube) {
      // Resume AudioContext if suspended (browser policy)
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      updateFrequencyData();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clear data when paused or switched to YouTube
      if (!isPlaying) {
         // Optional: Keep last frame or clear? Let's clear for now or keep it static.
         // setFrequencyData(null); 
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isYouTube]);


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
        setQueue(data.queue || []);
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

  const playTrack = async (track: Track) => {
    // Stop previous
    if (youtubePlayerRef.current) youtubePlayerRef.current.pauseVideo();
    if (audioRef.current) audioRef.current.pause();

    setCurrentTrack(track);
    setIsPlaying(true);
    
    const isNewYouTube = track.url.includes('youtube.com') || track.url.includes('youtu.be');

    if (!isNewYouTube && audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.volume = volume / 100;
      try {
        await audioRef.current.play();
      } catch (e) {
        console.error("Audio playback failed", e);
        setIsPlaying(false);
      }
    }
    
    // Add to history
    const newHistory = [track, ...history.filter(t => t.id !== track.id)].slice(0, 50);
    setHistory(newHistory);
    saveToFirestore('history', newHistory);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (isYouTube) youtubePlayerRef.current?.pauseVideo();
      else audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (isYouTube) youtubePlayerRef.current?.playVideo();
      else {
        audioRef.current?.play().catch(e => console.error(e));
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
      }
      setIsPlaying(true);
    }
  };

  const playNext = async () => {
    // 1. Check Queue
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(prev => prev.slice(1));
      playTrack(nextTrack);
      return;
    }

    // 2. Autoplay from Gemini
    if (currentTrack) {
      console.log("Queue empty, fetching autoplay suggestion...");
      try {
        const suggestion = await getNextSongSuggestion(`${currentTrack.artist} - ${currentTrack.title}`);
        if (suggestion) {
          console.log("Autoplay suggestion:", suggestion);
          const results = await searchTracks(suggestion);
          if (results.length > 0) {
            // Filter out current track to avoid immediate repeat if API returns same
            const nextTrack = results[0].id !== currentTrack.id ? results[0] : results[1] || results[0];
            playTrack(nextTrack);
            return;
          }
        }
      } catch (e) {
        console.error("Autoplay failed", e);
      }
    }
    
    console.log("No next track found");
  };

  const playPrev = () => {
    // Implement queue logic later
    console.log("Prev track");
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    if (isYouTube) {
      youtubePlayerRef.current?.seekTo(time);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (youtubePlayerRef.current) youtubePlayerRef.current.setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol / 100;
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
    const newPlaylists = playlists.filter(p => String(p.id) !== String(playlistId));
    setPlaylists(newPlaylists);
    saveToFirestore('playlists', newPlaylists);
  };

  const updatePlaylist = (playlistId: string | number, updates: Partial<Playlist>) => {
    const newPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, ...updates };
      }
      return p;
    });
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

  const addToQueue = (track: Track) => {
    const newQueue = [...queue, track];
    setQueue(newQueue);
    saveToFirestore('queue', newQueue);
  };

  const removeFromQueue = (index: number) => {
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);
    saveToFirestore('queue', newQueue);
  };

  const clearQueue = () => {
    setQueue([]);
    saveToFirestore('queue', []);
  };

  // YouTube Player Event Handlers
  const onReady = (event: any) => {
    youtubePlayerRef.current = event.target;
    youtubePlayerRef.current.setVolume(volume);
    if (isPlaying && isYouTube) {
      youtubePlayerRef.current.playVideo();
    }
  };

  const onStateChange = (event: any) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
      setDuration(youtubePlayerRef.current.getDuration());
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === YouTube.PlayerState.ENDED) {
      setIsPlaying(false);
      playNext();
    }
  };

  // Progress Interval for YouTube (HTML5 uses timeupdate event)
  useEffect(() => {
    const interval = setInterval(() => {
      if (youtubePlayerRef.current && isPlaying && isYouTube) {
        setCurrentTime(youtubePlayerRef.current.getCurrentTime());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isYouTube]);

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
      updatePlaylist,
      playlists,
      toggleLike,
      isLiked,
      likedSongs,
      history,
      frequencyData,
      queue,
      addToQueue,
      removeFromQueue,
      clearQueue
    }}>
      {children}
      {currentTrack && isYouTube && (
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
