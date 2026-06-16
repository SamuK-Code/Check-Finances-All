import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { useExpense } from '../contexts/ExpenseContext';
import { AppHeader, BackButton } from '../components/Navigation';
import { PeriodFilter } from '../components/UtilsComponents';
import { ChartCard, TrendIndicator } from '../components/DataDisplay';
import { FadeIn, SlideUp } from '../components/Animations';
import { Screen, SectionHeader } from '../components/Layout';
import { LoadingSpinner } from '../components/Indicators';

const screenWidth = Dimensions.get('window').width;

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ChartLegend = React.memo(function ChartLegend({ data, totalGeral, colors, onPress, selectedIndex }) {
  return (
    <View style={styles.legendSection}>
      <View style={styles.legendHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Detalhamento</Text>
        {selectedIndex !== null && (
          <TouchableOpacity style={styles.clearFilterButton} onPress={() => onPress(null)}>
            <Ionicons name="close-circle" size={16} color={colors.primary} />
            <Text style={[styles.clearFilterText, { color: colors.primary }]}>Limpar filtro</Text>
          </TouchableOpacity>
        )}
      </View>
      {data.map((item, index) => {
        const percentage = totalGeral > 0 ? ((item.amount / totalGeral) * 100).toFixed(1) : 0;
        return (
          <TouchableOpacity
            key={item.id + index}
            style={[styles.legendItem, { backgroundColor: colors.card }]}
            onPress={() => onPress(index === selectedIndex ? null : index)}
          >
            <View style={styles.legendLeft}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <View style={styles.legendInfo}>
                <Text style={[styles.legendName, { color: colors.text }]}>{item.name}</Text>
                <View style={styles.legendPercentRow}>
                  <Text style={[styles.legendPercent, { color: item.color }]}>{percentage}%</Text>
                  <View style={[styles.legendMiniBar, { backgroundColor: item.color + '30' }]}>
                    <View style={[styles.legendMiniBarFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.legendRight}>
              <Text style={[styles.legendAmount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export default function ChartScreen({ navigation }) {
  const { expenses, cards, getFilteredExpenses, getTotalByCategory, getTotalByCard, getExpensesByMonth, CATEGORIES } = useExpenses();
  const { cashBalance } = useCash();
  const { colors, isDark } = useTheme();
  const { t } = useI18n();

  const [chartType, setChartType] = useState('category');
  const [period, setPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredExpenses = useMemo(() => getFilteredExpenses(period), [getFilteredExpenses, period]);

  const categoryTotals = useMemo(() => getTotalByCategory(filteredExpenses), [getTotalByCategory, filteredExpenses]);
  const cardTotals = useMemo(() => getTotalByCard(filteredExpenses), [getTotalByCard, filteredExpenses]);
  const totalGeral = useMemo(() => Object.values(categoryTotals).reduce((a, b) => a + b, 0), [categoryTotals]);

  const isCashInsufficient = useMemo(() => cashBalance > 0 && cashBalance < totalGeral, [cashBalance, totalGeral]);
  const cashDeficit = useMemo(() => totalGeral - cashBalance, [totalGeral, cashBalance]);

  const categoryData = useMemo(() =>
    Object.entries(categoryTotals)
      .map(([catId, amount]) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        return { id: catId, name: cat?.name || catId, amount, color: cat?.color || '#999' };
      })
      .sort((a, b) => b.amount - a.amount),
  [categoryTotals, CATEGORIES]);

  const paymentData = useMemo(() =>
    Object.entries(cardTotals).map(([cardId, amount]) => {
      const card = cards.find(c => c.id === cardId);
      const isStandalone = cardId === 'no-card';
      const bank = card ? getBankById(card.bankId) : null;
      return {
        id: cardId, name: isStandalone ? t('standalone') : (card?.customName || card?.name || t('none')),
        amount, color: isStandalone ? colors.info : (bank?.color || card?.color || '#999'),
      };
    }).sort((a, b) => b.amount - a.amount),
  [cardTotals, cards, colors.info, t]);

  const currentData = useMemo(() => chartType === 'category' ? categoryData : paymentData, [chartType, categoryData, paymentData]);

  const barData = useMemo(() => ({
    labels: currentData.map(d => d.name.length > 8 ? d.name.substring(0, 8) + '...' : d.name),
    datasets: [{ data: currentData.map(d => d.amount), colors: currentData.map(d => (opacity = 1) => d.color) }],
  }), [currentData]);

  const chartConfig = useMemo(() => ({
    backgroundColor: colors.chartBg,
    backgroundGradientFrom: colors.chartBg,
    backgroundGradientTo: colors.chartBg,
    decimalPlaces: 0,
    color: (opacity = 1, index) => (index !== undefined && currentData[index]) ? currentData[index].color : colors.primary,
    labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForLabels: { fontSize: 10, fontWeight: '600' },
    propsForBackgroundLines: { stroke: isDark ? '#333' : '#e0e0e0', strokeWidth: 1 },
    barPercentage: 0.7,
    fillShadowGradient: colors.primary,
    fillShadowGradientOpacity: 0.8,
  }), [colors, isDark, currentData]);

  const handleBarPress = useCallback((index) => {
    setSelectedCategory(prev => prev === index ? null : index);
  }, []);

  const displayData = useMemo(() =>
    selectedCategory !== null ? [currentData[selectedCategory]] : currentData,
  [selectedCategory, currentData]);

  if (expenses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title={t('charts')} />
        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart-outline" size={48} color={colors.textLight} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noExpenses')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textLight }]}>{t('addFirstExpense')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title={t('charts')} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <PeriodFilter selected={period} onSelect={setPeriod} />

        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryLabel, { color: colors.textLight }]}>{t('totalPeriod')}</Text>
          <Text style={[styles.summaryAmount, { color: colors.text }]}>{formatCurrency(totalGeral)}</Text>
          <Text style={[styles.summaryCount, { color: colors.textLight }]}>{filteredExpenses.length} {t('transactions')}</Text>
        </View>

        {isCashInsufficient && (
          <View style={[styles.cashAlert, { backgroundColor: colors.danger + '10' }]}>
            <Ionicons name="warning" size={20} color={colors.danger} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.cashAlertTitle, { color: colors.danger }]}>{t('insufficientCash')}</Text>
              <Text style={[styles.cashAlertText, { color: colors.danger }]}>
                {t('cashDeficit', { expenses: formatCurrency(totalGeral), cash: formatCurrency(cashBalance), deficit: formatCurrency(cashDeficit) })}
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.toggleContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={[styles.toggleButton, { backgroundColor: chartType === 'category' ? colors.primary : 'transparent' }]} onPress={() => { setChartType('category'); setSelectedCategory(null); }}>
            <Ionicons name="pie-chart" size={16} color={chartType === 'category' ? '#fff' : colors.text} />
            <Text style={[styles.toggleText, { color: chartType === 'category' ? '#fff' : colors.text }]}>{t('byCategory')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleButton, { backgroundColor: chartType === 'payment' ? colors.primary : 'transparent' }]} onPress={() => { setChartType('payment'); setSelectedCategory(null); }}>
            <Ionicons name="card" size={16} color={chartType === 'payment' ? '#fff' : colors.text} />
            <Text style={[styles.toggleText, { color: chartType === 'payment' ? '#fff' : colors.text }]}>{t('byPayment')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
          {currentData.length > 0 ? (
            chartType === 'category' ? (
              <View style={styles.barChartWrapper}>
                <BarChart
                  data={barData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.barChart}
                  showValuesOnTopOfBars
                  fromZero
                  withInnerLines={false}
                  segments={4}
                  onDataPointClick={({ index }) => handleBarPress(index)}
                />
              </View>
            ) : (
              <View style={styles.pieChartContainer}>
                {currentData.map((item, index) => {
                  const percentage = totalGeral > 0 ? ((item.amount / totalGeral) * 100).toFixed(1) : 0;
                  return (
                    <TouchableOpacity key={item.id} style={styles.pieItem} onPress={() => handleBarPress(index)}>
                      <View style={styles.pieLeft}>
                        <View style={[styles.pieDot, { backgroundColor: item.color }]} />
                        <Text style={[styles.pieName, { color: colors.text }]}>{item.name}</Text>
                      </View>
                      <View style={styles.pieRight}>
                        <View style={[styles.pieBar, { backgroundColor: item.color + '20' }]}>
                          <View style={[styles.pieBarFill, { width: `${Math.min(percentage * 3, 100)}%`, backgroundColor: item.color }]} />
                        </View>
                        <Text style={[styles.piePercent, { color: item.color }]}>{percentage}%</Text>
                        <Text style={[styles.pieAmount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )
          ) : (
            <View style={styles.noDataChart}>
              <Text style={[styles.noDataText, { color: colors.textLight }]}>{t('noExpenses')}</Text>
            </View>
          )}
        </View>

        {displayData.length > 0 && (
          <ChartLegend data={displayData} totalGeral={totalGeral} colors={colors} onPress={handleBarPress} selectedIndex={selectedCategory} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  summaryCard: { margin: 16, padding: 24, borderRadius: 20 },
  summaryLabel: { fontSize: 14, opacity: 0.8 },
  summaryAmount: { fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
  summaryCount: { fontSize: 14, opacity: 0.7 },
  cashAlert: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 12 },
  cashAlertTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  cashAlertText: { fontSize: 11 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginHorizontal: 16, marginBottom: 16, borderRadius: 14, padding: 4 },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 4 },
  toggleText: { fontSize: 12, fontWeight: '600' },
  chartContainer: { marginHorizontal: 16, borderRadius: 20, padding: 16 },
  barChartWrapper: { alignItems: 'center', paddingVertical: 10 },
  barChart: { borderRadius: 16, marginVertical: 8 },
  noDataChart: { alignItems: 'center', padding: 40 },
  noDataText: { fontSize: 14, opacity: 0.7 },
  pieChartContainer: { width: '100%', paddingVertical: 10 },
  pieItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  pieLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  pieDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  pieName: { fontSize: 14, fontWeight: '500' },
  pieRight: { alignItems: 'flex-end', minWidth: 120 },
  pieBar: { height: 6, borderRadius: 3, width: 100, overflow: 'hidden', marginBottom: 4 },
  pieBarFill: { height: '100%', borderRadius: 3 },
  piePercent: { fontSize: 12, fontWeight: 'bold' },
  pieAmount: { fontSize: 13, marginTop: 2 },
  legendSection: { margin: 16, marginTop: 24 },
  legendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  clearFilterButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearFilterText: { fontSize: 12, fontWeight: '600' },
  legendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 8 },
  legendLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  legendInfo: { flex: 1 },
  legendName: { fontSize: 14, fontWeight: '500' },
  legendPercentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  legendPercent: { fontSize: 12, fontWeight: 'bold' },
  legendMiniBar: { height: 4, borderRadius: 2, flex: 1, maxWidth: 80, overflow: 'hidden' },
  legendMiniBarFill: { height: '100%', borderRadius: 2 },
  legendRight: { alignItems: 'flex-end', minWidth: 100 },
  legendAmount: { fontSize: 14, fontWeight: 'bold' },
});
