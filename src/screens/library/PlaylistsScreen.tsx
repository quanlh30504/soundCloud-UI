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
  Alert,
  Clipboard,
  ScrollView,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';
import { playlistApi } from '../../services/api';
import { Playlist } from '../../types/playlist';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import MoreOptionsMenu from '../../components/common/MoreOptionsMenu';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PlaylistsScreen() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('Untitled Playlist');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [deleting, setDeleting] = useState(false);
  
  // New states for export/import functionality
  const [playlistOptionsVisible, setPlaylistOptionsVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportJson, setExportJson] = useState('');
  const [importJson, setImportJson] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Add new states for file saving
  const [exportFileName, setExportFileName] = useState('my-playlists.json');
  
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
      const filteredPlaylists = response.data.content.filter(
        (playlist: Playlist) => playlist.name !== "SYS_LIKED_TRACKS"
      );
      setPlaylists(filteredPlaylists);
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
    navigation.navigate('OwnPlaylistDetail', { playlist });
  };

  const handleMoreOptionsPress = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setMoreOptionsVisible(true);
  };

  const handleCloseMoreOptions = () => {
    setMoreOptionsVisible(false);
  };

  // New functions for export/import functionality
  const handlePlaylistOptionsPress = () => {
    setPlaylistOptionsVisible(true);
  };

  const handleClosePlaylistOptions = () => {
    setPlaylistOptionsVisible(false);
  };

  const handleExportToJson = async () => {
    setPlaylistOptionsVisible(false);
    setIsExporting(true);
    
    try {
      // Get all playlists
      const playlistsData = await playlistApi.getOwnPlaylists();
      const allPlaylists = playlistsData.data.content;
      
      // For each playlist, get the tracks
      const playlistsWithTracks = await Promise.all(
        allPlaylists.map(async (playlist: Playlist) => {
          try {
            const tracksData = await playlistApi.getOwnPlaylistTracks(playlist.id, 0, 1000);
            return {
              id: playlist.id,
              name: playlist.name,
              description: playlist.description || '',
              isPublic: playlist.isPublic || false,
              tracks: tracksData.data.content.map((track: any) => ({
                spotifyId: track.spotifyId,
                name: track.name,
                artists: track.artists,
                albumName: track.albumName
              }))
            };
          } catch (error) {
            console.error(`Error fetching tracks for playlist ${playlist.id}:`, error);
            return {
              ...playlist,
              tracks: []
            };
          }
        })
      );
      
      const jsonData = JSON.stringify(playlistsWithTracks, null, 2);
      setExportJson(jsonData);
      setExportModalVisible(true);
    } catch (error) {
      console.error('Error exporting playlists:', error);
      Alert.alert('Export Error', 'Failed to export playlists. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(exportJson);
    Alert.alert('Copied', 'JSON data copied to clipboard');
  };

  // Add function to share JSON data
  const shareJsonData = async () => {
    try {
      await Share.share({
        message: exportJson,
        title: 'My Playlists JSON Data'
      });
    } catch (error) {
      console.error('Error sharing JSON data:', error);
      Alert.alert('Error', 'Failed to share JSON data');
    }
  };

  const handleImportFromJson = () => {
    setPlaylistOptionsVisible(false);
    setImportModalVisible(true);
  };

  const processImport = async () => {
    if (!importJson.trim()) {
      Alert.alert('Error', 'Please enter or paste JSON data');
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Parse JSON data
      const playlistsData = JSON.parse(importJson);
      
      if (!Array.isArray(playlistsData)) {
        throw new Error('Invalid JSON format. Expected an array of playlists.');
      }
      
      // Import each playlist
      for (const playlistData of playlistsData) {
        // Create playlist
        const newPlaylist = await playlistApi.createOwnPlaylist({
          name: playlistData.name || 'Imported Playlist',
          description: playlistData.description || '',
          isPublic: playlistData.isPublic || false
        });
        
        // Add tracks to playlist
        if (Array.isArray(playlistData.tracks)) {
          for (const track of playlistData.tracks) {
            if (track.spotifyId) {
              try {
                await playlistApi.addTrackToOwnPlaylist(newPlaylist.data.id, track.spotifyId);
              } catch (trackError) {
                console.error(`Error adding track ${track.name} to playlist:`, trackError);
                // Continue with the next track if one fails
              }
            }
          }
        }
      }
      
      // Refresh playlist list
      fetchPlaylists();
      setImportModalVisible(false);
      setImportJson('');
      Alert.alert('Success', 'Playlists imported successfully');
    } catch (error) {
      console.error('Error importing playlists:', error);
      Alert.alert('Import Error', 'Failed to import playlists. Please check your JSON format and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeletePlaylist = async (playlistId: string, playlistName: string) => {
    setMoreOptionsVisible(false);
    
    // Show confirmation dialog
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlistName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              // Call API to delete the playlist
              await playlistApi.deleteOwnPlaylist(playlistId);
              
              // Remove the deleted playlist from state
              setPlaylists(prevPlaylists => 
                prevPlaylists.filter(playlist => playlist.id !== playlistId)
              );
              
              // Show success message
              Alert.alert('Success', 'Playlist deleted successfully');
            } catch (error) {
              console.error('Error deleting playlist:', error);
              Alert.alert('Error', 'Failed to delete playlist. Please try again.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
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
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleMoreOptionsPress(item)}
        >
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
            <View style={styles.listHeader}>
              <TouchableOpacity 
                style={styles.createPlaylistButton}
                onPress={showModal}
              >
                <Text style={[styles.createPlaylistText, { color: themeStyles.colors.primary }]}>
                  Create playlist
                </Text>
              </TouchableOpacity>
              
              {/* Add more options button */}
              <TouchableOpacity 
                style={styles.moreOptionsButton}
                onPress={handlePlaylistOptionsPress}
              >
                <Ionicons name="ellipsis-horizontal" size={24} color={themeStyles.colors.icon} />
              </TouchableOpacity>
            </View>
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

      {/* More Options Menu */}
      {selectedPlaylist && (
        <MoreOptionsMenu
          visible={moreOptionsVisible}
          onClose={handleCloseMoreOptions}
          title={selectedPlaylist.name}
          subtitle={selectedPlaylist.ownerName}
          thumbnailUrl={selectedPlaylist.images && selectedPlaylist.images.length > 0 
            ? selectedPlaylist.images[0].url 
            : 'https://fakeimg.pl/80x80'}
          options={[
            { 
              icon: 'create-outline', 
              label: 'Edit', 
              onPress: () => console.log('Edit playlist', selectedPlaylist.id) 
            },
            { 
              icon: 'lock-closed-outline', 
              label: 'Make private', 
              onPress: () => console.log('Make private', selectedPlaylist.id) 
            },
            { 
              icon: 'add-outline', 
              label: 'Add music', 
              onPress: () => console.log('Add music', selectedPlaylist.id) 
            },
            { 
              icon: 'trash-outline', 
              label: 'Delete', 
              onPress: () => handleDeletePlaylist(selectedPlaylist.id, selectedPlaylist.name)
            },
            { 
              icon: 'download-outline', 
              label: 'Export to json', 
              onPress: () => console.log('Export playlist', selectedPlaylist.id) 
            }
          ]}
        />
      )}
      
      {/* Playlist Options Menu */}
      <MoreOptionsMenu
        thumbnailUrl=''
        visible={playlistOptionsVisible}
        onClose={handleClosePlaylistOptions}
        title="Playlist Options"
        subtitle="Import or export your playlists"
        options={[
          { 
            icon: 'download-outline', 
            label: 'Export to JSON', 
            onPress: handleExportToJson 
          },
          { 
            icon: 'cloud-upload-outline', 
            label: 'Import from JSON', 
            onPress: handleImportFromJson 
          }
        ]}
      />

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
      
      {/* Export JSON Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={exportModalVisible}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.exportModalContent, { backgroundColor: themeStyles.colors.card }]}>
            <View style={styles.exportModalHeader}>
              <Text style={[styles.exportModalTitle, { color: themeStyles.colors.text }]}>
                Export Playlists
              </Text>
              <TouchableOpacity 
                style={styles.exportModalCloseButton}
                onPress={() => setExportModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={themeStyles.colors.icon} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.jsonContainer}>
              <Text style={[styles.jsonText, { color: themeStyles.colors.secondary }]}>
                {exportJson}
              </Text>
            </ScrollView>
            
            <View style={styles.exportModalActions}>
              <TouchableOpacity 
                style={[styles.exportModalButton, { backgroundColor: themeStyles.colors.primary }]}
                onPress={copyToClipboard}
              >
                <Text style={styles.exportModalButtonText}>Copy to Clipboard</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.exportModalButton, { backgroundColor: themeStyles.colors.tertiary }]}
                onPress={shareJsonData}
              >
                <Text style={styles.exportModalButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.exportModalButton, { backgroundColor: themeStyles.colors.border }]}
                onPress={() => setExportModalVisible(false)}
              >
                <Text style={styles.exportModalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Import JSON Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={importModalVisible}
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%', flex: 1, justifyContent: 'center' }}
          >
            <View style={[styles.importModalContent, { backgroundColor: themeStyles.colors.card }]}>
              <View style={styles.importModalHeader}>
                <Text style={[styles.importModalTitle, { color: themeStyles.colors.text }]}>
                  Import Playlists
                </Text>
                <TouchableOpacity 
                  style={styles.importModalCloseButton}
                  onPress={() => setImportModalVisible(false)}
                  disabled={isImporting}
                >
                  <Ionicons name="close" size={24} color={themeStyles.colors.icon} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.importHelpText, { color: themeStyles.colors.secondary }]}>
                Paste your JSON playlist data below:
              </Text>
              
              <TextInput
                style={[
                  styles.importJsonInput, 
                  { 
                    color: themeStyles.colors.text,
                    backgroundColor: themeStyles.colors.background,
                    borderColor: themeStyles.colors.border
                  }
                ]}
                multiline
                value={importJson}
                onChangeText={setImportJson}
                placeholder="Paste JSON here..."
                placeholderTextColor={themeStyles.colors.secondary}
                editable={!isImporting}
              />
              
              <View style={styles.importModalActions}>
                {isImporting ? (
                  <ActivityIndicator size="small" color={themeStyles.colors.primary} />
                ) : (
                  <>
                    <TouchableOpacity 
                      style={[styles.importModalButton, { backgroundColor: themeStyles.colors.primary }]}
                      onPress={processImport}
                    >
                      <Text style={styles.importModalButtonText}>Import</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.importModalButton, { backgroundColor: themeStyles.colors.border }]}
                      onPress={() => setImportModalVisible(false)}
                    >
                      <Text style={styles.importModalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      
      {/* Loading overlay for export operation */}
      {isExporting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingOverlayText}>Exporting playlists...</Text>
        </View>
      )}

      {/* Add loading overlay for delete operation */}
      {deleting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingOverlayText}>Deleting playlist...</Text>
        </View>
      )}
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  createPlaylistButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  moreOptionsButton: {
    padding: 8,
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
  
  // Export modal styles
  exportModalContent: {
    backgroundColor: '#222222',
    borderRadius: 12,
    marginHorizontal: 20,
    maxHeight: '80%',
    width: '90%',
    alignSelf: 'center',
  },
  exportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  exportModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exportModalCloseButton: {
    padding: 4,
  },
  jsonContainer: {
    padding: 16,
    maxHeight: 300,
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#AAAAAA',
  },
  exportModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    flexWrap: 'wrap',
  },
  exportModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
    minWidth: 100,
  },
  exportModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Import modal styles
  importModalContent: {
    backgroundColor: '#222222',
    borderRadius: 12,
    marginHorizontal: 20,
    width: '90%',
    alignSelf: 'center',
  },
  importModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  importModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  importModalCloseButton: {
    padding: 4,
  },
  importHelpText: {
    padding: 16,
    color: '#AAAAAA',
  },
  importJsonInput: {
    margin: 16,
    padding: 12,
    height: 200,
    borderWidth: 1,
    borderRadius: 4,
    textAlignVertical: 'top',
  },
  importModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  importModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  importModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
});