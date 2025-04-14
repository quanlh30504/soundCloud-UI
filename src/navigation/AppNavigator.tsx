import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import BottomTabNavigator from "./BottomTabNavigator";
import MusicPlayerScreen from "../screens/player/MusicPlayerScreen";
import trackPlayerService from "../services/player/TrackPlayerService";
import { navigationRef } from "../services/navigation/NavigationService";
import { useTheme } from "../contexts/ThemeContext";
import { darkTheme, lightTheme } from "../config/theme";
import AlbumDetailScreen from "../screens/album/AlbumDetailScreen";
import MiniPlayerBar from "../components/common/MiniPlayerBar";
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import { storageService } from '../services/storage';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ 
  isAuthenticated, 
  setAuthenticated 
}: { 
  isAuthenticated: boolean | null; 
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}) {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkTheme : lightTheme;

  const handleLogout = async () => {
    try {
      // Đăng xuất khỏi Firebase
      await signOut(auth);
      
      // Xóa token và thông tin user khỏi AsyncStorage
      await storageService.removeAuthToken();
      await storageService.removeUserData();
      
      // Cập nhật trạng thái đăng nhập
      setAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
          {/* <RootStack.Screen name="MainTabs" component={BottomTabNavigator} /> */}
          {!isAuthenticated ? (
            <>
              <RootStack.Screen name="Welcome" component={WelcomeScreen} />
              <RootStack.Screen name="Login">
                {(props) => <LoginScreen {...props} setAuthenticated={setAuthenticated} />}
              </RootStack.Screen>
              <RootStack.Screen name="Register">
                {(props) => <RegisterScreen {...props} setAuthenticated={setAuthenticated} />}
              </RootStack.Screen>
            </>
          ) : (
            <>
              <RootStack.Screen name="MainTabs">
                {(props) => <BottomTabNavigator {...props} setAuthenticated={setAuthenticated} />}
              </RootStack.Screen>
              <RootStack.Screen
                name="MusicPlayer"
                component={MusicPlayerScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <RootStack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
            </>
          )}
        </RootStack.Navigator>
        
        {/* Add the MiniPlayerBar here */}
        <MiniPlayerBar />
      </View>
    </NavigationContainer>
  );
}