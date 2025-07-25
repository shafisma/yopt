import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, BookOpen, Zap } from 'lucide-react-native';
import { Quiz } from '../services/gemini';

interface QuizCardProps {
  quiz: Quiz;
  onPress: () => void;
}

export function QuizCard({ quiz, onPress }: QuizCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#059669';
      case 'medium': return '#d97706';
      case 'hard': return '#dc2626';
      default: return '#4f46e5';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    const color = getDifficultyColor(difficulty);
    switch (difficulty) {
      case 'easy': return <BookOpen size={14} color={color} />;
      case 'medium': return <Clock size={14} color={color} />;
      case 'hard': return <Zap size={14} color={color} />;
      default: return <BookOpen size={14} color={color} />;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{quiz.title}</Text>
          <View style={[styles.difficultyBadge, { borderColor: getDifficultyColor(quiz.difficulty) }]}>
            <View style={styles.difficultyContent}>
              {getDifficultyIcon(quiz.difficulty)}
              <Text style={[styles.difficultyText, { color: getDifficultyColor(quiz.difficulty) }]}>
                {quiz.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.topic}>{quiz.topic}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.questionCount}>
            {quiz.questions.length} Questions
          </Text>
          <Text style={styles.date}>
            {new Date(quiz.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 16,
    lineHeight: 24,
  },
  difficultyBadge: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  difficultyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  topic: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 20,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  questionCount: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  date: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '400',
  },
});