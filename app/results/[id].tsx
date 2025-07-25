import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Trophy, Target, Clock, Brain, Chrome as Home } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MinimalBackground } from '../../components/GradientBackground';
import { Quiz, QuizResult } from '../../services/gemini';
import { getQuizById, getQuizResults } from '../../services/storage';

export default function ResultsScreen() {
  const { id, score, total } = useLocalSearchParams<{ id: string; score: string; total: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const confettiRef = useRef<any>();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (result && !isLoading) {
      const percentage = (result.score / result.totalQuestions) * 100;
      
      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();

      // Trigger confetti for good scores
      if (percentage >= 70) {
        setTimeout(() => {
          confettiRef.current?.start();
        }, 500);
      }
    }
  }, [result, isLoading]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      const quizData = await getQuizById(id);
      const results = await getQuizResults();
      const quizResult = results.find(r => r.quizId === id);
      
      setQuiz(quizData);
      setResult(quizResult || null);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !quiz || !result) {
    return (
      <MinimalBackground variant="secondary">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Results...</Text>
          </View>
        </SafeAreaView>
      </MinimalBackground>
    );
  }

  const percentage = (result.score / result.totalQuestions) * 100;
  const timeSpentMinutes = Math.floor(result.timeSpent / 60000);
  const timeSpentSeconds = Math.floor((result.timeSpent % 60000) / 1000);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#059669';
    if (percentage >= 60) return '#d97706';
    return '#dc2626';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return 'Outstanding Performance!';
    if (percentage >= 80) return 'Excellent Work!';
    if (percentage >= 70) return 'Great Job!';
    if (percentage >= 60) return 'Good Effort!';
    return 'Keep Learning!';
  };

  return (
    <MinimalBackground variant="secondary">
      <SafeAreaView style={styles.container}>
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut
          explosionSpeed={350}
          fallSpeed={3000}
          colors={['#111827', '#374151', '#6b7280', '#059669', '#d97706']}
        />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#111827" strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Results</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.scoreContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.scoreCard}>
              <Trophy size={48} color={getScoreColor(percentage)} strokeWidth={1.5} />
              <Text style={styles.performanceMessage}>
                {getPerformanceMessage(percentage)}
              </Text>
              <Text style={styles.scoreText}>
                {result.score}/{result.totalQuestions}
              </Text>
              <Text style={styles.percentageText}>
                {percentage.toFixed(0)}% Correct
              </Text>
            </View>
          </Animated.View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Target size={24} color="#059669" strokeWidth={1.5} />
              <Text style={styles.statValue}>{result.score}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            
            <View style={styles.statCard}>
              <Clock size={24} color="#d97706" strokeWidth={1.5} />
              <Text style={styles.statValue}>
                {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            
            <View style={styles.statCard}>
              <Brain size={24} color="#6366f1" strokeWidth={1.5} />
              <Text style={styles.statValue}>{quiz.difficulty}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>

          <View style={styles.analysisContainer}>
            <Text style={styles.analysisTitle}>Performance Analysis</Text>
            <View style={styles.analysisCard}>
              <Text style={styles.analysisText}>{result.analysis}</Text>
            </View>
          </View>

          <View style={styles.questionReview}>
            <Text style={styles.reviewTitle}>Question Review</Text>
            {quiz.questions.map((question, index) => {
              const isCorrect = result.answers[index] === question.correctAnswer;
              return (
                <View key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewQuestionNumber}>Q{index + 1}</Text>
                    <View style={[
                      styles.reviewBadge,
                      { 
                        backgroundColor: isCorrect ? '#059669' : '#dc2626',
                      }
                    ]}>
                      <Text style={styles.reviewBadgeText}>
                        {isCorrect ? 'Correct' : 'Wrong'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reviewQuestion}>{question.question}</Text>
                  
                  {!isCorrect && (
                    <View style={styles.reviewAnswers}>
                      <Text style={styles.reviewAnswerLabel}>Your Answer:</Text>
                      <Text style={styles.reviewWrongAnswer}>
                        {question.options[result.answers[index]]}
                      </Text>
                      <Text style={styles.reviewAnswerLabel}>Correct Answer:</Text>
                      <Text style={styles.reviewCorrectAnswer}>
                        {question.options[question.correctAnswer]}
                      </Text>
                      <Text style={styles.reviewExplanation}>{question.explanation}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <View style={styles.homeButtonContent}>
              <Home size={20} color="white" strokeWidth={1.5} />
              <Text style={styles.homeButtonText}>Back to Home</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </MinimalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  performanceMessage: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreText: {
    color: '#111827',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  percentageText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  analysisContainer: {
    marginBottom: 32,
  },
  analysisTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  analysisCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  questionReview: {
    marginBottom: 100,
  },
  reviewTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewQuestionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  reviewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  reviewBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 22,
  },
  reviewAnswers: {
    gap: 12,
  },
  reviewAnswerLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  reviewWrongAnswer: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  reviewCorrectAnswer: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  reviewExplanation: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  homeButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    overflow: 'hidden',
  },
  homeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  homeButtonText: {
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