import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { FlashcardData } from '../services/gemini';
import { VoiceInput } from './VoiceInput';

interface FlashcardViewProps {
  flashcards: FlashcardData[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
}

export function FlashcardView({ 
  flashcards, 
  currentIndex, 
  onNext, 
  onPrevious, 
  onComplete 
}: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));

  const currentCard = flashcards[currentIndex];
  const isLastCard = currentIndex === flashcards.length - 1;
  const isFirstCard = currentIndex === 0;

  const flipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    flipAnimation.setValue(0);
    if (isLastCard) {
      onComplete();
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    flipAnimation.setValue(0);
    onPrevious();
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.counter}>
          {currentIndex + 1} of {flashcards.length}
        </Text>
        <VoiceInput 
          textToSpeak={isFlipped ? currentCard.back : currentCard.front}
          showSpeaker={true}
        />
      </View>

      <TouchableOpacity style={styles.cardContainer} onPress={flipCard} activeOpacity={0.9}>
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            { transform: [{ rotateY: frontInterpolate }] },
            isFlipped && styles.hiddenCard,
          ]}
        >
          <Text style={styles.cardText}>{currentCard.front}</Text>
          <View style={styles.flipHint}>
            <RotateCcw size={16} color="#9ca3af" strokeWidth={1.5} />
            <Text style={styles.flipHintText}>Tap to flip</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }] },
            !isFlipped && styles.hiddenCard,
          ]}
        >
          <Text style={styles.cardText}>{currentCard.back}</Text>
          <View style={styles.flipHint}>
            <RotateCcw size={16} color="#9ca3af" strokeWidth={1.5} />
            <Text style={styles.flipHintText}>Tap to flip</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, isFirstCard && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={isFirstCard}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={isFirstCard ? '#d1d5db' : '#374151'} strokeWidth={1.5} />
          <Text style={[styles.navButtonText, isFirstCard && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>
            {isLastCard ? 'Complete' : 'Next'}
          </Text>
          <ChevronRight size={20} color="#374151" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  counter: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  card: {
    width: '100%',
    minHeight: 300,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    position: 'absolute',
  },
  cardBack: {
    backgroundColor: '#f8fafc',
  },
  hiddenCard: {
    opacity: 0,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 24,
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'absolute',
    bottom: 20,
  },
  flipHintText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  navButtonTextDisabled: {
    color: '#d1d5db',
  },
});