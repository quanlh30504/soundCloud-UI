import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput,
  ScrollView, ActivityIndicator, StatusBar, SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { searchAll, getTrackInfo } from '../../services/api';
import trackPlayerService from '../../services/player/TrackPlayerService';
import {Track} from "react-native-track-player";
//
import { convertPathToUrl } from '../../ultis/convertUrl';


const TABS = ['All', 'Tracks', 'Albums', 'Playlists'];

const SearchResultsScreen = () => {
  const navigation = useNavigation();
  const { params = {} } = useRoute();
  
  const [query, setQuery] = useState(params.initialQuery || '');
  const [activeTab, setActiveTab] = useState('All');
  const [results, setResults] = useState({ tracks: [], albums: [], playlists: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cachedResults, setCachedResults] = useState(null);

  const performSearch = async () => {
    if (!query.trim()) {
      setResults({ tracks: [], albums: [], playlists: [] });
      setCachedResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await searchAll(query);
      console.log('Search results:', data);
      
      const standardizedData = {
        tracks: data.tracks || [],
        albums: data.albums || [],
        playlists: data.playlists?.content || []
      };

      setCachedResults(standardizedData);

      setResults({
        tracks: activeTab === 'All' || activeTab === 'Tracks' ? standardizedData.tracks : [],
        albums: activeTab === 'All' || activeTab === 'Albums' ? standardizedData.albums : [],
        playlists: activeTab === 'All' || activeTab === 'Playlists' ? standardizedData.playlists : []
      });
      
    } catch (err) {
      console.error('Failed to search. Please try again.');
      setResults({ tracks: [], albums: [], playlists: [] });
      setCachedResults(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) performSearch();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  const handlePlayTrack = async (track) => {
    console.log('Playing track:', track);
    try {
      const trackId = track.spotifyId || track.id;
      if (!trackId) return;
      
      // await trackPlayerService.setup();
      let trackInfo = await getTrackInfo(trackId);
      console.log('Track info:', trackInfo);
      let streamUrl;

      let attempts = 0;
      const maxAttempts = 5; 
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
        artwork: track.albumImages[0].url,
        // duration: trackInfo.durationMs / 1000,
      }

      console.log('New track:', newTrack);
      await trackPlayerService.addTracks([newTrack]);
      await trackPlayerService.playTrack(trackId);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };
  
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const renderTrackItem = (item) => (
    <TouchableOpacity 
      style={styles.trackItem}
      onPress={() => handlePlayTrack(item)}
      key={item.id}
    >
      {item.albumImages?.[0]?.url ? (
        <Image source={{ uri: item.albumImages[0].url }} style={styles.trackImage} />
      ) : (
        <View style={[styles.trackImage, styles.placeholderImage]}>
          <Icon name="musical-note" size={24} color="#555" />
        </View>
      )}
      
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artists?.join(', ') || 'Unknown Artist'}
        </Text>
      </View>
      
      <Text style={styles.trackDuration}>{formatDuration(item.durationMs)}</Text>
    </TouchableOpacity>
  );
  
  const renderAlbumItem = (item) => (
    <TouchableOpacity 
      style={styles.albumItem}
      onPress={() => navigation.navigate('AlbumDetail', { albumId: item.id })}
      key={item.id}
    >
      {item.images?.[0]?.url ? (
        <Image source={{ uri: item.images[0].url }} style={styles.albumImage} />
      ) : (
        <View style={[styles.albumImage, styles.placeholderImage]}>
          <Icon name="disc" size={32} color="#555" />
        </View>
      )}
      
      <Text style={styles.albumTitle} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {item.artists?.join(', ') || 'Unknown Artist'}
      </Text>
    </TouchableOpacity>
  );
  
  const renderPlaylistItem = (item) => (
    <TouchableOpacity 
      style={styles.playlistItem}
      onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id })}
      key={item.id}
    >
      {item.images?.[0]?.url ? (
        <Image source={{ uri: item.images[0].url }} style={styles.playlistImage} />
      ) : (
        <View style={[styles.playlistImage, styles.placeholderImage]}>
          <Icon name="list" size={32} color="#555" />
        </View>
      )}
      
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.playlistDesc} numberOfLines={1}>
          {item.totalTracks} tracks • {item.owner}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (cachedResults) {
      setResults({
        tracks: tab === 'All' || tab === 'Tracks' ? cachedResults.tracks : [],
        albums: tab === 'All' || tab === 'Albums' ? cachedResults.albums : [],
        playlists: tab === 'All' || tab === 'Playlists' ? cachedResults.playlists : []
      });
    }
  }
  
  const renderContent = () => {
    if (isLoading && !results.tracks.length && !results.albums.length && !results.playlists.length) {
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
      (activeTab === 'All' && !results.tracks.length && !results.albums.length && !results.playlists.length) ||
      (activeTab === 'Tracks' && !results.tracks.length) ||
      (activeTab === 'Albums' && !results.albums.length) ||
      (activeTab === 'Playlists' && !results.playlists.length)
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
          {/* Tracks */}
          {(activeTab === 'All' || activeTab === 'Tracks') && results.tracks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tracks</Text>
                {activeTab === 'All' && results.tracks.length > 3 && (
                  <TouchableOpacity onPress={() => handleTabChange('Tracks')}>
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                )}
              </View>
              {(activeTab === 'All' ? results.tracks.slice(0, 3) : results.tracks).map(track => (
                <React.Fragment key={track.id || track.spotifyId}>
                  {renderTrackItem(track)}
                </React.Fragment>
              ))}
            </View>
          )}
          
          {/* Albums */}
          {(activeTab === 'All' || activeTab === 'Albums') && results.albums.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Albums</Text>
                {activeTab === 'All' && results.albums.length > 3 && (
                  <TouchableOpacity onPress={() => handleTabChange('Albums')}>
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(activeTab === 'All' ? results.albums.slice(0, 6) : results.albums).map((album) => (
                  <View key={album.id} style={{ marginRight: 16 }}>
                    {renderAlbumItem(album)}
                  </View>
                ))}
              </ScrollView>
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
                <View key={playlist.id}>
                {renderPlaylistItem(playlist)}
                </View>
              ))}
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
});

export default SearchResultsScreen;