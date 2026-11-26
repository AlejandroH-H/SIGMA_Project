import path from 'node:path';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/health.routes';
import loginRoutes from './routes/login.routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

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
  
  app.set('layout', 'layouts/main');

  // Estáticos (CSS generado, JS de cliente, imágenes).
  app.use(express.static(path.join(ROOT, 'public')));

  // Rutas.
  app.use('/health', healthRoutes);
  app.use('/', loginRoutes);

  // Manejo de errores (siempre al final).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
