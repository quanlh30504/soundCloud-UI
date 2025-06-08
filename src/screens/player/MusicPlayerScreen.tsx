import React, { useState, useEffect } from "react";
import { View, Text,StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Image, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import TrackPlayer, { useProgress, useTrackPlayerEvents, usePlaybackState, Event, Track } from "react-native-track-player";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../../config/theme";
import trackPlayerService, { TrackInfo } from "../../services/player/TrackPlayerService";
import MoreOptionsMenu from "../../components/common/MoreOptionsMenu";
import SleepTimerModal from "../../components/common/SleepTimerModal";
import SongInfoModal from "../../components/common/SongInfoModal";
import QueueScreen from './QueueScreen';
import LyricsScreen from './LyricsScreen';
import {RepeatMode, State} from 'react-native-track-player';
import { Visualize } from "../../components/visualize/Visualize";
import sleepTimerService from "../../services/player/SleepTimerService";
import { trackApi } from "../../services/api";
import { SongData } from "../../types/zing";
import NavigationService from "../../services/navigation/NavigationService";

const MusicPlayerScreen = ({ navigation, route}: { navigation: any , route: any}) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
    const [trackInfo, setTrackInfo] = useState<TrackInfo>({id: "", title: "", artist: "", artwork: null });
  const [isPlaying, setIsPlaying] = useState(false);
  // const [repeatMode, setRepeatMode] = useState(0);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [queueScreenVisible, setQueueScreenVisible] = useState(false);  const [lyricsScreenVisible, setLyricsScreenVisible] = useState(false);
  const [sleepTimerModalVisible, setSleepTimerModalVisible] = useState(false);
  const [songInfoModalVisible, setSongInfoModalVisible] = useState(false);
  const [currentSongData, setCurrentSongData] = useState<SongData | null>(null);
  const [isRepeating, setIsRepeating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSleepTimerActive, setIsSleepTimerActive] = useState(false);
  
  const progress = useProgress();
  const playerState = usePlaybackState();
  
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
      // const playing = await trackPlayerService.isPlaying();
      // setIsPlaying(playing);
      checkLikeStatus();
      checkSleepTimerStatus();
    };
    
    setup();
  }, []);

  useEffect(() => {
    setIsPlaying(playerState.state === State.Playing);
  }, [playerState]);

  useEffect(() => {
    // Check sleep timer status periodically
    const interval = setInterval(() => {
      checkSleepTimerStatus();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
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

  const checkSleepTimerStatus = () => {
    const isActive = sleepTimerService.isTimerActive();
    setIsSleepTimerActive(isActive);
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
    // setIsPlaying(playing);
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

  const handleOpenSleepTimer = () => {
    setSleepTimerModalVisible(true);
  };

  const handleCloseSleepTimer = () => {
    setSleepTimerModalVisible(false);
    checkSleepTimerStatus(); // Update status when modal closes
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

  const handleOpenSongInfo = async () => {
    if (!currentTrackId) {
      Alert.alert('Error', 'No track is currently playing');
      return;
    }

    try {
      const response = await trackApi.getTrackInfo(currentTrackId);
      setCurrentSongData(response.data);
      setSongInfoModalVisible(true);
      setMoreOptionsVisible(false); // Close the more options menu
    } catch (error) {
      console.error('Error fetching song info:', error);
      Alert.alert('Error', 'Failed to load song information');
    }
  };

  const handleCloseSongInfo = () => {
    setSongInfoModalVisible(false);
  };

  const handleViewArtist = async () => {
    if (!currentTrackId) {
      Alert.alert('Error', 'No track is currently playing');
      return;
    }

    try {
      const response = await trackApi.getTrackInfo(currentTrackId);
      const songData = response.data;
      
      if (songData.artists && songData.artists.length > 0) {
        const firstArtist = songData.artists[0];
        if (firstArtist.alias) {
          setMoreOptionsVisible(false); // Close the more options menu
          NavigationService.navigateToArtist(firstArtist.alias);
        } else {
          Alert.alert('Error', 'Artist information not available');
        }
      } else {
        Alert.alert('Error', 'No artist information found');
      }
    } catch (error) {
      console.error('Error fetching artist info:', error);
      Alert.alert('Error', 'Failed to load artist information');
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="chevron-down" size={28} color={themeStyles.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: isPlaying ? themeStyles.colors.primary : themeStyles.colors.text }]}>
          {isPlaying ? "PLAYING" : "PAUSED"}
        </Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleOpenMoreOptions}
        >
          <Icon name="ellipsis-horizontal" size={28} color={themeStyles.colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Track Info */}
      <View style={styles.trackInfoContainer}>
        {trackInfo.artwork && <Image source={{uri: trackInfo.artwork}} style={styles.thumbnail} />}
        <Text style={[styles.trackTitle, { color: themeStyles.colors.text }]}>{trackInfo.title}</Text>
        <Text style={[styles.artistName, { color: themeStyles.colors.secondary }]}>{trackInfo.artist}</Text>
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
          minimumTrackTintColor={themeStyles.colors.primary}
          maximumTrackTintColor={themeStyles.colors.border}
          thumbTintColor={themeStyles.colors.primary}
          onSlidingComplete={handleSeek}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: themeStyles.colors.secondary }]}>
            {formatTime(progress.position)}
          </Text>
          <Text style={[styles.timeText, { color: themeStyles.colors.secondary }]}>
            {formatTime(progress.duration)}
          </Text>
        </View>
      </View>
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={toggleRepeatMode} style={styles.sideControl}>
          <Icon name="repeat" size={24} color={isRepeating ? themeStyles.colors.primary : themeStyles.colors.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePrevious} style={styles.mainControl}>
          <Icon name="play-back" size={28} color={themeStyles.colors.text} />
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
          <Icon name="play-forward" size={28} color={themeStyles.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sideControl} onPress={handleShufflePress}>
          {/* Assuming shuffle is a boolean state */}
          <Icon name="shuffle" size={24} color={themeStyles.colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Fill space - removed the embedded LyricsComponent */}
      <View style={{ flex: 1 }} />
        {/* Additional Controls Bar */}
      <View style={[styles.additionalControlsBar, { backgroundColor: themeStyles.colors.background, borderTopColor: themeStyles.colors.border }]}>
        <TouchableOpacity style={styles.additionalButton} onPress={handleLikeToggle}>
          <Icon name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? themeStyles.colors.primary : themeStyles.colors.secondary}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.additionalButton} onPress={handleOpenSleepTimer}>
          <Icon name="time-outline" size={24}
            color={isSleepTimerActive ? themeStyles.colors.primary : themeStyles.colors.secondary}
          />
        </TouchableOpacity>
        
        <View style={styles.additionalButtonSpacer} />
        
        <TouchableOpacity style={styles.additionalButton} onPress={handleOpenLyrics}>
          <Icon name="musical-notes" size={24} color={themeStyles.colors.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.additionalButton} onPress={handleOpenQueue}>
          <Icon name="list-outline" size={24} color={themeStyles.colors.secondary} />
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
          },          { 
            icon: 'information-circle-outline', 
            label: 'Song info', 
            onPress: handleOpenSongInfo 
          },
          { 
            icon: 'person-outline', 
            label: 'View artist', 
            onPress: handleViewArtist 
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
        themeStyles={themeStyles.colors}
      />      
      {/* Sleep Timer Modal */}
      <SleepTimerModal
        visible={sleepTimerModalVisible}
        onClose={handleCloseSleepTimer}
        themeStyles={themeStyles.colors}
      />

      {/* Song Info Modal */}
      <SongInfoModal
        visible={songInfoModalVisible}
        onClose={handleCloseSongInfo}
        songData={currentSongData}
        themeStyles={themeStyles.colors}
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  additionalButton: {
    padding: 10,
  },
  additionalButtonSpacer: {
    flex: 1,
  },
});

export default MusicPlayerScreen;