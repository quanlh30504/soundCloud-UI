import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useTheme } from '../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import UpgradeScreen from '../screens/UpgradeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LikedTracksScreen from '../screens/LikedTracksScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import AlbumsScreen from '../screens/AlbumsScreen';
import FollowingScreen from '../screens/FollowingScreen';
import StationsScreen from '../screens/StationsScreen';
import YourUploadsScreen from '../screens/YourUploadsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<RootStackParamList>();
const LibraryStack = createNativeStackNavigator<RootStackParamList>();

const LibraryStackScreen = () => {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="Library" component={LibraryScreen} />
      <LibraryStack.Screen name="Settings" component={SettingsScreen} />
      <LibraryStack.Screen name="LikedTracks" component={LikedTracksScreen} />
      <LibraryStack.Screen name="Playlists" component={PlaylistsScreen} />
      <LibraryStack.Screen name="Albums" component={AlbumsScreen} />
      <LibraryStack.Screen name="Following" component={FollowingScreen} />
      <LibraryStack.Screen name="Stations" component={StationsScreen} />
      <LibraryStack.Screen name="YourUploads" component={YourUploadsScreen} />
      <LibraryStack.Screen name="Profile" component={ProfileScreen} />
    </LibraryStack.Navigator>
  );
};

export default function BottomTabNavigator() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: themeStyles.colors.tabBarActive,
        tabBarInactiveTintColor: themeStyles.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: themeStyles.colors.tabBar,
          borderTopColor: themeStyles.colors.border,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Upgrade"
        component={UpgradeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="arrow-up-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}