import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput,
  ScrollView, ActivityIndicator, StatusBar, SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { searchApi } from '../../services/api';
import trackPlayerService from '../../services/player/TrackPlayerService';
import { SongData, Album } from '../../types/zing';
import NavigationService from 'services/navigation/NavigationService';

const TABS = ['All', 'Songs', 'Playlists', 'Artists'];

const SearchResultsScreen = () => {
  const navigation = useNavigation();
  const { params = {} } = useRoute();
  
  const [query, setQuery] = useState(params.initialQuery || '');
  const [activeTab, setActiveTab] = useState('All');
  const [results, setResults] = useState({ songs: [], playlists: [], artists: [], top: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cachedResults, setCachedResults] = useState(null);

  const performSearch = async () => {
    if (!query.trim()) {
      setResults({ songs: [], playlists: [], artists: [], top: null });
      setCachedResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // const data = await searchAll(query);
      const data = (await searchApi.searchAll(query)).data;
      console.log('Search results:', data);
      
      const standardizedData = {
        songs: data.songs || [],
        playlists: data.playlists || [],
        artists: data.artists || [],
        top: data.top || null,
      };

      setCachedResults(standardizedData);
      setResults(standardizedData);
    } catch (err) {
      console.error('Failed to search. Please try again.');
      setResults({ songs: [], playlists: [], artists: [], top: null });
      setCachedResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const performTabSearch = async (tab) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      let data;

      switch (tab) {
        case 'Songs':
          // data = await searchSongs(query, 1, 18);
          data = (await searchApi.searchType(query, 'song', 1, 18)).data;
          setResults({
            ...results,
            songs: data.items || [],
          });
          break;
        case 'Playlists':
          // data = await searchPlaylists(query, 1, 18);
          data = (await searchApi.searchType(query, 'playlist', 1, 18)).data;
          setResults({
            ...results,
            playlists: data.items || [],
          });
          break;
        case 'Artists':
          data = (await searchApi.searchType(query, 'artist', 1, 18)).data;
          setResults({
            ...results,
            artists: data.items || [],
          });
          break;
        
        case 'All':
          if (cachedResults) {
            setResults(cachedResults);
          } else {
            await performSearch();
          }
          break;
      }
    } catch (err) {
      console.error('Failed to search. Please try again.');
      setResults({ songs: [], playlists: [], artists: [], top: null });
    } finally {
      setIsLoading(false);
    }
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) performSearch();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  const handlePlayTrack = async (track: SongData) => {
    trackPlayerService.playTrack(track);
  }
  
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const renderSongItem = (item) => (
    <TouchableOpacity 
      style={styles.trackItem}
      onPress={() => handlePlayTrack(item)}
      key={item.encodeId}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.trackImage} resizeMode="conver" />
      ) : (
        <View style={[styles.trackImage, styles.placeholderImage]}>
          <Icon name="musical-note" size={24} color="#555" />
        </View>
      )}
      
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artistsNames || 'Unknown Artist'}
        </Text>
      </View>
      
      <Text style={styles.trackDuration}>{formatDuration(item.duration * 1000)}</Text>
    </TouchableOpacity>
  );
  
  const renderPlaylistItem = (item: Album) => (
    <TouchableOpacity 
      style={styles.playlistItem}
      onPress={() => NavigationService.navigateToPlaylist(item.encodeId)}
      key={item.encodeId}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.playlistImage} resizeMode="cover" />
      ) : (
        <View style={[styles.albumImage, styles.placeholderImage]}>
          <Icon name="disc" size={32} color="#555" />
        </View>
      )}
      
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.playlistDesc} numberOfLines={1}>
          {item.artistsNames}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderArtistItem = (item) => (
    <TouchableOpacity
      style={styles.artistItem}
      // onPress={() => navigation.navigate('ArtistDetail', {alias: item.alias })}
      onPress={() => NavigationService.navigateToArtist(item.alias)}
      key={item.id}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.artistImage} resizeMode="cover" />  
        ) : (
          <View style={[styles.artistImage, styles.placeholderImage]}>
            <Icon name="person" size={32} color="#555" />
          </View>
        )}
        <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  )

  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      if (tab !== 'All') {
        performTabSearch(tab);
      } else if (cachedResults) {
        setResults(cachedResults);
      }
    }
  };
  
  const renderContent = () => {
    if (isLoading && !results.songs.length && !results.playlists.length && !results.artists.length) {
        return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.centeredContainer}>
          <Icon name="alert-circle-outline" size={48} color="#777" />
          <Text style={styles.messageText}>{error}</Text>
        </View>
      );
    }
    
    if (!query.trim()) {
      return (
        <View style={styles.centeredContainer}>
          <Icon name="search" size={48} color="#777" />
          <Text style={styles.messageText}>Type something to search</Text>
        </View>
      );
    }
    
  const noResults = (
    (activeTab === 'All' && !results.top && !results.songs.length && !results.playlists.length && !results.artists.length) ||
    (activeTab === 'Songs' && !results.songs.length) ||
    (activeTab === 'Playlists' && !results.playlists.length) ||
    (activeTab === 'Artists' && !results.artists.length)
  );
    
    if (noResults && !isLoading) {
      return (
        <View style={styles.centeredContainer}>
          <Icon name="search" size={48} color="#777" />
          <Text style={styles.messageText}>No results found for "{query}"</Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.resultsContainer}>
          {/* Top results */}
          {/* {activeTab === 'All' && results.top && (
            <View style={styles.topResult}>
              <Text style={styles.topResultTitle}>Top Result</Text>
              {results.top.duration ? renderSongItem(results.top) : renderPlaylistItem(results.top)}
            </View>
          )} */}

          {/* Song results */}
          {(activeTab === 'All' || activeTab === 'Songs') && results.songs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Songs</Text>
                {activeTab === 'All' && results.songs.length > 3 && (
                  <TouchableOpacity onPress={() => handleTabChange('Songs')}>
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                )}
              </View>
              {(activeTab === 'All' ? results.songs.slice(0, 3) : results.songs).map(song => (
                <React.Fragment key={song.encodeId}>
                  {renderSongItem(song)}
                </React.Fragment>
              ))}
            </View>
          )}
          
          {/* Playlists */}
          {(activeTab === 'All' || activeTab === 'Playlists') && results.playlists.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Playlists</Text>
                {activeTab === 'All' && results.playlists.length > 3 && (
                  <TouchableOpacity onPress={() => handleTabChange('Playlists')}>
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                )}
              </View>
              {(activeTab === 'All' ? results.playlists.slice(0, 3) : results.playlists).map((playlist) => (
                <View key={playlist.encodeId}>
                {renderPlaylistItem(playlist)}
                </View>
              ))}
            </View>
          )}

          {/* Artists */}
          {(activeTab === 'All' || activeTab === 'Artists') && results.artists.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Artists</Text>
                {activeTab === 'All' && results.artists.length > 3 && (
                  <TouchableOpacity onPress={() => handleTabChange('Artists')}>
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(activeTab === 'All' ? results.artists.slice(0, 6) : results.artists).map(artist => (
                  <View key={artist.id} style={{ marginRight: 16 }}>
                    {renderArtistItem(artist)}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Search bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#777" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#777"
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
            returnKeyType="search"
            onSubmitEditing={performSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={20} color="#777" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => handleTabChange(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Content */}
      {renderContent()}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
    height: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
  },
  activeTabButton: {},
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: '#1DB954',
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  resultsContainer: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  messageText: {
    color: '#777',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#1DB954',
    fontSize: 14,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  trackInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  trackArtist: {
    color: '#888',
    fontSize: 14,
  },
  trackDuration: {
    color: '#888',
    fontSize: 14,
  },
  albumItem: {
    width: 140,
  },
  albumImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  albumArtist: {
    color: '#888',
    fontSize: 12,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  playlistDesc: {
    color: '#888',
    fontSize: 14,
  },
  placeholderImage: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },

  topResult: {
    marginBottom: 24,
  },
  topResultTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  artistItem: {
    width: 140,
  },
  artistImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 8,
  },
  artistName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SearchResultsScreen;