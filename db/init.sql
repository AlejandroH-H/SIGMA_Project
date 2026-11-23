-- ============================================================================
-- SIGMA — Esquema relacional (9 tablas)
-- Reglas: PK SERIAL/BIGSERIAL, FKs ON DELETE RESTRICT, TIMESTAMPTZ DEFAULT now(),
--         UNIQUE + CHECK en estados/género, índices sobre llaves foráneas.
-- ============================================================================

-- 1. roles ------------------------------------------------------------------
CREATE TABLE roles (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(60) UNIQUE NOT NULL,
  descripcion TEXT
);

-- 2. usuarios (soft-delete vía activo; jamás DELETE) ------------------------
CREATE TABLE usuarios (
  id             SERIAL PRIMARY KEY,
  rol_id         INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  nombre         VARCHAR(120) NOT NULL,
  email          VARCHAR(160) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  activo         BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_usuarios_rol_id ON usuarios(rol_id);

-- 3. bitacora_acciones (auditoría; FK preservada por soft-delete) -----------
CREATE TABLE bitacora_acciones (
  id         BIGSERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id) ON DELETE RESTRICT,
  accion     VARCHAR(60) NOT NULL,
  modulo     VARCHAR(60),
  detalles   JSONB,
  fecha_hora TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bitacora_usuario_id ON bitacora_acciones(usuario_id);
CREATE INDEX idx_bitacora_fecha_hora ON bitacora_acciones(fecha_hora);

-- 4. cohortes ---------------------------------------------------------------
CREATE TABLE cohortes (
  id           SERIAL PRIMARY KEY,
  periodo      VARCHAR(20) UNIQUE NOT NULL,   -- ej. '2024-1'
  fecha_inicio DATE,
  fecha_fin    DATE,
  CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);

-- 5. materias ---------------------------------------------------------------
CREATE TABLE materias (
  id               SERIAL PRIMARY KEY,
  codigo           VARCHAR(20) UNIQUE NOT NULL,
  nombre           VARCHAR(160) NOT NULL,
  unidades_credito INT NOT NULL CHECK (unidades_credito > 0)
);

-- 6. estudiantes ------------------------------------------------------------
CREATE TABLE estudiantes (
  id                 SERIAL PRIMARY KEY,
  cedula             VARCHAR(20) UNIQUE NOT NULL,
  nombre             VARCHAR(120) NOT NULL,
  apellido           VARCHAR(120) NOT NULL,
  genero             CHAR(1) CHECK (genero IN ('M','F','O')),
  cohorte_ingreso_id INT REFERENCES cohortes(id) ON DELETE RESTRICT
);
CREATE INDEX idx_estudiantes_cohorte_ingreso ON estudiantes(cohorte_ingreso_id);

-- 7. secciones --------------------------------------------------------------
CREATE TABLE secciones (
  id             SERIAL PRIMARY KEY,
  materia_id     INT NOT NULL REFERENCES materias(id) ON DELETE RESTRICT,
  cohorte_id     INT NOT NULL REFERENCES cohortes(id) ON DELETE RESTRICT,
  codigo_seccion VARCHAR(20) NOT NULL,
  cupos_maximos  INT NOT NULL CHECK (cupos_maximos > 0),
  UNIQUE (materia_id, cohorte_id, codigo_seccion)
);
CREATE INDEX idx_secciones_materia_id ON secciones(materia_id);
CREATE INDEX idx_secciones_cohorte_id ON secciones(cohorte_id);

-- 8. demanda_matricula ------------------------------------------------------
CREATE TABLE demanda_matricula (
  id             SERIAL PRIMARY KEY,
  estudiante_id  INT NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
  cohorte_id     INT NOT NULL REFERENCES cohortes(id) ON DELETE RESTRICT,
  estado         VARCHAR(20) NOT NULL
                 CHECK (estado IN ('Solicitada','Inscrita','Retirada')),
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (estudiante_id, cohorte_id)
);
CREATE INDEX idx_demanda_estudiante_id ON demanda_matricula(estudiante_id);
CREATE INDEX idx_demanda_cohorte_id ON demanda_matricula(cohorte_id);

-- 9. rendimiento_academico --------------------------------------------------
CREATE TABLE rendimiento_academico (
  id            SERIAL PRIMARY KEY,
  estudiante_id INT NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
  seccion_id    INT NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
  calificacion  NUMERIC(5,2) CHECK (calificacion BETWEEN 0 AND 100),
  estado        VARCHAR(20) NOT NULL
                CHECK (estado IN ('Aprobado','Reprobado','Retirado')),
  UNIQUE (estudiante_id, seccion_id)
);
CREATE INDEX idx_rendimiento_estudiante_id ON rendimiento_academico(estudiante_id);
CREATE INDEX idx_rendimiento_seccion_id ON rendimiento_academico(seccion_id);
