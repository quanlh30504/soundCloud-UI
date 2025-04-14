import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'> & {
  setAuthenticated: (value: boolean) => void;
};

export default function RegisterScreen({ navigation, setAuthenticated }: { navigation: RegisterScreenNavigationProp; setAuthenticated: (value: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // 1. Tạo user trên Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Cập nhật displayName trên Firebase
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // 3. Đồng bộ với Spring Boot backend
      const userData = {
        firebaseUid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        avatarUrl: '' // Có thể thêm sau
      };

      await authApi.syncUser(userData);
      setAuthenticated(true);
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Đồng bộ với Spring Boot backend
      const userData = {
        firebaseUid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        avatarUrl: user.photoURL || ''
      };

      await authApi.syncUser(userData);
      setAuthenticated(true);
    } catch (error: any) {
      Alert.alert('Error', 'Google sign up failed. Please try again.');
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
            source={require('../../../assets/images/signup.png')} 
            style={styles.headerImage} 
            resizeMode="contain" />
        </View>
      </SafeAreaView>
      
      <View style={styles.formContainer}>
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            value={displayName}
            onChangeText={setDisplayName}
          />
          
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleRegister}
            disabled={loading}>
            <Text style={styles.signupButtonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.dividerText}>Or</Text>
        
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleSignUp}
            disabled={loading}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}> Login</Text>
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
    flex: 0.2,
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
    width: 325,
    height: 110,
  },
  formContainer: {
    flex: 0.8,
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
  signupButton: {
    backgroundColor: '#FF5500',
    padding: 12,
    borderRadius: 4,
    marginTop: 16,
    marginBottom: 16,
  },
  signupButtonText: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  loginText: {
    color: '#999999',
    fontWeight: '500',
  },
  loginLink: {
    fontWeight: '600',
    color: '#FF5500',
  },
});