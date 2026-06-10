import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatCard = memo(function StatCard({ icon, iconColor, bgColor, label, value, colors }) {
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: colors.textLight }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 12, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: 'bold' },
});

export default StatCard;
