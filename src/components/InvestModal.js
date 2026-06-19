import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const InvestModal = ({ visible, onClose, goal, type, balance, onConfirm, colors }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const isDeposit = type === 'deposit';
  const title = isDeposit ? 'Investir na Meta' : 'Retirar da Meta';
  const subtitle = isDeposit 
    ? `Saldo disponível: R$ ${balance?.toFixed(2) || '0.00'}`
    : `Disponível na meta: R$ ${goal?.current?.toFixed(2) || '0.00'}`;
  const buttonColor = isDeposit ? colors.primary : colors.warning;
  const icon = isDeposit ? 'add-circle' : 'remove-circle';

  const handleConfirm = () => {
    const value = parseFloat(amount);

    if (!amount || isNaN(value) || value <= 0) {
      setError('Digite um valor válido');
      return;
    }

    if (isDeposit && value > balance) {
      setError('Saldo insuficiente no caixa');
      return;
    }

    if (!isDeposit && value > goal.current) {
      setError('Valor maior que o disponível na meta');
      return;
    }

    onConfirm(goal.id, value, type);
    setAmount('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.content, { backgroundColor: colors.bgCard }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                <Ionicons name={icon} size={20} color={buttonColor} /> {title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {goal?.name}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={[styles.infoBox, { backgroundColor: colors.bgTertiary }]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          </View>

          {/* Input */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Valor (R$)
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.bgTertiary, 
                  color: colors.textPrimary,
                  borderColor: error ? colors.danger : 'transparent',
                }
              ]}
              placeholder="0,00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setError('');
              }}
              autoFocus
            />
            {error ? (
              <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
            ) : null}
          </View>

          {/* Quick amounts */}
          <View style={styles.quickAmounts}>
            {[10, 50, 100, 500].map((quick) => (
              <TouchableOpacity
                key={quick}
                style={[styles.quickBtn, { backgroundColor: colors.bgTertiary }]}
                onPress={() => setAmount(quick.toString())}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
                  R$ {quick}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Confirm */}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: buttonColor }]}
            onPress={handleConfirm}
          >
            <Ionicons name={icon} size={18} color="#FFFFFF" />
            <Text style={styles.confirmText}>
              {isDeposit ? 'Depositar' : 'Retirar'} R$ {amount || '0,00'}
            </Text>
          </TouchableOpacity>

          {/* Warning */}
          <Text style={[styles.warning, { color: colors.textMuted }]}>
            <Ionicons name="information-circle" size={12} />
            {isDeposit 
              ? ' Este valor será descontado do seu saldo em caixa.' 
              : ' Este valor será adicionado ao seu saldo em caixa.'}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  infoBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 2,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  quickBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  warning: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
  },
});

export default InvestModal;