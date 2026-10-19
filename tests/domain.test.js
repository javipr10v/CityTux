import test from 'node:test';
import assert from 'node:assert/strict';
import { distanceKm, isInsideCity } from '../js/domain/geo.js';
import {
  emptyDraft, validateStep, validatePhoto, canAddPhoto, buildReport, formatDate,
  initials, summarize, byUrgency, byStatus, countByStatus, checkJoin
} from '../js/domain/report.js';
import { answer, SUGGESTIONS, GREETING } from '../js/domain/assistant.js';

const CENTRO = [16.7536, -93.1148];

test('geo: distancias', () => {
  assert.equal(distanceKm(CENTRO, CENTRO), 0);
  assert.ok(Math.abs(distanceKm([0, 0], [1, 0]) - 111.19) < 0.1, 'un grado de latitud son unos 111 km');
  assert.equal(distanceKm(CENTRO, [17.9, -92.9]), distanceKm([17.9, -92.9], CENTRO));
});

test('geo: puntos dentro y fuera de Tuxtla', () => {
  assert.equal(isInsideCity(CENTRO), true);
  assert.equal(isInsideCity([17.9, -92.9]), false);
});

test('formulario: validación de cada paso', () => {
  const d = emptyDraft();
  assert.match(validateStep(d), /Elige el problema/);
    assert.equal(validateStep({ ...d, cat: 'baches' }), null);
  assert.match(validateStep({ ...d, step: 1 }), /Marca el punto/);
  assert.match(validateStep({ ...d, step: 1, pos: [17.9, -92.9] }), /fuera de Tuxtla/);
  assert.equal(validateStep({ ...d, step: 1, pos: CENTRO }), null);
  assert.equal(validateStep({ ...d, step: 2 }), null);
  assert.equal(validateStep({ ...d, step: 3 }), null);
});

test('fotos: tipo, peso y límite', () => {
  assert.match(validatePhoto({ type: 'image/gif', size: 1000 }), /PNG o JPG/);
  assert.match(validatePhoto({ type: 'image/png', size: 11 * 1024 * 1024 }), /menos de 10 MB/);
  assert.equal(validatePhoto({ type: 'image/jpeg', size: 1024 * 1024 }), null);
  assert.equal(canAddPhoto({ photos: ['a', 'b', 'c'] }), true);
  assert.equal(canAddPhoto({ photos: ['a', 'b', 'c', 'd'] }), false);
});

test('reporte: construcción desde el borrador', () => {
  const base = { ...emptyDraft(), cat: 'inundacion', pos: CENTRO, addr: '  Calle Prueba  ', desc: 'Se inunda', photos: ['f1', 'f2'] };
  const r = buildReport(base, { id: 7, now: new Date(2026, 8, 5) });
  assert.equal(r.title, 'Inundaciones y encharcamientos');
  assert.equal(r.place, 'Calle Prueba');
  assert.equal(r.date, '05/09/2026');
  assert.equal(r.status, 'pendiente');
  assert.equal(r.neighbors, 1);
  assert.equal(r.photo, 'f1');
  assert.deepEqual(r.photos, ['f1', 'f2']);
  const vacio = buildReport({ ...emptyDraft(), cat: 'limpia', pos: CENTRO }, { id: 8 });
  assert.equal(vacio.title, 'Limpia y Aseo Público');
  assert.equal(vacio.place, 'Ubicación marcada en el mapa');
  assert.equal(vacio.text, 'Sin descripción');
  assert.equal(vacio.photo, undefined);
});

test('reporte: utilidades de fecha y avatar', () => {
  assert.equal(formatDate(new Date(2026, 0, 9)), '09/01/2026');
  assert.equal(initials('María López'), 'ML');
  assert.equal(initials('Tú'), 'T');
});

const REPORTES = [
  { id: 1, urg: 'alta', status: 'proceso', neighbors: 10, pos: CENTRO },
  { id: 2, urg: 'media', status: 'resuelto', neighbors: 5, pos: CENTRO },
  { id: 3, urg: 'alta', status: 'pendiente', neighbors: 1, pos: [17.9, -92.9] }
];

test('consultas: totales, filtros y conteos', () => {
  assert.deepEqual(summarize(REPORTES), { activos: 2, proceso: 1, vecinos: 16 });
  assert.equal(byUrgency(REPORTES, 'alta').length, 2);
  assert.equal(byUrgency(REPORTES, 'todas').length, 3);
  assert.equal(byStatus(REPORTES, 'resuelto').length, 1);
  assert.equal(byStatus(REPORTES, 'todos').length, 3);
  assert.deepEqual(countByStatus(REPORTES), { todos: 3, pendiente: 1, proceso: 1, resuelto: 1 });
});

test('sumarse: reporte propio, lejos y cerca', () => {
  assert.equal(checkJoin(REPORTES[0], CENTRO, { isOwn: true }).ok, false);
  const lejos = checkJoin(REPORTES[2], CENTRO);
  assert.equal(lejos.ok, false);
  assert.match(lejos.message, /Solo puedes sumarte a menos de 5 km/);
  assert.equal(checkJoin(REPORTES[0], CENTRO).ok, true);
});

test('asistente: sugerencias rápidas', () => {
  const esperado = [/cuatro pasos/, /bache/i, /luminaria/i, /inundaciones/i, /Mis reportes/, /911/];
  assert.equal(SUGGESTIONS.length, esperado.length);
  SUGGESTIONS.forEach((s, i) => assert.match(answer(s).text, esperado[i], `"${s}" respondió otra cosa`));
  assert.match(GREETING, /asistente de CityTux/);
});

test('asistente: frases libres', () => {
  assert.match(answer('hay un hoyo en mi barrio').text, /bache/i);
  assert.match(answer('la calle esta oscura').text, /luminaria/i);
  assert.match(answer('quiero ver el estado de mi reporte').text, /Mis reportes/);
  assert.match(answer('asdfgh').text, /No estoy seguro/);
});