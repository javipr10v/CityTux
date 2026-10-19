import test from 'node:test';
import assert from 'node:assert/strict';
import { SUBCATEGORIES, findSubcategory, subcategoriesOf } from '../js/domain/catalog.js';

test('hay 18 subcategorías: 5 en Servicios Municipales, 7 en Agua y 6 en Tránsito', () => {
  assert.equal(SUBCATEGORIES.length, 18);
  assert.equal(subcategoriesOf('municipales').length, 5);
  assert.equal(subcategoriesOf('agua').length, 7);
  assert.equal(subcategoriesOf('transito').length, 6);
});

test('los ids de las subcategorías no se repiten', () => {
  assert.equal(new Set(SUBCATEGORIES.map(s => s.id)).size, SUBCATEGORIES.length);
});

test('cada subcategoría tiene nombre, ayuda y área a la que se turna', () => {
  for (const s of SUBCATEGORIES) {
    for (const campo of ['label', 'hint', 'agency', 'serviceLabel']) assert.ok(s[campo], `${s.id} no tiene "${campo}"`);
  }
});

test('findSubcategory: devuelve el servicio y el área, o null si no existe', () => {
  const alumbrado = findSubcategory('alumbrado');
  assert.equal(alumbrado.serviceId, 'municipales');
  assert.equal(alumbrado.agency, 'Dirección de Alumbrado Público');
  assert.equal(findSubcategory('fugaRed').agency, 'Agua y Alcantarillado');           // el área viene del servicio
  assert.equal(findSubcategory('semaforo').agency, 'Secretaría de Seguridad Pública y Tránsito Municipal');
  assert.equal(findSubcategory('baches').serviceId, 'municipales');
  assert.equal(findSubcategory('inundacion').serviceId, 'agua');
  assert.equal(findSubcategory('bache'), null);                                          // el id viejo ya no existe
  assert.equal(findSubcategory(null), null);
});

test('avisos de emergencia: accidente e inundaciones piden llamar al 911', () => {
  assert.match(findSubcategory('accidente').notice, /911/);
  assert.match(findSubcategory('inundacion').notice, /911/);
  assert.equal(findSubcategory('semaforo').notice, null);
});