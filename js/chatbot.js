/* Asistente CityTux: respuestas preprogramadas con enlaces */
(function () {
  const BASE = [
    {
      keys: ['hola', 'buenas', 'buenos', 'ayuda', 'inicio'],
      text: 'Hola, soy el asistente de CityTux. Puedo ayudarte a reportar una incidencia, ver el mapa o resolver dudas. ¿Qué necesitas?',
      links: [{ label: 'Hacer un reporte', href: '#reportar' }, { label: 'Ver el mapa', href: '#mapa' }]
    },
    {
      keys: ['reportar', 'reporte', 'reporto', 'crear', 'nuevo', 'como', 'denunciar'],
      text: 'Reportar toma cuatro pasos: elige el tipo de incidencia y su urgencia, marca la ubicación en el mapa, agrega una foto y confirma.',
      links: [{ label: 'Empezar un reporte', href: '#reportar' }]
    },
    {
      keys: ['bache', 'baches', 'hoyo', 'pavimento', 'calle rota'],
      text: 'Para un bache, elige “Baches” y marca el punto exacto. Una foto con algo de referencia (un zapato, una moneda) ayuda a medir su tamaño.',
      links: [{ label: 'Reportar un bache', href: '#reportar' }, { label: 'Sitio del Ayuntamiento', href: 'https://www.tuxtla.gob.mx' }]
    },
    {
      keys: ['luz', 'luces', 'luminaria', 'alumbrado', 'poste', 'apagado', 'oscuro', 'oscura', 'oscuridad'],
      text: 'Si una luminaria no enciende, reporta la calle y el número de poste si lo tiene. Si hay cables caídos, no los toques y llama a CFE al 071.',
      links: [{ label: 'Reportar luminaria', href: '#reportar' }, { label: 'CFE', href: 'https://www.cfe.mx' }]
    },
    {
      keys: ['fuga', 'agua', 'tuberia', 'tubería', 'drenaje'],
      text: 'Para fugas de agua, indica si brota en la banqueta o en la calle y desde cuándo ocurre. Si hay riesgo inmediato, llama al 911.',
      links: [{ label: 'Reportar fuga', href: '#reportar' }]
    },
    {
      keys: ['basura', 'residuos', 'tiradero', 'recoleccion', 'recolección', 'limpieza', 'barrido'],
      text: 'Para basura acumulada o falta de limpieza, elige la categoría que mejor describa el problema (Basura, Gestión de residuos o Limpieza de calle) y adjunta una foto.',
      links: [{ label: 'Reportar basura', href: '#reportar' }]
    },
    {
      keys: ['inundacion', 'inundación', 'lluvia', 'encharcamiento', 'rio', 'río'],
      text: 'Las inundaciones suelen ser de urgencia alta. Reporta el punto y suma a tus vecinos en Comunidad para darle más peso. Si hay personas en riesgo, llama al 911.',
      links: [{ label: 'Reportar inundación', href: '#reportar' }, { label: 'Ver Comunidad', href: '#comunidad' }]
    },
    {
      keys: ['semaforo', 'semáforo', 'transito', 'tránsito', 'tope', 'topes', 'vialidad', 'señal', 'senal'],
      text: 'Los problemas de tránsito (semáforos dañados, exceso de topes, falta de señalamiento) van en “Tránsito y vialidad”. Indica el cruce o la calle.',
      links: [{ label: 'Reportar tránsito y vialidad', href: '#reportar' }]
    },
    {
      keys: ['estado', 'seguimiento', 'consultar', 'mis reportes', 'mi reporte', 'estado de mi reporte', 'status', 'folio'],
      text: 'Puedes ver el estado de tus reportes (pendiente, en proceso o resuelto) en la sección Mis reportes.',
      links: [{ label: 'Ir a Mis reportes', href: '#mis-reportes' }]
    },
    {
      keys: ['sumarse', 'sumar', 'comunidad', 'vecinos', 'gps', 'ubicacion', 'ubicación'],
      text: 'En Comunidad puedes sumarte a un reporte que también te afecte. Para validar que estás cerca (a menos de 5 km), te pedirá activar tu ubicación GPS.',
      links: [{ label: 'Ir a Comunidad', href: '#comunidad' }]
    },
    {
      keys: ['mapa', 'donde', 'dónde', 'zona', 'colonia'],
      text: 'El mapa muestra los reportes de Tuxtla Gutiérrez por color: rojo es urgencia alta, amarillo media y verde baja. Puedes filtrar por urgencia.',
      links: [{ label: 'Abrir el mapa', href: '#mapa' }]
    },
    {
      keys: ['emergencia', 'urgente', 'peligro', 'accidente', 'herido', '911', 'incendio'],
      text: 'CityTux no atiende emergencias. Si hay personas en peligro, llama al 911 de inmediato.',
      links: [{ label: 'Protección Civil Chiapas', href: 'https://www.proteccioncivil.chiapas.gob.mx' }]
    },
    {
      keys: ['sesion', 'sesión', 'gmail', 'cuenta', 'registro', 'registrar', 'google'],
      text: 'El inicio de sesión con Gmail estará disponible próximamente. Por ahora puedes explorar la aplicación y preparar tus reportes.',
      links: []
    }
  ];

  const FALLBACK = {
    text: 'No estoy seguro de haberte entendido. Prueba con una de las opciones o escribe palabras como “bache”, “luminaria”, “inundación” o “estado de mi reporte”.',
    links: [{ label: 'Hacer un reporte', href: '#reportar' }, { label: 'Ver Comunidad', href: '#comunidad' }]
  };

  const CHIPS = ['¿Cómo reporto?', 'Baches', 'Luminarias', 'Inundaciones', 'Estado de mi reporte', 'Emergencia'];

  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Coincidencia por palabra completa (evita que "barrio" active "rio").
  // Palabras largas aceptan plurales/variantes cortas: bache -> baches, inundacion -> inundaciones.
  function hit(words, padded, key) {
    const k = norm(key);
    if (k.includes(' ')) return padded.includes(' ' + k + ' ');
    const extra = k.length >= 5 ? 4 : k.length === 4 ? 1 : 0;
    return words.some(w => w === k || (w.startsWith(k) && w.length - k.length <= extra));
  }

  function answer(q) {
    const words = norm(q).split(/[^a-z0-9]+/).filter(Boolean);
    const padded = ' ' + words.join(' ') + ' ';
    let best = null, score = 0;
    BASE.forEach(item => {
      const s = item.keys.reduce((n, k) => hit(words, padded, k) ? n + (k.includes(' ') ? 3 : k.length > 4 ? 2 : 1) : n, 0);
      if (s > score) { score = s; best = item; }
    });
    return best || FALLBACK;
  }

  const $ = id => document.getElementById(id);
  const body = $('chatBody');

  function add(who, text, links) {
    const el = document.createElement('div');
    el.className = 'msg msg--' + who;
    el.textContent = text;
    if (links && links.length) {
      const box = document.createElement('div');
      box.className = 'msg__links';
      links.forEach(l => {
        const a = document.createElement('a');
        a.href = l.href;
        a.textContent = l.label;
        if (l.href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
        else a.addEventListener('click', () => { if (window.innerWidth < 600) toggle(false); });
        box.appendChild(a);
      });
      el.appendChild(box);
    }
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function ask(q) {
    if (!q.trim()) return;
    add('me', q);
    const r = answer(q);
    setTimeout(() => add('bot', r.text, r.links), 350);
  }

  CHIPS.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = c;
    b.addEventListener('click', () => ask(c));
    $('chatChips').appendChild(b);
  });

  $('chatForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('chatInput').value;
    $('chatInput').value = '';
    ask(v);
  });

  let greeted = false;
  function toggle(open) {
    $('chat').hidden = !open;
    $('chatFab').setAttribute('aria-expanded', String(open));
    if (open && !greeted) {
      greeted = true;
      add('bot', 'Hola, soy el asistente de CityTux. Elige una opción o escribe tu duda.');
    }
    if (open) $('chatInput').focus(); else $('chatFab').focus();
  }
  $('chatFab').addEventListener('click', () => toggle($('chat').hidden));
  $('chatClose').addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('chat').hidden) toggle(false); });
})();
