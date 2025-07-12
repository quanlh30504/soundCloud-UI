import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView,
  ActivityIndicator, StatusBar, SafeAreaView, FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { artistApi } from '../../services/api';
import TrackPlayer from "react-native-track-player";
import TrackPlayerService from '../../services/player/TrackPlayerService';
import { Album } from 'types/zing';
import NavigationService from 'services/navigation/NavigationService';

const ArtistScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { alias } = route.params;
  
  const [artistInfo, setArtistInfo] = useState(null);
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setIsLoading(true);
        
        const artistData = await artistApi.getArtistInfo(alias);
        setArtistInfo(artistData);
        console.log('Artist Data:', artistData);
        
        const songData = await artistApi.getArtistSongs(artistData.id, 1, 10);
        setSongs(songData.items || []);
        
        const playlistData = await artistApi.getArtistPlaylists(artistData.id, 1, 10);
        setPlaylists(playlistData.items || []);
        
      } catch (err) {
        console.error('Failed to load artist data:', err);
        setError('Failed to load artist information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtistData();
  }, [ alias]);
  
  const handlePlayTrack = async (track) => {
    TrackPlayerService.playTrack(track);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  
  const formatFollowers = (count) => {
    if (!count) return '0 quan tâm';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M quan tâm`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K quan tâm`;
    }
    return `${count} quan tâm`;
  };
  
  const renderSectionHeader = (title, onSeeAll) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <View style={styles.seeAllContainer}>
          <Icon name="chevron-forward" size={20} color="#888" />
        </View>
      </TouchableOpacity>
    </View>
  );
  
  const renderMusicItem = (item, index) => (
    <TouchableOpacity 
      style={styles.musicItem}
      onPress={() => handlePlayTrack(item)}
      key={index}
    >
      <Image 
        source={{ uri: item.thumbnailM || item.thumbnail }} 
        style={styles.musicCover} 
        resizeMode="cover"
      />
      <Text style={styles.musicTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.musicArtist} numberOfLines={1}>
        {formatDate(item.releaseDate) || item.artistsNames}
      </Text>
    </TouchableOpacity>
  );
  
  const renderPlaylistItem = (item, index) => (
    <TouchableOpacity 
      style={styles.playlistItem}
      // onPress={() => navigation.navigate('Playlist', { playlistId: item.encodeId })}
      onPress={() => NavigationService.navigateToPlaylist(item.encodeId)}
      key={index}
    >
      <Image 
        source={{ uri: item.thumbnailM || item.thumbnail }} 
        style={styles.playlistCover} 
        resizeMode="cover"
      />
      <Text style={styles.playlistTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );
  
  const renderArtistHeader = () => {
    if (!artistInfo) return null;
    
    return (
      <View style={styles.artistHeader}>
        <Image
          source={{ uri: artistInfo.thumbnailM || artistInfo.thumbnail }}
          style={styles.artistCover}
          resizeMode="cover"
        />
        
        <Text style={styles.artistName}>{artistInfo.name}</Text>
        <Text style={styles.followerCount}>
          {formatFollowers(artistInfo.totalFollow)}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.followButton]} 
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text style={styles.followButtonText}>
              {isFollowing ? 'ĐÃ QUAN TÂM' : 'QUAN TÂM'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.playButton]}
            onPress={() => {
              if (songs.length > 0) {
                handlePlayTrack(songs[0]);
              }
            }}
          >
            <Text style={styles.playButtonText}>PHÁT NHẠC</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderSuggestedArtists = () => {
    return (
      <View style={styles.section}>
        {renderSectionHeader('Có thể bạn sẽ thích')}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {artistInfo?.relatedArtists?.map((artist, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.suggestedArtist}
              onPress={() => navigation.replace('Artist', { artistId: artist.id })}
            >
              <Image 
                source={{ uri: artist.thumbnailM || artist.thumbnail }} 
                style={styles.suggestedArtistImage} 
                resizeMode="cover" 
              />
              <Text style={styles.suggestedArtistName}>{artist.name}</Text>
              <Text style={styles.suggestedArtistFollowers}>
                {formatFollowers(artist.totalFollow)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  const renderArtistInfo = () => {
    return (
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin</Text>
        <Text style={styles.artistBio} numberOfLines={isExpanded ? null : 3}>
          {(artistInfo?.biography || 'No biography available.').replace(/<br\s*\/?>/gi, '\n')}
        </Text>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.seeMoreText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
        </TouchableOpacity>
        
        <View style={styles.infoDetail}>
          <Text style={styles.infoLabel}>Tên thật</Text>
          <Text style={styles.infoValue}>{artistInfo?.realname}</Text>
        </View>
        
        <View style={styles.infoDetail}>
          <Text style={styles.infoLabel}>Ngày sinh</Text>
          <Text style={styles.infoValue}>{artistInfo?.birthday}</Text>
        </View>
        
        <View style={styles.infoDetail}>
          <Text style={styles.infoLabel}>Quốc gia</Text>
          <Text style={styles.infoValue}>{artistInfo?.national || 'Việt Nam'}</Text>
        </View>
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
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
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
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              setError(null);
              // Retry loading data
              fetchArtistData();
            }}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{artistInfo?.name}</Text>
        <TouchableOpacity>
          <Icon name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.scrollView}>
        {/* Artist Header */}
        {renderArtistHeader()}
        
        {/* Suggested Artists */}
        {artistInfo?.relatedArtists && renderSuggestedArtists()}
        
        {/* Artist Info */}
        {renderArtistInfo()}
        
        {/* MV Section */}
        {artistInfo?.mvs?.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('MV')}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {artistInfo.mvs.map((mv, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.mvItem}
                  onPress={() => navigation.navigate('Video', { videoId: mv.encodeId })}
                >
                  <View style={styles.mvCoverContainer}>
                    <Image 
                      source={{ uri: mv.thumbnail || mv.thumbnailM }} 
                      style={styles.mvCover} 
                      resizeMode="cover"
                    />
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>
                        {Math.floor(mv.duration / 60)}:{(mv.duration % 60).toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.mvTitle} numberOfLines={2}>{mv.title}</Text>
                  <Text style={styles.mvArtist} numberOfLines={1}>{mv.artistsNames}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Singles Section */}
        {songs.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('Single', () => navigation.navigate('ArtistSongs', { artistId: artistInfo.id }))}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {songs.map((song, index) => renderMusicItem(song, index))}
            </ScrollView>
          </View>
        )}
        
        {/* Albums Section */}
        {artistInfo?.albums?.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('Album')}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {artistInfo.albums.map((album, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.albumItem}
                  onPress={() => navigation.navigate('Album', { albumId: album.encodeId })}
                >
                  <Image 
                    source={{ uri: album.thumbnailM || album.thumbnail }} 
                    style={styles.albumCover} 
                    resizeMode="cover"
                  />
                  <Text style={styles.albumTitle} numberOfLines={2}>{album.title}</Text>
                  <Text style={styles.albumDate}>{formatDate(album.releaseDate)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Playlists Section */}
        {playlists.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('Playlist', () => navigation.navigate('ArtistPlaylists', { artistId: artistInfo.id }))}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {playlists.map((playlist, index) => renderPlaylistItem(playlist, index))}
            </ScrollView>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  
  // Artist Header
  artistHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  artistCover: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
  },
  artistName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  followerCount: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: '#7B68EE',
    borderWidth: 0,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Section Header
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  suggestedArtist: {
    marginRight: 20,
    alignItems: 'center',
    width: 120,
  },
  suggestedArtistImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  suggestedArtistName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  suggestedArtistFollowers: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
  },
  
  infoSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  artistBio: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 8,
  },
  seeMoreText: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 16,
  },
  infoDetail: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#aaa',
    fontSize: 14,
    width: 100,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  
  mvItem: {
    width: 240,
    marginRight: 16,
  },
  mvCoverContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  mvCover: {
    width: 240,
    height: 135,
    borderRadius: 8,
  },
  durationBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
  },
  mvTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  mvArtist: {
    color: '#aaa',
    fontSize: 12,
  },
  
  // Song Items
  musicItem: {
    width: 140,
    marginRight: 16,
  },
  musicCover: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  musicTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  musicArtist: {
    color: '#aaa',
    fontSize: 12,
  },
  
  // Album Items
  albumItem: {
    width: 160,
    marginRight: 16,
  },
  albumCover: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  albumDate: {
    color: '#aaa',
    fontSize: 12,
  },
  
  // Playlist Items
  playlistItem: {
    width: 160,
    marginRight: 16,
  },
  playlistCover: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ArtistScreen;