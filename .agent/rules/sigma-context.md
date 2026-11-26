# Contexto y Reglas del Proyecto — SIGMA (MVP)

## 1. Propósito
Sistema de Información Gerencial Matricular y Académico (SIGMA) para analizar indicadores de rendimiento estudiantil, segmentación demográfica, ocupación por sección y proyección de matrícula futura.

## 2. Stack Tecnológico Obligatorio (NO alterar)
- **Arquitectura:** Monolito Modular SSR (Server-Side Rendering).
- **Backend:** Node.js (v20+), Express, TypeScript (modo estricto).
- **Frontend:** Plantillas EJS (`express-ejs-layouts`) + Tailwind CSS v4 + Chart.js (vía `public/js/` consumiendo endpoints JSON `/api/metricas/*`).
- **Base de Datos:** PostgreSQL 16 (Docker Compose) usando librería `pg` con consultas parametrizadas (`$1, $2...`). Prohibido concatenar strings en SQL.
- **Seguridad:** JWT almacenado en cookies `HttpOnly` + `SameSite=Lax`, hashing con `bcrypt`, cabeceras con `helmet`.
- **Ingesta y Exportación:** `multer`, `csv-parser`, `xlsx`, `pdfkit`.

## 3. Sistema de Diseño (Manual de Identidad SIGMA)
- **Colores (tokens Tailwind):**
  - Principal (Verde Oscuro): `#003D2E` (`sigma-dark`)
  - Acento (Verde Claro): `#69B578` (`sigma-accent`)
  - Fondo/Soporte (Blanco Crema): `#F8F2F4` (`sigma-cream`) — usar en lugar de blanco puro en fondos principales.
- **Tipografías:**
  - Titulares e institucional: `"Californian FB", Georgia, serif`
  - UI, cuerpo de texto y tablas numéricas: `"Inter", system-ui, sans-serif`
- **Logos:** Usar el imagotipo horizontal como disposición principal en la barra superior/sidebar; aplicar versión negativa sobre fondos `#003D2E` y positiva sobre `#F8F2F4`.

## 4. Esquema Relacional (9 Tablas)
1. `roles` (id, nombre, descripcion) — Valores semilla: `Administrador`, `Gerente Académico`, `Analista`.
2. `usuarios` (id, rol_id, nombre, email, password_hash, activo, fecha_creacion).
3. `bitacora_acciones` (id, usuario_id, accion, modulo, detalles, fecha_hora).
4. `cohortes` (id, periodo, fecha_inicio, fecha_fin).
5. `materias` (id, codigo, nombre, unidades_credito).
6. `estudiantes` (id, cedula, nombre, apellido, genero, cohorte_ingreso_id).
7. `secciones` (id, materia_id, cohorte_id, codigo_seccion, cupos_maximos).
8. `demanda_matricula` (id, estudiante_id, cohorte_id, estado, fecha_registro).
9. `rendimiento_academico` (id, estudiante_id, seccion_id, calificacion, estado).

## 5. Reglas Inquebrantables de Ingeniería
- **Soft Delete:** Jamás ejecutar `DELETE` sobre `usuarios`; actualizar `activo = false` para preservar integridad referencial en `bitacora_acciones`.
- **Auditoría Automática:** Toda operación crítica (`LOGIN`, `CREAR_USUARIO`, `DESACTIVAR_USUARIO`, `CARGA_MASIVA`, `APERTURA_SECCION`, `EJECUTAR_PROYECCION`, `EXPORTAR_PDF`) debe insertar un registro en `bitacora_acciones`.
- **Aislamiento de Lógica:** Los controladores solo validan entrada y renderizan EJS o responden JSON. Toda consulta SQL analítica y cálculo matemático (regresión lineal) vive exclusivamente en `src/services/`.
- **Desempeño:** Las consultas de dashboard deben apoyarse en índices sobre llaves foráneas (`cohorte_id`, `seccion_id`, `estudiante_id`) y responder en `< 2.5s`.

## 6. Convenciones de Esquema (decisiones Fase 0)
- PK `SERIAL` (o `BIGSERIAL` en `bitacora_acciones`). FKs con `ON DELETE RESTRICT`.
- Timestamps `TIMESTAMPTZ DEFAULT now()`.
- `genero IN ('M','F','O')`.
- `demanda_matricula.estado IN ('Solicitada','Inscrita','Retirada')`.
- `rendimiento_academico.estado IN ('Aprobado','Reprobado','Retirado')`; `calificacion` escala `0–100`.
