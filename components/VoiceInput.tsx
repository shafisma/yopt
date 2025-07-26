import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import { SpeechService } from '../services/speech';
import { useTheme } from '../contexts/ThemeContext';

interface VoiceInputProps {
  textToSpeak?: string;
  showSpeaker?: boolean;
}

export function VoiceInput({ 
  textToSpeak,
  showSpeaker = true 
}: VoiceInputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { theme } = useTheme();

  const handleSpeak = async () => {
    if (!textToSpeak) return;
    
    setIsSpeaking(true);
    try {
      await SpeechService.speak(textToSpeak);
    } catch (error) {
      Alert.alert('Error', 'Failed to speak text');
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <View style={styles.container}>
      {showSpeaker && textToSpeak && (
        <TouchableOpacity
          style={[
            styles.button, 
            styles.speakerButton, 
            { 
              backgroundColor: isSpeaking ? theme.colors.primary : theme.colors.surface,
              borderColor: theme.colors.border 
            }
          ]}
          onPress={handleSpeak}
          disabled={isSpeaking}
          activeOpacity={0.7}
        >
          <Volume2 
            size={20} 
            color={isSpeaking ? theme.colors.background : theme.colors.textSecondary} 
            strokeWidth={1.5} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  speakerButton: {
    // Styles handled dynamically
  },
});