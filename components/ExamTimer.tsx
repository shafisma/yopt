import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface ExamTimerProps {
  timeLimit: number; // in minutes
  onTimeUp: () => void;
  isActive: boolean;
}

export function ExamTimer({ timeLimit, onTimeUp, isActive }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // convert to seconds

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft <= 300; // 5 minutes warning
  const isCritical = timeLeft <= 60; // 1 minute critical

  const getTimerColor = () => {
    if (isCritical) return '#dc2626';
    if (isWarning) return '#d97706';
    return '#059669';
  };

  return (
    <View style={[styles.container, { borderColor: getTimerColor() }]}>
      <View style={styles.content}>
        {isCritical ? (
          <AlertTriangle size={16} color="#dc2626" strokeWidth={2} />
        ) : (
          <Clock size={16} color={getTimerColor()} strokeWidth={1.5} />
        )}
        <Text style={[styles.timeText, { color: getTimerColor() }]}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});