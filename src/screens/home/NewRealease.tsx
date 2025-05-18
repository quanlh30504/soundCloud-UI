import React, { useState } from 'react';
import {View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator} from 'react-native';

interface MusicItem {
  encodeId?: string;
  id?: string;
  title: string;
  artistsNames: string;
  thumbnailM?: string;
  thumbnail?: string;
}

interface Props {
  songReleases: MusicItem[];
  albumReleases: MusicItem[];
  isLoading: boolean;
  onSongPress: (id: string) => void;
  onAlbumPress: (id: string) => void;
  navigation: any;
}

const NewReleasesSection: React.FC<Props> = (props) => {
  const { songReleases, albumReleases, isLoading, onSongPress, onAlbumPress } = props;
  const [activeTab, setActiveTab] = useState('song');
  
  const getCurrentItems = () => {
    return activeTab === 'song' ? songReleases : albumReleases;
  };
  
  const handleItemPress = (item: MusicItem) => {
    const id = item.encodeId || item.id;
    if (!id) return;
    
    if (activeTab === 'song') {
      onSongPress(id);
    } else {
      onAlbumPress(id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'song' 
              ? styles.activeTab 
              : { borderWidth: 1, borderColor: '#ffffff' }
          ]} 
          onPress={() => setActiveTab('song')}
        >
          <Text style={styles.tabText}>
            Songs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'album' 
              ? styles.activeTab 
              : { borderWidth: 1, borderColor: '#ffffff' }
          ]} 
          onPress={() => setActiveTab('album')}
        >
          <Text style={styles.tabText}>
            Albums
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {getCurrentItems().slice(0, 10).map((item, index) => (
            <TouchableOpacity
              key={item.encodeId || `item-${index}`}
              style={styles.item}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: item.thumbnailM || item.thumbnail }}
                style={styles.image}
              />
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {item.artistsNames}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 40,
    gap: 10
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100
  },
  activeTab: {
    backgroundColor: '#6200ee',
  },
  tabText: {
    color: '#ffffff', 
    fontSize: 16,
    fontWeight: '500',
  },
  loader: {
    marginTop: 40
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8
  },
  item: {
    width: 150,
    marginRight: 12
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  artist: {
    color: '#a0a0a0',
    fontSize: 12
  }
});

export default NewReleasesSection;