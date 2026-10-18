/* Niveles de urgencia (semáforo) y estados de un reporte. */
export const URGENCY = {
  alta:  { label: 'Alta',  color: '#d92d20', hint: 'Riesgo para personas o daño que crece rápido' },
  media: { label: 'Media', color: '#b86e00', hint: 'Requiere atención pronta' },
  baja:  { label: 'Baja',  color: '#238a50', hint: 'Molestia que puede esperar' }
};

export const STATUS = { pendiente: 'Pendiente', proceso: 'En proceso', resuelto: 'Resuelto' };