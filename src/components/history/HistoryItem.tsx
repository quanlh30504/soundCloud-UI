import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ListeningHistoryDTO } from '../../types/history';
import { formatDistanceToNow } from 'date-fns';
import { historyApi } from '../../services/api';

interface HistoryItemProps {
  item: ListeningHistoryDTO;
  onPress: () => void;
  onRemove: () => void;
}

export const HistoryItem = ({ item, onPress, onRemove }: HistoryItemProps) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMorePress = () => {
    setIsMenuVisible(true);
    Alert.alert(
      'Remove from history',
      'Are you sure you want to remove this track from your listening history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setIsMenuVisible(false),
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await historyApi.removeFromHistory(item.id);
              onRemove();
              setIsMenuVisible(false);
            } catch (error) {
              console.error('Error removing from history:', error);
              Alert.alert('Error', 'Failed to remove track from history');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  return (
    <TouchableOpacity 
      style={styles.historyItem} 
      onPress={onPress}
    >
      <Image 
        source={{ uri: item.track.albumImages[0]?.url }} 
        style={styles.historyArtwork}
        defaultSource={require('../../../assets/images/avicii.jpg')}
      />
      <View style={styles.historyInfo}>
        <Text 
          style={[styles.historyTitle, { color: themeStyles.colors.text }]}
          numberOfLines={1}
        >
          {item.track.name}
        </Text>
        <Text 
          style={[styles.historyArtist, { color: themeStyles.colors.secondary }]}
          numberOfLines={1}
        >
          {item.track.artists.join(', ')}
        </Text>
        <View style={styles.historyMeta}>
          <Text style={[styles.historyTime, { color: themeStyles.colors.secondary }]}>
            {formatDistanceToNow(new Date(item.listenedAt), { addSuffix: true })}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.historyMore}
        onPress={handleMorePress}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={themeStyles.colors.secondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  historyArtwork: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
    marginRight: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyArtist: {
    fontSize: 14,
    marginBottom: 2,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyTime: {
    fontSize: 12,
  },
  playCount: {
    fontSize: 12,
  },
  historyMore: {
    padding: 8,
  },
}); 