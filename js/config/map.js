/* Configuración del mapa: Leaflet (con verificación de integridad SRI) y mosaicos de OpenStreetMap. */
export const LEAFLET = {
  css: { href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=' },
  js: { src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=' }
};

export const TILES_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILES_ATTRIBUTION = '&copy; Colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
export const MAP_ZOOM = 13;