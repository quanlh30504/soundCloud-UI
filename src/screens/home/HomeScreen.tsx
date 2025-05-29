import React, { useEffect, useState } from "react";
import {View,Text,StyleSheet,ScrollView,Image,TouchableOpacity,ImageBackground, ActivityIndicator} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import trackPlayerService from "../../services/player/TrackPlayerService";
import { homeApi, trackApi } from "../../services/api";
import NewReleasesSection from "./NewRealease";
import { useTheme } from "../../contexts/ThemeContext";
import { darkTheme, lightTheme } from "../../config/theme";
import NavigationService from "services/navigation/NavigationService";

export default function HomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkTheme : lightTheme;

  const backgroundColor = "#121212";

  const [newReleasesSongs, setNewReleasesSongs] = useState([]);
  const [newReleasesAlbums, setNewReleasesAlbums] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hubData, setHubData] = useState<[]>();
  const [top100Items, setTop100Items] = useState([]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setIsLoading(true);
    try {
      // const recommendedData = await homeApi.getRecommendSongs();
      // if (recommendedData && recommendedData) {
      //   setRecommendedSongs(recommendedData);
      // }

      const hubData = await homeApi.getHubDetailChill();
      // console.log("Hub data received:", hubData);
      if (hubData) {
        setHubData(hubData);
      }
    
      // fetch new releases - songs
      const newReleaseSongsData = await homeApi.getNewRelease('song');
      // console.log("New release songs data received:", newReleaseSongsData);
      if (newReleaseSongsData) {
        setNewReleasesSongs(newReleaseSongsData);
      }

      const newReleaseAlbumsData = await homeApi.getNewRelease('album');
      if (newReleaseAlbumsData) {
        setNewReleasesAlbums(newReleaseAlbumsData);
      }

      const top100Data = await homeApi.getTop100();
      // console.log("Top 100 data received:", top100Data);
      if (top100Data) {
        setTop100Items(top100Data);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching home data:", err);
      setError(err);
      setIsLoading(false);
    }
  }

  const handleTrackPress = async (trackId: string) => {
    await trackPlayerService.setup();
    // const track = await getTrackInfo(trackId);
    const track = (await trackApi.getTrackInfo(trackId)).data;
    await trackPlayerService.playTrack(track);
  };

  const handleAlbumPress = (albumId) => {
    NavigationService.navigateToPlaylist(albumId);
  };

  const getFirstFivePlaylists = () => {
    if (!hubData || !hubData.sections || !hubData.sections[0] || 
        !hubData.sections[0].items || !hubData.sections[0].items) {
      return [];
    }
        const playlists = hubData.sections[0].items;
    
    // console.log("Playlists data:", playlists);
    return Array.isArray(playlists) ? playlists.slice(0, 5) : [];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="radio-outline" size={22} color="#ffffff" />
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
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Có thể bạn muốn nghe</Text>

          <View style={styles.trackList}>
            {recommendedSongs.slice(0, 5).map((song) => (
              <TouchableOpacity
                key={song.encodeId}
                style={styles.trackItem}
                onPress={() => handleTrackPress(song.encodeId)}
              >
                <Image source={song.thumbnailM || song.thumbnail} style={styles.trackCover} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {song.title}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {song.artistsNames}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* New Releases Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New releases</Text>
          <NewReleasesSection
            songReleases={newReleasesSongs}
            albumReleases={newReleasesAlbums}
            isLoading={isLoading}
            onSongPress={handleTrackPress}
            onAlbumPress={handleAlbumPress}
            navigation={navigation}
          />
        </View>
        
        {/* Chill Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Chill</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Chill', { hubId: hubData?.encodeId })}
              style={styles.seeMoreButton}
            >
              <Icon name="chevron-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator color="#ff5500" size="small" />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {getFirstFivePlaylists().map((item, index) => (
                <TouchableOpacity
                  key={item.encodeId || `item-${index}`}
                  style={styles.chillItem}
                  onPress={() => NavigationService.navigateToPlaylist(item.encodeId)}
                >
                  <Image 
                    source={{ uri: item.thumbnail }} 
                    style={styles.chillCover} 
                  />
                  <View style={styles.chillInfo}>
                    <Text style={styles.chillTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.chillDescription} numberOfLines={1}>
                      {item.sortDescription || "Playlist"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('ChillHub', { hubId: hubData?.encodeId })}
              >
                <View style={styles.seeAllCircle}>
                  <Icon name="chevron-forward" size={24} color="#ffffff" />
                </View>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Top 100 Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 100</Text>
          
          {isLoading ? (
            <ActivityIndicator color="#ff5500" size="small" />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {top100Items.map((collection) => (
                collection.items && collection.items.map((item) => (
                  <TouchableOpacity
                    key={item.encodeId || item.id}
                    style={styles.top100Item}
                    onPress={() => NavigationService.navigateToPlaylist(item.encodeId || item.id)}
                  >
                    <Image 
                      source={{ uri: item.thumbnailM || item.thumbnail }} 
                      style={styles.top100Cover} 
                    />
                    <View style={styles.top100Info}>
                      <Text style={styles.top100Title} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.top100Description} numberOfLines={1}>
                        {item.sortDescription || `${item.song?.items?.length || 0} songs`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ))}
            </ScrollView>
          )}
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
    paddingTop: 0,
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

  horizontalScroll: {
    marginTop: 12,
  },
  top100Item: {
    width: 150,
    marginRight: 16,
  },
  top100Cover: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  top100Info: {
    marginTop: 8,
  },
  top100Title: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  top100Description: {
    color: "#a0a0a0",
    fontSize: 12,
    marginTop: 2,
  },

  // Chill section
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeMoreButton: {
    padding: 8,
  },
  chillItem: {
    width: 150,
    marginRight: 16,
  },
  chillCover: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  chillInfo: {
    marginTop: 8,
  },
  chillTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  chillDescription: {
    color: '#a0a0a0',
    fontSize: 12,
    marginTop: 2,
  },
  seeAllButton: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  seeAllCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAllText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});