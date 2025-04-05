import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import BottomTabNavigator from "./BottomTabNavigator";
import MusicPlayerScreen from "../screens/MusicPlayerScreen";
import trackPlayerService from "../services/TrackPlayerService";
import { navigationRef } from "../services/NavigationService";
import { useTheme } from "../contexts/ThemeContext";
import { darkTheme, lightTheme } from "../theme/theme";
import AlbumDetailScreen from "../screens/AlbumDetailScreen";
// Import the MiniPlayerBar
import MiniPlayerBar from "../screens/MiniPlayerBar";

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    const setupPlayer = async () => {
      try {
        const isSetup = await trackPlayerService.setup();
        if (isSetup) {
          await trackPlayerService.addTracks();
          setIsPlayerReady(true);
          console.log("Music player initialized successfully");
        }
      } catch (error) {
        console.error("Error setting up player:", error);
        setIsPlayerReady(true);
      }
    };

    setupPlayer();
  }, []);

  if (!isPlayerReady) {
    // You could return a loading component here
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef} theme={{
      dark: theme === "dark",
      colors: {
        primary: themeStyles.colors.primary,
        background: themeStyles.colors.background,
        card: themeStyles.colors.card,
        text: themeStyles.colors.text,
        border: themeStyles.colors.border,
        notification: themeStyles.colors.notification,
      }
    }}>
      {/* Wrap with a View to position mini player */}
      <View style={{ flex: 1 }}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs" component={BottomTabNavigator} />
          <RootStack.Screen
            name="MusicPlayer"
            component={MusicPlayerScreen}
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <RootStack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
        </RootStack.Navigator>
        
        {/* Add the MiniPlayerBar here */}
        <MiniPlayerBar />
      </View>
    </NavigationContainer>
  );
}