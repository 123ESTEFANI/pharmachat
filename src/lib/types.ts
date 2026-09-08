export type UserRole = 'admin' | 'user';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  created_at?: string;
}

export interface Medicamento {
  id: string;
  medicamentos: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
