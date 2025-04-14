import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from "../../services/storage";
import { authApi } from "../../services/api";
import { SafeAreaView } from 'react-native-safe-area-context';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'> & {
  setAuthenticated: (value: boolean) => void;
};

export default function LoginScreen({ navigation, setAuthenticated }: { navigation: LoginScreenNavigationProp; setAuthenticated: (value: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Lấy token từ Firebase
      const token = await user.getIdToken();
      
      // Lưu token vào AsyncStorage
      await storageService.setAuthToken(token);
      
      // Lưu thông tin user
      const userData = {
        firebaseUid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        avatarUrl: user.photoURL || ''
      };
      await storageService.setUserData(userData);

      await authApi.syncUser(userData);

      setAuthenticated(true);
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Lấy token từ Firebase
      const token = await user.getIdToken();
      
      // Lưu token vào AsyncStorage
      await storageService.setAuthToken(token);
      
      // Lưu thông tin user
      const userData = {
        firebaseUid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        avatarUrl: user.photoURL || ''
      };
      await storageService.setUserData(userData);

      await authApi.syncUser(userData);

      setAuthenticated(true);
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../assets/images/login.png')} 
            style={styles.headerImage} 
            resizeMode="contain" />
        </View>
      </SafeAreaView>
      
      <View style={styles.formContainer}>
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput 
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput 
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}>
            <Text style={styles.loginButtonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.dividerText}>Or</Text>
        
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loading}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure black background
  },
  header: {
    flex: 0.3,
  },
  backButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  backButton: {
    padding: 8,
    marginLeft: 16,
    backgroundColor: '#333333',
    borderRadius: 4,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerImage: {
    width: 220,
    height: 200,
  },
  formContainer: {
    flex: 0.7,
    backgroundColor: '#111111',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  form: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#999999',
    marginLeft: 16,
    marginBottom: 4,
  },
  input: {
    padding: 16,
    backgroundColor: '#222222',
    color: 'white',
    borderRadius: 4,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#999999',
  },
  loginButton: {
    backgroundColor: '#FF5500',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  dividerText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  googleButton: {
    padding: 8,
    backgroundColor: '#222222',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  registerText: {
    color: '#999999',
    fontWeight: '500',
  },
  registerLink: {
    fontWeight: '600',
    color: '#FF5500',
  },
});
