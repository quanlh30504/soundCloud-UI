import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useProgress, useTrackPlayerEvents, Event } from 'react-native-track-player';
import trackPlayerService from '../../../services/player/TrackPlayerService';
import NavigationService from '../../../services/navigation/NavigationService';

const MiniPlayerBar = () => {
  const [trackInfo, setTrackInfo] = useState({ title: "", artist: "", artwork: null });
  const [isPlaying, setIsPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('');
  const progress = useProgress();
  
  useTrackPlayerEvents([Event.PlaybackTrackChanged, Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackTrackChanged || event.type === Event.PlaybackState) {
      await loadTrackInfo();
      const playing = await trackPlayerService.isPlaying();
      setIsPlaying(playing);
    }
  });
  
  useEffect(() => {
    const checkStatus = async () => {
      await loadTrackInfo();
      checkCurrentScreen();
    };
    
    checkStatus();
    
    const interval = setInterval(() => {
      checkCurrentScreen();
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  const checkCurrentScreen = () => {
    if (NavigationService.navigationRef && NavigationService.navigationRef.isReady()) {
      const currentRouteName = NavigationService.navigationRef.getCurrentRoute()?.name;
      setCurrentScreen(currentRouteName || '');
    }
  };
  
  const loadTrackInfo = async () => {
    try {
      const info = await trackPlayerService.getCurrentTrackInfo();
      
      // Only show the mini player if we have a valid track with title
      if (info && info.title) {
        setTrackInfo(info);
        setVisible(true);
        
        // Also check if it's playing
        const playing = await trackPlayerService.isPlaying();
        setIsPlaying(playing);
      } else {
        setVisible(false);
      }
    } catch (error) {
      console.error("Error loading track info:", error);
      setVisible(false);
    }
  };
  
  const handlePlayPause = async (e) => {
    e.stopPropagation();
    const playing = await trackPlayerService.togglePlayback();
    setIsPlaying(playing);
  };
  
  const handleNext = async (e) => {
    e.stopPropagation();
    await trackPlayerService.skipToNext();
  };
  
  // Check if we should show the mini player:
  // 1. Must have a valid track (visible state is true)
  // 2. Must not be on the full music player screen
  // 3. Must have at least one track loaded
  if (!visible || currentScreen === 'MusicPlayer') {
    return null;
  }
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.9}
      onPress={() => NavigationService.openMusicPlayer ? 
        NavigationService.openMusicPlayer() : 
        NavigationService.navigationRef.navigate('MusicPlayer')}
    >
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[
          styles.progressBar, 
          { width: `${progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0}%` }
        ]} />
      </View>
      
      <View style={styles.content}>
        {/* Track info */}
        <View style={styles.trackInfoContainer}>
          {trackInfo.artwork && (
            <Image source={trackInfo.artwork} style={styles.thumbnail} />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>{trackInfo.title}</Text>
            <Text style={styles.artist} numberOfLines={1}>{trackInfo.artist}</Text>
          </View>
        </View>
        
        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.button}>
            <Icon 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#FFFFFF"
              style={isPlaying ? {} : { marginLeft: 2 }}
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleNext} style={styles.button}>
            <Icon name="play-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Position above tab bar
    left: 0,
    right: 0,
    backgroundColor: '#212121',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 999,
  },
  progressContainer: {
    height: 2,
    width: '100%',
    backgroundColor: '#424242',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#FF5500',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  trackInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default MiniPlayerBar;