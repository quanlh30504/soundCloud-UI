import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Track } from 'react-native-track-player';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';

import trackPlayerService from '../../services/player/TrackPlayerService';
import MoreOptionsMenu from '../../components/common/MoreOptionsMenu';
import {RepeatMode, State} from 'react-native-track-player';
interface QueueData {
  beforeActive: Track[];
  active: Track | null;
  afterActive: Track[];
}

interface QueueScreenProps {
  visible: boolean;
  onClose: () => void;
}

const QueueScreen: React.FC<QueueScreenProps> = ({ visible, onClose }) => {
  const [queueData, setQueueData] = useState<QueueData>({ beforeActive: [], active: null, afterActive: [] });
  const [loading, setLoading] = useState(false);
  const [isTrackOptionsVisible, setIsTrackOptionsVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isSelectedTrackLiked, setIsSelectedTrackLiked] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isPlayingActiveTrack, setIsPlayingActiveTrack] = useState(false);

  useEffect(() => {
    const firstLoad = async () => {
      try {
        setLoading(true);
        await loadQueueWithStatus();
        setIsPlayingActiveTrack(await trackPlayerService.getPlayBackState() === State.Playing);
        trackPlayerService.setRepeatMode(RepeatMode.Off);
      } catch (error) {
        console.error("Error loading queue:", error);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      firstLoad();
    }
  }, [visible]);
  
    const loadQueueWithStatus = async () => {
      try {
        const data = await trackPlayerService.getQueueWithStatus();
        setQueueData(data);
      } catch (error) {
        console.error("Error loading queue:", error);
      }
    };

  const toggleRepeatMode = async () => {
    const currentMode = await trackPlayerService.getRepeatMode();
    console.log('Current repeat mode:', currentMode);
    setIsRepeating(currentMode === RepeatMode.Off ? true : false);
    trackPlayerService.setRepeatMode(currentMode === RepeatMode.Off ? RepeatMode.Queue : RepeatMode.Off);
  }

  const handleShufflePress = async () => {
    setLoading(true);
    try {
      await trackPlayerService.shuffleNextInQueue();
      await loadQueueWithStatus();
    } catch (error) {
      console.error("Error toggling shuffle mode:", error);
    } finally {
      setLoading(false);
    }
  }


  const handlePlayTrack = async (trackId: string) => {
    if (!trackId) return;
    await trackPlayerService.skipToTrack(trackId);
    await loadQueueWithStatus();
  };

  const togglePlayingActiveTrack = async () => {
    const isPlaying = await trackPlayerService.togglePlayback();
    setIsPlayingActiveTrack(isPlaying);
  }

  const handleTrackOptionsPress = async (track: Track) => {
    setSelectedTrack(track);
    if (track.id) {
      const isLiked = await trackPlayerService.isTrackLiked(track.id.toString());
      console.log('Track is liked:', isLiked);
      setIsSelectedTrackLiked(isLiked);
    }
    setIsTrackOptionsVisible(true);
  };

  const handleTrackLikeToggle = async () => {
    if (!selectedTrack?.id) return;
    
    const success = await trackPlayerService.toggleLikeTrack(selectedTrack.id.toString());
    if (success) {
      setIsSelectedTrackLiked(!isSelectedTrackLiked);
    }
  };

  const handleDragEnd = async ({ from, to, data }: { from: number; to: number; data: Track[] }) => {
    // Convert "afterActive" indices to global queue indices
    const actualFromIndex = queueData.beforeActive.length + (queueData.active ? 1 : 0) + from;
    const actualToIndex = queueData.beforeActive.length + (queueData.active ? 1 : 0) + to;

    
    const success = await trackPlayerService.moveTrackInQueue(actualFromIndex, actualToIndex);
    
    if (success) {
      setQueueData(prev => ({
        ...prev,
        afterActive: data
      }));
    } else {
      // If the operation failed, reload the queue to ensure UI consistency
      loadQueueWithStatus();
    }
  };

  
  const renderBeforeActiveTrackItem = ({ item }: { item: Track }) => (
    <TouchableOpacity
      style={[styles.trackItem, styles.dimmedTrackItem]}
      onPress={() => handlePlayTrack(item.id?.toString() || '')}
    >
      <Image
        source={{ uri: item.artwork ? String(item.artwork) : 'https://fakeimg.pl/60x60' }}
        style={styles.trackThumbnail}
      />
      <View style={styles.trackInfo}>
        <Text style={[styles.trackName, styles.dimmedText]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.artistName, styles.dimmedText]} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => handleTrackOptionsPress(item)}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#777777" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderActiveTrackItem = (track: Track | null) => {
    if (!track) return null;
    return (
      <TouchableOpacity
        style={styles.trackItem}
        onPress={() => togglePlayingActiveTrack()}
      >
        <Image
          source={{ uri: track.artwork ? String(track.artwork) : 'https://fakeimg.pl/60x60' }}
          style={styles.trackThumbnail}
        />
        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={isPlayingActiveTrack ? styles.nowPlayingText : styles.pausedText} numberOfLines={1}>
            {isPlayingActiveTrack ? 'Now Playing' : 'Paused'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleTrackOptionsPress(track)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#AAAAAA" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderAfterActiveTrackItem = ({ item, drag, isActive }: RenderItemParams<Track>) => (
    <ScaleDecorator>
      <TouchableOpacity
        style={[styles.trackItem, isActive && styles.activeTrackItem]}
        onPress={() => handlePlayTrack(item.id?.toString() || '')}
        onLongPress={drag}
        delayLongPress={150} // Reduce delay to make dragging more responsive
      >
        <Image
          source={{ uri: item.artwork ? String(item.artwork) : 'https://fakeimg.pl/60x60' }}
          style={styles.trackThumbnail}
        />
        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.dragHandle}
          onPressIn={drag} // Use onPressIn instead of onLongPress for more immediate response
        >
          <Ionicons name="reorder-three" size={24} color="#AAAAAA" />
        </TouchableOpacity>
      </TouchableOpacity>
    </ScaleDecorator>
  );


  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5500" />
        </View>
      );
    }

    if (queueData.beforeActive.length === 0 && !queueData.active && queueData.afterActive.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tracks in the queue</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.queueListContainer}>
        {/* Before Active Tracks */}
        {queueData.beforeActive.map((item, index) => (
          <React.Fragment key={`before-${item.id || index}`}>
            {renderBeforeActiveTrackItem({ item })}
          </React.Fragment>
        ))}
        
        {/* Active Track */}
        {queueData.active && renderActiveTrackItem(queueData.active)}
        
        {/* After Active Tracks (Draggable) */}
        {queueData.afterActive.length > 0 && (
          <View style={styles.afterActiveTracksContainer}>
            <DraggableFlatList
              data={queueData.afterActive}
              renderItem={renderAfterActiveTrackItem}
              keyExtractor={(item, index) => `after-${item.id || index}`}
              onDragEnd={handleDragEnd}
              scrollEnabled={false} // Disable scrolling in DraggableFlatList
              dragHitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
          </View>
        )}
        
        {/* Add some bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeButtonCircle}>
                <Ionicons name="close" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Next up</Text>
            
            <View style={styles.headerRightButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={handleShufflePress}>
                <Ionicons name="shuffle" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={toggleRepeatMode}>
                <Ionicons name="repeat" size={24}
                  color={isRepeating ? '#FF5500' : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Queue Content */}
          {renderContent()}
          
          {/* Track Options Menu */}
          <MoreOptionsMenu
            visible={isTrackOptionsVisible}
            onClose={() => {
              setIsTrackOptionsVisible(false);
              setSelectedTrack(null);
              // setIsSelectedTrackLiked(false);
            }}
            title={selectedTrack?.title || ''}
            subtitle={selectedTrack?.artist || ''}
            thumbnailUrl={selectedTrack?.artwork ? String(selectedTrack.artwork) : 'https://fakeimg.pl/60x60'}
            options={[
              { 
                icon: isSelectedTrackLiked ? 'heart' : 'heart-outline', 
                label: isSelectedTrackLiked ? 'Unlike' : 'Like', 
                onPress: handleTrackLikeToggle 
              },
              { 
                icon: 'add-circle-outline', 
                label: 'Add to playlist', 
                onPress: () => console.log('Add to playlist') 
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
        </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRightButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  queueListContainer: {
    flex: 1,
  },
  afterActiveTracksContainer: {
    // This makes the DraggableFlatList take up only the space it needs
    height: 'auto',
  },
  bottomPadding: {
    height: 20,
  },
  dragPreview: {
    width: 300,
    backgroundColor: '#333',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  draggableFlatListContainer: {
    flex: 1,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  activeTrackItem: {
    backgroundColor: '#333333',
  },
  dimmedTrackItem: {
    opacity: 0.6,
  },
  trackThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  nowPlayingText: {
    fontSize: 14,
    color: '#FF5500',
  },
  pausedText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  dimmedText: {
    color: '#999999',
  },
  moreButton: {
    padding: 8,
  },
  dragHandle: {
    padding: 8,
  }
});

export default QueueScreen;
