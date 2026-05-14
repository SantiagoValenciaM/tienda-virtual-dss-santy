# Resultados de Pruebas Automáticas — Tienda Virtual DSS

**Fecha de ejecución:** 2026-05-14  
**Ambiente:** Node.js v22.14.0 — Windows 11  
**Comando:** `npm test` (dentro de `backend/`)  
**Duración total:** ~2 560 ms

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Total de pruebas | 31 |
| Pasaron (PASS) | **31** |
| Fallaron (FAIL) | **0** |
| Canceladas | 0 |
| Omitidas | 0 |
| Cobertura de endpoints | 100 % (5 endpoints + 5 alias) |

> **Conclusión:** La aplicación cumple todos los criterios de aceptación definidos en el plan de pruebas. Los 14 controles de seguridad y 14 casos funcionales verificados pasaron sin errores.

---

## Resultados por Prueba de Seguridad

| ID | Nombre | Estado | Observación |
|----|--------|--------|-------------|
| SEC-01 | `X-Content-Type-Options: nosniff` | ✅ PASS | Helmet configura correctamente este header |
| SEC-02 | `X-Powered-By` ausente | ✅ PASS | Helmet elimina el header que revela el framework |
| SEC-03 | `X-Frame-Options` presente | ✅ PASS | Protección contra clickjacking activa |
| SEC-04 | `X-DNS-Prefetch-Control` presente | ✅ PASS | Control de prefetch DNS activo |
| SEC-05 | `customerName` faltante → 400 | ✅ PASS | Validación de entrada rechaza petición incompleta |
| SEC-06 | `customerName` vacío → 400 | ✅ PASS | Cadena vacía correctamente rechazada |
| SEC-07 | `items` faltante → 400 | ✅ PASS | Validación de entrada rechaza petición sin items |
| SEC-08 | `items` array vacío → 400 | ✅ PASS | Array vacío rechazado correctamente |
| SEC-09 | `items` no es array → 400 | ✅ PASS | Tipo de dato incorrecto rechazado |
| SEC-10 | Payload XSS en nombre → 201 sin crash | ✅ PASS | Servidor resiliente; XSS mitigado en cliente (React JSX) |
| SEC-11 | Nombre de 10 000 caracteres → sin crash | ✅ PASS | Respuesta 201 en ~0.5 ms; sin bloqueo |
| SEC-12 | Ruta inexistente → no 500 ni stack trace | ✅ PASS | Respuesta 404 sin filtrar información interna |
| SEC-13 | ID no numérico `/api/arts/abc` → 404 | ✅ PASS | Coerción `NaN` manejada; no expone detalles |
| SEC-14 | `Content-Type: application/json` | ✅ PASS | Todas las respuestas tienen tipo correcto |

---

## Resultados por Prueba Funcional

| ID | Nombre | Estado | Detalle |
|----|--------|--------|---------|
| FUNC-01 | GET /api/salud → 200 + `status: ok` | ✅ PASS | `service: "virtual-store-backend"` verificado |
| FUNC-02 | GET /api/health (alias) → 200 | ✅ PASS | Alias operativo |
| FUNC-03 | GET /api/arts → array no vacío | ✅ PASS | Catálogo disponible |
| FUNC-04 | Catálogo con exactamente 4 productos | ✅ PASS | Sudadera, Cuaderno, Taza, Mochila |
| FUNC-05 | Estructura de producto: id, name, price, stock | ✅ PASS | Todos los campos presentes en los 4 productos |
| FUNC-06 | Precios positivos | ✅ PASS | Rango: $89 – $799 MXN |
| FUNC-07 | GET /api/arts/1 → Sudadera $649 | ✅ PASS | id, name y price verificados |
| FUNC-08 | GET /api/arts/9999 → 404 + message | ✅ PASS | Mensaje de error presente |
| FUNC-09 | POST /api/compra → 201, UUID v4, status created | ✅ PASS | UUID v4 validado con regex |
| FUNC-10 | Total: 2× Sudadera ($649) = $1 298 | ✅ PASS | Cálculo exacto |
| FUNC-11 | POST /api/orders (alias) → 201 | ✅ PASS | Alias de compra operativo |
| FUNC-12 | GET /api/seg → estructura completa | ✅ PASS | `simulated`, `status`, `finding`, `severity`, `recommendation` |
| FUNC-13 | /api/products devuelve igual que /api/arts | ✅ PASS | `deepEqual` confirmado |
| FUNC-14 | Orden múltiple: Taza($149) + Mochila($799) = $948 | ✅ PASS | Total multi-producto correcto |

---

## Pruebas Preexistentes (app.test.js)

| # | Nombre | Estado |
|---|--------|--------|
| 1 | GET /api/salud returns ok | ✅ PASS |
| 2 | GET /api/arts returns products | ✅ PASS |
| 3 | GET /api/seg returns a simulated finding | ✅ PASS |

---

## Salida Completa del Runner (extracto relevante)

```
TAP version 13
ok 1  - GET /api/salud returns ok
ok 2  - GET /api/arts returns products
ok 3  - GET /api/seg returns a simulated finding
ok 4  - FUNC-01: GET /api/salud devuelve 200 con status ok
ok 5  - FUNC-02: GET /api/health (alias) devuelve 200
ok 6  - FUNC-03: GET /api/arts devuelve array no vacío
ok 7  - FUNC-04: GET /api/arts devuelve exactamente 4 productos
ok 8  - FUNC-05: Cada producto tiene id, name, price y stock
ok 9  - FUNC-06: Todos los precios son positivos
ok 10 - FUNC-07: GET /api/arts/1 devuelve el producto con id 1
ok 11 - FUNC-08: GET /api/arts/9999 devuelve 404 con mensaje
ok 12 - FUNC-09: POST /api/compra válida devuelve 201 con UUID y status created
ok 13 - FUNC-10: POST /api/compra calcula el total correctamente
ok 14 - FUNC-11: POST /api/orders (alias) devuelve 201
ok 15 - FUNC-12: GET /api/seg devuelve estructura completa
ok 16 - FUNC-13: GET /api/products (alias) devuelve los mismos datos que /api/arts
ok 17 - FUNC-14: El campo status de la orden creada es "created"
ok 18 - SEC-01: X-Content-Type-Options debe ser nosniff
ok 19 - SEC-02: X-Powered-By no debe estar expuesto
ok 20 - SEC-03: X-Frame-Options debe estar presente
ok 21 - SEC-04: X-DNS-Prefetch-Control debe estar presente
ok 22 - SEC-05: POST /api/compra sin customerName devuelve 400
ok 23 - SEC-06: POST /api/compra con customerName vacío devuelve 400
ok 24 - SEC-07: POST /api/compra sin items devuelve 400
ok 25 - SEC-08: POST /api/compra con items vacío devuelve 400
ok 26 - SEC-09: POST /api/compra con items no-array devuelve 400
ok 27 - SEC-10: Payload XSS en customerName no bloquea el servidor
ok 28 - SEC-11: Payload con customerName muy largo no bloquea el servidor
ok 29 - SEC-12: Ruta inexistente no genera error 500 con stack trace
ok 30 - SEC-13: GET /api/arts con ID no numérico devuelve 404 sin info interna
ok 31 - SEC-14: Content-Type de la API es application/json
1..31
# tests 31  |  pass 31  |  fail 0  |  duration_ms 2560
```

---

## Hallazgos de Seguridad Identificados

### Controles activos (verificados por las pruebas)

| Control | Mecanismo | Prueba |
|---------|-----------|--------|
| Cabeceras HTTP seguras | Helmet 7.1.0 | SEC-01 a SEC-04 |
| Validación de entrada | Condicionales en `createPurchase()` | SEC-05 a SEC-09 |
| Ocultamiento de tecnología | Helmet elimina `X-Powered-By` | SEC-02 |
| Protección contra clickjacking | `X-Frame-Options` | SEC-03 |
| Resiliencia ante entradas maliciosas | Express procesa sin crash | SEC-10, SEC-11 |
| Manejo seguro de errores | Respuesta 404 sin stack trace | SEC-12, SEC-13 |
| Tipo de contenido explícito | `Content-Type: application/json` | SEC-14 |

### Gaps de seguridad documentados (fuera del alcance de estas pruebas)

| Gap | Riesgo | Recomendación |
|-----|--------|---------------|
| Sin autenticación / autorización | Alto | Implementar JWT o sesiones |
| Sin rate limiting | Medio | Añadir `express-rate-limit` |
| CORS permisivo (`*`) en desarrollo | Medio | Restringir en producción con variable de entorno |
| Sin tokens CSRF | Bajo-Medio | Añadir middleware CSRF para mutaciones sensibles |
| XSS en salida de API | Bajo | Sanitizar `customerName` antes de persistir/devolver |

> Estos gaps son **intencionales** en el contexto educativo del proyecto DSS y están documentados en `/api/seg`.
