import { registerRootComponent } from 'expo';

import App from './App';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './src/services/TrackPlayerService';


registerRootComponent(App);
TrackPlayer.registerPlaybackService(() => PlaybackService);