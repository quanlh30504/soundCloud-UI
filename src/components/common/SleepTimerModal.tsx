import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import sleepTimerService, { SleepTimerOptions } from '../../services/player/SleepTimerService';

interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
  themeStyles: {
    background: string;
    primary: string;
    text: string;
    secondary: string;
  };
}

const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  visible,
  onClose,
  themeStyles,
}) => {  const [selectedDuration, setSelectedDuration] = useState<number>(0.5); // Default to 30 seconds for testing
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const durationOptions = [
    { label: '30 seconds', value: 0.5 }, // 30 seconds for testing
    { label: '5 minutes', value: 5 },
    { label: '10 minutes', value: 10 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '45 minutes', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
  ];

  useEffect(() => {
    if (visible) {
      checkTimerStatus();
    }
  }, [visible]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && visible) {
      interval = setInterval(() => {
        const remaining = sleepTimerService.getTimeRemaining();
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setIsTimerActive(false);
          setTimeRemaining(0);
        }
      }, 200); // Update every 200ms for better precision during testing
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive, visible]);

  const checkTimerStatus = () => {
    const active = sleepTimerService.isTimerActive();
    setIsTimerActive(active);
    
    if (active) {
      const remaining = sleepTimerService.getTimeRemaining();
      setTimeRemaining(remaining);
    }
  };
  const handleSetTimer = async () => {
    try {
      const options: SleepTimerOptions = {
        duration: selectedDuration,
        stopAtEndOfTrack: false, // Always false since we removed this option
      };

      await sleepTimerService.setSleepTimer(options);
      setIsTimerActive(true);
      setTimeRemaining(selectedDuration);
        const formatTimerDuration = (minutes: number): string => {
        if (minutes < 1) {
          const seconds = Math.round(minutes * 60);
          return `${seconds} seconds`;
        } else if (minutes < 60) {
          return `${minutes} minutes`;
        } else {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          return remainingMinutes > 0 
            ? `${hours} hours and ${remainingMinutes} minutes` 
            : `${hours} hours`;
        }
      };

      Alert.alert(
        'Sleep Timer Set',
        `Music will stop in ${formatTimerDuration(selectedDuration)}`
      );
      
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to set sleep timer. Please try again.');
    }
  };

  const handleCancelTimer = async () => {
    try {
      await sleepTimerService.clearSleepTimer();
      setIsTimerActive(false);
      setTimeRemaining(0);
      
      Alert.alert('Sleep Timer Canceled', 'The sleep timer has been turned off.');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel sleep timer. Please try again.');
    }
  };
  const formatTimeRemaining = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${hours}h`;
    } else if (minutes < 1) {
      // For testing purposes, show seconds when less than 1 minute
      const seconds = Math.round(minutes * 60);
      return `${seconds}s`;
    }
    return `${Math.round(minutes)}m`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: themeStyles.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeStyles.text }]}>
              Sleep Timer
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={themeStyles.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {isTimerActive ? (
              // Active Timer Display
              <View style={styles.activeTimerContainer}>
                <View style={styles.timerDisplay}>
                  <Icon 
                    name="time" 
                    size={48} 
                    color={themeStyles.primary} 
                    style={styles.timerIcon}
                  />
                  <Text style={[styles.timerText, { color: themeStyles.text }]}>
                    {formatTimeRemaining(timeRemaining)} remaining
                  </Text>
                  <Text style={[styles.timerSubtext, { color: themeStyles.secondary }]}>
                    Music will stop automatically
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: themeStyles.primary }]}
                  onPress={handleCancelTimer}
                >
                  <Text style={[styles.cancelButtonText, { color: themeStyles.primary }]}>
                    Cancel Timer
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Timer Setup
              <>
                <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
                  Select Duration
                </Text>

                <View style={styles.durationGrid}>
                  {durationOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.durationOption,
                        { 
                          borderColor: selectedDuration === option.value 
                            ? themeStyles.primary 
                            : themeStyles.secondary,
                          backgroundColor: selectedDuration === option.value 
                            ? `${themeStyles.primary}20` 
                            : 'transparent'
                        }
                      ]}
                      onPress={() => setSelectedDuration(option.value)}
                    >
                      <Text style={[
                        styles.durationText,
                        { 
                          color: selectedDuration === option.value 
                            ? themeStyles.primary 
                            : themeStyles.text 
                        }
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}                
                </View>

                <TouchableOpacity
                  style={[styles.setButton, { backgroundColor: themeStyles.primary }]}
                  onPress={handleSetTimer}
                >                  
                <Text style={[styles.setButtonText, { color: themeStyles.background }]}>
                    Set Timer
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  activeTimerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerIcon: {
    marginBottom: 16,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timerSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  cancelButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  durationOption: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },  durationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  setButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  setButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SleepTimerModal;
