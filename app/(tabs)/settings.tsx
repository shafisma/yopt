import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, Info, Mail, Shield, Star } from 'lucide-react-native';
import { MinimalBackground } from '../../components/GradientBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
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
    <MinimalBackground variant="primary">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your app preferences</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleAbout} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#eef2ff' }]}>
                <Info size={20} color="#6366f1" strokeWidth={1.5} />
              </View>
              <Text style={styles.settingText}>About AI Quiz Master</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleRate} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
                <Star size={20} color="#d97706" strokeWidth={1.5} />
              </View>
              <Text style={styles.settingText}>Rate Our App</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleContact} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#d1fae5' }]}>
                <Mail size={20} color="#059669" strokeWidth={1.5} />
              </View>
              <Text style={styles.settingText}>Contact Us</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#f3e8ff' }]}>
                <Shield size={20} color="#8b5cf6" strokeWidth={1.5} />
              </View>
              <Text style={styles.settingText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={handleClearData} activeOpacity={0.7}>
              <View style={[styles.settingIcon, { backgroundColor: '#fee2e2' }]}>
                <Trash2 size={20} color="#dc2626" strokeWidth={1.5} />
              </View>
              <Text style={[styles.settingText, { color: '#dc2626' }]}>Clear All Data</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>AI Quiz Master v1.0.0</Text>
            <Text style={styles.footerSubtext}>
              Powered by Google Gemini AI
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </MinimalBackground>
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
    backgroundColor: '#ffffff',
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    color: '#374151',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: '#d1d5db',
  },
});