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
import { CommonActions } from "@react-navigation/native";

import HomeScreen from "../screens/home/HomeScreen";
import ChillScreen from "../screens/home/ChillScreen";
import ChartScreen from "../screens/chart/ChartScreen";
import WeekChartDetailScreen from "../screens/chart/WeekChartDetailScreen";
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
import OwnPlaylistDetailScreen from "../screens/library/PlaylistDetailScreen";
import PlaylistDetailScreen from "../screens/playlist/PlaylistDetailScreen";
import AddToPlaylistScreen from "screens/library/AddToPlaylistScreen";
import ArtistScreen from "screens/artists/ArtistDetailScreen";
import ArtistSongsScreen from "screens/artists/ArtistSongsScreen";
import ArtistPlaylistsScreen from "screens/artists/ArtistPlaylistsScreen";
import FullHistoryScreen from "../screens/library/FullHistoryScreen";

const Tab = createBottomTabNavigator<RootStackParamList>();
const LibraryStack = createNativeStackNavigator<RootStackParamList>();
const HomeStack = createNativeStackNavigator<RootStackParamList>();

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Chill" component={ChillScreen} />
    </HomeStack.Navigator>
  );
};

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
      <LibraryStack.Screen name="OwnPlaylists" component={PlaylistsScreen} />
      <LibraryStack.Screen name="Following" component={FollowingScreen} />
      <LibraryStack.Screen name="Stations" component={StationsScreen} />
      <LibraryStack.Screen name="YourUploads" component={YourUploadsScreen} />      
      <LibraryStack.Screen name="Profile" component={ProfileScreen} />
      <LibraryStack.Screen name="OwnPlaylistDetail" component={OwnPlaylistDetailScreen} />
      <LibraryStack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <LibraryStack.Screen name="ArtistDetail" component={ArtistScreen} />
      <LibraryStack.Screen name="ArtistSongs" component={ArtistSongsScreen} />
      <LibraryStack.Screen name="ArtistPlaylists" component={ArtistPlaylistsScreen} />
      <LibraryStack.Screen name="AddToPlaylist" component={AddToPlaylistScreen} />
      <LibraryStack.Screen name="FullHistory" component={FullHistoryScreen} />
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

const ChartStackScreen = () => {
  const ChartStack = createNativeStackNavigator<RootStackParamList>();
  return (
    <ChartStack.Navigator screenOptions={{ headerShown: false }}>
      <ChartStack.Screen name="Chart" component={ChartScreen} />
      <ChartStack.Screen name="WeekChartDetail" component={WeekChartDetailScreen} />
    </ChartStack.Navigator>
  );
};

export default function BottomTabNavigator({
  setAuthenticated,
}: {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}) {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkTheme : lightTheme;

  return (    <Tab.Navigator
      initialRouteName="HomeTab"
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
        headerTintColor: themeStyles.colors.text,        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Trending"
        component={ChartStackScreen}
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default behavior
            e.preventDefault();
              // Check if we're already on the Library stack
            if (navigation.getState().routes.find((r: any) => r.name === 'LibraryTab')) {
              // Get current route from the LibraryTab stack
              const libraryState = navigation.getState().routes.find((r: any) => r.name === 'LibraryTab')?.state;
              
              // If we're not at the root Library screen (or the tab is not focused)
              if (!libraryState || libraryState.index !== 0) {
                // Reset to the root Library screen
                navigation.dispatch({
                  ...CommonActions.navigate({
                    name: 'LibraryTab',
                    params: { 
                      screen: 'Library'
                    }
                  })
                });
              } else {
                // If already at the root Library screen, just focus the tab
                navigation.navigate('LibraryTab');
              }
            } else {
              // Not on the Library tab, navigate normally
              navigation.navigate('LibraryTab');
            }
          },
        })}
      >
        {(props) => (
          <LibraryStackScreen {...props} setAuthenticated={setAuthenticated} />
        )}
      </Tab.Screen>
      {/* <Tab.Screen
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
      /> */}
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
