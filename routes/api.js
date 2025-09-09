import { Router } from 'express';
import myweb from '../myweb.js';

const router = Router();

router.get('/list', async (req, res, next) => {
  try {
    const data = await myweb.list();
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/get', async (req, res, next) => {
  try {
    const { ruta } = req.query;
    const data = await myweb.get(ruta);
    res.json(data);
  } catch (e) {
    if (e.message === 'not_found') return res.status(404).json({ error: 'not_found' });
    next(e);
  }
});

router.post('/new', async (req, res, next) => {
  try {
    const { ruta, texto } = req.body;
    const created = await myweb.new(ruta);
    if (typeof texto === 'string') {
      await myweb.edit(created.ruta, texto);
    }
    res.status(201).json({ ok: true, ...created });
  } catch (e) {
    if (e.message === 'exists') return res.status(409).json({ error: 'exists' });
    if (e.message === 'ruta inválida o reservada') return res.status(400).json({ error: 'bad_route' });
    next(e);
  }
});

router.post('/edit', async (req, res, next) => {
  try {
    const { ruta, texto } = req.body;
    await myweb.edit(ruta, texto);
    res.json({ ok: true });
  } catch (e) {
    if (e.message === 'not_found') return res.status(404).json({ error: 'not_found' });
    next(e);
  }
});

router.post('/delete', async (req, res, next) => {
  try {
    const { ruta } = req.body;
    await myweb.delete(ruta);
    res.json({ ok: true });
  } catch (e) {
    if (e.message === 'not_found') return res.status(404).json({ error: 'not_found' });
    if (e.message === 'no_delete_main') return res.status(422).json({ error: 'no_delete_main' });
    next(e);
  }
});

export default router;
