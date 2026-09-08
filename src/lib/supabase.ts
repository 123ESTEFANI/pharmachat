import { createClient } from '@supabase/supabase-js';
import type { Medicamento, Usuario } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Medicamentos - ahora solo una columna de texto
export const fetchMedicamentos = async () => {
  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .order('id');
  return { data: data as Medicamento[] | null, error };
};

export const fetchAllMedicamentos = async () => {
  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .order('id');
  return { data: data as Medicamento[] | null, error };
};

export const insertMedicamento = async (texto: string) => {
  const { data, error } = await supabase
    .from('medicamentos')
    .insert([{ medicamentos: texto }])
    .select()
    .single();
  return { data, error };
};

export const updateMedicamento = async (id: string, texto: string) => {
  const { data, error } = await supabase
    .from('medicamentos')
    .update({ medicamentos: texto })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteMedicamento = async (id: string) => {
  const { error } = await supabase
    .from('medicamentos')
    .delete()
    .eq('id', id);
  return { error };
};

// Usuarios
export const fetchUsuarios = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('nombre');
  return { data: data as Usuario[] | null, error };
};

export const updateUsuario = async (id: string, updates: Partial<Usuario>) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};
