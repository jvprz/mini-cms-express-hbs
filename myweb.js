import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const WEB_DIR = path.join(__dirname, 'web');
const JSON_PATH = path.join(DATA_DIR, 'webs.json');
const RESERVED = new Set(['', 'admin', 'api', 'public']);

async function ensureFolders() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(WEB_DIR, { recursive: true });
}
async function readJSON() {
  try { return JSON.parse(await fs.readFile(JSON_PATH, 'utf8')); }
  catch { return { webs: [] }; }
}
async function writeJSON(obj) {
  const tmp = JSON_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2), 'utf8');
  await fs.rename(tmp, JSON_PATH);
}
function slugify(input) {
  return String(input)
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const myweb = {
  async ensureMain() {
    await ensureFolders();
    const db = await readJSON();
    const mainRel = 'web/main.html';
    const mainAbs = path.join(__dirname, mainRel);
    if (!db.webs.find(w => w.ruta === 'main')) {
      db.webs.push({ ruta: 'main', file: mainRel });
      await writeJSON(db);
    }
    try { await fs.access(mainAbs); }
    catch { await fs.writeFile(mainAbs, '<h1>Bienvenido</h1><p>Portada</p>', 'utf8'); }
  },

  async list() {
    await ensureFolders();
    return readJSON();
  },

  async new(id, fichero) {
    await ensureFolders();
    if (!id) throw new Error('id requerido');
    const ruta = slugify(id);
    if (!ruta || RESERVED.has(ruta)) throw new Error('ruta inválida o reservada');

    const db = await readJSON();
    if (db.webs.find(w => w.ruta === ruta)) throw new Error('exists');

    const fileRel = fichero || path.join('web', `${ruta}.html`);
    const fileAbs = path.join(__dirname, fileRel);

    db.webs.push({ ruta, file: fileRel });
    await writeJSON(db);

    try { await fs.access(fileAbs); }
    catch { await fs.writeFile(fileAbs, '', 'utf8'); }

    return { ruta, file: fileRel };
  },

  async edit(id, texto) {
    await ensureFolders();
    const ruta = slugify(id);
    const db = await readJSON();
    const entry = db.webs.find(w => w.ruta === ruta);
    if (!entry) throw new Error('not_found');
    await fs.writeFile(path.join(__dirname, entry.file), String(texto ?? ''), 'utf8');
    return { ok: true };
  },

  async delete(id) {
    await ensureFolders();
    const ruta = slugify(id);
    if (ruta === 'main') throw new Error('no_delete_main');

    const db = await readJSON();
    const idx = db.webs.findIndex(w => w.ruta === ruta);
    if (idx === -1) throw new Error('not_found');

    const fileRel = db.webs[idx].file;
    const fileAbs = path.join(__dirname, fileRel);

    db.webs.splice(idx, 1);
    await writeJSON(db);

    try { await fs.unlink(fileAbs); } catch {}
    return { ok: true };
  },

  async get(id) {
    await ensureFolders();
    const ruta = slugify(id);
    const db = await readJSON();
    const entry = db.webs.find(w => w.ruta === ruta);
    if (!entry) throw new Error('not_found');
    const texto = await fs.readFile(path.join(__dirname, entry.file), 'utf8');
    return { ruta, texto };
  }
};

export default myweb;
