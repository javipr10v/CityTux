/* Catálogo de servicios: 3 servicios y, dentro de cada uno, los problemas que el usuario puede reportar.
   - "agency" es el área a la que se turna el reporte (en el servicio sirve para todas sus subcategorías).
   - "notice" es un aviso que se muestra al elegir esa subcategoría.
   - "icon" es un ícono provisional; "img" queda pendiente (las imágenes definitivas se agregan después). */
export const SERVICES = {
  municipales: {
    label: 'Servicios Municipales',
    description: 'Alumbrado, limpia, áreas verdes, mercados, panteones y baches',
    icon: 'i-luminaria',
    img: null,
    subs: {
      alumbrado: { label: 'Alumbrado Público', hint: 'Luminarias apagadas, dañadas o calles oscuras', agency: 'Dirección de Alumbrado Público' },
      limpia: { label: 'Limpia y Aseo Público', hint: 'Basura acumulada, recolección o calles sucias', agency: 'Dirección de Limpia y Aseo Público' },
      imagen: { label: 'Imagen Urbana y Áreas Verdes', hint: 'Parques, jardines, árboles y espacios públicos', agency: 'Dirección de Imagen Urbana y Áreas Verdes' },
      mercados: { label: 'Mercados y Panteones', hint: 'Mercados municipales y panteones', agency: 'Dirección de Mercados y Panteones' },
      baches: { label: 'Baches y pavimento', hint: 'Hoyos o daños en la superficie de la calle', agency: 'Obras y Servicios Públicos Municipales' } // área por confirmar
    }
  },

  agua: {
    label: 'Agua y Alcantarillado',
    description: 'Falta de agua, fugas, drenaje e inundaciones',
    icon: 'i-fuga',
    img: null,
    agency: 'Agua y Alcantarillado',
    subs: {
      faltaAgua: { label: 'Falta de agua', hint: 'No hay suministro en tu vivienda o zona' },
      fugaRed: { label: 'Fuga de agua potable', hint: 'Sale agua de una tubería en la calle' },
      fugaToma: { label: 'Fuga en toma domiciliaria', hint: 'Fuga en la conexión de una casa o negocio' },
      contaminacion: { label: 'Contaminación del agua', hint: 'El agua tiene olor, color o aspecto inusual' },
      azolvamiento: { label: 'Azolvamiento de toma o red', hint: 'Obstrucción o problema de flujo en la red de agua potable' },
      drenaje: { label: 'Drenaje o alcantarillado', hint: 'Drenaje tapado, aguas negras o mal olor' },
      inundacion: { label: 'Inundaciones y encharcamientos', hint: 'Calles o zonas con agua acumulada', notice: 'Si hay personas en riesgo, llama al 911.' }
    }
  },

  transito: {
    label: 'Tránsito y Vialidad',
    description: 'Accidentes, circulación, señalización y semáforos',
    icon: 'i-transito',
    img: null,
    agency: 'Secretaría de Seguridad Pública y Tránsito Municipal',
    subs: {
      accidente: { label: 'Accidente de tránsito', hint: 'Colisión u otro incidente vial', notice: 'Si hay personas lesionadas, llama al 911.' },
      obstruccion: { label: 'Obstrucción de la circulación', hint: 'Un vehículo u obstáculo impide el paso' },
      malEstacionado: { label: 'Vehículo mal estacionado', hint: 'Infracción o vehículo que afecta la circulación' },
      circulacion: { label: 'Problema de circulación', hint: 'Situación vial que requiere intervención de Tránsito' },
      senalizacion: { label: 'Señalización dañada o faltante', hint: 'Señal rota o ausente que genera riesgo vial' },
      semaforo: { label: 'Semáforo fuera de servicio', hint: 'Un semáforo no funciona correctamente' }
    }
  }
};