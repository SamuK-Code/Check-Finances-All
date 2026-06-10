import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

const ExpenseListItem = memo(function ExpenseListItem({
  item, card, category, colors, t, onPress, onLongPress, onPay,
}) {
  const isPaid = item.paid === true;
  const isBill = item.isBill === true;
  const canPay = !isPaid && (isBill || !item.cardId);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onPress(item.id)}
      onLongPress={() => onLongPress && onLongPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: (category?.color || '#999') + '15' }]}>
        <Ionicons name={category?.icon || 'ellipsis-horizontal'} size={20} color={category?.color || '#999'} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.desc, {
          color: colors.text,
          textDecorationLine: isPaid ? 'line-through' : 'none',
          opacity: isPaid ? 0.6 : 1,
        }]}>
          {item.description}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.cat, { color: category?.color || '#999' }]}>{category?.name || 'Outros'}</Text>
          {isBill ? (
            <View style={[styles.badge, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="document-text-outline" size={10} color={colors.warning} />
              <Text style={[styles.badgeText, { color: colors.warning }]}>{t('bill')}</Text>
            </View>
          ) : card ? (
            <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="card-outline" size={10} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>{card?.customName || card?.name || ''}</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="receipt-outline" size={10} color={colors.warning} />
              <Text style={[styles.badgeText, { color: colors.warning }]}>{t('standalone')}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.date, { color: colors.textLight }]}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, {
          color: isPaid ? colors.textLight : colors.danger,
          textDecorationLine: isPaid ? 'line-through' : 'none',
        }]}>
          {formatCurrency(parseFloat(item.amount))}
        </Text>
        {canPay && onPay && (
          <TouchableOpacity style={[styles.payBtn, { backgroundColor: colors.success }]} onPress={() => onPay(item)}>
            <Text style={styles.payText}>{t('pay')}</Text>
          </TouchableOpacity>
        )}
        {isPaid && (
          <View style={[styles.paidBadge, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={10} color={colors.success} />
            <Text style={[styles.paidText, { color: colors.success }]}>{t('paid')}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 8 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  desc: { fontSize: 15, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 6 },
  cat: { fontSize: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 3 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  date: { fontSize: 11, marginTop: 4 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: 'bold' },
  payBtn: { marginTop: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  payText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  paidBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, gap: 3 },
  paidText: { fontSize: 10, fontWeight: '600' },
});

export default ExpenseListItem;
