import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import hbs from 'hbs';

import apiRouter from './routes/api.js';
import pagesRouter from './routes/pages.js';
import myweb from './myweb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Seguridad básica
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "style-src": ["'self'", "'unsafe-inline'"],
      "script-src": ["'self'"],
      "img-src": ["'self'", 'data:'],
    }
  }
}));

// hbs (Handlebars)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// Static
app.use('/public', express.static(path.join(__dirname, 'public')));

// Asegurar que existe la página main al arrancar
await myweb.ensureMain();

// Rutas API y páginas
app.use('/api', apiRouter);
app.use('/', pagesRouter);

// 404 genérico
app.use((req, res) => {
  res.status(404).render('page', {
    layout: 'layouts/main',
    title: 'Página no encontrada',
    content: '<h2>404</h2><p>La ruta solicitada no existe.</p>'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (req.path.startsWith('/api')) {
    res.status(500).json({ error: 'server_error', message: err.message });
  } else {
    res.status(500).render('page', {
      layout: 'layouts/main',
      title: 'Error de servidor',
      content: `<h2>Error</h2><pre>${(err && err.message) || 'Error desconocido'}</pre>`
    });
  }
});

app.listen(PORT, () => {
  console.log(`Mini CMS ejecutándose en http://localhost:${PORT}`);
});
