import { Router } from 'express';
import myweb from '../myweb.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { texto } = await myweb.get('main');
    res.render('page', { layout: 'layouts/main', title: 'Inicio', content: texto });
  } catch (e) { next(e); }
});

router.get('/:ruta', async (req, res, next) => {
    try {
        const slug = req.params.ruta;
        if (['admin', 'api', 'public'].includes(slug)) return res.status(404).send('');
        const { texto } = await myweb.get(slug);
        res.render('page', { layout: 'layouts/main', title: slug, content: texto });
    } catch (e) {
        if (e.message === 'not_found') {
            return res.status(404).render('page', {
                layout: 'layouts/main',
                title: '404',
                content: `<h2>404</h2><p>La ruta <code>/${req.params.ruta}</code> no existe.</p>`
            });
        }
        next(e);
    }
});

export default router;
