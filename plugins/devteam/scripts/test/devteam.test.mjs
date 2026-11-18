// Pruebas de devteam.mjs. Ejecutar con: node --test plugins/devteam/scripts/test/devteam.test.mjs
// Los proyectos de ejemplo son inventados: el repositorio es publico.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  main, parsearCabecera, serializarCabecera, validarSpec, traducirEstado, slugDeCelda,
  leerIndiceAnterior, planearMigracion, comprobarTarea, estadoProyecto, revisarProyecto,
  textoInicio, MARCA_INDICE, hoy,
} from '../devteam.mjs';

function proyecto(archivos = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'devteam-test-'));
  fs.mkdirSync(path.join(root, '.devteam', 'tasks'), { recursive: true });
  for (const [rel, contenido] of Object.entries(archivos)) {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, contenido);
  }
  return root;
}

async function cli(root, ...argv) {
  let out = '';
  let err = '';
  const codigo = await main(['--root', root, ...argv], { out: (s) => { out += s; }, err: (s) => { err += s; } }, {});
  return { codigo, out, err };
}

const leer = (root, rel) => fs.readFileSync(path.join(root, rel), 'utf8');

// ---------------------------------------------------------------- cabecera

test('parsea y vuelve a escribir la cabecera sin perder nada', () => {
  const texto = [
    '---',
    'slug: pago-tarjeta',
    'titulo: "Pago: con tarjeta"   # comentario',
    'estado: parcial',
    'depende: [cobro-base, "con, coma"]',
    'cerrada:',
    'verificacion:',
    '  pruebas: ok',
    '  e2e: pendiente',
    'falta: probar en el telefono',
    '---',
    '',
    '# Pago',
    'cuerpo',
  ].join('\n');
  const { data, body, errores } = parsearCabecera(texto);
  assert.deepEqual(errores, []);
  assert.equal(data.titulo, 'Pago: con tarjeta');
  assert.deepEqual(data.depende, ['cobro-base', 'con, coma']);
  assert.equal(data.cerrada, '');
  assert.deepEqual(data.verificacion, { pruebas: 'ok', e2e: 'pendiente' });
  assert.equal(body, '# Pago\ncuerpo');
  const otra = parsearCabecera(serializarCabecera(data) + '\n' + body);
  assert.deepEqual(otra.data, data);
});

test('sin cabecera devuelve data null y conserva el cuerpo', () => {
  const r = parsearCabecera('# viejo\ntexto');
  assert.equal(r.data, null);
  assert.equal(r.body, '# viejo\ntexto');
});

test('acepta finales de linea de Windows', () => {
  const r = parsearCabecera('---\r\nslug: a-b\r\nestado: pendiente\r\n---\r\ncuerpo\r\n');
  assert.equal(r.data.slug, 'a-b');
});

test('validarSpec detecta valores fuera de lista y slug distinto', () => {
  const e = validarSpec({ slug: 'otro', estado: 'hecha', nivel: 'enorme', verificacion: { e2e: 'quizas' }, creada: '18/11/2026' }, 'mi-tarea');
  assert.ok(e.some((x) => x.includes('no coincide')));
  assert.ok(e.some((x) => x.startsWith('estado')));
  assert.ok(e.some((x) => x.startsWith('nivel')));
  assert.ok(e.some((x) => x.startsWith('verificacion.e2e')));
  assert.ok(e.some((x) => x.startsWith('creada')));
});

// ---------------------------------------------------------------- new, set, index

test('new crea el spec con cabecera valida y regenera el indice', async () => {
  const root = proyecto();
  const r = await cli(root, 'new', 'exportar-pdf', '--titulo', 'Exportar facturas a PDF', '--origen', 'plan 2026-11-18', '--nivel', 'estandar', '--gravedad', 'alta', '--pantallas', 'si');
  assert.equal(r.codigo, 0, r.err);
  const { data } = parsearCabecera(leer(root, '.devteam/tasks/exportar-pdf/spec.md'));
  assert.equal(data.estado, 'pendiente');
  assert.equal(data.verificacion.e2e, 'pendiente');
  assert.equal(data.creada, hoy());
  const indice = leer(root, '.devteam/tasks/index.md');
  assert.ok(indice.startsWith(MARCA_INDICE));
  assert.match(indice, /\[exportar-pdf\]\(exportar-pdf\/spec\.md\) — Exportar facturas a PDF \| alta \| estandar \| — \| pendiente \|/);
});

test('new rechaza un slug que ya tiene cabecera y adopta uno sin cabecera', async () => {
  const root = proyecto({ '.devteam/tasks/vieja-tarea/spec.md': '# vieja\n\ncuerpo original\n' });
  assert.equal((await cli(root, 'new', 'vieja-tarea')).codigo, 0);
  assert.match(leer(root, '.devteam/tasks/vieja-tarea/spec.md'), /cuerpo original/);
  assert.equal((await cli(root, 'new', 'vieja-tarea')).codigo, 1);
});

test('set cambia campos anidados, fija la fecha de cierre y valida', async () => {
  const root = proyecto();
  await cli(root, 'new', 'a-b');
  assert.equal((await cli(root, 'set', 'a-b', 'estado=cerrada', 'verificacion.pruebas=ok', 'depende=x-y,z-w')).codigo, 0);
  const { data } = parsearCabecera(leer(root, '.devteam/tasks/a-b/spec.md'));
  assert.equal(data.cerrada, hoy());
  assert.equal(data.verificacion.pruebas, 'ok');
  assert.deepEqual(data.depende, ['x-y', 'z-w']);
  const mal = await cli(root, 'set', 'a-b', 'estado=terminadisima');
  assert.equal(mal.codigo, 1);
  assert.match(mal.err, /estado/);
});

test('index se niega a pisar un indice del formato anterior', async () => {
  const root = proyecto({ '.devteam/tasks/index.md': '| Fecha | Tarea | Estado |\n|---|---|---|\n| 2026-10-01 | x-y | cerrada |\n' });
  const r = await cli(root, 'index');
  assert.equal(r.codigo, 2);
  assert.match(leer(root, '.devteam/tasks/index.md'), /x-y/);
});

// ---------------------------------------------------------------- check

async function tareaCerrable(root, slug, extra = []) {
  await cli(root, 'new', slug);
  fs.writeFileSync(path.join(root, '.devteam/tasks', slug, 'log.md'), 'Hecho.\nEntorno de pruebas usado: ninguno\n');
  await cli(root, 'set', slug, 'estado=cerrada', 'verificacion.pruebas=ok', ...extra);
}

test('check deja cerrar una tarea completa fuera de git', async () => {
  const root = proyecto();
  await tareaCerrable(root, 'tarea-ok');
  const r = comprobarTarea(root, 'tarea-ok');
  assert.ok(r.ok, r.errores.join('\n'));
});

test('check bloquea pantallas sin e2e, parcial sin falta y log sin entorno', async () => {
  const root = proyecto();
  await cli(root, 'new', 'con-pantalla', '--pantallas', 'si');
  fs.writeFileSync(path.join(root, '.devteam/tasks/con-pantalla/log.md'), 'Hecho.\n');
  await cli(root, 'set', 'con-pantalla', 'estado=cerrada', 'verificacion.pruebas=ok');
  const r = comprobarTarea(root, 'con-pantalla');
  assert.equal(r.ok, false);
  assert.ok(r.errores.some((e) => e.includes('e2e')));
  assert.ok(r.errores.some((e) => e.includes('entorno')));

  await cli(root, 'new', 'a-medias');
  fs.writeFileSync(path.join(root, '.devteam/tasks/a-medias/log.md'), 'Entorno de pruebas usado: ninguno\n');
  await cli(root, 'set', 'a-medias', 'estado=parcial');
  assert.ok(comprobarTarea(root, 'a-medias').errores.some((e) => e.includes('sin falta')));
});

test('check detecta el indice desactualizado', async () => {
  const root = proyecto();
  await tareaCerrable(root, 'tarea-ok');
  const p = path.join(root, '.devteam/tasks/index.md');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('| cerrada |', '| pendiente |'));
  assert.ok(comprobarTarea(root, 'tarea-ok').errores.some((e) => e.includes('indice')));
});

test('check exige un commit que exista cuando hay git', async (t) => {
  if (spawnSync('git', ['--version']).status !== 0) return t.skip('git no disponible');
  const root = proyecto({ 'a.txt': 'x' });
  const git = (...a) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: root, encoding: 'utf8' });
  git('init', '-q');
  git('add', 'a.txt');
  git('commit', '-qm', 'inicial');
  const hash = git('rev-parse', '--short', 'HEAD').stdout.trim();
  await tareaCerrable(root, 'con-git');
  assert.ok(comprobarTarea(root, 'con-git').errores.some((e) => e.includes('sin commit')));
  await cli(root, 'set', 'con-git', 'commit=deadbe1');
  assert.ok(comprobarTarea(root, 'con-git').errores.some((e) => e.includes('no existe')));
  await cli(root, 'set', 'con-git', `commit=${hash}`);
  assert.ok(comprobarTarea(root, 'con-git').ok);
});

test('begin y end marcan y cierran la tarea en curso', async () => {
  const root = proyecto();
  await cli(root, 'new', 'en-marcha');
  await main(['--root', root, 'begin', 'en-marcha'], { out: () => {}, err: () => {} }, { CLAUDE_CODE_SESSION_ID: 'sesion-1' });
  const marca = JSON.parse(leer(root, '.devteam/tasks/en-marcha/.activa'));
  assert.equal(marca.session_id, 'sesion-1');
  assert.equal((await cli(root, 'end', 'en-marcha')).codigo, 1, 'sigue en curso: no puede cerrarse');
  fs.writeFileSync(path.join(root, '.devteam/tasks/en-marcha/log.md'), 'Entorno de pruebas usado: ninguno\n');
  await cli(root, 'set', 'en-marcha', 'estado=cerrada', 'verificacion.pruebas=ok');
  assert.equal((await cli(root, 'end', 'en-marcha')).codigo, 0);
  assert.equal(fs.existsSync(path.join(root, '.devteam/tasks/en-marcha/.activa')), false);
});

// ---------------------------------------------------------------- run

test('run guarda la salida y conserva el codigo de salida', async () => {
  const root = proyecto();
  await cli(root, 'new', 'con-pruebas');
  const bien = await cli(root, 'run', 'con-pruebas', 'unitarias', '--', 'node -e "console.log(\'12 passed\')"');
  assert.equal(bien.codigo, 0);
  assert.match(bien.out, /unitarias: OK/);
  assert.match(leer(root, '.devteam/tasks/con-pruebas/logs/unitarias.log'), /12 passed/);
  const mal = await cli(root, 'run', 'con-pruebas', 'e2e', '--', 'node -e "console.error(\'Error: boton roto\'); process.exit(3)"');
  assert.equal(mal.codigo, 3);
  assert.match(mal.out, /FALLO \(codigo 3\)/);
  assert.match(mal.out, /boton roto/);
});

// ---------------------------------------------------------------- estado, lint e inicio

test('status ordena pendientes por gravedad y marca los viejos', async () => {
  const root = proyecto();
  await cli(root, 'new', 'baja-x', '--gravedad', 'baja');
  await cli(root, 'new', 'alta-y', '--gravedad', 'alta');
  await cli(root, 'set', 'baja-x', 'creada=2026-01-01');
  const e = estadoProyecto(root, new Date(2026, 10, 18));
  assert.deepEqual(e.pendientes.map((p) => p.slug), ['alta-y', 'baja-x']);
  assert.equal(e.pendientes[1].revalidar, true);
});

test('lint avisa de fichas largas y archivos sueltos', () => {
  const trampas = Array.from({ length: 30 }, (_, i) => `- trampa ${i}`).join('\n');
  const root = proyecto({
    '.devteam/context.md': `---\nmodo_consumo: equilibrado\n---\n# Ficha\n\n## Trampas conocidas\n${trampas}\n`,
    '.devteam/run_up.log': 'x',
  });
  const r = revisarProyecto(root);
  assert.ok(r.avisos.some((a) => a.includes('Trampas')));
  assert.ok(r.avisos.some((a) => a.includes('run_up.log')));
});

test('el texto de inicio resume y avisa del formato anterior', async () => {
  const root = proyecto({
    '.devteam/context.md': '# Ficha\n\n## Modo de consumo\neconomico\n\n## Entorno de pruebas\nContenedor demo-pg con el dump de backups/.\n',
    '.devteam/tasks/vieja-sin-cabecera/spec.md': '# vieja\n',
  });
  const t = textoInicio(root, '/ruta/devteam.mjs');
  assert.match(t, /Herramienta: node "\/ruta\/devteam\.mjs"/);
  assert.match(t, /Modo de consumo: economico/);
  assert.match(t, /demo-pg/);
  assert.match(t, /Formato anterior/);
  assert.ok(t.split('\n').length <= 40);
});

test('el hook de inicio no hace nada fuera de un proyecto con .devteam', async () => {
  const fuera = fs.mkdtempSync(path.join(os.tmpdir(), 'sin-devteam-'));
  const r = spawnSync(process.execPath, [path.join(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname), '..', 'devteam.mjs'), 'hook', 'session-start'], { input: JSON.stringify({ cwd: fuera }), encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

// ---------------------------------------------------------------- migracion

test('traducirEstado es conservador', () => {
  assert.deepEqual(traducirEstado('cerrada'), { estado: 'cerrada', falta: '', dudoso: false });
  assert.equal(traducirEstado('cerrada (sin prueba visual en navegador)').estado, 'parcial');
  assert.equal(traducirEstado('cerrada (sin prueba visual en navegador)').falta, 'sin prueba visual en navegador');
  assert.equal(traducirEstado('cerrada (1203 OK); despliegue manual a cargo del usuario').estado, 'cerrada');
  assert.equal(traducirEstado('cerrada; sin commitear').estado, 'cerrada');
  assert.equal(traducirEstado('**hecha** (integrada en main)').estado, 'cerrada');
  assert.equal(traducirEstado('cerrada 2026-10-13 (rama fix/x, sin commit; sin prueba en navegador)').falta, 'rama fix/x, sin commit; sin prueba en navegador');
  assert.equal(traducirEstado('cerrada; falta UI de configuracion').estado, 'parcial');
  assert.deepEqual(traducirEstado('cerrada (codigo listo); pendiente de desplegar'), { estado: 'cerrada', falta: 'codigo listo); pendiente de desplegar', dudoso: false });
  assert.equal(traducirEstado('cerrada; falta desplegar y probar en telefono').estado, 'parcial');
  assert.equal(traducirEstado('parcial: falta probar en telefono').falta, 'falta probar en telefono');
  assert.equal(traducirEstado('bloqueada: decision legal').estado, 'bloqueada');
  assert.equal(traducirEstado('pendiente (auditoria 2026-09-21)').estado, 'pendiente');
  assert.equal(traducirEstado('corrida hecha').dudoso, true);
});

test('slugDeCelda reconoce enlaces, codigo y texto', () => {
  assert.equal(slugDeCelda('[pago-tarjeta](pago-tarjeta/spec.md)'), 'pago-tarjeta');
  assert.equal(slugDeCelda('`limpieza-deps`'), 'limpieza-deps');
  assert.equal(slugDeCelda('errores-api-2026-11-06 — se cayo el worker'), 'errores-api-2026-11-06');
});

test('lee indices anteriores con columnas distintas', () => {
  const filas = leerIndiceAnterior([
    '# Indice', '',
    '| Fecha | Tarea / evento | Gravedad | Esfuerzo | Depende de | Estado |',
    '|---|---|---|---|---|---|',
    '| 2026-10-27 | [mapa-zonas](mapa-zonas/spec.md) | — | estándar | zonas-backend | parcial: falta build nativo |',
  ].join('\n'));
  assert.equal(filas.length, 1);
  assert.equal(filas[0].nivel, 'estándar');
  assert.equal(filas[0].depende, 'zonas-backend');
});

function proyectoAnterior() {
  return proyecto({
    '.devteam/context.md': '# Ficha\n\n## Modo de consumo\nequilibrado\n\n## Datos sensibles\nHistorias clinicas.\n',
    '.devteam/tasks/index.md': [
      '# Indice de tareas', '',
      '| Fecha | Tarea | Resumen | Estado |',
      '|---|---|---|---|',
      '| 2026-11-17 | menu-recortado | Menu del buscador recortado en la tabla | cerrada |',
      '| 2026-11-14 | aviso-cobertura | Modal de cobertura sin traza | cerrada (sin prueba visual en navegador) |',
      '| 2026-11-10 | cita-atomica | El check-in no era atomico | parcial: faltan citas huerfanas |',
      '| 2026-11-09 | evento-sin-carpeta | Caida del worker nocturno | cerrada (`a1b2c3d`) |',
      '| 2026-11-08 | Una fila sin slug | algo | cerrada |',
      '| 2026-11-01 | revisar-permisos | Permisos de la auditoria | pendiente (auditoria 2026-11-01) |',
    ].join('\n'),
    '.devteam/tasks/menu-recortado/spec.md': '# menu-recortado\n\ncuerpo\n',
    '.devteam/tasks/aviso-cobertura/spec.md': '# aviso\n',
    '.devteam/tasks/cita-atomica/spec.md': '# cita\n',
    '.devteam/tasks/cita-atomica/log.md': 'log\n',
    '.devteam/tasks/revisar-permisos/spec.md': '# permisos\n',
    '.devteam/tasks/huerfana-con-log/spec.md': '# huerfana\n',
    '.devteam/tasks/huerfana-con-log/log.md': 'se trabajo\n',
  });
}

test('el simulacro de migracion no cambia nada y traduce bien', () => {
  const root = proyectoAnterior();
  const antes = leer(root, '.devteam/tasks/index.md');
  const plan = planearMigracion(root);
  assert.equal(leer(root, '.devteam/tasks/index.md'), antes);
  const por = Object.fromEntries(plan.acciones.map((a) => [a.slug, a]));
  assert.equal(por['menu-recortado'].data.estado, 'cerrada');
  assert.equal(por['aviso-cobertura'].data.estado, 'parcial');
  assert.equal(por['aviso-cobertura'].data.verificacion.e2e, 'pendiente');
  assert.equal(por['cita-atomica'].data.estado, 'parcial');
  assert.equal(por['revisar-permisos'].data.origen, 'audit 2026-11-01');
  assert.equal(por['evento-sin-carpeta'].tipo, 'crear');
  assert.equal(por['evento-sin-carpeta'].data.commit, 'a1b2c3d');
  assert.equal(por['huerfana-con-log'].data.estado, 'parcial');
  assert.equal(plan.noInterpretadas.length, 1);
  assert.equal(plan.fichaNueva.modo_consumo, 'equilibrado');
  assert.equal(plan.fichaNueva.datos_sensibles, 'si');
});

test('migrate --apply convierte, conserva cuerpos y el indice anterior', async () => {
  const root = proyectoAnterior();
  const r = await cli(root, 'migrate', '--apply');
  assert.equal(r.codigo, 0, r.err);
  assert.match(leer(root, '.devteam/tasks/menu-recortado/spec.md'), /^---\nslug: menu-recortado[\s\S]*\ncuerpo\n/);
  assert.match(leer(root, '.devteam/tasks/index-anterior.md'), /Una fila sin slug/);
  assert.ok(leer(root, '.devteam/tasks/index.md').startsWith(MARCA_INDICE));
  assert.match(leer(root, '.devteam/tasks/evento-sin-carpeta/spec.md'), /Fila original/);
  assert.match(leer(root, '.devteam/context.md'), /^---\nmodo_consumo: equilibrado/);
  assert.equal(revisarProyecto(root).errores.length, 0, revisarProyecto(root).errores.join('\n'));
  assert.equal((await cli(root, 'migrate')).out.trim(), 'nada que migrar: el proyecto ya usa el formato estructurado');
});

test('migra indices sin cabecera de tabla y carpetas sin spec.md', () => {
  const root = proyecto({
    '.devteam/tasks/index.md': '| 2026-10-27 | usuarios-inactivos | Usuarios inactivos fuera de agendas | parcial |\n| 2026-10-11 | deploy-pull | El despliegue descarga main | cerrada |\n',
    '.devteam/tasks/usuarios-inactivos/log.md': 'log\n',
    '.devteam/tasks/deploy-pull/log.md': 'log\n',
    '.devteam/tasks/solo-con-log/log.md': 'log\n',
  });
  const plan = planearMigracion(root);
  const por = Object.fromEntries(plan.acciones.map((a) => [a.slug, a]));
  assert.equal(por['usuarios-inactivos'].data.estado, 'parcial');
  assert.equal(por['deploy-pull'].data.estado, 'cerrada');
  assert.equal(por['solo-con-log'].data.estado, 'parcial');
  assert.equal(plan.acciones.length, 3);
});
