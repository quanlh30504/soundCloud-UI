import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';
import { playlistApi } from '../../services/api';
import { Playlist } from '../../types/playlist';

export default function PlaylistsScreen() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('Untitled Playlist');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Fetch playlists when component mounts
  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (!playlists.length) {
      setLoading(true);
    }
    
    try {
      const response = await playlistApi.getOwnPlaylists();
      setPlaylists(response.data.content);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      Alert.alert('Error', 'Failed to load playlists. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleSave = async () => {
    if (!playlistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    setCreating(true);
    try {
      await playlistApi.createOwnPlaylist({
        name: playlistName.trim(),
        description: '',
        isPublic: false
      });
      fetchPlaylists();
      hideModal();
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Failed to create playlist. Please try again.');
    } finally {
      setCreating(false);
    }
  };  
  
  const handlePlaylistPress = (playlist: Playlist) => {
    // Navigate to playlist detail screen
    navigation.navigate('PlaylistDetail', { playlist });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const renderPlaylistItem = ({ item }: { item: Playlist }) => {
    // Default image or placeholder
    const thumbnailUrl = item.images && item.images.length > 0 
      ? item.images[0].url 
      : 'https://fakeimg.pl/80x80';

    return (
      <TouchableOpacity 
        style={styles.playlistItem}
        onPress={() => handlePlaylistPress(item)}
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
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={themeStyles.colors.secondary} />
        </TouchableOpacity>
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
        <Text style={[styles.headerTitle, { color: themeStyles.colors.text }]}>Playlists</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="tv-outline" size={24} color={themeStyles.colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={showModal}
          >
            <Ionicons name="add" size={24} color={themeStyles.colors.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeStyles.colors.primary} />
        </View>
      ) : playlists.length === 0 ? (
        // Empty State Content
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: themeStyles.colors.text }]}>
            No playlists yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: themeStyles.colors.secondary }]}>
            Playlists you have liked or created will show up here.
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={showModal}
          >
            <Text style={styles.createButtonText}>Create playlist</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Playlists List
        <View style={styles.listContainer}>
          {!loading && playlists.length > 0 && (
            <TouchableOpacity 
              style={styles.createPlaylistButton}
              onPress={showModal}
            >
              <Text style={[styles.createPlaylistText, { color: themeStyles.colors.primary }]}>
                Create playlist
              </Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={playlists}
            renderItem={renderPlaylistItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={() => fetchPlaylists(true)}
            refreshing={refreshing}
          />
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
                        styles.saveButton,
                        creating && { opacity: 0.7 }
                      ]}
                      onPress={handleSave}
                      disabled={creating}
                    >
                      {creating ? (
                        <ActivityIndicator size="small" color="#000000" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 8,
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
  createButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 20,
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
  moreButton: {
    padding: 8,
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
  saveButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
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