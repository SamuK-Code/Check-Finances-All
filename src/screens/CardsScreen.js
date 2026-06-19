// CardsScreen.js — COM SISTEMA DE FATURAS E QUITAÇÃO

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslate } from '../hooks/useTranslate';
import { formatCurrency, getCardGradientColors, isCardTemplate, getCardTemplateImage, isCardSolid, getDaysUntilClosing } from '../utils/helpers';
import CreditCard from '../components/CreditCard';
import Toast from '../components/Toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CardsScreen = () => {
  const { 
    cards, 
    transactions, 
    cardGradients, 
    addCard, 
    deleteCard, 
    editCard, 
    getCardUsage,
    cardInvoices,
    payInvoice,
    getCardPendingInvoices,
    getCardInvoices,
  } = useApp();
  const { colors } = useTheme();
  const { t } = useTranslate();

  // Modal de adicionar cartão
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [limit, setLimit] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(cardGradients[0]?.class || 'card-gradient-purple');

  // Modal de detalhes do cartão
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Modal de editar cartão
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [editCloseDate, setEditCloseDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editGradient, setEditGradient] = useState('');

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  // Filtrar transações do cartão selecionado
  const cardTransactions = useMemo(() => {
    if (!selectedCard) return [];
    return transactions
      .filter(t => t.cardId === selectedCard.id && t.type === 'expense' && !t.isInvoicePayment)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedCard, transactions]);

  // NOVO: Pegar faturas pendentes do cartão selecionado
  const pendingInvoices = useMemo(() => {
    if (!selectedCard) return [];
    return getCardPendingInvoices(selectedCard.id);
  }, [selectedCard, getCardPendingInvoices, cardInvoices]);

  // NOVO: Pegar todas as faturas do cartão
  const allInvoices = useMemo(() => {
    if (!selectedCard) return [];
    return getCardInvoices(selectedCard.id);
  }, [selectedCard, getCardInvoices, cardInvoices]);

  // Calcular uso e progresso
  const getCardProgress = (card) => {
    const used = getCardUsage(card.id);
    const available = card.limit - used;
    const percentage = (used / card.limit) * 100;
    const availablePercentage = (available / card.limit) * 100;
    return { used, available, percentage, availablePercentage };
  };

  const getProgressColor = (availablePercentage) => {
    if (availablePercentage <= 10) return '#EF4444';
    if (availablePercentage <= 25) return '#F59E0B';
    return '#10B981';
  };

  const handleAddCard = () => {
    if (!name || !limit) {
      showToast(t('add.fillRequired'), 'error');
      return;
    }

    const selectedGradientObj = cardGradients.find(g => g.class === selectedGradient) || cardGradients[0];
    const card = {
      name,
      number: number ? `**** ${number.padStart(4, '0')}` : '**** 0000',
      limit: parseFloat(limit),
      closeDate,
      dueDate: dueDate || closeDate,
      gradientClass: selectedGradient,
      color: selectedGradientObj.color,
    };

    addCard(card);
    setModalVisible(false);
    resetForm();
    showToast(t('cards.added'));
  };

  const resetForm = () => {
    setName('');
    setNumber('');
    setLimit('');
    setCloseDate('');
    setDueDate('');
    setSelectedGradient(cardGradients[0]?.class || 'card-gradient-purple');
  };

  const handleDeleteCard = (id) => {
    Alert.alert(
      t('cards.confirmDeleteTitle'),
      t('cards.confirmDeleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => {
            deleteCard(id);
            setDetailModalVisible(false);
            showToast(t('cards.deleted'), 'warning');
          }
        },
      ]
    );
  };

  const openCardDetail = (card) => {
    setSelectedCard(card);
    setDetailModalVisible(true);
  };

  const openEditModal = () => {
    if (!selectedCard) return;
    setEditName(selectedCard.name);
    setEditLimit(selectedCard.limit.toString());
    setEditCloseDate(selectedCard.closeDate || '');
    setEditDueDate(selectedCard.dueDate || '');
    setEditGradient(selectedCard.gradientClass);
    setEditModalVisible(true);
  };

  const handleEditCard = () => {
    if (!editName || !editLimit) {
      showToast(t('add.fillRequired'), 'error');
      return;
    }

    const selectedGradientObj = cardGradients.find(g => g.class === editGradient) || cardGradients[0];

    editCard(selectedCard.id, {
      name: editName,
      limit: parseFloat(editLimit),
      closeDate: editCloseDate,
      dueDate: editDueDate || editCloseDate,
      gradientClass: editGradient,
      color: selectedGradientObj.color,
    });

    setSelectedCard(prev => ({
      ...prev,
      name: editName,
      limit: parseFloat(editLimit),
      closeDate: editCloseDate,
      dueDate: editDueDate || editCloseDate,
      gradientClass: editGradient,
      color: selectedGradientObj.color,
    }));

    setEditModalVisible(false);
    showToast(t('cards.updated'));
  };

  // NOVO: Handler para quitar fatura
  const handlePayInvoice = (invoice) => {
    Alert.alert(
      'Quitar Fatura',
      `Deseja quitar a fatura de ${invoice.cardName} no valor de ${formatCurrency(invoice.totalAmount)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'default',
          onPress: () => {
            const success = payInvoice(invoice.id);
            if (success) {
              showToast('Fatura quitada com sucesso!', 'success');
            } else {
              showToast('Saldo insuficiente para quitar a fatura', 'error');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgCard, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          <Ionicons name="card" size={20} color={colors.primary} />  {t('cards.title')}
        </Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Cards List - Vertical */}
        <View style={styles.cardsList}>
          {cards.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.bgCard }]}>
              <Ionicons name="card" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('cards.noCards')}</Text>
            </View>
          ) : (
            cards.map(card => (
              <TouchableOpacity 
                key={card.id} 
                onPress={() => openCardDetail(card)}
                onLongPress={() => handleDeleteCard(card.id)}
                style={styles.cardItem}
                activeOpacity={0.85}
              >
                <CreditCard card={card} used={getCardUsage(card.id)} />
                {/* NOVO: Badge de fatura pendente */}
                {getCardPendingInvoices(card.id).length > 0 && (
                  <View style={[styles.invoiceBadge, { backgroundColor: colors.danger }]}>
                    <Ionicons name="document-text" size={12} color="#FFFFFF" />
                    <Text style={styles.invoiceBadgeText}>
                      {getCardPendingInvoices(card.id).length} fatura(s) pendente(s)
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* FAB Add Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* ========== MODAL DE DETALHES DO CARTÃO ========== */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModalContent, { backgroundColor: colors.bgCard }]}>
            {/* Header */}
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>{t('cards.details')}</Text>
              <TouchableOpacity onPress={openEditModal}>
                <Ionicons name="create" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedCard && (
                <>
                  {/* Cartão Visual */}
                  <View style={styles.detailCardWrapper}>
                    <CreditCard card={selectedCard} used={getCardUsage(selectedCard.id)} />
                  </View>

                  {/* NOVO: Próximo fechamento */}
                  {selectedCard.closeDate && (
                    <View style={[styles.closingInfo, { backgroundColor: colors.bgTertiary }]}>
                      <View style={styles.closingRow}>
                        <Ionicons name="calendar" size={16} color={colors.primary} />
                        <Text style={[styles.closingText, { color: colors.textSecondary }]}>
                          Fechamento: dia {selectedCard.closeDate}
                        </Text>
                      </View>
                      <View style={styles.closingRow}>
                        <Ionicons name="time" size={16} color={colors.warning} />
                        <Text style={[styles.closingText, { color: colors.textSecondary }]}>
                          {getDaysUntilClosing(selectedCard.closeDate) !== null 
                            ? `Próximo fechamento em ${getDaysUntilClosing(selectedCard.closeDate)} dias`
                            : 'Data de fechamento não configurada'
                          }
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Barra de Progresso */}
                  {(() => {
                    const { used, available, percentage, availablePercentage } = getCardProgress(selectedCard);
                    const progressColor = getProgressColor(availablePercentage);

                    return (
                      <View style={[styles.progressSection, { backgroundColor: colors.bgTertiary }]}>
                        <View style={styles.progressHeader}>
                          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{t('cards.limitUsed')}</Text>
                          <Text style={[styles.progressPercent, { color: progressColor }]}>
                            {percentage.toFixed(1)}%
                          </Text>
                        </View>

                        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: progressColor 
                              }
                            ]} 
                          />
                        </View>

                        <View style={styles.progressValues}>
                          <View>
                            <Text style={[styles.progressValueLabel, { color: colors.textMuted }]}>{t('cards.used')}</Text>
                            <Text style={[styles.progressValue, { color: colors.danger }]}>{formatCurrency(used)}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.progressValueLabel, { color: colors.textMuted }]}>{t('cards.available')}</Text>
                            <Text style={[styles.progressValue, { color: availablePercentage <= 10 ? colors.danger : colors.success }]}>
                              {formatCurrency(available)}
                            </Text>
                          </View>
                        </View>

                        {availablePercentage <= 10 && (
                          <View style={styles.alertBox}>
                            <Ionicons name="warning" size={16} color="#EF4444" />
                            <Text style={styles.alertText}>
                              {t('cards.limitAlert')} {availablePercentage.toFixed(1)}%
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })()}

                  {/* NOVO: Seção de Faturas Pendentes */}
                  {pendingInvoices.length > 0 && (
                    <View style={styles.invoicesSection}>
                      <Text style={[styles.invoicesTitle, { color: colors.textPrimary }]}>
                        <Ionicons name="document-text" size={16} color={colors.danger} />  Faturas Pendentes
                      </Text>
                      {pendingInvoices.map(invoice => (
                        <View key={invoice.id} style={[styles.invoiceCard, { backgroundColor: colors.bgTertiary }]}>
                          <View style={styles.invoiceHeader}>
                            <View>
                              <Text style={[styles.invoiceMonth, { color: colors.textPrimary }]}>
                                {String(invoice.month).padStart(2, '0')}/{invoice.year}
                              </Text>
                              <Text style={[styles.invoiceAmount, { color: colors.danger }]}>
                                {formatCurrency(invoice.totalAmount)}
                              </Text>
                            </View>
                            <View style={[styles.invoiceStatus, { backgroundColor: colors.danger + '15' }]}>
                              <Text style={[styles.invoiceStatusText, { color: colors.danger }]}>Pendente</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[styles.payButton, { backgroundColor: colors.success }]}
                            onPress={() => handlePayInvoice(invoice)}
                          >
                            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                            <Text style={styles.payButtonText}>Quitar Fatura</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* NOVO: Histórico de Faturas Pagas */}
                  {allInvoices.filter(inv => inv.status === 'paid').length > 0 && (
                    <View style={styles.invoicesSection}>
                      <Text style={[styles.invoicesTitle, { color: colors.textPrimary }]}>
                        <Ionicons name="checkmark-done" size={16} color={colors.success} />  Faturas Quitadas
                      </Text>
                      {allInvoices
                        .filter(inv => inv.status === 'paid')
                        .map(invoice => (
                          <View key={invoice.id} style={[styles.invoiceCard, { backgroundColor: colors.bgTertiary, opacity: 0.7 }]}>
                            <View style={styles.invoiceHeader}>
                              <View>
                                <Text style={[styles.invoiceMonth, { color: colors.textPrimary }]}>
                                  {String(invoice.month).padStart(2, '0')}/{invoice.year}
                                </Text>
                                <Text style={[styles.invoiceAmount, { color: colors.success }]}>
                                  {formatCurrency(invoice.totalAmount)}
                                </Text>
                              </View>
                              <View style={[styles.invoiceStatus, { backgroundColor: colors.success + '15' }]}>
                                <Text style={[styles.invoiceStatusText, { color: colors.success }]}>Quitada</Text>
                              </View>
                            </View>
                            {invoice.paidAt && (
                              <Text style={[styles.paidDate, { color: colors.textMuted }]}>
                                Quitada em {new Date(invoice.paidAt).toLocaleDateString('pt-BR')}
                              </Text>
                            )}
                          </View>
                        ))}
                    </View>
                  )}

                  {/* Info do Cartão */}
                  <View style={[styles.infoSection, { backgroundColor: colors.bgTertiary }]}>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar" size={16} color={colors.textMuted} />
                      <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        {t('cards.closing')}: {t('common.date')} {selectedCard.closeDate || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="cash" size={16} color={colors.textMuted} />
                      <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        {t('cards.totalLimit')}: {formatCurrency(selectedCard.limit)}
                      </Text>
                    </View>
                  </View>

                  {/* Histórico de Gastos */}
                  <View style={styles.historySection}>
                    <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>
                      <Ionicons name="receipt" size={16} color={colors.primary} />  {t('cards.expenseHistory')}
                    </Text>

                    {cardTransactions.length === 0 ? (
                      <View style={[styles.emptyHistory, { backgroundColor: colors.bgTertiary }]}>
                        <Ionicons name="receipt" size={32} color={colors.textMuted} />
                        <Text style={[styles.emptyHistoryText, { color: colors.textMuted }]}>
                          {t('cards.noTransactions')}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.transactionsList}>
                        {cardTransactions.map(t => (
                          <View key={t.id} style={[styles.transactionRow, { backgroundColor: colors.bgTertiary }]}>
                            <View style={styles.transactionLeft}>
                              <View style={[styles.transactionIcon, { backgroundColor: (t.categoryColor || '#94A3B8') + '15' }]}>
                                <Ionicons name={t.categoryIcon || 'receipt'} size={16} color={t.categoryColor || '#94A3B8'} />
                              </View>
                              <View>
                                <Text style={[styles.transactionDesc, { color: colors.textPrimary }]} numberOfLines={1}>
                                  {t.desc}
                                </Text>
                                <Text style={[styles.transactionDate, { color: colors.textMuted }]}>
                                  {t.date ? t.date.split('-').reverse().join('/') : ''}
                                  {t.isNextInvoice && (
                                    <Text style={{ color: colors.warning }}> • Próxima fatura</Text>
                                  )}
                                </Text>
                              </View>
                            </View>
                            <Text style={[styles.transactionAmount, { color: colors.danger }]}>
                              - {formatCurrency(t.amount)}
                            </Text>
                          </View>
                        ))}

                        {/* Total */}
                        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>{t('cards.totalSpent')}</Text>
                          <Text style={[styles.totalValue, { color: colors.danger }]}>
                            {formatCurrency(cardTransactions.reduce((s, t) => s + t.amount, 0))}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Botões de Ação */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.editBtn, { backgroundColor: colors.primary }]}
                      onPress={openEditModal}
                    >
                      <Ionicons name="create" size={18} color="#FFFFFF" />
                      <Text style={styles.editBtnText}>{t('cards.editCard')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.deleteBtn, { backgroundColor: colors.danger + '15' }]}
                      onPress={() => handleDeleteCard(selectedCard.id)}
                    >
                      <Ionicons name="trash" size={18} color={colors.danger} />
                      <Text style={[styles.deleteBtnText, { color: colors.danger }]}>{t('common.delete')}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL DE EDITAR CARTÃO ========== */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                <Ionicons name="create" size={20} color={colors.primary} />  {t('cards.editCard')}
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('cards.cardName')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                  placeholder="Ex: Nubank, Inter..."
                  placeholderTextColor={colors.textMuted}
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t('cards.limit')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                    placeholder="0,00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    value={editLimit}
                    onChangeText={setEditLimit}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t('cards.closeDate')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                    placeholder="DD"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={editCloseDate}
                    onChangeText={(text) => {
                      const numeric = text.replace(/[^0-9]/g, '');
                      const day = parseInt(numeric, 10);
                      if (numeric === '') {
                        setEditCloseDate('');
                      } else if (day >= 1 && day <= 31) {
                        setEditCloseDate(numeric);
                      } else if (numeric.length <= 2) {
                        setEditCloseDate(numeric);
                      }
                    }}
                  />
                </View>
              </View>

              {/* NOVO: Campo de data de vencimento */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Dia de Vencimento</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                  placeholder="DD"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={editDueDate}
                  onChangeText={(text) => {
                    const numeric = text.replace(/[^0-9]/g, '');
                    const day = parseInt(numeric, 10);
                    if (numeric === '') {
                      setEditDueDate('');
                    } else if (day >= 1 && day <= 31) {
                      setEditDueDate(numeric);
                    } else if (numeric.length <= 2) {
                      setEditDueDate(numeric);
                    }
                  }}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('cards.cardColor')}</Text>
                <View style={styles.colorPicker}>
                  {cardGradients.map((gradObj) => {
                    const isSelected = editGradient === gradObj.class;
                    const isTemplate = gradObj.type === 'template';
                    const isSolid = gradObj.type === 'solid';
                    const gradientColors = getCardGradientColors(gradObj.class);
                    const templateImage = isTemplate ? getCardTemplateImage(gradObj.class) : null;

                    return (
                      <TouchableOpacity
                        key={gradObj.class}
                        onPress={() => setEditGradient(gradObj.class)}
                        style={[
                          styles.colorOption,
                          isSelected && styles.colorSelected,
                          isTemplate && styles.templateOption
                        ]}
                        activeOpacity={0.8}
                      >
                        {isTemplate && templateImage ? (
                          <ImageBackground
                            source={templateImage}
                            style={styles.gradientPreview}
                            imageStyle={{ borderRadius: 20 }}
                          >
                            <View style={styles.templateOverlay}>
                              <Text style={styles.templateLabel}>IMG</Text>
                            </View>
                          </ImageBackground>
                        ) : isSolid ? (
                          <View style={[styles.gradientPreview, { backgroundColor: gradObj.color, borderRadius: 20 }]}>
                            <Text style={styles.solidLabel}>S</Text>
                          </View>
                        ) : (
                          <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientPreview}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleEditCard}
              >
                <Ionicons name="save" size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>{t('cards.saveChanges')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL DE ADICIONAR CARTÃO ========== */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                <Ionicons name="add-circle" size={20} color={colors.primary} />  {t('cards.addCard')}
              </Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                resetForm();
              }}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('cards.cardName')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                  placeholder="Ex: Nubank, Inter..."
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('cards.cardNumber')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                  placeholder="1234"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={number}
                  onChangeText={setNumber}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t('cards.limit')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                    placeholder="0,00"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    value={limit}
                    onChangeText={setLimit}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{t('cards.closeDate')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                    placeholder="DD"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={closeDate}
                    onChangeText={(text) => {
                      const numeric = text.replace(/[^0-9]/g, '');
                      const day = parseInt(numeric, 10);
                      if (numeric === '') {
                        setCloseDate('');
                      } else if (day >= 1 && day <= 31) {
                        setCloseDate(numeric);
                      } else if (numeric.length <= 2) {
                        setCloseDate(numeric);
                      }
                    }}
                  />
                </View>
              </View>

              {/* NOVO: Campo de data de vencimento */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Dia de Vencimento</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bgTertiary, color: colors.textPrimary }]}
                  placeholder="DD (opcional, usa fechamento se vazio)"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={dueDate}
                  onChangeText={(text) => {
                    const numeric = text.replace(/[^0-9]/g, '');
                    const day = parseInt(numeric, 10);
                    if (numeric === '') {
                      setDueDate('');
                    } else if (day >= 1 && day <= 31) {
                      setDueDate(numeric);
                    } else if (numeric.length <= 2) {
                      setDueDate(numeric);
                    }
                  }}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('cards.cardColor')}</Text>
                <View style={styles.colorPicker}>
                  {cardGradients.map((gradObj) => {
                    const isSelected = selectedGradient === gradObj.class;
                    const isTemplate = gradObj.type === 'template';
                    const isSolid = gradObj.type === 'solid';
                    const gradientColors = getCardGradientColors(gradObj.class);
                    const templateImage = isTemplate ? getCardTemplateImage(gradObj.class) : null;

                    return (
                      <TouchableOpacity
                        key={gradObj.class}
                        onPress={() => setSelectedGradient(gradObj.class)}
                        style={[
                          styles.colorOption,
                          isSelected && styles.colorSelected,
                          isTemplate && styles.templateOption
                        ]}
                        activeOpacity={0.8}
                      >
                        {isTemplate && templateImage ? (
                          <ImageBackground
                            source={templateImage}
                            style={styles.gradientPreview}
                            imageStyle={{ borderRadius: 20 }}
                          >
                            <View style={styles.templateOverlay}>
                              <Text style={styles.templateLabel}>IMG</Text>
                            </View>
                          </ImageBackground>
                        ) : isSolid ? (
                          <View style={[styles.gradientPreview, { backgroundColor: gradObj.color, borderRadius: 20 }]}>
                            <Text style={styles.solidLabel}>S</Text>
                          </View>
                        ) : (
                          <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientPreview}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddCard}
              >
                <Ionicons name="save" size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>{t('cards.save')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast {...toast} onHide={() => setToast({ ...toast, visible: false })} />
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
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  cardsList: { gap: 8 },
  emptyCard: { 
    alignItems: 'center', 
    padding: 40, 
    borderRadius: 16, 
    marginTop: 20 
  },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: 12 },

  cardItem: { alignSelf: 'center', width: '100%' },

  // NOVO: Badge de fatura pendente
  invoiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: -8,
    marginBottom: 8,
    alignSelf: 'center',
  },
  invoiceBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 30, 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 6 
  },

  // Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24, 
    paddingBottom: 40, 
    maxHeight: '90%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },

  formGroup: { marginBottom: 16 },
  formRow: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { padding: 14, borderRadius: 12, fontSize: 16 },

  colorPicker: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  colorOption: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: 'transparent' 
  },
  colorSelected: { 
    borderColor: '#8B5CF6', 
    borderWidth: 3 
  },
  templateOption: { 
    width: 70, 
    height: 50, 
    borderRadius: 12 
  },
  gradientPreview: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 20 
  },
  templateOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 20 
  },
  templateLabel: { 
    color: '#FFF', 
    fontSize: 10, 
    fontWeight: '700' 
  },
  solidLabel: { 
    color: '#FFF', 
    fontSize: 14, 
    fontWeight: '700', 
    textAlign: 'center', 
    lineHeight: 46 
  },

  submitBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    padding: 16, 
    borderRadius: 14, 
    marginTop: 8 
  },
  submitText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },

  // Detail Modal
  detailModalContent: { 
    flex: 1, 
    marginTop: 40, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24 
  },
  detailHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  detailTitle: { fontSize: 18, fontWeight: '700' },
  detailCardWrapper: { alignItems: 'center', marginBottom: 20 },

  // NOVO: Info de fechamento
  closingInfo: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  closingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  closingText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Progress
  progressSection: { 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16 
  },
  progressHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  progressLabel: { fontSize: 13, fontWeight: '600' },
  progressPercent: { fontSize: 18, fontWeight: '700' },
  progressBar: { 
    height: 8, 
    borderRadius: 4, 
    overflow: 'hidden', 
    marginBottom: 12 
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressValues: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  progressValueLabel: { fontSize: 11, marginBottom: 2 },
  progressValue: { fontSize: 15, fontWeight: '700' },

  alertBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginTop: 12, 
    backgroundColor: '#FEE2E2', 
    padding: 10, 
    borderRadius: 8 
  },
  alertText: { 
    color: '#EF4444', 
    fontSize: 12, 
    fontWeight: '600', 
    flex: 1 
  },

  // NOVO: Seção de Faturas
  invoicesSection: { marginBottom: 16 },
  invoicesTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  invoiceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceMonth: {
    fontSize: 14,
    fontWeight: '600',
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  invoiceStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  invoiceStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  paidDate: {
    fontSize: 11,
    marginTop: 4,
  },

  // Info
  infoSection: { 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16, 
    gap: 10 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  infoText: { fontSize: 14, fontWeight: '500' },

  // History
  historySection: { marginBottom: 16 },
  historyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  emptyHistory: { 
    alignItems: 'center', 
    padding: 30, 
    borderRadius: 16 
  },
  emptyHistoryText: { fontSize: 14, fontWeight: '500', marginTop: 8 },

  transactionsList: { gap: 8 },
  transactionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 12, 
    borderRadius: 12 
  },
  transactionLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    flex: 1 
  },
  transactionIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  transactionDesc: { fontSize: 14, fontWeight: '600' },
  transactionDate: { fontSize: 11, marginTop: 2 },
  transactionAmount: { fontSize: 14, fontWeight: '700' },

  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingTop: 12, 
    borderTopWidth: 1, 
    marginTop: 4 
  },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalValue: { fontSize: 16, fontWeight: '700' },

  // Action Buttons
  actionButtons: { gap: 10, marginTop: 8 },
  editBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    padding: 14, 
    borderRadius: 12 
  },
  editBtnText: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '700' 
  },
  deleteBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    padding: 14, 
    borderRadius: 12 
  },
  deleteBtnText: { fontSize: 15, fontWeight: '700' },
});

export default CardsScreen;