import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import Slider from "@react-native-community/slider";
import TrackPlayer, { useProgress, useTrackPlayerEvents, Event } from "react-native-track-player";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../contexts/ThemeContext";
import trackPlayerService, { TrackInfo } from "../../services/player/TrackPlayerService";

const MusicPlayerScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const themeStyles = {
    background: "#121212",
    primary: "#FF5500",
    text: "#FFFFFF",
    secondary: "#AAAAAA",
  };

  const [trackInfo, setTrackInfo] = useState<TrackInfo>({ title: "", artist: "", artwork: null });
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  
  const progress = useProgress();
  
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.type === Event.PlaybackActiveTrackChanged) {
      loadTrackInfo();
    }
  });
  
  useEffect(() => {
    const setup = async () => {
      await trackPlayerService.setup();
      await loadTrackInfo();
      const playing = await trackPlayerService.isPlaying();
      setIsPlaying(playing);
    };
    
    setup();
  }, []);
  
  const loadTrackInfo = async () => {
    const info = await trackPlayerService.getCurrentTrackInfo();
    if (info) setTrackInfo(info);
  };
  


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
  
  const handleToggleRepeat = async () => {
    const newMode = await trackPlayerService.toggleRepeatMode();
    setRepeatMode(newMode);
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
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="ellipsis-horizontal" size={28} color={themeStyles.text} />
        </TouchableOpacity>
      </View>
      
      {/* Track Info */}
      <View style={styles.trackInfoContainer}>
        {trackInfo.artwork && <Image source={{uri: trackInfo.artwork}} style={styles.thumbnail} />}
        <Text style={[styles.trackTitle, { color: themeStyles.text }]}>{trackInfo.title}</Text>
        <Text style={[styles.artistName, { color: themeStyles.secondary }]}>{trackInfo.artist}</Text>
      </View>
      
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
        <TouchableOpacity onPress={handleToggleRepeat} style={styles.sideControl}>
          <Icon name="repeat" size={24} color={repeatMode !== 0 ? themeStyles.primary : themeStyles.secondary} />
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
        
        <TouchableOpacity style={styles.sideControl}>
          <Icon name="shuffle" size={24} color={themeStyles.secondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
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
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: "#FFF", 
    justifyContent: "center", 
    alignItems: "center" 
  },
});

export default MusicPlayerScreen;