import { create } from 'zustand';
import type { Usuario, UserRole } from '../lib/types';
import { supabase, signIn as supaSignIn, signOut as supaSignOut } from '../lib/supabase';

interface AuthState {
  user: Usuario | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    const { error } = await supaSignIn(email, password);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    await fetchUserData();
    return true;
  },

  logout: async () => {
    await supaSignOut();
    set({ user: null });
  },

  checkSession: async () => {
    set({ loading: true });
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      set({ loading: false, user: null });
      return;
    }
    await fetchUserData();
  },
}));

async function fetchUserData() {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return;

  // Try to get user profile from usuarios table
  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', authUser.id)
    .single();

  const user: Usuario = profile ? {
    id: profile.id,
    email: profile.email || authUser.email || '',
    nombre: profile.nombre || authUser.email?.split('@')[0] || 'Usuario',
    rol: profile.rol as UserRole,
    activo: profile.activo,
  } : {
    id: authUser.id,
    email: authUser.email || '',
    nombre: authUser.email?.split('@')[0] || 'Usuario',
    rol: 'user',
    activo: true,
  };

  useAuthStore.setState({ user, loading: false });
}
