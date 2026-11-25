import path from 'node:path';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import inicioRoutes from './routes/inicio.routes';
import usuarioRoutes from './routes/usuario.routes';
import bitacoraRoutes from './routes/bitacora.routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { cargarUsuarioOpcional } from './middlewares/auth';

// Raíz del proyecto (funciona tanto con tsx [src] como compilado [dist]).
const ROOT = path.resolve(__dirname, '..');

export function crearApp(): express.Express {
  const app = express();

  // Seguridad de cabeceras. CSP permite recursos propios (hoja de estilos local).
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'data:'],
        },
      },
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Motor de vistas EJS + layouts.
  app.set('view engine', 'ejs');
  app.set('views', path.join(ROOT, 'src', 'views'));
  app.use(expressLayouts);
  app.set('layout', 'layouts/main');

  // Estáticos (CSS generado, JS de cliente, imágenes).
  app.use(express.static(path.join(ROOT, 'public')));

  // Carga la sesión en res.locals si existe (no bloquea).
  app.use(cargarUsuarioOpcional);

  // Rutas públicas.
  app.use('/', authRoutes); // /login, /logout
  app.use('/', healthRoutes); // /health (probe público)

  // Rutas protegidas (requireAuth / RBAC dentro de cada router).
  app.use('/usuarios', usuarioRoutes);
  app.use('/bitacora', bitacoraRoutes);
  app.use('/', inicioRoutes); // GET / (landing autenticado) — al final de las rutas

  // Manejo de errores (siempre al final).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
