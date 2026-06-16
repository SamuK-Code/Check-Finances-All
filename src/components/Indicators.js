// /src/components/Indicators.js
// Consolidates: Badge (enhanced) + LoadingSpinner + EmptyState + ErrorState + OfflineBanner + DotIndicator

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';

// ═══════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════

const useIndicatorStyles = () => {
  const { theme, isDark } = useTheme();

  return {
    theme,
    isDark,
    colors: theme.colors,
    styles: StyleSheet.create({
      // ─── Badge ───
      badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
      },
      badgeSmall: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
      },
      badgeLarge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 14,
      },
      badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
      },
      badgeTextSmall: {
        fontSize: 10,
      },
      badgeTextLarge: {
        fontSize: 14,
      },
      badgeOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
      },

      // ─── Loading Spinner ───
      spinnerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      spinnerText: {
        marginTop: 12,
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
      },
      spinnerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
      },
      spinnerBox: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        ...theme.shadows.large,
      },

      // ─── Empty State ───
      emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
      },
      emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
      },
      emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
      },
      emptyMessage: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
      },

      // ─── Error State ───
      errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
      },
      errorIcon: {
        fontSize: 56,
        marginBottom: 16,
      },
      errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.danger,
        textAlign: 'center',
        marginBottom: 8,
      },
      errorMessage: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
      },

      // ─── Offline Banner ───
      offlineContainer: {
        backgroundColor: theme.colors.warning + '18',
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      offlineText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.warning,
        marginLeft: 8,
      },

      // ─── Dot Indicator ───
      dotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
      },
      dotActive: {
        width: 20,
        borderRadius: 4,
      },

      // ─── Step Indicator ───
      stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 24,
      },
      stepItem: {
        flex: 1,
        alignItems: 'center',
      },
      stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
      },
      stepCircleActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      stepCircleCompleted: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
      },
      stepCirclePending: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.textSecondary,
      },
      stepText: {
        fontSize: 14,
        fontWeight: '700',
      },
      stepTextActive: {
        color: '#FFF',
      },
      stepTextCompleted: {
        color: '#FFF',
      },
      stepTextPending: {
        color: theme.colors.textSecondary,
      },
      stepLabel: {
        fontSize: 11,
        marginTop: 6,
        fontWeight: '500',
      },
      stepConnector: {
        flex: 1,
        height: 2,
        marginHorizontal: 4,
      },
    }),
  };
};

// ═══════════════════════════════════════════════════════════
// BADGE (Enhanced)
// ═══════════════════════════════════════════════════════════

export const Badge = ({
  text,
  type = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline'
  size = 'normal', // 'small' | 'normal' | 'large'
  style,
  textStyle,
}) => {
  const { colors, styles } = useIndicatorStyles();

  const getColors = () => {
    switch (type) {
      case 'success': return { bg: colors.success, text: '#FFF' };
      case 'warning': return { bg: colors.warning, text: '#FFF' };
      case 'danger': return { bg: colors.danger, text: '#FFF' };
      case 'info': return { bg: colors.info || colors.primary, text: '#FFF' };
      case 'secondary': return { bg: isDark ? '#3A3A3C' : '#E5E5EA', text: colors.text };
      case 'outline': return { bg: 'transparent', text: colors.primary, border: colors.primary };
      default: return { bg: colors.primary, text: '#FFF' };
    }
  };

  const colorConfig = getColors();
  const isOutline = type === 'outline';

  return (
    <View
      style={[
        styles.badge,
        size === 'small' && styles.badgeSmall,
        size === 'large' && styles.badgeLarge,
        isOutline && [styles.badgeOutline, { borderColor: colorConfig.border }],
        !isOutline && { backgroundColor: colorConfig.bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          size === 'small' && styles.badgeTextSmall,
          size === 'large' && styles.badgeTextLarge,
          { color: colorConfig.text },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// LOADING SPINNER
// ═══════════════════════════════════════════════════════════

export const LoadingSpinner = ({
  size = 'normal',
  color,
  text,
  overlay = false,
  style,
}) => {
  const { colors, styles } = useIndicatorStyles();

  const indicatorSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'large';
  const spinnerColor = color || colors.primary;

  if (overlay) {
    return (
      <View style={[styles.spinnerOverlay, style]}>
        <View style={styles.spinnerBox}>
          <ActivityIndicator size={indicatorSize} color={spinnerColor} />
          {text && <Text style={styles.spinnerText}>{text}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.spinnerContainer, style]}>
      <ActivityIndicator size={indicatorSize} color={spinnerColor} />
      {text && <Text style={styles.spinnerText}>{text}</Text>}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════

export const EmptyState = ({
  icon = '📭',
  title,
  message,
  style,
}) => {
  const { styles } = useIndicatorStyles();
  const { t } = useI18n();

  return (
    <View style={[styles.emptyContainer, style]}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>
        {title || t('empty.title')}
      </Text>
      {message && (
        <Text style={styles.emptyMessage}>{message}</Text>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// ERROR STATE
// ═══════════════════════════════════════════════════════════

export const ErrorState = ({
  icon = '⚠️',
  title,
  message,
  style,
}) => {
  const { styles } = useIndicatorStyles();
  const { t } = useI18n();

  return (
    <View style={[styles.errorContainer, style]}>
      <Text style={styles.errorIcon}>{icon}</Text>
      <Text style={styles.errorTitle}>
        {title || t('error.title')}
      </Text>
      {message && (
        <Text style={styles.errorMessage}>{message}</Text>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// OFFLINE BANNER
// ═══════════════════════════════════════════════════════════

export const OfflineBanner = ({
  message,
  style,
}) => {
  const { styles } = useIndicatorStyles();
  const { t } = useI18n();

  return (
    <View style={[styles.offlineContainer, style]}>
      <Text style={{ fontSize: 14 }}>📡</Text>
      <Text style={styles.offlineText}>
        {message || t('offline.message')}
      </Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// DOT INDICATOR (pagination, onboarding)
// ═══════════════════════════════════════════════════════════

export const DotIndicator = ({
  total,
  current,
  color,
  inactiveColor,
  size = 8,
  style,
}) => {
  const { colors, styles } = useIndicatorStyles();

  const activeColor = color || colors.primary;
  const inactColor = inactiveColor || (isDark ? '#444' : '#D1D1D6');

  return (
    <View style={[styles.dotContainer, style]}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: isActive ? size * 2.5 : size,
                height: size,
                backgroundColor: isActive ? activeColor : inactColor,
              },
              isActive && styles.dotActive,
            ]}
          />
        );
      })}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// STEP INDICATOR (wizard, forms multi-step)
// ═══════════════════════════════════════════════════════════

export const StepIndicator = ({
  steps = [],
  currentStep = 0,
  style,
}) => {
  const { colors, styles } = useIndicatorStyles();

  return (
    <View style={[styles.stepContainer, style]}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isCompleted && styles.stepCircleCompleted,
                  !isActive && !isCompleted && styles.stepCirclePending,
                ]}
              >
                <Text
                  style={[
                    styles.stepText,
                    isActive && styles.stepTextActive,
                    isCompleted && styles.stepTextCompleted,
                    !isActive && !isCompleted && styles.stepTextPending,
                  ]}
                >
                  {isCompleted ? '✓' : index + 1}
                </Text>
              </View>
              {step.label && (
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: isActive
                        ? colors.primary
                        : isCompleted
                        ? colors.success
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {step.label}
                </Text>
              )}
            </View>
            {!isLast && (
              <View
                style={[
                  styles.stepConnector,
                  {
                    backgroundColor: isCompleted
                      ? colors.success
                      : isDark
                      ? '#333'
                      : '#E5E5EA',
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

export default {
  Badge,
  LoadingSpinner,
  EmptyState,
  ErrorState,
  OfflineBanner,
  DotIndicator,
  StepIndicator,
};