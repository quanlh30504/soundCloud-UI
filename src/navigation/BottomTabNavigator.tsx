import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { useTheme } from "../contexts/ThemeContext";
import { darkTheme, lightTheme } from "../config/theme";
import Ionicons from "react-native-vector-icons/Ionicons";
import { TouchableOpacity, Text, Alert } from "react-native";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { storageService } from "../services/storage";

import HomeScreen from "../screens/home/HomeScreen";
import FeedScreen from "../screens/feed/FeedScreen";
import SearchScreen from "../screens/search/SearchScreen";
import LibraryScreen from "../screens/library/LibraryScreen";
import UpgradeScreen from "../screens/upgrade/UpgradeScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import LikedTracksScreen from "../screens/library/LikedTracksScreen";
import PlaylistsScreen from "../screens/library/PlaylistsScreen";
import FollowingScreen from "../screens/library/FollowingScreen";
import StationsScreen from "../screens/library/StationsScreen";
import YourUploadsScreen from "../screens/library/YourUploadsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SearchResultsScreen from "../screens/search/SearchResultsScreen";
import PlaylistDetailScreen from "../screens/library/PlaylistDetailScreen";

const Tab = createBottomTabNavigator<RootStackParamList>();
const LibraryStack = createNativeStackNavigator<RootStackParamList>();

const LibraryStackScreen = ({
  setAuthenticated,
}: {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}) => {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="Library" component={LibraryScreen} />
      <LibraryStack.Screen name="Settings">
        {(props) => (
          <SettingsScreen {...props} setAuthenticated={setAuthenticated} />
        )}
      </LibraryStack.Screen>
      <LibraryStack.Screen name="LikedTracks" component={LikedTracksScreen} />
      <LibraryStack.Screen name="Playlists" component={PlaylistsScreen} />
      <LibraryStack.Screen name="Following" component={FollowingScreen} />
      <LibraryStack.Screen name="Stations" component={StationsScreen} />
      <LibraryStack.Screen name="YourUploads" component={YourUploadsScreen} />
      <LibraryStack.Screen name="Profile" component={ProfileScreen} />
      <LibraryStack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
    </LibraryStack.Navigator>
  );
};

const SearchStackScreen = () => {
  const SearchStack = createNativeStackNavigator<RootStackParamList>();
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="SearchResults" component={SearchResultsScreen} /> 
    </SearchStack.Navigator>
  );
};

export default function BottomTabNavigator({
  setAuthenticated,
}: {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}) {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkTheme : lightTheme;

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
        headerStyle: {
          backgroundColor: themeStyles.colors.background,
        },
        headerTintColor: themeStyles.colors.text,
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
      {/* <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="SearchTab"
        component={SearchStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <LibraryStackScreen {...props} setAuthenticated={setAuthenticated} />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Upgrade"
        component={UpgradeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="arrow-up-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <SettingsScreen {...props} setAuthenticated={setAuthenticated} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
