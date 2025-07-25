import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface MinimalBackgroundProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'neutral';
}

export function MinimalBackground({ 
  children, 
  variant = 'primary'
}: MinimalBackgroundProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return '#fafafa';
      case 'secondary': return '#ffffff';
      case 'neutral': return '#f8f9fa';
      default: return '#fafafa';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});