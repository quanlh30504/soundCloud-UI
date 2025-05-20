import React, { useState, useEffect, useRef } from "react";
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, ActivityIndicator } from "react-native";
import { useProgress } from "react-native-track-player";
import { trackApi } from "../../services/api";
import { FlatList } from 'react-native';

interface LyricLine {
  text: string;
  startTime?: number;
}

interface LyricsComponentProps {
  trackId: string;
  onLyricPress: (time: number) => Promise<void>;
  themeStyles: {
    background: string;
    primary: string;
    text: string;
    secondary: string;
  };
}

const LyricsComponent: React.FC<LyricsComponentProps> = ({
  trackId,
  onLyricPress,
  themeStyles,
}) => {
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [lyricsLines, setLyricsLines] = useState<LyricLine[]>([]);
  // const scrollViewRef = useRef<ScrollView>(null);
  const scrollViewRef = useRef<FlatList<any>>(null);
  const progress = useProgress(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching lyrics for trackId:", trackId);
    const fetchLyrics = async () => {
      if (!trackId) {
        setLyricsLines([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const lyricsData = (await trackApi.getTrackLyrics(trackId)).data;
        if (lyricsData && Array.isArray(lyricsData)) {
          const formattedLyrics = lyricsData.map(line => ({
            text: line.text,
            startTime: convertTimestampToSeconds(line.timestamp)
          }));
          setLyricsLines(formattedLyrics);
        } else {
          setLyricsLines([]);
        }
      } catch (error) {
        console.error("Error fetching lyrics:", error);
        setLyricsLines([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLyrics();
  }, [trackId]);
    
  const convertTimestampToSeconds = (timestamp: string): number => {
    if (!timestamp) return 0;
    
    const parts = timestamp.split(':');
    if (parts.length !== 2) return 0;
    
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    
    return minutes * 60 + seconds;
  };
  
  useEffect(() => {
    if (lyricsLines.length === 0 || progress.duration <= 0) return;

    const currentTime = progress.position;
    let index = -1;
    
    for (let i = 0; i < lyricsLines.length; i++) {
      const line = lyricsLines[i];
      const nextLine = i < lyricsLines.length - 1 ? lyricsLines[i + 1] : null;
      
      if (line.startTime !== undefined && 
          currentTime >= line.startTime && 
          ((nextLine?.startTime !== undefined && currentTime < nextLine.startTime) || !nextLine)) {
        index = i;
        break;
      }
    }
    
    if (index === -1) {
      const timePerLine = progress.duration / lyricsLines.length;
      index = Math.min(Math.floor(currentTime / timePerLine), lyricsLines.length - 1);
    }
    
    if (index !== currentLyricIndex) {
      setCurrentLyricIndex(index);
      scrollToLyric(index);
    }
  }, [progress.position, progress.duration]);

  // const scrollToLyric = (index: number) => {
  //   if (scrollViewRef.current) {
  //     scrollViewRef.current.scrollToIndex({
  //       index,
  //       animated: true,
  //       viewPosition: 0.5, // scroll đến giữa màn hình
  //     });
  //   }
  // };
  const scrollToLyric = (index: number) => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100); // Delay 100ms để FlatList render xong item
    }
  };
  
  const handleLyricPress = (index: number) => {
    if (progress.duration <= 0 || lyricsLines.length === 0) return;
    
    if (lyricsLines[index].startTime !== undefined) {
      onLyricPress(lyricsLines[index].startTime!);
    } else {
      const timePerLine = progress.duration / lyricsLines.length;
      const seekTime = index * timePerLine;
      onLyricPress(seekTime);
    }
    
    setCurrentLyricIndex(index);
  };
  
  return (
    <FlatList
      ref={scrollViewRef}
      data={lyricsLines}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          onPress={() => handleLyricPress(index)}
          activeOpacity={0.7}
          style={styles.lyricLine}
        >
          <Text
            style={[
              styles.lyricText,
              {
                color: currentLyricIndex === index ? themeStyles.primary : themeStyles.text,
                fontWeight: currentLyricIndex === index ? 'bold' : 'normal',
                fontSize: currentLyricIndex === index ? 24 : 18,
              },
            ]}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.lyricsContent}
      showsVerticalScrollIndicator={false}
      onScrollToIndexFailed={({ index }) => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
        }, 300);
      }}
    />
  );
};

const styles = StyleSheet.create({
  lyricsScrollView: {
    flex: 1,
  },
  lyricsContent: {
    paddingVertical: 20,
  },
  lyricLine: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lyricText: {
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default LyricsComponent;