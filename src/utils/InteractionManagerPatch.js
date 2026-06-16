import { InteractionManager } from 'react-native';
import * as Haptics from 'expo-haptics';

const originalRunAfterInteractions = InteractionManager.runAfterInteractions;

InteractionManager.runAfterInteractions = (task) => {
  if (typeof task === 'function') {
    return originalRunAfterInteractions(task);
  }
  return { cancel: () => {} };
};

export const triggerHaptic = async (type = 'light') => {
  try {
    switch (type) {
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'light':
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } catch (error) {
    console.log('Haptic failed:', error);
  }
};

export default InteractionManager;
