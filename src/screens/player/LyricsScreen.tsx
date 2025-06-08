import React, { useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Modal,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LyricsComponent from './LyricsComponent';

interface LyricsScreenProps {
  visible: boolean;
  onClose: () => void;
  trackId: string | null;
  onLyricPress: (time: number) => Promise<void>;
  themeStyles: {
    background: string;
    primary: string;
    text: string;
    secondary: string;
  };
}

const LyricsScreen: React.FC<LyricsScreenProps> = ({ 
  visible, 
  onClose, 
  trackId, 
  onLyricPress, 
  themeStyles 
}) => {

  if (!visible || !trackId) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >      
    <SafeAreaView style={[styles.container, { backgroundColor: themeStyles.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: themeStyles.secondary }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View style={[styles.closeButtonCircle, { borderColor: themeStyles.secondary }]}>
              <Ionicons name="close" size={20} color={themeStyles.text} />
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: themeStyles.text }]}>Lyrics</Text>
          
          <View style={{ width: 32 }} />
        </View>
        
        {/* Lyrics Content */}
        <View style={styles.lyricsContainer}>
          <LyricsComponent 
            trackId={trackId}
            onLyricPress={onLyricPress}
            themeStyles={themeStyles}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  lyricsContainer: {
    flex: 1,
    paddingTop: 10,
  },
});

export default LyricsScreen;
