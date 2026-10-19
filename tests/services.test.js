import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryReportRepository } from '../js/data/reportRepository.js';
import { SEED_REPORTS, SEED_MINE_IDS } from '../js/data/seedReports.js';
import { createReportService } from '../js/services/reportService.js';
import { createLocationService } from '../js/services/locationService.js';
import { emptyDraft } from '../js/domain/report.js';

const CENTRO = [16.7536, -93.1148];
const LEJOS = [17.9, -92.9];
const nuevoServicio = () => createReportService(createMemoryReportRepository({ reports: SEED_REPORTS, mineIds: SEED_MINE_IDS }));

/* ---------- reportService ---------- */

test('stats: coincide con los datos de ejemplo (5 activos, 2 en proceso, 109 vecinos)', async () => {
  assert.deepEqual(await nuevoServicio().stats(), { activos: 5, proceso: 2, vecinos: 109 });
});

test('feed: filtra por urgencia y marca los reportes propios', async () => {
  const s = nuevoServicio();
  assert.equal((await s.feed()).length, 6);
  const altas = await s.feed('alta');
  assert.deepEqual(altas.map(r => r.id), [1, 2, 5]);
  assert.deepEqual(altas.map(r => r.own), [false, true, false]);
});

test('mine: solo los del usuario, con conteo por estado', async () => {
  const { items, counts } = await nuevoServicio().mine();
  assert.deepEqual(items.map(r => r.id), [2, 3, 4]);
  assert.deepEqual(counts, { todos: 3, pendiente: 1, proceso: 1, resuelto: 1 });
  assert.deepEqual((await nuevoServicio().mine('resuelto')).items.map(r => r.id), [3]);
});

test('submit: rechaza borradores incompletos y guarda los válidos', async () => {
  const s = nuevoServicio();
  await assert.rejects(() => s.submit(emptyDraft()), /Elige el problema/);
  await assert.rejects(() => s.submit({ ...emptyDraft(), cat: 'baches' }), /Marca el punto/);
  await assert.rejects(() => s.submit({ ...emptyDraft(), cat: 'baches', pos: LEJOS }), /fuera de Tuxtla/);
  const r = await s.submit({ ...emptyDraft(), cat: 'inundacion', pos: CENTRO });
  assert.equal(r.title, 'Inundaciones y encharcamientos');
  assert.equal(r.id, 7);
  assert.equal((await s.mine()).items[0].id, 7);
  assert.equal((await s.stats()).activos, 6);
});

test('toggleJoin: propio, lejos, cerca y quitar apoyo', async () => {
  const s = nuevoServicio();
  const sinGps = async () => { throw new Error('no debía pedirse el GPS'); };
  assert.equal((await s.toggleJoin(2, sinGps)).ok, false);               // reporte propio: no pide GPS
  assert.match((await s.toggleJoin(1, async () => LEJOS)).message, /Solo puedes sumarte a menos de 5 km/);
  assert.deepEqual(await s.toggleJoin(1, async () => CENTRO), { ok: true, joined: true });
  assert.equal((await s.feed()).find(r => r.id === 1).joined, true);
  assert.equal((await s.stats()).vecinos, 110);
  assert.deepEqual(await s.toggleJoin(1, sinGps), { ok: true, joined: false }); // quitar apoyo: tampoco pide GPS
  assert.equal((await s.toggleJoin(999, sinGps)).ok, false);
});

/* ---------- locationService ---------- */

const geoOk = { getCurrentPosition: ok => ok({ coords: { latitude: 16.75, longitude: -93.11 } }) };
const geoNo = { getCurrentPosition: (ok, err) => err(new Error('denegado')) };

test('ubicación: posición, caché y errores', async () => {
  const loc = createLocationService({ geolocation: geoOk });
  assert.equal(loc.cachedPosition(), null);
  assert.deepEqual(await loc.getPosition(), [16.75, -93.11]);
  assert.deepEqual(loc.cachedPosition(), [16.75, -93.11]);
  await assert.rejects(() => createLocationService({ geolocation: geoNo }).getPosition(), { code: 'denied' });
  await assert.rejects(() => createLocationService({ geolocation: null }).getPosition(), { code: 'unsupported' });
});

test('ubicación: la caché solo se usa cuando se pide', async () => {
  let llamadas = 0;
  const gps = { getCurrentPosition: ok => { llamadas++; ok({ coords: { latitude: 1, longitude: 2 } }); } };
  const loc = createLocationService({ geolocation: gps });
  await loc.getPosition();
  await loc.getPosition({ useCache: true });
  assert.equal(llamadas, 1);
  await loc.getPosition();
  assert.equal(llamadas, 2);
});

const respuesta = datos => ({ json: async () => datos });

test('dirección: se acorta a tres partes y tolera fallos', async () => {
  const loc = createLocationService({ fetchFn: async () => respuesta({ display_name: 'Calle Uno, Colonia Dos, Ciudad Tres, Estado, País' }) });
  assert.equal(await loc.reverseGeocode(16.75, -93.11), 'Calle Uno, Colonia Dos, Ciudad Tres');
  assert.equal(await createLocationService({ fetchFn: async () => respuesta({}) }).reverseGeocode(1, 2), null);
  assert.equal(await createLocationService({ fetchFn: async () => { throw new Error('sin red'); } }).reverseGeocode(1, 2), null);
});

test('dirección: una respuesta lenta y vieja no pisa a una más nueva', async () => {
  const pendientes = [];
  const loc = createLocationService({ fetchFn: () => new Promise(resolve => pendientes.push(resolve)) });
  const primera = loc.reverseGeocode(1, 1);
  const segunda = loc.reverseGeocode(2, 2);
  pendientes[1](respuesta({ display_name: 'Nueva, Col. B, Ciudad' }));
  pendientes[0](respuesta({ display_name: 'Vieja, Col. A, Ciudad' }));
  assert.equal(await segunda, 'Nueva, Col. B, Ciudad');
  assert.equal(await primera, null);
});