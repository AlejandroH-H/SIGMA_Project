# Workflow — Verificación de Feature (SIGMA)

Ejecutar al cerrar cada feature/fase. Cada paso debe pasar antes de marcar la fase como
completada. Si un paso falla, se corrige la causa raíz; no se omite.

## 1. Infraestructura
- [ ] `docker compose up -d` levanta el contenedor `postgres:16`.
- [ ] `docker compose ps` muestra el servicio `db` en estado `healthy` (healthcheck `pg_isready`).

## 2. Base de datos
- [ ] Las 9 tablas existen: `docker compose exec db psql -U sigma -d sigma_db -c "\dt"`.
- [ ] Conteos semilla: `roles = 3`, `usuarios >= 1`, `cohortes = 3`.
- [ ] Índices sobre FKs creados: `\di` lista `idx_*_id` para `usuarios`, `estudiantes`,
      `secciones`, `demanda_matricula`, `rendimiento_academico`, `bitacora_acciones`.
- [ ] Las restricciones `CHECK` rechazan valores inválidos (p. ej. `genero='X'`, calificación `> 100`).

## 3. Compilación y estilos
- [ ] `npm run build` compila sin errores (TypeScript `strict: true`).
- [ ] `npm run css:build` genera `public/css/output.css` con los tokens SIGMA.

## 4. Runtime
- [ ] `npm run dev` arranca el servidor en el puerto configurado.
- [ ] `GET /health` con `Accept: application/json` → `{ "status": "ok", "db": "ok", ... }` (HTTP 200).
- [ ] `GET /health` en navegador → vista con indicador verde (`sigma-accent`).

## 5. Prueba negativa (resiliencia)
- [ ] Con Postgres detenido (`docker compose stop db`), `GET /health` responde HTTP 503 con
      `db: "error"` y la vista muestra indicador rojo, **sin** tumbar el proceso Node.
- [ ] Reiniciar Postgres (`docker compose start db`) restablece el estado verde.

## 6. Reglas de ingeniería (auditoría manual del diff)
- [ ] Ninguna consulta SQL concatena strings; todas usan parámetros `$1, $2, ...`.
- [ ] Los controladores no contienen lógica analítica (vive en `src/services/`).
- [ ] No se ejecuta `DELETE` sobre `usuarios` (soft-delete vía `activo`).
