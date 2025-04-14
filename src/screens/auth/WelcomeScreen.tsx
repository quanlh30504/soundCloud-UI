import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: { navigation: WelcomeScreenNavigationProp }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Let's Get Started!
        </Text>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../assets/images/soundcloud.png')} 
            style={styles.image} 
            resizeMode="contain"
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.signupButton}>
            <Text style={styles.signupButtonText}>
              Sign Up
            </Text>
          </TouchableOpacity>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}> Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure black background
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  image: {
    width: 350,
    height: 350,
  },
  buttonContainer: {
    marginHorizontal: 28,
    gap: 16,
  },
  signupButton: {
    backgroundColor: '#FF5500', // SoundCloud orange color
    paddingVertical: 12,
    borderRadius: 4, // More squared corners like SoundCloud
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#999999', // Light gray for secondary text
    fontWeight: '500',
  },
  loginLink: {
    fontWeight: '600',
    color: '#FF5500', // SoundCloud orange for links
  },
});
