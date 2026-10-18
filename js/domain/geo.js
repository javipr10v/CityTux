/* Reglas geográficas (sin pantalla ni mapa): distancias y límites de la ciudad. */
import { TUXTLA, MAX_KM_FROM_CENTER } from '../config/settings.js';

const rad = grados => grados * Math.PI / 180;

/** Distancia en km entre dos puntos [lat, lng] (fórmula de haversine). */
export function distanceKm(a, b) {
  const R = 6371;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** ¿El punto queda dentro del radio permitido alrededor del centro de Tuxtla? */
export const isInsideCity = pos => distanceKm(pos, TUXTLA) <= MAX_KM_FROM_CENTER;