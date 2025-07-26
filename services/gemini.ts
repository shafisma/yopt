import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI('AIzaSyCctQ1M-vZ8iRcn8FQ4RT3eJLlvBtw_YO0'); // Replace with your actual API key

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mode: 'quiz' | 'flashcard' | 'exam';
  questions: QuizQuestion[];
  createdAt: Date;
  timeLimit?: number; // in minutes for exam mode
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: number[];
  timeSpent: number;
  analysis: string;
  completedAt: Date;
  mode: 'quiz' | 'flashcard' | 'exam';
  timeLimitExceeded?: boolean;
}

export interface FlashcardData {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function generateQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard', questionCount: number = 5): Promise<Quiz> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Generate a ${difficulty} level quiz about "${topic}" with exactly ${questionCount} multiple choice questions. 

STRICT REQUIREMENTS:
- Return ONLY valid JSON, no additional text or formatting
- Each question must have exactly 4 options
- correctAnswer must be the index (0-3) of the correct option
- Include detailed explanations for each answer
- Make questions engaging and educational

JSON format:
{
  "title": "Quiz about [topic]",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this answer is correct",
      "difficulty": "${difficulty}"
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const quizData = JSON.parse(cleanedText);
    
    return {
      id: Date.now().toString(),
      ...quizData,
      mode: 'quiz',
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz. Please try again.');
  }
}

export async function analyzeQuizResult(quiz: Quiz, answers: number[], timeSpent: number): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const score = answers.reduce((acc, answer, index) => {
    return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
  }, 0);

  const percentage = (score / quiz.questions.length) * 100;

  const wrongAnswers = quiz.questions
    .map((q, index) => ({
      question: q.question,
      yourAnswer: q.options[answers[index]],
      correctAnswer: q.options[q.correctAnswer],
      wasCorrect: answers[index] === q.correctAnswer,
    }))
    .filter(a => !a.wasCorrect);

  const prompt = `Analyze this quiz performance and provide personalized feedback:

Quiz Topic: ${quiz.topic}
Difficulty: ${quiz.difficulty}
Score: ${score}/${quiz.questions.length} (${percentage.toFixed(1)}%)
Time Spent: ${Math.round(timeSpent / 1000)} seconds

Wrong Answers:
${wrongAnswers.map(wa => `Q: ${wa.question}\nYour Answer: ${wa.yourAnswer}\nCorrect Answer: ${wa.correctAnswer}`).join('\n\n')}

Provide a constructive analysis in 2-3 paragraphs covering:
1. Overall performance assessment
2. Areas for improvement based on wrong answers
3. Encouraging suggestions for further learning

Keep it friendly, motivational, and educational.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing quiz:', error);
    return `Great job completing the quiz! You scored ${score}/${quiz.questions.length} (${percentage.toFixed(1)}%). Keep practicing to improve your knowledge in ${quiz.topic}.`;
  }
}

export async function generateFlashcards(topic: string, difficulty: 'easy' | 'medium' | 'hard', cardCount: number = 10): Promise<FlashcardData[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Generate ${cardCount} flashcards about "${topic}" at ${difficulty} level.

STRICT REQUIREMENTS:
- Return ONLY valid JSON array, no additional text
- Each flashcard should have a question/term on front and answer/definition on back
- Make them educational and progressively challenging

JSON format:
[
  {
    "front": "Question or term here",
    "back": "Answer or definition here",
    "difficulty": "${difficulty}"
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}

export async function generateExamQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard', questionCount: number = 20, timeLimit: number = 30): Promise<Quiz> {
  const quiz = await generateQuiz(topic, difficulty, questionCount);
  return {
    ...quiz,
    mode: 'exam',
    timeLimit,
  };
}