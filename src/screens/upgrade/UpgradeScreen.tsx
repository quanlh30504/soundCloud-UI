import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemeStyles } from '../../hooks/useThemeStyles';

export default function UpgradeScreen() {
  const { colors } = useThemeStyles();

  const features = [
    { icon: 'musical-notes-outline', title: 'Unlimited uploads', description: 'Upload as many tracks as you want' },
    { icon: 'analytics-outline', title: 'Advanced analytics', description: 'Get detailed insights about your audience' },
    { icon: 'download-outline', title: 'Download tracks', description: 'Download your favorite tracks for offline listening' },
    { icon: 'volume-high-outline', title: 'High quality audio', description: 'Stream and upload in high quality' },
    { icon: 'time-outline', title: 'Skip the ads', description: 'Enjoy uninterrupted listening experience' },
    { icon: 'people-outline', title: 'More followers', description: 'Get discovered by more listeners' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="diamond-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Go Pro</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            Unlock all premium features and take your music experience to the next level
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={[styles.featureItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={feature.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.secondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingContainer}>
          <View style={[styles.pricingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.pricingTitle, { color: colors.text }]}>Monthly Plan</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>$9.99</Text>
              <Text style={[styles.priceUnit, { color: colors.secondary }]}>/month</Text>
            </View>
            <Text style={[styles.pricingDescription, { color: colors.secondary }]}>
              Cancel anytime
            </Text>
          </View>

          <View style={[styles.pricingCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Most Popular</Text>
            </View>
            <Text style={[styles.pricingTitle, { color: colors.text }]}>Yearly Plan</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>$99.99</Text>
              <Text style={[styles.priceUnit, { color: colors.secondary }]}>/year</Text>
            </View>
            <Text style={[styles.pricingDescription, { color: colors.secondary }]}>
              Save 17% - 2 months free
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.upgradeButtonText}>Start Free Trial</Text>
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.secondary }]}>
          7-day free trial, then $9.99/month. Cancel anytime.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginVertical: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  pricingContainer: {
    gap: 16,
    marginBottom: 30,
  },
  pricingCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  priceUnit: {
    fontSize: 16,
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: 14,
  },
  upgradeButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 18,
  },
});