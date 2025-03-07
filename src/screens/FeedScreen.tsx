import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../theme/theme';

export default function FeedScreen() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      <View style={styles.content}>
        <Text style={{ color: themeStyles.colors.text }}>Feed Screen</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});