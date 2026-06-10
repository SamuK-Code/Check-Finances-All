import React, { memo } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

const CashListItem = memo(function CashListItem({
  item, colors, isEditing, editAmountDisplay, editDesc, editDate,
  onPress, onLongPress, onSave, onCancel, onAmountChange, onDescChange, onDateChange, t,
}) {
  if (isEditing) {
    return (
      <View style={[styles.editForm, { backgroundColor: colors.card }]}>
        <Text style={[styles.editTitle, { color: colors.text }]}>{t('editCash')}</Text>
        <View style={[styles.prevBox, { backgroundColor: colors.danger + '10' }]}>
          <Text style={[styles.prevLabel, { color: colors.danger }]}>{t('previousValue')}</Text>
          <Text style={[styles.prevValue, { color: colors.danger }]}>{formatCurrency(parseFloat(item.amount))}</Text>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          value={editAmountDisplay}
          onChangeText={onAmountChange}
          placeholder={t('newValue')}
          placeholderTextColor={colors.textLight}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          value={editDesc}
          onChangeText={onDescChange}
          placeholder={t('description')}
          placeholderTextColor={colors.textLight}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          value={editDate}
          onChangeText={onDateChange}
          placeholder={t('date')}
          placeholderTextColor={colors.textLight}
        />
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]} onPress={onSave}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.btnText}>{t('save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.danger }]} onPress={onCancel}>
            <Ionicons name="close" size={18} color="#fff" />
            <Text style={styles.btnText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress && onLongPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.success + '15' }]}>
        <Ionicons name="cash" size={20} color={colors.success} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.desc, { color: colors.text }]}>{item.description}</Text>
        <Text style={[styles.cat, { color: colors.textLight }]}>{t('cash')}</Text>
        <Text style={[styles.date, { color: colors.textLight }]}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.success }]}>+ {formatCurrency(parseFloat(item.amount))}</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, marginBottom: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  desc: { fontSize: 15, fontWeight: '600' },
  cat: { fontSize: 12, marginTop: 4 },
  date: { fontSize: 11, marginTop: 4 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: 'bold' },
  editForm: { padding: 16, borderRadius: 14, marginBottom: 10 },
  editTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  prevBox: { padding: 12, borderRadius: 10, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prevLabel: { fontSize: 12, fontWeight: '600' },
  prevValue: { fontSize: 16, fontWeight: 'bold' },
  input: { borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, gap: 6 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default CashListItem;
