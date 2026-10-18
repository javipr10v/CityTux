/* Repositorio de reportes en memoria.
   Todas sus operaciones son asíncronas (devuelven promesas) porque el repositorio de Firestore
   de la Fase 3 tendrá exactamente la misma interfaz: solo se cambia este archivo. */
export function createMemoryReportRepository({ reports = [], mineIds = [] } = {}) {
  const items = reports.map(r => ({ ...r }));
  const mine = new Set(mineIds);
  const joined = new Set();
  let nextId = items.reduce((max, r) => Math.max(max, r.id), 0) + 1;

  const find = id => items.find(r => r.id === id);

  return {
    /** Todos los reportes (copias: modificarlas no altera el repositorio). */
    async list() { return items.map(r => ({ ...r })); },

    /** Ids de los reportes que creó el usuario. */
    async mineIds() { return [...mine]; },

    /** Ids de los reportes a los que el usuario se sumó. */
    async joinedIds() { return [...joined]; },

    /** Guarda un reporte nuevo del usuario: le asigna id, lo pone al inicio y lo marca como suyo. */
    async add(report) {
      const saved = { ...report, id: nextId++ };
      items.unshift(saved);
      mine.add(saved.id);
      return { ...saved };
    },

    /** El usuario se suma a un reporte (+1 vecino). Si ya estaba sumado, no hace nada. */
    async join(id) {
      const r = find(id);
      if (!r || joined.has(id)) return;
      joined.add(id);
      r.neighbors += 1;
    },

    /** El usuario quita su apoyo (-1 vecino). */
    async leave(id) {
      const r = find(id);
      if (!r || !joined.has(id)) return;
      joined.delete(id);
      r.neighbors -= 1;
    }
  };
}