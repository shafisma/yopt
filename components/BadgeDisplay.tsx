import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Badge } from '../services/analytics';
import { useTheme } from '../contexts/ThemeContext';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

export function BadgeDisplay({ badge, size = 'medium', onPress }: BadgeDisplayProps) {
  const { theme } = useTheme();

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, fontSize: 16 };
      case 'large':
        return { width: 80, height: 80, fontSize: 32 };
      default:
        return { width: 60, height: 60, fontSize: 24 };
    }
  };

  const sizeStyles = getSizeStyles();
  const rarityColor = getRarityColor(badge.rarity);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: rarityColor,
          width: sizeStyles.width,
          height: sizeStyles.height,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, { fontSize: sizeStyles.fontSize }]}>
        {badge.icon}
      </Text>
      {size !== 'small' && (
        <View style={[styles.rarityIndicator, { backgroundColor: rarityColor }]} />
      )}
    </TouchableOpacity>
  );
}

interface BadgeModalProps {
  badge: Badge | null;
  visible: boolean;
  onClose: () => void;
}

export function BadgeModal({ badge, visible, onClose }: BadgeModalProps) {
  const { theme } = useTheme();

  if (!badge) return null;

  const rarityColor = badge.rarity === 'common' ? '#6b7280' :
                     badge.rarity === 'rare' ? '#3b82f6' :
                     badge.rarity === 'epic' ? '#8b5cf6' : '#f59e0b';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalBadge, { borderColor: rarityColor }]}>
            <Text style={styles.modalIcon}>{badge.icon}</Text>
          </View>
          
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {badge.name}
          </Text>
          
          <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
            {badge.description}
          </Text>
          
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
            <Text style={styles.rarityText}>{badge.rarity.toUpperCase()}</Text>
          </View>
          
          <Text style={[styles.unlockedDate, { color: theme.colors.textSecondary }]}>
            Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
          </Text>
          
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.background }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    textAlign: 'center',
  },
  rarityIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 24,
    padding: 32,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalBadge: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  rarityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  unlockedDate: {
    fontSize: 14,
    marginBottom: 24,
  },
  closeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});