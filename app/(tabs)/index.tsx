import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Brain, ChevronDown, Check, BookOpen, Timer, Zap } from 'lucide-react-native';
import { MinimalBackground } from '../../components/GradientBackground';
import { useTheme } from '../../contexts/ThemeContext';
import { generateQuiz, generateExamQuiz, generateFlashcards } from '../../services/gemini';
import { saveQuiz } from '../../services/storage';
import { VoiceInput } from '../../components/VoiceInput';

export default function HomeScreen() {
  const { theme } = useTheme();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [mode, setMode] = useState<'quiz' | 'flashcard' | 'exam'>('quiz');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const difficulties = [
    { 
      key: 'easy', 
      label: 'Easy', 
      color: '#10b981',
      description: 'Perfect for beginners',
      icon: '🌱'
    },
    { 
      key: 'medium', 
      label: 'Medium', 
      color: '#f59e0b',
      description: 'Balanced challenge',
      icon: '⚡'
    },
    { 
      key: 'hard', 
      label: 'Hard', 
      color: '#ef4444',
      description: 'Expert level',
      icon: '🔥'
    },
  ] as const;

  const modes = [
    {
      key: 'quiz',
      label: 'Quiz Mode',
      description: 'Traditional multiple choice',
      icon: <Brain size={16} color="#6366f1" strokeWidth={1.5} />,
      color: '#6366f1'
    },
    {
      key: 'flashcard',
      label: 'Flashcard Mode',
      description: 'Study with flashcards',
      icon: <BookOpen size={16} color="#059669" strokeWidth={1.5} />,
      color: '#059669'
    },
    {
      key: 'exam',
      label: 'Exam Mode',
      description: 'Timed challenge',
      icon: <Timer size={16} color="#dc2626" strokeWidth={1.5} />,
      color: '#dc2626'
    },
  ] as const;

  const selectedDifficulty = difficulties.find(d => d.key === difficulty);
  const selectedMode = modes.find(m => m.key === mode);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      if (mode === 'flashcard') {
        const flashcards = await generateFlashcards(topic.trim(), difficulty, 10);
        // Navigate to flashcard mode
        router.push(`/flashcards?topic=${encodeURIComponent(topic.trim())}&difficulty=${difficulty}`);
      } else if (mode === 'exam') {
        const quiz = await generateExamQuiz(topic.trim(), difficulty, 20, 30);
        await saveQuiz(quiz);
        router.push(`/quiz/${quiz.id}`);
      } else {
        const quiz = await generateQuiz(topic.trim(), difficulty, 5);
        await saveQuiz(quiz);
        router.push(`/quiz/${quiz.id}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate content. Please try again.');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDifficultySelect = (selectedDiff: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDiff);
    setShowDropdown(false);
  };

  const handleModeSelect = (selectedMode: 'quiz' | 'flashcard' | 'exam') => {
    setMode(selectedMode);
    setShowModeSelector(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <View style={styles.titleContainer}>
              <Brain size={28} color={theme.colors.text} strokeWidth={1.5} />
              <Text style={[styles.title, { color: theme.colors.text }]}>AI Quiz Master</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Generate personalized quizzes on any topic with AI
            </Text>
          </View>

          <View style={[styles.formContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>What would you like to learn about?</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputWithVoice}>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background, 
                    borderColor: theme.colors.border,
                    color: theme.colors.text 
                  }]}
                  value={topic}
                  onChangeText={setTopic}
                  placeholder="Enter any topic (e.g., JavaScript, History)"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                />
                  <View style={styles.voiceInputContainer}>
                    <VoiceInput textToSpeak={topic} showSpeaker={false} />
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.dropdownButton, { 
                    backgroundColor: theme.colors.background, 
                    borderColor: theme.colors.border 
                  }]}
                  onPress={() => setShowDropdown(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dropdownContent}>
                    <View style={[
                      styles.difficultyIndicator,
                      { backgroundColor: selectedDifficulty?.color }
                    ]} />
                    <Text style={[
                      styles.dropdownText,
                      { color: selectedDifficulty?.color }
                    ]}>
                      {selectedDifficulty?.label}
                    </Text>
                    <ChevronDown size={16} color={selectedDifficulty?.color} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modeContainer}>
                <Text style={[styles.modeLabel, { color: theme.colors.text }]}>Learning Mode</Text>
                <TouchableOpacity
                  style={[styles.modeSelector, { 
                    backgroundColor: theme.colors.background, 
                    borderColor: theme.colors.border 
                  }]}
                  onPress={() => setShowModeSelector(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modeSelectorContent}>
                    {selectedMode?.icon}
                    <Text style={[styles.modeText, { color: selectedMode?.color }]}>
                      {selectedMode?.label}
                    </Text>
                    <ChevronDown size={16} color={selectedMode?.color} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.generateButton, 
                { backgroundColor: isGenerating ? theme.colors.textSecondary : theme.colors.primary }
              ]}
              onPress={handleGenerate}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              <View style={styles.generateButtonContent}>
                <Plus size={20} color={theme.colors.background} strokeWidth={2} />
                <Text style={[styles.generateButtonText, { color: theme.colors.background }]}>
                  {isGenerating ? 'Generating...' : `Create ${selectedMode?.label}`}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Dropdown Modal */}
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          >
            <View style={[styles.dropdownModal, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Choose Your Challenge</Text>
                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>Select the perfect difficulty level</Text>
              </View>
              
              {difficulties.map((diff, index) => (
                <TouchableOpacity
                  key={diff.key}
                  style={[
                    styles.difficultyOption,
                    { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                    difficulty === diff.key && styles.difficultyOptionSelected,
                    index === difficulties.length - 1 && styles.lastOption
                  ]}
                  onPress={() => handleDifficultySelect(diff.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.difficultyOptionContent}>
                    <View style={styles.difficultyOptionLeft}>
                      <Text style={styles.difficultyOptionEmoji}>{diff.icon}</Text>
                      <View>
                        <Text style={[
                          styles.difficultyOptionLabel,
                          { color: diff.color }
                        ]}>
                          {diff.label}
                        </Text>
                        <Text style={[styles.difficultyOptionDesc, { color: theme.colors.textSecondary }]}>
                          {diff.description}
                        </Text>
                      </View>
                    </View>
                    {difficulty === diff.key && (
                      <View style={[styles.checkContainer, { backgroundColor: diff.color }]}>
                        <Check size={14} color="white" strokeWidth={2} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Mode Selector Modal */}
        <Modal
          visible={showModeSelector}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModeSelector(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModeSelector(false)}
          >
            <View style={[styles.dropdownModal, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Choose Learning Mode</Text>
                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>Select how you want to study</Text>
              </View>
              
              {modes.map((modeOption, index) => (
                <TouchableOpacity
                  key={modeOption.key}
                  style={[
                    styles.difficultyOption,
                    { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                    mode === modeOption.key && styles.difficultyOptionSelected,
                    index === modes.length - 1 && styles.lastOption
                  ]}
                  onPress={() => handleModeSelect(modeOption.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.difficultyOptionContent}>
                    <View style={styles.difficultyOptionLeft}>
                      <View style={styles.modeIconContainer}>
                        {modeOption.icon}
                      </View>
                      <View>
                        <Text style={[
                          styles.difficultyOptionLabel,
                          { color: modeOption.color }
                        ]}>
                          {modeOption.label}
                        </Text>
                        <Text style={[styles.difficultyOptionDesc, { color: theme.colors.textSecondary }]}>
                          {modeOption.description}
                        </Text>
                      </View>
                    </View>
                    {mode === modeOption.key && (
                      <View style={[styles.checkContainer, { backgroundColor: modeOption.color }]}>
                        <Check size={14} color="white" strokeWidth={2} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownModal: {
    borderRadius: 24,
    padding: 24,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  difficultyOption: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  difficultyOptionSelected: {
    opacity: 0.8,
  },
  lastOption: {
    marginBottom: 0,
  },
  difficultyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  difficultyOptionEmoji: {
    fontSize: 20,
  },
  difficultyOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  difficultyOptionDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
  difficultySelector: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  difficultySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyEmoji: {
    fontSize: 16,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  difficultyDescription: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 32,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  formContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    marginTop: 24,
    minHeight: 400,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomWidth: 0,
  },
  inputContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputWithVoice: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    paddingRight: 180, // Make space for voice input and dropdown
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  voiceInputContainer: {
    position: 'absolute',
    right: 130,
    top: 12,
  },
  dropdownButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    minWidth: 110,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '600',
  },
  difficultyIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeContainer: {
    marginTop: 24,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modeSelector: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  modeSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  modeIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButton: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  dropdownOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});