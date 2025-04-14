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
import SearchResultsScreen from '../screens/search/SearchResultsScreen';
import { storageService } from '../services/storage';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const MainStack = createNativeStackNavigator();
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

  const MainStackScreen = ({ 
    setAuthenticated 
  }: { 
    setAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
  }) => {
    return (
      <View style={styles.container}>
        <MainStack.Navigator 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { flex: 1 }
          }}
        >
          <MainStack.Screen name="BottomTabs">
            {(props) => <BottomTabNavigator {...props} setAuthenticated={setAuthenticated} />}
          </MainStack.Screen>
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
              <RootStack.Screen name="Main">
                {(props) => <MainStackScreen {...props} setAuthenticated={setAuthenticated} />}
              </RootStack.Screen>
              <RootStack.Screen
                name="MusicPlayer"
                component={MusicPlayerScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
            </>
          )}
        </RootStack.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', 
  },
});