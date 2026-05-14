import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

// ── FUNC-01 ───────────────────────────────────────────────────────────────────
test('FUNC-01: GET /api/salud devuelve 200 con status ok', async () => {
  const res = await request(app).get('/api/salud');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.service, 'virtual-store-backend');
});

// ── FUNC-02 ───────────────────────────────────────────────────────────────────
test('FUNC-02: GET /api/health (alias) devuelve 200', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

// ── FUNC-03 ───────────────────────────────────────────────────────────────────
test('FUNC-03: GET /api/arts devuelve array no vacío', async () => {
  const res = await request(app).get('/api/arts');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body), 'La respuesta debe ser un array');
  assert.ok(res.body.length > 0, 'El catálogo no debe estar vacío');
});

// ── FUNC-04 ───────────────────────────────────────────────────────────────────
test('FUNC-04: GET /api/arts devuelve exactamente 4 productos', async () => {
  const res = await request(app).get('/api/arts');
  assert.equal(res.body.length, 4, `Se esperaban 4 productos, se encontraron ${res.body.length}`);
});

// ── FUNC-05 ───────────────────────────────────────────────────────────────────
test('FUNC-05: Cada producto tiene id, name, price y stock', async () => {
  const res = await request(app).get('/api/arts');
  for (const product of res.body) {
    assert.ok(product.id !== undefined, `Producto sin id: ${JSON.stringify(product)}`);
    assert.ok(product.name, `Producto sin name: ${JSON.stringify(product)}`);
    assert.ok(product.price !== undefined, `Producto sin price: ${JSON.stringify(product)}`);
    assert.ok(product.stock !== undefined, `Producto sin stock: ${JSON.stringify(product)}`);
  }
});

// ── FUNC-06 ───────────────────────────────────────────────────────────────────
test('FUNC-06: Todos los precios son positivos', async () => {
  const res = await request(app).get('/api/arts');
  for (const product of res.body) {
    assert.ok(product.price > 0, `Precio no positivo en producto id=${product.id}: ${product.price}`);
  }
});

// ── FUNC-07 ───────────────────────────────────────────────────────────────────
test('FUNC-07: GET /api/arts/1 devuelve el producto con id 1', async () => {
  const res = await request(app).get('/api/arts/1');
  assert.equal(res.status, 200);
  assert.equal(res.body.id, 1);
  assert.equal(res.body.name, 'Sudadera institucional');
  assert.equal(res.body.price, 649);
});

// ── FUNC-08 ───────────────────────────────────────────────────────────────────
test('FUNC-08: GET /api/arts/9999 devuelve 404 con mensaje', async () => {
  const res = await request(app).get('/api/arts/9999');
  assert.equal(res.status, 404);
  assert.ok(res.body.message, 'Debe incluir un campo message en el error');
});

// ── FUNC-09 ───────────────────────────────────────────────────────────────────
test('FUNC-09: POST /api/compra válida devuelve 201 con UUID y status created', async () => {
  const res = await request(app)
    .post('/api/compra')
    .send({ customerName: 'Juan López', items: [{ productId: 1, quantity: 1 }] });

  assert.equal(res.status, 201);
  assert.ok(res.body.id, 'Debe incluir un id UUID');
  // UUID v4 pattern
  assert.match(
    res.body.id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'El id debe ser un UUID válido'
  );
  assert.equal(res.body.status, 'created');
  assert.equal(res.body.customerName, 'Juan López');
});

// ── FUNC-10 ───────────────────────────────────────────────────────────────────
test('FUNC-10: POST /api/compra calcula el total correctamente', async () => {
  // Sudadera institucional: precio $649, pedimos 2 → total esperado $1298
  const res = await request(app)
    .post('/api/compra')
    .send({ customerName: 'María García', items: [{ productId: 1, quantity: 2 }] });

  assert.equal(res.status, 201);
  assert.equal(res.body.total, 1298, `Total esperado 1298, obtenido ${res.body.total}`);
});

// ── FUNC-11 ───────────────────────────────────────────────────────────────────
test('FUNC-11: POST /api/orders (alias) devuelve 201', async () => {
  const res = await request(app)
    .post('/api/orders')
    .send({ customerName: 'Test Alias', items: [{ productId: 2, quantity: 1 }] });

  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'created');
});

// ── FUNC-12 ───────────────────────────────────────────────────────────────────
test('FUNC-12: GET /api/seg devuelve estructura completa', async () => {
  const res = await request(app).get('/api/seg');
  assert.equal(res.status, 200);
  assert.equal(res.body.simulated, true);
  assert.equal(res.body.status, 'warning');
  assert.ok(res.body.finding, 'Falta campo finding');
  assert.equal(res.body.severity, 'medium');
  assert.ok(res.body.recommendation, 'Falta campo recommendation');
});

// ── FUNC-13 ───────────────────────────────────────────────────────────────────
test('FUNC-13: GET /api/products (alias) devuelve los mismos datos que /api/arts', async () => {
  const [resArts, resProducts] = await Promise.all([
    request(app).get('/api/arts'),
    request(app).get('/api/products'),
  ]);
  assert.equal(resProducts.status, 200);
  assert.deepEqual(
    resProducts.body,
    resArts.body,
    '/api/products debe devolver los mismos datos que /api/arts'
  );
});

// ── FUNC-14 ───────────────────────────────────────────────────────────────────
test('FUNC-14: El campo status de la orden creada es "created"', async () => {
  const res = await request(app)
    .post('/api/compra')
    .send({ customerName: 'Carlos Ruiz', items: [{ productId: 3, quantity: 1 }, { productId: 4, quantity: 1 }] });

  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'created');
  // Total: Taza(149) + Mochila(799) = 948
  assert.equal(res.body.total, 948, `Total multi-producto esperado 948, obtenido ${res.body.total}`);
});
