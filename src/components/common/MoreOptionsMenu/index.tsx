import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { height } = Dimensions.get('window');

interface MenuOption {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;  // Add this property to support disabled options
}

interface MoreOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  options: MenuOption[];
}

const MoreOptionsMenu: React.FC<MoreOptionsMenuProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  thumbnailUrl,
  options
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.menuContainer,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              {/* Drag handle */}
              <View style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>
              
              {/* Header with thumbnail and info */}
              <View style={styles.header}>
                <Image 
                  source={{ uri: thumbnailUrl }}
                  style={styles.thumbnail}
                />
                <View style={styles.headerInfo}>
                  <Text style={styles.title} numberOfLines={1}>{title}</Text>
                  <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              {/* Options */}
              <ScrollView style={styles.optionsContainer}>
                {options.map((option, index) => (
                  <TouchableOpacity 
                    key={`option-${index}`}
                    style={[
                      styles.optionItem,
                      option.disabled && styles.disabledOptionItem
                    ]}
                    onPress={() => {
                      if (!option.disabled) {
                        option.onPress();
                      }
                    }}
                    disabled={option.disabled}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={22} 
                      color={option.disabled ? "#777777" : "#DDDDDD"} 
                      style={styles.optionIcon}
                    />
                    <Text style={[
                      styles.optionLabel,
                      option.disabled && styles.disabledOptionLabel
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#222222',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 30, // Extra padding at bottom for iOS
    maxHeight: height * 0.7, // Limit height to 70% of screen
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: '#666666',
    borderRadius: 2.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 2,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginBottom: 8,
  },
  optionsContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  disabledOptionItem: {
    opacity: 0.6,
  },
  disabledOptionLabel: {
    color: '#777777',
  },
});

export default MoreOptionsMenu;
