import { createClient } from '@supabase/supabase-js';
import type { Medicamento, Usuario } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey.substring(0, 20) + '...');

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

// Medicamentos - una sola columna de texto.
// OJO: según cómo se creó la tabla, la columna puede llamarse 'medicamentos'
// o 'medicamento' (singular). El código maneja ambos nombres.

const normalizeRow = (row: any): Medicamento => ({
  id: row?.id ?? '',
  medicamentos: row?.medicamentos ?? row?.medicamento ?? '',
});

const isColumnError = (error: any) =>
  !!error && /column/i.test(error.message || '');

export const fetchMedicamentos = async () => {
  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .order('id');
  const meds = (data || []).map(normalizeRow);
  return { data: meds, error };
};

export const fetchAllMedicamentos = async () => {
  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .order('id');
  const meds = (data || []).map(normalizeRow);
  return { data: meds, error };
};

export const insertMedicamento = async (texto: string) => {
  let { data, error } = await supabase
    .from('medicamentos')
    .insert([{ medicamentos: texto }])
    .select()
    .single();

  // Si la columna se llama 'medicamento' (singular), reintentar
  if (isColumnError(error)) {
    const res = await supabase
      .from('medicamentos')
      .insert([{ medicamento: texto }])
      .select()
      .single();
    data = res.data;
    error = res.error;
  }

  return { data: data ? normalizeRow(data) : null, error };
};

export const updateMedicamento = async (id: string, texto: string) => {
  let { data, error } = await supabase
    .from('medicamentos')
    .update({ medicamentos: texto })
    .eq('id', id)
    .select()
    .single();

  if (isColumnError(error)) {
    const res = await supabase
      .from('medicamentos')
      .update({ medicamento: texto })
      .eq('id', id)
      .select()
      .single();
    data = res.data;
    error = res.error;
  }

  return { data: data ? normalizeRow(data) : null, error };
};

export const deleteMedicamento = async (id: string) => {
  const { error } = await supabase
    .from('medicamentos')
    .delete()
    .eq('id', id);
  return { error };
};

// Usuarios (sin uso activo; sin order por columnas inexistentes)
export const fetchUsuarios = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*');
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
