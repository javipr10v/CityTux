/* Datos de ejemplo para la demostración. En la Fase 3 se reemplazan por los de Firestore. */
export const SEED_REPORTS = [
  {
    id: 1, cat: 'inundacion', urg: 'alta', status: 'proceso',
    title: 'Inundaciones y encharcamientos', place: 'Blvd. Belisario Domínguez', pos: [16.7478, -93.131],
    date: '29/09/2026', author: 'María López', neighbors: 34,
    text: 'El boulevard se inunda cada vez que llueve. Ya son 3 ocasiones este mes y los carros quedan varados.'
  },
  {
    id: 2, cat: 'baches', urg: 'alta', status: 'proceso',
    title: 'Baches y pavimento', place: 'Av. Central y 5a Norte, Centro', pos: [16.7536, -93.1148],
    date: '05/09/2026', author: 'Tú', neighbors: 21,
    text: 'Bache enorme en el carril derecho. Ya causó 2 ponchaduras esta semana. Urge atención.'
  },
  {
    id: 3, cat: 'limpia', urg: 'media', status: 'resuelto',
    title: 'Limpia y Aseo Público', place: 'Col. Los Laguitos', pos: [16.7452, -93.0998],
    date: '25/08/2026', author: 'Tú', neighbors: 12,
    text: 'Llevan más de una semana sin recoger la basura de la esquina. Ya hay mal olor y fauna nociva.'
  },
  {
    id: 4, cat: 'alumbrado', urg: 'media', status: 'pendiente',
    title: 'Alumbrado Público', place: 'Col. Terán', pos: [16.7325, -93.147],
    date: '02/09/2026', author: 'Tú', neighbors: 9,
    text: 'Tres postes seguidos sin luz en la calle principal. En la noche es muy peligroso caminar.'
  },
  {
    id: 5, cat: 'semaforo', urg: 'alta', status: 'pendiente',
    title: 'Semáforo fuera de servicio', place: 'Libramiento Norte Poniente', pos: [16.7685, -93.1495],
    date: '28/09/2026', author: 'Sofía Pérez', neighbors: 27,
    text: 'El semáforo del crucero está en intermitente desde ayer y ya hubo un casi accidente.'
  },
  {
    id: 6, cat: 'fugaRed', urg: 'baja', status: 'pendiente',
    title: 'Fuga de agua potable', place: 'Col. Moctezuma', pos: [16.757, -93.102],
    date: '01/10/2026', author: 'Jorge Molina', neighbors: 6,
    text: 'Fuga constante en la banqueta, se desperdicia agua todo el día.'
  }
];

/* Ids de los reportes que pertenecen al usuario de la demostración. */
export const SEED_MINE_IDS = [2, 3, 4];