const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const code = readFileSync(require('node:path').join(__dirname, '../src/components/carga/carga.js'), 'utf8');

function entorno() {
  const ids = Object.fromEntries(['carga-inicial', 'carga-progreso', 'carga-porcentaje', 'carga-estado', 'carga-reintentar'].map(id => [id, { hidden: true, addEventListener(event, fn) { this[event] = fn; } }]));
  const clases = new Set();
  const contenido = { tagName: 'MAIN', inert: false };
  const pendientes = new Map();
  let iniciar;
  const contexto = {
    document: {
      readyState: 'loading', baseURI: 'https://example.test/',
      documentElement: { classList: { add: x => clases.add(x), remove: x => clases.delete(x) } },
      body: { children: [ids['carga-inicial'], contenido] },
      getElementById: id => ids[id],
      querySelectorAll: selector => selector === 'img'
        ? [{ src: 'https://example.test/desktop.webp', currentSrc: 'https://example.test/mobile.webp' }]
        : [contenido],
      addEventListener: (event, fn) => { iniciar = fn; }
    },
    getComputedStyle: (el, pseudo) => ({ display: 'block', content: pseudo ? 'none' : 'normal', backgroundImage: 'url("https://example.test/background.webp")' }),
    Image: class { decode() { return new Promise((resolve, reject) => pendientes.set(this.src, { resolve, reject })); } },
    URL, requestAnimationFrame: fn => fn(), location: { reload() { contexto.recargado = true; } }
  };
  vm.runInNewContext(code, contexto);
  return { ids, clases, contenido, pendientes, iniciar: () => iniciar(), contexto };
}

test('oculta desde el inicio y revela solo tras decodificar la imagen responsive y el fondo', async () => {
  const e = entorno();
  assert.ok(e.clases.has('cargando'));
  assert.equal(e.ids['carga-inicial'].hidden, false);
  const terminado = e.iniciar();
  assert.equal(e.contenido.inert, true);
  assert.deepEqual([...e.pendientes.keys()], ['https://example.test/mobile.webp', 'https://example.test/background.webp']);
  e.pendientes.get('https://example.test/mobile.webp').resolve();
  await new Promise(setImmediate);
  assert.equal(e.ids['carga-progreso'].value, 50);
  assert.ok(e.clases.has('cargando'));
  e.pendientes.get('https://example.test/background.webp').resolve();
  await terminado;
  assert.equal(e.ids['carga-progreso'].value, 100);
  assert.equal(e.ids['carga-inicial'].hidden, true);
  assert.equal(e.contenido.inert, false);
  assert.equal(e.clases.has('cargando'), false);
});

test('una imagen fallida mantiene la pantalla y permite reintentar', async () => {
  const e = entorno();
  const terminado = e.iniciar();
  e.pendientes.get('https://example.test/mobile.webp').reject(new Error('imagen no disponible'));
  e.pendientes.get('https://example.test/background.webp').resolve();
  await terminado;
  assert.ok(e.clases.has('cargando'));
  assert.equal(e.ids['carga-reintentar'].hidden, false);
  e.ids['carga-reintentar'].click();
  assert.equal(e.contexto.recargado, true);
});

