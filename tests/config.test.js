import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { SERVICES } from '../js/config/services.js';
import { URGENCY, STATUS } from '../js/config/levels.js';
import { ZONES } from '../js/config/zones.js';

const raiz = new URL('../', import.meta.url);
const existe = ruta => existsSync(new URL(ruta, raiz));

test('cada servicio tiene nombre, descripción, ícono y subcategorías', () => {
  assert.deepEqual(Object.keys(SERVICES), ['municipales', 'agua', 'transito']);
  for (const [id, s] of Object.entries(SERVICES)) {
    for (const campo of ['label', 'description', 'icon']) assert.ok(s[campo], `${id} no tiene "${campo}"`);
    assert.ok(Object.keys(s.subs).length > 0, `${id} no tiene subcategorías`);
    if (s.img) assert.ok(existe(s.img), `Falta la imagen ${s.img}`); // las imágenes definitivas están pendientes
  }
});

test('el catálogo no menciona SMAPA (decisión del proyecto)', () => {
  assert.doesNotMatch(JSON.stringify(SERVICES), /smapa/i);
});

test('cada zona tiene imagen existente y texto alternativo', () => {
  assert.equal(ZONES.length, 3);
  for (const z of ZONES) {
    assert.ok(z.alt, `${z.name} no tiene texto alternativo`);
    assert.ok(existe(z.img), `Falta la imagen ${z.img}`);
  }
});

test('hay 3 urgencias con color y 3 estados', () => {
  assert.deepEqual(Object.keys(URGENCY), ['alta', 'media', 'baja']);
  for (const u of Object.values(URGENCY)) assert.match(u.color, /^#[0-9a-f]{6}$/);
  assert.deepEqual(Object.keys(STATUS), ['pendiente', 'proceso', 'resuelto']);
});