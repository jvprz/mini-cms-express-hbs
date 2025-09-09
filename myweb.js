import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const WEB_DIR = path.join(__dirname, 'web');
const JSON_PATH = path.join(DATA_DIR, 'webs.json');

const RESERVED = new Set(['', 'admin', 'api', 'public']);

function slugify(input) {
  return String(input)
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function ensureFolders() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(WEB_DIR, { recursive: true });
}

async function readJSON() {
  try {
    const raw = await fs.readFile(JSON_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { webs: [] };
  }
}

async function writeJSON(obj) {
  const tmp = JSON_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2), 'utf8');
  await fs.rename(tmp, JSON_PATH);
}

async function existsRoute(webs, ruta) {
  return webs.webs.find(w => w.ruta === ruta);
}

const myweb = {
  async ensureMain() {
    await ensureFolders();
    let db = await readJSON();
    let main = db.webs.find(w => w.ruta === 'main');
    const mainFile = path.join('web', 'main.html');
    const absMain = path.join(WEB_DIR, 'main.html');

    if (!main) {
      db.webs.push({ ruta: 'main', file: mainFile });
      await writeJSON(db);
    }
    try {
      await fs.access(absMain);
    } catch {
      await fs.writeFile(absMain, '<h1>Bienvenido</h1><p>Esta es la página principal.</p>', 'utf8');
    }
  },

  async list() {
    await ensureFolders();
    return await readJSON();
  },

  async new(id, fichero) {
    await ensureFolders();
    if (!id) throw new Error('id requerido');
    const ruta = slugify(id);
    if (!ruta || RESERVED.has(ruta)) throw new Error('ruta inválida o reservada');

    const db = await readJSON();
    if (await existsRoute(db, ruta)) throw new Error('exists');

    const fileRel = fichero || path.join('web', `${ruta}.html`);
    const fileAbs = path.join(__dirname, fileRel);

    db.webs.push({ ruta, file: fileRel });
    await writeJSON(db);

    try { await fs.access(fileAbs); }
    catch { await fs.writeFile(fileAbs, '', 'utf8'); }

    return { ruta, file: fileRel };
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

  async edit(id, texto) {
    await ensureFolders();
    const ruta = slugify(id);
    const db = await readJSON();
    const entry = db.webs.find(w => w.ruta === ruta);
    if (!entry) throw new Error('not_found');

    const fileAbs = path.join(__dirname, entry.file);
    await fs.writeFile(fileAbs, String(texto ?? ''), 'utf8');
    return { ok: true };
  },

  async get(id) {
    await ensureFolders();
    const ruta = slugify(id);
    const db = await readJSON();
    const entry = db.webs.find(w => w.ruta === ruta);
    if (!entry) throw new Error('not_found');
    const fileAbs = path.join(__dirname, entry.file);
    const texto = await fs.readFile(fileAbs, 'utf8');
    return { ruta, texto };
  }
};

export default myweb;
