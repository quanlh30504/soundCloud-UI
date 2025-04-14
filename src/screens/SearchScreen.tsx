import React, { useState } from 'react';
import {View,Text,StyleSheet,ScrollView,Image,TouchableOpacity,TextInput,Dimensions,StatusBar,SafeAreaView,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

interface Genre {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  imageSource: any;
  width: number;
  height: number;
}

const { width } = Dimensions.get('window');
const cardMargin = 8;
const cardGap = 8;

const genreData: Genre[] = [
  {
    id: 'hiphop',
    name: 'Hip Hop & Rap',
    backgroundColor: '#682FBF',
    borderColor: '#8343E2',
    imageSource: require('../../assets/images/genres/pop.png'),
    width: (width - cardMargin * 2 - cardGap) / 2,
    height: 170,
  },
  {
    id: 'electronic',
    name: 'Electronic',
    backgroundColor: '#DD3A7D',
    borderColor: '#FF4F9A',
    imageSource: require('../../assets/images/genres/pop.png'),
    width: (width - cardMargin * 2 - cardGap) / 2,
    height: 280,
  },
  {
    id: 'pop',
    name: 'Pop',
    backgroundColor: '#E6B800',
    borderColor: '#FFCC00',
    imageSource: require('../../assets/images/genres/pop.png'),
    width: (width - cardMargin * 2 - cardGap) / 2,
    height: 280,
  },
  {
    id: 'rnb',
    name: 'R&B',
    backgroundColor: '#00A3CC',
    borderColor: '#00BFEF',
    imageSource: require('../../assets/images/genres/pop.png'),
    width: (width - cardMargin * 2 - cardGap) / 2,
    height: 120,
  },
  {
    id: 'chill',
    name: 'Chill',
    backgroundColor: '#00A3CC',
    borderColor: '#00BFEF',
    imageSource: require('../../assets/images/genres/pop.png'),
    width: (width - cardMargin * 2 - cardGap) / 2,
    height: 120,
  },
  {
    id: 'party',
    name: 'Party',
    backgroundColor: '#DD6B3A',
    borderColor: '#FF7F47',
    imageSource: require('../../assets/images/genres/pop.png'),
    width: (width - cardMargin * 2 - cardGap) / 2,
    height: 170,
  },
  {
    id: 'workout',
    name: 'Workout',
    backgroundColor: '#0DBF6C',
    borderColor: '#10DE7D',
    imageSource: require('../../assets/images/genres/pop.png'),
    width: (width - cardMargin * 2 - cardGap) / 2,
    height: 170,
  },
  {
    id: 'techno',
    name: 'Techno',
    backgroundColor: '#DD3A7D',
    borderColor: '#FF4F9A',
    imageSource: require('../../assets/images/genres/pop.png'),
    width: (width - cardMargin * 2 - cardGap) / 2,
    height: 170,
  },
];

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [recentSearches] = useState<string[]>([
    'Drake', 'Taylor Swift', 'Weekend Playlist', 'Running Mix'
  ]);

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
      navigation.navigate('SearchResults', { initialQuery: searchQuery });
      
      // using AsyncStorage in future
    }
  };
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  const performSearch = (query: string) => {
    navigation.navigate('SearchResults', { initialQuery: query });
  };
  
  const handleRecentSearchPress = (searchQuery: string) => {
    navigation.navigate('SearchResults', { initialQuery: searchQuery });
  };

  const renderGenreCard = (genre: Genre, index: number) => (
    <TouchableOpacity
      key={genre.id}
      style={[
        styles.genreCard,
        {
          width: genre.width,
          height: genre.height,
          backgroundColor: genre.backgroundColor,
          borderColor: genre.borderColor,
          marginLeft: index % 2 === 0 ? cardMargin : cardGap / 2,
          marginRight: index % 2 === 1 ? cardMargin : cardGap / 2,
        }
      ]}
      onPress={() => handleGenrePress(genre.id, genre.name)}
    >
      <Text style={styles.genreName}>{genre.name}</Text>
      <View style={styles.curveContainer}>
        {[...Array(5)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.curve, 
              { 
                right: -10 - i * 15, 
                bottom: -40 - i * 20,
                borderColor: `${genre.borderColor}${30 - i * 5}`, // Decreasing opacity
              }
            ]} 
          />
        ))}
        <Image source={genre.imageSource} style={styles.genreImage} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      /* Search header */
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

      {recentSearches.length > 0 && (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.recentSearchesScroll}
          >
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={`search-${index}`}
                style={styles.recentSearchItem}
                onPress={() => handleRecentSearchPress(search)}
              >
                <View style={styles.recentSearchIcon}>
                  <Icon name="time-outline" size={18} color="#fff" />
                </View>
                <Text style={styles.recentSearchText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>Vibes</Text>

      {/* Genre Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {genreData.map((genre, index) => renderGenreCard(genre, index))}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
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
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingBottom: 16,
  },
  genreCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  genreName: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
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
  genreImage: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
});

export default SearchScreen;