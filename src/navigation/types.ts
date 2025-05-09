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
  Playlists: undefined;
  Following: undefined;
  Stations: undefined;
  YourUploads: undefined;
  Profile: undefined;
  Search: undefined;
  Albums: undefined;

  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  MusicPlayer: undefined;
  AlbumDetail: { albumId: string };
  PlaylistDetail: { playlist: Playlist };
  SearchResults: { query: string };
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  coverArt: any; 
  tracks: any[];
};