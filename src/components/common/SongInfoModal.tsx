import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SongData } from '../../types/zing';

interface SongInfoModalProps {
  visible: boolean;
  onClose: () => void;
  songData: SongData | null;
  themeStyles: {
    background: string;
    primary: string;
    text: string;
    secondary: string;
  };
}

const SongInfoModal: React.FC<SongInfoModalProps> = ({
  visible,
  onClose,
  songData,
  themeStyles,
}) => {
  if (!songData) return null;

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={themeStyles.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeStyles.text }]}>Song Info</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Song Thumbnail */}
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: songData.thumbnailM || songData.thumbnail || 'https://fakeimg.pl/200x200' }}
              style={styles.thumbnail}
            />
          </View>

          {/* Song Details */}
          <View style={styles.infoSection}>
            <InfoRow
              label="Title"
              value={songData.title}
              themeStyles={themeStyles}
            />
            
            <InfoRow
              label="Artist(s)"
              value={songData.artistsNames}
              themeStyles={themeStyles}
            />

            {songData.album && (
              <InfoRow
                label="Album"
                value={songData.album.title}
                themeStyles={themeStyles}
              />
            )}

            <InfoRow
              label="Duration"
              value={formatDuration(songData.duration)}
              themeStyles={themeStyles}
            />

            <InfoRow
              label="Release Date"
              value={formatDate(songData.releaseDate)}
              themeStyles={themeStyles}
            />

            {songData.distributor && (
              <InfoRow
                label="Distributor"
                value={songData.distributor}
                themeStyles={themeStyles}
              />
            )}

            {songData.genres && songData.genres.length > 0 && (
              <InfoRow
                label="Genres"
                value={songData.genres.map(g => g.name).join(', ')}
                themeStyles={themeStyles}
              />
            )}

            {songData.composers && songData.composers.length > 0 && (
              <InfoRow
                label="Composers"
                value={songData.composers.map(c => c.name).join(', ')}
                themeStyles={themeStyles}
              />
            )}

            <InfoRow
              label="Has Lyrics"
              value={songData.hasLyric ? 'Yes' : 'No'}
              themeStyles={themeStyles}
            />

            <InfoRow
              label="Track ID"
              value={songData.encodeId}
              themeStyles={themeStyles}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  themeStyles: {
    text: string;
    secondary: string;
  };
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, themeStyles }) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: themeStyles.secondary }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: themeStyles.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  thumbnailContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  thumbnail: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  infoSection: {
    paddingBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
});

export default SongInfoModal;
