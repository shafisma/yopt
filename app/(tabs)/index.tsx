import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Modal,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Plus, 
  Brain, 
  ChevronDown, 
  Check,
  Sparkles
} from 'lucide-react-native';
import { MinimalBackground } from '../../components/GradientBackground';
import { generateQuiz } from '../../services/gemini';
import { saveQuiz } from '../../services/storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.95);
  const loadingRotation = new Animated.Value(0);

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

  const selectedDifficulty = difficulties.find(d => d.key === difficulty);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isGenerating) {
      const rotateAnimation = Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    }
  }, [isGenerating]);

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      Alert.alert('Missing Topic', 'Please enter a topic for your quiz to get started! 🎯');
      return;
    }

    setIsGenerating(true);
    try {
      const quiz = await generateQuiz(topic.trim(), difficulty, 5);
      await saveQuiz(quiz);
      router.push(`/quiz/${quiz.id}`);
    } catch (error) {
      Alert.alert('Oops!', 'Failed to generate quiz. Please check your connection and try again. 🔄');
      console.error('Quiz generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDifficultySelect = (selectedDiff: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDiff);
    setShowDropdown(false);
  };

  const spin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <MinimalBackground variant="primary">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          style={{ opacity: fadeAnim }}
        >
          {/* Enhanced Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <View style={styles.headerIconContainer}>
              <View style={styles.iconBackground}>
                <Brain size={32} color="#6366f1" strokeWidth={1.5} />
              </View>
              <View style={styles.sparkleContainer}>
                <Sparkles size={16} color="#fbbf24" strokeWidth={2} />
              </View>
            </View>
            
            <Text style={styles.title}>AI Quiz Master</Text>
          </Animated.View>

          {/* Enhanced Form Container */}
          <Animated.View 
            style={[
              styles.formContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Enhanced Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>What would you like to master today?</Text>
              <View style={[
                styles.inputWrapper,
                inputFocused && styles.inputWrapperFocused
              ]}>
                <TextInput
                  style={styles.input}
                  value={topic}
                  onChangeText={setTopic}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Enter any topic (e.g., React Hooks, Ancient Rome, Quantum Physics)"
                  placeholderTextColor="#9ca3af"
                  multiline
                />
                
                {/* Enhanced Difficulty Selector */}
                <TouchableOpacity
                  style={[
                    styles.difficultySelector,
                    { borderColor: selectedDifficulty?.color }
                  ]}
                  onPress={() => setShowDropdown(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.difficultySelectorContent}>
                    <Text style={styles.difficultyEmoji}>{selectedDifficulty?.icon}</Text>
                    <View>
                      <Text style={[
                        styles.difficultyLabel,
                        { color: selectedDifficulty?.color }
                      ]}>
                        {selectedDifficulty?.label}
                      </Text>
                      <Text style={styles.difficultyDescription}>
                        {selectedDifficulty?.description}
                      </Text>
                    </View>
                    <ChevronDown size={16} color={selectedDifficulty?.color} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Enhanced Generate Button */}
            <TouchableOpacity
              style={[
                styles.generateButton,
                isGenerating && styles.generateButtonLoading,
                !topic.trim() && styles.generateButtonDisabled
              ]}
              onPress={handleGenerateQuiz}
              disabled={isGenerating || !topic.trim()}
              activeOpacity={0.9}
            >
              <View style={styles.generateButtonContent}>
                {isGenerating ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Sparkles size={20} color="white" strokeWidth={2} />
                  </Animated.View>
                ) : (
                  <Plus size={20} color="white" strokeWidth={2} />
                )}
                <Text style={styles.generateButtonText}>
                  {isGenerating ? 'Creating Your Quiz...' : 'Generate Quiz'}
                </Text>
              </View>
              {!isGenerating && (
                <View style={styles.buttonShine} />
              )}
            </TouchableOpacity>

            {/* Tip Section */}
            <View style={styles.tipContainer}>
              <Text style={styles.tipText}>
                💡 <Text style={styles.tipBold}>Pro tip:</Text> Be specific with your topic for better questions!
              </Text>
            </View>
          </Animated.View>
        </Animated.ScrollView>

        {/* Enhanced Dropdown Modal */}
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
            <View style={styles.dropdownModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Your Challenge</Text>
                <Text style={styles.modalSubtitle}>Select the perfect difficulty level</Text>
              </View>
              
              {difficulties.map((diff, index) => (
                <TouchableOpacity
                  key={diff.key}
                  style={[
                    styles.difficultyOption,
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
                        <Text style={styles.difficultyOptionDesc}>
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
      </SafeAreaView>
    </MinimalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  sparkleContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -1,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginTop: 20,
    minHeight: 500,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
  },
  inputWrapperFocused: {
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    padding: 20,
    paddingRight: 160,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 24,
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
  generateButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonLoading: {
    backgroundColor: '#6366f1',
  },
  generateButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-20deg' }],
  },
  tipContainer: {
    backgroundColor: '#fef7cd',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    width: width - 40,
    maxWidth: 350,
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
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  difficultyOption: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  difficultyOptionSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#e0f2fe',
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
    color: '#6b7280',
    fontWeight: '500',
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});