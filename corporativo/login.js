const password = document.querySelector('#password');
document.querySelector('.password-toggle').addEventListener('click', event => {
  const visible = password.type === 'password';
  password.type = visible ? 'text' : 'password';
  event.currentTarget.textContent = visible ? 'Ocultar' : 'Mostrar';
  event.currentTarget.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
});
document.querySelector('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const error = document.querySelector('#login-error');
  const button = document.querySelector('.login-submit');
  error.hidden = true;
  button.disabled = true;
  try {
    const tokenResponse = await fetch('/api/auth/token', { cache: 'no-store' });
    if (!tokenResponse.ok) throw new Error('No se pudo conectar. Vuelve a intentarlo.');
    const { token } = await tokenResponse.json();
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token }, body: JSON.stringify({ email: document.querySelector('#email').value.trim(), password: password.value }) });
    if (response.status === 429) throw new Error('Demasiados intentos. Espera un minuto y vuelve a intentarlo.');
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'No se pudo iniciar sesión.');
    location.href = result.redirect;
  } catch (failure) {
    error.textContent = failure.message || 'No se pudo iniciar sesión.';
    error.hidden = false;
  } finally { password.value = ''; button.disabled = false; }
});
