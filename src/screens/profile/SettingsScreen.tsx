import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../../config/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { storageService } from '../../services/storage';

type ThemeMode = 'dark' | 'light' | 'system';

const SettingItem = ({ title, onPress, rightElement }: { 
  title: string; 
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <Text style={[styles.settingItemText, { color: themeStyles.colors.text }]}>
        {title}
      </Text>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={themeStyles.colors.secondary} />
      )}
    </TouchableOpacity>
  );
};

const ThemeOption = ({ 
  mode, 
  label, 
  isSelected, 
  onSelect 
}: { 
  mode: ThemeMode;
  label: string;
  isSelected: boolean;
  onSelect: (mode: ThemeMode) => void;
}) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <TouchableOpacity 
      style={[styles.themeOption, { borderBottomColor: themeStyles.colors.border }]}
      onPress={() => onSelect(mode)}
    >
      <View style={styles.themeOptionContent}>
        <Text style={[styles.themeOptionText, { color: themeStyles.colors.text }]}>
          {label}
        </Text>
        {mode === 'system' && (
          <Text style={[styles.themeOptionSubtext, { color: themeStyles.colors.secondary }]}>
            Follow device setting
          </Text>
        )}
      </View>
      {isSelected && (
        <Ionicons name="checkmark" size={20} color={themeStyles.colors.primary} />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen({ setAuthenticated }: { setAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>> }) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const getThemeDisplayText = () => {
    switch (themeMode) {
      case 'dark':
        return 'Dark';
      case 'light':
        return 'Light';
      case 'system':
        return `System (${theme === 'dark' ? 'Dark' : 'Light'})`;
      default:
        return 'System';
    }
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    toggleTheme(mode);
    setThemeModalVisible(false);
  };

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
        {/* <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="tv-outline" size={24} color={themeStyles.colors.icon} />
        </TouchableOpacity> */}
      </View>      
      {/* Settings Content */}
      <ScrollView style={styles.content}>
        <SettingItem title="Account" />
        <SettingItem title="Music Visualization" />
        <SettingItem title="Basic settings" />
        <SettingItem 
          title="Theme" 
          onPress={() => setThemeModalVisible(true)}
          rightElement={
            <View style={styles.themeDisplayContainer}>
              <Text style={[styles.themeDisplayText, { color: themeStyles.colors.secondary }]}>
                {getThemeDisplayText()}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={themeStyles.colors.secondary} />
            </View>
          }
        />
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

      {/* Theme Selection Modal */}
      <Modal
        visible={themeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeStyles.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeStyles.colors.text }]}>
                Choose Theme
              </Text>
              <TouchableOpacity onPress={() => setThemeModalVisible(false)}>
                <Ionicons name="close" size={24} color={themeStyles.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.themeOptionsContainer}>
              <ThemeOption
                mode="system"
                label="System"
                isSelected={themeMode === 'system'}
                onSelect={handleThemeSelect}
              />
              <ThemeOption
                mode="dark"
                label="Dark"
                isSelected={themeMode === 'dark'}
                onSelect={handleThemeSelect}
              />
              <ThemeOption
                mode="light"
                label="Light"
                isSelected={themeMode === 'light'}
                onSelect={handleThemeSelect}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  settingItemText: {
    fontSize: 16,
    color: '#fff',
  },
  themeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeDisplayText: {
    fontSize: 14,
  },
  signOutContainer: {
    padding: 16,
    marginTop: 20,
    marginBottom: 100,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeOptionsContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  themeOptionContent: {
    flex: 1,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  themeOptionSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
});