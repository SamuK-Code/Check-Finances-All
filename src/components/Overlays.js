// /src/components/Overlays.js
// Consolidates: AlertPopup + Toast + BankSelectorModal

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { triggerHaptic } from '../utils/InteractionManagerPatch';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════
// SHARED STYLES & HELPERS
// ═══════════════════════════════════════════════════════════

const useOverlayStyles = () => {
  const { theme, isDark } = useTheme();

  return {
    theme,
    isDark,
    colors: theme.colors,
    styles: StyleSheet.create({
      // ─── Backdrop ───
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      backdropBottomSheet: {
        justifyContent: 'flex-end',
      },

      // ─── Alert Popup ───
      alertContainer: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 32,
        width: '85%',
        maxWidth: 340,
        ...theme.shadows.large,
      },
      alertIcon: {
        alignSelf: 'center',
        marginBottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
      },
      alertIconText: {
        fontSize: 28,
      },
      alertTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
      },
      alertMessage: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
      },
      alertButtons: {
        flexDirection: 'row',
        gap: 12,
      },
      alertButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
      },
      alertButtonPrimary: {
        backgroundColor: theme.colors.primary,
      },
      alertButtonSecondary: {
        backgroundColor: isDark ? '#333' : '#F2F2F7',
      },
      alertButtonDanger: {
        backgroundColor: theme.colors.danger,
      },
      alertButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
      },
      alertButtonTextSecondary: {
        color: theme.colors.text,
      },

      // ─── Toast ───
      toastContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
        paddingHorizontal: 16,
      },
      toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#1C1C1E' : '#FFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: Platform.OS === 'ios' ? 50 : 30,
        ...theme.shadows.medium,
        maxWidth: '90%',
      },
      toastIcon: {
        fontSize: 20,
        marginRight: 10,
      },
      toastText: {
        fontSize: 14,
        color: theme.colors.text,
        flex: 1,
        fontWeight: '500',
      },
      toastSuccess: {
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.success,
      },
      toastError: {
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.danger,
      },
      toastWarning: {
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.warning,
      },
      toastInfo: {
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
      },

      // ─── Bottom Sheet (Bank Selector) ───
      bottomSheet: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: SCREEN_HEIGHT * 0.75,
        ...theme.shadows.large,
      },
      bottomSheetHandle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: isDark ? '#444' : '#D1D1D6',
        marginTop: 12,
        marginBottom: 8,
      },
      bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#333' : '#F2F2F7',
      },
      bottomSheetTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
      },
      bottomSheetClose: {
        fontSize: 24,
        color: theme.colors.textSecondary,
        padding: 4,
      },
      bottomSheetContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
      },
      searchInput: {
        backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 12,
      },
      bankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
      },
      bankItemSelected: {
        backgroundColor: theme.colors.primary + '15',
      },
      bankIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      },
      bankIconText: {
        fontSize: 20,
      },
      bankName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,
      },
      bankCheck: {
        fontSize: 20,
      },
      emptyList: {
        alignItems: 'center',
        paddingVertical: 40,
      },
      emptyListText: {
        fontSize: 15,
        color: theme.colors.textSecondary,
      },
    }),
  };
};

// ═══════════════════════════════════════════════════════════
// ALERT POPUP
// ═══════════════════════════════════════════════════════════

export const AlertPopup = ({
  visible,
  title,
  message,
  type = 'info', // 'info' | 'success' | 'warning' | 'error'
  buttons = [],
  onDismiss,
  dismissOnBackdrop = true,
}) => {
  const { colors, styles } = useOverlayStyles();
  const { t } = useI18n();
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const getIconConfig = () => {
    switch (type) {
      case 'success': return { icon: '✅', color: colors.success + '20', textColor: colors.success };
      case 'warning': return { icon: '⚠️', color: colors.warning + '20', textColor: colors.warning };
      case 'error': return { icon: '❌', color: colors.danger + '20', textColor: colors.danger };
      default: return { icon: 'ℹ️', color: colors.primary + '20', textColor: colors.primary };
    }
  };

  const iconConfig = getIconConfig();

  const defaultButtons = buttons.length > 0 ? buttons : [
    {
      text: t('common.ok'),
      onPress: onDismiss,
      style: 'primary',
    },
  ];

  const getButtonStyle = (style) => {
    switch (style) {
      case 'primary': return styles.alertButtonPrimary;
      case 'danger': return styles.alertButtonDanger;
      default: return styles.alertButtonSecondary;
    }
  };

  const getButtonTextStyle = (style) => {
    switch (style) {
      case 'primary':
      case 'danger': return styles.alertButtonText;
      default: return [styles.alertButtonText, styles.alertButtonTextSecondary];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={dismissOnBackdrop ? onDismiss : null}
      >
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={[styles.alertIcon, { backgroundColor: iconConfig.color }]}>
            <Text style={styles.alertIconText}>{iconConfig.icon}</Text>
          </View>
          {title && <Text style={styles.alertTitle}>{title}</Text>}
          {message && <Text style={styles.alertMessage}>{message}</Text>}
          <View style={styles.alertButtons}>
            {defaultButtons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.alertButton, getButtonStyle(btn.style)]}
                onPress={() => {
                  btn.onPress?.();
                  if (!btn.preventDismiss) onDismiss?.();
                }}
              >
                <Text style={getButtonTextStyle(btn.style)}>{btn.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════

export const Toast = ({
  visible,
  message,
  type = 'info', // 'info' | 'success' | 'error' | 'warning'
  duration = 3000,
  onDismiss,
  position = 'top', // 'top' | 'bottom'
}) => {
  const { colors, styles } = useOverlayStyles();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      triggerHaptic('light');
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: position === 'top' ? 0 : 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -150 : 150,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss?.());
  }, [onDismiss, position]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success': return styles.toastSuccess;
      case 'error': return styles.toastError;
      case 'warning': return styles.toastWarning;
      default: return styles.toastInfo;
    }
  };

  if (!visible) return null;

  return (
    <View
      style={[
        styles.toastContainer,
        position === 'bottom' && { bottom: 0, top: undefined },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.toastContent,
          getToastStyle(),
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <Text style={styles.toastIcon}>{getIcon()}</Text>
        <Text style={styles.toastText}>{message}</Text>
      </Animated.View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// TOAST MANAGER (hook para usar Toast globalmente)
// ═══════════════════════════════════════════════════════════

let toastRef = null;

export const ToastManager = {
  setRef: (ref) => { toastRef = ref; },
  show: (message, type = 'info', duration = 3000) => {
    toastRef?.show?.(message, type, duration);
  },
  hide: () => {
    toastRef?.hide?.();
  },
};

export const ToastProvider = ({ children }) => {
  const [toastState, setToastState] = useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  });

  useEffect(() => {
    ToastManager.setRef({
      show: (message, type, duration) => {
        setToastState({ visible: true, message, type, duration });
      },
      hide: () => {
        setToastState(prev => ({ ...prev, visible: false }));
      },
    });
  }, []);

  return (
    <>
      {children}
      <Toast
        {...toastState}
        onDismiss={() => setToastState(prev => ({ ...prev, visible: false }))}
      />
    </>
  );
};

// ═══════════════════════════════════════════════════════════
// BANK SELECTOR MODAL (Bottom Sheet)
// ═══════════════════════════════════════════════════════════

export const BankSelectorModal = ({
  visible,
  onSelect,
  onClose,
  selectedBank,
  banks = [],
  searchable = true,
  title,
}) => {
  const { colors, styles } = useOverlayStyles();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [backdropOpacity] = useState(new Animated.Value(0));

  const panY = useRef(new Animated.Value(0)).current;
  const resetPositionAnim = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose?.();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const filteredBanks = searchQuery
    ? banks.filter(b =>
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code?.includes(searchQuery)
      )
    : banks;

  const handleSelect = (bank) => {
    triggerHaptic('light');
    onSelect?.(bank);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, styles.backdropBottomSheet, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [
              { translateY: slideAnim },
              { translateY: panY },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <SafeAreaView edges={['bottom']}>
          <View style={styles.bottomSheetHandle} />
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              {title || t('bank.selectBank')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.bottomSheetClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.bottomSheetContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {searchable && (
              <TextInput
                style={styles.searchInput}
                placeholder={t('common.search')}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            )}

            {filteredBanks.length === 0 ? (
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>
                  {searchQuery ? t('bank.noResults') : t('bank.noBanks')}
                </Text>
              </View>
            ) : (
              filteredBanks.map((bank) => {
                const isSelected = selectedBank?.id === bank.id || selectedBank?.code === bank.code;
                return (
                  <TouchableOpacity
                    key={bank.id || bank.code}
                    style={[
                      styles.bankItem,
                      isSelected && styles.bankItemSelected,
                    ]}
                    onPress={() => handleSelect(bank)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.bankIcon, { backgroundColor: bank.color || colors.primary + '20' }]}>
                      <Text style={styles.bankIconText}>{bank.icon || '🏦'}</Text>
                    </View>
                    <Text style={styles.bankName}>{bank.name}</Text>
                    {isSelected && (
                      <Text style={[styles.bankCheck, { color: colors.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// CONFIRM DIALOG (shortcut para AlertPopup com confirmação)
// ═══════════════════════════════════════════════════════════

export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'warning',
  danger = false,
}) => {
  const { t } = useI18n();

  return (
    <AlertPopup
      visible={visible}
      title={title}
      message={message}
      type={type}
      buttons={[
        {
          text: cancelText || t('common.cancel'),
          onPress: onCancel,
          style: 'secondary',
        },
        {
          text: confirmText || t('common.confirm'),
          onPress: onConfirm,
          style: danger ? 'danger' : 'primary',
        },
      ]}
      onDismiss={onCancel}
    />
  );
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

export default {
  AlertPopup,
  Toast,
  ToastProvider,
  ToastManager,
  BankSelectorModal,
  ConfirmDialog,
};