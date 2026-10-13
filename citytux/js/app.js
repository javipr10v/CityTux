/* CityTux: navegación, mapa, reportes y comunidad */
const TUXTLA = [16.7516, -93.1167];

const CATS = {
  bache:      { label: 'Baches',              single: 'Bache', icon: 'i-bache',      color: '#2f6bff' },
  luminaria:  { label: 'Luminarias',          single: 'Luminaria', icon: 'i-luminaria',  color: '#f0a020' },
  fuga:       { label: 'Fugas de agua',       single: 'Fuga de agua', icon: 'i-fuga',       color: '#3b82f6' },
  basura:     { label: 'Basura',              single: 'Acumulación de basura', icon: 'i-basura',     color: '#e5484d' },
  residuos:   { label: 'Gestión de residuos', single: 'Gestión de residuos', icon: 'i-residuos',   color: '#2fb36d' },
  limpieza:   { label: 'Limpieza de calle',   single: 'Limpieza de calle', icon: 'i-limpieza',   color: '#64748b' },
  transito:   { label: 'Tránsito y vialidad', single: 'Incidencia de tránsito', icon: 'i-transito',   color: '#8b5cf6' },
  inundacion: { label: 'Inundaciones',        single: 'Inundación', icon: 'i-inundacion', color: '#0ea5b7' }
};
const URG = {
  alta:  { label: 'Alta',  color: '#e5484d', hint: 'Riesgo para personas o daño que crece rápido' },
  media: { label: 'Media', color: '#f0a020', hint: 'Requiere atención pronta' },
  baja:  { label: 'Baja',  color: '#2fb36d', hint: 'Molestia que puede esperar' }
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
  { name: 'Centro', note: 'Parque Central y Av. Central', c1: '#e9b45f', c2: '#7a3b2e', shape: 'plaza' },
  { name: 'Cañón del Sumidero', note: 'Ruta del río Grijalva', c1: '#d9a45b', c2: '#16233b', shape: 'canon' },
  { name: 'Parque de la Marimba', note: 'Punto de encuentro de la ciudad', c1: '#7fc8a9', c2: '#1b5e4b', shape: 'marimba' }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
function route() {
  const r = ROUTES.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'inicio';
  $$('.page').forEach(p => p.classList.toggle('is-active', p.id === 'page-' + r));
  $$('#nav a').forEach(a => a.classList.toggle('is-active', a.dataset.route === r));
  window.scrollTo(0, 0);
  if (r === 'inicio') paintStats();
  if (r === 'mapa') initMainMap();
  if (r === 'reportar') { initPickMap(); paintForm(); }
  if (r === 'comunidad') renderFeed();
  if (r === 'mis-reportes') renderMine();
}
window.addEventListener('hashchange', route);

/* ---------- Inicio ---------- */
$('#homeCats').innerHTML = Object.entries(CATS).map(([k, c]) => `
  <a class="cat" href="#reportar" data-cat="${k}" style="--c:${c.color}">
    <span class="cat__ico">${icon(c.icon)}</span>${c.label}
  </a>`).join('');
$$('#homeCats .cat').forEach(a => a.addEventListener('click', () => { state.cat = a.dataset.cat; state.step = 0; }));

function zoneArt(z) {
  const base = `<defs><linearGradient id="g-${z.shape}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${z.c1}"/><stop offset="1" stop-color="${z.c2}"/></linearGradient></defs><rect width="400" height="130" fill="url(#g-${z.shape})"/>`;
  const art = {
    plaza: `<path d="M0 130V92h60V70h26v22h40V60l30-22 30 22v32h50V78h30V50h24v28h30v14h80v38z" fill="#2a1612" opacity=".85"/><path d="M180 60l30-22 30 22" stroke="#f3d79a" stroke-width="3" fill="none"/><rect x="196" y="76" width="28" height="54" fill="#f3d79a" opacity=".55"/>`,
    canon: `<path d="M0 130V20l50 18 24 50 36 8 20 34z" fill="#0c1424"/><path d="M400 130V12l-60 24-30 56-44 10-14 28z" fill="#0c1424"/><path d="M120 130l40-14h120l40 14z" fill="#1c5a63"/>`,
    marimba: `<g fill="#0e3a2e"><circle cx="70" cy="62" r="34"/><circle cx="330" cy="58" r="40"/><rect x="66" y="80" width="8" height="50"/><rect x="326" y="84" width="8" height="46"/></g><rect x="130" y="82" width="140" height="10" rx="4" fill="#f3d79a"/><rect x="140" y="92" width="6" height="38" fill="#f3d79a"/><rect x="254" y="92" width="6" height="38" fill="#f3d79a"/><path d="M130 82l70-34 70 34z" fill="#c9553d"/>`
  };
  return `<svg viewBox="0 0 400 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${base}${art[z.shape]}</svg>`;
}
$('#zones').innerHTML = ZONES.map(z => `<article class="zone">${zoneArt(z)}<div><strong>${z.name}</strong><span>${z.note}</span></div></article>`).join('');

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

function pinIcon(color) {
  return L.divIcon({ className: '', html: `<span class="pin" style="--c:${color}"></span>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
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
    markers[r.id] = L.marker(r.pos, { icon: pinIcon(URG[r.urg].color) }).addTo(mainLayer)
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
  `<button type="button" class="pick" data-cat="${k}">${icon(c.icon)}${c.label}</button>`).join('');
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
  else pickMarker = L.marker(latlng, { icon: pinIcon('#2fb36d') }).addTo(pickMap);
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
      ? `<div class="post__img" style="background:#000"><img src="${r.photo}" alt="" style="width:100%;height:100%;object-fit:cover"><span>${icon(c.icon)}${c.label}</span></div>`
      : `<div class="post__img" style="--c:${c.color}">${icon(c.icon)}<span>${icon(c.icon)}${c.label}</span></div>`;
    const on = joined.has(r.id), own = MINE.includes(r.id);
    return `<article class="post">
      <div class="post__head"><div class="avatar">${init}</div>
        <div class="post__who"><strong>${esc(r.author)}</strong><span class="badge badge--${r.urg}">${URG[r.urg].label}</span>
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
      <div class="item__img" style="--c:${c.color}">${r.photo ? `<img src="${r.photo}" alt="">` : icon(c.icon)}</div>
      <span class="item__bar" style="--u:${URG[r.urg].color}"></span>
      <div class="item__main"><strong>${esc(r.title)}</strong><small>${esc(r.place)}</small><small>${r.date}</small></div>
      <span class="status status--${r.status}">${STATUS[r.status]}</span></article>`;
  }).join('') || '<p class="empty">No tienes reportes en este estado.</p>';
}
$('#myTabs').addEventListener('click', e => {
  const b = e.target.closest('.tab'); if (!b) return;
  myTab = b.dataset.t; renderMine();
});

/* ---------- Arranque ---------- */
paintForm();
route();

/* Foto real de Tuxtla (opcional): coloca img/tuxtla.jpg y agrega la clase has-photo a <div class="hero"> en index.html */
