export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Feed: undefined;
  Search: undefined;
  Library: undefined;
  Upgrade: undefined;
  
  Settings: undefined;
  LikedTracks: undefined;
  Playlists: undefined;
  Albums: undefined;
  Following: undefined;
  Stations: undefined;
  YourUploads: undefined;
  Profile: undefined;
  
  MusicPlayer: undefined;
  Player: undefined;
  AlbumDetail: {
    album: Album;
  };

  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  coverArt: any; 
  tracks: any[];
};