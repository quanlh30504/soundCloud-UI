import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export const searchTracks = async (query: string) => {
  try {
    const response = await api.get('/spotify/search/tracks', { params: { query } });
    return response.data;
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
};

export const searchAlbums = async (query: string) => {
  try {
    const response = await api.get('/spotify/search/albums', { params: { query } });
    return response.data;
  } catch (error) {
    console.error('Error searching albums:', error);
    throw error;
  }
};

export const searchPlaylists = async (
  query: string,
  page: number = 0,
  size: number = 20,
  direction: string = 'asc'
) => {
  try {
    const response = await api.get('/spotify/search/playlists', {
      params: { query, page, size, direction }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching playlists:', error);
    throw error;
  }
};

export const searchAll = async (query: string) => {
  const [tracksResponse, albumsResponse, playlistsResponse] = await Promise.all([
    searchTracks(query).catch(() => []),
    searchAlbums(query).catch(() => []),
    searchPlaylists(query).catch(() => ({ content: [] }))
  ]);
  
  return {
    tracks: tracksResponse,
    albums: albumsResponse,
    playlists: playlistsResponse
    };
};

export const getTrackInfo = async (trackId: string) => {
  try {
    const response = await api.get(`/spotify/tracks/${trackId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting track info:', error);
    throw error;
  }
};

export const getAlbumInfo = async (albumId: string, page: number = 0, size: number = 20) => {
  try {
    const response = await api.get(`/spotify/albums/${albumId}`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting album info:', error);
    throw error;
  }
};

export const getPlaylistInfo = async (playlistId: string, page: number = 0, size: number = 20) => {
  try {
    const response = await api.get(`/spotify/playlists/${playlistId}`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting playlist info:', error);
    throw error;
  }
};