import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,ScrollView,Image,TouchableOpacity,TextInput,Dimensions,StatusBar,SafeAreaView,FlatList,ActivityIndicator,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { searchApi, trackApi } from '../../services/api';
import { RecommendKeyword, AcSuggestions, SongDataRecommend, SongData } from '../../types/zing';
import trackPlayerService from '../../services/player/TrackPlayerService';

type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

interface Genre {
  id: string;
  name: string;
  backgroundColor: string[];
  borderColor: string;
  width: number | string;
  height: number;
}

const { width } = Dimensions.get('window');
const cardMargin = 8;
const cardGap = 8;

const genreData: Genre[] = [
  {
    id: 'hiphop',
    name: 'Hip Hop & Rap',
    backgroundColor: ['#667eea', '#764ba2'],
    borderColor: '#8343E2',
    width: '100%',
    height: 120,
  },
  {
    id: 'electronic',
    name: 'Electronic',
    backgroundColor: ['#f093fb', '#f5576c'],
    borderColor: '#FF4F9A',
    width: '100%',
    height: 140,
  },
  {
    id: 'pop',
    name: 'Pop',
    backgroundColor: ['#4facfe', '#00f2fe'],
    borderColor: '#FFCC00',
    width: '100%',
    height: 100,
  },
  {
    id: 'rnb',
    name: 'R&B',
    backgroundColor: ['#43e97b', '#38f9d7'],
    borderColor: '#00BFEF',
    width: '100%',
    height: 130,
  },
  {
    id: 'chill',
    name: 'Chill',
    backgroundColor: ['#fa709a', '#fee140'],
    borderColor: '#00BFEF',
    width: '100%',
    height: 110,
  },
  {
    id: 'party',
    name: 'Party',
    backgroundColor: ['#ff9a9e', '#fecfef'],
    borderColor: '#FF7F47',
    width: '100%',
    height: 120,
  },
  {
    id: 'workout',
    name: 'Workout',
    backgroundColor: ['#a8edea', '#fed6e3'],
    borderColor: '#10DE7D',
    width: '100%',
    height: 140,
  },
  {
    id: 'techno',
    name: 'Techno',
    backgroundColor: ['#d299c2', '#fef9d7'],
    borderColor: '#FF4F9A',
    width: '100%',
    height: 110,
  },
];

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendKeywords, setRecommendKeywords] = useState<RecommendKeyword[]>([]);
  const [acSuggestions, setAcSuggestions] = useState<AcSuggestions | null>(null);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load recommend keywords on component mount
  useEffect(() => {
    loadRecommendKeywords();
  }, []);

  // Handle search input changes with debounce
  useEffect(() => {
    if (searchQuery.trim()) {
      setShowSuggestions(true);
      const timer = setTimeout(() => {
        loadAcSuggestions(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowSuggestions(false);
      setAcSuggestions(null);
    }
  }, [searchQuery]);

  const loadRecommendKeywords = async () => {
    setIsLoadingKeywords(true);
    try {
      const response = await searchApi.getRecommendKeywords();
      setRecommendKeywords(response.data);
    } catch (error) {
      console.error('Error loading recommend keywords:', error);
    } finally {
      setIsLoadingKeywords(false);
    }
  };

  const loadAcSuggestions = async (query: string) => {
    setIsLoadingSuggestions(true);
    try {
      const response = await searchApi.getAcSuggestions(query);
      setAcSuggestions(response.data);
    } catch (error) {
      console.error('Error loading AC suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGenrePress = (genreId: string, genreName: string) => {
    navigation.navigate('SearchResults', { 
      initialQuery: genreName,
      genreFilter: genreId 
    });
  };
    const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigation.navigate('SearchResults', { initialQuery: searchQuery });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };
  
  const performSearch = (query: string) => {
    setShowSuggestions(false);
    navigation.navigate('SearchResults', { initialQuery: query });
  };
  
  const handleKeywordPress = (keyword: string) => {
    setSearchQuery(keyword);
    setShowSuggestions(false);
    navigation.navigate('SearchResults', { initialQuery: keyword });
  };  const handleSuggestionTrackPress = async (track: SongDataRecommend) => {
    setShowSuggestions(false);
    
    try {
      // Get song info and stream URL using the track ID
      const [songInfoResponse, streamUrlResponse] = await Promise.all([
        trackApi.getTrackInfo(track.id),
        trackApi.getTrackStreamUrl(track.id)
      ]);
      
      const songData = songInfoResponse.data;
      const streamUrl = streamUrlResponse.data;
      
      // Play the track using trackPlayerService
      await trackPlayerService.playTrack(songData);
    } catch (error) {
      console.error('Error playing suggested track:', error);
      // Fallback to search results if playing fails
      navigation.navigate('SearchResults', { initialQuery: track.title });
    }
  };

  const renderSuggestionItem = ({ item }: { item: SongDataRecommend }) => (
    <TouchableOpacity
      style={styles.suggestionTrackItem}
      onPress={() => handleSuggestionTrackPress(item)}
    >
      <Image 
        source={{ uri: item.thumb || 'https://fakeimg.pl/60x60' }}
        style={styles.suggestionTrackThumbnail}
      />
      <View style={styles.suggestionTrackInfo}>
        <Text style={styles.suggestionTrackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.suggestionTrackArtist} numberOfLines={1}>
          {item.artists?.[0]?.name || 'Unknown Artist'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderKeywordItem = ({ item }: { item: { keyword: string } }) => (
    <TouchableOpacity
      style={styles.suggestionKeywordItem}
      onPress={() => handleKeywordPress(item.keyword)}
    >
      <View style={styles.suggestionKeywordIcon}>
        <Icon name="search" size={16} color="#888" />
      </View>
      <Text style={styles.suggestionKeywordText}>{item.keyword}</Text>
    </TouchableOpacity>
  );

  const renderSuggestionsOverlay = () => {
    if (!showSuggestions || (!acSuggestions && searchQuery.trim())) return null;

    return (
      <View style={styles.suggestionsOverlay}>
        {isLoadingSuggestions ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FF5722" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : (
          acSuggestions && (
            <ScrollView 
              style={styles.suggestionsScroll}
              keyboardShouldPersistTaps="handled"
            >              
            {/* Keywords Section */}
              {acSuggestions.items?.[0]?.keywords && (
                <View style={styles.suggestionsSection}>
                  <Text style={styles.suggestionsSectionTitle}>Search suggestions</Text>
                  {acSuggestions.items[0].keywords.map((keyword, index) => (
                    <TouchableOpacity
                      key={`keyword-${index}`}
                      style={styles.suggestionKeywordItem}
                      onPress={() => handleKeywordPress(keyword.keyword)}
                    >
                      <View style={styles.suggestionKeywordIcon}>
                        <Icon name="search" size={16} color="#888" />
                      </View>
                      <Text style={styles.suggestionKeywordText}>{keyword.keyword}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {/* Tracks Section */}
              {acSuggestions.items?.[1]?.suggestions && (
                <View style={styles.suggestionsSection}>
                  <Text style={styles.suggestionsSectionTitle}>Songs</Text>
                  {acSuggestions.items[1].suggestions.slice(0, 5).map((track, index) => (
                    <TouchableOpacity
                      key={`track-${index}`}
                      style={styles.suggestionTrackItem}
                      onPress={() => handleSuggestionTrackPress(track)}
                    >
                      <Image 
                        source={{ uri: track.thumb || 'https://fakeimg.pl/40x40' }}
                        style={styles.suggestionTrackThumbnail}
                      />
                      <View style={styles.suggestionTrackInfo}>
                        <Text style={styles.suggestionTrackTitle} numberOfLines={1}>
                          {track.title}
                        </Text>                        
                        <Text style={styles.suggestionTrackArtist} numberOfLines={1}>
                          {track.artists?.[0]?.name || 'Unknown Artist'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          )
        )}
      </View>
    );
  };  const renderGenreCard = (genre: Genre, index: number) => (
    <TouchableOpacity
      key={genre.id}
      style={[
        styles.genreCard,
        {
          width: genre.width as any,
          height: genre.height,
        }
      ]}
      onPress={() => handleGenrePress(genre.id, genre.name)}
    >
      <LinearGradient
        colors={genre.backgroundColor}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.genreCardBackground}
      >
        <View style={styles.genreCardContent}>
          <Text style={styles.genreName}>{genre.name}</Text>
        </View>
        
        {/* Decorative circles */}
        <View style={[styles.decorativeCircle, styles.circle1]} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
        <View style={[styles.decorativeCircle, styles.circle3]} />
        
        {/* Glassmorphism overlay */}
        <View style={styles.glassmorphismOverlay} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Search header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for songs, artists, or albums..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#777" />
            </TouchableOpacity>
          )}
        </View>
          <TouchableOpacity style={styles.castButton}>
          <Icon name="tv-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Suggestions overlay */}
      {renderSuggestionsOverlay()}

      {/* Recommended Keywords */}
      {!showSuggestions && recommendKeywords.length > 0 && (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.sectionTitle}>Trending Searches</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.recentSearchesScroll}
          >
            {recommendKeywords.slice(0, 10).map((item, index) => (
              <TouchableOpacity
                key={`keyword-${index}`}
                style={styles.recentSearchItem}
                onPress={() => handleKeywordPress(item.keyword)}
              >
                <View style={styles.recentSearchIcon}>
                  <Icon name="trending-up" size={18} color="#FF5722" />
                </View>
                <Text style={styles.recentSearchText}>{item.keyword}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Title */}
      {!showSuggestions && <Text style={styles.title}>Vibes</Text>}      
      {/* Genre Grid */}
      {!showSuggestions && (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}          
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.staggeredContainer}>
            {/* Left Column */}
            <View style={styles.columnContainer}>
              {genreData.filter((_, index) => index % 2 === 0).map((genre, index) => 
                renderGenreCard(genre, index * 2)
              )}
            </View>
            
            {/* Right Column */}
            <View style={styles.columnContainer}>
              {genreData.filter((_, index) => index % 2 === 1).map((genre, index) => 
                renderGenreCard(genre, index * 2 + 1)
              )}
            </View>
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchText: {
    color: '#777777',
    marginLeft: 8,
    fontSize: 16,
  },
  castButton: {
    marginLeft: 12,
    padding: 4,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
    height: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  recentSearchesContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  recentSearchesScroll: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  recentSearchIcon: {
    marginRight: 6,
  },
  recentSearchText: {
    color: '#ffffff',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingBottom: 16,
  },
  staggeredContainer: {
    flexDirection: 'row',
    paddingHorizontal: cardMargin,
    paddingBottom: 16,
  },
  columnContainer: {
    flex: 1,
    paddingHorizontal: cardGap / 2,
  },  genreCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  genreCardBackground: {
    flex: 1,
    position: 'relative',
    borderRadius: 16,
  },  
  genreCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    zIndex: 2,
  },
  genreName: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    zIndex: 10,
    textAlign: 'center',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 80,
    height: 80,
    top: -20,
    right: -20,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: -10,
    left: -10,
  },
  circle3: {
    width: 40,
    height: 40,
    top: '50%',
    left: -5,
  },  glassmorphismOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  curveContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  curve: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1.5,
  },
  // Suggestion overlay styles
  suggestionsOverlay: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    maxHeight: 400,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#888',
    marginLeft: 8,
    fontSize: 14,
  },
  suggestionsScroll: {
    maxHeight: 360,
  },
  suggestionsSection: {
    paddingVertical: 8,
  },
  suggestionsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  suggestionKeywordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  suggestionKeywordIcon: {
    marginRight: 12,
    width: 20,
    alignItems: 'center',
  },
  suggestionKeywordText: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  suggestionTrackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  suggestionTrackThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#333',
  },
  suggestionTrackInfo: {
    flex: 1,
  },
  suggestionTrackTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionTrackArtist: {
    color: '#999',
    fontSize: 13,
  },
});

export default SearchScreen;