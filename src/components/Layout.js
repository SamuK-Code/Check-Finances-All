// /src/components/Layout.js
// Screen wrappers, dividers, spacers, empty states, section headers

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════

const useLayoutStyles = () => {
  const { theme, isDark } = useTheme();

  return {
    theme,
    isDark,
    colors: theme.colors,
    styles: StyleSheet.create({
      // ─── Screen Wrapper ───
      screen: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      screenContent: {
        flex: 1,
      },
      screenPadded: {
        paddingHorizontal: 16,
      },

      // ─── Section Header ───
      sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 12,
      },
      sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
      },
      sectionSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
      },
      sectionAction: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
      },

      // ─── Divider ───
      divider: {
        height: 1,
        backgroundColor: isDark ? '#333' : '#E5E5EA',
        marginHorizontal: 16,
      },
      dividerVertical: {
        width: 1,
        backgroundColor: isDark ? '#333' : '#E5E5EA',
      },
      dividerDashed: {
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#E5E5EA',
        marginHorizontal: 16,
      },

      // ─── Spacer ───
      spacer: {
        backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
      },

      // ─── Empty State ───
      emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
      },
      emptyStateIcon: {
        fontSize: 64,
        marginBottom: 20,
      },
      emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
      },
      emptyStateMessage: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
      },
      emptyStateAction: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
      },
      emptyStateActionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
      },

      // ─── Error State ───
      errorState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
      },
      errorStateIcon: {
        fontSize: 56,
        marginBottom: 16,
      },
      errorStateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.danger,
        textAlign: 'center',
        marginBottom: 8,
      },
      errorStateMessage: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
      },
      errorStateRetry: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        backgroundColor: theme.colors.danger,
        borderRadius: 12,
      },
      errorStateRetryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
      },

      // ─── Offline Banner ───
      offlineBanner: {
        backgroundColor: theme.colors.warning + '20',
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      offlineBannerText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.warning,
        marginLeft: 8,
      },

      // ─── Loading Overlay ───
      loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
      },
      loadingBox: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        ...theme.shadows.large,
      },
      loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
      },

      // ─── Chip Row ───
      chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 12,
      },
      chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      },
      chipActive: {
        backgroundColor: theme.colors.primary + '20',
      },
      chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.textSecondary,
      },
      chipTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
      },

      // ─── Info Row ───
      infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      infoRowLabel: {
        fontSize: 15,
        color: theme.colors.textSecondary,
      },
      infoRowValue: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
      },

      // ─── Bottom Fixed Button ───
      bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.card,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: isDark ? '#333' : '#E5E5EA',
        ...theme.shadows.small,
      },
      bottomButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
      },
      bottomButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
      },
      bottomButtonDisabled: {
        opacity: 0.5,
      },
    }),
  };
};

// ═══════════════════════════════════════════════════════════
// SCREEN
// ═══════════════════════════════════════════════════════════

export const Screen = ({
  children,
  style,
  contentContainerStyle,
  scrollable = true,
  refreshing,
  onRefresh,
  keyboardAware = false,
  padded = false,
}) => {
  const { styles } = useLayoutStyles();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.screenContent, padded && styles.screenPadded, contentContainerStyle]}>
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <View style={[styles.screen, style]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {content}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, style]}>
      {content}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// SECTION HEADER
// ═══════════════════════════════════════════════════════════

export const SectionHeader = ({
  title,
  subtitle,
  actionText,
  onAction,
  style,
}) => {
  const { styles } = useLayoutStyles();

  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {actionText && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// DIVIDER
// ═══════════════════════════════════════════════════════════

export const Divider = ({ vertical = false, dashed = false, style }) => {
  const { styles } = useLayoutStyles();

  if (dashed) {
    return <View style={[styles.dividerDashed, style]} />;
  }

  if (vertical) {
    return <View style={[styles.dividerVertical, style]} />;
  }

  return <View style={[styles.divider, style]} />;
};

// ═══════════════════════════════════════════════════════════
// SPACER
// ═══════════════════════════════════════════════════════════

export const Spacer = ({ size = 16, horizontal = false, style }) => {
  const { styles } = useLayoutStyles();

  return (
    <View
      style={[
        styles.spacer,
        horizontal
          ? { width: size, height: 1 }
          : { height: size, width: '100%' },
        style,
      ]}
    />
  );
};

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════

export const EmptyState = ({
  icon = '📭',
  title,
  message,
  actionText,
  onAction,
  style,
}) => {
  const { styles } = useLayoutStyles();
  const { t } = useI18n();

  return (
    <View style={[styles.emptyState, style]}>
      <Text style={styles.emptyStateIcon}>{icon}</Text>
      <Text style={styles.emptyStateTitle}>
        {title || t('empty.title')}
      </Text>
      {message && (
        <Text style={styles.emptyStateMessage}>{message}</Text>
      )}
      {actionText && (
        <TouchableOpacity
          style={styles.emptyStateAction}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyStateActionText}>{actionText}</Text>
        </TouchableOpacity>
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
  onRetry,
  style,
}) => {
  const { styles } = useLayoutStyles();
  const { t } = useI18n();

  return (
    <View style={[styles.errorState, style]}>
      <Text style={styles.errorStateIcon}>{icon}</Text>
      <Text style={styles.errorStateTitle}>
        {title || t('error.title')}
      </Text>
      {message && (
        <Text style={styles.errorStateMessage}>{message}</Text>
      )}
      {onRetry && (
        <TouchableOpacity
          style={styles.errorStateRetry}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.errorStateRetryText}>
            {t('common.retry')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// OFFLINE BANNER
// ═══════════════════════════════════════════════════════════

export const OfflineBanner = ({ message, style }) => {
  const { styles } = useLayoutStyles();
  const { t } = useI18n();

  return (
    <View style={[styles.offlineBanner, style]}>
      <Text style={{ fontSize: 14 }}>📡</Text>
      <Text style={styles.offlineBannerText}>
        {message || t('offline.message')}
      </Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// LOADING OVERLAY
// ═══════════════════════════════════════════════════════════

export const LoadingOverlay = ({ visible, message, style }) => {
  const { styles } = useLayoutStyles();

  if (!visible) return null;

  return (
    <View style={[styles.loadingOverlay, style]}>
      <View style={styles.loadingBox}>
        <Text style={{ fontSize: 32 }}>⏳</Text>
        {message && <Text style={styles.loadingText}>{message}</Text>}
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// CHIP ROW
// ═══════════════════════════════════════════════════════════

export const ChipRow = ({
  chips = [],
  selectedChip,
  onSelect,
  style,
}) => {
  const { styles } = useLayoutStyles();

  return (
    <View style={[styles.chipRow, style]}>
      {chips.map((chip) => {
        const isActive = selectedChip === chip.id;
        return (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect?.(chip.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// INFO ROW
// ═══════════════════════════════════════════════════════════

export const InfoRow = ({ label, value, style }) => {
  const { styles } = useLayoutStyles();

  return (
    <View style={[styles.infoRow, style]}>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={styles.infoRowValue}>{value}</Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// BOTTOM FIXED BUTTON
// ═══════════════════════════════════════════════════════════

export const BottomFixedButton = ({
  title,
  onPress,
  disabled = false,
  style,
}) => {
  const { styles } = useLayoutStyles();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom + 16 }, style]}>
      <TouchableOpacity
        style={[
          styles.bottomButton,
          disabled && styles.bottomButtonDisabled,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={styles.bottomButtonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

export default {
  Screen,
  SectionHeader,
  Divider,
  Spacer,
  EmptyState,
  ErrorState,
  OfflineBanner,
  LoadingOverlay,
  ChipRow,
  InfoRow,
  BottomFixedButton,
};