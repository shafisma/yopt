import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, Circle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { MinimalBackground } from '../../components/GradientBackground';
import { Quiz, QuizQuestion, analyzeQuizResult } from '../../services/gemini';
import { getQuizById, saveQuizResult } from '../../services/storage';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    if (!id) return;
        
    try {
      const quizData = await getQuizById(id);
      if (quizData) {
        setQuiz(quizData);
        setAnswers(new Array(quizData.questions.length).fill(-1));
      } else {
        Alert.alert('Error', 'Quiz not found');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load quiz');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      Alert.alert('Please select an answer', 'Choose an option before proceeding.');
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    if (!quiz) return;

    const timeSpent = Date.now() - startTime;
    const score = finalAnswers.reduce((acc, answer, index) => {
      return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);

    try {
      const analysis = await analyzeQuizResult(quiz, finalAnswers, timeSpent);
            
      const result = {
        quizId: quiz.id,
        score,
        totalQuestions: quiz.questions.length,
        answers: finalAnswers,
        timeSpent,
        analysis,
        completedAt: new Date(),
      };

      await saveQuizResult(result);
      router.replace(`/results/${quiz.id}?score=${score}&total=${quiz.questions.length}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save quiz result');
    }
  };

  if (isLoading || !quiz) {
    return (
      <MinimalBackground variant="secondary">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Quiz...</Text>
          </View>
        </SafeAreaView>
      </MinimalBackground>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <MinimalBackground variant="secondary">
      <SafeAreaView style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#111827" strokeWidth={1.5} />
          </TouchableOpacity>
                    
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentQuestion + 1} of {quiz.questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
                    
          <View style={styles.timer}>
            <Clock size={16} color="#6b7280" strokeWidth={1.5} />
            <Text style={styles.timerText}>
              {Math.floor((Date.now() - startTime) / 1000)}s
            </Text>
          </View>
        </View>

        {/* Question Section - Fixed */}
        <View style={styles.questionSection}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>
              Question {currentQuestion + 1}
            </Text>
            <Text style={styles.questionText}>
              {question.question}
            </Text>
          </View>
        </View>

        {/* Options Section - Scrollable */}
        <ScrollView 
          style={styles.optionsScrollView}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption
              ]}
              onPress={() => handleAnswerSelect(index)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIndicator}>
                  {selectedAnswer === index ? (
                    <CheckCircle size={20} color="#111827" strokeWidth={2} />
                  ) : (
                    <Circle size={20} color="#d1d5db" strokeWidth={1.5} />
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  selectedAnswer === index && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Fixed Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedAnswer === null && styles.nextButtonDisabled
            ]}
            onPress={handleNextQuestion}
            disabled={selectedAnswer === null}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Text>
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
    padding: 20,
    paddingBottom: 16,
    gap: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 2,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  questionSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  questionContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 26,
  },
  optionsScrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  optionsContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedOption: {
    borderColor: '#111827',
    backgroundColor: '#f9fafb',
    shadowColor: '#111827',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 24,
  },
  selectedOptionText: {
    color: '#111827',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  nextButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
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