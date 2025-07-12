import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, FlatList,
  ActivityIndicator, StatusBar, SafeAreaView, Alert, RefreshControl
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { artistApi } from '../../services/api';
import { Album } from '../../types/zing';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import NavigationService from '../../services/navigation/NavigationService';

const ArtistPlaylistsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { artistId } = route.params as { artistId: string };
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  const [playlists, setPlaylists] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }
      
      const response = await artistApi.getArtistPlaylists(artistId, pageNum, 20);
      const newPlaylists = response.items || [];
      
      if (append) {
        setPlaylists(prev => [...prev, ...newPlaylists]);
      } else {
        setPlaylists(newPlaylists);
      }
      
      // Check if there are more items
      setHasMore(newPlaylists.length === 20);
      setPage(pageNum);
      
    } catch (err) {
      console.error('Failed to load artist playlists:', err);
      setError('Không thể tải danh sách playlist');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchPlaylists(page + 1, true);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchPlaylists(1, false);
    setRefreshing(false);
  };
  const handlePlaylistPress = (playlist: Album) => {
    NavigationService.navigateToPlaylist(playlist.encodeId);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  const renderPlaylistItem = ({ item, index }: { item: Album; index: number }) => (
    <TouchableOpacity 
      style={styles.playlistItem}
      onPress={() => handlePlaylistPress(item)}
    >
      <Image 
        source={{ uri: item.thumbnailM || item.thumbnail }} 
        style={styles.playlistImage} 
        resizeMode="cover"
      />
      
      <View style={styles.playlistInfo}>
        <Text style={[styles.playlistTitle, { color: themeStyles.colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.playlistArtist, { color: themeStyles.colors.secondary }]} numberOfLines={1}>
          {item.artistsNames}
        </Text>
        <Text style={[styles.playlistDate, { color: themeStyles.colors.secondary }]}>
          {formatDate(item.releaseDate)}
        </Text>        
        {item.song && (
          <Text style={[styles.trackCount, { color: themeStyles.colors.secondary }]}>
            {item.song.total} bài hát
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: themeStyles.colors.text }]}>
          {playlists.length} playlist
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={themeStyles.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="musical-notes-outline" size={64} color={themeStyles.colors.secondary} />
      <Text style={[styles.emptyText, { color: themeStyles.colors.secondary }]}>Không có playlist nào</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Playlist</Text>
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
          <Text style={styles.headerTitle}>Playlist</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchPlaylists()}
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
        <Text style={[styles.headerTitle, { color: themeStyles.colors.text }]}>Playlist</Text>
        <TouchableOpacity>
          <Icon name="search" size={24} color={themeStyles.colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.encodeId}
        renderItem={renderPlaylistItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
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
    paddingVertical: 16,
  },
  statsContainer: {
    marginBottom: 8,
  },
  statsText: {
    color: '#888',
    fontSize: 14,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
    marginRight: 12,
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  playlistArtist: {
    color: '#888',
    fontSize: 14,
    marginBottom: 2,
  },
  playlistDate: {
    color: '#666',
    fontSize: 12,
    marginBottom: 2,
  },
  trackCount: {
    color: '#666',
    fontSize: 12,
  },
  moreButton: {
    padding: 8,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 16,
  },
});

export default ArtistPlaylistsScreen;
