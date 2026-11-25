# PLAN — SIGMA (MVP)

Checklist vivo del proyecto. Marcar cada ítem al completarlo y validar con
`.agent/workflows/verify-feature.md`.

## Fase 0: Fundación
- [x] Inicializar `package.json`, `tsconfig.json` (strict: true) y `.gitignore`.
- [x] Crear `docker-compose.yml` con volumen persistente y montaje automático de `./db/init.sql`.
- [x] Escribir `db/init.sql` con las 9 tablas, restricciones `UNIQUE`, `CHECK` en estados/género e índices en FKs.
- [x] Escribir `db/seed.sql` con los 3 roles, 1 usuario administrador inicial (contraseña hasheada con bcrypt) y 3 cohortes históricas de ejemplo.
- [x] Configurar `src/styles/input.css` con tokens de SIGMA y script `npm run dev` con `concurrently`.
- [x] Crear `src/views/layouts/main.ejs` (sidebar adaptable según rol) y vista de salud `/health` que verifique conexión a PostgreSQL.

> Estado Fase 0: **implementada y validada** con `.agent/workflows/verify-feature.md`
> (9 tablas + índices + CHECK verificados en Postgres; `/health` JSON 200/503 y SSR OK;
> redirect y 404 OK; tokens SIGMA compilados en `output.css`).

## Notas de entorno (IMPORTANTE)
- **Controlled Folder Access (Windows Defender) está ACTIVO** y protege `Documents`.
  Bloquea a los compiladores basados en Node (`tsc`, `tailwindcss`, `esbuild`/`tsx`,
  `node-pre-gyp`) escribir archivos *generados* dentro de `Documents\SIGMA_Project`
  (leer y las escrituras de PowerShell/npm sí pasan). Síntoma: `error TS5033 ENOENT`
  al emitir a `dist/`, y `ENOENT` de Tailwind al escribir `output.css`.
  - **`npm run build`, `npm run css:build` y `npm run dev` fallan en esta ubicación.**
  - **Solución recomendada:** mover el proyecto fuera de carpetas protegidas
    (p. ej. `C:\dev\SIGMA_Project`) — no requiere admin. Alternativa: permitir
    `node.exe` en *Controlled Folder Access* (requiere admin).
  - *Workaround usado en Fase 0 para validar:* compilar a `%TEMP%` y copiar artefactos
    con PowerShell. No es un flujo de desarrollo sostenible.
- **`bcryptjs` en lugar de `bcrypt` (nativo):** `bcrypt@5` no compila en Node 24/Windows
  aquí (sin prebuild + sin toolchain). `bcryptjs` es JS puro y genera hashes `$2a$/$2b$`
  **compatibles** con `bcrypt`, por lo que un futuro cambio a bcrypt nativo validaría los
  mismos hashes. La regla de "hashing con bcrypt" se mantiene a nivel de algoritmo.

## Fase 1: Autenticación, RBAC y Bitácora
- [x] Usuarios precargados para los 3 actores (admin/gerente/analista) con hash bcryptjs.
- [x] Login + logout con **JWT en cookie HttpOnly + SameSite=Lax** (`src/lib/jwt.ts`, `auth.controller`).
- [x] Middlewares de seguridad: `requireAuth`, `requireRole(...)` (RBAC) y carga opcional de sesión.
- [x] Panel de Administrador: crear usuarios (`<select>` de rol, persiste en `usuarios`) + listado.
- [x] Visor de bitácora (solo Administrador) y auditoría automática de `LOGIN` y `CREAR_USUARIO`.

> Estado Fase 1: **implementada y validada**. Login inválido→401 sin cookie; admin→302 con
> cookie HttpOnly/SameSite=Lax; `/usuarios` y `/bitacora` 200 admin / 403 analista; creación de
> usuario persiste + audita `CREAR_USUARIO`; duplicado→409; logout borra cookie.
> (`DESACTIVAR_USUARIO` queda para una fase posterior.)

## Próximas fases (pendientes de planificar)
- [ ] Fase 2: Gestión de usuarios ampliada (desactivar/soft-delete, edición, auditoría).
- [ ] Fase 3: Carga masiva (multer + csv-parser/xlsx), estudiantes/demanda.
- [ ] Fase 4: Secciones y rendimiento.
- [ ] Fase 5: Dashboards analíticos (`/api/metricas/*` + Chart.js).
- [ ] Fase 6: Proyección de matrícula (regresión lineal en `src/services/`).
- [ ] Fase 7: Exportación PDF (pdfkit) y cierre.
