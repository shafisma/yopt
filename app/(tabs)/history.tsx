import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Book, Plus } from 'lucide-react-native';
import { MinimalBackground } from '../../components/GradientBackground';
import { QuizCard } from '../../components/QuizCard';
import { Quiz } from '../../services/gemini';
import { getQuizHistory } from '../../services/storage';

export default function HistoryScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getQuizHistory();
      setQuizzes(history);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizPress = (quiz: Quiz) => {
    router.push(`/quiz/${quiz.id}`);
  };

  if (isLoading) {
    return (
      <MinimalBackground variant="primary">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading History...</Text>
          </View>
        </SafeAreaView>
      </MinimalBackground>
    );
  }

  return (
    <MinimalBackground variant="primary">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quiz History</Text>
          <Text style={styles.subtitle}>Revisit your previous quizzes</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {quizzes.length > 0 ? (
            <View style={styles.quizzesContainer}>
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onPress={() => handleQuizPress(quiz)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Book size={64} color="#d1d5db" strokeWidth={1} />
              <Text style={styles.emptyTitle}>No Quizzes Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first quiz to start building your learning history
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/')}
                activeOpacity={0.8}
              >
                <View style={styles.createButtonContent}>
                  <Plus size={20} color="white" strokeWidth={2} />
                  <Text style={styles.createButtonText}>Create Your First Quiz</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </MinimalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomWidth: 0,
  },
  quizzesContainer: {
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  createButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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