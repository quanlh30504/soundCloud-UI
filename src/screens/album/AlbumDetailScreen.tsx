import React, { useEffect, useState } from 'react';
import {View,Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import TrackPlayer, { Track } from 'react-native-track-player';
import DraggableFlatList, {RenderItemParams, ScaleDecorator} from 'react-native-draggable-flatlist';
import  {GestureHandlerRootView} from 'react-native-gesture-handler';

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
  const [orderedTracks, setOrderedTracks] = useState<Track[]>(album.tracks);

  const backgroundColor = '#121212';
  const textColor = '#ffffff';
  const secondaryTextColor = '#a0a0a0';

  useEffect(() => {
    
    // setOrderedTracks([...album.tracks]);
    const setupQueue = async () => {
      try {
        await TrackPlayer.reset();
        await TrackPlayer.add(album.tracks);
        console.log('Album tracks added to queue');
      } catch (error) {
        console.error('Error album queue:', error);
      }
    };
    setupQueue();
  }, []);

  const handlePlayAlbum = async () => {
    try {
      await TrackPlayer.skip(0);
      await TrackPlayer.play();
      navigation.navigate('MusicPlayer'); 
    } catch (error) {
      console.error('Error playing album:', error);
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

  const handleDragEnd = async ({ data} : {data: Track[]}) => {
    setOrderedTracks(data);
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(data);
      console.log('Reordered tracks added to queue');
    } catch (error) {
      console.error('Error reordering tracks:', error);
    }
  }

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
  }

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<Track>) => {
    const trackIndex = getIndex(); 
    return (
      <ScaleDecorator>
        <TouchableOpacity
          style={[
            styles.trackItem,
            {backgroundColor: isActive ? '#333' : backgroundColor}
          ]}
          onLongPress={drag}
          onPress={() => handleTrackPress(trackIndex)}
          delayLongPress={100}
          disabled={isActive}
          >
            <View style={styles.trackInfo}>
              <Image source={album.coverArt} style={styles.trackImage} />
              <Text style={[styles.trackNumber, { color: secondaryTextColor }]}>
                {trackIndex + 1}
              </Text>
              <View style={styles.trackDetails}>
                <Text style={[styles.trackTitle, { color: textColor }]}>
                  {item.title}
                </Text>
                <Text style={[styles.trackArtist, { color: secondaryTextColor }]}>
                  {item.artist}
                </Text>
              </View>
              <View style={styles.dragHandle}>
                <Icon name="reorder-three-outline" size={24} color="#ffffff" />
              </View>
            </View>
        </TouchableOpacity>
      </ScaleDecorator>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Icon name="chevron-down" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

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
            <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
              <Icon name="shuffle" size={24} color="#ffffff" />
              <Text style={styles.shuffleButtonText}>Shuffle</Text>
            </TouchableOpacity>
          </View>

          <DraggableFlatList 
            data={orderedTracks} 
            onDragEnd={handleDragEnd} 
            style={{ flex:1}} 
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
    padding: 20, 
  },
  title: {
    fontSize: 28, 
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 20, 
    marginTop: 8, 
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    padding: 12,
    marginRight: 20,
    borderRadius: 25, 
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
  dragHandle: {
    padding: 10,
  }
});