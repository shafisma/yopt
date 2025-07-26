import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Trophy, TrendingUp, Calendar, Clock, Plus, Award, Zap } from 'lucide-react-native';
import { MinimalBackground } from '../../components/GradientBackground';
import { ProgressChart } from '../../components/ProgressChart';
import { BadgeDisplay, BadgeModal } from '../../components/BadgeDisplay';
import { useTheme } from '../../contexts/ThemeContext';
import { QuizResult } from '../../services/gemini';
import { getQuizResults } from '../../services/storage';
import { getUserStats, Badge } from '../../services/analytics';

export default function ResultsScreen() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const quizResults = await getQuizResults();
      const userStats = await getUserStats();
      setResults(quizResults);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallStats = () => {
    if (!stats) return { averageScore: 0, totalQuizzes: 0, bestScore: 0, streak: 0, xp: 0, level: 1 };
    
    const averageScore = stats.totalQuestions > 0 ? (stats.correctAnswers / stats.totalQuestions) * 100 : 0;
    const bestScore = results.length > 0 ? Math.max(...results.map(r => (r.score / r.totalQuestions) * 100)) : 0;
    
    return {
      averageScore: Math.round(averageScore),
      totalQuizzes: stats.totalQuizzes,
      bestScore: Math.round(bestScore),
      streak: stats.streak,
      xp: stats.xp,
      level: stats.level,
    };
  };

  const overallStats = getOverallStats();

  const getProgressData = () => {
    if (results.length === 0) return null;
    
    const last7Days = results.slice(0, 7).reverse();
    return {
      labels: last7Days.map((_, index) => `Day ${index + 1}`),
      datasets: [{
        data: last7Days.map(r => (r.score / r.totalQuestions) * 100),
        strokeWidth: 2,
      }],
    };
  };

  const getDifficultyData = () => {
    if (!stats || !stats.difficultyStats) return null;
    
    return [
      {
        name: 'Easy',
        population: stats.difficultyStats.easy.correctAnswers,
        color: '#10b981',
        legendFontColor: theme.colors.text,
      },
      {
        name: 'Medium',
        population: stats.difficultyStats.medium.correctAnswers,
        color: '#f59e0b',
        legendFontColor: theme.colors.text,
      },
      {
        name: 'Hard',
        population: stats.difficultyStats.hard.correctAnswers,
        color: '#ef4444',
        legendFontColor: theme.colors.text,
      },
    ];
  };

  if (isLoading) {
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Your Results</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Track your learning progress</Text>
        </View>

        <ScrollView style={[styles.content, { backgroundColor: theme.colors.surface }]} showsVerticalScrollIndicator={false}>
          {results.length > 0 ? (
            <>
              {/* XP and Level */}
              <View style={[styles.xpContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <View style={styles.xpHeader}>
                  <View style={styles.levelBadge}>
                    <Zap size={16} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.levelText}>Level {overallStats.level}</Text>
                  </View>
                  <Text style={[styles.xpText, { color: theme.colors.textSecondary }]}>
                    {overallStats.xp} XP
                  </Text>
                </View>
                <View style={[styles.xpBar, { backgroundColor: theme.colors.border }]}>
                  <View 
                    style={[
                      styles.xpFill, 
                      { 
                        width: `${((overallStats.xp % 1000) / 1000) * 100}%`,
                        backgroundColor: theme.colors.accent 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.xpProgress, { color: theme.colors.textSecondary }]}>
                  {overallStats.xp % 1000}/1000 XP to next level
                </Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Trophy size={20} color="#d97706" strokeWidth={1.5} />
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{overallStats.bestScore}%</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Best Score</Text>
                </View>
                
                <View style={[styles.statCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <TrendingUp size={20} color="#059669" strokeWidth={1.5} />
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{overallStats.averageScore}%</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Average</Text>
                </View>
                
                <View style={[styles.statCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Calendar size={20} color="#6366f1" strokeWidth={1.5} />
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{overallStats.totalQuizzes}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Quizzes</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{overallStats.streak}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Day Streak</Text>
                </View>
              </View>

              {/* Badges */}
              {stats && stats.badges && stats.badges.length > 0 && (
                <View style={styles.badgesContainer}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
                    {stats.badges.map((badge: Badge) => (
                      <BadgeDisplay
                        key={badge.id}
                        badge={badge}
                        size="medium"
                        onPress={() => setSelectedBadge(badge)}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Charts */}
              {getProgressData() && (
                <ProgressChart
                  type="line"
                  data={getProgressData()}
                  title="Progress Over Time"
                />
              )}

              {getDifficultyData() && (
                <ProgressChart
                  type="pie"
                  data={getDifficultyData()}
                  title="Performance by Difficulty"
                />
              )}

              <View style={styles.resultsContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Results</Text>
                {results.map((result, index) => (
                  <ResultCard key={index} result={result} theme={theme} />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Trophy size={64} color={theme.colors.border} strokeWidth={1} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Results Yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Take your first quiz to see your progress here
              </Text>
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/')}
                activeOpacity={0.8}
              >
                <View style={styles.startButtonContent}>
                  <Plus size={20} color={theme.colors.background} strokeWidth={2} />
                  <Text style={[styles.startButtonText, { color: theme.colors.background }]}>Start Your First Quiz</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <BadgeModal
          badge={selectedBadge}
          visible={!!selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      </SafeAreaView>
    </View>
  );
}

function ResultCard({ result, theme }: { result: QuizResult; theme: any }) {
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
    <TouchableOpacity onPress={handlePress} style={[styles.resultCard]} activeOpacity={0.7}>
      <View style={[styles.resultCardContent, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
        <View style={styles.resultHeader}>
          <View style={styles.resultScore}>
            <Text style={[styles.scoreText, { color: getScoreColor(percentage) }]}>
              {result.score}/{result.totalQuestions}
            </Text>
            <Text style={[styles.percentageText, { color: theme.colors.textSecondary }]}>
              {percentage.toFixed(0)}%
            </Text>
          </View>
          
          <View style={styles.resultTime}>
            <Clock size={16} color={theme.colors.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.resultDate, { color: theme.colors.textSecondary }]}>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomWidth: 0,
  },
  xpContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
  },
  xpBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpProgress: {
    fontSize: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  streakEmoji: {
    fontSize: 20,
  },
  badgesContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  badgesScroll: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  resultsContainer: {
    paddingHorizontal: 24,
  },
  resultCard: {
    marginBottom: 16,
  },
  resultCardContent: {
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
  },
  resultTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultDate: {
    fontSize: 13,
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
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
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