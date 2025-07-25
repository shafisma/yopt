import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quiz, QuizResult } from './gemini';

const QUIZ_HISTORY_KEY = 'quiz_history';
const QUIZ_RESULTS_KEY = 'quiz_results';

export async function saveQuiz(quiz: Quiz): Promise<void> {
  try {
    const existingQuizzes = await getQuizHistory();
    const updatedQuizzes = [quiz, ...existingQuizzes];
    await AsyncStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updatedQuizzes));
  } catch (error) {
    console.error('Error saving quiz:', error);
  }
}

export async function getQuizHistory(): Promise<Quiz[]> {
  try {
    const quizzes = await AsyncStorage.getItem(QUIZ_HISTORY_KEY);
    return quizzes ? JSON.parse(quizzes) : [];
  } catch (error) {
    console.error('Error getting quiz history:', error);
    return [];
  }
}

export async function saveQuizResult(result: QuizResult): Promise<void> {
  try {
    const existingResults = await getQuizResults();
    const updatedResults = [result, ...existingResults];
    await AsyncStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(updatedResults));
  } catch (error) {
    console.error('Error saving quiz result:', error);
  }
}

export async function getQuizResults(): Promise<QuizResult[]> {
  try {
    const results = await AsyncStorage.getItem(QUIZ_RESULTS_KEY);
    return results ? JSON.parse(results) : [];
  } catch (error) {
    console.error('Error getting quiz results:', error);
    return [];
  }
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  try {
    const quizzes = await getQuizHistory();
    return quizzes.find(quiz => quiz.id === id) || null;
  } catch (error) {
    console.error('Error getting quiz by ID:', error);
    return null;
  }
}