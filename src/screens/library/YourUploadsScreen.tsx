import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemeStyles } from '../../hooks/useThemeStyles';

export default function YourUploadsScreen() {
  const { colors } = useThemeStyles();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Your Uploads</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="add-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="cloud-upload-outline" size={64} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Upload your first track
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>
            Share your music with the world. Upload your tracks and start building your audience.
          </Text>
          
          <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="cloud-upload-outline" size={20} color="white" />
            <Text style={styles.uploadButtonText}>Upload Track</Text>
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="musical-notes-outline" size={24} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text }]}>High quality audio</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text }]}>Reach your audience</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics-outline" size={24} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text }]}>Track performance</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 40,
    gap: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
});