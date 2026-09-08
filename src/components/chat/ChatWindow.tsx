import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatWindow() {
  const { messages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <motion.div
      className="h-full flex flex-col bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-purple-600 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden">
          <img src="/icons/logo.png" alt="PharmaChat" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">PharmaChat</h3>
          <p className="text-white/70 text-xs">Asistente de farmacia</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/70 text-xs">En línea</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900/50 to-slate-800/50">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src="/icons/logo.png" alt="PharmaChat" className="w-14 h-14 object-cover opacity-50" />
            </motion.div>
            <p className="text-sm font-medium text-white/70">¡Hola! Soy PharmaChat</p>
            <p className="text-xs mt-1 text-white/40">Pregúntame sobre cualquier medicamento</p>
          </motion.div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput />
    </motion.div>
  );
}
