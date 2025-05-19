import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { playlistApi } from '../../services/api';
import { Playlist } from '../../types/playlist';
import { Animated } from 'react-native';

interface AddToPlaylistScreenProps {
  route: {
    params: {
      trackId: string;
      trackName: string;
      artistName: string;
      trackArtwork: string | null;
    }
  }
}

export default function AddToPlaylistScreen({ route }: AddToPlaylistScreenProps) {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation();
  
  const { trackId, trackName, artistName, trackArtwork } = route.params;
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('Untitled Playlist');
  const [creating, setCreating] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    fetchPlaylists();
    console.log('Current trackId:', trackId);
  }, []);
  
  const fetchPlaylists = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (!playlists.length) {
      setLoading(true);
    }
    
    try {
      const response = (await playlistApi.getOwnPlaylists()).data.content;
      // exclude playlists with name "SYS_LIKED_TRACKS"
      const filteredPlaylists = response.filter((playlist: Playlist) => playlist.name !== 'SYS_LIKED_TRACKS');
      setPlaylists(filteredPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      Alert.alert('Error', 'Failed to load playlists. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const togglePlaylistSelection = (playlistId: string) => {
    const newSelected = new Set(selectedPlaylists);
    if (newSelected.has(playlistId)) {
      newSelected.delete(playlistId);
    } else {
      newSelected.add(playlistId);
    }
    setSelectedPlaylists(newSelected);
  };
  
  const handleSaveToPlaylists = async () => {
    if (selectedPlaylists.size === 0) {
      Alert.alert('No Playlists Selected', 'Please select at least one playlist.');
      return;
    }
    
    setSaving(true);
    
    try {
      const promises = Array.from(selectedPlaylists).map(playlistId => {
            console.log(`Adding track ${trackId} to playlist ${playlistId}`)
            playlistApi.addTrackToOwnPlaylist(playlistId, trackId)
        }
      );
      
      await Promise.all(promises);
      
      Alert.alert(
        'Success', 
        `Added "${trackName}" to ${selectedPlaylists.size} playlist${selectedPlaylists.size > 1 ? 's' : ''}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding track to playlists:', error);
      Alert.alert('Error', 'Failed to add track to one or more playlists. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const showModal = () => {
    setPlaylistName('Untitled Playlist');
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };
  
  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    setCreating(true);
    try {
      const response = await playlistApi.createOwnPlaylist({
        name: playlistName.trim(),
        description: '',
        isPublic: false
      });
      
      const newPlaylist = response.data;
      setPlaylists([newPlaylist, ...playlists]);
      
      // Automatically select the newly created playlist
      setSelectedPlaylists(new Set([...selectedPlaylists, newPlaylist.id]));
      
      hideModal();
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Failed to create playlist. Please try again.');
    } finally {
      setCreating(false);
    }
  };
  
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });
  
  const renderPlaylistItem = ({ item }: { item: Playlist }) => {
    const isSelected = selectedPlaylists.has(item.id);
    const thumbnailUrl = item.images && item.images.length > 0 
      ? item.images[0].url 
      : 'https://fakeimg.pl/80x80';

    return (
      <TouchableOpacity 
        style={styles.playlistItem}
        onPress={() => togglePlaylistSelection(item.id)}
      >
        <Image 
          source={{ uri: thumbnailUrl }}
          style={styles.playlistThumbnail}
        />
        <View style={styles.playlistInfo}>
          <Text style={[styles.playlistName, { color: themeStyles.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.playlistOwner, { color: themeStyles.colors.secondary }]} numberOfLines={1}>
            {item.ownerName}
          </Text>
          <Text style={[styles.playlistTracks, { color: themeStyles.colors.secondary }]}>
            Playlist • {item.totalTracks} {item.totalTracks === 1 ? 'track' : 'tracks'}
          </Text>
        </View>
        <View style={styles.checkboxContainer}>
          <View style={[
            styles.checkbox, 
            isSelected ? 
              { backgroundColor: themeStyles.colors.primary, borderColor: themeStyles.colors.primary } : 
              { backgroundColor: 'transparent', borderColor: themeStyles.colors.border }
          ]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
          </View>
        </View>
      </TouchableOpacity>
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
          <Ionicons name="arrow-back" size={24} color={themeStyles.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeStyles.colors.text }]}>Add to Playlist</Text>
        <TouchableOpacity 
          style={[
            styles.saveButton,
            (selectedPlaylists.size === 0 || saving) && { opacity: 0.6 }
          ]}
          onPress={handleSaveToPlaylists}
          disabled={selectedPlaylists.size === 0 || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Track Info (optional visual feedback of the track being added) */}
      <View style={styles.trackInfoContainer}>
        {trackArtwork && (
          <Image source={{ uri: trackArtwork }} style={styles.trackThumbnail} />
        )}
        <View style={styles.trackTextInfo}>
          <Text style={[styles.trackName, { color: themeStyles.colors.text }]} numberOfLines={1}>
            {trackName}
          </Text>
          <Text style={[styles.artistName, { color: themeStyles.colors.secondary }]} numberOfLines={1}>
            {artistName}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeStyles.colors.primary} />
        </View>
      ) : (
        <View style={styles.listContainer}>
          {/* Create Playlist Button */}
          <TouchableOpacity 
            style={styles.createPlaylistButton}
            onPress={showModal}
          >
            <Text style={[styles.createPlaylistText, { color: themeStyles.colors.primary }]}>
              Create playlist
            </Text>
          </TouchableOpacity>
          
          {playlists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: themeStyles.colors.text }]}>
                No playlists yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: themeStyles.colors.secondary }]}>
                Create a playlist to add this track to.
              </Text>
            </View>
          ) : (
            <FlatList
              data={playlists}
              renderItem={renderPlaylistItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onRefresh={() => fetchPlaylists(true)}
              refreshing={refreshing}
            />
          )}
        </View>
      )}
      
      {/* Create Playlist Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <TouchableWithoutFeedback onPress={hideModal}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ width: '100%' }}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Animated.View 
                  style={[
                    styles.modalContent, 
                    { transform: [{ translateY }] }
                  ]}
                >
                  {/* Drag handle */}
                  <View style={styles.dragHandle}>
                    <View style={styles.dragHandleBar} />
                  </View>
                  
                  {/* Create Playlist Header */}
                  <View style={styles.modalHeader}>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={hideModal}
                      disabled={creating}
                    >
                      <Ionicons name="close" size={20} color="#AAAAAA" />
                    </TouchableOpacity>
                    
                    <Text style={styles.modalTitle}>Create playlist</Text>
                    
                    <TouchableOpacity 
                      style={[
                        styles.modalSaveButton,
                        creating && { opacity: 0.7 }
                      ]}
                      onPress={handleCreatePlaylist}
                      disabled={creating}
                    >
                      {creating ? (
                        <ActivityIndicator size="small" color="#000000" />
                      ) : (
                        <Text style={styles.modalSaveButtonText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  {/* Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Playlist title</Text>
                    <TextInput
                      style={styles.textInput}
                      value={playlistName}
                      onChangeText={setPlaylistName}
                      autoFocus={true}
                      selectionColor="#FFFFFF"
                      placeholderTextColor="#999999"
                      editable={!creating}
                    />
                    <View style={styles.inputUnderline} />
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 0,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 16,
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  trackInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  trackThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  trackTextInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  artistName: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 70, // Added extra padding for tab bar
  },
  createPlaylistButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  createPlaylistText: {
    fontSize: 16,
    fontWeight: '600',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  playlistThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#525252',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playlistOwner: {
    fontSize: 14,
    marginBottom: 2,
  },
  playlistTracks: {
    fontSize: 12,
  },
  checkboxContainer: {
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#222222',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 30,
    width: '100%',
  },
  dragHandle: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#666666',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalSaveButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  inputContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#666666',
    marginTop: 4,
  },
});
