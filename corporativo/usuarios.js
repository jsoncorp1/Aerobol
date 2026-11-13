const $ = s => document.querySelector(s);
let users = [], currentId = '', page = 1, total = 0, sequence = 0, editing = null, deleting = null, busy = false, selectedRole = '';
async function api(path, method = 'GET', body) {
  const headers = {};
  if (method !== 'GET') {
    const response = await fetch('/api/auth/token', {cache:'no-store'});
    if (!response.ok) throw new Error('No se pudo verificar la sesión. Recarga la página.');
    headers['X-CSRF-TOKEN'] = (await response.json()).token;
    if (body) headers['Content-Type'] = 'application/json';
  }
  const response = await fetch('/api/usuarios' + path, {method, headers, body: body ? JSON.stringify(body) : undefined, cache:'no-store'});
  if (response.status === 401) { location.href = '/corporativo/'; throw new Error('Inicia sesión nuevamente.'); }
  if (response.status === 403) throw new Error('Solo un administrador puede gestionar usuarios.');
  const result = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.errors?.join(' ') || result?.message || 'No se pudo completar la operación.');
  return result;
}
function action(label, fn, disabled = false) {
  const b=document.createElement('button'); b.type='button'; b.className=label==='Eliminar'?'user-delete-action':'user-edit-action'; b.textContent=label==='Eliminar'?'×':'Editar'; b.title=label; b.setAttribute('aria-label',label); b.disabled=disabled; b.addEventListener('click',fn); return b;
}
function actions(user) { const d=document.createElement('div'); d.className='user-actions'; const editButton=action('Editar',()=>edit(user)); editButton.setAttribute('aria-label','Editar '+user.email);const deleteButton=action('Eliminar',()=>remove(user), user.id===currentId);deleteButton.setAttribute('aria-label','Eliminar '+user.email);if(user.id===currentId)deleteButton.title='No puedes eliminar tu propia cuenta';d.append(editButton,deleteButton);return d; }
function identity(user) {
  const d=document.createElement('div'); d.className='users-identity';const avatar=document.createElement('span');avatar.className='users-avatar';avatar.setAttribute('aria-hidden','true');avatar.textContent=(user.email||'?').slice(0,2).toUpperCase();const info=document.createElement('div');const email=document.createElement('strong');email.textContent=user.email;info.append(email);if(user.id===currentId){const badge=document.createElement('span');badge.className='users-own';badge.textContent='Tu cuenta';info.append(badge);}const sub=document.createElement('small');sub.textContent='Acceso al portal corporativo';info.append(sub);d.append(avatar,info);return d;
}
function roleInfo(user) {
  const d=document.createElement('div');d.className='users-role-info';const role=document.createElement('span');const admin=user.roles.includes('Administrador');role.className='users-role-badge '+(admin?'admin':'seller');role.textContent=user.roles.join(', ')||'Sin rol';const desc=document.createElement('small');desc.textContent=admin?'Usuarios y atención de interesados':user.roles.includes('Vendedor')?'Atención de interesados':'Sin permisos asignados';d.append(role,desc);return d;
}
function render() {
  $('#users-body').replaceChildren(...users.map(user=>{const tr=document.createElement('tr');[identity(user),roleInfo(user),actions(user)].forEach(content=>{const td=document.createElement('td');td.append(content);tr.append(td);});return tr;}));
  $('#users-cards').replaceChildren(...users.map(user=>{const card=document.createElement('article');card.className='lead-card';card.append(identity(user),roleInfo(user),actions(user));return card;}));
  $('#users-count').textContent=total+' '+(total===1?'usuario':'usuarios')+(selectedRole?' · '+selectedRole:'');$('#users-page').textContent=page+' / '+Math.max(1,Math.ceil(total/20));$('#users-prev').disabled=page<=1;$('#users-next').disabled=page>=Math.ceil(total/20);$('#users-message').textContent=users.length?'':'No encontramos usuarios con estos filtros.';$('#users-message').hidden=users.length>0;
}
async function load() {
  const seq=++sequence;$('#users-error').hidden=true;$('#users-message').textContent='Cargando usuarios…';$('#users-message').hidden=false;$('#user-section').setAttribute('aria-busy','true');$('#users-prev').disabled=$('#users-next').disabled=true;
  try {const data=await api('?'+new URLSearchParams({page,q:$('#user-search').value.trim(),role:selectedRole}));if(seq!==sequence)return;total=data.total;currentId=data.currentUserId;$("#users-total").textContent=data.summary.total;$("#users-admins").textContent=data.summary.administrators;$("#users-sellers").textContent=data.summary.sellers;if(page>Math.max(1,Math.ceil(total/20))){page=Math.max(1,Math.ceil(total/20));return load();}users=data.items;render();}
  catch(e){if(seq!==sequence)return;$('#users-body').replaceChildren();$('#users-cards').replaceChildren();$('#users-message').textContent='';$('#users-error').textContent=e.message;$('#users-error').hidden=false;}
  finally{if(seq===sequence)$('#user-section').setAttribute('aria-busy','false');}
}
function edit(user=null){editing=user;$('#user-form').reset();$('#editor-title').textContent=user?'Editar usuario':'Nuevo usuario';$('#user-email').value=user?.email||'';$('#user-role').value=user?.roles?.[0]||'Vendedor';$('#user-role').disabled=user?.id===currentId;$('#password-field').hidden=!!user;$('#user-password').required=!user;$('#editor-error').hidden=true;$('#user-editor').showModal();}
function remove(user){deleting=user;$('#delete-email').textContent=user.email;$('#delete-form').reset();$('#delete-error').hidden=true;$('#delete-user').showModal();}
$('#cancel-editor').addEventListener('click',()=>{if(!busy)$('#user-editor').close();});
$('#new-user').addEventListener('click',()=>edit());$('#close-editor').addEventListener('click',()=>{if(!busy){$('#user-editor').close();$('#user-password').value='';}});$('#user-editor').addEventListener('close',()=>$('#user-password').value='');$('#user-editor').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
$('#user-form').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;$('#save-user').disabled=true;$('#editor-error').hidden=true;try{const data={email:$('#user-email').value.trim(),role:$('#user-role').value};if(!editing)data.password=$('#user-password').value;const result=await api(editing?'/'+encodeURIComponent(editing.id):'',editing?'PUT':'POST',data);$('#user-editor').close();if(result?.reauthenticate){location.href='/corporativo/';return;}await load();}catch(err){$('#editor-error').textContent=err.message;$('#editor-error').hidden=false;}finally{busy=false;$('#save-user').disabled=false;$('#user-password').value='';}});
$('#cancel-delete').addEventListener('click',()=>{if(!busy)$('#delete-user').close();});$('#delete-user').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
$('#delete-form').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;if($('#delete-confirm').value.trim()!==deleting.email){$('#delete-error').textContent='El correo no coincide.';$('#delete-error').hidden=false;return;}busy=true;$('#confirm-delete').disabled=true;try{await api('/'+encodeURIComponent(deleting.id),'DELETE');$('#delete-user').close();await load();}catch(err){$('#delete-error').textContent=err.message;$('#delete-error').hidden=false;}finally{busy=false;$('#confirm-delete').disabled=false;}});
document.querySelectorAll('[data-role]').forEach(button=>button.addEventListener('click',()=>{selectedRole=button.dataset.role;page=1;document.querySelectorAll('[data-role]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));load();}));
let timer;$('#user-search').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{page=1;load();},250);});$('#reload-users').addEventListener('click',load);$('#users-prev').addEventListener('click',()=>{if(page>1){page--;load();}});$('#users-next').addEventListener('click',()=>{if(page<Math.ceil(total/20)){page++;load();}});load();
