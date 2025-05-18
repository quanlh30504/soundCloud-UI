import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const NavigationService = {

  navigate: <T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) => {
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
};

export default NavigationService;