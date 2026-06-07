import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let soundEnabled = true;
let isInitialized = false;
let lastVolumeCheck = 0;

// Sound URLs (short online sounds)
const SOUND_URLS = {
  success: 'https://www.soundjay.com/buttons/sounds/button-09.mp3',
  delete: 'https://www.soundjay.com/buttons/sounds/button-10.mp3',
  warning: 'https://www.soundjay.com/buttons/sounds/button-2.mp3',
  click: 'https://www.soundjay.com/buttons/sounds/button-16.mp3',
  error: 'https://www.soundjay.com/buttons/sounds/button-8.mp3',
};

// Initialize audio system
export const initSounds = async () => {
  if (isInitialized) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    isInitialized = true;
  } catch (error) {
    console.log('Audio init failed:', error);
  }
};

// Check if device volume is 0 (mute)
const isVolumeZero = async () => {
  try {
    const status = await Audio.getVolumeAsync();
    return status.volume === 0;
  } catch (error) {
    return false;
  }
};

// Play haptic feedback
const playHaptic = async (type) => {
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
      case 'click':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'delete':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    console.log('Haptic failed:', error);
  }
};

// Play sound
const playSound = async (type) => {
  try {
    await initSounds();
    const { sound } = await Audio.Sound.createAsync(
      { uri: SOUND_URLS[type] || SOUND_URLS.click },
      { shouldPlay: true, volume: 0.5 }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log('Sound failed:', error);
  }
};

// Main play function - auto-detects volume
export const playFeedback = async (type) => {
  if (!soundEnabled) return;

  try {
    const volumeZero = await isVolumeZero();
    if (volumeZero) {
      // Volume is 0, use haptics
      await playHaptic(type);
    } else {
      // Volume is up, use sound
      await playSound(type);
    }
  } catch (error) {
    // Fallback to haptics if anything fails
    await playHaptic(type);
  }
};

// Toggle sound
export const toggleSound = (enabled) => {
  soundEnabled = enabled;
};

// Get sound status
export const isSoundEnabled = () => soundEnabled;

// Predefined feedback functions
export const playSuccess = () => playFeedback('success');
export const playDelete = () => playFeedback('delete');
export const playWarning = () => playFeedback('warning');
export const playClick = () => playFeedback('click');
export const playError = () => playFeedback('error');
