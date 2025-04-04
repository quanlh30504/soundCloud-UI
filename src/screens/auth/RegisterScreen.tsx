import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import { registerUser } from '../../services/authService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';

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

      await registerUser(userData);
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

      await registerUser(userData);
      setAuthenticated(true);
    } catch (error: any) {
      Alert.alert('Error', 'Google sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button 
        title={loading ? "Creating Account..." : "Register"} 
        onPress={handleRegister} 
        disabled={loading}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignUp}
        disabled={loading}
      >
        <Ionicons name="logo-google" size={20} color="#DB4437" />
        <Text style={styles.googleButtonText}>Sign up with Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.loginLink} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: "center",
    color: '#333',
  },
  input: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  googleButtonText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  loginLink: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});