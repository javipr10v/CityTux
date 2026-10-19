/* Consultas sobre el catálogo de servicios (sin pantalla). */
import { SERVICES } from '../config/services.js';

/** Todas las subcategorías en una sola lista, cada una con su servicio y el área a la que se turna. */
export const SUBCATEGORIES = Object.entries(SERVICES).flatMap(([serviceId, service]) =>
  Object.entries(service.subs).map(([id, sub]) => ({
    id,
    serviceId,
    serviceLabel: service.label,
    label: sub.label,
    hint: sub.hint,
    agency: sub.agency ?? service.agency,
    notice: sub.notice ?? null
  }))
);

const porId = new Map(SUBCATEGORIES.map(s => [s.id, s]));

/** Busca una subcategoría por su id. Devuelve null si no existe. */
export const findSubcategory = id => porId.get(id) ?? null;

/** Subcategorías de un servicio ('municipales' | 'agua' | 'transito'). */
export const subcategoriesOf = serviceId => SUBCATEGORIES.filter(s => s.serviceId === serviceId);