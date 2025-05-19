import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { playlistApi } from '../../services/api';
import { Playlist, Track } from '../../types/playlist';
import trackPlayerService from '../../services/player/TrackPlayerService';
import MoreOptionsMenu from '../../components/common/MoreOptionsMenu';

export default function PlaylistDetailScreen() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const route = useRoute();
  const initialPlaylist = route.params?.playlist as Playlist;

  const [playlist, setPlaylist] = useState<Playlist | null>(initialPlaylist);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isSelectedTrackLiked, setIsSelectedTrackLiked] = useState<boolean>(false);
  const [removingTrack, setRemovingTrack] = useState<boolean>(false);

  useEffect(() => {
    if (initialPlaylist?.id) {
      fetchPlaylistDetails(initialPlaylist.id);
    }
  }, [initialPlaylist]);

  const fetchPlaylistDetails = async (playlistId: string) => {
    setLoading(true);
    try {
      // Get updated playlist information
      const playlistResponse = await playlistApi.getOwnPlaylistById(playlistId);
      setPlaylist(playlistResponse.data);
      
      // Get tracks in the playlist
      const tracksResponse = await playlistApi.getOwnPlaylistTracks(playlistId, 0, 100);
      setTracks(tracksResponse.data.content);
    } catch (error) {
      console.error('Error fetching playlist details:', error);
      Alert.alert('Error', 'Failed to load playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async (track: Track) => {
    if (track?.spotifyId) {
      const liked = await trackPlayerService.isTrackLiked(track.spotifyId);
      console.log("Track ID:", track.spotifyId, "is liked:", liked);
      setIsSelectedTrackLiked(liked);
    }
  };

  const handleLikeToggle = async () => {
    if (!selectedTrack?.spotifyId) return;
    console.log("Toggling like status for track ID:", selectedTrack.spotifyId);
    const isSuccess = await trackPlayerService.toggleLikeTrack(selectedTrack.spotifyId);
    if (isSuccess) {
      setIsSelectedTrackLiked(!isSelectedTrackLiked);
    } else {
      console.error("Failed to toggle like status");
    }
  };

  const handleRefresh = async () => {
    if (playlist?.id) {
      setRefreshing(true);
      await fetchPlaylistDetails(playlist.id);
      setRefreshing(false);
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTracks(tracks);
    }
  };

  const handlePlayShuffle = () => {
    if (tracks.length > 0) {
      // Create a shuffled copy of the tracks
      const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
      playTracks(shuffledTracks);
    }
  };

  const playTracks = async (tracksToPlay: Track[]) => {
    try {
      const trackPlayerTracks = tracksToPlay.map(track => ({
        id: track.spotifyId,
        url: String(track?.streamUrl),
        title: track.name,
        artist: track.artists.join(', '),
        artwork: track.albumImages && track.albumImages.length > 0 
          ? track.albumImages[0].url
          : 'https://fakeimg.pl/300x300',
      }));
      
      await trackPlayerService.setQueue(trackPlayerTracks);
    } catch (error) {
      console.error('Error playing tracks:', error);
      Alert.alert('Error', 'Failed to play tracks. Please try again.');
    }
  };

  const handleTrackPress = (track: Track, index: number) => {
    // Play this track and queue the rest
    const tracksToPlay = [...tracks.slice(index), ...tracks.slice(0, index)];
    playTracks(tracksToPlay);
  };

  const handleMoreOptionsPress = () => {
    setMoreOptionsVisible(true);
  };

  const handleTrackMoreOptionsPress = (track: Track) => {
    setSelectedTrack(track);
    checkLikeStatus(track);
    setMoreOptionsVisible(true);
  };

  const handleCloseMoreOptions = () => {
    setMoreOptionsVisible(false);
  };

  const handleRemoveTrackFromPlaylist = async (trackId: number) => {
    if (!playlist?.id) return;
    
    setRemovingTrack(true);
    try {
      await playlistApi.removeTrackFromOwnPlaylist(playlist.id, trackId);
      
      // Update the local state to reflect the removal
      setTracks(tracks.filter(track => track.id !== trackId));
      
      // Update the playlist totalTracks count
      if (playlist) {
        setPlaylist({
          ...playlist,
          totalTracks: playlist.totalTracks - 1
        });
      }
      
      // Close the more options menu
      handleCloseMoreOptions();
      setSelectedTrack(null);
      
      // Show success message
      Alert.alert('Success', 'Track removed from playlist successfully');
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      Alert.alert('Error', 'Failed to remove track from playlist. Please try again.');
    } finally {
      setRemovingTrack(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderTrackItem = ({ item, index }: { item: Track, index: number }) => {
    // Default image or placeholder
    const thumbnailUrl = item.albumImages && item.albumImages.length > 0 
      ? item.albumImages[0].url 
      : 'https://fakeimg.pl/60x60';

    return (
      <TouchableOpacity 
        style={styles.trackItem}
        onPress={() => handleTrackPress(item, index)}
      >
        <Image 
          source={{ uri: thumbnailUrl }}
          style={styles.trackThumbnail}
        />
        <View style={styles.trackInfo}>
          <Text style={[styles.trackName, { color: themeStyles.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.artistName, { color: themeStyles.colors.secondary }]} numberOfLines={1}>
            {item.artists.join(', ')}
          </Text>
          <Text style={[styles.trackDuration, { color: themeStyles.colors.secondary }]}>
            {formatDuration(item.durationMs)}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleTrackMoreOptionsPress(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={themeStyles.colors.secondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Default playlist cover image
  const coverImageUrl = playlist?.images && playlist.images.length > 0 
    ? playlist.images[0].url 
    : 'https://fakeimg.pl/200x200';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeStyles.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeStyles.colors.text }]}>Playlist</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeStyles.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <View>
              {/* Playlist Info Section */}
              <View style={styles.playlistInfoContainer}>
                <Image 
                  source={{ uri: coverImageUrl }}
                  style={styles.coverImage}
                />
                <View style={styles.playlistTextInfo}>
                  <Text style={[styles.playlistName, { color: themeStyles.colors.text }]}>
                    {playlist?.name}
                  </Text>
                  <Text style={[styles.playlistType, { color: themeStyles.colors.secondary }]}>
                    Playlist
                  </Text>
                  <Text style={[styles.playlistOwner, { color: themeStyles.colors.secondary }]}>
                    By {playlist?.ownerName}
                  </Text>
                </View>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={handleMoreOptionsPress}
                >
                  <Ionicons name="ellipsis-horizontal" size={24} color={themeStyles.colors.text} />
                </TouchableOpacity>
                
                <View style={styles.playButtons}>
                  <TouchableOpacity 
                    style={styles.shuffleButton}
                    onPress={handlePlayShuffle}
                  >
                    <Ionicons name="shuffle" size={24} color={themeStyles.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={handlePlayAll}
                  >
                    <Ionicons name="play" size={24} color={themeStyles.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Tracks Header */}
              {tracks.length > 0 && (
                <View style={styles.tracksHeader}>
                  <Text style={[styles.tracksHeaderText, { color: themeStyles.colors.text }]}>
                    {playlist?.totalTracks} {playlist?.totalTracks === 1 ? 'track' : 'tracks'}
                  </Text>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyTracksContainer}>
              <Text style={[styles.emptyTracksText, { color: themeStyles.colors.secondary }]}>
                No tracks in this playlist yet.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}

      {/* More Options Menu for Playlist */}
      {playlist && !selectedTrack && (
        <MoreOptionsMenu
          visible={moreOptionsVisible}
          onClose={handleCloseMoreOptions}
          title={playlist.name}
          subtitle={playlist.ownerName}
          thumbnailUrl={coverImageUrl}
          options={[
            { 
              icon: 'create-outline', 
              label: 'Edit', 
              onPress: () => console.log('Edit playlist', playlist.id) 
            },
            { 
              icon: 'lock-closed-outline', 
              label: 'Make private', 
              onPress: () => console.log('Make private', playlist.id) 
            },
            { 
              icon: 'add-outline', 
              label: 'Add music', 
              onPress: () => console.log('Add music', playlist.id) 
            },
            { 
              icon: 'trash-outline', 
              label: 'Delete', 
              onPress: () => console.log('Delete playlist', playlist.id) 
            },
            { 
              icon: 'download-outline', 
              label: 'Export to json', 
              onPress: () => console.log('Export playlist', playlist.id) 
            }
          ]}
        />
      )}
      
      {/* More Options Menu for Track */}
      {selectedTrack && (
        <MoreOptionsMenu
          visible={moreOptionsVisible}
          onClose={() => {
            handleCloseMoreOptions();
            setSelectedTrack(null);
          }}
          title={selectedTrack.name}
          subtitle={selectedTrack.artists.join(', ')}
          thumbnailUrl={selectedTrack.albumImages && selectedTrack.albumImages.length > 0 
            ? selectedTrack.albumImages[0].url 
            : 'https://fakeimg.pl/60x60'}
          options={[
            { 
              icon: isSelectedTrackLiked ? 'heart' : 'heart-outline', 
              label: isSelectedTrackLiked ? 'Unlike' : 'Like', 
              onPress: handleLikeToggle 
            },
            { 
              icon: 'share-outline', 
              label: 'Share', 
              onPress: () => console.log('Share track', selectedTrack.id) 
            },
            { 
              icon: 'add-outline', 
              label: 'Add to playlist', 
              onPress: () => console.log('Add to playlist', selectedTrack.id) 
            },
            { 
              icon: 'download-outline', 
              label: 'Download', 
              onPress: () => console.log('Download track', selectedTrack.id) 
            },
            { 
              icon: 'trash-outline', 
              label: removingTrack ? 'Removing...' : 'Remove from playlist', 
              onPress: () => {
                if (!removingTrack && selectedTrack.id) {
                  handleRemoveTrackFromPlaylist(selectedTrack.id);
                }
              },
              disabled: removingTrack
            }
          ]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 0,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 70, // Increased bottom padding to account for tab bar
    flexGrow: 1,
  },
  playlistInfoContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  coverImage: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: '#525252',
    borderRadius: 1,
  },
  playlistTextInfo: {
    marginLeft: 16,
    flex: 1,
  },
  playlistName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playlistType: {
    fontSize: 16,
    marginBottom: 4,
  },
  playlistOwner: {
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  menuButton: {
    padding: 8,
  },
  playButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shuffleButton: {
    padding: 8,
    marginRight: 16,
  },
  playButton: {
    padding: 8,
  },
  tracksHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
    marginTop: 8,
  },
  tracksHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  trackThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 2,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    marginBottom: 2,
  },
  trackDuration: {
    fontSize: 12,
  },
  moreButton: {
    padding: 8,
  },
  emptyTracksContainer: {
    padding: 32,
    paddingBottom: 80, // Increased padding to account for tab bar
    alignItems: 'center',
  },
  emptyTracksText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
