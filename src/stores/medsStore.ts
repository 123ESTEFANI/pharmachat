import { create } from 'zustand';
import type { Medicamento } from '../lib/types';
import { fetchMedicamentos as fetchFromDb, fetchAllMedicamentos as fetchAllFromDb } from '../lib/supabase';
import { initSearch } from '../lib/search';

interface MedsState {
  medicamentos: Medicamento[];
  loading: boolean;
  error: string | null;
  fetchMeds: () => Promise<void>;
}

export const useMedsStore = create<MedsState>((set) => ({
  medicamentos: [],
  loading: true,
  error: null,

  fetchMeds: async () => {
    set({ loading: true });
    const { data, error } = await fetchFromDb();
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    const meds = data || [];
    initSearch(meds);
    set({ medicamentos: meds, loading: false });
  },
}));
