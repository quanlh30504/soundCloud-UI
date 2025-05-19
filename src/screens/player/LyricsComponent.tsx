import React, { useState, useEffect, useRef } from "react";
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, ActivityIndicator } from "react-native";
import { useProgress } from "react-native-track-player";
import { getTrack } from "react-native-track-player/lib/src/trackPlayer";
import { getTrackLyrics } from "../../services/api";

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
  const scrollViewRef = useRef<ScrollView>(null);
  const progress = useProgress();
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchLyrics = async () => {
      if (!trackId) {
        setLyricsLines([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const lyricsData = await getTrackLyrics(trackId);
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
  
  const scrollToLyric = (index: number) => {
    if (index >= 0 && scrollViewRef.current) {
      const windowHeight = Dimensions.get('window').height;
      const centerPosition = index * 60 - (windowHeight / 2) + 200;
      
      scrollViewRef.current.scrollTo({
        y: Math.max(0, centerPosition),
        animated: true,
      });
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
    <ScrollView 
      ref={scrollViewRef}
      style={styles.lyricsScrollView}
      contentContainerStyle={styles.lyricsContent}
      showsVerticalScrollIndicator={false}
    >
      {lyricsLines.map((line, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.lyricLine}
          onPress={() => handleLyricPress(index)}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.lyricText, 
              { 
                color: currentLyricIndex === index ? themeStyles.primary : themeStyles.text,
                fontWeight: currentLyricIndex === index ? "bold" : "normal",
                fontSize: currentLyricIndex === index ? 24 : 18,
              }
            ]}
          >
            {line.text}
          </Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
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