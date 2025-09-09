# mini-cms-express-hbs

Mini CMS en **Node.js** con **Express** y **Handlebars (hbs)**.  
Incluye un panel de administración en `/admin` para **crear, editar y borrar páginas dinámicas** servidas en rutas personalizadas.

---

## Demo local

```bash
# Instalar dependencias
npm install

# Arrancar en modo desarrollo (con nodemon)
npm run dev

# Arrancar en producción
npm start

Accede a:

http://localhost:3000/
 → Página principal (main)

http://localhost:3000/admin
 → Panel de administración


Estructura del proyecto
app.js              # Servidor Express (config, middlewares, hbs)
myweb.js            # Módulo de negocio (gestiona webs.json y archivos HTML)

data/webs.json      # Base de datos simple en JSON
web/main.html       # Página principal (no se puede borrar)

routes/api.js       # REST API (CRUD de páginas)
routes/pages.js     # Rutas públicas (/ y /:ruta) + /admin# mini-cms-express-hbs

Mini CMS en **Node.js** con **Express** y **Handlebars (hbs)**.  
Incluye un panel de administración en `/admin` para **crear, editar y borrar páginas dinámicas** servidas en rutas personalizadas.

---

## Demo local

```bash
# Instalar dependencias
npm install

# Arrancar en modo desarrollo (con nodemon)
npm run dev

# Arrancar en producción
npm start
```

Accede a:
- [http://localhost:3000/](http://localhost:3000/) → Página principal (`main`)
- [http://localhost:3000/admin](http://localhost:3000/admin) → Panel de administración

---

## Estructura del proyecto

```
app.js                  # Servidor Express (config, middlewares, hbs)
myweb.js                # Módulo de negocio (gestiona webs.json y archivos HTML)

data/webs.json          # Base de datos simple en JSON
web/main.html           # Página principal (no se puede borrar)

routes/api.js           # REST API (CRUD de páginas)
routes/pages.js         # Rutas públicas (/ y /:ruta) + /admin

views/layouts/main.hbs  # Layout base
views/page.hbs          # Vista genérica de página
views/admin.hbs         # Panel de administración

public/admin.js         # Componente JS del admin (consume la API)
```

---

## REST API

- `GET  /api/list` → devuelve todas las páginas registradas  
- `GET  /api/get?ruta=main` → devuelve HTML de una ruta  
- `POST /api/new`  → crea página (`{ ruta, texto }`)  
- `POST /api/edit` → edita página (`{ ruta, texto }`)  
- `POST /api/delete` → borra página (`{ ruta }`)  

---

## Notas

- La ruta `main` siempre existe y no puede borrarse.  
- Rutas reservadas: `admin`, `api`, `public`.  
- El HTML introducido en `/admin` se renderiza tal cual (crudo), usar solo en entornos controlados.  
- Middlewares incluidos: `helmet`, `compression`, `morgan`.  


views/layouts/main.hbs  # Layout base
views/page.hbs          # Vista genérica de página
views/admin.hbs         # Panel de administración

public/admin.js      # Componente JS del admin (consume la API)

REST API

GET /api/list → devuelve todas las páginas registradas

GET /api/get?ruta=main → devuelve HTML de una ruta

POST /api/new → crea página ({ ruta, texto })

POST /api/edit → edita página ({ ruta, texto })

POST /api/delete → borra página ({ ruta })

Notas

La ruta main siempre existe y no puede borrarse.

Rutas reservadas: admin, api, public.

El HTML introducido en /admin se renderiza tal cual (crudo), usar solo en entornos controlados.

Middlewares incluidos: helmet, compression, morgan.
