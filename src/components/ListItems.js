// /src/components/ListItems.js
// Consolidates: CardItem + CashListItem + ExpenseListItem

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { Badge } from './Indicators';
import { formatCurrency, formatDateShort } from '../utils/ValidationUtils';

// ═══════════════════════════════════════════════════════════
// SHARED STYLES & HELPERS
// ═══════════════════════════════════════════════════════════

const useListStyles = () => {
  const { theme, isDark } = useTheme();
  const { t } = useI18n();

  return {
    theme,
    isDark,
    t,
    colors: theme.colors,
    styles: StyleSheet.create({
      // ─── Common Container ───
      itemContainer: {
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        ...theme.shadows.small,
      },
      itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      itemLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
      },
      itemRight: {
        alignItems: 'flex-end',
      },

      // ─── Typography ───
      title: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 2,
      },
      subtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
      },
      amount: {
        fontSize: 16,
        fontWeight: '700',
      },
      amountPositive: {
        color: theme.colors.success,
      },
      amountNegative: {
        color: theme.colors.danger,
      },
      amountNeutral: {
        color: theme.colors.text,
      },

      // ─── Progress Bar ───
      progressContainer: {
        height: 6,
        backgroundColor: isDark ? '#333' : '#E5E5EA',
        borderRadius: 3,
        marginTop: 10,
        overflow: 'hidden',
      },
      progressBar: {
        height: '100%',
        borderRadius: 3,
      },

      // ─── Badges Row ───
      badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 6,
      },

      // ─── Actions ───
      actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginLeft: 8,
      },
      actionButtonPrimary: {
        backgroundColor: theme.colors.primary,
      },
      actionButtonDanger: {
        backgroundColor: theme.colors.danger,
      },
      actionButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
      },
      iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: isDark ? '#333' : '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
      },

      // ─── Inline Edit ───
      inlineInput: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 14,
        color: theme.colors.text,
        backgroundColor: isDark ? '#1C1C1E' : '#FFF',
        minWidth: 100,
      },
      editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
      },

      // ─── Card Specific ───
      cardIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      },
      cardIconText: {
        fontSize: 18,
        fontWeight: '700',
      },
      cardLimitInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
      },
      cardLimitText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
      },

      // ─── Cash Specific ───
      cashTypeIndicator: {
        width: 4,
        height: '70%',
        borderRadius: 2,
        marginRight: 12,
      },
      cashTypeIn: {
        backgroundColor: theme.colors.success,
      },
      cashTypeOut: {
        backgroundColor: theme.colors.danger,
      },

      // ─── Expense Specific ───
      expenseCategoryDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
      },
      expenseStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
      },
      expenseStatusText: {
        fontSize: 12,
        marginLeft: 4,
      },

      // ─── Alert ───
      alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#3D2C00' : '#FFF3CD',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 8,
      },
      alertText: {
        fontSize: 12,
        color: isDark ? '#FFD60A' : '#856404',
        marginLeft: 6,
      },
    }),
  };
};

// ═══════════════════════════════════════════════════════════
// CARD ITEM
// ═══════════════════════════════════════════════════════════

export const CardItem = ({
  card,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { theme, colors, styles, t } = useListStyles();
  const [scaleAnim] = useState(new Animated.Value(1));

  const usagePercent = card.limit > 0 ? (card.currentBalance / card.limit) * 100 : 0;
  const isOverLimit = card.currentBalance > card.limit;
  const isNearLimit = usagePercent >= 80 && !isOverLimit;

  const getProgressColor = () => {
    if (isOverLimit) return colors.danger;
    if (isNearLimit) return colors.warning;
    return colors.primary;
  };

  const getCardColor = () => {
    const colorMap = {
      visa: '#1A1F71',
      mastercard: '#EB001B',
      amex: '#006FCF',
      default: colors.primary,
    };
    return colorMap[card.brand?.toLowerCase()] || colorMap.default;
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const cardColor = getCardColor();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.itemContainer}
      >
        <View style={styles.itemRow}>
          <View style={styles.itemLeft}>
            <View style={[styles.cardIconContainer, { backgroundColor: cardColor + '20' }]}>
              <Text style={[styles.cardIconText, { color: cardColor }]}>
                {card.brand?.[0]?.toUpperCase() || '💳'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {card.name}
              </Text>
              <Text style={styles.subtitle}>
                •••• {card.lastFour || '****'}
              </Text>
            </View>
          </View>
          <View style={styles.itemRight}>
            <Text style={[styles.amount, styles.amountNegative]}>
              {formatCurrency(card.currentBalance)}
            </Text>
            {showActions && (
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onEdit}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ fontSize: 16 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onDelete}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(usagePercent, 100)}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>

        {/* Limit Info */}
        <View style={styles.cardLimitInfo}>
          <Text style={styles.cardLimitText}>
            {t('card.used')}: {formatCurrency(card.currentBalance)}
          </Text>
          <Text style={styles.cardLimitText}>
            {t('card.limit')}: {formatCurrency(card.limit)}
          </Text>
        </View>

        {/* Alerts */}
        {isOverLimit && (
          <View style={styles.alertBanner}>
            <Text style={{ fontSize: 14 }}>⚠️</Text>
            <Text style={styles.alertText}>
              {t('card.overLimitAlert')}
            </Text>
          </View>
        )}
        {isNearLimit && !isOverLimit && (
          <View style={[styles.alertBanner, { backgroundColor: isDark ? '#3D2C00' : '#FFF3CD' }]}>
            <Text style={{ fontSize: 14 }}>⚡</Text>
            <Text style={styles.alertText}>
              {t('card.nearLimitAlert', { percent: Math.round(usagePercent) })}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// CASH LIST ITEM
// ═══════════════════════════════════════════════════════════

export const CashListItem = ({
  item,
  onPress,
  onEdit,
  onDelete,
  editable = false,
}) => {
  const { theme, colors, styles, t } = useListStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(item.amount || ''));

  const isIncome = item.type === 'income' || item.amount > 0;
  const amount = Math.abs(item.amount || 0);

  const handleSave = () => {
    const newAmount = parseFloat(editValue.replace(',', '.'));
    if (!isNaN(newAmount) && onEdit) {
      onEdit({ ...item, amount: isIncome ? Math.abs(newAmount) : -Math.abs(newAmount) });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(item.amount || ''));
    setIsEditing(false);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.itemContainer}
    >
      <View style={styles.itemRow}>
        <View style={styles.itemLeft}>
          <View
            style={[
              styles.cashTypeIndicator,
              isIncome ? styles.cashTypeIn : styles.cashTypeOut,
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {item.description || t('cash.noDescription')}
            </Text>
            <Text style={styles.subtitle}>
              {formatDateShort(item.date)} • {item.category || t('cash.noCategory')}
            </Text>
          </View>
        </View>
        <View style={styles.itemRight}>
          {isEditing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.inlineInput}
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="decimal-pad"
                autoFocus
                selectTextOnFocus
              />
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={handleSave}
              >
                <Text style={styles.actionButtonText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.textSecondary }]}
                onPress={handleCancel}
              >
                <Text style={styles.actionButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.amount,
                  isIncome ? styles.amountPositive : styles.amountNegative,
                ]}
              >
                {isIncome ? '+' : '-'}{formatCurrency(amount)}
              </Text>
              {editable && (
                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setIsEditing(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={{ fontSize: 16 }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onDelete}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// EXPENSE LIST ITEM
// ═══════════════════════════════════════════════════════════

export const ExpenseListItem = ({
  expense,
  onPress,
  onPay,
  onEdit,
  onDelete,
  showPayButton = true,
}) => {
  const { theme, colors, styles, t } = useListStyles();

  const isPaid = expense.status === 'paid' || expense.paid;
  const isOverdue = expense.dueDate && new Date(expense.dueDate) < new Date() && !isPaid;

  const getStatusConfig = () => {
    if (isPaid) return { icon: '✅', color: colors.success, label: t('expense.paid') };
    if (isOverdue) return { icon: '❌', color: colors.danger, label: t('expense.overdue') };
    return { icon: '⏳', color: colors.warning, label: t('expense.pending') };
  };

  const statusConfig = getStatusConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.itemContainer}
    >
      <View style={styles.itemRow}>
        <View style={styles.itemLeft}>
          <View
            style={[
              styles.expenseCategoryDot,
              { backgroundColor: expense.categoryColor || colors.primary },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {expense.description || t('expense.noDescription')}
            </Text>
            <View style={styles.expenseStatusRow}>
              <Text style={{ fontSize: 14 }}>{statusConfig.icon}</Text>
              <Text style={[styles.expenseStatusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
              {expense.dueDate && (
                <Text style={styles.subtitle}>
                  {' • '}{formatDateShort(expense.dueDate)}
                </Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={[styles.amount, styles.amountNegative]}>
            {formatCurrency(expense.amount)}
          </Text>
          <View style={styles.badgesRow}>
            {expense.isRecurring && (
              <Badge
                text={t('expense.recurring')}
                type="info"
                size="small"
              />
            )}
            {expense.isFixed && (
              <Badge
                text={t('expense.fixed')}
                type="secondary"
                size="small"
              />
            )}
            {expense.cardName && (
              <Badge
                text={expense.cardName}
                type="outline"
                size="small"
              />
            )}
          </View>
          <View style={{ flexDirection: 'row', marginTop: 8, justifyContent: 'flex-end' }}>
            {!isPaid && showPayButton && onPay && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={onPay}
              >
                <Text style={styles.actionButtonText}>
                  {t('expense.pay')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onEdit}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT (re-export all)
// ═══════════════════════════════════════════════════════════

export default {
  CardItem,
  CashListItem,
  ExpenseListItem,
};