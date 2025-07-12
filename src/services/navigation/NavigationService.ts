import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const NavigationService = {

  navigate: <T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) => {
    console.log('Navigating to:', name, params);
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    } else {
      console.warn('Navigation attempted before navigator was ready');
    }
  },

  goBack: () => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },


  openMusicPlayer: (params?: { trackId: string }) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('MusicPlayer', params);
    } else {
      console.warn('Navigation attempted before navigator was ready');
    }
  },
  navigateToPlaylist: (playlistId: string) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('LibraryTab', {
        screen: 'PlaylistDetail',
        params: { playlistId }
      });
    } else {
      console.warn('Navigation attempted before navigator was ready');
    }
  },
  navigateToOwnPlaylist: (playlistId: string) => {
    console.log('Navigating to own playlist with ID:', playlistId);
    const playlist = {id: playlistId};
    if (navigationRef.isReady()) {
      navigationRef.navigate('LibraryTab', {
        screen: 'OwnPlaylistDetail',
        params: { playlist }
      });
    } else {
      console.warn('Navigation attempted before navigator was ready');
    }
  },

  navigateToArtist: (alias: string) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('LibraryTab', {
        screen: 'ArtistDetail',
        params: { alias }
      });
    } else {
      console.warn('Navigation attempted before navigator was ready');
    }
  }
};

export default NavigationService;