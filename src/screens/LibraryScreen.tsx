import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Create a typed navigation prop
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LibraryItem = ({ 
  title, 
  onPress 
}: { 
  title: string;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <TouchableOpacity style={styles.libraryItem} onPress={onPress}>
      <Text style={[styles.libraryItemText, { color: themeStyles.colors.text }]}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={themeStyles.colors.secondary} />
    </TouchableOpacity>
  );
};

const LibrarySection = ({ title, description }: { title: string; description: string }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: themeStyles.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.sectionDescription, { color: themeStyles.colors.secondary }]}>
        {description}
      </Text>
    </View>
  );
};

export default function LibraryScreen() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeStyles.colors.text }]}>Library</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.proButton}>
            <Text style={styles.proButtonText}>GET PRO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="tv-outline" size={24} color={themeStyles.colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={themeStyles.colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Library Content */}
      <ScrollView style={styles.content}>
        {/* Library Items */}
        <LibraryItem 
          title="Liked tracks" 
          onPress={() => navigation.navigate('LikedTracks')} 
        />
        <LibraryItem 
          title="Playlists" 
          onPress={() => navigation.navigate('Playlists')} 
        />
        <LibraryItem 
          title="Albums" 
          onPress={() => navigation.navigate('Albums')} 
        />
        <LibraryItem 
          title="Following" 
          onPress={() => navigation.navigate('Following')} 
        />
        <LibraryItem 
          title="Stations" 
          onPress={() => navigation.navigate('Stations')} 
        />
        <LibraryItem 
          title="Your uploads" 
          onPress={() => navigation.navigate('YourUploads')} 
        />

        {/* Recently Played Section */}
        <LibrarySection 
          title="Recently played" 
          description="Find all your recently played content here." 
        />

        {/* Listening History Section */}
        <LibrarySection 
          title="Listening history" 
          description="Find all the tracks you've listened to here." 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proButton: {
    backgroundColor: '#FF5500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  proButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  iconButton: {
    marginHorizontal: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  libraryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    // Removed border properties
  },
  libraryItemText: {
    fontSize: 16,
  },
  sectionContainer: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
  },
});