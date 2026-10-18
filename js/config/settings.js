/* Configuración general de CityTux: valores que se ajustan sin tocar la lógica. */
export const TUXTLA = [16.7516, -93.1167];   // centro de la ciudad [lat, lng]
export const MAX_KM_FROM_CENTER = 20;        // un reporte debe quedar a menos de esta distancia del centro
export const JOIN_RADIUS_KM = 5;             // distancia máxima para sumarse a un reporte
export const MAX_PHOTOS = 4;                 // fotos por reporte
export const MAX_PHOTO_MB = 10;              // peso máximo por foto
export const ACCEPTED_PHOTO_TYPES = ['image/png', 'image/jpeg'];
export const DESC_MAX = 500;                 // caracteres de la descripción
export const LAST_STEP = 3;                  // el formulario tiene los pasos 0, 1, 2 y 3
export const DEFAULT_URGENCY = 'media';