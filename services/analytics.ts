import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quiz, QuizResult } from './gemini';

export interface UserStats {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  streak: number;
  lastQuizDate: string;
  xp: number;
  level: number;
  badges: Badge[];
  topicStats: { [topic: string]: TopicStat };
  difficultyStats: { [difficulty: string]: DifficultyStats };
}

export interface TopicStat {
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number;
  lastStudied: string;
}

export interface DifficultyStats {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ReviewItem {
  questionId: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  wrongCount: number;
  lastReviewed: Date;
}

const STATS_KEY = 'user_stats';
const REVIEW_ITEMS_KEY = 'review_items';

export async function getUserStats(): Promise<UserStats> {
  try {
    const stats = await AsyncStorage.getItem(STATS_KEY);
    if (stats) {
      return JSON.parse(stats);
    }
    
    // Default stats for new users
    return {
      totalQuizzes: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      streak: 0,
      lastQuizDate: '',
      xp: 0,
      level: 1,
      badges: [],
      topicStats: {},
      difficultyStats: {
        easy: { totalQuestions: 0, correctAnswers: 0, averageScore: 0 },
        medium: { totalQuestions: 0, correctAnswers: 0, averageScore: 0 },
        hard: { totalQuestions: 0, correctAnswers: 0, averageScore: 0 },
      },
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}

export async function updateUserStats(quiz: Quiz, result: QuizResult): Promise<UserStats> {
  try {
    const stats = await getUserStats();
    const today = new Date().toDateString();
    const lastQuizDate = new Date(stats.lastQuizDate).toDateString();
    
    // Update basic stats
    stats.totalQuizzes += 1;
    stats.totalQuestions += result.totalQuestions;
    stats.correctAnswers += result.score;
    
    // Update streak
    if (lastQuizDate === today) {
      // Same day, don't change streak
    } else if (isConsecutiveDay(stats.lastQuizDate, today)) {
      stats.streak += 1;
    } else if (stats.lastQuizDate === '') {
      stats.streak = 1;
    } else {
      stats.streak = 1; // Reset streak
    }
    
    stats.lastQuizDate = new Date().toISOString();
    
    // Calculate XP and level
    const xpGained = calculateXP(result, quiz.difficulty);
    stats.xp += xpGained;
    stats.level = calculateLevel(stats.xp);
    
    // Update topic stats
    if (!stats.topicStats[quiz.topic]) {
      stats.topicStats[quiz.topic] = {
        totalQuestions: 0,
        correctAnswers: 0,
        averageTime: 0,
        lastStudied: new Date().toISOString(),
      };
    }
    
    const topicStat = stats.topicStats[quiz.topic];
    topicStat.totalQuestions += result.totalQuestions;
    topicStat.correctAnswers += result.score;
    topicStat.averageTime = (topicStat.averageTime + result.timeSpent) / 2;
    topicStat.lastStudied = new Date().toISOString();
    
    // Update difficulty stats
    const difficultyStat = stats.difficultyStats[quiz.difficulty];
    difficultyStat.totalQuestions += result.totalQuestions;
    difficultyStat.correctAnswers += result.score;
    difficultyStat.averageScore = (difficultyStat.correctAnswers / difficultyStat.totalQuestions) * 100;
    
    // Check for new badges
    const newBadges = checkForNewBadges(stats);
    stats.badges.push(...newBadges);
    
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    
    // Update review items for wrong answers
    await updateReviewItems(quiz, result);
    
    return stats;
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}

function isConsecutiveDay(lastDate: string, currentDate: string): boolean {
  if (!lastDate) return false;
  
  const last = new Date(lastDate);
  const current = new Date(currentDate);
  const diffTime = Math.abs(current.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
}

function calculateXP(result: QuizResult, difficulty: string): number {
  const baseXP = result.score * 10;
  const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
  const timeBonus = result.timeSpent < 30000 ? 20 : result.timeSpent < 60000 ? 10 : 0;
  
  return Math.floor(baseXP * difficultyMultiplier + timeBonus);
}

function calculateLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

function checkForNewBadges(stats: UserStats): Badge[] {
  const badges: Badge[] = [];
  const existingBadgeIds = stats.badges.map(b => b.id);
  
  // First Quiz Badge
  if (stats.totalQuizzes === 1 && !existingBadgeIds.includes('first_quiz')) {
    badges.push({
      id: 'first_quiz',
      name: 'Getting Started',
      description: 'Complete your first quiz',
      icon: '🎯',
      unlockedAt: new Date(),
      rarity: 'common',
    });
  }
  
  // Streak Badges
  if (stats.streak === 7 && !existingBadgeIds.includes('week_streak')) {
    badges.push({
      id: 'week_streak',
      name: 'Week Warrior',
      description: '7-day learning streak',
      icon: '🔥',
      unlockedAt: new Date(),
      rarity: 'rare',
    });
  }
  
  if (stats.streak === 30 && !existingBadgeIds.includes('month_streak')) {
    badges.push({
      id: 'month_streak',
      name: 'Monthly Master',
      description: '30-day learning streak',
      icon: '🏆',
      unlockedAt: new Date(),
      rarity: 'epic',
    });
  }
  
  // Quiz Count Badges
  if (stats.totalQuizzes === 10 && !existingBadgeIds.includes('quiz_10')) {
    badges.push({
      id: 'quiz_10',
      name: 'Quiz Explorer',
      description: 'Complete 10 quizzes',
      icon: '🧭',
      unlockedAt: new Date(),
      rarity: 'common',
    });
  }
  
  if (stats.totalQuizzes === 50 && !existingBadgeIds.includes('quiz_50')) {
    badges.push({
      id: 'quiz_50',
      name: 'Quiz Enthusiast',
      description: 'Complete 50 quizzes',
      icon: '⭐',
      unlockedAt: new Date(),
      rarity: 'rare',
    });
  }
  
  // Perfect Score Badge
  const accuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
  if (accuracy === 100 && stats.totalQuizzes >= 5 && !existingBadgeIds.includes('perfectionist')) {
    badges.push({
      id: 'perfectionist',
      name: 'Perfectionist',
      description: '100% accuracy across 5+ quizzes',
      icon: '💎',
      unlockedAt: new Date(),
      rarity: 'legendary',
    });
  }
  
  return badges;
}

async function updateReviewItems(quiz: Quiz, result: QuizResult): Promise<void> {
  try {
    const reviewItems = await getReviewItems();
    
    quiz.questions.forEach((question, index) => {
      if (result.answers[index] !== question.correctAnswer) {
        const questionId = `${quiz.id}_${index}`;
        const existingItem = reviewItems.find(item => item.questionId === questionId);
        
        if (existingItem) {
          existingItem.wrongCount += 1;
          existingItem.lastReviewed = new Date();
        } else {
          reviewItems.push({
            questionId,
            question: question.question,
            correctAnswer: question.options[question.correctAnswer],
            userAnswer: question.options[result.answers[index]],
            explanation: question.explanation,
            topic: quiz.topic,
            difficulty: quiz.difficulty,
            wrongCount: 1,
            lastReviewed: new Date(),
          });
        }
      }
    });
    
    await AsyncStorage.setItem(REVIEW_ITEMS_KEY, JSON.stringify(reviewItems));
  } catch (error) {
    console.error('Error updating review items:', error);
  }
}

export async function getReviewItems(): Promise<ReviewItem[]> {
  try {
    const items = await AsyncStorage.getItem(REVIEW_ITEMS_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error('Error getting review items:', error);
    return [];
  }
}

export async function generateReviewPack(): Promise<ReviewItem[]> {
  try {
    const reviewItems = await getReviewItems();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get items that need review (wrong multiple times or haven't been reviewed in 7 days)
    const needsReview = reviewItems.filter(item => 
      item.wrongCount >= 2 || new Date(item.lastReviewed) < sevenDaysAgo
    );
    
    // Sort by wrong count (descending) and last reviewed (ascending)
    return needsReview
      .sort((a, b) => {
        if (a.wrongCount !== b.wrongCount) {
          return b.wrongCount - a.wrongCount;
        }
        return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
      })
      .slice(0, 20); // Limit to 20 items
  } catch (error) {
    console.error('Error generating review pack:', error);
    return [];
  }
}