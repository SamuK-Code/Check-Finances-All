import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '../context/ExpenseContext';
import { useCash } from '../context/CashContext';
import { usePlanning } from '../context/PlanningContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { useExpenseStats } from '../hooks/useExpenseStats';
import AppHeader from '../components/AppHeader';
import StatCard from '../components/StatCard';
import ExpenseListItem from '../components/ExpenseListItem';

const { width } = Dimensions.get('window');

const Greeting = React.memo(function Greeting({ t, colors }) {
  const hour = new Date().getHours();
  let text = t('evening');
  if (hour < 12) text = t('morning');
  else if (hour < 18) text = t('afternoon');
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.greeting, { color: colors.text }]}>{text}</Text>
      <Text style={[styles.greetingSub, { color: colors.textLight }]}>{t('overview')}</Text>
    </View>
  );
});

const CashBanner = React.memo(function CashBanner({ value, colors, t }) {
  const fmt = useMemo(() =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
  [value]);
  return (
    <View style={[styles.cashCard, { backgroundColor: colors.primary }]}>
      <View style={styles.cashRow}>
        <View>
          <Text style={styles.cashLabel}>{t('availableCash')}</Text>
          <Text style={styles.cashValue}>{fmt}</Text>
        </View>
        <View style={styles.cashIcon}>
          <Ionicons name="wallet" size={28} color="#fff" />
        </View>
      </View>
    </View>
  );
});

const UnpaidBanner = React.memo(function UnpaidBanner({ count, total, colors, t }) {
  const fmt = useMemo(() =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total),
  [total]);
  return (
    <View style={[styles.unpaidCard, { backgroundColor: colors.danger + '10' }]}>
      <View style={styles.unpaidHeader}>
        <Ionicons name="warning" size={20} color={colors.danger} />
        <Text style={[styles.unpaidTitle, { color: colors.danger }]}>
          {count} {count === 1 ? t('unpaidExpense') : t('unpaidExpenses')}
        </Text>
      </View>
      <Text style={[styles.unpaidAmount, { color: colors.danger }]}>{t('total')}: {fmt}</Text>
    </View>
  );
});

const CardCarousel = React.memo(function CardCarousel({ cards, colors, t, onNavigate }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('myCards')}</Text>
        <TouchableOpacity onPress={() => onNavigate('Cards')}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>{t('seeAll')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={cards}
        keyExtractor={c => c.id}
        renderItem={({ item: card }) => (
          <View style={[styles.cardItem, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: (card.color || colors.primary) + '15' }]}>
                <Ionicons name={card.icon || 'card'} size={22} color={card.color || colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colors.text }]}>{card.customName || card.name}</Text>
                <Text style={[styles.cardLimit, { color: colors.textLight }]}>
                  {t('limit')}: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit)}
                </Text>
              </View>
            </View>
            <View style={styles.cardUsageSection}>
              <View style={styles.cardUsageRow}>
                <Text style={[styles.cardUsageLabel, { color: colors.textLight }]}>{t('used')}</Text>
                <Text style={[styles.cardUsageValue, { color: colors.text }]}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.usage)}
                </Text>
              </View>
              <View style={styles.cardUsageRow}>
                <Text style={[styles.cardUsageLabel, { color: colors.textLight }]}>{t('available')}</Text>
                <Text style={[styles.cardUsageValue, { color: colors.primary }]}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.max(0, card.limit - card.usage))}
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${Math.min(card.percentage, 100)}%`,
                backgroundColor: card.percentage >= 100 ? colors.danger : card.percentage >= 80 ? colors.warning : colors.primary,
              }]} />
            </View>
            <Text style={[styles.progressText, {
              color: card.percentage >= 100 ? colors.danger : card.percentage >= 80 ? colors.warning : colors.primary,
            }]}>
              {card.percentage.toFixed(1)}% {t('used')}
            </Text>
            {card.percentage >= 100 && (
              <View style={[styles.cardAlert, { backgroundColor: colors.danger + '15' }]}>
                <Ionicons name="warning" size={12} color={colors.danger} />
                <Text style={[styles.cardAlertText, { color: colors.danger }]}>{t('limitExceeded')}</Text>
              </View>
            )}
            {card.percentage >= 80 && card.percentage < 100 && (
              <View style={[styles.cardAlert, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="alert-circle" size={12} color={colors.warning} />
                <Text style={[styles.cardAlertText, { color: colors.warning }]}>{t('nearLimit')}</Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
});

const TopCategories = React.memo(function TopCategories({ categories, monthTotal, colors, t, getCategoryInfo, onNavigate }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('topCategories')}</Text>
        <TouchableOpacity onPress={() => onNavigate('Charts')}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>{t('seeAll')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.categoriesList}>
        {categories.map(([catId, amount]) => {
          const cat = getCategoryInfo(catId);
          return (
            <View key={catId} style={[styles.categoryItem, { backgroundColor: colors.card }]}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                <Ionicons name={cat.icon} size={18} color={cat.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
                <Text style={[styles.categoryAmount, { color: colors.textLight }]}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                </Text>
              </View>
              <View style={styles.categoryBar}>
                <View style={[styles.categoryBarFill, {
                  width: `${Math.min((amount / monthTotal) * 100, 100)}%`,
                  backgroundColor: cat.color,
                }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const GoalsPreview = React.memo(function GoalsPreview({ goals, colors, t, onNavigate }) {
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('goals')}</Text>
        <TouchableOpacity onPress={() => onNavigate('Planning')}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>{t('seeAll')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.goalsList}>
        {goals.slice(0, 3).map(goal => (
          <View key={goal.id} style={[styles.goalItem, { backgroundColor: colors.card }]}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
              <Text style={[styles.goalAmount, { color: colors.textLight }]}>
                {fmt(goal.currentAmount || 0)} / {fmt(goal.targetAmount)}
              </Text>
            </View>
            <View style={styles.goalProgress}>
              <View style={styles.goalProgressBar}>
                <View style={[styles.goalProgressFill, {
                  width: `${Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100)}%`,
                  backgroundColor: goal.completed ? colors.success : colors.primary,
                }]} />
              </View>
              <Text style={[styles.goalProgressText, { color: colors.textLight }]}>
                {((goal.currentAmount || 0) / goal.targetAmount * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

export default function DashboardScreen({ navigation }) {
  const { expenses, cards, CATEGORIES, toggleExpensePaid, payBill } = useExpenses();
  const { cashBalance, addCashTransaction } = useCash();
  const { goals } = usePlanning();
  const { colors } = useTheme();
  const { t } = useI18n();

  const [showAll, setShowAll] = useState(false);

  const stats = useExpenseStats(expenses, cards, CATEGORIES);
  const recentExpenses = useMemo(() => expenses.slice(0, showAll ? expenses.length : 5), [expenses, showAll]);

  const handlePay = useCallback((expense) => {
    if (expense.isBill) {
      addCashTransaction(expense.amount, 'expense', {
        description: 'Pagamento: ' + expense.description,
        date: new Date().toISOString().split('T')[0],
      });
      payBill(expense.id);
    } else if (!expense.cardId) {
      toggleExpensePaid(expense.id);
    }
  }, [addCashTransaction, payBill, toggleExpensePaid]);

  const handleNavigate = useCallback((screen) => navigation.navigate(screen), [navigation]);

  const renderExpense = useCallback(({ item }) => (
    <ExpenseListItem
      item={item}
      card={cards.find(c => c.id === item.cardId)}
      category={stats.getCategoryInfo(item.category)}
      colors={colors}
      t={t}
      onPress={(id) => navigation.navigate('EditExpense', { expenseId: id })}
      onPay={handlePay}
    />
  ), [cards, colors, t, stats.getCategoryInfo, navigation, handlePay]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title={t('dashboard')} />
      <FlatList
        data={recentExpenses}
        renderItem={renderExpense}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <View style={styles.scrollContent}>
            <Greeting t={t} colors={colors} />

            <View style={styles.summaryCards}>
              <StatCard icon="today" iconColor={colors.primary} bgColor={colors.primary + '15'} label={t('today')} value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.todayTotal)} colors={colors} />
              <StatCard icon="calendar" iconColor={colors.warning} bgColor={colors.warning + '15'} label={t('week')} value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.weekTotal)} colors={colors} />
              <StatCard icon="calendar-number" iconColor={colors.danger} bgColor={colors.danger + '15'} label={t('month')} value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthTotal)} colors={colors} />
            </View>

            <CashBanner value={cashBalance} colors={colors} t={t} />

            {stats.unpaidExpenses.length > 0 && (
              <UnpaidBanner count={stats.unpaidExpenses.length} total={stats.totalUnpaid} colors={colors} t={t} />
            )}

            {cards.length > 0 && (
              <CardCarousel cards={stats.cardUsage} colors={colors} t={t} onNavigate={handleNavigate} />
            )}

            {stats.topCategories.length > 0 && (
              <TopCategories categories={stats.topCategories} monthTotal={stats.monthTotal} colors={colors} t={t} getCategoryInfo={stats.getCategoryInfo} onNavigate={handleNavigate} />
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('recentExpenses')}</Text>
                <TouchableOpacity onPress={() => handleNavigate('History')}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>{t('seeAll')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={(
          <View style={{ paddingHorizontal: 16 }}>
            {expenses.length > 5 && (
              <TouchableOpacity
                style={[styles.showAllButton, { backgroundColor: colors.primary + '15' }]}
                onPress={() => setShowAll(!showAll)}
              >
                <Text style={[styles.showAllText, { color: colors.primary }]}>
                  {showAll ? t('showLess') : t('showAll')}
                </Text>
              </TouchableOpacity>
            )}
            {goals.length > 0 && (
              <GoalsPreview goals={goals} colors={colors} t={t} onNavigate={handleNavigate} />
            )}
            <View style={{ height: 30 }} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold' },
  greetingSub: { fontSize: 14, marginTop: 4 },
  summaryCards: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  cashCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  cashRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cashLabel: { color: '#fff', fontSize: 14, opacity: 0.8 },
  cashValue: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  cashIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  unpaidCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  unpaidHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unpaidTitle: { fontSize: 14, fontWeight: '600' },
  unpaidAmount: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  cardItem: { width: width * 0.75, padding: 16, borderRadius: 18, marginRight: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: 'bold' },
  cardLimit: { fontSize: 12, marginTop: 2 },
  cardUsageSection: { marginBottom: 8 },
  cardUsageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardUsageLabel: { fontSize: 12 },
  cardUsageValue: { fontSize: 12, fontWeight: '600' },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: '#e0e0e0', overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, fontWeight: '600', textAlign: 'right' },
  cardAlert: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8, gap: 4 },
  cardAlertText: { fontSize: 11, fontWeight: '600' },
  categoriesList: { gap: 8 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14 },
  categoryIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 14, fontWeight: '600' },
  categoryAmount: { fontSize: 12, marginTop: 2 },
  categoryBar: { width: 60, height: 6, borderRadius: 3, backgroundColor: '#e0e0e0', overflow: 'hidden' },
  categoryBarFill: { height: '100%', borderRadius: 3 },
  showAllButton: { padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  showAllText: { fontSize: 14, fontWeight: '600' },
  goalsList: { gap: 8 },
  goalItem: { padding: 14, borderRadius: 14 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  goalName: { fontSize: 14, fontWeight: '600' },
  goalAmount: { fontSize: 12 },
  goalProgress: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalProgressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  goalProgressFill: { height: '100%', borderRadius: 3 },
  goalProgressText: { fontSize: 12, fontWeight: '600' },
});
