import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const CardItem = memo(function CardItem({
  card, usage, colors, t, onPress, onEdit, onDelete,
}) {
  const remaining = card.limit - usage;
  const pct = card.limit > 0 ? (usage / card.limit) * 100 : 0;
  const isPaused = card.isPaused || false;
  const billAmount = card.currentBillAmount || 0;

  return (
    <TouchableOpacity
      style={[styles.container, {
        backgroundColor: colors.card,
        borderLeftColor: isPaused ? colors.warning : card.color || colors.primary,
      }]}
      onPress={() => onPress(card)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.icon, { backgroundColor: (card.color || colors.primary) + '15' }]}>
            <Ionicons name={card.icon || 'card'} size={22} color={card.color || colors.primary} />
          </View>
          <View style={styles.titleInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{card.customName || card.name}</Text>
            <Text style={[styles.limit, { color: colors.textLight }]}>
              {t('limit')}: {formatCurrency(card.limit)}
              {card.dueDate ? ` • ${t('dueDateShort')}: ${card.dueDate}` : ''}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]} onPress={() => onEdit(card)}>
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger + '15' }]} onPress={() => onDelete(card)}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {isPaused && (
        <View style={[styles.pausedBadge, { backgroundColor: colors.warning + '15' }]}>
          <Ionicons name="pause-circle" size={14} color={colors.warning} />
          <Text style={[styles.pausedText, { color: colors.warning }]}>
            {t('cardPaused')} • {t('billAmount')}: {formatCurrency(billAmount)}
          </Text>
        </View>
      )}

      <View style={styles.usageSection}>
        <View style={styles.usageRow}>
          <Text style={[styles.usageLabel, { color: colors.textLight }]}>{t('used')}</Text>
          <Text style={[styles.usageValue, { color: colors.text }]}>{formatCurrency(usage)}</Text>
        </View>
        <View style={styles.usageRow}>
          <Text style={[styles.usageLabel, { color: colors.textLight }]}>{t('available')}</Text>
          <Text style={[styles.usageValue, { color: colors.text }]}>{formatCurrency(remaining)}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, {
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: pct >= 100 ? colors.danger : pct >= 80 ? colors.warning : colors.primary,
          }]} />
        </View>
        <Text style={[styles.progressText, {
          color: pct >= 100 ? colors.danger : pct >= 80 ? colors.warning : colors.primary,
        }]}>
          {pct.toFixed(1)}% {t('used')}
        </Text>
      </View>

      {pct >= 100 && (
        <View style={[styles.alertBadge, { backgroundColor: colors.danger + '15' }]}>
          <Ionicons name="warning" size={12} color={colors.danger} />
          <Text style={[styles.alertText, { color: colors.danger }]}>{t('limitExceeded')}</Text>
        </View>
      )}
      {pct >= 80 && pct < 100 && (
        <View style={[styles.alertBadge, { backgroundColor: colors.warning + '15' }]}>
          <Ionicons name="alert-circle" size={12} color={colors.warning} />
          <Text style={[styles.alertText, { color: colors.warning }]}>{t('nearLimit')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 18, borderLeftWidth: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  titleInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  limit: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  pausedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 10, alignSelf: 'flex-start', gap: 6 },
  pausedText: { fontSize: 12, fontWeight: '600' },
  usageSection: { marginBottom: 10 },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  usageLabel: { fontSize: 13 },
  usageValue: { fontSize: 13, fontWeight: '600' },
  progressSection: { marginTop: 4 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, fontWeight: '600', textAlign: 'right' },
  alertBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 10, alignSelf: 'flex-start', gap: 6 },
  alertText: { fontSize: 12, fontWeight: '600' },
});

export default CardItem;
