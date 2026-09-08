import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useMedsStore } from './stores/medsStore';
import { useEffect } from 'react';
import Admin from './pages/Admin';
import ChatBubble from './components/chat/ChatBubble';
import { Pill, Settings, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Contraseña del admin
const ADMIN_PASSWORD = 'Farmafamiliaestefani.25';

function ChatPage() {
  const { fetchMeds } = useMedsStore();

  useEffect(() => { fetchMeds(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 -left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-teal-500/30">
              <img src="/icons/logo.png" alt="PharmaChat" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">PharmaChat</h1>
              <p className="text-white/50 text-xs">Farma Familia</p>
            </div>
          </div>
          <a
            href="/admin-login"
            className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Administración"
          >
            <Settings size={20} />
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Logo grande */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="relative inline-block mb-8"
          >
            <div className="w-32 h-32 rounded-3xl overflow-hidden mx-auto shadow-2xl shadow-blue-500/30 rotate-3 hover:rotate-0 transition-transform duration-500">
              <img src="/icons/logo.png" alt="PharmaChat" className="w-full h-full object-cover" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="text-yellow-400" size={24} />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-3"
          >
            Bienvenida a{' '}
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              PharmaChat
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 max-w-lg mx-auto text-lg leading-relaxed"
          >
            Tu asistente de farmacia. Toca la burbuja en la esquina inferior derecha para consultar sobre cualquier medicamento.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {[
              { icon: '', title: 'Consulta rápida', desc: 'Información al instante' },
              { icon: '🔍', title: 'Búsqueda inteligente', desc: 'Encuentra cualquier medicamento' },
              { icon: '📋', title: 'Registro sanitario', desc: 'Documentos disponibles' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                <p className="text-white/50 text-xs mt-1">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <ChatBubble />
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">Acceso Admin</h2>
          <p className="text-white/50 text-sm mt-1">Ingresa la contraseña</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            placeholder="Contraseña"
            autoFocus
            className={`w-full px-4 py-3 rounded-xl border-2 ${error ? 'border-red-400' : 'border-white/20'} bg-white/5 text-white placeholder-white/30 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 outline-none text-sm mb-4 transition-all`}
          />
          {error && (
            <p className="text-red-400 text-xs mb-3 text-center">Contraseña incorrecta</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2.5 text-sm text-white/70 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm text-white bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl transition-shadow"
            >
              Entrar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  if (!isAdmin) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/admin-login" element={
            <AdminLoginWithNavigate onLogin={() => setIsAdmin(true)} />
          } />
          <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatPage onAdminClick={() => {}} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function AdminLoginWithNavigate({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  return <AdminLogin onSuccess={() => { onLogin(); navigate('/admin'); }} />;
}
