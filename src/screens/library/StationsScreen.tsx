import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemeStyles } from '../../hooks/useThemeStyles';

export default function StationsScreen() {
  const { themeStyles, colors } = useThemeStyles();

  const stationCategories = [
    { id: 1, name: 'Recently Played', icon: 'time-outline', description: 'Your recent listening history' },
    { id: 2, name: 'Liked Songs', icon: 'heart-outline', description: 'Songs you\'ve liked' },
    { id: 3, name: 'Discovery Mix', icon: 'musical-notes-outline', description: 'New music for you' },
    { id: 4, name: 'Chill Station', icon: 'leaf-outline', description: 'Relaxing vibes' },
    { id: 5, name: 'Workout', icon: 'fitness-outline', description: 'High energy tracks' },
    { id: 6, name: 'Focus', icon: 'library-outline', description: 'Music for concentration' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Stations</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Made for you
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>
          Personalized radio stations based on your listening
        </Text>

        <View style={styles.stationsGrid}>
          {stationCategories.map((station) => (
            <TouchableOpacity
              key={station.id}
              style={[styles.stationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={[styles.stationIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name={station.icon as any} size={28} color={colors.primary} />
              </View>
              <Text style={[styles.stationName, { color: colors.text }]}>
                {station.name}
              </Text>
              <Text style={[styles.stationDescription, { color: colors.secondary }]}>
                {station.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.emptySection}>
          <Ionicons name="radio-outline" size={48} color={colors.secondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Create your first station
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>
            Stations will appear here when you create them
          </Text>
          <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.createButtonText}>Create Station</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  stationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  stationCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 120,
  },
  stationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stationDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});