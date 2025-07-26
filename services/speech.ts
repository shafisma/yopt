import * as Speech from 'expo-speech';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
}

export class SpeechService {
  static async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    const { language = 'en-US', pitch = 1.0, rate = 0.8 } = options;
    
    try {
      await Speech.speak(text, {
        language,
        pitch,
        rate,
        onStart: () => console.log('Speech started'),
        onDone: () => console.log('Speech finished'),
        onError: (error) => console.error('Speech error:', error),
      });
    } catch (error) {
      console.error('Error in speech synthesis:', error);
    }
  }

  static stop(): void {
    Speech.stop();
  }

  static async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      return await Speech.getAvailableVoicesAsync();
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }
}