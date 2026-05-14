# Plan de Pruebas — Tienda Virtual DSS

**Proyecto:** tienda-virtual-dss  
**Versión:** 1.0  
**Fecha:** 2026-05-14  
**Autor:** SantiagoValenciaM  
**Herramienta principal:** Node Test Runner + Supertest

---

## 1. Alcance

Pruebas automáticas sobre el **backend Express** de la tienda virtual universitaria, orientadas a verificar:

- Mecanismos de seguridad HTTP (cabeceras, validación de entrada, manejo de errores)
- Funcionalidad de todos los endpoints REST

El frontend React y las pruebas E2E con Cypress están fuera del alcance de este documento (ver `/frontend/cypress/`).

---

## 2. Objetivos

| # | Objetivo |
|---|----------|
| 1 | Verificar que Helmet configura correctamente los encabezados de seguridad HTTP |
| 2 | Verificar que la validación de entrada en `POST /api/compra` rechaza datos inválidos |
| 3 | Verificar que el servidor no expone información interna ante errores o rutas inexistentes |
| 4 | Verificar que todos los endpoints funcionales responden con datos correctos y códigos de estado esperados |
| 5 | Verificar el cálculo del total en órdenes de compra |

---

## 3. Ambiente de Prueba

| Elemento | Valor |
|----------|-------|
| Runtime | Node.js 22 (ES Modules) |
| Framework | Express 4.19.2 |
| Librería de pruebas | Node Test Runner (`node --test`) |
| Cliente HTTP para pruebas | Supertest 7.0.0 |
| Directorio de pruebas | `backend/test/` |
| Comando de ejecución | `npm test` (dentro de `backend/`) |

---

## 4. Casos de Prueba

### 4.1 Pruebas de Seguridad (`backend/test/seguridad.test.js`)

| ID | Caso de Prueba | Endpoint | Entrada | Resultado Esperado | Mecanismo verificado |
|----|----------------|----------|---------|-------------------|----------------------|
| SEC-01 | Encabezado `X-Content-Type-Options` | GET /api/salud | — | Header `nosniff` presente | Helmet |
| SEC-02 | Ausencia de `X-Powered-By` | GET /api/salud | — | Header `X-Powered-By` ausente | Helmet |
| SEC-03 | Encabezado `X-Frame-Options` | GET /api/salud | — | Header presente | Helmet |
| SEC-04 | Encabezado `X-DNS-Prefetch-Control` | GET /api/salud | — | Header presente | Helmet |
| SEC-05 | `customerName` faltante | POST /api/compra | `{ items: [...] }` | HTTP 400 | Validación entrada |
| SEC-06 | `customerName` vacío | POST /api/compra | `{ customerName: "", items: [...] }` | HTTP 400 | Validación entrada |
| SEC-07 | `items` faltante | POST /api/compra | `{ customerName: "Ana" }` | HTTP 400 | Validación entrada |
| SEC-08 | `items` array vacío | POST /api/compra | `{ customerName: "Ana", items: [] }` | HTTP 400 | Validación entrada |
| SEC-09 | `items` no es array | POST /api/compra | `{ customerName: "Ana", items: "x" }` | HTTP 400 | Validación entrada |
| SEC-10 | Payload con intento XSS | POST /api/compra | `customerName: "<script>alert(1)</script>"` | HTTP 201 (no crash) + nombre retornado como texto | Resistencia a crash |
| SEC-11 | Payload con nombre muy largo | POST /api/compra | `customerName: "A".repeat(10000)` | HTTP 201, 400 o 413 (sin crash) | Manejo robusto |
| SEC-12 | Ruta inexistente | GET /api/ruta-falsa | — | No HTTP 500 con stack trace | Manejo de errores |
| SEC-13 | ID no numérico | GET /api/arts/abc | — | HTTP 404, sin info interna | Coerción de tipos |
| SEC-14 | Content-Type JSON en respuestas | GET /api/arts | — | `application/json` en header | Tipo de contenido |

### 4.2 Pruebas Funcionales (`backend/test/funcional.test.js`)

| ID | Caso de Prueba | Endpoint | Entrada | Resultado Esperado |
|----|----------------|----------|---------|-------------------|
| FUNC-01 | Health check principal | GET /api/salud | — | HTTP 200, `{ status: "ok", service: "virtual-store-backend" }` |
| FUNC-02 | Health check alias | GET /api/health | — | HTTP 200 |
| FUNC-03 | Listar productos | GET /api/arts | — | HTTP 200, array no vacío |
| FUNC-04 | Catálogo completo | GET /api/arts | — | Exactamente 4 productos |
| FUNC-05 | Estructura de producto | GET /api/arts | — | Cada producto tiene `id`, `name`, `price`, `stock` |
| FUNC-06 | Precios positivos | GET /api/arts | — | `price > 0` en todos los productos |
| FUNC-07 | Producto por ID válido | GET /api/arts/1 | — | HTTP 200, `id === 1` |
| FUNC-08 | Producto ID inexistente | GET /api/arts/9999 | — | HTTP 404, campo `message` |
| FUNC-09 | Crear compra válida | POST /api/compra | `{ customerName, items: [{productId:1, quantity:1}] }` | HTTP 201, `id` UUID, `status: "created"` |
| FUNC-10 | Cálculo de total | POST /api/compra | `{ customerName, items: [{productId:1, quantity:2}] }` | `total === precio_producto * 2` |
| FUNC-11 | Compra alias route | POST /api/orders | cuerpo válido | HTTP 201 |
| FUNC-12 | Endpoint de seguridad | GET /api/seg | — | HTTP 200, `{ simulated, status, finding, severity, recommendation }` |
| FUNC-13 | Productos alias route | GET /api/products | — | HTTP 200, mismo resultado que /api/arts |
| FUNC-14 | Estado de orden creada | POST /api/compra | cuerpo válido | `status === "created"` |

---

## 5. Criterios de Aceptación

- **Seguridad:** Todas las pruebas SEC deben pasar (PASS). Un fallo en SEC-01 a SEC-04 indica configuración incorrecta de Helmet; un fallo en SEC-05 a SEC-09 indica ausencia de validación de entrada.
- **Funcionalidad:** Todas las pruebas FUNC deben pasar (PASS).
- **Cobertura mínima:** 100% de endpoints documentados cubiertos por al menos un caso de prueba.

---

## 6. Hallazgos Esperados / Gaps de Seguridad Conocidos

Los siguientes puntos son **gaps intencionados** para propósitos educativos y no se cubren con pruebas automáticas en este plan:

| Gap | Descripción |
|-----|-------------|
| Sin autenticación | No existen endpoints protegidos por JWT ni sesiones |
| Sin rate limiting | La API no limita la cantidad de solicitudes por IP |
| Sin CSRF protection | No hay tokens anti-CSRF en mutaciones |
| CORS permisivo por defecto | `CORS_ORIGIN` por defecto es `*` |
| Sin sanitización de salida | El nombre del cliente se devuelve tal cual (XSS mitigado solo por el cliente React) |

Estos gaps están documentados en el endpoint `/api/seg` como parte del entrenamiento de seguridad de la aplicación.
