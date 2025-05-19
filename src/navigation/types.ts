import { Playlist } from '../types/playlist';

export type RootStackParamList = {
  Home: undefined;
  Feed: undefined;
  SearchTab: undefined;
  LibraryTab: undefined;
  Upgrade: undefined;
  Settings: undefined;

  Library: undefined;
  LikedTracks: undefined;
  OwnPlaylists: undefined;
  Following: undefined;
  Stations: undefined;
  YourUploads: undefined;
  Profile: undefined;
  Search: undefined;
  Albums: undefined;
  AddToPlaylist: { 
    trackId: string; 
    trackName: string;
    artistName: string;
    trackArtwork: string | null;
  };

  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  MusicPlayer: undefined;
  AlbumDetail: { albumId: string };
  OwnPlaylistDetail: { playlist: Playlist };
  SearchResults: { query: string };
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  coverArt: any; 
  tracks: any[];
};