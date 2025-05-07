import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import TrackPlayer, { Track } from 'react-native-track-player';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getPlaylistInfo } from '../../services/api';

interface Playlist {
  id: string;
  name: string;
  owner: string;
  description?: string;
  images: Array<{url: string}>;
  tracks: Track[];
  public?: boolean;
  collaborative?: boolean;
  followers?: number;
}

interface PlaylistDetailScreenProps {
  navigation: any;
  route: {
    params: {
      playlistId: string;
    };
  };
}

export default function PlaylistDetailScreen({ route, navigation }: PlaylistDetailScreenProps) {
  const { playlistId } = route.params;
  const [playlist, setPlaylist] = useState(null);
  const { theme } = useTheme();
  const [orderedTracks, setOrderedTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const backgroundColor = '#121212';
  const textColor = '#ffffff';
  const secondaryTextColor = '#a0a0a0';

  useEffect(() => {
    fetchPlaylistDetails();
  }, [playlistId]);

  const fetchPlaylistDetails = async () => {
    try {
      setIsLoading(true);
      const playlistData = await getPlaylistInfo(playlistId);
      console.log("Playlist data received:", playlistData);
      
      const mappedTracks = playlistData.tracks.map(track => ({
        ...track,
        id: track.spotifyId,
      }));

      setPlaylist(playlistData);
      setOrderedTracks(mappedTracks);
      setIsLoading(false);

      if (playlistData.tracks && playlistData.tracks.length > 0) {
        await TrackPlayer.reset();
        await TrackPlayer.add(playlistData.tracks);
        console.log('Playlist tracks added to queue');
      }
    } catch (error) {
      console.error('Error fetching playlist details:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );
  }

  const handlePlayPlaylist = async () => {
    try {
      await TrackPlayer.skip(0);
      await TrackPlayer.play();
      navigation.navigate('MusicPlayer');
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  };

  const handleTrackPress = async (index: number) => {
    try {
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
      navigation.navigate('MusicPlayer');
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...orderedTracks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setOrderedTracks(shuffled);
    const updateQueue = async () => {
      try {
        await TrackPlayer.reset();
        await TrackPlayer.add(shuffled);
        console.log('Shuffled tracks added');
      } catch (error) {
        console.error('Error shuffling tracks', error);
      }
    };
    updateQueue();
  };

  const handleDragEnd = async ({ data }: { data: Track[] }) => {
    setOrderedTracks(data);
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(data);
      console.log('Reordered tracks added to queue');
    } catch (error) {
      console.error('Error reordering tracks:', error);
    }
  };

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<Track>) => {
    const trackIndex = getIndex();
    return (
      <ScaleDecorator>
        <TouchableOpacity
          style={[
            styles.trackItem,
            { backgroundColor: isActive ? '#333' : backgroundColor }
          ]}
          onLongPress={drag}
          onPress={() => handleTrackPress(trackIndex)}
          delayLongPress={100}
          disabled={isActive}
        >
          <View style={styles.trackInfo}>
            <Image source={{ uri: item.albumImages?.[0]?.url || playlist.images[0].url }} style={styles.trackImage} />
            <Text style={[styles.trackNumber, { color: secondaryTextColor }]}>
              {trackIndex + 1}
            </Text>
            <View style={styles.trackDetails}>
              <Text style={[styles.trackTitle, { color: textColor }]}>
                {item.name}
              </Text>
              <Text style={[styles.trackArtist, { color: secondaryTextColor }]}>
                {item.artists.join(', ')}
              </Text>
            </View>
            <View style={styles.dragHandle}>
              <Icon name="reorder-three-outline" size={24} color="#ffffff" />
            </View>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Icon name="chevron-down" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: playlist.images[0].url }} style={styles.coverArt} />

        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: textColor }]}>{playlist.name}</Text>
          {playlist.description && (
            <Text style={[styles.description, { color: secondaryTextColor }]}>
              {playlist.description}
            </Text>
          )}
          <View style={styles.ownerInfo}>
            <Text style={[styles.owner, { color: secondaryTextColor }]}>
              Created by {playlist.owner}
            </Text>
            {playlist.followers && (
              <Text style={[styles.followers, { color: secondaryTextColor }]}>
                {playlist.followers} followers
              </Text>
            )}
          </View>
          {playlist.collaborative && (
            <View style={styles.collaborativeBadge}>
              <Text style={styles.collaborativeText}>Collaborative</Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPlaylist}>
            <Icon name="play" size={24} color="#ffffff" />
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
            <Icon name="shuffle" size={24} color="#ffffff" />
            <Text style={styles.shuffleButtonText}>Shuffle</Text>
          </TouchableOpacity>

        </View>

        <DraggableFlatList
          data={orderedTracks}
          onDragEnd={handleDragEnd}
          style={{ flex: 1 }}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
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
  coverArt: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginTop: 8,
  },
  ownerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  owner: {
    fontSize: 16,
  },
  followers: {
    fontSize: 16,
  },
  collaborativeBadge: {
    marginTop: 8,
    backgroundColor: '#1DB954',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  collaborativeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    padding: 12,
    borderRadius: 25,
    marginRight: 10,
  },
  playButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 25,
    marginRight: 10,
  },
  shuffleButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
  },
  trackItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackImage: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: 'cover',
  },
  trackNumber: {
    fontSize: 16,
    width: 30,
  },
  trackDetails: {
    marginLeft: 10,
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
  },
  trackArtist: {
    fontSize: 14,
    marginTop: 4,
  },
  removeButton: {
    padding: 10,
  },
  dragHandle: {
    padding: 10,
  }
});