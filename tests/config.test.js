import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { CATEGORIES } from '../js/config/categories.js';
import { URGENCY, STATUS } from '../js/config/levels.js';
import { ZONES } from '../js/config/zones.js';

const raiz = new URL('../', import.meta.url);
const existe = ruta => existsSync(new URL(ruta, raiz));

test('cada categoría tiene todos sus campos y su imagen existe', () => {
  assert.equal(Object.keys(CATEGORIES).length, 8);
  for (const [id, c] of Object.entries(CATEGORIES)) {
    for (const campo of ['label', 'single', 'icon', 'img']) assert.ok(c[campo], `${id} no tiene "${campo}"`);
    assert.ok(existe(c.img), `Falta la imagen ${c.img}`);
  }
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