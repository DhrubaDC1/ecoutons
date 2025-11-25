export interface Track {
  id: number | string;
  title: string;
  artist: string;
  url: string; // URL to audio file
  cover: string; // URL to cover image
  duration: number; // in seconds
}

export interface Playlist {
  id: number | string;
  name: string;
  tracks: Track[];
  cover?: string;
}

export const tracks: Track[] = [
  {
    id: 1,
    title: "Lost in the City Lights",
    artist: "Cosmo Sheldrake",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop",
    duration: 372,
  },
  {
    id: 2,
    title: "Forest Rain",
    artist: "Nature Sounds",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
    duration: 425,
  },
  {
    id: 3,
    title: "Urban Dreams",
    artist: "City Vibes",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    duration: 340,
  },
];
