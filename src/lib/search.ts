import Fuse from 'fuse.js';
import type { Medicamento } from './types';

let fuseInstance: Fuse<Medicamento> | null = null;

const fuseOptions = {
  keys: ['medicamentos'],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
};

export const initSearch = (medicamentos: Medicamento[]) => {
  fuseInstance = new Fuse(medicamentos, fuseOptions);
};

export const searchMedicamentos = (query: string): Medicamento[] => {
  if (!fuseInstance || !query.trim()) return [];
  const results = fuseInstance.search(query, { limit: 5 });
  return results.map(r => r.item);
};

// Genera respuesta de chat basada en los medicamentos encontrados
export const generateResponse = (query: string, medicamentos: Medicamento[]): string => {
  const q = query.toLowerCase().trim();

  if (!q) return '';

  // Saludos
  if (/^(hola|buenos|buenas|hey|saludos)/.test(q)) {
    return '¡Hola! 💊 Soy PharmaChat, tu asistente de farmacia. Puedo ayudarte a buscar información sobre medicamentos. ¿Qué necesitas saber?';
  }

  // Categorías / lista general
  if (/categor|tipo|clasifica|lista|que hay|que tienen|medicamentos que/.test(q)) {
    const nombres = medicamentos.map(m => {
      const primeraLinea = m.medicamentos.split('\n')[0].trim();
      return primeraLinea;
    });
    return `📋 Tenemos estos medicamentos disponibles:\n\n${nombres.map((n, i) => `${i + 1}. **${n}**`).join('\n')}\n\n¿Sobre cuál quieres saber más?`;
  }

  // Búsqueda específica
  const resultados = searchMedicamentos(query);

  if (resultados.length === 0) {
    return ' No encontré medicamentos con ese nombre o descripción. Intenta con otro término o pregúntame por la lista completa.';
  }

  if (resultados.length === 1) {
    return resultados[0].medicamentos;
  }

  // Múltiples resultados
  let response = `🔍 Encontré ${resultados.length} medicamentos relacionados:\n\n`;
  resultados.forEach((med, i) => {
    const primeraLinea = med.medicamentos.split('\n')[0].trim();
    response += `${i + 1}. **${primeraLinea}**\n`;
  });
  response += '\n¿Sobre cuál quieres más detalles?';
  return response;
};
