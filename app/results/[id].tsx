import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Trophy, Target, Clock, Brain, Chrome as Home } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MinimalBackground } from '../../components/GradientBackground';
import { useTheme } from '../../contexts/ThemeContext';
import { showBadgeNotification } from '../../services/notifications';
import { Quiz, QuizResult } from '../../services/gemini';
import { getQuizById, getQuizResults } from '../../services/storage';
import { updateUserStats, getUserStats } from '../../services/analytics';

export default function ResultsScreen() {
  const { id, score, total } = useLocalSearchParams<{ id: string; score: string; total: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const confettiRef = useRef<any>();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (quiz && result) {
      updateStats();
    }
  }, [quiz, result]);

  const updateStats = async () => {
    if (!quiz || !result) return;
    
    try {
      const oldStats = await getUserStats();
      const updatedStats = await updateUserStats(quiz, result);
      
      // Check for new badges
      const badges = updatedStats.badges.filter(
        badge => !oldStats.badges.some(oldBadge => oldBadge.id === badge.id)
      );
      
      if (badges.length > 0) {
        setNewBadges(badges);
        // Show notifications for new badges
        badges.forEach(badge => {
          showBadgeNotification(badge.name, badge.icon);
        });
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading Results...</Text>
          </View>
        </SafeAreaView>
      </View>
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
        
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={theme.colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Quiz Results</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={[styles.content, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
          {/* New Badges Notification */}
          {newBadges.length > 0 && (
            <View style={[styles.newBadgesContainer, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.newBadgesTitle}>🎉 New Badges Unlocked!</Text>
              <View style={styles.newBadgesList}>
                {newBadges.map((badge, index) => (
                  <Text key={index} style={styles.newBadgeText}>
                    {badge.icon} {badge.name}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <Animated.View
            style={[
              styles.scoreContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={[styles.scoreCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Trophy size={48} color={getScoreColor(percentage)} strokeWidth={1.5} />
              <Text style={[styles.performanceMessage, { color: theme.colors.text }]}>
                {getPerformanceMessage(percentage)}
              </Text>
              <Text style={[styles.scoreText, { color: theme.colors.text }]}>
                {result.score}/{result.totalQuestions}
              </Text>
              <Text style={[styles.percentageText, { color: theme.colors.textSecondary }]}>
                {percentage.toFixed(0)}% Correct
              </Text>
            </View>
          </Animated.View>

          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Target size={24} color="#059669" strokeWidth={1.5} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{result.score}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Correct</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Clock size={24} color="#d97706" strokeWidth={1.5} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Time</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Brain size={24} color="#6366f1" strokeWidth={1.5} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{quiz.difficulty}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Level</Text>
            </View>
          </View>

          <View style={styles.analysisContainer}>
            <Text style={[styles.analysisTitle, { color: theme.colors.text }]}>Performance Analysis</Text>
            <View style={[styles.analysisCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.analysisText, { color: theme.colors.text }]}>{result.analysis}</Text>
            </View>
          </View>

          <View style={styles.questionReview}>
            <Text style={[styles.reviewTitle, { color: theme.colors.text }]}>Question Review</Text>
            {quiz.questions.map((question, index) => {
              const isCorrect = result.answers[index] === question.correctAnswer;
              return (
                <View key={index} style={[styles.reviewCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <View style={styles.reviewHeader}>
                    <Text style={[styles.reviewQuestionNumber, { color: theme.colors.textSecondary }]}>Q{index + 1}</Text>
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
                  <Text style={[styles.reviewQuestion, { color: theme.colors.text }]}>{question.question}</Text>
                  
                  {!isCorrect && (
                    <View style={styles.reviewAnswers}>
                      <Text style={[styles.reviewAnswerLabel, { color: theme.colors.textSecondary }]}>Your Answer:</Text>
                      <Text style={[styles.reviewWrongAnswer, { color: theme.colors.error }]}>
                        {question.options[result.answers[index]]}
                      </Text>
                      <Text style={[styles.reviewAnswerLabel, { color: theme.colors.textSecondary }]}>Correct Answer:</Text>
                      <Text style={[styles.reviewCorrectAnswer, { color: theme.colors.success }]}>
                        {question.options[question.correctAnswer]}
                      </Text>
                      <Text style={[styles.reviewExplanation, { color: theme.colors.textSecondary }]}>{question.explanation}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <View style={styles.homeButtonContent}>
              <Home size={20} color={theme.colors.background} strokeWidth={1.5} />
              <Text style={[styles.homeButtonText, { color: theme.colors.background }]}>Back to Home</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
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
  newBadgesContainer: {
    margin: 24,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  newBadgesTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  newBadgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  performanceMessage: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  percentageText: {
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
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  analysisContainer: {
    marginBottom: 32,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  analysisCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 24,
  },
  questionReview: {
    marginBottom: 100,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  reviewCard: {
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
    marginBottom: 16,
    lineHeight: 22,
  },
  reviewAnswers: {
    gap: 12,
  },
  reviewAnswerLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  reviewWrongAnswer: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewCorrectAnswer: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewExplanation: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1,
  },
  homeButton: {
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
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
});