import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useMedsStore } from '../../stores/medsStore';
import { generateResponse } from '../../lib/search';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const { addMessage } = useChatStore();
  const { medicamentos } = useMedsStore();

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput('');

    setTimeout(() => {
      const response = generateResponse(text, medicamentos);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      });
    }, 400 + Math.random() * 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta sobre un medicamento..."
          className="flex-1 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 outline-none text-sm transition-all"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-opacity shadow-lg shadow-blue-500/30"
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  );
}
