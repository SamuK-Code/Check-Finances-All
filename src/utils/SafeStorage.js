import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  EXPENSES: '@expenses',
  CARDS: '@cards',
  CATEGORY_LIMITS: '@categoryLimits',
  CUSTOM_CATEGORIES: '@customCategories',
  DARK_MODE: '@darkMode',
  CASH_BALANCE: '@cashBalance',
  GOALS: '@goals',
  ALERTS_ENABLED: '@alertsEnabled',
  SOUND_ENABLED: '@soundEnabled',
  COMPLETED_EXPENSES: '@completedExpenses',
  CASH_TRANSACTIONS: '@cashTransactions',
  BACKUP_PREFIX: '@backup_',
};

// Safe get with error handling
export const safeGetItem = async (key, defaultValue = null) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null || value === undefined || value === '' || value === 'undefined' || value === 'null') {
      return defaultValue;
    }
    if (typeof value !== 'string') return defaultValue;
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') {
      return defaultValue;
    }
    if ((trimmed.startsWith('[') && !trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && !trimmed.endsWith('}'))) {
      console.warn(`Incomplete JSON for key ${key}, returning default`);
      return defaultValue;
    }
    try {
      return JSON.parse(trimmed);
    } catch (parseError) {
      if (trimmed === 'true') return true;
      if (trimmed === 'false') return false;
      const num = parseFloat(trimmed);
      if (!isNaN(num) && isFinite(num)) {
        return num;
      }
      console.warn(`Invalid JSON for key ${key}, returning default. Value:`, trimmed.substring(0, 50));
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
};

// Safe set with error handling and backup
export const safeSetItem = async (key, value) => {
  try {
    if (value === undefined || value === null) {
      console.warn(`Attempted to save null/undefined for key ${key}`);
      return false;
    }
    const jsonValue = JSON.stringify(value);
    if (!jsonValue || jsonValue === '' || jsonValue === 'undefined' || jsonValue === 'null') {
      throw new Error('Failed to stringify value');
    }
    const sizeInBytes = jsonValue.length * 2;
    if (sizeInBytes > 2 * 1024 * 1024) {
      throw new Error('Data too large to save');
    }
    await AsyncStorage.setItem(key, jsonValue);
    await createBackup(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    const backup = await getBackup(key);
    if (backup) {
      console.log(`Restored ${key} from backup`);
      return false;
    }
    return false;
  }
};

// Safe remove with error handling
export const safeRemoveItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
};

// Create backup
const createBackup = async (key, value) => {
  try {
    const backupKey = `${STORAGE_KEYS.BACKUP_PREFIX}${key}`;
    const timestamp = Date.now();
    const backupData = {
      data: value,
      timestamp,
      version: '2.0',
    };
    await AsyncStorage.setItem(backupKey, JSON.stringify(backupData));
  } catch (error) {
    console.error('Backup creation failed:', error);
  }
};

// Get backup
const getBackup = async (key) => {
  try {
    const backupKey = `${STORAGE_KEYS.BACKUP_PREFIX}${key}`;
    const backup = await AsyncStorage.getItem(backupKey);
    if (backup) {
      const parsed = JSON.parse(backup);
      return parsed.data;
    }
    return null;
  } catch (error) {
    console.error('Backup retrieval failed:', error);
    return null;
  }
};

// Restore from backup
export const restoreFromBackup = async (key) => {
  try {
    const backup = await getBackup(key);
    if (backup) {
      await AsyncStorage.setItem(key, backup);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Restore from backup failed:', error);
    return false;
  }
};

// Clear all data with confirmation
export const clearAllData = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS).filter(k => !k.includes('BACKUP'));
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Clear all data failed:', error);
    return false;
  }
};

// Get storage info
export const getStorageInfo = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    let totalSize = 0;
    const info = {};
    items.forEach(([key, value]) => {
      if (value) {
        const size = value.length * 2;
        totalSize += size;
        info[key] = {
          size: `${(size / 1024).toFixed(2)} KB`,
          entries: value.startsWith('[') ? JSON.parse(value).length : 1,
        };
      }
    });
    return {
      totalKeys: keys.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      details: info,
    };
  } catch (error) {
    console.error('Get storage info failed:', error);
    return null;
  }
};

// Validate data integrity
export const validateDataIntegrity = async () => {
  const issues = [];
  try {
    const expenses = await safeGetItem(STORAGE_KEYS.EXPENSES, []);
    if (!Array.isArray(expenses)) {
      issues.push('Expenses data is corrupted');
    } else {
      expenses.forEach((exp, index) => {
        if (!exp.id) issues.push(`Expense ${index}: missing ID`);
        if (!exp.amount) issues.push(`Expense ${index}: missing amount`);
        if (!exp.description) issues.push(`Expense ${index}: missing description`);
      });
    }
    const cards = await safeGetItem(STORAGE_KEYS.CARDS, []);
    if (!Array.isArray(cards)) {
      issues.push('Cards data is corrupted');
    }
    const categories = await safeGetItem(STORAGE_KEYS.CUSTOM_CATEGORIES, []);
    if (!Array.isArray(categories)) {
      issues.push('Categories data is corrupted');
    }
    return {
      valid: issues.length === 0,
      issues,
    };
  } catch (error) {
    return {
      valid: false,
      issues: ['Data integrity check failed: ' + error.message],
    };
  }
};

// Export data for backup
export const exportAllData = async () => {
  try {
    const data = {
      expenses: await safeGetItem(STORAGE_KEYS.EXPENSES, []),
      cards: await safeGetItem(STORAGE_KEYS.CARDS, []),
      categoryLimits: await safeGetItem(STORAGE_KEYS.CATEGORY_LIMITS, {}),
      customCategories: await safeGetItem(STORAGE_KEYS.CUSTOM_CATEGORIES, []),
      darkMode: await safeGetItem(STORAGE_KEYS.DARK_MODE, false),
      cashBalance: await safeGetItem(STORAGE_KEYS.CASH_BALANCE, 0),
      goals: await safeGetItem(STORAGE_KEYS.GOALS, []),
      exportDate: new Date().toISOString(),
      version: '2.0',
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Export failed:', error);
    return null;
  }
};

// Import data from backup
export const importAllData = async (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.expenses || !Array.isArray(data.expenses)) {
      throw new Error('Invalid backup format: expenses missing');
    }
    if (!data.cards || !Array.isArray(data.cards)) {
      throw new Error('Invalid backup format: cards missing');
    }
    await safeSetItem(STORAGE_KEYS.EXPENSES, data.expenses);
    await safeSetItem(STORAGE_KEYS.CARDS, data.cards);
    await safeSetItem(STORAGE_KEYS.CATEGORY_LIMITS, data.categoryLimits || {});
    await safeSetItem(STORAGE_KEYS.CUSTOM_CATEGORIES, data.customCategories || []);
    await safeSetItem(STORAGE_KEYS.DARK_MODE, data.darkMode || false);
    await safeSetItem(STORAGE_KEYS.CASH_BALANCE, data.cashBalance || 0);
    await safeSetItem(STORAGE_KEYS.GOALS, data.goals || []);
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
};

// ============================================
// FUNÇÕES DO StorageUtils.js (movidas para cá)
// ============================================

/**
 * Limpa TODOS os dados do AsyncStorage
 * Útil para reset completo do app
 */
export async function clearAllStorage() {
  try {
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage limpo completamente');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar AsyncStorage:', error);
    return false;
  }
}

/**
 * Lista todas as chaves no AsyncStorage (para debug)
 */
export async function listStorageKeys() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('Chaves no AsyncStorage:', keys);
    return keys;
  } catch (error) {
    console.error('Erro ao listar chaves:', error);
    return [];
  }
}