import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import hbs from 'hbs';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';

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
app.use(helmet());

// hbs
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// Static
app.use('/public', express.static(path.join(__dirname, 'public')));

await myweb.ensureMain();

// Router páginas
app.use('/api', apiRouter);
app.use('/', pagesRouter);

app.use((req, res) => {
  res.status(404).render('page', {
    layout: 'layouts/main',
    title: '404',
    content: '<h2>Página no encontrada</h2>'
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
