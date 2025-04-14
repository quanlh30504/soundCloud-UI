export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
  }

  export interface TrackDTO {
    id?: string;
    spotifyId: string;
    name: string;
    artists: string[];
    albumName: string;
    albumImages: SpotifyImage[];
    durationMs: number;
    filePath?: string;
    downloadStatus?: string;
  }
  
  export interface AlbumDTO {
    id: string;
    name: string;
    artists: string[];
    images: SpotifyImage[];
    totalTracks: number;
    releaseDate?: string;
    tracks?: TrackDTO[];
  }
  
  export interface ArtistDTO {
    id: string;
    name: string;
    images: SpotifyImage[];
    genres: string[];
    popularity?: number;
    albums?: AlbumDTO[];
  }
  
  export interface PlaylistDTO {
    id: string;
    name: string;
    description: string;
    owner: string;
    images: SpotifyImage[];
    totalTracks: number;
    isPublic: boolean;
    tracks?: TrackDTO[];
  }
  
  export interface LyricsResponse {
    trackName: string;
    artistName: string;
    lyrics: string;
    error?: string;
  }
  
  export interface DownloadResult {
    success: boolean;
    filePath?: string;
    error?: string;
  }
  
  export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }