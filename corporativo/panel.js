const $ = selector => document.querySelector(selector);
document.querySelectorAll('a[href="./"]').forEach(link => link.addEventListener('click', async event => {
  event.preventDefault();
  try {
    const tokenResponse = await fetch('/api/auth/token', { cache: 'no-store' });
    if (!tokenResponse.ok) throw new Error();
    const { token } = await tokenResponse.json();
    const response = await fetch('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-TOKEN': token } });
    if (!response.ok) throw new Error();
    location.href = '/corporativo/';
  } catch { alert('No se pudo cerrar la sesión. Vuelve a intentarlo.'); }
}));
const formatDate = new Intl.DateTimeFormat('es-BO', { timeZone: 'America/La_Paz', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const pendingChanges = new Set();
let loading = false;
let hasLoaded = false;
let records = [];
let status = 'pending', descending = true, detailId = null;
let toastTimer;
let currentPage = 1;
let pageSize = 10;
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
let summary = { total: 0, pending: 0, done: 0, filteredTotal: 0 };
let loadSequence = 0;
function filtered() { return records; }
function mapRecord(r) {
  const d = r.datos;
  return { id: r.id, code: r.codigo, name: d.nombre, phone: d.whatsapp, email: d.correo, city: d.ciudad, career: d.carrera || "No indicado", age: d.edad || "", time: d.horario_contacto, start: d.inicio,
    source: d.utm_source || d.origen || 'directo', declaredSource: d.como_nos_conocio || '', bachiller: d.bachiller,
    gradoAcademico: d.grado_academico || "No indicado",
    tituloProfesionalTecnico: ({ true: "Sí", false: "No" })[d.titulo_profesional_tecnico] ?? "No indicado",
    tutorName: d.tutor_nombre || '', tutorPhone: d.tutor_celular || '', campaign: d.utm_campaign || '', medium: d.utm_medium || '', content: d.utm_content || '', term: d.utm_term || '', fbclid: d.fbclid || '',
    status: r.status, date: Date.parse(r.createdAt), attendedBy: r.attendedBy, attendedAt: r.attendedAt };
}
function currentFilters() { return { status, q: $("#search").value.trim(), date: $("#date-filter").value, sort: descending ? "desc" : "asc" }; }
async function fetchPage(page, size, filters = currentFilters()) {
  const query = new URLSearchParams({ page, pageSize: size, ...filters });
  const response = await fetch('/api/preinscripciones?' + query, { cache: 'no-store' });
  if (response.status === 401 || response.status === 403) { location.href = '/corporativo/'; throw new Error('Inicia sesión nuevamente.'); }
  if (!response.ok) throw new Error('No se pudo cargar el panel.');
  return response.json();
}
function contactLink(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const link = document.createElement('a');
  link.textContent = phone || 'No indicado';
  if (digits.length >= 8 && digits.length <= 15) { link.href = 'https://wa.me/' + digits; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.title = 'Abrir conversación en WhatsApp'; link.setAttribute('aria-label', 'Contactar por WhatsApp al ' + phone); }
  return link;
}
function cell(text, className) { const td = document.createElement('td'); td.textContent = text; if (className) td.className = className; return td; }
function render() {
  const pending = summary.pending;
  $('#stat-total').textContent = $('#nav-count').textContent = $('#mobile-count').textContent = summary.total;
  $('#stat-pending').textContent = $('#count-pending').textContent = pending;
  $('#stat-done').textContent = $('#count-done').textContent = summary.done;
  const rows = filtered();
  const totalPages = Math.max(1, Math.ceil(summary.filteredTotal / pageSize));
  currentPage = Math.max(1, Math.min(currentPage, totalPages));
  const offset = (currentPage - 1) * pageSize;
  const visibleRows = rows;
  $('#page-info').textContent = `${currentPage} / ${totalPages}`;
  $('#page-prev').disabled = currentPage === 1;
  $('#page-next').disabled = currentPage === totalPages;
  $('#records-body').replaceChildren(...visibleRows.map(r => {
    const tr = document.createElement('tr');
    tr.append(cell(formatDate.format(r.date)));
    const name = cell(''); const a = document.createElement('a'); a.className = 'name-link'; a.href = '#ficha'; a.textContent = r.name; a.addEventListener('click', event => { event.preventDefault(); openDetail(r.id); });
    const sub = document.createElement('span'); sub.className = 'subtext'; sub.textContent = r.source; name.append(a, sub); tr.append(name);
    const phoneCell = cell('', 'phone-text'); phoneCell.append(contactLink(r.phone)); tr.append(phoneCell);
    const city = cell(''); const tag = document.createElement('span'); tag.className = 'city-tag'; tag.textContent = r.city; city.append(tag); tr.append(city, cell(r.gradoAcademico), cell(r.time));
    const state = cell(''); const badge = document.createElement('span'); badge.className = 'status-tag' + (r.status === 'done' ? ' attended' : ''); badge.textContent = r.status === 'done' ? '• Atendido' : '• Pendiente'; state.append(badge); tr.append(state);
    const action = cell(''); const button = document.createElement('button'); button.className = 'row-action'; button.textContent = r.status === 'pending' ? '✓ Marcar atendido' : '↶ Marcar pendiente'; button.setAttribute('aria-label', `${button.textContent}: ${r.name}`); button.addEventListener('click', () => toggleStatus(r.id)); action.append(button); tr.append(action); return tr;
  }));
  $('#mobile-records').replaceChildren(...visibleRows.map(mobileCard));
  $('#empty-state').hidden = rows.length > 0;
  $('#results').textContent = rows.length ? `${offset + 1}–${offset + visibleRows.length} de ${summary.filteredTotal} ${summary.filteredTotal === 1 ? 'registro' : 'registros'}` : '0 registros';
}
function mobileCard(r) {
  const card = document.createElement('article'); card.className = 'lead-card';
  const header = document.createElement('div'); header.className = 'lead-card-header';
  const name = document.createElement('button'); name.className = 'lead-name'; name.textContent = r.name; name.addEventListener('click', () => openDetail(r.id));
  const source = document.createElement('span'); source.className = 'source-tag source-' + normalize(r.source).replace(/[^a-z]/g, ''); source.textContent = r.source;
  const identity = document.createElement('div'); identity.className = 'lead-identity'; identity.append(name, source);
  const badge = document.createElement('span'); badge.className = 'status-tag' + (r.status === 'done' ? ' attended' : ''); badge.textContent = r.status === 'done' ? '• Atendido' : '• Pendiente';
  header.append(identity, badge);
  const date = document.createElement('p'); date.className = 'lead-date'; date.textContent = '◷ ' + formatDate.format(r.date);
  const fields = document.createElement('dl'); fields.className = 'lead-fields';
  [['Grado académico', r.gradoAcademico], ['Ciudad', r.city], ['Preferencia', 'Horario: ' + r.time], ['WhatsApp', r.phone]].forEach(([label, value]) => {
    const group = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = label; const dd = document.createElement('dd'); if (label === 'WhatsApp') dd.append(contactLink(value)); else dd.textContent = value;  group.append(dt, dd); fields.append(group);
  });
  const actions = document.createElement('div'); actions.className = 'lead-actions';
  const change = document.createElement('button'); change.className = 'lead-status-action'; change.textContent = r.status === 'pending' ? '✓  Marcar atendido' : '↶  Marcar pendiente'; change.setAttribute('aria-label', change.textContent + ': ' + r.name); change.addEventListener('click', () => toggleStatus(r.id));
  const contact = document.createElement('button'); contact.className = 'lead-contact'; contact.setAttribute('aria-label', 'Ver contacto de ' + r.name); contact.title = 'Ver datos de contacto'; contact.innerHTML = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>'; contact.addEventListener('click', () => openDetail(r.id));
  actions.append(change, contact); card.append(header, date, fields, actions); return card;
}
$('#mobile-account').addEventListener('click', () => $('#account-dialog').showModal());
$('#close-account').addEventListener('click', () => $('#account-dialog').close());
async function toggleStatus(id) {
  if (pendingChanges.has(id)) return false;
  const r = records.find(r => r.id === id);
  if (!r) return false;
  pendingChanges.add(id);
  if (detailId === id) $("#detail-status").disabled = true;
  let saved = false;
  try {
    const tokenResponse = await fetch('/api/auth/token', { cache: 'no-store' });
    if (!tokenResponse.ok) throw new Error();
    const { token } = await tokenResponse.json();
    const response = await fetch('/api/preinscripciones/' + id + '/estado', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token }, body: JSON.stringify({ status: r.status === 'pending' ? 'done' : 'pending' }) });
    if (!response.ok) throw new Error();
    saved = true;
    if (detailId === id && $("#detail-dialog").open) $("#detail-dialog").close();
    try { await loadRecords(); } catch (error) { showLoadError(error); }
    $('#toast').textContent = r.name + ': estado guardado.';
  } catch { $('#toast').textContent = 'No se pudo guardar el estado. Vuelve a intentarlo.'; }
  pendingChanges.delete(id);
  if (detailId === id) $('#detail-status').disabled = false;
  $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').hidden = true, 3500);
  return saved;
}
function setLoading(value) {
  loading = value;
  $('#records-section').setAttribute('aria-busy', String(value));
  $('#loading-state').hidden = !value;
  $('#refresh').disabled = value;
  $('#page-prev').disabled = value || currentPage === 1;
  $('#page-next').disabled = value || currentPage >= Math.max(1, Math.ceil(summary.filteredTotal / pageSize));
  $('#empty-state').hidden = true;
}
async function loadRecords() {
  const sequence = ++loadSequence;
  setLoading(true); $('#load-error').hidden = true;
  try {
    const data = await fetchPage(currentPage, pageSize);
    if (sequence !== loadSequence) return;
    summary = data;
    const lastPage = Math.max(1, Math.ceil(data.filteredTotal / pageSize));
    if (currentPage > lastPage) { currentPage = lastPage; return loadRecords(); }
    records = data.items.map(mapRecord); hasLoaded = true;
    render();
  } catch (error) {
    if (sequence !== loadSequence) return;
    records = []; $('#records-body').replaceChildren(); $('#mobile-records').replaceChildren();
    $('#results').textContent = 'No se pudo actualizar el listado.';
    showLoadError(error);
    throw error;
  } finally {
    if (sequence === loadSequence) {
      setLoading(false);
      $('#empty-state').hidden = !$('#load-error').hidden || records.length > 0;
      if (!hasLoaded) ['#stat-total','#stat-pending','#stat-done'].forEach(id => $(id).textContent = '—');
    }
  }
}
function refresh() { loadRecords().catch(() => {}); }
function showLoadError(error) { $('#load-error').hidden = false; $('#load-error p').textContent = error.message || 'No se pudieron cargar los registros.'; }
$('#retry-load').addEventListener('click', refresh);
$('#refresh').addEventListener('click', refresh);
function selectTab(tab) { status = tab.dataset.status; currentPage = 1; document.querySelectorAll('[role=tab]').forEach(t => { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; }); refresh(); }
document.querySelectorAll('[role=tab]').forEach(tab => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? $('#tab-pending') : event.key === 'End' ? $('#tab-done') : tab.dataset.status === 'pending' ? $('#tab-done') : $('#tab-pending'); selectTab(next); next.focus(); } });
});
function resetPage() { currentPage = 1; refresh(); }
let searchTimer; $('#search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(resetPage, 250); }); $('#date-filter').addEventListener('change', resetPage);
$('#page-size').addEventListener('change', event => { pageSize = Number(event.target.value); resetPage(); });
$('#page-prev').addEventListener('click', () => { if (loading || currentPage <= 1) return; currentPage--; refresh(); });
$('#page-next').addEventListener('click', () => { if (loading || currentPage >= Math.ceil(summary.filteredTotal / pageSize)) return; currentPage++; refresh(); });
$('#clear-filters').addEventListener('click', () => { $('#search').value = ''; $('#date-filter').value = 'all'; resetPage(); });
$('#sort-date').addEventListener('click', () => { descending = !descending; currentPage = 1; $('#sort-arrow').textContent = descending ? '↓' : '↑'; $('#sort-date').closest('th').setAttribute('aria-sort', descending ? 'descending' : 'ascending'); refresh(); });
$('#sort-date').closest('th').setAttribute('aria-sort', 'descending');
function openDetail(id) {
  detailId = id; const r = records.find(r => r.id === id); $('#detail-name').textContent = r.name;
  const fields = [['Fecha', formatDate.format(r.date)], ['Ciudad', r.city], ['Carrera', r.career], ['Edad', r.age ? `${r.age} años` : "No indicada"], ['Inicio de interés', r.start], ['Horario de contacto', r.time], ['Origen de campaña', r.source], ['Cómo nos conoció', r.declaredSource || 'No indicado'], ['Bachiller', r.bachiller || 'No indicado'], ['Grado académico', r.gradoAcademico], ['Título profesional o técnico', r.tituloProfesionalTecnico], ['Tutor', r.tutorName || 'No aplica'], ['Celular del tutor', r.tutorPhone || 'No aplica'], ['Campaña UTM', r.campaign || 'No indicada'], ['Medio UTM', r.medium || 'No indicado'], ['Contenido UTM', r.content || 'No indicado'], ['Término UTM', r.term || 'No indicado'], ['FBCLID', r.fbclid || 'No indicado'], ['Código', r.code], ['Fecha de atención', r.attendedAt ? formatDate.format(new Date(r.attendedAt)) : 'Pendiente'], ['WhatsApp', r.phone], ['Correo', r.email || 'No indicado'], ['Atendido por', r.attendedBy || 'Pendiente']];
  $('#detail-fields').replaceChildren(...fields.flatMap(([key, value]) => { const dt = document.createElement('dt'); dt.textContent = key; const dd = document.createElement('dd'); if (key === 'WhatsApp' || key === 'Celular del tutor') dd.append(contactLink(value)); else dd.textContent = value; return [dt, dd]; }));
  $('#detail-status').disabled = pendingChanges.has(id);
  $('#detail-status').textContent = r.status === 'pending' ? 'Marcar como atendido' : 'Marcar como pendiente'; $('#detail-dialog').showModal();
}
$('#close-detail').addEventListener('click', () => $('#detail-dialog').close());
$('#detail-status').addEventListener('click', () => toggleStatus(detailId));
$('#export').addEventListener('click', async () => {
  const button = $('#export'); button.disabled = true; button.textContent = 'Preparando…';
  const filters = currentFilters();
  const labels = { estado: filters.status, busqueda: filters.q, fechas: $('#date-filter').selectedOptions[0].textContent };
  try { const all = []; let page = 1; let batch; do { batch = await fetchPage(page++, 100, filters); all.push(...batch.items.map(mapRecord)); } while ((page - 1) * 100 < batch.filteredTotal); await exportarInformeExcel(all, labels); }
  catch { $('#toast').textContent = 'No se pudo generar el informe. Vuelve a intentarlo.'; $('#toast').hidden = false; }
  finally { button.disabled = false; button.textContent = '↓ Exportar Excel'; }
});
refresh();
fetch('/api/demo', { cache:'no-store' }).then(r => r.ok ? r.json() : null).then(demo => { if (demo) $('#environment-badge').hidden = false; }).catch(() => {});
