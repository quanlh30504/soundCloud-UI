import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { darkTheme, lightTheme } from '../theme/theme';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeStyles.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="tv-outline" size={24} color={themeStyles.colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-horizontal" size={24} color={themeStyles.colors.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { borderColor: themeStyles.colors.border }]}>
            <Ionicons name="person" size={90} color={themeStyles.colors.secondary} />
          </View>
        </View>
        <Text style={[styles.userName, { color: themeStyles.colors.text }]}>
          Toàn Trần Duy
        </Text>
        <Text style={[styles.followInfo, { color: themeStyles.colors.secondary }]}>
          0 Followers · 2 Following
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color={themeStyles.colors.text} />
          </TouchableOpacity>
          <View style={styles.rightActionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: themeStyles.colors.card }]}>
              <Ionicons name="shuffle" size={24} color={themeStyles.colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={24} color={themeStyles.colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Empty State */}
      <View style={styles.emptyState}>
        <Text style={[styles.emptyStateTitle, { color: themeStyles.colors.text }]}>
          Seems a little quiet over here
        </Text>
        <Text style={[styles.emptyStateSubtitle, { color: themeStyles.colors.secondary }]}>
          Tracks you like, repost or upload will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
    padding: 8,
  },
  profileInfo: {
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  editButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  followInfo: {
    fontSize: 14,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  rightActionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});