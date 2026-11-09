const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const code = readFileSync(require('node:path').join(__dirname, '../src/components/carga/carga.js'), 'utf8');

function entorno(conObservador = false) {
  const ids = Object.fromEntries(['carga-inicial', 'carga-progreso', 'carga-porcentaje', 'carga-estado', 'carga-reintentar'].map(id => [id, { hidden: true, addEventListener(event, fn) { this[event] = fn; } }]));
  const clases = new Set();
  const contenido = { tagName: 'MAIN', inert: false };
  const clasesSeccion = new Set();
  const seccion = { classList: { add: x => clasesSeccion.add(x), remove: x => clasesSeccion.delete(x) } };
  const selectores = [];
  const pendientes = new Map();
  let iniciar;
  const contexto = {
    document: {
      readyState: 'loading', baseURI: 'https://example.test/',
      documentElement: { classList: { add: x => clases.add(x), remove: x => clases.delete(x) } },
      body: { children: [ids['carga-inicial'], contenido] },
      getElementById: id => ids[id],
      querySelectorAll: selector => {
        selectores.push(selector);
        if (selector === '.academia-video, .pista') return [seccion];
        if (selector === '.hero img') return [{ src: 'https://example.test/desktop.webp', currentSrc: 'https://example.test/mobile.webp' }];
        if (selector === '.hero, .hero *') return [contenido];
        throw new Error('No deben solicitarse imágenes del resto de la página');
      },
      addEventListener: (event, fn) => { iniciar = fn; }
    },
    getComputedStyle: (el, pseudo) => ({ display: 'block', content: pseudo ? 'none' : 'normal', backgroundImage: 'url("https://example.test/background.webp")' }),
    Image: class { decode() { return new Promise((resolve, reject) => pendientes.set(this.src, { resolve, reject })); } },
    window: {}, URL, requestAnimationFrame: fn => fn(), location: { reload() { contexto.recargado = true; } }
  };
  if (conObservador) {
    contexto.IntersectionObserver = class {
      constructor(fn) { contexto.interseccion = fn; }
      observe(el) { contexto.observado = el; }
      unobserve(el) { contexto.desobservado = el; }
    };
    contexto.window.IntersectionObserver = contexto.IntersectionObserver;
  }
  vm.runInNewContext(code, contexto);
  return { ids, clases, contenido, pendientes, iniciar: () => iniciar(), contexto, clasesSeccion, seccion, selectores };
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
  assert.equal(e.clasesSeccion.has('carga-diferida'), false);
});

test('el aula no bloquea la portada y su fondo se activa solo al acercarse', async () => {
  const e = entorno(true);
  const terminado = e.iniciar();
  assert.ok(e.clasesSeccion.has('carga-diferida'));
  for (const pendiente of e.pendientes.values()) pendiente.resolve();
  await terminado;
  assert.equal(e.ids['carga-inicial'].hidden, true);
  assert.ok(e.clasesSeccion.has('carga-diferida'));
  assert.equal(e.contexto.observado, e.seccion);
  e.contexto.interseccion([{ target: e.seccion, isIntersecting: false }]);
  assert.ok(e.clasesSeccion.has('carga-diferida'));
  e.contexto.interseccion([{ target: e.seccion, isIntersecting: true }]);
  assert.equal(e.clasesSeccion.has('carga-diferida'), false);
  assert.equal(e.contexto.desobservado, e.seccion);
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

