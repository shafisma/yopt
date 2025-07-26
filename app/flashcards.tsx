import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MinimalBackground } from '../components/GradientBackground';
import { FlashcardView } from '../components/FlashcardView';
import { generateFlashcards, FlashcardData } from '../services/gemini';

export default function FlashcardsScreen() {
  const { topic, difficulty } = useLocalSearchParams<{ topic: string; difficulty: 'easy' | 'medium' | 'hard' }>();
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    if (!topic || !difficulty) {
      Alert.alert('Error', 'Missing topic or difficulty');
      router.back();
      return;
    }

    try {
      const cards = await generateFlashcards(topic, difficulty, 10);
      setFlashcards(cards);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate flashcards');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = () => {
    Alert.alert(
      'Flashcards Complete!',
      'Great job studying! You\'ve reviewed all the flashcards.',
      [
        { text: 'Study Again', onPress: () => setCurrentIndex(0) },
        { text: 'Back to Home', onPress: () => router.push('/') },
      ]
    );
  };

  if (isLoading) {
    return (
      <MinimalBackground variant="secondary">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Generating Flashcards...</Text>
          </View>
        </SafeAreaView>
      </MinimalBackground>
    );
  }

  return (
    <MinimalBackground variant="secondary">
      <SafeAreaView style={styles.container}>
        <FlashcardView
          flashcards={flashcards}
          currentIndex={currentIndex}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onComplete={handleComplete}
        />
      </SafeAreaView>
    </MinimalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 18,
    fontWeight: '500',
  },
});