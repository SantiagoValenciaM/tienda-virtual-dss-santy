import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

// ── SEC-01 ────────────────────────────────────────────────────────────────────
test('SEC-01: X-Content-Type-Options debe ser nosniff', async () => {
  const res = await request(app).get('/api/salud');
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
});

// ── SEC-02 ────────────────────────────────────────────────────────────────────
test('SEC-02: X-Powered-By no debe estar expuesto', async () => {
  const res = await request(app).get('/api/salud');
  assert.equal(res.headers['x-powered-by'], undefined);
});

// ── SEC-03 ────────────────────────────────────────────────────────────────────
test('SEC-03: X-Frame-Options debe estar presente', async () => {
  const res = await request(app).get('/api/salud');
  assert.ok(
    res.headers['x-frame-options'],
    'Falta el encabezado X-Frame-Options'
  );
});

// ── SEC-04 ────────────────────────────────────────────────────────────────────
test('SEC-04: X-DNS-Prefetch-Control debe estar presente', async () => {
  const res = await request(app).get('/api/salud');
  assert.ok(
    res.headers['x-dns-prefetch-control'],
    'Falta el encabezado X-DNS-Prefetch-Control'
  );
});

// ── SEC-05 ────────────────────────────────────────────────────────────────────
test('SEC-05: POST /api/compra sin customerName devuelve 400', async () => {
  const res = await request(app)
    .post('/api/compra')
    .send({ items: [{ productId: 1, quantity: 1 }] });
  assert.equal(res.status, 400);
  assert.ok(res.body.message, 'Falta mensaje de error en la respuesta');
});

// ── SEC-06 ────────────────────────────────────────────────────────────────────
test('SEC-06: POST /api/compra con customerName vacío devuelve 400', async () => {
  const res = await request(app)
    .post('/api/compra')
    .send({ customerName: '', items: [{ productId: 1, quantity: 1 }] });
  assert.equal(res.status, 400);
});

// ── SEC-07 ────────────────────────────────────────────────────────────────────
test('SEC-07: POST /api/compra sin items devuelve 400', async () => {
  const res = await request(app)
    .post('/api/compra')
    .send({ customerName: 'Ana Pérez' });
  assert.equal(res.status, 400);
});

// ── SEC-08 ────────────────────────────────────────────────────────────────────
test('SEC-08: POST /api/compra con items vacío devuelve 400', async () => {
  const res = await request(app)
    .post('/api/compra')
    .send({ customerName: 'Ana Pérez', items: [] });
  assert.equal(res.status, 400);
});

// ── SEC-09 ────────────────────────────────────────────────────────────────────
test('SEC-09: POST /api/compra con items no-array devuelve 400', async () => {
  const res = await request(app)
    .post('/api/compra')
    .send({ customerName: 'Ana Pérez', items: 'no-soy-un-array' });
  assert.equal(res.status, 400);
});

// ── SEC-10 ────────────────────────────────────────────────────────────────────
test('SEC-10: Payload XSS en customerName no bloquea el servidor', async () => {
  const xssPayload = '<script>alert("xss")</script>';
  const res = await request(app)
    .post('/api/compra')
    .send({ customerName: xssPayload, items: [{ productId: 1, quantity: 1 }] });

  // El servidor no debe crashear; debe responder con 201
  assert.equal(res.status, 201, 'El servidor debe aceptar la orden sin crashear');
  // El nombre se devuelve como texto plano (la protección XSS es responsabilidad del cliente)
  assert.ok(
    res.body.customerName.includes('<script>'),
    'El nombre debe retornarse como cadena de texto sin ejecutarse'
  );
});

// ── SEC-11 ────────────────────────────────────────────────────────────────────
test('SEC-11: Payload con customerName muy largo no bloquea el servidor', async () => {
  const res = await request(app)
    .post('/api/compra')
    .send({
      customerName: 'A'.repeat(10_000),
      items: [{ productId: 1, quantity: 1 }],
    });
  // Cualquier código de respuesta válido (sin crash = no 5xx)
  assert.ok(
    [200, 201, 400, 413].includes(res.status),
    `Estado inesperado ${res.status} ante entrada larga`
  );
});

// ── SEC-12 ────────────────────────────────────────────────────────────────────
test('SEC-12: Ruta inexistente no genera error 500 con stack trace', async () => {
  const res = await request(app).get('/api/ruta-que-no-existe-jamas');
  assert.notEqual(res.status, 500, 'Una ruta desconocida no debe provocar un 500');
  // Verificar que no se filtra el stack trace de Node.js en el cuerpo
  const body = JSON.stringify(res.body || '');
  assert.ok(
    !body.includes('    at '),
    'El cuerpo de respuesta no debe contener un stack trace'
  );
});

// ── SEC-13 ────────────────────────────────────────────────────────────────────
test('SEC-13: GET /api/arts con ID no numérico devuelve 404 sin info interna', async () => {
  const res = await request(app).get('/api/arts/abc');
  assert.equal(res.status, 404);
  // No debe exponer detalles del sistema
  const body = JSON.stringify(res.body || '');
  assert.ok(!body.includes('NaN'), 'La respuesta no debe mencionar NaN');
  assert.ok(!body.includes('undefined'), 'La respuesta no debe mencionar undefined');
});

// ── SEC-14 ────────────────────────────────────────────────────────────────────
test('SEC-14: Content-Type de la API es application/json', async () => {
  const res = await request(app).get('/api/arts');
  assert.ok(
    res.headers['content-type'].includes('application/json'),
    `Content-Type inesperado: ${res.headers['content-type']}`
  );
});
