import React from "react";
import {View,Text,StyleSheet,ScrollView,Image,TouchableOpacity,ImageBackground,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { darkTheme } from "../theme/theme";
import Icon from "react-native-vector-icons/Ionicons";
import trackPlayerService from "../services/TrackPlayerService";
import { recommendedTracks, buzzingCategories } from "../data/sampleData";
import { albums } from "../data/albumData";


export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const themeStyles = darkTheme;

  const backgroundColor = "#121212";
  const textColor = "#ffffff";
  const secondaryTextColor = "#a0a0a0";

  const handleTrackPress = async (trackId: string) => {
    await trackPlayerService.setup();
    await trackPlayerService.playTrack(trackId);
    // navigation.navigate("MusicPlayer");
      // Example from HomeScreen
    
      const album = albums.find((album) => album.id === "album1");
      navigation.navigate("AlbumDetail", { album })
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.getProButton}>
            <Text style={styles.getProText}>GET PRO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="ios-radio-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="time-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="mail-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="notifications-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Recommended Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>We think you'll like</Text>

          <View style={styles.trackList}>
            {recommendedTracks.map((track) => (
              <TouchableOpacity
                key={track.id}
                style={styles.trackItem}
                onPress={() => handleTrackPress(track.id)}
              >
                <Image source={track.coverArt} style={styles.trackCover} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Artists section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artists to watch out for</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.buzzingScroll}
          >
            {buzzingCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.buzzingItem,
                  { backgroundColor: category.color },
                ]}
              >
                <Image source={category.coverArt} style={styles.buzzingCover} />
                <View style={styles.buzzingOverlay}>
                  <Text style={styles.buzzingBadge}>BUZZING</Text>
                  <Text style={styles.buzzingGenre}>{category.genre}</Text>
                </View>
                <View style={styles.buzzingTextContainer}>
                  <Text style={styles.buzzingTitle}>{category.title}</Text>
                  <Text style={styles.buzzingNew}>New!</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Fresh Music Friday Section */}
        <View style={styles.featuredSection}>
          <ImageBackground
            source={require("../../assets/images/avicii.jpg")}
            style={styles.featuredBackground}
            imageStyle={styles.featuredImage}
          >
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredTitle}>FRESH MUSIC</Text>
              <Text style={styles.featuredSubtitle}>FRIDAY</Text>
            </View>
          </ImageBackground>

          <View style={styles.featuredInfo}>
            <Text style={styles.featuredInfoTitle}>Fresh Music Friday</Text>
            <Text style={styles.featuredInfoSubtitle}>Enjoy music everyday</Text>

            <View style={styles.featuredControls}>
              <TouchableOpacity style={styles.favoriteButton}>
                <Icon name="heart-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => handleTrackPress("1")} 
              >
                <Icon name="play" size={24} color="#000000" />
              </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  getProButton: {
    backgroundColor: "transparent",
    marginRight: 12,
  },
  getProText: {
    color: "#ff5500",
    fontWeight: "bold",
    fontSize: 12,
  },
  iconButton: {
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  trackList: {
    marginTop: 8,
  },
  trackItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  trackCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  trackInfo: {
    marginLeft: 12,
    flex: 1,
  },
  trackTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  trackArtist: {
    color: "#a0a0a0",
    fontSize: 12,
    marginTop: 2,
  },
  buzzingScroll: {
    flexDirection: "row",
    marginTop: 8,
  },
  buzzingItem: {
    width: 160,
    marginRight: 12,
    borderRadius: 4,
    overflow: "hidden",
  },
  buzzingCover: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginTop: 12,
  },
  buzzingOverlay: {
    padding: 8,
    alignItems: "center",
  },
  buzzingBadge: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  buzzingGenre: {
    color: "#ffffff",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  buzzingTextContainer: {
    backgroundColor: "#121212",
    padding: 8,
  },
  buzzingTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  buzzingNew: {
    color: "#a0a0a0",
    fontSize: 12,
  },
  featuredSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
  },
  featuredBackground: {
    height: 180,
    justifyContent: "flex-end",
  },
  featuredImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  featuredOverlay: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  featuredTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  featuredSubtitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  featuredInfo: {
    padding: 16,
  },
  featuredInfoTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  featuredInfoSubtitle: {
    color: "#a0a0a0",
    fontSize: 14,
    marginTop: 2,
  },
  featuredControls: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "flex-end",
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
});