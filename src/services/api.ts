import { type Track, tracks } from '../data/tracks';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchTrendingMusic = async (): Promise<Track[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/videos?chart=mostPopular&regionCode=US&videoCategoryId=10&part=snippet,contentDetails,statistics&maxResults=20&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id}`, // Reference URL, actual playback via ID
      cover: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      duration: parseDuration(item.contentDetails.duration)
    }));
  } catch (error) {
    console.error("Failed to fetch trending music, falling back to mock data", error);
    return tracks;
  }
};

export const searchTracks = async (query: string): Promise<Track[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&videoCategoryId=10&maxResults=20&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API Error: ${response.status}`);
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      cover: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      duration: 0 // Search endpoint doesn't return duration, would need a second call to videos endpoint
    }));
  } catch (error) {
    console.error("Failed to search tracks, falling back to mock data", error);
    return tracks.filter(t => 
      t.title.toLowerCase().includes(query.toLowerCase()) || 
      t.artist.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Helper to parse ISO 8601 duration (PT1H2M10S) to seconds
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = (parseInt(match[1] || '0') || 0);
  const minutes = (parseInt(match[2] || '0') || 0);
  const seconds = (parseInt(match[3] || '0') || 0);

  return hours * 3600 + minutes * 60 + seconds;
};
