import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const CompletedGoalsModal = ({ completedGoals, onClose, colors }) => {
  // Ordenar por data de conclusão (mais recente primeiro)
  const sorted = [...completedGoals].sort((a, b) => {
    return new Date(b.completedAt) - new Date(a.completedAt);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Data desconhecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (createdAt, completedAt) => {
    if (!createdAt || !completedAt) return 'Duração desconhecida';
    const start = new Date(createdAt).getTime();
    const end = new Date(completedAt).getTime();
    const diffMs = end - start;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0) return `${hours}h`;
    if (days === 1) return `1 dia e ${hours}h`;
    return `${days} dias`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          <Ionicons name="trophy" size={20} color={colors.success} />  Metas Concluídas
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16 }}
      >
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textMuted }]}>
              Nenhuma meta concluída
            </Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Continue investindo nas suas metas para vê-las aqui!
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={[styles.count, { color: colors.textMuted }]}>
              {sorted.length} {sorted.length === 1 ? 'meta concluída' : 'metas concluídas'}
            </Text>

            {sorted.map((goal, index) => (
              <View 
                key={goal.id} 
                style={[styles.card, { backgroundColor: colors.bgCard }]}
              >
                {/* Rank */}
                <View style={[styles.rank, { backgroundColor: colors.success + '15' }]}>
                  <Text style={[styles.rankText, { color: colors.success }]}>
                    #{index + 1}
                  </Text>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: (goal.color || colors.success) + '15' }]}>
                      <Ionicons 
                        name={goal.icon || 'flag'} 
                        size={22} 
                        color={goal.color || colors.success} 
                      />
                    </View>
                    <View style={styles.titleSection}>
                      <Text style={[styles.goalName, { color: colors.textPrimary }]}>
                        {goal.name}
                      </Text>
                      <Text style={[styles.goalTarget, { color: colors.textMuted }]}>
                        R$ {goal.target?.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Duration badge */}
                  <View style={[styles.durationBadge, { backgroundColor: colors.success + '10' }]}>
                    <Ionicons name="time" size={14} color={colors.success} />
                    <Text style={[styles.durationText, { color: colors.success }]}>
                      Concluída em {calculateDuration(goal.createdAt, goal.completedAt)}
                    </Text>
                  </View>

                  {/* Dates */}
                  <View style={styles.dates}>
                    <View style={styles.dateItem}>
                      <Ionicons name="play-circle" size={12} color={colors.textMuted} />
                      <Text style={[styles.dateText, { color: colors.textMuted }]}>
                        Início: {formatDate(goal.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.dateItem}>
                      <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                      <Text style={[styles.dateText, { color: colors.success }]}>
                        Conclusão: {formatDate(goal.completedAt)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Trophy */}
                <View style={[styles.trophy, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="trophy" size={28} color={colors.success} />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingTop: 50, 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 16 },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  list: {
    gap: 12,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rank: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleSection: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '700',
  },
  goalTarget: {
    fontSize: 13,
    marginTop: 2,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dates: {
    gap: 4,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 11,
  },
  trophy: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default CompletedGoalsModal;