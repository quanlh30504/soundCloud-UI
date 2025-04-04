import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  setAuthenticated: (value: boolean) => void;
};

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'> & {
  setAuthenticated: (value: boolean) => void;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => <RegisterScreen {...props} setAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      )}
    </Stack.Navigator>
  );
}; 