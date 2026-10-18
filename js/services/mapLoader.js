/* Carga Leaflet solo cuando se necesita (al entrar a Mapa o Reportar), para que el inicio pese menos. */
import { LEAFLET } from '../config/map.js';

let pendiente = null;

/** Devuelve una promesa con el objeto L de Leaflet. Se descarga una sola vez. */
export function loadLeaflet() {
  if (globalThis.L) return Promise.resolve(globalThis.L);
  if (pendiente) return pendiente;
  pendiente = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = LEAFLET.css.href;
    css.integrity = LEAFLET.css.integrity;
    css.crossOrigin = '';
    document.head.appendChild(css);

    const js = document.createElement('script');
    js.src = LEAFLET.js.src;
    js.integrity = LEAFLET.js.integrity;
    js.crossOrigin = '';
    js.onload = () => resolve(globalThis.L);
    js.onerror = () => {
      pendiente = null; // permite reintentar
      reject(new Error('No se pudo cargar el mapa. Revisa tu conexión.'));
    };
    document.head.appendChild(js);
  });
  return pendiente;
}