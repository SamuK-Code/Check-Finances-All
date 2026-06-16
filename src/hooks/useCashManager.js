// /src/hooks/useCashManager.js
// ATUALIZADO: Toast antigo removido, ToastManager adicionado

import { useCallback } from 'react';
import { useCash } from '../contexts/CashContext';
import { ToastManager } from '../components/Overlays';

export const useCashManager = () => {
  const { addCash, updateCash, deleteCash, refreshCash } = useCash();

  const handleAddCash = useCallback(async (data) => {
    try {
      await addCash(data);
      ToastManager.show('Entrada adicionada com sucesso!', 'success');
      return true;
    } catch (error) {
      ToastManager.show(error.message || 'Erro ao adicionar entrada', 'error');
      return false;
    }
  }, [addCash]);

  const handleUpdateCash = useCallback(async (id, data) => {
    try {
      await updateCash(id, data);
      ToastManager.show('Entrada atualizada!', 'success');
      return true;
    } catch (error) {
      ToastManager.show(error.message || 'Erro ao atualizar entrada', 'error');
      return false;
    }
  }, [updateCash]);

  const handleDeleteCash = useCallback(async (id) => {
    try {
      await deleteCash(id);
      ToastManager.show('Entrada removida!', 'success');
      return true;
    } catch (error) {
      ToastManager.show(error.message || 'Erro ao remover entrada', 'error');
      return false;
    }
  }, [deleteCash]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshCash();
      ToastManager.show('Dados atualizados!', 'success', 2000);
    } catch (error) {
      ToastManager.show('Erro ao atualizar dados', 'error');
    }
  }, [refreshCash]);

  return {
    handleAddCash,
    handleUpdateCash,
    handleDeleteCash,
    handleRefresh,
  };
};