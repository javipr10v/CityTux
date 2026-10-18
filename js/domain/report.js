/* Reglas de negocio de los reportes. Funciones puras: no tocan el DOM, el mapa ni la red. */
import { CATEGORIES } from '../config/categories.js';
import {
  ACCEPTED_PHOTO_TYPES, DEFAULT_URGENCY, JOIN_RADIUS_KM, MAX_PHOTO_MB, MAX_PHOTOS
} from '../config/settings.js';
import { distanceKm, isInsideCity } from './geo.js';

/* ---------- Borrador del formulario ---------- */

export const emptyDraft = () => ({
  step: 0, cat: null, urg: DEFAULT_URGENCY, desc: '', addr: '', pos: null, photos: []
});

/** Devuelve el mensaje de error del paso actual, o null si se puede continuar. */
export function validateStep(draft) {
  if (draft.step === 0 && !draft.cat) return 'Elige el tipo de incidencia para continuar.';
  if (draft.step === 1 && !draft.pos) return 'Marca el punto exacto en el mapa (o usa "Mi ubicación").';
  if (draft.step === 1 && !isInsideCity(draft.pos)) return 'Ese punto queda fuera de Tuxtla Gutiérrez. Marca uno dentro de la ciudad.';
  return null;
}

/** Valida un archivo de foto ({ type, size }). Devuelve el mensaje de error o null. */
export function validatePhoto(file) {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) return 'Solo se aceptan imágenes PNG o JPG';
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) return `Cada foto debe pesar menos de ${MAX_PHOTO_MB} MB`;
  return null;
}

export const canAddPhoto = draft => draft.photos.length < MAX_PHOTOS;
export const photoLimitMessage = () => `Máximo ${MAX_PHOTOS} fotos por reporte`;

/* ---------- Construcción de un reporte ---------- */

/** Fecha en formato dd/mm/aaaa. */
export function formatDate(fecha = new Date()) {
  const dos = n => String(n).padStart(2, '0');
  return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
}

/** Convierte el borrador en un reporte nuevo (la capa de datos le da el id). */
export function buildReport(draft, { id, author = 'Tú', now = new Date() }) {
  return {
    id,
    cat: draft.cat,
    urg: draft.urg,
    status: 'pendiente',
    title: CATEGORIES[draft.cat].single,
    place: draft.addr.trim() || 'Ubicación marcada en el mapa',
    pos: draft.pos,
    date: formatDate(now),
    author,
    neighbors: 1,
    text: draft.desc || 'Sin descripción',
    photo: draft.photos[0],
    photos: draft.photos.slice()
  };
}

/** Iniciales para el avatar: "María López" -> "ML". */
export const initials = nombre => nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

/* ---------- Consultas sobre listas de reportes ---------- */

/** Totales de la página de inicio. */
export function summarize(reports) {
  return {
    activos: reports.filter(r => r.status !== 'resuelto').length,
    proceso: reports.filter(r => r.status === 'proceso').length,
    vecinos: reports.reduce((total, r) => total + r.neighbors, 0)
  };
}

/** Filtra por urgencia ('alta' | 'media' | 'baja'); 'todas' devuelve todo. */
export const byUrgency = (reports, urg) => (urg === 'todas' ? reports : reports.filter(r => r.urg === urg));

/** Filtra por estado ('pendiente' | 'proceso' | 'resuelto'); 'todos' devuelve todo. */
export const byStatus = (reports, estado) => (estado === 'todos' ? reports : reports.filter(r => r.status === estado));

/** Cantidad de reportes por estado, para las pestañas de "Mis reportes". */
export const countByStatus = reports => ({
  todos: reports.length,
  pendiente: byStatus(reports, 'pendiente').length,
  proceso: byStatus(reports, 'proceso').length,
  resuelto: byStatus(reports, 'resuelto').length
});

/** ¿Puede el usuario sumarse a este reporte? Devuelve { ok, message?, km? }. */
export function checkJoin(report, userPos, { isOwn = false } = {}) {
  if (isOwn) return { ok: false, message: 'Este es tu propio reporte' };
  const km = distanceKm(userPos, report.pos);
  if (km > JOIN_RADIUS_KM) {
    return { ok: false, km, message: `Estás a ${km.toFixed(1)} km de esta incidencia. Solo puedes sumarte a menos de ${JOIN_RADIUS_KM} km.` };
  }
  return { ok: true, km };
}