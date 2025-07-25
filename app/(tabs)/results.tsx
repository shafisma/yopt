import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Trophy, TrendingUp, Calendar, Clock, Plus } from 'lucide-react-native';
import { MinimalBackground } from '../../components/GradientBackground';
import { QuizResult } from '../../services/gemini';
import { getQuizResults } from '../../services/storage';

export default function ResultsScreen() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const quizResults = await getQuizResults();
      setResults(quizResults);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallStats = () => {
    if (results.length === 0) return { averageScore: 0, totalQuizzes: 0, bestScore: 0 };
    
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0);
    const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
    const bestScore = Math.max(...results.map(r => (r.score / r.totalQuestions) * 100));
    
    return {
      averageScore: Math.round(averageScore),
      totalQuizzes: results.length,
      bestScore: Math.round(bestScore),
    };
  };

  const stats = getOverallStats();

  if (isLoading) {
    return (
      <MinimalBackground variant="primary">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Results...</Text>
          </View>
        </SafeAreaView>
      </MinimalBackground>
    );
  }

  return (
    <MinimalBackground variant="primary">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Results</Text>
          <Text style={styles.subtitle}>Track your learning progress</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {results.length > 0 ? (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Trophy size={24} color="#d97706" strokeWidth={1.5} />
                  <Text style={styles.statValue}>{stats.bestScore}%</Text>
                  <Text style={styles.statLabel}>Best Score</Text>
                </View>
                
                <View style={styles.statCard}>
                  <TrendingUp size={24} color="#059669" strokeWidth={1.5} />
                  <Text style={styles.statValue}>{stats.averageScore}%</Text>
                  <Text style={styles.statLabel}>Average</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Calendar size={24} color="#6366f1" strokeWidth={1.5} />
                  <Text style={styles.statValue}>{stats.totalQuizzes}</Text>
                  <Text style={styles.statLabel}>Quizzes</Text>
                </View>
              </View>

              <View style={styles.resultsContainer}>
                <Text style={styles.sectionTitle}>Recent Results</Text>
                {results.map((result, index) => (
                  <ResultCard key={index} result={result} />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Trophy size={64} color="#d1d5db" strokeWidth={1} />
              <Text style={styles.emptyTitle}>No Results Yet</Text>
              <Text style={styles.emptySubtitle}>
                Take your first quiz to see your progress here
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => router.push('/')}
                activeOpacity={0.8}
              >
                <View style={styles.startButtonContent}>
                  <Plus size={20} color="white" strokeWidth={2} />
                  <Text style={styles.startButtonText}>Start Your First Quiz</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </MinimalBackground>
  );
}

function ResultCard({ result }: { result: QuizResult }) {
  const percentage = (result.score / result.totalQuestions) * 100;
  const timeSpentMinutes = Math.floor(result.timeSpent / 60000);
  const timeSpentSeconds = Math.floor((result.timeSpent % 60000) / 1000);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#059669';
    if (percentage >= 60) return '#d97706';
    return '#dc2626';
  };

  const handlePress = () => {
    router.push(`/results/${result.quizId}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.resultCard} activeOpacity={0.7}>
      <View style={styles.resultCardContent}>
        <View style={styles.resultHeader}>
          <View style={styles.resultScore}>
            <Text style={[styles.scoreText, { color: getScoreColor(percentage) }]}>
              {result.score}/{result.totalQuestions}
            </Text>
            <Text style={styles.percentageText}>
              {percentage.toFixed(0)}%
            </Text>
          </View>
          
          <View style={styles.resultTime}>
            <Clock size={16} color="#9ca3af" strokeWidth={1.5} />
            <Text style={styles.timeText}>
              {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
            </Text>
          </View>
        </View>
        
        <Text style={styles.resultDate}>
          {new Date(result.completedAt).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
    </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  resultsContainer: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  resultCard: {
    marginBottom: 16,
  },
  resultCardContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  resultTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  resultDate: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
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
  startButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
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