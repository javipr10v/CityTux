/* Casos de uso de los reportes: une las reglas del dominio con el repositorio de datos.
   No sabe nada de la pantalla: devuelve datos y la capa ui los dibuja. */
import {
  buildReport, byStatus, byUrgency, checkJoin, countByStatus, summarize, validateStep
} from '../domain/report.js';

export function createReportService(repo) {
  return {
    /** Totales de la página de inicio. */
    async stats() {
      return summarize(await repo.list());
    },

    /** Reportes de la comunidad filtrados por urgencia, con las marcas own/joined de cada tarjeta. */
    async feed(urg = 'todas') {
      const [todos, propios, sumados] = await Promise.all([repo.list(), repo.mineIds(), repo.joinedIds()]);
      return byUrgency(todos, urg).map(r => ({ ...r, own: propios.includes(r.id), joined: sumados.includes(r.id) }));
    },

    /** Reportes del usuario filtrados por estado, más el conteo para las pestañas. */
    async mine(status = 'todos') {
      const [todos, ids] = await Promise.all([repo.list(), repo.mineIds()]);
      const propios = todos.filter(r => ids.includes(r.id));
      return { items: byStatus(propios, status), counts: countByStatus(propios) };
    },

    /** Reportes para el mapa, filtrados por urgencia. */
    async forMap(urg = 'todas') {
      return byUrgency(await repo.list(), urg);
    },

    /** Valida el borrador completo y guarda el reporte. Lanza un Error con el mensaje si falta algo. */
    async submit(draft) {
      for (const step of [0, 1]) {
        const error = validateStep({ ...draft, step });
        if (error) throw new Error(error);
      }
      return repo.add(buildReport(draft, {}));
    },

    /** Sumarse a un reporte o quitar el apoyo. getUserPos solo se llama al sumarse,
        así el permiso de GPS se pide únicamente cuando hace falta. Devuelve { ok, joined?, message? }. */
    async toggleJoin(id, getUserPos) {
      const [todos, propios, sumados] = await Promise.all([repo.list(), repo.mineIds(), repo.joinedIds()]);
      const report = todos.find(r => r.id === id);
      if (!report) return { ok: false, message: 'No se encontró el reporte' };
      if (propios.includes(id)) return checkJoin(report, null, { isOwn: true });
      if (sumados.includes(id)) {
        await repo.leave(id);
        return { ok: true, joined: false };
      }
      const check = checkJoin(report, await getUserPos());
      if (!check.ok) return check;
      await repo.join(id);
      return { ok: true, joined: true };
    }
  };
}