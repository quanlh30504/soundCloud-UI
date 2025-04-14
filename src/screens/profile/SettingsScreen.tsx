import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { storageService } from '../../services/storage';

const SettingItem = ({ title }: { title: string }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <TouchableOpacity style={styles.settingItem}>
      <Text style={[styles.settingItemText, { color: themeStyles.colors.text }]}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={themeStyles.colors.secondary} />
    </TouchableOpacity>
  );
};

export default function SettingsScreen({ setAuthenticated }: { setAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>> }) {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation();

  const handleSignOut = async () => {
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
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeStyles.colors.text }]}>Settings</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="tv-outline" size={24} color={themeStyles.colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Settings Content */}
      <ScrollView style={styles.content}>
        <SettingItem title="Account" />
        <SettingItem title="Upload" />
        <SettingItem title="Basic settings" />
        <SettingItem title="Social settings" />
        <SettingItem title="Inbox" />
        <SettingItem title="Notifications" />
        <SettingItem title="Add widgets" />
        <SettingItem title="Analytics" />
        <SettingItem title="Communications" />
        <SettingItem title="Advertising" />
        <SettingItem title="Support" />
        <SettingItem title="Legal" />
        
        <View style={styles.signOutContainer}>
          <TouchableOpacity 
            style={[styles.signOutButton, { backgroundColor: themeStyles.colors.background }]}
            onPress={handleSignOut}
          >
            <Text style={[styles.signOutText, { color: 'red' }]}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 16,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    // Removed borderBottomWidth and borderBottomColor
  },
  settingItemText: {
    fontSize: 16,
    color: '#fff',
  },
  signOutContainer: {
    padding: 16,
    marginTop: 20,
    marginBottom: 100, // Space for bottom tab navigator
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 4,
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});