import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, X, Save, Pill, Users,
  Copy, Check,
} from 'lucide-react';
import type { Medicamento, Usuario } from '../lib/types';
import {
  fetchAllMedicamentos, insertMedicamento, updateMedicamento,
  deleteMedicamento, fetchUsuarios, updateUsuario,
} from '../lib/supabase';
import { useMedsStore } from '../stores/medsStore';

type Tab = 'medicamentos' | 'usuarios';

export default function Admin() {
  const [tab, setTab] = useState<Tab>('medicamentos');
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMed, setEditingMed] = useState<Medicamento | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchMeds } = useMedsStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const medsRes = await fetchAllMedicamentos();
      console.log('Admin - Medicamentos:', medsRes);
      if (medsRes.error) {
        setError(medsRes.error.message);
      } else {
        setError(null);
        setMedicamentos(medsRes.data || []);
      }
    } catch (err: any) {
      console.error('Admin - Error cargando datos:', err);
      setError(err?.message || 'Error de conexión con la base de datos');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredMeds = medicamentos.filter(m =>
    (m.medicamentos || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (texto: string) => {
    const res = editingMed
      ? await updateMedicamento(editingMed.id, texto)
      : await insertMedicamento(texto);
    if (res.error) {
      alert('Error al guardar en la base de datos:\n\n' + res.error.message);
      return;
    }
    setShowForm(false);
    setEditingMed(null);
    await loadData();
    await fetchMeds();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este medicamento?')) return;
    await deleteMedicamento(id);
    await loadData();
    await fetchMeds();
  };

  const handleToggleUser = async (user: Usuario) => {
    await updateUsuario(user.id, { activo: !user.activo });
    await loadData();
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'medicamentos', label: 'Medicamentos', icon: <Pill size={18} /> },
    { key: 'usuarios', label: 'Usuarios', icon: <Users size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-4 sm:px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Pill className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Panel de Administración</h1>
              <p className="text-white/70 text-xs">PharmaChat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-4 mb-4 text-sm">
            <strong>⚠️ Error de base de datos:</strong> {error}
            <button
              onClick={loadData}
              className="ml-3 underline text-red-800 hover:text-red-900"
            >
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Medicamentos Tab */}
            {tab === 'medicamentos' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar medicamento..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none text-sm bg-white"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setEditingMed(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl shadow-md text-sm font-medium"
                  >
                    <Plus size={18} /> Agregar
                  </motion.button>
                </div>

                <div className="space-y-3">
                  {filteredMeds.map(med => (
                    <MedCard
                      key={med.id}
                      med={med}
                      onEdit={() => { setEditingMed(med); setShowForm(true); }}
                      onDelete={() => handleDelete(med.id)}
                    />
                  ))}
                  {filteredMeds.length === 0 && (
                    <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100">
                      <Pill size={40} className="mx-auto mb-2 opacity-30" />
                      <p>No se encontraron medicamentos</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Usuarios Tab */}
            {tab === 'usuarios' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Rol</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(u => (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-800">{u.nombre}</td>
                          <td className="px-4 py-3 text-gray-600">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${u.rol === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                              {u.rol === 'admin' ? 'Administrador' : 'Usuario'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${u.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleToggleUser(u)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                u.activo
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                            >
                              {u.activo ? 'Desactivar' : 'Activar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {usuarios.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      <Users size={40} className="mx-auto mb-2 opacity-30" />
                      <p>No hay usuarios registrados</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MedFormModal
            medicamento={editingMed}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingMed(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MedCard({ med, onEdit, onDelete }: { med: Medicamento; onEdit: () => void; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);
  const primeraLinea = med.medicamentos.split('\n')[0].trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(med.medicamentos);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm">{primeraLinea}</h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {med.medicamentos.split('\n').slice(1, 3).join(' ')}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
            title="Copiar texto"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Form Modal - ahora solo un textarea
function MedFormModal({ medicamento, onSave, onClose }: {
  medicamento: Medicamento | null;
  onSave: (texto: string) => Promise<void>;
  onClose: () => void;
}) {
  const [texto, setTexto] = useState(medicamento?.medicamentos || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!texto.trim()) return;
    setSaving(true);
    await onSave(texto);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">
            {medicamento ? 'Editar Medicamento' : 'Nuevo Medicamento'}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 p-6 overflow-y-auto">
          <p className="text-xs text-gray-400 mb-2">
            Pega la información del medicamento tal como quieres que aparezca en el chat
          </p>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none text-sm resize-none font-mono leading-relaxed"
            placeholder="Pega aquí la información del medicamento..."
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving || !texto.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl shadow-md text-sm font-medium disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
