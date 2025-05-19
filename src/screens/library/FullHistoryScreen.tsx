import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { historyApi, getTrackInfo } from '../../services/api';
import { ListeningHistoryDTO } from '../../types/history';
import { formatDistanceToNow } from 'date-fns';
import trackPlayerService from '../../services/player/TrackPlayerService';
import { Track } from 'react-native-track-player';
import { convertPathToUrl } from '../../ultis/convertUrl';
import { HistoryItem } from '../../components/history/HistoryItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HISTORY_FULL_SIZE = 100;

const EmptyComponent = ({ themeStyles }: { themeStyles: typeof darkTheme }) => (
  <Text style={[styles.emptyText, { color: themeStyles.colors.secondary }]}>
    No listening history yet
  </Text>
);

export default function FullHistoryScreen() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation<NavigationProp>();
  
  const [history, setHistory] = useState<ListeningHistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadHistory = async (pageNum: number = 0, shouldRefresh: boolean = false) => {
    try {
      const response = await historyApi.getListeningHistory(pageNum, HISTORY_FULL_SIZE);
      if (shouldRefresh) {
        setHistory(response.content);
      } else {
        setHistory(prev => [...prev, ...response.content]);
      }
      setHasMore(!response.last);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        await loadHistory(0, true);
      };
      
      loadData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadHistory(page + 1);
    }
  };

  const handleHistoryItemPress = async (item: ListeningHistoryDTO) => {
    try {
      const trackId = item.track.spotifyId;
      if (!trackId) return;

      let trackInfo = await getTrackInfo(trackId);
      console.log('Track info:', trackInfo);
      let streamUrl;

      let attempts = 0;
      const maxAttempts = 5; // 6 seconds / 2 seconds per attempt
      while (!trackInfo.filePath && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        trackInfo = await getTrackInfo(trackId);
        attempts++;
      }

      if (trackInfo.filePath) {
        streamUrl = trackInfo.filePath;
      } else {
        throw new Error('Bài hát chưa được load.');
      }

      let newTrack: Track = {
        id: trackId,
        url: String(convertPathToUrl(streamUrl)),
        title: trackInfo.name,
        artist: trackInfo.artists?.join(' & ') || 'Unknown Artist',
        artwork: item.track.albumImages[0].url,
      }

      console.log('New track:', newTrack);
      await trackPlayerService.addTracks([newTrack]);
      await trackPlayerService.playTrack(trackId);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const handleRemoveFromHistory = (itemId: number) => {
    setHistory(prev => prev.filter(item => item.id !== itemId));
  };

  const renderItem = ({ item }: { item: ListeningHistoryDTO }) => (
    <HistoryItem
      item={item}
      onPress={() => handleHistoryItemPress(item)}
      onRemove={() => handleRemoveFromHistory(item.id)}
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <ActivityIndicator 
        size="large" 
        color={themeStyles.colors.primary} 
        style={styles.loader}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={themeStyles.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeStyles.colors.text }]}>Listening History</Text>
        <View style={styles.headerRight} />
      </View>

      {/* History List */}
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={themeStyles.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? <EmptyComponent themeStyles={themeStyles} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40, // To balance the back button
  },
  listContent: {
    paddingHorizontal: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  historyArtwork: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
    marginRight: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyArtist: {
    fontSize: 14,
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
  },
  historyMore: {
    padding: 8,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playCount: {
    fontSize: 12,
  },
}); 