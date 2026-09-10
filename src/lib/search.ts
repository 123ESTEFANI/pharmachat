import Fuse from 'fuse.js';
import type { Medicamento } from './types';

let fuseInstance: Fuse<Medicamento> | null = null;
let medicamentosIndex: Medicamento[] = [];

const fuseOptions = {
  keys: ['medicamentos'],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 3,
};

export const initSearch = (medicamentos: Medicamento[]) => {
  medicamentosIndex = medicamentos;
  fuseInstance = new Fuse(medicamentos, fuseOptions);
};

const quitarAcentos = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Palabras comunes que no deben usarse solas para buscar
const PALABRAS_COMUNES = new Set([
  'precios', 'precio', 'dosis', 'beneficios', 'contraindicaciones', 'efectos',
  'los', 'las', 'del', 'que', 'como', 'cuanto', 'cuanta', 'para', 'por',
  'con', 'una', 'hay', 'tiene', 'sirve', 'info', 'informacion', 'dime',
  'sobre', 'medicamento', 'medicamentos',
]);

const palabrasClave = (q: string) =>
  quitarAcentos(q).split(/\s+/).filter(p => p.length >= 3 && !PALABRAS_COMUNES.has(p));

const puntajeLiteral = (m: Medicamento, palabras: string[]) => {
  const texto = quitarAcentos(m.medicamentos);
  return palabras.filter(p => texto.includes(p)).length;
};

export const searchMedicamentos = (query: string): Medicamento[] => {
  const q = query.trim();
  if (!fuseInstance || !q) return [];

  const palabras = palabrasClave(q);

  // 1) Búsqueda difusa en todo el texto del producto,
  //    reordenando primero los que contienen las palabras literalmente
  const fuzzy = fuseInstance.search(q, { limit: 8 }).map(r => r.item);
  if (fuzzy.length > 0) {
    if (palabras.length > 0 && fuzzy.length > 1) {
      fuzzy.sort((a, b) => puntajeLiteral(b, palabras) - puntajeLiteral(a, palabras));
    }
    return fuzzy.slice(0, 5);
  }

  // 2) Respaldo: coincidencia literal de las palabras de la consulta
  if (palabras.length === 0) return [];

  return medicamentosIndex
    .map(m => ({ m, puntaje: puntajeLiteral(m, palabras) }))
    .filter(h => h.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 5)
    .map(h => h.m);
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
