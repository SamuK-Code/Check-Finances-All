import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const STORAGE_KEY = '@auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('[Auth] Erro ao carregar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const savedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (!savedUser) {
        return { success: false, error: 'Usuário não encontrado. Crie uma conta primeiro.' };
      }

      const parsed = JSON.parse(savedUser);
      if (parsed.username !== username || parsed.password !== password) {
        return { success: false, error: 'Usuário ou senha incorretos.' };
      }

      setUser(parsed);
      setIsAuthenticated(true);
      return { success: true, user: parsed };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login.' };
    }
  }, []);

  const register = useCallback(async (username, password, displayName) => {
    try {
      const savedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.username === username) {
          return { success: false, error: 'Este usuário já existe.' };
        }
      }

      const newUser = {
        id: `user_${Date.now()}`,
        username,
        password,
        displayName: displayName || username,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: 'Erro ao criar conta.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao sair.' };
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: 'Erro ao atualizar perfil.' };
    }
  }, [user]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
