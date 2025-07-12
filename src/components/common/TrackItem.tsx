import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import { SongData } from '../../types/zing';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface TrackItemProps {
  track: SongData;
  onPress: () => void;
  onMoreOptions?: () => void;
  showMoreOptions?: boolean;
  showRank?: number;
  style?: any;
}

export default function TrackItem({
  track,
  onPress,
  onMoreOptions,
  showMoreOptions = true,
  showRank,
  style,
}: TrackItemProps) {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {showRank !== undefined && (
        <Text style={[styles.rank, { color: themeStyles.colors.text }]}>
          {showRank}
        </Text>
      )}
      
      <Image
        source={{ uri: track.thumbnailM || track.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
        <View style={styles.info}>
        <Text
          style={[styles.title, { color: themeStyles.colors.text }]}
          numberOfLines={1}
        >
          {track.title || 'Unknown Title'}
        </Text>
        <Text
          style={[styles.artist, { color: themeStyles.colors.secondary }]}
          numberOfLines={1}
        >
          {track.artistsNames || 'Unknown Artist'}
        </Text>
        <Text
          style={[styles.duration, { color: themeStyles.colors.secondary }]}
          numberOfLines={1}
        >
          {typeof track.duration === 'number' ? formatDuration(track.duration) : '0:00'}
        </Text>
      </View>

      {showMoreOptions && (
        <TouchableOpacity
          style={styles.moreButton}
          onPress={onMoreOptions}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={themeStyles.colors.secondary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 24,
    textAlign: 'center',
    marginRight: 12,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    fontSize: 14,
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
  },
  moreButton: {
    padding: 8,
  },
});
