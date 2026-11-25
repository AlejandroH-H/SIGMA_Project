-- ============================================================================
-- SIGMA — Datos semilla
-- NOTA: Los tokens __HASH_ADMIN__ / __HASH_GERENTE__ / __HASH_ANALISTA__ son
--       reemplazados por `npm run db:prepare` (db/generate-seed-hashes.ts) con
--       hashes bcrypt reales antes de montar el script. No editar a mano.
-- ============================================================================

-- Roles ---------------------------------------------------------------------
INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador',     'Acceso total: usuarios, auditoría y configuración.'),
  ('Gerente Académico', 'Gestión académica y lectura de todos los dashboards.'),
  ('Analista',          'Análisis de indicadores y proyecciones (solo lectura).');

-- Usuarios precargados (un actor por rol) -----------------------------------
INSERT INTO usuarios (rol_id, nombre, email, password_hash, activo) VALUES
  ((SELECT id FROM roles WHERE nombre = 'Administrador'),
   'Administrador SIGMA', 'admin@sigma.local',    '__HASH_ADMIN__',    TRUE),
  ((SELECT id FROM roles WHERE nombre = 'Gerente Académico'),
   'Gerente Académico',   'gerente@sigma.local',  '__HASH_GERENTE__',  TRUE),
  ((SELECT id FROM roles WHERE nombre = 'Analista'),
   'Analista de Datos',   'analista@sigma.local', '__HASH_ANALISTA__', TRUE);

-- Cohortes históricas -------------------------------------------------------
INSERT INTO cohortes (periodo, fecha_inicio, fecha_fin) VALUES
  ('2023-1', '2023-01-16', '2023-05-19'),
  ('2023-2', '2023-09-04', '2023-12-15'),
  ('2024-1', '2024-01-15', '2024-05-17');

-- Materias ------------------------------------------------------------------
INSERT INTO materias (codigo, nombre, unidades_credito) VALUES
  ('MAT-101', 'Matemática I',       4),
  ('PRG-101', 'Programación I',     5),
  ('ALG-201', 'Álgebra Lineal',     3);

-- Secciones (materia x cohorte) ---------------------------------------------
INSERT INTO secciones (materia_id, cohorte_id, codigo_seccion, cupos_maximos) VALUES
  ((SELECT id FROM materias WHERE codigo = 'MAT-101'),
   (SELECT id FROM cohortes WHERE periodo = '2024-1'), 'A', 30),
  ((SELECT id FROM materias WHERE codigo = 'PRG-101'),
   (SELECT id FROM cohortes WHERE periodo = '2024-1'), 'A', 25);

-- Estudiantes (10 de ejemplo, cohorte de ingreso 2024-1) --------------------
INSERT INTO estudiantes (cedula, nombre, apellido, genero, cohorte_ingreso_id) VALUES
  ('V-30111001', 'Ana',     'García',    'F', (SELECT id FROM cohortes WHERE periodo = '2024-1')),
  ('V-30111002', 'Luis',    'Pérez',     'M', (SELECT id FROM cohortes WHERE periodo = '2024-1')),
  ('V-30111003', 'María',   'Rodríguez', 'F', (SELECT id FROM cohortes WHERE periodo = '2024-1')),
  ('V-30111004', 'Carlos',  'López',     'M', (SELECT id FROM cohortes WHERE periodo = '2024-1')),
  ('V-30111005', 'Sofía',   'Martínez',  'F', (SELECT id FROM cohortes WHERE periodo = '2024-1')),
  ('V-30111006', 'Diego',   'Hernández', 'M', (SELECT id FROM cohortes WHERE periodo = '2024-1')),
  ('V-30111007', 'Valentina','Díaz',     'F', (SELECT id FROM cohortes WHERE periodo = '2024-1')),
  ('V-30111008', 'Javier',  'Torres',    'M', (SELECT id FROM cohortes WHERE periodo = '2024-1')),
  ('V-30111009', 'Camila',  'Flores',    'F', (SELECT id FROM cohortes WHERE periodo = '2024-1')),
  ('V-30111010', 'Andrés',  'Rojas',     'M', (SELECT id FROM cohortes WHERE periodo = '2024-1'));

-- Demanda de matrícula (cohorte 2024-1) -------------------------------------
INSERT INTO demanda_matricula (estudiante_id, cohorte_id, estado)
SELECT e.id,
       (SELECT id FROM cohortes WHERE periodo = '2024-1'),
       CASE
         WHEN e.cedula IN ('V-30111009','V-30111010') THEN 'Solicitada'
         WHEN e.cedula = 'V-30111008'                 THEN 'Retirada'
         ELSE 'Inscrita'
       END
FROM estudiantes e;

-- Rendimiento académico (sección MAT-101 'A', cohorte 2024-1) ---------------
INSERT INTO rendimiento_academico (estudiante_id, seccion_id, calificacion, estado)
SELECT e.id,
       (SELECT s.id FROM secciones s
          JOIN materias m ON m.id = s.materia_id
          JOIN cohortes c ON c.id = s.cohorte_id
         WHERE m.codigo = 'MAT-101' AND c.periodo = '2024-1' AND s.codigo_seccion = 'A'),
       cal.nota,
       CASE WHEN cal.nota >= 60 THEN 'Aprobado' ELSE 'Reprobado' END
FROM estudiantes e
JOIN (VALUES
  ('V-30111001', 85.00),
  ('V-30111002', 72.50),
  ('V-30111003', 90.00),
  ('V-30111004', 55.00),
  ('V-30111005', 68.00),
  ('V-30111006', 48.50),
  ('V-30111007', 78.00),
  ('V-30111008', 61.00)
) AS cal(cedula, nota) ON cal.cedula = e.cedula;
