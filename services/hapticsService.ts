import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function triggerLightImpact(): void {
  if (Platform.OS !== 'web') {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Non-blocking
    }
  }
}

export function triggerMediumImpact(): void {
  if (Platform.OS !== 'web') {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Non-blocking
    }
  }
}

export function triggerHeavyImpact(): void {
  if (Platform.OS !== 'web') {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Non-blocking
    }
  }
}

export function triggerSuccessFeedback(): void {
  if (Platform.OS !== 'web') {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Non-blocking
    }
  }
}
