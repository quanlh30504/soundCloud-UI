import { Playlist } from '../types/playlist';
import { WeekChartInfo } from '../types/zing';

export type RootStackParamList = {
  Home: undefined;
  Trending: undefined;
  Chart: undefined;
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
  FullHistory: undefined;
  WeekChartDetail: { 
    region: string; 
    data: WeekChartInfo;
    allChartData?: {
      vn: WeekChartInfo;
      us: WeekChartInfo;
      korea: WeekChartInfo;
    };
  };
};