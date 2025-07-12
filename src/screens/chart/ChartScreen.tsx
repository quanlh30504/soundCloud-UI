import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import { chartApi } from '../../services/api';
import { ChartHomeData, SongData, WeekChartInfo } from '../../types/zing';
import { LineChart } from 'react-native-chart-kit';
import TrackItem from '../../components/common/TrackItem';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrackPlayerService from '../../services/player/TrackPlayerService';

const { width: screenWidth } = Dimensions.get('window');

interface WeekChartSectionProps {
  title: string;
  region: string;
  data: WeekChartInfo;
  onViewMore: (region: string, data: WeekChartInfo) => void;
  onTrackPress: (track: SongData) => void;
}

const WeekChartSection: React.FC<WeekChartSectionProps> = ({
  title,
  region,
  data,
  onViewMore,
  onTrackPress,
}) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Safety check for data
  if (!data || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return (
      <View style={styles.weekChartSection}>
        <View style={styles.weekChartHeader}>
          <Text style={[styles.weekChartTitle, { color: themeStyles.colors.text }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.noDataText, { color: themeStyles.colors.textSecondary }]}>
          Chưa có dữ liệu cho {title}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.weekChartSection}>
      <View style={styles.weekChartHeader}>
        <Text style={[styles.weekChartTitle, { color: themeStyles.colors.text }]}>
          {title}
        </Text>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => onViewMore(region, data)}
        >
          <Text style={[styles.viewMoreText, { color: themeStyles.colors.primary }]}>
            Xem thêm
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={themeStyles.colors.primary}
          />
        </TouchableOpacity>
      </View>
			<View style={styles.weekChartList}>
        {data.items
          .slice(0, 5)
          .filter(track => track && track.encodeId && track.title)
          .map((track, index) => (
            <View key={track.encodeId} style={styles.weekChartItem}>
              <Text style={[styles.rankNumber, { color: themeStyles.colors.text }]}>
                {index + 1}
              </Text>              
							<TrackItem
                track={track}
                onPress={() => onTrackPress(track)}
                showMoreOptions={false}
                style={styles.trackItemContainer}
              />
            </View>
          ))}
      </View>
    </View>
  );
};

export default function ChartScreen() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation();

  const [chartData, setChartData] = useState<ChartHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await chartApi.getChartHome();
      setChartData(response.data);
    } catch (err) {
      setError('Không thể tải dữ liệu chart');
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  };  const handleViewMoreWeekChart = (region: string, data: WeekChartInfo) => {
    // Navigate to full week chart screen
    (navigation as any).navigate('WeekChartDetail', { 
      region, 
      data,
      allChartData: chartData?.weekChart 
    });
  };

  const handlePlayTrack = async (track: SongData) => {
    try {
      await TrackPlayerService.playTrack(track);
      console.log('Playing track:', track.title);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };
  const renderRTChart = () => {
    if (!chartData?.RTChart || !chartData.RTChart.items || chartData.RTChart.items.length === 0) return null;

    const top3Songs = chartData.RTChart.items.slice(0, 3);
    const chartItems = chartData.RTChart.chart?.items || {};

    // Validate that we have chart items
    if (Object.keys(chartItems).length === 0) {
      return (
        <View style={styles.rtChartSection}>
          <Text style={[styles.sectionTitle, { color: themeStyles.colors.text }]}>
            Bảng Xếp Hạng Realtime
          </Text>
          <Text style={[styles.noDataText, { color: themeStyles.colors.textSecondary }]}>
            Chưa có dữ liệu biểu đồ
          </Text>
        </View>
      );
    }    // Get all unique time points from the first song's data to create labels
    const firstSongData = chartItems[top3Songs[0]?.encodeId] || [];
    if (firstSongData.length === 0) {
      return (
        <View style={styles.rtChartSection}>
          <Text style={[styles.sectionTitle, { color: themeStyles.colors.text }]}>
            Bảng Xếp Hạng Realtime
          </Text>
          <Text style={[styles.noDataText, { color: themeStyles.colors.textSecondary }]}>
            Chưa có dữ liệu biểu đồ
          </Text>
        </View>
      );
    }

    // Sort by time to get the correct chronological order
    const sortedTimeData = firstSongData.sort((a, b) => a.time - b.time);
    
    // Create labels from actual data (show every 3rd hour for readability)
    const labels = sortedTimeData
      .filter((_, index) => index % 3 === 0)
      .map(item => `${item.hour}h`);
    
    // Prepare datasets for each top song
    const datasets = top3Songs.map((song, index) => {
      const songChartData = chartItems[song.encodeId] || [];
      
      // Sort by time to ensure correct order
      const sortedSongData = songChartData.sort((a, b) => a.time - b.time);
      
      // Extract counter values in chronological order
      const scores = sortedSongData.map(item => {
        const score = Number(item.counter);
        return isNaN(score) ? 0 : score;
      });

      const colors = ['#FF6B35', '#F7931E', '#FFD23F'];
      
      return {
        data: scores,
        color: () => colors[index] || '#FF6B35',
        strokeWidth: 2,
      };
    });

    return (
      <View style={styles.rtChartSection}>
        <Text style={[styles.sectionTitle, { color: themeStyles.colors.text }]}>
          Bảng Xếp Hạng Realtime
        </Text>      				
				{/* Top 3 songs info */}
        <View style={styles.top3Container}>
          {top3Songs
            .filter(song => song && song.encodeId && song.title)
            .map((song, index) => (
              <TouchableOpacity 
                key={song.encodeId} 
                style={styles.top3Item}
                onPress={() => handlePlayTrack(song)}
                activeOpacity={0.7}
              >
                <View style={[styles.rankBadge, { backgroundColor: ['#FF6B35', '#F7931E', '#FFD23F'][index] }]}>
                  <Text style={styles.rankBadgeText}>{index + 1}</Text>
                </View>
                <Text style={[styles.songTitle, { color: themeStyles.colors.text }]} numberOfLines={1}>
                  {song.title || 'Unknown Title'}
                </Text>
                <Text style={[styles.artistName, { color: themeStyles.colors.textSecondary }]} numberOfLines={1}>
                  {song.artistsNames || 'Unknown Artist'}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
          {/* Chart */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {datasets.length > 0 && datasets.every(dataset => 
            dataset.data.length > 0 && 
            dataset.data.every(value => typeof value === 'number' && !isNaN(value))
          ) ? (
            <LineChart
              data={{
                labels: labels,
                datasets: datasets,
              }}
              width={Math.max(screenWidth + 100, labels.length * 60)} // Dynamic width based on data points
              height={220}
              chartConfig={{
                backgroundColor: themeStyles.colors.background,
                backgroundGradientFrom: themeStyles.colors.background,
                backgroundGradientTo: themeStyles.colors.background,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '1',
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.chartPlaceholder}>
              <Text style={[styles.noDataText, { color: themeStyles.colors.textSecondary }]}>
                Dữ liệu biểu đồ không hợp lệ
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };
  const renderWeekChart = () => {
    if (!chartData?.weekChart) return null;

    const { weekChart } = chartData;

    return (
      <View style={styles.weekChartContainer}>
        <Text style={[styles.sectionTitle, { color: themeStyles.colors.text }]}>
          Bảng Xếp Hạng Tuần
        </Text>
          {weekChart.vn && (
          <WeekChartSection
            title="Việt Nam"
            region="vn"
            data={weekChart.vn}
            onViewMore={handleViewMoreWeekChart}
            onTrackPress={handlePlayTrack}
          />
        )}
        
        {weekChart.us && (
          <WeekChartSection
            title="US-UK"
            region="us"
            data={weekChart.us}
            onViewMore={handleViewMoreWeekChart}
            onTrackPress={handlePlayTrack}
          />
        )}
        
        {weekChart.korea && (
          <WeekChartSection
            title="K-Pop"
            region="korea"
            data={weekChart.korea}
            onViewMore={handleViewMoreWeekChart}
            onTrackPress={handlePlayTrack}
          />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeStyles.colors.primary} />
          <Text style={[styles.loadingText, { color: themeStyles.colors.text }]}>
            Đang tải dữ liệu chart...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: themeStyles.colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchChartData}>
            <Text style={[styles.retryText, { color: themeStyles.colors.primary }]}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderRTChart()}
        {renderWeekChart()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  rtChartSection: {
    marginBottom: 32,
  },
  top3Container: {
    marginBottom: 16,
  },
  top3Item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  songTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  artistName: {
    fontSize: 12,
    width: 100,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  weekChartContainer: {
    marginBottom: 32,
  },
  weekChartSection: {
    marginBottom: 24,
  },
  weekChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekChartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    marginRight: 4,
  },
  weekChartList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 8,
  },
  weekChartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 24,
    textAlign: 'center',
    marginRight: 12,
  },  trackItemContainer: {
    flex: 1,
  },  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  chartPlaceholder: {
    width: screenWidth + 100,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginVertical: 8,
  },
});
