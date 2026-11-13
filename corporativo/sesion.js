/* Cierre de sesión compartido entre módulos del corporativo. */
(() => {
 let leaving = false;
 document.querySelectorAll('.session-link').forEach(link => link.addEventListener('click', async event => {
  event.preventDefault();
  if (leaving) return;
  leaving = true;
  const label = link.textContent;
  link.textContent = 'Saliendo…'; link.setAttribute('aria-disabled','true');
  const previous = document.querySelector('#session-error'); if(previous) previous.remove();
  try {
   const tokenResponse = await fetch('/api/auth/token', {cache:'no-store'});
   if (!tokenResponse.ok) throw new Error();
   const {token} = await tokenResponse.json();
   const response = await fetch('/api/auth/logout', {method:'POST',headers:{'X-CSRF-TOKEN':token}});
   if (!response.ok && response.status !== 401) throw new Error();
   location.href='/corporativo/';
  } catch {
   const error=document.createElement('p');error.id='session-error';error.className='session-error';error.setAttribute('role','alert');error.textContent='No se pudo cerrar la sesión. Intenta de nuevo.';document.querySelector('.topbar').after(error);
   link.textContent=label;link.removeAttribute('aria-disabled');leaving=false;
  }
 }));
})();
