import { motion } from 'framer-motion';
import { Pill, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../lib/types';

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-blue-400 to-purple-500'
            : 'bg-gradient-to-br from-teal-400 to-blue-500'
        }`}
      >
        {isUser ? <User size={16} className="text-white" /> : <Pill size={16} className="text-white" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md shadow-lg shadow-blue-500/20'
            : 'bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 rounded-bl-md'
        }`}
      >
        <div className="whitespace-pre-wrap">{formatContent(message.content)}</div>
        <div
          className={`text-[10px] mt-1 ${
            isUser ? 'text-blue-200' : 'text-white/30'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString('es', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );
}

function formatContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
