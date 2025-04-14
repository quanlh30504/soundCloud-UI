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
import MiniPlayerBar from "../screens/MiniPlayerBar";
import SearchResultsScreen from '../screens/SearchResultsScreen';

const MainStack = createNativeStackNavigator();
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

  const MainStackScreen = () => {
    return (
      <View style={styles.container}>
        <MainStack.Navigator 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { flex: 1 }
          }}
        >
          <MainStack.Screen name="BottomTabs" component={BottomTabNavigator} />
          <MainStack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
          <MainStack.Screen name="SearchResults" component={SearchResultsScreen} /> 
        </MainStack.Navigator>
        
        <MiniPlayerBar />
      </View>
    );
  };

  if (!isPlayerReady) {
    return null;
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      theme={{
        dark: theme === "dark",
        colors: {
          primary: themeStyles.colors.primary,
          background: themeStyles.colors.background,
          card: themeStyles.colors.card,
          text: themeStyles.colors.text,
          border: themeStyles.colors.border,
          notification: themeStyles.colors.notification,
        }
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainStackScreen} />
                <RootStack.Screen
          name="MusicPlayer"
          component={MusicPlayerScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', 
  },
});