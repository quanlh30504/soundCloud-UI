import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import TrackPlayer, { Track } from 'react-native-track-player';

interface Album {
  id: string;
  title: string;
  artist: string;
  coverArt: any; 
  tracks: Track[];
}

interface AlbumDetailScreenProps {
  navigation: any;
  route: {
    params: {
      album: Album;
    };
  };
}

export default function AlbumDetailScreen({ route, navigation }: AlbumDetailScreenProps) {
  const album: Album = route.params.album;
  const { theme } = useTheme();

  const backgroundColor = '#121212';
  const textColor = '#ffffff';
  const secondaryTextColor = '#a0a0a0';

  // Setup TrackPlayer queue with album tracks on mount
  useEffect(() => {
    const setupQueue = async () => {
      try {
        await TrackPlayer.reset(); // Clear existing queue
        await TrackPlayer.add(album.tracks); // Add album tracks
        console.log('Album tracks added to queue');
      } catch (error) {
        console.error('Error setting up album queue:', error);
      }
    };
    setupQueue();
  }, [album]);

  // Handler to play the album from the first track
  const handlePlayAlbum = async () => {
    try {
      await TrackPlayer.skip(0); // Skip to the first track
      await TrackPlayer.play();
      navigation.navigate('MusicPlayer'); // Navigate to player screen
    } catch (error) {
      console.error('Error playing album:', error);
    }
  };

  // Handler to play a specific track
  const handleTrackPress = async (index: number) => {
    try {
      await TrackPlayer.skip(index); // Skip to the selected track
      await TrackPlayer.play();
      navigation.navigate('MusicPlayer');
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="chevron-down" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <Image source={album.coverArt} style={styles.coverArt} />

        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: textColor }]}>{album.title}</Text>
          <Text style={[styles.artist, { color: secondaryTextColor }]}>
            {album.artist}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayAlbum}>
            <Icon name="play" size={24} color="#ffffff" />
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shuffleButton}>
            <Icon name="shuffle" size={24} color="#ffffff" />
            <Text style={styles.shuffleButtonText}>Shuffle</Text>
          </TouchableOpacity>
        </View>

        {/* Track List */}
        <FlatList
          data={album.tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.trackItem}
              onPress={() => handleTrackPress(index)}
            >
              <View style={styles.trackInfo}>
                <Image source={album.coverArt} style={styles.trackImage} />
                <Text style={[styles.trackNumber, { color: secondaryTextColor }]}>
                  {index + 1}
                </Text>
                <View style={styles.trackDetails}>
                  <Text style={[styles.trackTitle, { color: textColor }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.trackArtist, { color: secondaryTextColor }]}>
                    {item.artist}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
  },
  trackImage: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: 'cover',
  },
  
  coverArt: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20, // Increased padding for breathing room
  },
  title: {
    fontSize: 28, // Larger for emphasis
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 20, // Slightly larger
    marginTop: 8, // More spacing
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954', // Green color for "Play" (e.g., Spotify-inspired)
    padding: 12,
    marginRight: 20,
    borderRadius: 25, // Rounded corners
  },
  playButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333', // Kept original color
    padding: 12,
    borderRadius: 25, // Rounded corners
  },
  shuffleButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
  },
  trackItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222', // Slightly lighter separator
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackNumber: {
    fontSize: 16,
    width: 30, // Fixed width for alignment
  },
  trackDetails: {
    marginLeft: 10,
  },
  trackTitle: {
    fontSize: 16,
  },
  trackArtist: {
    fontSize: 14,
    marginTop: 4,
  },
});