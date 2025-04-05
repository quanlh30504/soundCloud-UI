import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { storageService } from '../services/storage';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator({ 
  isAuthenticated, 
  setAuthenticated 
}: { 
  isAuthenticated: boolean | null; 
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}) {
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

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setAuthenticated={setAuthenticated} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => <RegisterScreen {...props} setAuthenticated={setAuthenticated} />}
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen name="Main">
          {(props) => <BottomTabNavigator {...props} setAuthenticated={setAuthenticated} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
} 