/* CityTux: navegación, mapa, reportes y comunidad */
const TUXTLA = [16.7516, -93.1167];

const CATS = {
  bache:      { label: 'Baches',              single: 'Bache',                  icon: 'i-bache',      img: 'img/icon-bache.webp' },
  luminaria:  { label: 'Luminarias',          single: 'Luminaria',              icon: 'i-luminaria',  img: 'img/icon-luminaria.webp' },
  fuga:       { label: 'Fugas de agua',       single: 'Fuga de agua',           icon: 'i-fuga',       img: 'img/icon-fuga.webp' },
  basura:     { label: 'Basura',              single: 'Acumulación de basura',  icon: 'i-basura',     img: 'img/icon-basura.webp' },
  residuos:   { label: 'Gestión de residuos', single: 'Gestión de residuos',    icon: 'i-residuos',   img: 'img/icon-residuos.webp' },
  limpieza:   { label: 'Limpieza de calle',   single: 'Limpieza de calle',      icon: 'i-limpieza',   img: 'img/icon-limpieza.webp' },
  transito:   { label: 'Tránsito y vialidad', single: 'Incidencia de tránsito', icon: 'i-transito',   img: 'img/icon-transito.webp' },
  inundacion: { label: 'Inundaciones',        single: 'Inundación',             icon: 'i-inundacion', img: 'img/icon-inundacion.webp' }
};
const URG = {
  alta:  { label: 'Alta',  color: '#d92d20', hint: 'Riesgo para personas o daño que crece rápido' },
  media: { label: 'Media', color: '#b86e00', hint: 'Requiere atención pronta' },
  baja:  { label: 'Baja',  color: '#238a50', hint: 'Molestia que puede esperar' }
};
const STATUS = { pendiente: 'Pendiente', proceso: 'En proceso', resuelto: 'Resuelto' };

const REPORTS = [
  { id: 1, cat: 'inundacion', urg: 'alta',  status: 'proceso',   title: 'Inundación', place: 'Blvd. Belisario Domínguez', pos: [16.7478, -93.1310], date: '29/09/2026', author: 'María López', neighbors: 34, text: 'El boulevard se inunda cada vez que llueve. Ya son 3 ocasiones este mes y los carros quedan varados.' },
  { id: 2, cat: 'bache',      urg: 'alta',  status: 'proceso',   title: 'Bache', place: 'Av. Central y 5a Norte, Centro', pos: [16.7536, -93.1148], date: '05/09/2026', author: 'Tú', neighbors: 21, text: 'Bache enorme en el carril derecho. Ya causó 2 ponchaduras esta semana. Urge atención.' },
  { id: 3, cat: 'basura',     urg: 'media', status: 'resuelto',  title: 'Acumulación de basura', place: 'Col. Los Laguitos', pos: [16.7452, -93.0998], date: '25/08/2026', author: 'Tú', neighbors: 12, text: 'Llevan más de una semana sin recoger la basura de la esquina. Ya hay mal olor y fauna nociva.' },
  { id: 4, cat: 'luminaria',  urg: 'media', status: 'pendiente', title: 'Luminaria descompuesta', place: 'Col. Terán', pos: [16.7325, -93.1470], date: '02/09/2026', author: 'Tú', neighbors: 9, text: 'Tres postes seguidos sin luz en la calle principal. En la noche es muy peligroso caminar.' },
  { id: 5, cat: 'transito',   urg: 'alta',  status: 'pendiente', title: 'Semáforo dañado', place: 'Libramiento Norte Poniente', pos: [16.7685, -93.1495], date: '28/09/2026', author: 'Sofía Pérez', neighbors: 27, text: 'El semáforo del crucero está en intermitente desde ayer y ya hubo un casi accidente.' },
  { id: 6, cat: 'fuga',       urg: 'baja',  status: 'pendiente', title: 'Fuga de agua', place: 'Col. Moctezuma', pos: [16.7570, -93.1020], date: '01/10/2026', author: 'Jorge Molina', neighbors: 6, text: 'Fuga constante en la banqueta, se desperdicia agua todo el día.' }
];
const MINE = [2, 3, 4]; // ids de reportes del usuario (demo)
const MAX_PHOTOS = 4;
const MAX_KM_FROM_CENTER = 20; // límite para aceptar un punto como "dentro de Tuxtla"
let nextId = 7;

const ZONES = [
  { name: 'Centro', note: 'Parque Central y Av. Central', img: 'img/zona-centro.webp', alt: 'Palomas volando frente a la torre del reloj en el Parque Central' },
  { name: 'Cañón del Sumidero', note: 'Ruta del río Grijalva', img: 'img/zona-sumidero.webp', alt: 'Río entre las paredes verdes del Cañón del Sumidero' },
  { name: 'Parque de la Marimba', note: 'Punto de encuentro de la ciudad', img: 'img/zona-marimba.webp', alt: 'Personas bailando junto al kiosco del Parque de la Marimba' }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* aria-pressed sincronizado con la clase is-on en botones tipo interruptor (filtros, categorías, urgencia, pestañas) */
const syncPressed = () => $$('.chip,.pick,.urg-row button,.tab').forEach(b => b.setAttribute('aria-pressed', b.classList.contains('is-on')));
new MutationObserver(syncPressed).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
$('#skip').addEventListener('click', e => { e.preventDefault(); $('#main').focus(); });
const icon = id => `<svg class="ico"><use href="#${id}"/></svg>`;

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('is-on'), 2600);
}
$$('[data-soon]').forEach(b => b.addEventListener('click', () => toast('Esta opción estará disponible próximamente')));

/* ---------- Router ---------- */
const ROUTES = ['inicio', 'reportar', 'mapa', 'comunidad', 'mis-reportes'];
const TITLES = { inicio: 'Inicio', reportar: 'Nuevo reporte', mapa: 'Mapa de incidencias', comunidad: 'Comunidad', 'mis-reportes': 'Mis reportes' };
let firstRoute = true;
function route() {
  const r = ROUTES.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'inicio';
  $$('.page').forEach(p => p.classList.toggle('is-active', p.id === 'page-' + r));
  $$('#nav a').forEach(a => {
    const on = a.dataset.route === r;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  document.title = `${TITLES[r]} · CityTux`;
  window.scrollTo(0, 0);
  if (r === 'inicio') paintStats();
  if (r === 'mapa') initMainMap();
  if (r === 'reportar') { initPickMap(); paintForm(); }
  if (r === 'comunidad') renderFeed();
  if (r === 'mis-reportes') renderMine();
  if (!firstRoute) { const h1 = $('#page-' + r + ' h1'); if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); } }
  firstRoute = false;
}
window.addEventListener('hashchange', route);

/* ---------- Inicio ---------- */
$('#homeCats').innerHTML = Object.entries(CATS).map(([k, c]) => `
  <a class="cat" href="#reportar" data-cat="${k}">
    <span class="cat__ico"><img src="${c.img}" alt="" decoding="async"></span>${c.label}
  </a>`).join('');
$$('#homeCats .cat').forEach(a => a.addEventListener('click', () => { state.cat = a.dataset.cat; state.step = 0; }));

$('#zones').innerHTML = ZONES.map(z => `<article class="zone"><img src="${z.img}" alt="${esc(z.alt)}" width="720" height="340" loading="lazy"><div><strong>${z.name}</strong><span>${z.note}</span></div></article>`).join('');

function paintStats() {
  const act = REPORTS.filter(r => r.status !== 'resuelto').length;
  $('#stActivos').dataset.count = act;
  $('#stProceso').dataset.count = REPORTS.filter(r => r.status === 'proceso').length;
  $('#stVecinos').dataset.count = REPORTS.reduce((n, r) => n + r.neighbors, 0);
  countUp();
}
function countUp() {
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, t0 = performance.now(), dur = 1100;
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

/* ---------- Mapas (Leaflet + OpenStreetMap) ---------- */
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTR = '&copy; Colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function pinIcon(color, letra = '') {
  return L.divIcon({ className: '', html: `<span class="pin" style="--c:${color}">${letra ? `<b>${letra}</b>` : ''}</span>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
}
function makeMap(id, zoom) {
  const m = L.map(id, { scrollWheelZoom: true }).setView(TUXTLA, zoom);
  L.tileLayer(TILES, { maxZoom: 19, attribution: ATTR }).addTo(m);
  return m;
}

let mainMap, mainLayer, mapFilter = 'todas', focusId = null, markers = {};
function drawMain() {
  mainLayer.clearLayers(); markers = {};
  REPORTS.filter(r => mapFilter === 'todas' || r.urg === mapFilter).forEach(r => {
    markers[r.id] = L.marker(r.pos, { icon: pinIcon(URG[r.urg].color, URG[r.urg].label[0]) }).addTo(mainLayer)
      .bindPopup(`<div class="pop"><strong>${esc(r.title)}</strong><small>${esc(r.place)}<br>Urgencia ${URG[r.urg].label.toLowerCase()} · ${r.neighbors} vecinos</small></div>`);
  });
}
function initMainMap() {
  if (!mainMap) {
    mainMap = makeMap('mainMap', 13);
    mainLayer = L.layerGroup().addTo(mainMap);
    drawMain();
  }
  setTimeout(() => {
    mainMap.invalidateSize();
    if (focusId && markers[focusId]) { mainMap.setView(markers[focusId].getLatLng(), 16); markers[focusId].openPopup(); }
    focusId = null;
  }, 60);
}
$('#mapFilters').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  $$('#mapFilters .chip').forEach(c => c.classList.toggle('is-on', c === b));
  mapFilter = b.dataset.f; drawMain();
});

/* ---------- Formulario de reporte ---------- */
const state = { step: 0, cat: null, urg: 'media', desc: '', addr: '', pos: null, photos: [] };
let pickMap, pickMarker;

$('#pickCats').innerHTML = Object.entries(CATS).map(([k, c]) =>
  `<button type="button" class="pick" data-cat="${k}"><img src="${c.img}" alt="" decoding="async">${c.label}</button>`).join('');
$('#pickCats').addEventListener('click', e => {
  const b = e.target.closest('.pick'); if (!b) return;
  state.cat = b.dataset.cat; paintForm();
});
$('#pickUrg').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  state.urg = b.dataset.u; paintForm();
});
$('#desc').addEventListener('input', e => { state.desc = e.target.value; $('#descCount').textContent = state.desc.length; });
$('#addr').addEventListener('input', e => { state.addr = e.target.value; });

function setPoint(latlng, geocode = true) {
  state.pos = [latlng.lat, latlng.lng];
  if (pickMarker) pickMarker.setLatLng(latlng);
  else pickMarker = L.marker(latlng, { icon: pinIcon('#c2410c') }).addTo(pickMap);
  if (geocode) reverseGeocode(latlng);
}
let geoSeq = 0;
async function reverseGeocode(ll) {
  const mine = ++geoSeq;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${ll.lat}&lon=${ll.lng}&accept-language=es`);
    const j = await res.json();
    if (mine !== geoSeq) return; // llegó una respuesta más nueva
    if (j.display_name) {
      state.addr = j.display_name.split(',').slice(0, 3).join(',').trim();
      $('#addr').value = state.addr;
    }
  } catch (_) { /* sin conexión: el usuario puede escribir la dirección */ }
}
function initPickMap() {
  if (!pickMap) {
    pickMap = makeMap('pickMap', 13);
    pickMap.on('click', e => setPoint(e.latlng));
  }
}
$('#btnLocate').addEventListener('click', () => {
  if (!navigator.geolocation) return toast('Tu navegador no permite usar la ubicación');
  navigator.geolocation.getCurrentPosition(p => {
    const ll = L.latLng(p.coords.latitude, p.coords.longitude);
    pickMap.setView(ll, 16); setPoint(ll);
  }, () => toast('No se pudo obtener tu ubicación. Marca el punto en el mapa.'));
});

function addPhotos(fileList) {
  [...fileList].forEach(f => {
    if (!/^image\/(png|jpeg)$/.test(f.type)) return toast('Solo se aceptan imágenes PNG o JPG');
    if (f.size > 10 * 1024 * 1024) return toast('Cada foto debe pesar menos de 10 MB');
    const rd = new FileReader();
    rd.onload = () => {
      if (state.photos.length >= MAX_PHOTOS) return toast(`Máximo ${MAX_PHOTOS} fotos por reporte`);
      state.photos.push(rd.result); paintThumbs();
    };
    rd.readAsDataURL(f);
  });
}
function paintThumbs() {
  $('#thumbs').innerHTML = state.photos.map((src, i) =>
    `<div><img src="${src}" alt="Foto ${i + 1}"><button type="button" data-i="${i}" aria-label="Quitar foto">${icon('i-close')}</button></div>`).join('');
}
$('#thumbs').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  state.photos.splice(+b.dataset.i, 1); paintThumbs();
});
$('#files').addEventListener('change', e => { addPhotos(e.target.files); e.target.value = ''; });
['dragover', 'dragenter'].forEach(ev => $('#drop').addEventListener(ev, e => { e.preventDefault(); $('#drop').classList.add('is-over'); }));
['dragleave', 'drop'].forEach(ev => $('#drop').addEventListener(ev, e => { e.preventDefault(); $('#drop').classList.remove('is-over'); }));
$('#drop').addEventListener('drop', e => addPhotos(e.dataTransfer.files));

function paintForm() {
  $$('#pickCats .pick').forEach(b => b.classList.toggle('is-on', b.dataset.cat === state.cat));
  $$('#pickUrg button').forEach(b => b.classList.toggle('is-on', b.dataset.u === state.urg));
  $('#urgHint').textContent = URG[state.urg].hint;
  $$('.step').forEach(s => s.hidden = +s.dataset.step !== state.step);
  $$('#stepper li').forEach((li, i) => {
    li.classList.toggle('is-on', i === state.step);
    if (i === state.step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    li.classList.toggle('is-done', i < state.step);
  });
  $('#btnBack').style.visibility = state.step === 0 ? 'hidden' : 'visible';
  $('#btnNext').textContent = state.step === 3 ? 'Enviar reporte' : 'Siguiente';
  $('#formError').hidden = true;
  if (state.step === 1 && pickMap) setTimeout(() => pickMap.invalidateSize(), 60);
  if (state.step === 3) {
    $('#summary').innerHTML = [
      ['Tipo', CATS[state.cat].label],
      ['Urgencia', URG[state.urg].label],
      ['Dirección', state.addr || (state.pos ? 'Punto marcado en el mapa' : 'No especificada')],
      ['Descripción', state.desc || 'Sin descripción'],
      ['Fotos', state.photos.length ? `${state.photos.length} adjunta${state.photos.length > 1 ? 's' : ''}` : 'Ninguna']
    ].map(([k, v]) => `<div><dt>${k}:</dt><dd>${esc(v)}</dd></div>`).join('');
  }
}
function formError(msg) { const e = $('#formError'); e.textContent = msg; e.hidden = false; }

$('#btnBack').addEventListener('click', () => { state.step--; paintForm(); });
$('#btnNext').addEventListener('click', () => {
  if (state.step === 0 && !state.cat) return formError('Elige el tipo de incidencia para continuar.');
  if (state.step === 1 && !state.pos) return formError('Marca el punto exacto en el mapa (o usa "Mi ubicación").');
  if (state.step === 1 && km(state.pos, TUXTLA) > MAX_KM_FROM_CENTER) return formError('Ese punto queda fuera de Tuxtla Gutiérrez. Marca uno dentro de la ciudad.');
  if (state.step < 3) { state.step++; return paintForm(); }
  submitReport();
});

function submitReport() {
  const r = {
    id: nextId++, cat: state.cat, urg: state.urg, status: 'pendiente', title: CATS[state.cat].single,
    place: state.addr.trim() || 'Ubicación marcada en el mapa', pos: state.pos,
    date: new Date().toLocaleDateString('es-MX'), author: 'Tú', neighbors: 1,
    text: state.desc || 'Sin descripción', photo: state.photos[0], photos: state.photos.slice()
  };
  REPORTS.unshift(r); MINE.unshift(r.id);
  if (mainMap) drawMain();
  Object.assign(state, { step: 0, cat: null, urg: 'media', desc: '', addr: '', pos: null, photos: [] });
  $('#desc').value = ''; $('#addr').value = ''; $('#descCount').textContent = '0';
  if (pickMarker) { pickMarker.remove(); pickMarker = null; }
  paintThumbs(); paintForm();
  toast('Reporte enviado');
  location.hash = '#mis-reportes';
}

/* ---------- Comunidad ---------- */
let feedFilter = 'todas', userPos = null;
const joined = new Set();

function km(a, b) {
  const R = 6371, rad = d => d * Math.PI / 180;
  const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function renderFeed() {
  const list = REPORTS.filter(r => feedFilter === 'todas' || r.urg === feedFilter);
  $('#feedCount').textContent = `${list.length} reportes`;
  $('#feed').innerHTML = list.map(r => {
    const c = CATS[r.cat], init = r.author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const media = r.photo
      ? `<div class="post__img post__img--photo"><img src="${r.photo}" alt="Foto del reporte"><span>${icon(c.icon)}${c.label}</span></div>`
      : `<div class="post__img"><img class="cat-img" src="${c.img}" alt=""><span>${icon(c.icon)}${c.label}</span></div>`;
    const on = joined.has(r.id), own = MINE.includes(r.id);
    return `<article class="post">
      <div class="post__head"><div class="avatar">${init}</div>
        <div class="post__who"><strong>${esc(r.author)}</strong><span class="badge badge--${r.urg}">${icon('i-' + r.urg)}${URG[r.urg].label}</span>
        <small>${icon(c.icon)}${c.label} · ${r.date}</small></div></div>
      ${media}
      <div class="post__loc">${icon('i-pin')}${esc(r.place)}</div>
      <p class="post__text">${esc(r.text)}</p>
      <div class="post__foot">
        <button class="join ${on ? 'is-on' : ''}" data-join="${r.id}" ${own ? 'disabled' : ''}>${own ? icon('i-check') + 'Tu reporte' : icon(on ? 'i-check' : 'i-users') + (on ? 'Sumado' : 'Sumarse')}</button>
        <span><b>${r.neighbors + (on ? 1 : 0)}</b> vecinos</span>
        <button class="linkish" data-map="${r.id}">${icon('i-pin')}Ver en mapa</button>
      </div></article>`;
  }).join('') || '<p class="empty">No hay reportes con esta urgencia.</p>';
}
function askGps(cb) {
  if (userPos) return cb(userPos);
  if (!navigator.geolocation) return toast('Tu navegador no permite usar la ubicación');
  navigator.geolocation.getCurrentPosition(p => {
    userPos = [p.coords.latitude, p.coords.longitude];
    $('#btnGps').innerHTML = `${icon('i-check')}Ubicación activa`;
    cb && cb(userPos);
  }, () => toast('Activa el permiso de ubicación en tu navegador para sumarte'));
}
$('#btnGps').addEventListener('click', () => askGps(() => toast('Ubicación activada')));
$('#feedFilters').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  $$('#feedFilters .chip').forEach(c => c.classList.toggle('is-on', c === b));
  feedFilter = b.dataset.f; renderFeed();
});
$('#feed').addEventListener('click', e => {
  const j = e.target.closest('[data-join]'), m = e.target.closest('[data-map]');
  if (j) {
    const id = +j.dataset.join, r = REPORTS.find(x => x.id === id);
    if (MINE.includes(id)) return;
    if (joined.has(id)) { joined.delete(id); return renderFeed(); }
    askGps(pos => {
      const d = km(pos, r.pos);
      if (d > 5) return toast(`Estás a ${d.toFixed(1)} km de esta incidencia. Solo puedes sumarte a menos de 5 km.`);
      joined.add(id); renderFeed(); toast('Te sumaste a este reporte');
    });
  }
  if (m) {
    focusId = +m.dataset.map; mapFilter = 'todas';
    $$('#mapFilters .chip').forEach(c => c.classList.toggle('is-on', c.dataset.f === 'todas'));
    if (mainMap) drawMain();
    location.hash = '#mapa';
  }
});

/* ---------- Mis reportes ---------- */
let myTab = 'todos';
function renderMine() {
  const mine = REPORTS.filter(r => MINE.includes(r.id));
  const tabs = [['todos', 'Todos'], ['pendiente', 'Pendientes'], ['proceso', 'En proceso'], ['resuelto', 'Resueltos']];
  $('#myTabs').innerHTML = tabs.map(([k, l]) => {
    const n = k === 'todos' ? mine.length : mine.filter(r => r.status === k).length;
    return `<button class="tab ${myTab === k ? 'is-on' : ''}" data-t="${k}">${l}<b>${n}</b></button>`;
  }).join('');
  const rows = mine.filter(r => myTab === 'todos' || r.status === myTab);
  $('#myList').innerHTML = rows.map(r => {
    const c = CATS[r.cat];
    return `<article class="item">
      <div class="item__img">${r.photo ? `<img src="${r.photo}" alt="Foto del reporte">` : `<img class="cat-img" src="${c.img}" alt="">`}</div>
      <span class="item__bar" style="--u:${URG[r.urg].color}"></span>
      <div class="item__main"><strong>${esc(r.title)}</strong><small>${esc(r.place)}</small><small>${r.date}</small></div>
      <span class="status status--${r.status}">${icon('i-' + r.status)}${STATUS[r.status]}</span></article>`;
  }).join('') || '<p class="empty">No tienes reportes en este estado.</p>';
}
$('#myTabs').addEventListener('click', e => {
  const b = e.target.closest('.tab'); if (!b) return;
  myTab = b.dataset.t; renderMine();
});

/* ---------- Arranque ---------- */
paintForm();
route();

syncPressed();
