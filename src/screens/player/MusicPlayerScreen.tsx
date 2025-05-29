import React, { useState, useEffect } from "react";
import { View, Text,StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Image, } from "react-native";
import Slider from "@react-native-community/slider";
import TrackPlayer, { useProgress, useTrackPlayerEvents, Event, Track } from "react-native-track-player";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../contexts/ThemeContext";
import trackPlayerService, { TrackInfo } from "../../services/player/TrackPlayerService";
import MoreOptionsMenu from "../../components/common/MoreOptionsMenu";
import QueueScreen from './QueueScreen';
import LyricsScreen from './LyricsScreen';
import {RepeatMode, State} from 'react-native-track-player';
import { Visualize } from "../../components/visualize/Visualize";

const MusicPlayerScreen = ({ navigation, route}: { navigation: any , route: any}) => {
  const { theme } = useTheme();
  const themeStyles = {
    background: "#121212",
    primary: "#FF5500",
    text: "#FFFFFF",
    secondary: "#AAAAAA",
  };
  
  const [trackInfo, setTrackInfo] = useState<TrackInfo>({id: "", title: "", artist: "", artwork: null });
  const [isPlaying, setIsPlaying] = useState(false);
  // const [repeatMode, setRepeatMode] = useState(0);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [queueScreenVisible, setQueueScreenVisible] = useState(false);
  const [lyricsScreenVisible, setLyricsScreenVisible] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const progress = useProgress();
  
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.type === Event.PlaybackActiveTrackChanged) {
      loadTrackInfo();
      checkLikeStatus();
    }
  });
  
  useEffect(() => {
    const setup = async () => {
      await trackPlayerService.setup();
      await loadTrackInfo();
      const playing = await trackPlayerService.isPlaying();
      setIsPlaying(playing);
      checkLikeStatus();
    };
    
    setup();
  }, []);
  
  const loadTrackInfo = async () => {
    const info = await trackPlayerService.getCurrentTrackInfo();
    if (info) {
      setTrackInfo(info);
    }

    const track: Track|undefined = await TrackPlayer.getActiveTrack();
    if (track && track.url) {
      setAudioUrl(track.url);
    }
    
    const trackId = await trackPlayerService.getCurrentTrackId();
    console.log("Current track ID:", trackId);
    setCurrentTrackId(trackId);
  };
  
  const checkLikeStatus = async () => {
    const trackId = await trackPlayerService.getCurrentTrackId();
    if (trackId) {
      const liked = await trackPlayerService.isTrackLiked(trackId);
      setIsLiked(liked);
    }
  };
  
  const toggleRepeatMode = async () => {
    const currentMode = await trackPlayerService.getRepeatMode();
    setIsRepeating(currentMode === RepeatMode.Off ? true : false);
    trackPlayerService.setRepeatMode(currentMode === RepeatMode.Off ? RepeatMode.Track : RepeatMode.Off);
    console.log("Repeat mode set to:", currentMode === RepeatMode.Off ? "Track" : "Off");
  }

  const handleShufflePress = async () => {
    try {
      trackPlayerService.shuffleNextInQueue();
    } catch (error) {
      console.error("Error shuffling next in queue:", error);
    }
  }

  const handlePlayPause = async () => {
    const playing = await trackPlayerService.togglePlayback();
    setIsPlaying(playing);
  };
  
  const handleNext = async () => {
    await trackPlayerService.skipToNext();
  };
  
  const handlePrevious = async () => {
    await trackPlayerService.skipToPrevious();
  };
  
  const handleSeek = async (value: number) => {
    await trackPlayerService.seekTo(value);
  };
  
  // const handleToggleRepeat = async () => {
  //   const newMode = await trackPlayerService.toggleRepeatMode();
  //   setRepeatMode(newMode);
  // };
  
  const handleOpenMoreOptions = () => {
    setMoreOptionsVisible(true);
  };
  
  const handleCloseMoreOptions = () => {
    setMoreOptionsVisible(false);
  };

  const handleAddToPlaylist = async () => {
    // Get current track info
    const currentTrack = trackInfo;
    const trackId =  await trackPlayerService.getCurrentTrackId();
    
    // Close the more options menu
    setMoreOptionsVisible(false);
    
    // Navigate to AddToPlaylist screen with track info
    navigation.navigate('AddToPlaylist', {
      trackId: trackId,
      trackName: currentTrack.title,
      artistName: currentTrack.artist,
      trackArtwork: currentTrack.artwork
    });
  };

  const handleLikeToggle = async () => {
    if (!currentTrackId) return;
    console.log("Toggling like status for track ID:", currentTrackId);
    const isSuccess = await trackPlayerService.toggleLikeTrack(currentTrackId);
    if (isSuccess) {
      setIsLiked(!isLiked);
    } else {
      console.error("Failed to toggle like status");
    }
  };

  const handleOpenQueue = () => {
    setQueueScreenVisible(true);
  };
  
  const handleCloseQueue = () => {
    setQueueScreenVisible(false);
  };

  const handleOpenLyrics = () => {
    setLyricsScreenVisible(true);
  };
  
  const handleCloseLyrics = () => {
    setLyricsScreenVisible(false);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.background }]}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="chevron-down" size={28} color={themeStyles.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: isPlaying ? themeStyles.primary : themeStyles.text }]}>
          {isPlaying ? "PLAYING" : "PAUSED"}
        </Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleOpenMoreOptions}
        >
          <Icon name="ellipsis-horizontal" size={28} color={themeStyles.text} />
        </TouchableOpacity>
      </View>
      
      {/* Track Info */}
      <View style={styles.trackInfoContainer}>
        {trackInfo.artwork && <Image source={{uri: trackInfo.artwork}} style={styles.thumbnail} />}
        <Text style={[styles.trackTitle, { color: themeStyles.text }]}>{trackInfo.title}</Text>
        <Text style={[styles.artistName, { color: themeStyles.secondary }]}>{trackInfo.artist}</Text>
      </View>
      
      {/* Audio Visualizer */}
      <Visualize 
        audioUrl={audioUrl || ''}
        isPlaying={isPlaying}
        position={progress.position}
        volume={0} // Muted for visualization only
      />
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={progress.duration || 100}
          value={progress.position || 0}
          minimumTrackTintColor={themeStyles.primary}
          maximumTrackTintColor="#333333"
          thumbTintColor={themeStyles.primary}
          onSlidingComplete={handleSeek}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: themeStyles.secondary }]}>
            {formatTime(progress.position)}
          </Text>
          <Text style={[styles.timeText, { color: themeStyles.secondary }]}>
            {formatTime(progress.duration)}
          </Text>
        </View>
      </View>
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={toggleRepeatMode} style={styles.sideControl}>
          <Icon name="repeat" size={24} color={isRepeating ? themeStyles.primary : themeStyles.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePrevious} style={styles.mainControl}>
          <Icon name="play-back" size={28} color={themeStyles.text} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          <Icon 
            name={isPlaying ? "pause" : "play"} 
            size={30} 
            color="#000"
            style={isPlaying ? {} : { marginLeft: 3 }}
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleNext} style={styles.mainControl}>
          <Icon name="play-forward" size={28} color={themeStyles.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sideControl} onPress={handleShufflePress}>
          {/* Assuming shuffle is a boolean state */}
          <Icon name="shuffle" size={24} color={themeStyles.secondary} />
        </TouchableOpacity>
      </View>

      {/* Fill space - removed the embedded LyricsComponent */}
      <View style={{ flex: 1 }} />
      
      {/* Additional Controls Bar */}
      <View style={styles.additionalControlsBar}>
        <TouchableOpacity style={styles.additionalButton}>
          <Icon name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? themeStyles.primary : themeStyles.secondary}
            onPress={handleLikeToggle}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.additionalButton}>
          <Icon name="time-outline" size={24}
            color={themeStyles.secondary}
          />
        </TouchableOpacity>
        
        <View style={styles.additionalButtonSpacer} />
        
        <TouchableOpacity style={styles.additionalButton} onPress={handleOpenLyrics}>
          <Icon name="musical-notes" size={24} color={themeStyles.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.additionalButton} onPress={handleOpenQueue}>
          <Icon name="list-outline" size={24} color={themeStyles.secondary} />
        </TouchableOpacity>
      </View>

      {/* More Options Menu */}
      <MoreOptionsMenu
        visible={moreOptionsVisible}
        onClose={handleCloseMoreOptions}
        title={trackInfo.title}
        subtitle={trackInfo.artist || ''}
        thumbnailUrl={trackInfo.artwork || 'https://fakeimg.pl/60x60'}
        options={[
          { 
            icon: isLiked ? 'heart' : 'heart-outline', 
            label: isLiked ? 'Unlike' : 'Like', 
            onPress: handleLikeToggle 
          },
          { 
            icon: 'add-circle-outline', 
            label: 'Add to playlist', 
            onPress: handleAddToPlaylist 
          },
          { 
            icon: 'share-outline', 
            label: 'Share', 
            onPress: () => console.log('Share track') 
          },
          { 
            icon: 'information-circle-outline', 
            label: 'Song info', 
            onPress: () => console.log('View song info') 
          },
          { 
            icon: 'person-outline', 
            label: 'View artist', 
            onPress: () => console.log('View artist') 
          }
        ]}
      />
      
      {/* Queue Screen */}
      <QueueScreen 
        visible={queueScreenVisible}
        onClose={handleCloseQueue}
      />
      
      {/* Lyrics Screen */}
      <LyricsScreen
        visible={lyricsScreenVisible}
        onClose={handleCloseLyrics}
        trackId={currentTrackId}
        onLyricPress={handleSeek}
        themeStyles={themeStyles}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    position: 'relative',  // Added to support absolute positioning of the control bar
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    padding: 16 
  },
  headerButton: { 
    padding: 8 
  },
  headerText: { 
    fontSize: 14, 
    fontWeight: "600",
    letterSpacing: 1
  },
  trackInfoContainer: { 
    alignItems: "center", 
    marginVertical: 20,
    paddingHorizontal: 24
  },
  thumbnail: { 
    width: 250, 
    height: 250, 
    borderRadius: 10 
  },
  trackTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginTop: 16,
    textAlign: "center"
  },
  artistName: { 
    fontSize: 16, 
    marginTop: 8 
  },
  lyricsContainer: {
    flex: 1,
    marginVertical: 10,
    paddingHorizontal: 24
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginVertical: 16
  },
  progressBar: {
    width: "100%",
    height: 40
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  timeText: {
    fontSize: 12
  },
  controlsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 30
  },
  sideControl: {
    padding: 10
  },
  mainControl: {
    padding: 10
  },
  playButton: { 
    width: 50, 
    height: 50, 
    borderRadius: 35, 
    backgroundColor: "#FFF", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  additionalControlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    position: 'absolute', // Changed to absolute positioning
    bottom: 0,           // Position at the bottom
    left: 0,
    right: 0,
    backgroundColor: '#121212', // Match background so it doesn't look out of place
  },
  additionalButton: {
    padding: 10,
  },
  additionalButtonSpacer: {
    flex: 1,
  },
});

export default MusicPlayerScreen;