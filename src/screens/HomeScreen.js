// HomeScreen.js — COM FATURAS PENDENTES NO RESUMO

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslate } from '../hooks/useTranslate';
import { formatCurrency, getGreeting } from '../utils/helpers';
import CreditCard from '../components/CreditCard';
import TransactionItem from '../components/TransactionItem';
import Toast from '../components/Toast';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { cards, transactions, getBalance, getCardUsage, notifications, cardInvoices, getCardPendingInvoices } = useApp();
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslate();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [refreshing, setRefreshing] = useState(false);

  const { income, expense, balance } = getBalance();
  const unreadCount = notifications.filter(n => !n.read).length;

  const recentTransactions = [...transactions].slice(-5).reverse();

  // NOVO: Total de faturas pendentes
  const totalPendingInvoices = cardInvoices.filter(inv => inv.status === 'pending').length;
  const totalPendingAmount = cardInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleDarkMode}>
              <Ionicons name={darkMode ? 'sunny' : 'moon'} size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications" size={20} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance destacado */}
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>{t('home.balance')}</Text>
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
        </View>

        {/* NOVO: Alerta de faturas pendentes */}
        {totalPendingInvoices > 0 && (
          <TouchableOpacity 
            style={styles.invoiceAlert}
            onPress={() => navigation.navigate('Cards')}
          >
            <Ionicons name="document-text" size={16} color="#FFFFFF" />
            <Text style={styles.invoiceAlertText}>
              {totalPendingInvoices} fatura(s) pendente(s): {formatCurrency(totalPendingAmount)}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Greeting */}
        <View style={styles.greetingBox}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.greetingSub}>{t('greetingSub')}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Cards Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              <Ionicons name="card" size={18} color={colors.primary} />  {t('home.myCards')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cards')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>{t('home.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardScroll}>
            {cards.length > 0 ? (
              cards.map(card => (
                <View key={card.id} style={styles.cardItem}>
                  <CreditCard 
                    card={card} 
                    used={getCardUsage(card.id)} 
                    compact 
                    pendingInvoices={getCardPendingInvoices(card.id).length}
                  />
                </View>
              ))
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: colors.bgCard }]}>
                <Ionicons name="card-outline" size={32} color={colors.textMuted} />
                <Text style={[styles.emptyCardText, { color: colors.textMuted }]}>{t('home.noCards')}</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Transactions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            <Ionicons name="time" size={18} color={colors.primary} />  {t('home.recentTransactions')}
          </Text>

          {recentTransactions.length > 0 ? (
            recentTransactions.map(t => (
              <TransactionItem 
                key={t.id} 
                transaction={t} 
                onPress={() => {
                  showToast(`${t.desc} - ${formatCurrency(t.amount)}`, 'info');
                }}
              />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.bgCard }]}>
              <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('home.noTransactions')}</Text>
            </View>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <Toast {...toast} onHide={() => setToast({ ...toast, visible: false })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24 
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'relative' 
  },
  badge: { 
    position: 'absolute', 
    top: -2, 
    right: -2, 
    backgroundColor: '#EF4444', 
    borderRadius: 10, 
    minWidth: 18, 
    height: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 4 
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

  balanceBox: { marginBottom: 12 },
  balanceLabel: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 13, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  balanceValue: { 
    color: '#FFFFFF', 
    fontSize: 32, 
    fontWeight: '700', 
    letterSpacing: -0.5 
  },

  // NOVO: Alerta de faturas pendentes
  invoiceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  invoiceAlertText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  greetingBox: { marginTop: 4 },
  greetingText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '600' 
  },
  greetingSub: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 13, 
    marginTop: 2 
  },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  section: { marginBottom: 24 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },

  cardScroll: { paddingRight: 16 },
  cardItem: { marginRight: 12 },

  emptyCard: { 
    width: 200, 
    height: 120, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.05)', 
    borderStyle: 'dashed' 
  },
  emptyCardText: { fontSize: 12, fontWeight: '500', marginTop: 8 },

  emptyState: { 
    alignItems: 'center', 
    padding: 30, 
    borderRadius: 16, 
    marginTop: 8 
  },
  emptyText: { fontSize: 14, fontWeight: '500', marginTop: 8 },
});

export default HomeScreen;