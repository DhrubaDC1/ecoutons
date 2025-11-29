import { GoogleGenerativeAI } from "@google/generative-ai";
import { type Track } from "../data/tracks";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export const getMoodSongs = async (mood: string): Promise<string[]> => {
  try {
    const prompt = `Suggest 5 songs that perfectly match the mood: "${mood}". 
    Return ONLY a JSON array of strings, where each string is "Artist - Title". 
    Do not include any markdown formatting or explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown if present (e.g. ```json ... ```)
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error fetching mood songs from Gemini:", error);
    return [];
  }
};

export const getRecommendations = async (history: Track[]): Promise<string[]> => {
  try {
    if (history.length === 0) return [];

    const historyList = history.slice(0, 10).map(t => `${t.artist} - ${t.title}`).join(", ");
    const prompt = `Based on the user's listening history: [${historyList}], 
    suggest 5 new songs they might like. 
    Return ONLY a JSON array of strings, where each string is "Artist - Title".
    Do not include any markdown formatting or explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error fetching recommendations from Gemini:", error);
    return [];
  }
};

export const generatePlaylistCoverPrompt = async (tracks: Track[]): Promise<string> => {
  try {
    if (tracks.length === 0) return "Abstract musical art, colorful, 4k";

    const trackList = tracks.slice(0, 10).map(t => `${t.artist} - ${t.title}`).join(", ");
    const prompt = `Create a short, vivid, artistic image prompt (max 20 words) for a playlist cover art based on these songs: [${trackList}]. 
    Focus on the mood, colors, and abstract imagery. Return ONLY the prompt text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating cover prompt:", error);
    return "Abstract digital art, music vibes, neon colors";
  }
};

export const generateImage = (prompt: string): string => {
  const encodedPrompt = encodeURIComponent(prompt);
  // Using Pollinations.ai for free image generation
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=500&height=500&nologo=true`;
};
export const getNextSongSuggestion = async (currentTrack: string): Promise<string> => {
  try {
    const prompt = `Based on the song '${currentTrack}', suggest ONE single song to play next that fits the vibe. 
    Return ONLY the string "Artist - Title". 
    Do not include any markdown formatting, JSON, or explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error fetching next song suggestion:", error);
    return "";
  }
};
