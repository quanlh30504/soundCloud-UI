import { Playlist } from '../types/playlist';

export type RootStackParamList = {
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