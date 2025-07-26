import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';
import { SpeechService } from '../services/speech';

interface VoiceInputProps {
  onSpeechResult?: (text: string) => void;
  isListening?: boolean;
  onToggleListening?: () => void;
  textToSpeak?: string;
  showSpeaker?: boolean;
}

export function VoiceInput({ 
  onSpeechResult, 
  isListening = false, 
  onToggleListening,
  textToSpeak,
  showSpeaker = true 
}: VoiceInputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const handleMicPress = () => {
    if (onToggleListening) {
      onToggleListening();
    } else {
      Alert.alert('Voice Input', 'Voice input feature coming soon!');
    }
  };

  return (
    <View style={styles.container}>
      {showSpeaker && textToSpeak && (
        <TouchableOpacity
          style={[styles.button, styles.speakerButton, isSpeaking && styles.activeButton]}
          onPress={handleSpeak}
          disabled={isSpeaking}
          activeOpacity={0.7}
        >
          <Volume2 
            size={20} 
            color={isSpeaking ? '#ffffff' : '#6b7280'} 
            strokeWidth={1.5} 
          />
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={[styles.button, styles.micButton, isListening && styles.activeButton]}
        onPress={handleMicPress}
        activeOpacity={0.7}
      >
        {isListening ? (
          <MicOff size={20} color="#ffffff" strokeWidth={1.5} />
        ) : (
          <Mic size={20} color="#6b7280" strokeWidth={1.5} />
        )}
      </TouchableOpacity>
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
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  speakerButton: {
    borderColor: '#d1d5db',
  },
  micButton: {
    borderColor: '#d1d5db',
  },
  activeButton: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
});