const $ = selector => document.querySelector(selector);
document.querySelectorAll('.session-link').forEach(link => link.addEventListener('click', async event => {
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
let status = '', descending = true, detailId = null;
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
  $('#count-all').textContent = summary.total;
  const rows = filtered();
  const totalPages = Math.max(1, Math.ceil(summary.filteredTotal / pageSize));
  currentPage = Math.max(1, Math.min(currentPage, totalPages));
  const offset = (currentPage - 1) * pageSize;
  const visibleRows = rows;
  $('#page-info').textContent = `${currentPage} / ${totalPages}`;
  $('#page-prev').disabled = currentPage === 1;
  $('#page-next').disabled = currentPage === totalPages;
  $('#records-body').replaceChildren(...visibleRows.map(desktopRow));
  $('#mobile-records').replaceChildren(...visibleRows.map(mobileCard));
  $('#empty-state').hidden = rows.length > 0;
  $('#results').textContent = rows.length ? `${offset + 1}–${offset + visibleRows.length} de ${summary.filteredTotal} solicitudes` : '0 solicitudes';
  $('#reset-filters').disabled = !$('#search').value && $('#date-filter').value === 'all' && status === '';
}
function element(tag, className, text) { const node=document.createElement(tag); if(className)node.className=className;if(text!==undefined)node.textContent=text;return node; }
function initials(name) { return String(name||'?').trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase(); }
function badge(r) { return element('span','status-tag'+(r.status==='done'?' attended':''),r.status==='done'?'✓ Atendido':'• Pendiente'); }
function identity(r) {
  const wrap=element('div','request-identity');const avatar=element('span','request-avatar'+(r.status==='done'?' green':''),initials(r.name));avatar.setAttribute('aria-hidden','true');const text=element('div','request-person');const name=element('button','name-link',r.name);name.type='button';name.addEventListener('click',()=>openDetail(r.id));text.append(name,element('small','request-subtitle',r.gradoAcademico==='No indicado'?'Solicitud de información':r.gradoAcademico));wrap.append(avatar,text);return wrap;
}
function stateButton(r) { const button=element('button','row-action',r.status==='done'?'↶ Marcar pendiente':'✓ Marcar atendido');button.type='button';button.dataset.recordId=r.id;button.disabled=pendingChanges.has(r.id);button.setAttribute('aria-label',button.textContent+': '+r.name);button.addEventListener('click',()=>toggleStatus(r.id));return button; }
function detailButton(r) { const b=element('button','detail-action','Ver ficha →');b.type='button';b.setAttribute('aria-label','Ver ficha de '+r.name);b.addEventListener('click',()=>openDetail(r.id));return b; }
function desktopRow(r) {
 const tr=document.createElement('tr');const person=cell('');person.append(identity(r));const phone=cell('','request-phone');phone.append(contactLink(r.phone));const city=cell(r.city);const time=cell(r.time);const date=cell(formatDate.format(r.date),'request-date');const state=cell('');state.append(badge(r));const actions=cell('','request-actions');const actionGroup=element('div','request-action-group');actionGroup.append(detailButton(r),stateButton(r));actions.append(actionGroup);tr.append(person,phone,city,time,date,state,actions);return tr;
}
function mobileCard(r) {
 const card=element('article','lead-card');const header=element('div','lead-card-header');header.append(identity(r),badge(r));const info=element('dl','request-mobile-info');[['Ciudad',r.city],['Contacto',r.time],['Fecha',formatDate.format(r.date)]].forEach(([label,value])=>{const group=document.createElement('div');group.append(element('dt','',label),element('dd','',value));info.append(group);});const contact=contactLink(r.phone);contact.className='request-whatsapp';if(contact.hasAttribute('href'))contact.textContent='Contactar por WhatsApp ↗';const actions=element('div','lead-actions');actions.append(stateButton(r),detailButton(r));card.append(header,info,contact,actions);return card;
}
$('#mobile-account').addEventListener('click', () => $('#account-dialog').showModal());
$('#close-account').addEventListener('click', () => $('#account-dialog').close());
async function toggleStatus(id) {
  if (pendingChanges.has(id)) return false;
  const r = records.find(r => r.id === id);
  if (!r) return false;
  pendingChanges.add(id);
  document.querySelectorAll("[data-record-id]").forEach(button=>{if(button.dataset.recordId===id){button.disabled=true;button.textContent="Guardando…";}});
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
  document.querySelectorAll("[data-record-id]").forEach(button=>{if(button.dataset.recordId===id){button.disabled=false;button.textContent=(records.find(item=>item.id===id)?.status||r.status)==='pending'?'✓ Marcar atendido':'↶ Marcar pendiente';}});
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
    $("#last-updated").textContent = "Actualizado a las " + new Intl.DateTimeFormat("es-BO",{timeZone:"America/La_Paz",hour:"2-digit",minute:"2-digit"}).format(new Date()) + " · Hora de Bolivia";
  } catch (error) {
    if (sequence !== loadSequence) return;
    records = []; $('#records-body').replaceChildren(); $('#mobile-records').replaceChildren();
    $('#results').textContent = 'No se pudo actualizar el listado.';$('#last-updated').textContent='No se pudo actualizar la información.';
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
document.querySelectorAll('[role=tab]').forEach((tab,index) => {
 tab.addEventListener('click',()=>selectTab(tab));
 tab.addEventListener('keydown',event=>{const tabs=Array.from(document.querySelectorAll('[role=tab]'));let next;if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else return;event.preventDefault();selectTab(tabs[next]);tabs[next].focus();});
});
function resetPage() { currentPage = 1; refresh(); }
let searchTimer; $('#search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(resetPage, 250); }); $('#date-filter').addEventListener('change', resetPage);
$('#page-size').addEventListener('change', event => { pageSize = Number(event.target.value); resetPage(); });
$('#page-prev').addEventListener('click', () => { if (loading || currentPage <= 1) return; currentPage--; refresh(); });
$('#page-next').addEventListener('click', () => { if (loading || currentPage >= Math.ceil(summary.filteredTotal / pageSize)) return; currentPage++; refresh(); });
function clearFilters() { clearTimeout(searchTimer); $('#search').value='';$('#date-filter').value='all';selectTab($('#tab-all')); }
$('#clear-filters').addEventListener('click',clearFilters);$('#reset-filters').addEventListener('click',clearFilters);
$('#sort-date').addEventListener('click', () => { descending = !descending; currentPage = 1; $('#sort-arrow').textContent = descending ? '↓' : '↑'; $('#sort-date').closest('th').setAttribute('aria-sort', descending ? 'descending' : 'ascending'); refresh(); });
$('#sort-date').closest('th').setAttribute('aria-sort', 'descending');
function openDetail(id) {
  detailId = id; const r = records.find(r => r.id === id); $('#detail-name').textContent = r.name;
  $('#detail-contact').replaceChildren(contactLink(r.phone));$('#detail-contact a').className='request-whatsapp';
  const fields=[['WhatsApp',r.phone],['Ciudad',r.city],['Inicio de interés',r.start],['Horario de contacto',r.time],['Bachiller',r.bachiller||'No indicado'],['Grado académico',r.gradoAcademico],['Fecha de registro',formatDate.format(r.date)],['Estado',r.status==='done'?'Atendido':'Pendiente'],['Fecha de atención',r.attendedAt?formatDate.format(new Date(r.attendedAt)):'Pendiente'],['Atendido por',r.attendedBy||'Pendiente'],['Código',r.code]];
  const extra=[['Carrera',r.career==='No indicado'?'':r.career],['Edad',r.age],['Correo',r.email],['Tutor',r.tutorName],['Celular del tutor',r.tutorPhone],['Título profesional o técnico',r.tituloProfesionalTecnico==='No indicado'?'':r.tituloProfesionalTecnico],['Origen de campaña',r.source],['Cómo nos conoció',r.declaredSource],['Campaña UTM',r.campaign],['Medio UTM',r.medium],['Contenido UTM',r.content],['Término UTM',r.term],['FBCLID',r.fbclid]].filter(([,value])=>value);
  function detailFields(rows) {return rows.flatMap(([key,value])=>{const dt=element('dt','',key);const dd=element('dd','',value||'No indicado');if(key==='Celular del tutor'){dd.replaceChildren(contactLink(value));}return [dt,dd];});}
  $('#detail-fields').replaceChildren(...detailFields(fields));$('#detail-extra-fields').replaceChildren(...detailFields(extra));$('#detail-extra').open=false;
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

fetch('/api/auth/me', {cache:'no-store'}).then(r => r.ok ? r.json() : null).then(me => { if (!me) return;const role=me.administrator?'Administrador':'Vendedor';$('#session-role').textContent=$('#account-role').textContent=role;$('#session-email').textContent=$('#account-email').textContent=me.email; if (me.administrator) { $('#manage-users').hidden = false; $('#mobile-manage-users').hidden = false; } }).catch(() => {});
