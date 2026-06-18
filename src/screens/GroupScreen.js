import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  FlatList,
  Modal,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGroup } from '../context/GroupContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function GroupScreen() {
  const insets = useSafeAreaInsets();
  const { colors, darkMode } = useTheme();
  const {
    cards,
    transactions,
    goals,
    categories,
  } = useApp();

  const {
    // Auth
    currentUser,
    isLoading,
    login,
    register,
    logout,

    // Group
    currentGroup,
    groupMembers,
    createGroup,
    joinGroup,
    leaveGroup,
    generateInviteCode,

    // Sharing
    sharedItems,
    shareItem,
    unshareItem,
    syncWithGroup,
    lastSync,
    isSyncing,

    // Shared data received
    sharedCards,
    sharedTransactions,
    sharedGoals,
  } = useGroup();

  // Local state
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [activeTab, setActiveTab] = useState('myData'); // 'myData' | 'shared' | 'members'
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareType, setShareType] = useState(null); // 'card' | 'transaction' | 'goal'
  const [selectedItemId, setSelectedItemId] = useState(null);

  // ─── AUTH HANDLERS ─────────────────────────────────────────────

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha usuário e senha');
      return;
    }
    const result = await login(username.trim(), password);
    if (!result.success) {
      Alert.alert('Erro', result.error || 'Falha no login');
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }
    const result = await register(username.trim(), password);
    if (result.success) {
      Alert.alert('Sucesso', 'Conta criada! Faça login para continuar.');
      setAuthMode('login');
      setPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('Erro', result.error || 'Falha no cadastro');
    }
  };

  // ─── GROUP HANDLERS ────────────────────────────────────────────

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Erro', 'Digite um nome para o grupo');
      return;
    }
    const result = await createGroup(groupName.trim());
    if (result.success) {
      Alert.alert(
        'Grupo criado!',
        `Código de convite: ${result.inviteCode}\n\nCompartilhe este código com quem quiser convidar.`
      );
      setGroupName('');
    } else {
      Alert.alert('Erro', result.error || 'Falha ao criar grupo');
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Erro', 'Digite o código de convite');
      return;
    }
    const result = await joinGroup(inviteCode.trim().toUpperCase());
    if (result.success) {
      Alert.alert('Sucesso', 'Você entrou no grupo!');
      setInviteCode('');
    } else {
      Alert.alert('Erro', result.error || 'Código inválido ou expirado');
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Sair do grupo',
      'Tem certeza? Seus dados compartilhados serão removidos do grupo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            const result = await leaveGroup();
            if (!result.success) {
              Alert.alert('Erro', result.error || 'Falha ao sair');
            }
          },
        },
      ]
    );
  };

  const handleGenerateNewCode = async () => {
    const result = await generateInviteCode();
    if (result.success) {
      Alert.alert(
        'Novo código gerado',
        `Código: ${result.inviteCode}\n\nO código antigo não funciona mais.`
      );
    }
  };

  // ─── SHARING HANDLERS ──────────────────────────────────────────

  const openShareModal = (type, itemId) => {
    setShareType(type);
    setSelectedItemId(itemId);
    setShareModalVisible(true);
  };

  const handleShare = async (permissions = { view: true, edit: false }) => {
    if (!shareType || !selectedItemId) return;

    const result = await shareItem(shareType, selectedItemId, permissions);
    setShareModalVisible(false);

    if (result.success) {
      Alert.alert('Compartilhado!', 'Item compartilhado com o grupo.');
    } else {
      Alert.alert('Erro', result.error || 'Falha ao compartilhar');
    }
  };

  const handleUnshare = async (type, itemId) => {
    Alert.alert(
      'Remover compartilhamento',
      'Os outros membros não verão mais este item.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const result = await unshareItem(type, itemId);
            if (!result.success) {
              Alert.alert('Erro', result.error || 'Falha ao remover');
            }
          },
        },
      ]
    );
  };

  const handleManualSync = async () => {
    const result = await syncWithGroup();
    if (result.success) {
      Alert.alert('Sincronizado!', 'Dados atualizados com sucesso.');
    } else {
      Alert.alert('Erro', result.error || 'Falha na sincronização');
    }
  };

  // ─── HELPERS ───────────────────────────────────────────────────

  const isItemShared = (type, id) => {
    return sharedItems.some(
      (item) => item.itemType === type && item.itemId === id
    );
  };

  const getSharedItemMeta = (type, id) => {
    return sharedItems.find(
      (item) => item.itemType === type && item.itemId === id
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ─── RENDER: AUTH SCREEN ───────────────────────────────────────

  if (!currentUser) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bgPrimary }]}
        contentContainerStyle={styles.authContainer}
      >
        <View style={styles.authHeader}>
          <Ionicons
            name="people-circle-outline"
            size={64}
            color={colors.primary}
          />
          <Text style={[styles.authTitle, { color: colors.textPrimary }]}>
            {'Grupos & Compartilhamento'}
          </Text>
          <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>{'Compartilhe cartões, transações e metas com sua família ou equipe'}
            </Text>
        </View>

        <View style={styles.authToggle}>
          <TouchableOpacity
            style={[
              styles.authToggleBtn,
              authMode === 'login' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAuthMode('login')}
          >
            <Text
              style={[
                styles.authToggleText,
                { color: authMode === 'login' ? '#fff' : colors.textPrimary },
              ]}
            >{'Entrar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.authToggleBtn,
              authMode === 'register' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAuthMode('register')}
          >
            <Text
              style={[
                styles.authToggleText,
                { color: authMode === 'register' ? '#fff' : colors.textPrimary },
              ]}
            >{'Criar conta'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: colors.bgCard }]}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Nome de usuário"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.bgCard }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Senha"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {authMode === 'register' && (
            <View style={[styles.inputContainer, { backgroundColor: colors.bgCard }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Confirmar senha"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: colors.primary }]}
            onPress={authMode === 'login' ? handleLogin : handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.authButtonText}>{authMode === 'login' ? 'Entrar' : 'Criar conta'}
            </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ─── RENDER: NO GROUP ──────────────────────────────────────────

  if (!currentGroup) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bgPrimary }]}
        contentContainerStyle={[styles.noGroupContainer, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.userHeader}>
          <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>{`Olá, ${currentUser.username}!`}
            </Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>{'Sair'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <Ionicons name="add-circle-outline" size={40} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{'Criar um grupo'}
            </Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>{'Crie um grupo e convide outras pessoas para compartilhar dados financeiros.'}
            </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.bgPrimary }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Nome do grupo"
              placeholderTextColor={colors.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateGroup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>{'Criar grupo'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.orText, { color: colors.textSecondary }]}>{'— ou —'}</Text>

        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <Ionicons name="enter-outline" size={40} color={colors.success} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{'Entrar em um grupo'}
            </Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>{'Digite o código de convite que você recebeu.'}
            </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.bgPrimary }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Código de convite"
              placeholderTextColor={colors.textSecondary}
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={8}
            />
          </View>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={handleJoinGroup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>{'Entrar no grupo'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ─── RENDER: GROUP DASHBOARD ───────────────────────────────────

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.groupHeader, { backgroundColor: colors.bgCard }]}>
        <View style={styles.groupHeaderTop}>
          <View>
            <Text style={[styles.groupName, { color: colors.textPrimary }]}>{currentGroup.name}
            </Text>
            <Text style={[styles.groupCode, { color: colors.textSecondary }]}>{`Código: ${currentGroup.inviteCode}`}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLeaveGroup}>
            <Ionicons name="exit-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.groupActions}>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: colors.primary + '20' }]}
            onPress={handleGenerateNewCode}
          >
            <Ionicons name="refresh-outline" size={14} color={colors.primary} />
            <Text style={[styles.smallButtonText, { color: colors.primary }]}>{'Novo código'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.smallButton,
              { backgroundColor: isSyncing ? colors.textSecondary + '20' : colors.success + '20' },
            ]}
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            <Ionicons
              name={isSyncing ? 'sync-outline' : 'cloud-upload-outline'}
              size={14}
              color={isSyncing ? colors.textSecondary : colors.success}
            />
            <Text
              style={[
                styles.smallButtonText,
                { color: isSyncing ? colors.textSecondary : colors.success },
              ]}
            >{isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.lastSync, { color: colors.textSecondary }]}>{`Última sincronização: ${formatDate(lastSync)}`}
            </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.bgCard }]}>
        {[
          { key: 'myData', icon: 'share-outline', label: 'Meus dados' },
          { key: 'shared', icon: 'download-outline', label: 'Recebidos' },
          { key: 'members', icon: 'people-outline', label: 'Membros' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? colors.primary : colors.textSecondary },
              ]}
            >{tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.tabContent}>
        {/* ─── MY DATA TAB ─────────────────────────────────────── */}
        {activeTab === 'myData' && (
          <View>
            {/* Cards Section */}
            <View style={styles.dataSection}>
              <Text style={[styles.dataSectionTitle, { color: colors.textPrimary }]}>
                <Ionicons name="card-outline" size={16} /> Cartões
              </Text>
              {cards.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{'Nenhum cartão cadastrado'}
            </Text>
              ) : (
                cards.map((card) => {
                  const shared = isItemShared('card', card.id);
                  const meta = getSharedItemMeta('card', card.id);
                  return (
                    <View
                      key={card.id}
                      style={[styles.itemRow, { backgroundColor: colors.bgCard }]}
                    >
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: colors.textPrimary }]}>{card.name}
            </Text>
                        <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>{`${card.type === 'credit' ? 'Crédito' : 'Débito'} • **** ${card.lastFour}`}
            </Text>
                        {shared && meta && (
                          <Text style={[styles.sharedBadge, { color: colors.success }]}>
                            <Ionicons name="checkmark-circle" size={12} /> Compartilhado
                            {meta.permissions?.edit && ' (edição)'}
                          </Text>
                        )}
                      </View>
                      <Switch
                        value={shared}
                        onValueChange={(value) => {
                          if (value) {
                            openShareModal('card', card.id);
                          } else {
                            handleUnshare('card', card.id);
                          }
                        }}
                        trackColor={{ false: colors.textSecondary + '40', true: colors.success }}
                        thumbColor={shared ? '#fff' : colors.textSecondary}
                      />
                    </View>
                  );
                })
              )}
            </View>

            {/* Transactions Section */}
            <View style={styles.dataSection}>
              <Text style={[styles.dataSectionTitle, { color: colors.textPrimary }]}>
                <Ionicons name="list-outline" size={16} /> Transações recentes
              </Text>
              {transactions.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{'Nenhuma transação'}
            </Text>
              ) : (
                transactions.slice(0, 20).map((tx) => {
                  const shared = isItemShared('transaction', tx.id);
                  const meta = getSharedItemMeta('transaction', tx.id);
                  const category = categories.find((c) => c.id === tx.categoryId);
                  return (
                    <View
                      key={tx.id}
                      style={[styles.itemRow, { backgroundColor: colors.bgCard }]}
                    >
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: colors.textPrimary }]}>{tx.description || 'Sem descrição'}
            </Text>
                        <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>{'R$ {tx.amount?.toFixed(2)} • {category?.name || \'Sem categoria\'}'}
            </Text>
                        {shared && meta && (
                          <Text style={[styles.sharedBadge, { color: colors.success }]}>
                            <Ionicons name="checkmark-circle" size={12} /> Compartilhado
                          </Text>
                        )}
                      </View>
                      <Switch
                        value={shared}
                        onValueChange={(value) => {
                          if (value) {
                            openShareModal('transaction', tx.id);
                          } else {
                            handleUnshare('transaction', tx.id);
                          }
                        }}
                        trackColor={{ false: colors.textSecondary + '40', true: colors.success }}
                        thumbColor={shared ? '#fff' : colors.textSecondary}
                      />
                    </View>
                  );
                })
              )}
            </View>

            {/* Goals Section */}
            <View style={styles.dataSection}>
              <Text style={[styles.dataSectionTitle, { color: colors.textPrimary }]}>
                <Ionicons name="flag-outline" size={16} /> Metas
              </Text>
              {goals.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{'Nenhuma meta'}
            </Text>
              ) : (
                goals.map((goal) => {
                  const shared = isItemShared('goal', goal.id);
                  const meta = getSharedItemMeta('goal', goal.id);
                  const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                  return (
                    <View
                      key={goal.id}
                      style={[styles.itemRow, { backgroundColor: colors.bgCard }]}
                    >
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: colors.textPrimary }]}>{goal.name}
            </Text>
                        <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>{`R$ ${goal.current?.toFixed(2)} / R$ ${goal.target?.toFixed(2)} (${progress.toFixed(0)}%)`}
            </Text>
                        {shared && meta && (
                          <Text style={[styles.sharedBadge, { color: colors.success }]}>
                            <Ionicons name="checkmark-circle" size={12} /> Compartilhado
                            {meta.permissions?.edit && ' (edição)'}
                          </Text>
                        )}
                      </View>
                      <Switch
                        value={shared}
                        onValueChange={(value) => {
                          if (value) {
                            openShareModal('goal', goal.id);
                          } else {
                            handleUnshare('goal', goal.id);
                          }
                        }}
                        trackColor={{ false: colors.textSecondary + '40', true: colors.success }}
                        thumbColor={shared ? '#fff' : colors.textSecondary}
                      />
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* ─── SHARED DATA TAB ───────────────────────────────────── */}
        {activeTab === 'shared' && (
          <View>
            {/* Shared Cards */}
            <View style={styles.dataSection}>
              <Text style={[styles.dataSectionTitle, { color: colors.textPrimary }]}>
                <Ionicons name="card-outline" size={16} /> Cartões compartilhados
              </Text>
              {(!sharedCards || sharedCards.length === 0) ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{'Nenhum cartão compartilhado com você'}
            </Text>
              ) : (
                sharedCards.map((card) => (
                  <View
                    key={card.id}
                    style={[styles.sharedItemRow, { backgroundColor: colors.bgCard }]}
                  >
                    <View style={styles.sharedItemHeader}>
                      <Text style={[styles.itemName, { color: colors.textPrimary }]}>{card.name}
            </Text>
                      <View style={styles.ownerBadge}>
                        <Ionicons name="person-outline" size={10} color={colors.primary} />
                        <Text style={[styles.ownerText, { color: colors.primary }]}>{card.ownerUsername}
            </Text>
                      </View>
                    </View>
                    <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>{`${card.type === 'credit' ? 'Crédito' : 'Débito'} • **** ${card.lastFour}`}
            </Text>
                    {card.permissions?.edit && (
                      <Text style={[styles.editBadge, { color: colors.warning }]}>
                        <Ionicons name="create-outline" size={10} /> Você pode editar
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>

            {/* Shared Transactions */}
            <View style={styles.dataSection}>
              <Text style={[styles.dataSectionTitle, { color: colors.textPrimary }]}>
                <Ionicons name="list-outline" size={16} /> Transações compartilhadas
              </Text>
              {(!sharedTransactions || sharedTransactions.length === 0) ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{'Nenhuma transação compartilhada'}
            </Text>
              ) : (
                sharedTransactions.map((tx) => (
                  <View
                    key={tx.id}
                    style={[styles.sharedItemRow, { backgroundColor: colors.bgCard }]}
                  >
                    <View style={styles.sharedItemHeader}>
                      <Text style={[styles.itemName, { color: colors.textPrimary }]}>{tx.description || 'Sem descrição'}
            </Text>
                      <View style={styles.ownerBadge}>
                        <Ionicons name="person-outline" size={10} color={colors.primary} />
                        <Text style={[styles.ownerText, { color: colors.primary }]}>{tx.ownerUsername}
            </Text>
                      </View>
                    </View>
                    <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>{'R$ {tx.amount?.toFixed(2)} • {tx.date}'}
            </Text>
                  </View>
                ))
              )}
            </View>

            {/* Shared Goals */}
            <View style={styles.dataSection}>
              <Text style={[styles.dataSectionTitle, { color: colors.textPrimary }]}>
                <Ionicons name="flag-outline" size={16} /> Metas compartilhadas
              </Text>
              {(!sharedGoals || sharedGoals.length === 0) ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{'Nenhuma meta compartilhada'}
            </Text>
              ) : (
                sharedGoals.map((goal) => {
                  const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                  return (
                    <View
                      key={goal.id}
                      style={[styles.sharedItemRow, { backgroundColor: colors.bgCard }]}
                    >
                      <View style={styles.sharedItemHeader}>
                        <Text style={[styles.itemName, { color: colors.textPrimary }]}>{goal.name}
            </Text>
                        <View style={styles.ownerBadge}>
                          <Ionicons name="person-outline" size={10} color={colors.primary} />
                          <Text style={[styles.ownerText, { color: colors.primary }]}>{goal.ownerUsername}
            </Text>
                        </View>
                      </View>
                      <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>{`R$ ${goal.current?.toFixed(2)} / R$ ${goal.target?.toFixed(2)} (${progress.toFixed(0)}%)`}
            </Text>
                      {goal.permissions?.edit && (
                        <Text style={[styles.editBadge, { color: colors.warning }]}>
                          <Ionicons name="create-outline" size={10} /> Você pode editar
                        </Text>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* ─── MEMBERS TAB ───────────────────────────────────────── */}
        {activeTab === 'members' && (
          <View style={styles.dataSection}>
            <Text style={[styles.dataSectionTitle, { color: colors.textPrimary }]}>
              <Ionicons name="people-outline" size={16} /> Membros do grupo
            </Text>
            {(!groupMembers || groupMembers.length === 0) ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{'Carregando membros...'}
            </Text>
            ) : (
              groupMembers.map((member) => (
                <View
                  key={member.id}
                  style={[styles.memberRow, { backgroundColor: colors.bgCard }]}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{member.username?.charAt(0)?.toUpperCase() || '?'}
            </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.textPrimary }]}>
                      {member.username}
                      {member.id === currentUser.id && (
                        <Text style={[styles.youBadge, { color: colors.primary }]}> (você)</Text>
                      )}
                    </Text>
                    <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{member.role === 'admin' ? 'Administrador' : 'Membro'}
            </Text>
                  </View>
                  {member.id === currentGroup?.adminId && (
                    <Ionicons name="shield-checkmark" size={18} color={colors.warning} />
                  )}
                </View>
              ))
            )}

            <View style={[styles.inviteBox, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.inviteTitle, { color: colors.textPrimary }]}>{'Convidar novo membro'}
            </Text>
              <Text style={[styles.inviteCode, { color: colors.primary }]}>{currentGroup?.inviteCode}
            </Text>
              <Text style={[styles.inviteHint, { color: colors.textSecondary }]}>{'Compartilhe este código para convidar alguém'}
            </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>

      {/* Share Permissions Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{`Compartilhar ${shareType === 'card' ? 'cartão' : shareType === 'transaction' ? 'transação' : 'meta'}`}</Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>{'Escolha as permissões de acesso para os membros do grupo:'}
            </Text>

            <TouchableOpacity
              style={[styles.permissionOption, { borderColor: colors.border }]}
              onPress={() => handleShare({ view: true, edit: false })}
            >
              <Ionicons name="eye-outline" size={24} color={colors.primary} />
              <View style={styles.permissionText}>
                <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>{'Apenas visualizar'}
            </Text>
                <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>{'Membros podem ver, mas não editar'}
            </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.permissionOption, { borderColor: colors.border }]}
              onPress={() => handleShare({ view: true, edit: true })}
            >
              <Ionicons name="create-outline" size={24} color={colors.warning} />
              <View style={styles.permissionText}>
                <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>{'Visualizar e editar'}
            </Text>
                <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>{'Membros podem ver e fazer alterações'}
            </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setShareModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{'Cancelar'}
            </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Auth
  authContainer: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  authSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  authToggle: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  authToggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  authButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // No Group
  noGroupContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  sectionDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    marginVertical: 12,
    fontWeight: '500',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Group Dashboard
  groupHeader: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  groupHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
  },
  groupCode: {
    fontSize: 13,
    marginTop: 2,
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastSync: {
    fontSize: 11,
    marginTop: 8,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },

  // Data Sections
  dataSection: {
    marginBottom: 20,
  },
  dataSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },

  // Item Row (My Data)
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  sharedBadge: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },

  // Shared Item Row
  sharedItemRow: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  sharedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ownerText: {
    fontSize: 10,
    fontWeight: '600',
  },
  editBadge: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },

  // Members
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  youBadge: {
    fontWeight: '400',
  },
  memberRole: {
    fontSize: 12,
    marginTop: 2,
  },
  inviteBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  inviteCode: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    marginVertical: 8,
  },
  inviteHint: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  permissionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  permissionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});