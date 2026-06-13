import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ============================================
// SERVIÇO DE SINCRONIZAÇÃO - BLUETOOTH + INTERNET
// ============================================
// Este serviço gerencia a sincronização de dados entre dispositivos
// em um grupo. Suporta dois modos:
// 1. BLUETOOTH: P2P direto entre dispositivos próximos
// 2. INTERNET: Sincronização via servidor/cloud (simulado localmente)

const SYNC_CONFIG_KEY = '@checkfinances_sync_config';
const SYNC_QUEUE_KEY = '@checkfinances_sync_queue';
const GROUP_DATA_KEY = '@checkfinances_group_data';

class SyncService {
  constructor() {
    this.syncMode = 'internet'; // 'bluetooth' | 'internet' | 'both'
    this.isSyncing = false;
    this.syncInterval = null;
    this.bluetoothEnabled = false;
    this.listeners = [];
    this.syncQueue = [];
  }

  // Inicializa o serviço de sincronização
  async initialize(mode = 'internet') {
    this.syncMode = mode;

    // Carrega configurações salvas
    const config = await AsyncStorage.getItem(SYNC_CONFIG_KEY);
    if (config) {
      const parsed = JSON.parse(config);
      this.syncMode = parsed.mode || mode;
    }

    // Carrega fila de sincronização pendente
    const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (queue) {
      this.syncQueue = JSON.parse(queue);
    }

    console.log(`[SyncService] Inicializado em modo: ${this.syncMode}`);
    return true;
  }

  // ============================================
  // MODO INTERNET (Simulação P2P via AsyncStorage)
  // ============================================
  // Na prática, aqui você conectaria a um backend real (Firebase, Supabase, etc.)
  // Para demo, usamos AsyncStorage como "servidor" compartilhado local

  async syncViaInternet(groupId, localData, userId) {
    try {
      console.log(`[SyncService] Sincronizando via Internet - Grupo: ${groupId}`);

      // Simula "servidor" usando AsyncStorage
      const serverKey = `${GROUP_DATA_KEY}_${groupId}`;
      const serverData = await AsyncStorage.getItem(serverKey);

      let serverState = serverData ? JSON.parse(serverData) : {
        groupId,
        lastUpdated: 0,
        dataByUser: {},
        mergedData: null,
      };

      // Envia dados locais para o "servidor"
      serverState.dataByUser[userId] = {
        ...localData,
        timestamp: Date.now(),
        userId,
      };

      // Merge inteligente dos dados
      const mergedData = this.mergeGroupData(serverState.dataByUser);
      serverState.mergedData = mergedData;
      serverState.lastUpdated = Date.now();

      await AsyncStorage.setItem(serverKey, JSON.stringify(serverState));

      // Retorna dados mesclados (incluindo do outro usuário)
      return {
        success: true,
        data: mergedData,
        timestamp: serverState.lastUpdated,
      };
    } catch (error) {
      console.error('[SyncService] Erro na sincronização Internet:', error);
      return { success: false, error: error.message };
    }
  }

  // Busca dados atualizados do "servidor"
  async fetchGroupData(groupId, userId) {
    try {
      const serverKey = `${GROUP_DATA_KEY}_${groupId}`;
      const serverData = await AsyncStorage.getItem(serverKey);

      if (!serverData) {
        return { success: true, data: null };
      }

      const serverState = JSON.parse(serverData);

      // Retorna dados dos OUTROS usuários (não do atual)
      const otherUsersData = {};
      Object.keys(serverState.dataByUser).forEach(uid => {
        if (uid !== userId) {
          otherUsersData[uid] = serverState.dataByUser[uid];
        }
      });

      return {
        success: true,
        data: serverState.mergedData,
        otherUsersData,
        lastUpdated: serverState.lastUpdated,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // MODO BLUETOOTH (P2P Direto)
  // ============================================
  // Usa react-native-bluetooth-classic ou similar
  // Aqui está a estrutura base - você precisa instalar:
  // npm install react-native-bluetooth-classic

  async initializeBluetooth() {
    // Verifica se o módulo está disponível
    try {
      const BluetoothClassic = require('react-native-bluetooth-classic').default;
      this.bluetoothModule = BluetoothClassic;
      this.bluetoothEnabled = true;
      console.log('[SyncService] Bluetooth inicializado');
      return true;
    } catch (error) {
      console.warn('[SyncService] Módulo Bluetooth não disponível:', error.message);
      this.bluetoothEnabled = false;
      return false;
    }
  }

  async startBluetoothDiscovery() {
    if (!this.bluetoothEnabled || !this.bluetoothModule) {
      return { success: false, error: 'Bluetooth não disponível' };
    }

    try {
      const paired = await this.bluetoothModule.getBondedDevices();
      const available = paired.filter(device => device.name && device.address);

      console.log(`[SyncService] Dispositivos Bluetooth encontrados: ${available.length}`);
      return { success: true, devices: available };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendViaBluetooth(deviceAddress, data) {
    if (!this.bluetoothEnabled || !this.bluetoothModule) {
      return { success: false, error: 'Bluetooth não disponível' };
    }

    try {
      const connected = await this.bluetoothModule.connectToDevice(deviceAddress);
      if (!connected) {
        return { success: false, error: 'Não foi possível conectar ao dispositivo' };
      }

      const payload = JSON.stringify({
        type: 'SYNC_DATA',
        timestamp: Date.now(),
        data,
      });

      await this.bluetoothModule.writeToDevice(deviceAddress, payload);
      await this.bluetoothModule.disconnectFromDevice(deviceAddress);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async receiveBluetoothData(callback) {
    if (!this.bluetoothEnabled || !this.bluetoothModule) return;

    this.bluetoothModule.onDataReceived((event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'SYNC_DATA') {
          callback({
            type: 'bluetooth',
            timestamp: payload.timestamp,
            data: payload.data,
          });
        }
      } catch (error) {
        console.error('[SyncService] Erro ao processar dados Bluetooth:', error);
      }
    });
  }

  // ============================================
  // MERGE INTELIGENTE DE DADOS
  // ============================================

  mergeGroupData(dataByUser) {
    const merged = {
      expenses: [],
      categories: [],
      cards: [],
      cashBalance: 0,
      lastUpdated: Date.now(),
    };

    const expenseMap = new Map();
    const categoryMap = new Map();
    const cardMap = new Map();

    // Processa dados de cada usuário
    Object.values(dataByUser).forEach(userData => {
      if (!userData) return;

      // Merge expenses (mantém o mais recente por ID)
      (userData.expenses || []).forEach(expense => {
        const existing = expenseMap.get(expense.id);
        if (!existing || expense.updatedAt > existing.updatedAt) {
          expenseMap.set(expense.id, { ...expense, _sourceUser: userData.userId });
        }
      });

      // Merge categories
      (userData.categories || []).forEach(cat => {
        if (!categoryMap.has(cat.id)) {
          categoryMap.set(cat.id, cat);
        }
      });

      // Merge cards
      (userData.cards || []).forEach(card => {
        if (!cardMap.has(card.id)) {
          cardMap.set(card.id, card);
        }
      });

      // Soma saldos de caixa
      if (typeof userData.cashBalance === 'number') {
        merged.cashBalance += userData.cashBalance;
      }
    });

    merged.expenses = Array.from(expenseMap.values());
    merged.categories = Array.from(categoryMap.values());
    merged.cards = Array.from(cardMap.values());

    return merged;
  }

  // ============================================
  // AUTO-SYNC
  // ============================================

  startAutoSync(groupId, userId, getLocalData, onDataReceived, interval = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (this.isSyncing) return;

      this.isSyncing = true;
      try {
        const localData = getLocalData();

        if (this.syncMode === 'internet' || this.syncMode === 'both') {
          // Envia dados
          await this.syncViaInternet(groupId, localData, userId);

          // Busca dados atualizados
          const result = await this.fetchGroupData(groupId, userId);
          if (result.success && result.data) {
            onDataReceived(result.data);
          }
        }
      } catch (error) {
        console.error('[SyncService] Erro no auto-sync:', error);
      } finally {
        this.isSyncing = false;
      }
    }, interval);

    console.log(`[SyncService] Auto-sync iniciado (${interval}ms)`);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[SyncService] Auto-sync parado');
    }
  }

  // ============================================
  // UTILITÁRIOS
  // ============================================

  async clearGroupData(groupId) {
    const serverKey = `${GROUP_DATA_KEY}_${groupId}`;
    await AsyncStorage.removeItem(serverKey);
  }

  async getSyncHistory(groupId) {
    const serverKey = `${GROUP_DATA_KEY}_${groupId}`;
    const data = await AsyncStorage.getItem(serverKey);
    if (!data) return [];

    const state = JSON.parse(data);
    return Object.values(state.dataByUser).map(d => ({
      userId: d.userId,
      timestamp: d.timestamp,
    }));
  }
}

export default new SyncService();
