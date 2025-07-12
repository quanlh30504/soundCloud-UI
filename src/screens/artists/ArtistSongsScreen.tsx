import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, FlatList,
  ActivityIndicator, StatusBar, SafeAreaView, Alert, RefreshControl
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { artistApi, trackApi } from '../../services/api';
import TrackPlayerService from '../../services/player/TrackPlayerService';
import { SongData } from '../../types/zing';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import MoreOptionsMenu from '../../components/common/MoreOptionsMenu';

const ArtistSongsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { artistId } = route.params as { artistId: string };
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  const [songs, setSongs] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SongData | null>(null);
  const [isSelectedTrackLiked, setIsSelectedTrackLiked] = useState<boolean>(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }
      
      const response = await artistApi.getArtistSongs(artistId, pageNum, 20);
      const newSongs = response.items || [];
      
      if (append) {
        setSongs(prev => [...prev, ...newSongs]);
      } else {
        setSongs(newSongs);
      }
      
      // Check if there are more items
      setHasMore(newSongs.length === 20);
      setPage(pageNum);
      
    } catch (err) {
      console.error('Failed to load artist songs:', err);
      setError('Không thể tải danh sách bài hát');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchSongs(page + 1, true);
    }
  };
  const handlePlayTrack = async (track: SongData) => {
    try {
      await TrackPlayerService.playTrack(track);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchSongs(1, false);
    setRefreshing(false);
  };

  const handleTrackMoreOptionsPress = (track: SongData) => {
    setSelectedTrack(track);
    checkLikeStatus(track);
    setMoreOptionsVisible(true);
  };

  const handleCloseMoreOptions = () => {
    setMoreOptionsVisible(false);
    setSelectedTrack(null);
  };

  const checkLikeStatus = async (track: SongData) => {
    if (track?.encodeId) {
      const liked = await TrackPlayerService.isTrackLiked(track.encodeId);
      setIsSelectedTrackLiked(liked);
    }
  };

  const handleLikeToggle = async () => {
    if (!selectedTrack?.encodeId) return;
    const isSuccess = await TrackPlayerService.toggleLikeTrack(selectedTrack.encodeId);
    if (isSuccess) {
      setIsSelectedTrackLiked(!isSelectedTrackLiked);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!selectedTrack) return;
    
    setMoreOptionsVisible(false);
    
    (navigation as any).navigate('AddToPlaylist', {
      trackId: selectedTrack.encodeId,
      trackName: selectedTrack.title,
      artistName: selectedTrack.artistsNames,
      trackArtwork: selectedTrack.thumbnailM
    });
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderSongItem = ({ item, index }: { item: SongData; index: number }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => handlePlayTrack(item)}
    >
      <Image 
        source={{ uri: item.thumbnailM || item.thumbnail }} 
        style={styles.songImage} 
        resizeMode="cover"
      />
        <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: themeStyles.colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.songArtist, { color: themeStyles.colors.secondary }]} numberOfLines={1}>
          {item.artistsNames}
        </Text>
        <Text style={[styles.songDate, { color: themeStyles.colors.secondary }]}>
          {formatDate(item.releaseDate)}
        </Text>
      </View>
      
      <View style={styles.songActions}>
        <Text style={[styles.duration, { color: themeStyles.colors.secondary }]}>
          {formatDuration(item.duration)}
        </Text>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleTrackMoreOptionsPress(item)}
        >
          <Icon name="ellipsis-vertical" size={16} color={themeStyles.colors.secondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: themeStyles.colors.text }]}>
          {songs.length} bài hát
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#888" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bài hát</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#888" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bài hát</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchSongs()}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={[styles.header, { backgroundColor: themeStyles.colors.background, borderBottomColor: themeStyles.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={themeStyles.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeStyles.colors.text }]}>Bài hát</Text>
        <TouchableOpacity>
          <Icon name="search" size={24} color={themeStyles.colors.text} />
        </TouchableOpacity>
      </View><FlatList
        data={songs}
        keyExtractor={(item) => item.encodeId}
        renderItem={renderSongItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={themeStyles.colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* More Options Menu */}
      {selectedTrack && (
        <MoreOptionsMenu
          visible={moreOptionsVisible}
          onClose={handleCloseMoreOptions}
          title={selectedTrack.title}
          subtitle={selectedTrack.artistsNames}
          thumbnailUrl={selectedTrack.thumbnailM}
          options={[
            { 
              icon: isSelectedTrackLiked ? 'heart' : 'heart-outline', 
              label: isSelectedTrackLiked ? 'Unlike' : 'Like', 
              onPress: handleLikeToggle 
            },
            { 
              icon: 'share-outline', 
              label: 'Share', 
              onPress: () => console.log('Share track', selectedTrack.encodeId) 
            },
            { 
              icon: 'add-outline', 
              label: 'Add to playlist', 
              onPress: handleAddToPlaylist 
            },
            { 
              icon: 'download-outline', 
              label: 'Download', 
              onPress: () => console.log('Download track', selectedTrack.encodeId) 
            },
          ]}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  playAllContainer: {
    marginBottom: 16,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B68EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  playAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    marginTop: 8,
  },
  statsText: {
    color: '#888',
    fontSize: 14,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  songArtist: {
    color: '#888',
    fontSize: 14,
    marginBottom: 2,
  },
  songDate: {
    color: '#666',
    fontSize: 12,
  },
  songActions: {
    alignItems: 'flex-end',
  },
  duration: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  moreButton: {
    padding: 4,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default ArtistSongsScreen;
