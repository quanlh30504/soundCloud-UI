import { registerRootComponent } from 'expo';

import App from './App';
import TrackPlayer from 'react-native-track-player';
// import { PlaybackService } from './src/services/player/PlaybackService';


registerRootComponent(App);
TrackPlayer.registerPlaybackService(() => require('./src/services/player/PlaybackService'));
// TrackPlayer.registerPlaybackService(() => PlaybackService);