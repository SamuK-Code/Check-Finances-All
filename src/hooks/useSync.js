// /src/hooks/useSync.js
// ATUALIZADO: Toast/AlertPopup antigos removidos, ToastManager adicionado

import { useCallback, useState } from 'react';
import { useGroup } from '../contexts/GroupContext';
import { ToastManager } from '../components/Overlays';

export const useSync = () => {
  const { syncData, lastSync } = useGroup();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    ToastManager.show('Sincronizando...', 'info', 2000);

    try {
      await syncData();
      ToastManager.show('Sincronização concluída!', 'success');
    } catch (error) {
      ToastManager.show(error.message || 'Erro na sincronização', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [syncData, isSyncing]);

  return {
    isSyncing,
    lastSync,
    handleSync,
  };
};