// supabase.js — Configuração do Supabase Client

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nrxkqhzrytzomvwqafiz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GnrhEybSIiLCS9iDd88z0g_pS_A0wsl';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper para hash de senha simples (em produção use bcrypt)
export const hashPassword = (password) => {
  // Simples hash para demo — em produção use bcrypt no backend
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};