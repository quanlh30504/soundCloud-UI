import { Playlist } from '../types/playlist';

export type RootStackParamList = {
  Home: undefined;
  Feed: undefined;
  SearchTab: undefined;
  LibraryTab: {
    screen: string;
    params: any;
  };
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

  PlaylistDetail: { playlistId: string };
  ArtistDetail: { alias: string };
};