// GroupContext.js — Login, Grupos e Sincronização com Supabase
// VERSÃO CORRIGIDA — compatível com GroupScreen.js

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, hashPassword } from '../utils/supabase';

const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [sharedItems, setSharedItems] = useState([]); // O que EU compartilhei
  const [sharedCards, setSharedCards] = useState([]); // O que recebi de OUTROS
  const [sharedTransactions, setSharedTransactions] = useState([]);
  const [sharedGoals, setSharedGoals] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);

  const syncIntervalRef = useRef(null);

  // Carregar sessão salva
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const [savedUser, savedGroup, savedShared, savedSyncEnabled] = await Promise.all([
        AsyncStorage.getItem('group_user'),
        AsyncStorage.getItem('group_current'),
        AsyncStorage.getItem('group_shared_items'),
        AsyncStorage.getItem('group_sync_enabled'),
      ]);

      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      if (savedGroup) {
        const group = JSON.parse(savedGroup);
        setCurrentGroup(group);
        // Carregar membros se tem grupo
        fetchGroupMembers(group.id);
      }
      if (savedShared) setSharedItems(JSON.parse(savedShared));
      if (savedSyncEnabled) setSyncEnabled(JSON.parse(savedSyncEnabled));
    } catch (e) {
      console.warn('Erro ao carregar sessão:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSession = async (user, group) => {
    try {
      if (user) await AsyncStorage.setItem('group_user', JSON.stringify(user));
      else await AsyncStorage.removeItem('group_user');

      if (group) await AsyncStorage.setItem('group_current', JSON.stringify(group));
      else await AsyncStorage.removeItem('group_current');
    } catch (e) {
      console.warn('Erro ao salvar sessão:', e);
    }
  };

  const saveSharedItems = async (items) => {
    try {
      await AsyncStorage.setItem('group_shared_items', JSON.stringify(items));
    } catch (e) {
      console.warn('Erro ao salvar shared items:', e);
    }
  };

  // ========== AUTH ==========

  const register = async (username, password) => {
    try {
      const passwordHash = hashPassword(password);

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (existing) return { error: 'Usuário já existe' };

      const { data, error } = await supabase
        .from('users')
        .insert([{ username, password_hash: passwordHash }])
        .select()
        .single();

      if (error) throw error;

      const user = { id: data.id, username: data.username };
      setCurrentUser(user);
      await saveSession(user, null);
      return { success: true };
    } catch (e) {
      return { error: e.message || 'Erro ao cadastrar' };
    }
  };

  const login = async (username, password) => {
    try {
      const passwordHash = hashPassword(password);

      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !data) return { error: 'Usuário ou senha incorretos' };

      const user = { id: data.id, username: data.username };
      setCurrentUser(user);
      await saveSession(user, null);
      return { success: true };
    } catch (e) {
      return { error: e.message || 'Erro ao fazer login' };
    }
  };

  const logout = async () => {
    // Limpar intervalo de sync
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    setCurrentUser(null);
    setCurrentGroup(null);
    setGroupMembers([]);
    setSharedItems([]);
    setSharedCards([]);
    setSharedTransactions([]);
    setSharedGoals([]);
    setLastSync(null);
    setSyncEnabled(false);

    await AsyncStorage.multiRemove([
      'group_user',
      'group_current',
      'group_shared_items',
      'group_sync_enabled',
    ]);
  };

  // ========== GRUPOS ==========

  const fetchGroupMembers = async (groupId) => {
    if (!groupId) return;
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('user_id, role, users(username)')
        .eq('group_id', groupId);

      if (error) throw error;

      const members = data.map(m => ({
        id: m.user_id,
        username: m.users?.username || 'Desconhecido',
        role: m.role || 'member',
      }));

      setGroupMembers(members);
    } catch (e) {
      console.warn('Erro ao buscar membros:', e);
    }
  };

  const createGroup = async (name) => {
    if (!currentUser) return { error: 'Faça login primeiro' };

    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from('groups')
        .insert([{ 
          name, 
          code, 
          created_by: currentUser.id 
        }])
        .select()
        .single();

      if (error) throw error;

      // Adicionar criador como admin
      await supabase
        .from('group_members')
        .insert([{ 
          group_id: data.id, 
          user_id: currentUser.id,
          role: 'admin'
        }]);

      const group = { 
        id: data.id, 
        name: data.name, 
        inviteCode: data.code,
        adminId: currentUser.id,
      };

      setCurrentGroup(group);
      await saveSession(currentUser, group);
      await fetchGroupMembers(data.id);

      return { success: true, inviteCode: code };
    } catch (e) {
      return { error: e.message || 'Erro ao criar grupo' };
    }
  };

  const joinGroup = async (code) => {
    if (!currentUser) return { error: 'Faça login primeiro' };

    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, name, code, created_by')
        .eq('code', code.toUpperCase())
        .single();

      if (groupError || !group) return { error: 'Grupo não encontrado' };

      // Verificar se já é membro
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', currentUser.id)
        .single();

      if (!existingMember) {
        await supabase
          .from('group_members')
          .insert([{ 
            group_id: group.id, 
            user_id: currentUser.id,
            role: 'member'
          }]);
      }

      const groupData = { 
        id: group.id, 
        name: group.name, 
        inviteCode: group.code,
        adminId: group.created_by,
      };

      setCurrentGroup(groupData);
      await saveSession(currentUser, groupData);
      await fetchGroupMembers(group.id);

      return { success: true };
    } catch (e) {
      return { error: e.message || 'Erro ao entrar no grupo' };
    }
  };

  const leaveGroup = async () => {
    if (!currentGroup || !currentUser) return { error: 'Não está em um grupo' };

    try {
      // Remover todos os shared items deste usuário neste grupo
      await supabase
        .from('shared_items')
        .delete()
        .eq('group_id', currentGroup.id)
        .eq('user_id', currentUser.id);

      // Remover membro do grupo
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', currentGroup.id)
        .eq('user_id', currentUser.id);

      // Limpar intervalo
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }

      setCurrentGroup(null);
      setGroupMembers([]);
      setSharedItems([]);
      setSharedCards([]);
      setSharedTransactions([]);
      setSharedGoals([]);
      setLastSync(null);
      setSyncEnabled(false);

      await saveSession(currentUser, null);
      await AsyncStorage.multiRemove([
        'group_shared_items',
        'group_sync_enabled',
      ]);

      return { success: true };
    } catch (e) {
      return { error: e.message || 'Erro ao sair do grupo' };
    }
  };

  const generateInviteCode = async () => {
    if (!currentGroup || !currentUser) return { error: 'Sem permissão' };

    // Apenas admin pode gerar novo código
    if (currentGroup.adminId !== currentUser.id) {
      return { error: 'Apenas o administrador pode gerar novo código' };
    }

    try {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error } = await supabase
        .from('groups')
        .update({ code: newCode })
        .eq('id', currentGroup.id);

      if (error) throw error;

      const updatedGroup = { ...currentGroup, inviteCode: newCode };
      setCurrentGroup(updatedGroup);
      await saveSession(currentUser, updatedGroup);

      return { success: true, inviteCode: newCode };
    } catch (e) {
      return { error: e.message || 'Erro ao gerar código' };
    }
  };

  // ========== COMPARTILHAMENTO SELETIVO ==========

  const shareItem = async (itemType, itemId, permissions = { view: true, edit: false }) => {
    if (!currentGroup || !currentUser) return { error: 'Faça login e entre em um grupo' };

    try {
      // Verificar se já está compartilhado
      const alreadyShared = sharedItems.find(
        item => item.itemType === itemType && item.itemId === itemId
      );

      if (alreadyShared) {
        // Atualizar permissões
        const { error } = await supabase
          .from('shared_items')
          .update({ permissions })
          .eq('id', alreadyShared.remoteId);

        if (error) throw error;

        const updated = sharedItems.map(item =>
          item.itemType === itemType && item.itemId === itemId
            ? { ...item, permissions }
            : item
        );
        setSharedItems(updated);
        await saveSharedItems(updated);

        return { success: true };
      }

      // Inserir novo
      const { data, error } = await supabase
        .from('shared_items')
        .insert([{
          group_id: currentGroup.id,
          user_id: currentUser.id,
          item_type: itemType,
          item_id: itemId,
          permissions,
        }])
        .select()
        .single();

      if (error) throw error;

      const newShared = [
        ...sharedItems,
        {
          remoteId: data.id,
          itemType,
          itemId,
          permissions,
          sharedAt: data.created_at,
        },
      ];

      setSharedItems(newShared);
      await saveSharedItems(newShared);

      // Trigger sync imediato
      await syncWithGroup();

      return { success: true };
    } catch (e) {
      return { error: e.message || 'Erro ao compartilhar' };
    }
  };

  const unshareItem = async (itemType, itemId) => {
    if (!currentGroup || !currentUser) return { error: 'Sem grupo' };

    try {
      const shared = sharedItems.find(
        item => item.itemType === itemType && item.itemId === itemId
      );

      if (!shared) return { error: 'Item não está compartilhado' };

      await supabase
        .from('shared_items')
        .delete()
        .eq('id', shared.remoteId);

      const filtered = sharedItems.filter(
        item => !(item.itemType === itemType && item.itemId === itemId)
      );

      setSharedItems(filtered);
      await saveSharedItems(filtered);

      return { success: true };
    } catch (e) {
      return { error: e.message || 'Erro ao remover compartilhamento' };
    }
  };

  // ========== SINCRONIZAÇÃO ==========

  const syncWithGroup = useCallback(async () => {
    if (!currentGroup || !currentUser) return { error: 'Sem grupo' };

    setIsSyncing(true);

    try {
      // 1. Enviar meus shared items para o Supabase (já feito no shareItem)
      // 2. Buscar items compartilhados por OUTROS membros

      const { data, error } = await supabase
        .from('shared_items')
        .select(`
          id,
          item_type,
          item_id,
          permissions,
          user_id,
          created_at,
          users!shared_items_user_id_fkey(username)
        `)
        .eq('group_id', currentGroup.id)
        .neq('user_id', currentUser.id);

      if (error) throw error;

      // Buscar os dados completos dos items compartilhados
      const cardIds = [];
      const transactionIds = [];
      const goalIds = [];

      data?.forEach(item => {
        switch (item.item_type) {
          case 'card': cardIds.push(item.item_id); break;
          case 'transaction': transactionIds.push(item.item_id); break;
          case 'goal': goalIds.push(item.item_id); break;
        }
      });

      // Buscar dados dos cards compartilhados
      const [cardsData, transData, goalsData] = await Promise.all([
        cardIds.length > 0 
          ? supabase.from('user_cards').select('*').in('id', cardIds)
          : { data: [] },
        transactionIds.length > 0
          ? supabase.from('user_transactions').select('*').in('id', transactionIds)
          : { data: [] },
        goalIds.length > 0
          ? supabase.from('user_goals').select('*').in('id', goalIds)
          : { data: [] },
      ]);

      // Mapear para incluir metadados de compartilhamento
      const mapShared = (items, type) => {
        return items.map(item => {
          const shareMeta = data.find(d => d.item_type === type && d.item_id === item.id);
          return {
            ...item,
            isShared: true,
            sharedBy: shareMeta?.user_id,
            ownerUsername: shareMeta?.users?.username || 'Desconhecido',
            permissions: shareMeta?.permissions || { view: true, edit: false },
            sharedAt: shareMeta?.created_at,
          };
        });
      };

      setSharedCards(mapShared(cardsData.data || [], 'card'));
      setSharedTransactions(mapShared(transData.data || [], 'transaction'));
      setSharedGoals(mapShared(goalsData.data || [], 'goal'));

      const now = new Date().toISOString();
      setLastSync(now);

      return { success: true };
    } catch (e) {
      console.warn('Erro na sincronização:', e);
      return { error: e.message || 'Erro na sincronização' };
    } finally {
      setIsSyncing(false);
    }
  }, [currentGroup, currentUser]);

  // Auto-sync quando entra no grupo
  useEffect(() => {
    if (!currentGroup || !syncEnabled) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    // Sync imediato
    syncWithGroup();

    // Intervalo de 30s
    syncIntervalRef.current = setInterval(() => {
      syncWithGroup();
    }, 30000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [currentGroup, syncEnabled, syncWithGroup]);

  // Persistir syncEnabled
  useEffect(() => {
    AsyncStorage.setItem('group_sync_enabled', JSON.stringify(syncEnabled));
  }, [syncEnabled]);

  const value = {
    // Auth
    currentUser,
    isLoading,
    register,
    login,
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

    // Sync
    syncWithGroup,
    syncEnabled,
    setSyncEnabled,
    lastSync,
    isSyncing,

    // Shared data received
    sharedCards,
    sharedTransactions,
    sharedGoals,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

export const useGroup = () => useContext(GroupContext);