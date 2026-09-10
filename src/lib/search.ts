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
  'secundarios', 'secundario', 'componentes', 'componente', 'ingredientes',
  'ingrediente', 'registro', 'sanitario', 'cucharaditas', 'cucharadita',
  'veces', 'cuesta', 'costo', 'costos', 'cuando', 'cuantas',
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
  const fuzzy = fuseInstance.search(q, { limit: 8 }).map(r => r.item);

  // Prioridad 1: productos que contienen literalmente las palabras buscadas
  if (palabras.length > 0) {
    const literales = medicamentosIndex
      .map(m => ({ m, puntaje: puntajeLiteral(m, palabras) }))
      .filter(h => h.puntaje > 0)
      .sort((a, b) => b.puntaje - a.puntaje)
      .map(h => h.m);
    if (literales.length > 0) {
      const ids = new Set(literales.map(m => m.id));
      return literales.concat(fuzzy.filter(m => !ids.has(m.id))).slice(0, 5);
    }
  }

  // Prioridad 2: búsqueda difusa sobre todo el texto
  return fuzzy.slice(0, 5);
};

// Encabezados de sección dentro del texto de cada producto
const ENCABEZADOS_SECCION: RegExp[] = [
  /precios?/i, /dosis/i, /contraindicaci/i, /efectos\s+secundarios/i,
  /componente/i, /caracteristic/i, /registro\s+sanitario/i, /elaborado/i,
  /indicaciones/i, /beneficios/i, /precaucion/i,
];

const esEncabezado = (linea: string) => {
  const t = linea.trim();
  return t.length > 0 && t.length < 60 && ENCABEZADOS_SECCION.some(re => re.test(t));
};

// Detecta qué información específica pide el usuario
const detectarTema = (q: string): RegExp | null => {
  if (/\b(contraindicaci|prohibid|no (debo|debe|puedo|pueden))/.test(q)) return /contraindicaci/i;
  if (/\b(precios?|cuesta|costo|costos)/.test(q)) return /precios?/i;
  if (/\b(dosis|cucharadita|cuando tomar|como tomar|cuantas veces)/.test(q)) return /dosis/i;
  if (/\b(efectos|secundari|reacciones)/.test(q)) return /efectos/i;
  if (/\b(componente|ingrediente)/.test(q)) return /componente/i;
  if (/\b(registro|sanitario)/.test(q)) return /registro\s+sanitario/i;
  return null;
};

// Extrae solo el bloque de la sección pedida (ej: precios) del texto completo
const extraerSeccion = (texto: string, tema: RegExp): string | null => {
  const lineas = texto.split(/\r?\n/);
  const inicio = lineas.findIndex(l => tema.test(l) && esEncabezado(l));
  if (inicio === -1) return null;
  const partes: string[] = [lineas[inicio]];
  for (let i = inicio + 1; i < lineas.length; i++) {
    if (esEncabezado(lineas[i]) && !tema.test(lineas[i])) break;
    partes.push(lineas[i]);
  }
  return partes.join('\n').trim();
};

// Nombre del producto = primera línea sin numeración (ej: "9- Fitodol" -> "Fitodol")
const nombreProducto = (m: Medicamento) =>
  quitarAcentos(m.medicamentos.split('\n')[0].trim()).replace(/^[\d\.\-\s]+/, '');

// Genera respuesta de chat basada en los medicamentos encontrados
export const generateResponse = (query: string, medicamentos: Medicamento[]): string => {
  const q = quitarAcentos(query.toLowerCase().trim());

  if (!q) return '';

  // Saludos
  if (/^(hola|buenos|buenas|hey|saludos)\b/.test(q)) {
    return '¡Hola! 💊 Soy PharmaChat, tu asistente de farmacia. Puedo ayudarte a buscar información sobre medicamentos. ¿Qué necesitas saber?';
  }

  // Categorías / lista general
  if (/categor|tipo|clasifica|lista|que hay|que tienen|medicamentos que/.test(q)) {
    const nombres = medicamentos.map(m => m.medicamentos.split('\n')[0].trim());
    return `📋 Tenemos estos medicamentos disponibles:\n\n${nombres.map((n, i) => `${i + 1}. **${n}**`).join('\n')}\n\n¿Sobre cuál quieres saber más?`;
  }

  const tema = detectarTema(q);
  const resultados = searchMedicamentos(query);

  if (resultados.length === 0) {
    return ' No encontré medicamentos con ese nombre o descripción. Intenta con otro término o pregúntame por la lista completa.';
  }

  // Productos cuyo nombre contiene lo que el usuario escribió
  const palabras = palabrasClave(query);
  const porNombre = resultados.filter(m => {
    const nombre = nombreProducto(m);
    return palabras.length > 0 && palabras.every(p => nombre.includes(p));
  });

  // Pregunta general de precios sin nombrar producto: lista de precios de todos
  if (tema && /precios/i.test(tema.source) && porNombre.length === 0 && palabras.length === 0) {
    const bloques = medicamentos
      .map(m => {
        const s = extraerSeccion(m.medicamentos, tema);
        return s ? `**${m.medicamentos.split('\n')[0].trim()}**\n${s}` : null;
      })
      .filter(Boolean);
    if (bloques.length > 0) return '📋 Nuestros precios:\n\n' + bloques.join('\n\n');
  }

  // Producto único identificado por nombre: responder solo con lo pedido
  if (porNombre.length >= 1) {
    const producto = porNombre[0];
    if (tema) {
      const seccion = extraerSeccion(producto.medicamentos, tema);
      if (seccion) return seccion;
      return `No tengo esa información específica de **${nombreProducto(producto)}**; aquí está toda su información:\n\n${producto.medicamentos}`;
    }
    return producto.medicamentos;
  }

  if (resultados.length === 1) {
    const unico = resultados[0];
    if (tema) {
      const seccion = extraerSeccion(unico.medicamentos, tema);
      if (seccion) return seccion;
    }
    return unico.medicamentos;
  }

  // Múltiples resultados
  let response = `🔍 Encontré ${resultados.length} medicamentos relacionados:\n\n`;
  resultados.slice(0, 5).forEach((med, i) => {
    response += `${i + 1}. **${med.medicamentos.split('\n')[0].trim()}**\n`;
  });
  response += '\nEscribe el nombre del medicamento para darte su información.';
  return response;
};
