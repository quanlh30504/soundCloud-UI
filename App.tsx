import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import TrackPlayer from 'react-native-track-player';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { auth } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { storageService } from './src/services/storage';
import { authApi } from './src/services/api';

// Wrapper component that uses the theme context
const Main = ({ isAuthenticated, setAuthenticated }: { isAuthenticated: boolean | null, setAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>> }) => {
  const { theme } = useTheme();
  
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {/* <NavigationContainer>
        <RootNavigator isAuthenticated={isAuthenticated} setAuthenticated={setAuthenticated} />
      </NavigationContainer> */}
      <AppNavigator isAuthenticated={isAuthenticated} setAuthenticated={setAuthenticated} />
    </>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(true);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi app khởi động
    const checkAuthState = async () => {
      try {
        // 1. Kiểm tra token trong AsyncStorage
        const token = await storageService.getAuthToken();
        if (token) {
          // 2. Kiểm tra token với Firebase
          onAuthStateChanged(auth, async (user) => {
            if (user) {
              // 3. Đồng bộ thông tin user với backend
              try {
                const userData = {
                  firebaseUid: user.uid,
                  email: user.email || '',
                  displayName: user.displayName || '',
                  avatarUrl: user.photoURL || ''
                };
                await authApi.syncUser(userData);
                setIsAuthenticated(true);
              } catch (error) {
                console.error('Error syncing user:', error);
                setIsAuthenticated(false);
              }
            } else {
              setIsAuthenticated(false);
            }
          });
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthState();
  }, []);

  // Hiển thị loading screen trong khi kiểm tra trạng thái đăng nhập
  if (isAuthenticated === null) {
    return null; // Hoặc return một loading component
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Main isAuthenticated={isAuthenticated} setAuthenticated={setIsAuthenticated} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}