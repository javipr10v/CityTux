import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryReportRepository } from '../js/data/reportRepository.js';
import { SEED_REPORTS, SEED_MINE_IDS } from '../js/data/seedReports.js';

const nuevoRepo = () => createMemoryReportRepository({ reports: SEED_REPORTS, mineIds: SEED_MINE_IDS });

test('datos de ejemplo: 6 reportes y 3 son del usuario', async () => {
  const repo = nuevoRepo();
  assert.equal((await repo.list()).length, 6);
  assert.deepEqual(await repo.mineIds(), [2, 3, 4]);
  assert.deepEqual(await repo.joinedIds(), []);
});

test('list devuelve copias: modificarlas no altera el repositorio', async () => {
  const repo = nuevoRepo();
  const [primero] = await repo.list();
  primero.neighbors = 9999;
  assert.equal((await repo.list())[0].neighbors, 34);
});

test('add asigna el siguiente id, lo pone primero y lo marca como del usuario', async () => {
  const repo = nuevoRepo();
  const guardado = await repo.add({ cat: 'bache', urg: 'baja', status: 'pendiente', neighbors: 1 });
  assert.equal(guardado.id, 7);
  assert.equal((await repo.list())[0].id, 7);
  assert.ok((await repo.mineIds()).includes(7));
  assert.equal((await repo.add({ cat: 'fuga' })).id, 8);
});

test('join y leave ajustan los vecinos y no se duplican', async () => {
  const repo = nuevoRepo();
  const vecinos = async id => (await repo.list()).find(r => r.id === id).neighbors;
  await repo.join(1);
  await repo.join(1);
  assert.equal(await vecinos(1), 35);
  assert.deepEqual(await repo.joinedIds(), [1]);
  await repo.leave(1);
  await repo.leave(1);
  assert.equal(await vecinos(1), 34);
  assert.deepEqual(await repo.joinedIds(), []);
});