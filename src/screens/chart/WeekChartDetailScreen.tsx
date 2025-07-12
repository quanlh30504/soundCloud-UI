import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import { WeekChartInfo, SongData } from '../../types/zing';
import TrackItem from '../../components/common/TrackItem';
import MoreOptionsMenu from '../../components/common/MoreOptionsMenu';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import TrackPlayerService from '../../services/player/TrackPlayerService';

type RouteParams = {
  region: string;
  data: WeekChartInfo;
  allChartData?: {
    vn: WeekChartInfo;
    us: WeekChartInfo;
    korea: WeekChartInfo;
  };
};

export default function WeekChartDetailScreen() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const [selectedRegion, setSelectedRegion] = useState(params.region);
  const [currentData, setCurrentData] = useState(params.data);
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SongData | null>(null);
  const [isSelectedTrackLiked, setIsSelectedTrackLiked] = useState<boolean>(false);

  const regions = [
    { key: 'vn', title: 'Việt Nam' },
    { key: 'us', title: 'US-UK' },
    { key: 'korea', title: 'K-Pop' },
  ];

  const handleRegionChange = (regionKey: string) => {
    setSelectedRegion(regionKey);
    if (params.allChartData) {
      setCurrentData(params.allChartData[regionKey as keyof typeof params.allChartData]);
    }
  };

  const handlePlayTrack = async (track: SongData) => {
    try {
      await TrackPlayerService.playTrack(track);
      console.log('Playing track:', track.title);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const checkLikeStatus = async (track: SongData) => {
    if (track?.encodeId) {
      const liked = await TrackPlayerService.isTrackLiked(track.encodeId);
      console.log("Track ID:", track.encodeId, "is liked:", liked);
      setIsSelectedTrackLiked(liked);
    }
  };

  const handleLikeToggle = async () => {
    if (!selectedTrack?.encodeId) return;
    console.log("Toggling like status for track ID:", selectedTrack.encodeId);
    const isSuccess = await TrackPlayerService.toggleLikeTrack(selectedTrack.encodeId);
    if (isSuccess) {
      setIsSelectedTrackLiked(!isSelectedTrackLiked);
    } else {
      console.error("Failed to toggle like status");
    }
  };

  const handleAddToPlaylist = async () => {
    if (!selectedTrack) return;
    
    // Close the more options menu
    setMoreOptionsVisible(false);
      // Navigate to AddToPlaylist screen with track info
    (navigation as any).navigate('AddToPlaylist', {
      trackId: selectedTrack.encodeId,
      trackName: selectedTrack.title,
      artistName: selectedTrack.artistsNames,
      trackArtwork: selectedTrack.thumbnailM || selectedTrack.thumbnail
    });
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeStyles.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={themeStyles.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeStyles.colors.text }]}>
          Bảng Xếp Hạng Tuần
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Region Tabs */}
      {params.allChartData && (
        <View style={styles.tabContainer}>
          {regions.map((region) => (
            <TouchableOpacity
              key={region.key}
              style={[
                styles.tab,
                selectedRegion === region.key && {
                  backgroundColor: themeStyles.colors.primary,
                },
              ]}
              onPress={() => handleRegionChange(region.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedRegion === region.key
                      ? '#fff'
                      : themeStyles.colors.text,
                  },
                ]}
              >
                {region.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Track List */}
      <FlatList
        data={currentData.items}
        keyExtractor={(item) => item.encodeId}
        renderItem={({ item, index }) => (
          <View style={styles.trackItemContainer}>
            <Text style={[styles.rankNumber, { color: themeStyles.colors.text }]}>
              {index + 1}
            </Text>            
            <TrackItem
              track={item}
              onPress={() => handlePlayTrack(item)}
              onMoreOptions={() => handleTrackMoreOptionsPress(item)}
              style={styles.trackItem}
            />
          </View>
        )}        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* More Options Menu for Track */}
      {selectedTrack && (
        <MoreOptionsMenu
          visible={moreOptionsVisible}
          onClose={handleCloseMoreOptions}
          title={selectedTrack.title}
          subtitle={selectedTrack.artistsNames}
          thumbnailUrl={selectedTrack.thumbnailM || selectedTrack.thumbnail}
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
            { 
              icon: 'information-circle-outline', 
              label: 'View details', 
              onPress: () => console.log('View details', selectedTrack.encodeId) 
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  trackItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 32,
    textAlign: 'center',
  },
  trackItem: {
    flex: 1,
    paddingLeft: 0,
  },
});
