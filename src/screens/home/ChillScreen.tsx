import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { homeApi } from '../../services/api';
import NavigationService from '../../services/navigation/NavigationService';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';

interface ChillItem {
  encodeId: string;
  title: string;
  thumbnail: string;
  thumbnailM?: string;
  sortDescription?: string;
  artistsNames?: string;
  isAlbum?: boolean;
  textType?: string;
}

interface ChillSection {
  sectionType: string;
  viewType: string;
  title: string;
  link: string;
  sectionId: string;
  items: ChillItem[];
}

interface ChillData {
  encodeId: string;
  title: string;
  description: string;
  sections: ChillSection[];
}

export default function ChillScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const [chillData, setChillData] = useState<ChillData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { hubId } = route.params || {};

  useEffect(() => {
    fetchChillData();
  }, []);

  const fetchChillData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await homeApi.getHubDetailChill();
      if (data) {
        setChillData(data);
      }
    } catch (err) {
      console.error('Error fetching chill data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaylistPress = (playlistId: string) => {
    NavigationService.navigateToPlaylist(playlistId);
  };

  const renderChillItem = (item: ChillItem, index: number) => (
    <TouchableOpacity
      key={item.encodeId || `item-${index}`}
      style={styles.chillItem}
      onPress={() => handlePlaylistPress(item.encodeId)}
    >
      <Image
        source={{ uri: item.thumbnailM || item.thumbnail }}
        style={styles.chillCover}
      />      
      <View style={styles.chillInfo}>
        <Text style={[styles.chillTitle, { color: themeStyles.colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.chillDescription, { color: themeStyles.colors.secondary }]} numberOfLines={1}>
          {item.sortDescription || item.artistsNames || item.textType || 'Playlist'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: ChillSection, sectionIndex: number) => {
    if (!section.items || section.items.length === 0) {
      return null;
    }

    // Lọc các items hợp lệ (có encodeId và title)
    const validItems = section.items.filter(item => item && item.encodeId && item.title);

    if (validItems.length === 0) {
      return null;
    }    
    return (
      <View key={`section-${sectionIndex}`} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeStyles.colors.text }]}>{section.title}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {validItems.map((item, index) => renderChillItem(item, index))}
        </ScrollView>
      </View>
    );
  };
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={themeStyles.colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeStyles.colors.text }]}>Chill</Text>
          <View style={styles.headerRight} />
        </View>        
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={themeStyles.colors.primary} />
          <Text style={[styles.loadingText, { color: themeStyles.colors.text }]}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={themeStyles.colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeStyles.colors.text }]}>Chill</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.centerContainer}>
          <Icon name="alert-circle-outline" size={48} color={themeStyles.colors.primary} />
          <Text style={[styles.errorText, { color: themeStyles.colors.text }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: themeStyles.colors.primary }]} onPress={fetchChillData}>
            <Text style={[styles.retryButtonText, { color: '#ffffff' }]}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={themeStyles.colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeStyles.colors.text }]}>Chill</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="search-outline" size={22} color={themeStyles.colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="ellipsis-vertical" size={22} color={themeStyles.colors.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >        
      {/* Header Info */}
        {chillData && (
          <View style={styles.headerInfo}>
            <Text style={[styles.mainTitle, { color: themeStyles.colors.text }]}>{chillData.title}</Text>
            {chillData.description && (
              <Text style={[styles.description, { color: themeStyles.colors.secondary }]}>{chillData.description}</Text>
            )}
          </View>
        )}

        {/* Sections */}
        {chillData?.sections?.map((section, index) => renderSection(section, index))}
      </ScrollView>
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
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
    justifyContent: 'flex-end',
  },
  iconButton: {
    marginLeft: 8,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  headerInfo: {
    padding: 16,
    paddingBottom: 8,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  horizontalScroll: {
    marginTop: 8,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  chillItem: {
    width: 150,
    marginRight: 16,
  },
  chillCover: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  chillInfo: {
    marginTop: 8,
  },
  chillTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 4,
  },
  chillDescription: {
    color: '#a0a0a0',
    fontSize: 12,
    lineHeight: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ff5500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
