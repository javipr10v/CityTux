/* Ubicación del usuario (GPS del navegador) y búsqueda de direcciones (Nominatim de OpenStreetMap).
   Recibe sus dependencias por parámetro para poder probarse sin navegador. */
function locationError(code, message) {
  return Object.assign(new Error(message), { code });
}

export function createLocationService({
  geolocation = globalThis.navigator?.geolocation,
  fetchFn = globalThis.fetch?.bind(globalThis)
} = {}) {
  let cached = null;
  let seq = 0;

  return {
    /** Última posición obtenida, o null. */
    cachedPosition: () => cached,

    /** Posición actual [lat, lng]. Rechaza con error.code = 'unsupported' o 'denied'. */
    getPosition({ useCache = false } = {}) {
      if (useCache && cached) return Promise.resolve(cached);
      if (!geolocation) return Promise.reject(locationError('unsupported', 'Tu navegador no permite usar la ubicación'));
      return new Promise((resolve, reject) => {
        geolocation.getCurrentPosition(
          p => { cached = [p.coords.latitude, p.coords.longitude]; resolve(cached); },
          () => reject(locationError('denied', 'No se pudo obtener tu ubicación'))
        );
      });
    },

    /** Dirección corta de unas coordenadas. Devuelve null si falla o si llegó una consulta más nueva. */
    async reverseGeocode(lat, lng) {
      const mine = ++seq;
      try {
        const res = await fetchFn(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es`);
        const datos = await res.json();
        if (mine !== seq || !datos.display_name) return null;
        return datos.display_name.split(',').slice(0, 3).join(',').trim();
      } catch {
        return null;
      }
    }
  };
}