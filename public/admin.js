const mycomponenteweb = (() => {
  const api = {
    async list() { const r = await fetch('/api/list'); if (!r.ok) throw new Error('list_fail'); return r.json(); },
    async get(ruta) { const r = await fetch(`/api/get?ruta=${encodeURIComponent(ruta)}`); if (!r.ok) throw new Error('get_fail'); return r.json(); },
    async create({ ruta, texto }) {
      const r = await fetch('/api/new', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ruta, texto }) });
      if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.error || 'create_fail'); }
      return r.json();
    },
    async edit({ ruta, texto }) {
      const r = await fetch('/api/edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ruta, texto }) });
      if (!r.ok) throw new Error('edit_fail');
      return r.json();
    },
    async remove({ ruta }) {
      const r = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ruta }) });
      if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.error || 'delete_fail'); }
      return r.json();
    }
  };

  function $(s){ return document.querySelector(s); }
  function escapeHtml(s){ return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  async function renderList(){
    const root = $('#listContainer'); root.textContent = 'Cargando...';
    try{
      const data = await api.list();
      if (!data.webs?.length){ root.textContent = 'Sin páginas'; return; }
      const rows = data.webs.map(w => `
        <tr>
          <td><code>${w.ruta}</code></td>
          <td class="muted">${w.file}</td>
          <td>
            <a class="btn" href="/${w.ruta}" target="_blank">Ver</a>
            <button class="btn" data-edit="${w.ruta}">Editar</button>
            ${w.ruta === 'main' ? '<span class="muted">(no se puede borrar)</span>' : `<button class="btn" data-del="${w.ruta}">Borrar</button>`}
          </td>
        </tr>`).join('');
      root.innerHTML = `<table><thead><tr><th>Ruta</th><th>Archivo</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table>`;
      root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', e => openEditor(e.currentTarget.getAttribute('data-edit'))));
      root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async e => {
        const ruta = e.currentTarget.getAttribute('data-del');
        if (!confirm(`¿Borrar /${ruta}?`)) return;
        try{ await api.remove({ ruta }); await renderList(); notify('Borrado.'); } catch(err){ alert('Error: '+err.message); }
      }));
    }catch(err){ root.textContent = 'Error al cargar'; console.error(err); }
  }

  async function openEditor(ruta){
    const editor = $('#editorContainer'); editor.innerHTML = 'Cargando...';
    try{
      const { texto } = await api.get(ruta);
      editor.innerHTML = `
        <div style="display:grid; gap:8px;">
          <label>Ruta: <input id="editRuta" type="text" value="${ruta}" disabled /></label>
          <label>HTML:<textarea id="editTexto">${escapeHtml(texto)}</textarea></label>
          <div><button id="btnSave" class="btn primary">Guardar</button></div>
        </div>`;
      $('#btnSave').addEventListener('click', async () => {
        try{ await api.edit({ ruta, texto: $('#editTexto').value }); notify('Guardado.'); } catch(err){ alert('Error: '+err.message); }
      });
    }catch(err){ editor.textContent = 'No se pudo cargar.'; console.error(err); }
  }

  function notify(msg){
    const n = document.createElement('div');
    n.textContent = msg; n.style.position = 'fixed'; n.style.bottom = '16px'; n.style.right = '16px';
    n.style.background = '#16a34a'; n.style.color = '#031321'; n.style.padding = '10px 12px'; n.style.borderRadius = '10px';
    document.body.appendChild(n); setTimeout(()=>n.remove(), 1500);
  }

  window.addEventListener('DOMContentLoaded', () => {
    renderList();
    $('#btnCreate')?.addEventListener('click', async () => {
      const ruta = $('#newRuta').value.trim(); const texto = $('#newTexto').value;
      if (!ruta) return alert('Indica una ruta');
      try{ await api.create({ ruta, texto }); $('#newRuta').value=''; $('#newTexto').value=''; await renderList(); notify('Creada.'); }
      catch(err){
        if (err.message === 'exists') return alert('La ruta ya existe');
        if (err.message === 'bad_route') return alert('Ruta inválida o reservada');
        alert('Error: '+err.message);
      }
    });
  });

  return {
    list(cb){ api.list().then(cb).catch(console.error); },
    new(obj, cb){ api.create(obj).then(cb).catch(console.error); },
    edit(obj, cb){ api.edit(obj).then(cb).catch(console.error); },
    delete(obj, cb){ api.remove(obj).then(cb).catch(console.error); },
    get(obj, cb){ api.get(obj.ruta).then(cb).catch(console.error); }
  };
})();

window.mycomponenteweb = mycomponenteweb;
