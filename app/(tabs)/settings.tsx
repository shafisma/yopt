import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, Info, Mail, Shield, Star, Moon, Sun, Type, Contrast, Bell } from 'lucide-react-native';
import { MinimalBackground } from '../../components/GradientBackground';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeMode, FontSize, ContrastMode } from '../../services/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { theme, settings, updateTheme } = useTheme();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your quiz history and results. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const handleThemeChange = (mode: ThemeMode) => {
    updateTheme({ mode });
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    updateTheme({ fontSize });
  };

  const handleContrastChange = (contrast: ContrastMode) => {
    updateTheme({ contrast });
  };

  const handleAbout = () => {
    Alert.alert(
      'About AI Quiz Master',
      'AI Quiz Master uses Google\'s Gemini AI to generate personalized quizzes on any topic. Challenge yourself and track your learning progress!',
      [{ text: 'OK' }]
    );
  };

  const handleContact = () => {
    Alert.alert(
      'Contact Us',
      'For support or feedback, please reach out to us at support@aiquizmaster.com',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your quiz data is stored locally on your device. We do not collect or share any personal information.',
      [{ text: 'OK' }]
    );
  };

  const handleRate = () => {
    Alert.alert(
      'Rate Our App',
      'Thank you for using AI Quiz Master! Please rate us in the App Store to help others discover our app.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Manage your app preferences</Text>
        </View>

        <ScrollView style={[styles.content, { backgroundColor: theme.colors.surface }]} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
            
            <View style={[styles.settingGroup, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Text style={[styles.groupTitle, { color: theme.colors.text }]}>Theme</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[styles.optionButton, settings.mode === 'light' && { backgroundColor: theme.colors.accent }]}
                  onPress={() => handleThemeChange('light')}
                >
                  <Sun size={16} color={settings.mode === 'light' ? '#ffffff' : theme.colors.textSecondary} />
                  <Text style={[styles.optionText, { color: settings.mode === 'light' ? '#ffffff' : theme.colors.textSecondary }]}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, settings.mode === 'dark' && { backgroundColor: theme.colors.accent }]}
                  onPress={() => handleThemeChange('dark')}
                >
                  <Moon size={16} color={settings.mode === 'dark' ? '#ffffff' : theme.colors.textSecondary} />
                  <Text style={[styles.optionText, { color: settings.mode === 'dark' ? '#ffffff' : theme.colors.textSecondary }]}>Dark</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.settingGroup, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Text style={[styles.groupTitle, { color: theme.colors.text }]}>Font Size</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[styles.optionButton, settings.fontSize === 'small' && { backgroundColor: theme.colors.accent }]}
                  onPress={() => handleFontSizeChange('small')}
                >
                  <Text style={[styles.optionText, { color: settings.fontSize === 'small' ? '#ffffff' : theme.colors.textSecondary }]}>Small</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, settings.fontSize === 'medium' && { backgroundColor: theme.colors.accent }]}
                  onPress={() => handleFontSizeChange('medium')}
                >
                  <Text style={[styles.optionText, { color: settings.fontSize === 'medium' ? '#ffffff' : theme.colors.textSecondary }]}>Medium</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, settings.fontSize === 'large' && { backgroundColor: theme.colors.accent }]}
                  onPress={() => handleFontSizeChange('large')}
                >
                  <Text style={[styles.optionText, { color: settings.fontSize === 'large' ? '#ffffff' : theme.colors.textSecondary }]}>Large</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.settingGroup, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Text style={[styles.groupTitle, { color: theme.colors.text }]}>Contrast</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[styles.optionButton, settings.contrast === 'normal' && { backgroundColor: theme.colors.accent }]}
                  onPress={() => handleContrastChange('normal')}
                >
                  <Text style={[styles.optionText, { color: settings.contrast === 'normal' ? '#ffffff' : theme.colors.textSecondary }]}>Normal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, settings.contrast === 'high' && { backgroundColor: theme.colors.accent }]}
                  onPress={() => handleContrastChange('high')}
                >
                  <Text style={[styles.optionText, { color: settings.contrast === 'high' ? '#ffffff' : theme.colors.textSecondary }]}>High</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
            
            <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} onPress={handleAbout} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#eef2ff' }]}>
                <Info size={20} color="#6366f1" strokeWidth={1.5} />
              </View>
              <Text style={[styles.settingText, { color: theme.colors.text }]}>About AI Quiz Master</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} onPress={handleRate} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
                <Star size={20} color="#d97706" strokeWidth={1.5} />
              </View>
              <Text style={[styles.settingText, { color: theme.colors.text }]}>Rate Our App</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Support</Text>
            
            <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} onPress={handleContact} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#d1fae5' }]}>
                <Mail size={20} color="#059669" strokeWidth={1.5} />
              </View>
              <Text style={[styles.settingText, { color: theme.colors.text }]}>Contact Us</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} onPress={handlePrivacy} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#f3e8ff' }]}>
                <Shield size={20} color="#8b5cf6" strokeWidth={1.5} />
              </View>
              <Text style={[styles.settingText, { color: theme.colors.text }]}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data</Text>
            
            <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} onPress={handleClearData} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#fee2e2' }]}>
                <Trash2 size={20} color="#dc2626" strokeWidth={1.5} />
              </View>
              <Text style={[styles.settingText, { color: theme.colors.error }]}>Clear All Data</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>AI Quiz Master v1.0.0</Text>
            <Text style={[styles.footerSubtext, { color: theme.colors.textSecondary }]}>
              Powered by Google Gemini AI
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  settingGroup: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
  },
});