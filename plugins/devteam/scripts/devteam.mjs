#!/usr/bin/env node
// devteam: la parte del plugin que se ejecuta como codigo y no como instruccion.
// Lee y escribe el estado estructurado de .devteam/ (cabeceras de spec.md, indice
// generado) y atiende los hooks de Claude Code. Node >= 18, un archivo, sin dependencias.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ESTADOS = ['pendiente', 'en-curso', 'cerrada', 'parcial', 'bloqueada', 'abandonada'];
export const NIVELES = ['ligero', 'estandar', 'completo'];
export const GRAVEDADES = ['critica', 'alta', 'media', 'baja', '-'];
const SI_NO = ['si', 'no'];
const VALORES_VERIFICACION = {
  pruebas: ['ok', 'fallo', 'no-ejecutadas', 'desconocido'],
  e2e: ['ok', 'pendiente', 'no-aplica', 'desconocido'],
  dispositivo: ['ok', 'pendiente', 'no-aplica', 'desconocido'],
};
const ORDEN_CLAVES = ['slug', 'titulo', 'estado', 'nivel', 'origen', 'gravedad', 'depende', 'creada',
  'cerrada', 'rama', 'commit', 'toca_pantallas', 'verificacion', 'entorno', 'falta'];
const ORDEN_FICHA = ['modo_consumo', 'datos_prueba', 'prefijo_contenedores', 'hosts_produccion', 'datos_sensibles'];
const MODOS = ['economico', 'equilibrado', 'maximo'];
const DATOS_PRUEBA = ['copia-produccion', 'sinteticos'];
const RANGO_GRAVEDAD = { critica: 0, alta: 1, media: 2, baja: 3, '-': 4, '': 5 };
export const DIAS_CADUCIDAD = 21;
const DIAS_REANUDAR = 7;
export const LIMITES = { trampas: 25, lecciones: 20, lineas: 150 };
export const MARCA_INDICE = '<!-- generado por devteam index: no editar a mano; el estado vive en la cabecera de cada spec.md -->';
const PERMITIDOS_RAIZ = new Set(['context.md', 'decisions.md', 'decisions-historico.md', 'tasks', 'audits',
  'runs', 'uitest', 'plans', 'spec', 'redesign', 'ref']);

// ---------------------------------------------------------------- utilidades

export function hoy(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function diasDesde(fecha, ahora = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) return null;
  const [y, m, d] = fecha.split('-').map(Number);
  const desde = new Date(y, m - 1, d);
  const hasta = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  return Math.round((hasta - desde) / 86400000);
}

const sinAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const normalizar = (s) => sinAcentos(s).toLowerCase().trim();
const leer = (p) => fs.readFileSync(p, 'utf8').replace(/^﻿/, '');
const quitarAnsi = (s) => s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');

// ---------------------------------------------------------------- cabecera YAML restringida
// Solo admite "clave: valor", listas "[a, b]" y un nivel de anidado. Es a proposito:
// un formato pequeno que un script puede validar sin dependencias.

function quitarComentario(s) {
  let comilla = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (comilla) { if (c === comilla) comilla = null; continue; }
    if (c === '"' || c === "'") { comilla = c; continue; }
    if (c === '#' && (i === 0 || s[i - 1] === ' ' || s[i - 1] === '\t')) return s.slice(0, i).trim();
  }
  return s.trim();
}

function sinComillas(s) {
  const t = s.trim();
  if (t.length >= 2 && ((t[0] === '"' && t.at(-1) === '"') || (t[0] === "'" && t.at(-1) === "'"))) return t.slice(1, -1);
  return t;
}

function partirLista(s) {
  const items = [];
  let actual = '';
  let comilla = null;
  for (const c of s) {
    if (comilla) { if (c === comilla) comilla = null; actual += c; continue; }
    if (c === '"' || c === "'") { comilla = c; actual += c; continue; }
    if (c === ',') { items.push(actual); actual = ''; continue; }
    actual += c;
  }
  items.push(actual);
  return items.map(sinComillas).map((x) => x.trim()).filter(Boolean);
}

function leerValor(s) {
  const t = s.trim();
  if (t.startsWith('[') && t.endsWith(']')) return partirLista(t.slice(1, -1));
  return sinComillas(t);
}

export function parsearCabecera(texto) {
  const t = String(texto).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  if (!t.startsWith('---\n')) return { data: null, body: t, errores: [] };
  const lineas = t.split('\n');
  let fin = -1;
  for (let i = 1; i < lineas.length; i++) if (lineas[i].trim() === '---') { fin = i; break; }
  if (fin < 0) return { data: null, body: t, errores: ['cabecera sin cerrar: falta la linea ---'] };
  const data = {};
  const errores = [];
  let padre = null;
  for (let i = 1; i < fin; i++) {
    const raw = lineas[i];
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const m = raw.match(/^(\s*)([A-Za-z_][\w-]*)\s*:(?:[ \t]+(.*)|[ \t]*)$/);
    if (!m) { errores.push(`linea ${i + 1}: se esperaba "clave: valor"`); continue; }
    const [, sangria, clave, resto = ''] = m;
    const limpio = quitarComentario(resto);
    if (sangria.length === 0) {
      data[clave] = leerValor(limpio);
      padre = limpio === '' ? clave : null;
    } else if (padre) {
      if (typeof data[padre] !== 'object' || Array.isArray(data[padre])) data[padre] = {};
      data[padre][clave] = leerValor(limpio);
    } else {
      errores.push(`linea ${i + 1}: "${clave}" esta sangrada sin una clave padre`);
    }
  }
  const body = lineas.slice(fin + 1).join('\n').replace(/^\n+/, '');
  return { data, body, errores };
}

function citar(s, enLista = false) {
  if (s === '') return '';
  const necesita = /^[\s"'[#]|\s$|: | #/.test(s) || (enLista && /[,\]]/.test(s));
  if (!necesita) return s;
  if (!s.includes('"')) return `"${s}"`;
  if (!s.includes("'")) return `'${s}'`;
  return `"${s.replace(/"/g, '”')}"`;
}

function escribirValor(v) {
  if (Array.isArray(v)) return `[${v.map((x) => citar(String(x), true)).join(', ')}]`;
  return citar(v == null ? '' : String(v));
}

export function serializarCabecera(data, orden = ORDEN_CLAVES) {
  const claves = [...orden.filter((k) => k in data), ...Object.keys(data).filter((k) => !orden.includes(k))];
  const out = ['---'];
  for (const k of claves) {
    const v = data[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(`${k}:`);
      const sub = [...Object.keys(VALORES_VERIFICACION).filter((s) => s in v), ...Object.keys(v).filter((s) => !(s in VALORES_VERIFICACION))];
      for (const s of sub) out.push(`  ${s}: ${escribirValor(v[s])}`.trimEnd());
    } else {
      out.push(`${k}: ${escribirValor(v)}`.trimEnd());
    }
  }
  out.push('---');
  return out.join('\n') + '\n';
}

export function validarSpec(data, carpeta) {
  const e = [];
  const enLista = (clave, lista) => {
    const v = data[clave];
    if (v !== undefined && v !== '' && !lista.includes(v)) e.push(`${clave} "${v}" no valido (${lista.join(', ')})`);
  };
  if (!data.slug) e.push('falta slug');
  else if (carpeta && data.slug !== carpeta) e.push(`slug "${data.slug}" no coincide con la carpeta "${carpeta}"`);
  if (!ESTADOS.includes(data.estado)) e.push(`estado "${data.estado ?? ''}" no valido (${ESTADOS.join(', ')})`);
  enLista('nivel', NIVELES);
  enLista('gravedad', GRAVEDADES);
  enLista('toca_pantallas', SI_NO);
  for (const f of ['creada', 'cerrada']) {
    if (data[f] && !/^\d{4}-\d{2}-\d{2}$/.test(data[f])) e.push(`${f} "${data[f]}" no tiene formato AAAA-MM-DD`);
  }
  if (data.depende !== undefined && data.depende !== '' && !Array.isArray(data.depende)) e.push('depende debe ser una lista: [a, b]');
  const v = data.verificacion;
  if (v !== undefined && v !== '') {
    if (typeof v !== 'object' || Array.isArray(v)) e.push('verificacion debe tener subclaves: pruebas, e2e, dispositivo');
    else for (const [k, val] of Object.entries(v)) {
      const lista = VALORES_VERIFICACION[k];
      if (lista && val !== '' && !lista.includes(val)) e.push(`verificacion.${k} "${val}" no valido (${lista.join(', ')})`);
    }
  }
  return e;
}

// ---------------------------------------------------------------- proyecto

export function buscarRaiz(desde = process.cwd()) {
  let d = path.resolve(desde);
  for (;;) {
    const c = path.join(d, '.devteam');
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) return d;
    const p = path.dirname(d);
    if (p === d) return null;
    d = p;
  }
}

const dirTareas = (root) => path.join(root, '.devteam', 'tasks');
const rutaIndice = (root) => path.join(dirTareas(root), 'index.md');

export function cargarTareas(root) {
  const dir = dirTareas(root);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const spec = path.join(dir, d.name, 'spec.md');
      if (!fs.existsSync(spec)) return null;
      const { data, body, errores } = parsearCabecera(leer(spec));
      return {
        slug: d.name, dir: path.join(dir, d.name), spec, data, body, antiguo: !data,
        errores: data ? [...errores, ...validarSpec(data, d.name)] : errores,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function indiceGenerado(root) {
  const p = rutaIndice(root);
  if (!fs.existsSync(p)) return null;
  return leer(p).startsWith(MARCA_INDICE);
}

export function leerFicha(root) {
  const p = path.join(root, '.devteam', 'context.md');
  if (!fs.existsSync(p)) return { existe: false, data: {}, texto: '' };
  const texto = leer(p);
  const { data, body, errores } = parsearCabecera(texto);
  const ficha = { existe: true, tieneCabecera: !!data, data: data || {}, texto: body, errores };
  if (!ficha.data.modo_consumo) {
    const modo = seccion(body, /^modo de consumo/).find((l) => l.trim());
    const m = modo && normalizar(modo).match(/economico|equilibrado|maximo/);
    if (m) ficha.data.modo_consumo = m[0];
  }
  return ficha;
}

export function seccion(texto, re) {
  const lineas = String(texto).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let dentro = false;
  for (const l of lineas) {
    if (/^## /.test(l)) { dentro = re.test(normalizar(l.slice(3))); continue; }
    if (dentro) out.push(l);
  }
  return out;
}

const contarEntradas = (lineas) => lineas.filter((l) => /^(-|\*|\d+\.)\s/.test(l)).length;

// ---------------------------------------------------------------- indice

const celda = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim() || '—';

export function generarIndice(tareas) {
  const filas = tareas.map((t) => {
    const d = t.data || {};
    return { slug: t.slug, d, antiguo: t.antiguo, fecha: d.cerrada || d.creada || '' };
  }).sort((a, b) => b.fecha.localeCompare(a.fecha) || a.slug.localeCompare(b.slug));
  const out = [MARCA_INDICE, '# Indice de tareas', '',
    '| Fecha | Tarea | Gravedad | Nivel | Depende de | Estado | Falta |',
    '|---|---|---|---|---|---|---|'];
  for (const f of filas) {
    const d = f.d;
    const tarea = `[${f.slug}](${f.slug}/spec.md)` + (d.titulo ? ` — ${celda(d.titulo)}` : '');
    const dep = Array.isArray(d.depende) ? d.depende.join(', ') : d.depende;
    out.push(`| ${celda(f.fecha)} | ${tarea} | ${celda(d.gravedad)} | ${celda(d.nivel)} | ${celda(dep)} | ${f.antiguo ? 'sin-cabecera' : celda(d.estado)} | ${celda(d.falta)} |`);
  }
  return out.join('\n') + '\n';
}

function regenerarIndice(root, { forzar = false } = {}) {
  const generado = indiceGenerado(root);
  if (generado === false && !forzar) {
    return { ok: false, motivo: 'el indice tiene el formato anterior: migralo primero (devteam migrate, despues --apply)' };
  }
  const tareas = cargarTareas(root);
  fs.mkdirSync(dirTareas(root), { recursive: true });
  fs.writeFileSync(rutaIndice(root), generarIndice(tareas));
  return { ok: true, total: tareas.length, sinCabecera: tareas.filter((t) => t.antiguo).map((t) => t.slug) };
}

const partirFila = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim());

function filaDelIndice(root, slug) {
  if (!fs.existsSync(rutaIndice(root))) return null;
  const linea = leer(rutaIndice(root)).split('\n').find((l) => l.includes(`[${slug}](${slug}/spec.md)`));
  return linea ? partirFila(linea) : null;
}

// ---------------------------------------------------------------- tareas: crear y modificar

function escribirSpec(t, data, body) {
  fs.writeFileSync(t, serializarCabecera(data) + '\n' + body.replace(/^\n+/, ''));
}

export function nuevaTarea(root, slug, op = {}) {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(slug)) throw new Error(`slug "${slug}" no valido: minusculas, numeros y guiones`);
  const dir = path.join(dirTareas(root), slug);
  const spec = path.join(dir, 'spec.md');
  let body = `# ${op.titulo || slug}\n\n## Que se pide\n\n## Que queda fuera\n\n## Criterios de aceptacion\n\n- [ ] \n`;
  if (fs.existsSync(spec)) {
    const prev = parsearCabecera(leer(spec));
    if (prev.data) throw new Error(`la tarea ${slug} ya existe con cabecera; usa devteam set`);
    body = prev.body;
  }
  const pantallas = op.pantallas === 'si' ? 'si' : 'no';
  const data = {
    slug, titulo: op.titulo || '', estado: 'pendiente', nivel: op.nivel || '', origen: op.origen || 'usuario',
    gravedad: op.gravedad || '-', depende: op.depende ? String(op.depende).split(',').map((s) => s.trim()).filter(Boolean) : [],
    creada: hoy(), cerrada: '', rama: '', commit: '', toca_pantallas: pantallas,
    verificacion: { pruebas: 'no-ejecutadas', e2e: pantallas === 'si' ? 'pendiente' : 'no-aplica', dispositivo: op.dispositivo === 'si' ? 'pendiente' : 'no-aplica' },
    entorno: '', falta: '',
  };
  const errores = validarSpec(data, slug);
  if (errores.length) throw new Error(errores.join('; '));
  fs.mkdirSync(dir, { recursive: true });
  escribirSpec(spec, data, body);
  return { spec, data };
}

export function cambiarTarea(root, slug, asignaciones) {
  const spec = path.join(dirTareas(root), slug, 'spec.md');
  if (!fs.existsSync(spec)) throw new Error(`no existe la tarea ${slug}`);
  const { data, body } = parsearCabecera(leer(spec));
  if (!data) throw new Error(`la tarea ${slug} no tiene cabecera: migra el proyecto o usa devteam new ${slug}`);
  for (const a of asignaciones) {
    const i = a.indexOf('=');
    if (i < 1) throw new Error(`"${a}" no es clave=valor`);
    const clave = a.slice(0, i).trim();
    let valor = a.slice(i + 1).trim();
    if (clave === 'depende') valor = valor === '' || valor === '[]' ? [] : valor.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
    if (clave.includes('.')) {
      const [p, s] = clave.split('.');
      if (typeof data[p] !== 'object' || Array.isArray(data[p])) data[p] = {};
      data[p][s] = valor;
    } else {
      data[clave] = valor;
    }
    if (clave === 'estado' && valor === 'cerrada' && !data.cerrada) data.cerrada = hoy();
    if (clave === 'estado' && ['pendiente', 'en-curso'].includes(valor)) data.cerrada = '';
  }
  const errores = validarSpec(data, slug);
  if (errores.length) throw new Error(errores.join('; '));
  escribirSpec(spec, data, body);
  return data;
}

// ---------------------------------------------------------------- comprobacion de cierre

function enGit(root) {
  const r = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: root, encoding: 'utf8' });
  return r.status === 0 && r.stdout.trim() === 'true';
}

function commitExiste(root, c) {
  return spawnSync('git', ['cat-file', '-e', `${c}^{commit}`], { cwd: root }).status === 0;
}

export function comprobarTarea(root, slug) {
  const errores = [];
  const avisos = [];
  const t = cargarTareas(root).find((x) => x.slug === slug);
  if (!t) return { ok: false, errores: [`no existe .devteam/tasks/${slug}/spec.md`], avisos };
  if (t.antiguo) return { ok: false, errores: ['el spec no tiene cabecera: crea la tarea con devteam new o migra el proyecto'], avisos };
  if (t.errores.length) return { ok: false, errores: t.errores.map((e) => `cabecera: ${e}`), avisos };
  const d = t.data;
  const v = typeof d.verificacion === 'object' && d.verificacion ? d.verificacion : {};
  const fijar = (campo) => `devteam set ${slug} ${campo}`;

  if (d.estado === 'en-curso') errores.push(`el estado sigue en "en-curso": fija el estado final (${fijar('estado=cerrada|parcial|bloqueada')})`);
  if (d.estado === 'pendiente') errores.push(`el estado es "pendiente": si se trabajo en ella, fija el estado real (${fijar('estado=...')})`);

  if (d.estado === 'cerrada') {
    if (enGit(root)) {
      if (!d.commit) errores.push(`cerrada sin commit: haz el commit y registralo (${fijar('commit=<hash>')})`);
      else if (!commitExiste(root, d.commit)) errores.push(`el commit "${d.commit}" no existe en este repositorio`);
    }
    if (v.pruebas !== 'ok') errores.push(`cerrada con verificacion.pruebas="${v.pruebas ?? ''}": ejecuta las pruebas (devteam run) y registra ${fijar('verificacion.pruebas=ok')}, o deja la tarea parcial`);
    if (d.toca_pantallas === 'si' && v.e2e !== 'ok') errores.push(`toca pantallas y verificacion.e2e="${v.e2e ?? ''}": ejecuta el script de extremo a extremo y registra ${fijar('verificacion.e2e=ok')}, o marca la tarea parcial con falta`);
    if (v.dispositivo === 'pendiente') errores.push(`verificacion.dispositivo esta pendiente: pruebala en un dispositivo o emulador, o deja la tarea parcial con falta`);
  }
  if (['parcial', 'bloqueada', 'abandonada'].includes(d.estado) && !d.falta) {
    errores.push(`estado "${d.estado}" sin falta: escribe que falta o por que (${fijar('falta="..."')})`);
  }
  if (['cerrada', 'parcial'].includes(d.estado)) {
    const log = path.join(t.dir, 'log.md');
    if (!fs.existsSync(log)) errores.push('falta log.md: que se hizo, que se decidio y que quedo pendiente');
    else if (!d.entorno && !/entorno de pruebas usado/i.test(leer(log))) {
      errores.push(`no consta el entorno de pruebas usado: ${fijar('entorno="..."')} o una linea "Entorno de pruebas usado" en log.md ("ninguno" vale si no hizo falta nada)`);
    }
  }
  const fila = filaDelIndice(root, slug);
  if (indiceGenerado(root)) {
    if (!fila) errores.push('la tarea no esta en el indice: ejecuta devteam index');
    else if (fila[5] !== d.estado) errores.push(`el indice dice "${fila[5]}" y el spec "${d.estado}": ejecuta devteam index`);
  } else {
    avisos.push('el indice no lo genera devteam (formato anterior): no se comprueba la fila');
  }
  return { ok: errores.length === 0, errores, avisos };
}

// ---------------------------------------------------------------- estado del proyecto

export function estadoProyecto(root, ahora = new Date()) {
  const tareas = cargarTareas(root);
  const generado = indiceGenerado(root);
  const antiguos = tareas.filter((t) => t.antiguo);
  const conCabecera = tareas.filter((t) => !t.antiguo);
  const cuenta = Object.fromEntries(ESTADOS.map((e) => [e, 0]));
  for (const t of conCabecera) if (t.data.estado in cuenta) cuenta[t.data.estado]++;
  const pendientes = conCabecera.filter((t) => t.data.estado === 'pendiente').map((t) => {
    const dias = diasDesde(t.data.creada, ahora);
    return { slug: t.slug, gravedad: t.data.gravedad || '', nivel: t.data.nivel || '', dias, revalidar: dias !== null && dias > DIAS_CADUCIDAD, depende: t.data.depende || [] };
  }).sort((a, b) => (RANGO_GRAVEDAD[a.gravedad] ?? 5) - (RANGO_GRAVEDAD[b.gravedad] ?? 5) || (b.dias ?? 0) - (a.dias ?? 0));
  const enCurso = conCabecera.filter((t) => t.data.estado === 'en-curso').map((t) => {
    const marca = path.join(t.dir, '.activa');
    let activa = null;
    try { if (fs.existsSync(marca)) activa = JSON.parse(leer(marca)); } catch { activa = { corrupta: true }; }
    return { slug: t.slug, activa };
  });
  const abiertas = conCabecera.filter((t) => ['parcial', 'bloqueada'].includes(t.data.estado)).map((t) => ({ slug: t.slug, estado: t.data.estado, falta: t.data.falta || '' }));
  const runsDir = path.join(root, '.devteam', 'runs');
  const sprints = !fs.existsSync(runsDir) ? [] : fs.readdirSync(runsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => {
    const r = path.join(runsDir, d.name);
    const run = path.join(r, 'run.md');
    const cab = fs.existsSync(run) ? parsearCabecera(leer(run)).data : null;
    const terminado = fs.existsSync(path.join(r, 'report.md')) || (cab && cab.estado === 'terminado');
    const dias = diasDesde(fechaDe(fs.existsSync(run) ? run : r), ahora);
    return { run: d.name, terminado, dias, reanudable: dias !== null && dias <= DIAS_REANUDAR, estado: cab?.estado || '', session_id: cab?.session_id || '' };
  }).filter((s) => !s.terminado);
  return {
    formatoAnterior: antiguos.length > 0 || generado === false,
    indiceAnterior: generado === false, sinCabecera: antiguos.map((t) => t.slug),
    total: tareas.length, cuenta, pendientes, enCurso, abiertas, sprints,
  };
}

// ---------------------------------------------------------------- lint

export function revisarProyecto(root) {
  const errores = [];
  const avisos = [];
  const ficha = leerFicha(root);
  if (!ficha.existe) errores.push('no existe .devteam/context.md: ejecuta /devteam:onboard');
  else {
    if (!ficha.tieneCabecera) avisos.push('la ficha no tiene cabecera (modo_consumo, datos_prueba, prefijo_contenedores, hosts_produccion)');
    for (const e of ficha.errores) errores.push(`ficha: ${e}`);
    const d = ficha.data;
    if (d.modo_consumo && !MODOS.includes(d.modo_consumo)) errores.push(`ficha: modo_consumo "${d.modo_consumo}" no valido (${MODOS.join(', ')})`);
    if (d.datos_prueba && !DATOS_PRUEBA.includes(d.datos_prueba)) errores.push(`ficha: datos_prueba "${d.datos_prueba}" no valido (${DATOS_PRUEBA.join(', ')})`);
    if (d.hosts_produccion !== undefined && d.hosts_produccion !== '' && !Array.isArray(d.hosts_produccion)) errores.push('ficha: hosts_produccion debe ser una lista: [host1, host2]');
    const lineas = ficha.texto.split('\n').length;
    if (lineas > LIMITES.lineas) avisos.push(`la ficha tiene ${lineas} lineas (objetivo ${LIMITES.lineas}): poda o mueve las recetas largas a .devteam/ref/`);
    const trampas = contarEntradas(seccion(ficha.texto, /^trampas/));
    if (trampas > LIMITES.trampas) avisos.push(`Trampas conocidas tiene ${trampas} entradas (limite ${LIMITES.trampas}): consolida y poda`);
    const lecciones = contarEntradas(seccion(ficha.texto, /^lecciones/));
    if (lecciones > LIMITES.lecciones) avisos.push(`Lecciones tiene ${lecciones} entradas (limite ${LIMITES.lecciones}): consolida y poda`);
  }
  const raiz = path.join(root, '.devteam');
  if (fs.existsSync(raiz)) {
    for (const n of fs.readdirSync(raiz)) if (!PERMITIDOS_RAIZ.has(n) && !n.startsWith('.')) avisos.push(`archivo suelto en .devteam/: ${n} (los registros van en tasks/<slug>/logs/)`);
  }
  const est = estadoProyecto(root);
  if (est.formatoAnterior) avisos.push(`formato anterior: ${est.sinCabecera.length} spec.md sin cabecera${est.indiceAnterior ? ' e indice en texto libre' : ''}: migralo (devteam migrate)`);
  for (const t of cargarTareas(root)) {
    if (!t.antiguo && t.errores.length) errores.push(`${t.slug}: ${t.errores.join('; ')}`);
    if (!t.antiguo && ['parcial', 'bloqueada'].includes(t.data.estado) && !t.data.falta) avisos.push(`${t.slug}: ${t.data.estado} sin falta`);
  }
  return { ok: errores.length === 0, errores, avisos };
}

// ---------------------------------------------------------------- migracion del formato anterior

const MAPA_COLUMNAS = [
  [/^fecha/, 'fecha'], [/^(tarea|slug|nombre)/, 'tarea'], [/^(gravedad|prioridad|severidad)/, 'gravedad'],
  [/^(esfuerzo|nivel)/, 'nivel'], [/^depende/, 'depende'], [/^estado/, 'estado'],
  [/^(resumen|que hizo|descripcion)/, 'resumen'], [/^origen/, 'origen'],
];
const esSeparador = (l) => /^\|\s*:?-{2,}/.test(l.trim());

export function leerIndiceAnterior(texto) {
  const lineas = String(texto).replace(/\r\n?/g, '\n').split('\n');
  const filas = [];
  let cols = null;
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    if (!l.trim().startsWith('|')) { cols = null; continue; }
    if (esSeparador(l)) continue;
    const celdas = partirFila(l);
    if (esSeparador(lineas[i + 1] || '')) {
      cols = celdas.map((c) => (MAPA_COLUMNAS.find(([re]) => re.test(normalizar(c))) || [])[1] || null);
      continue;
    }
    // Tabla sin cabecera: si la fila empieza por una fecha, se asume fecha | tarea | ... | estado.
    const columnas = cols || (celdas.length >= 3 && /^\d{4}-\d{2}-\d{2}/.test(celdas[0])
      ? celdas.map((_, j) => (j === 0 ? 'fecha' : j === 1 ? 'tarea' : j === celdas.length - 1 ? 'estado' : 'resumen'))
      : null);
    if (!columnas) continue;
    const fila = { texto: l.trim() };
    celdas.forEach((c, j) => { if (columnas[j] && !(columnas[j] in fila)) fila[columnas[j]] = c; });
    filas.push(fila);
  }
  return filas;
}

export function slugDeCelda(c) {
  if (!c) return null;
  const enlace = c.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (enlace) {
    const m = enlace[2].match(/([^/\\]+)[/\\]spec\.md$/);
    return (m ? m[1] : enlace[1]).replace(/`/g, '').trim();
  }
  const m = c.replace(/[`*]/g, '').trim().match(/^([A-Za-z0-9][\w.-]*)/);
  return m ? m[1] : null;
}

function detalleDe(texto) {
  return String(texto || '').trim().replace(/^[*_\s]+/, '').replace(/^\S+\s*/, '')
    .replace(/^\d{4}-\d{2}-\d{2}\s*/, '').replace(/^[(:;,\-—\s]+/, '').replace(/[)*_\s]+$/, '').trim().slice(0, 200);
}

// Sinonimos con que los indices anteriores daban una tarea por terminada.
const RE_CERRADA = /^(cerrad|hech|integrad|confirmad|terminad|completad|resuelt|entregad|finalizad)/;

export function traducirEstado(texto) {
  const t = normalizar(texto).replace(/^[*_\s]+/, '');
  const detalle = detalleDe(texto);
  const hayNota = /(sin (prueba|verific|probar|commit|ver\b|push|desplegar)|falta|no verificad|no probad|pendiente de|sin commitear)/.test(t);
  const faltaVerificar = /(sin (prueba|verific|probar|ver\b)|no verificad|no probad|navegador|visual|telefono|dispositivo|falta (probar|verlo|ver\b|prueba))/.test(t);
  // Commit, push o despliegue pendientes son acciones del usuario, no trabajo sin hacer:
  // la tarea queda cerrada con la nota. Lo que falta verificar o construir la deja parcial.
  const accionDelUsuario = /(despleg|deploy|publicar|publicacion|\bota\b|subir|push|commit)/.test(t)
    && !/falta(?!\s+(desplegar|publicar|subir|hacer push|el push|push|commit))/.test(t);
  if (RE_CERRADA.test(t)) {
    if (!hayNota) return { estado: 'cerrada', falta: '', dudoso: false };
    if (faltaVerificar) return { estado: 'parcial', falta: detalle || 'detalle no registrado', dudoso: false };
    if (accionDelUsuario) return { estado: 'cerrada', falta: detalle, dudoso: false };
    return { estado: 'parcial', falta: detalle || 'detalle no registrado', dudoso: false };
  }
  if (/^parcial/.test(t)) return { estado: 'parcial', falta: detalle || 'sin detalle en el indice anterior', dudoso: !detalle };
  if (/^bloquead/.test(t)) return { estado: 'bloqueada', falta: detalle || 'motivo no registrado', dudoso: !detalle };
  if (/^pendiente/.test(t)) return { estado: 'pendiente', falta: '', dudoso: false };
  if (/^(abandonad|descartad|cancelad)/.test(t)) return { estado: 'abandonada', falta: detalle || 'motivo no registrado', dudoso: false };
  if (/^(en curso|en-curso)/.test(t)) return { estado: 'parcial', falta: 'estaba en curso al migrar: revisar', dudoso: true };
  if (/cerrad/.test(t)) return { estado: 'cerrada', falta: '', dudoso: true };
  return { estado: 'pendiente', falta: '', dudoso: true };
}

function gravedadDe(c) {
  const n = normalizar(c);
  if (/^critic/.test(n)) return 'critica';
  if (/^alt/.test(n)) return 'alta';
  if (/^medi/.test(n)) return 'media';
  if (/^baj/.test(n)) return 'baja';
  return '-';
}

function nivelDe(c) {
  const n = normalizar(c);
  return NIVELES.find((x) => n.startsWith(x)) || '';
}

function origenDe(texto) {
  const n = normalizar(texto);
  const m = n.match(/(auditoria|audit|plan|uitest|redesign)\s*\(?\s*(\d{4}-\d{2}-\d{2})/);
  if (!m) return 'usuario';
  return `${m[1] === 'auditoria' ? 'audit' : m[1]} ${m[2]}`;
}

function datosDeFila(fila, slug, cuerpo, fechaCarpeta) {
  const textoEstado = fila?.estado || '';
  const todo = `${fila?.texto || ''} ${cuerpo?.slice(0, 400) || ''}`;
  const tr = fila ? traducirEstado(textoEstado) : { estado: 'pendiente', falta: '', dudoso: true };
  const n = normalizar(todo);
  const pantallas = /(pantalla|navegador|visual|modal|grid|interfaz|\bui\b|formulario|boton|vista|frontend|css)/.test(n) ? 'si' : 'no';
  const movil = /(telefono|dispositivo|android|\bios\b|nativo|movil)/.test(n);
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(fila?.fecha || '') ? fila.fecha : fechaCarpeta;
  const rama = textoEstado.match(/`?((?:feat|fix|feature|bugfix|hotfix|chore|refactor|bloqueada|integracion|release)\/[\w./-]+)`?/);
  const commit = (textoEstado.match(/`([0-9a-f]{7,40})`/) || textoEstado.match(/\b([0-9a-f]{7,40})\b/) || [])[1];
  const commitValido = commit && /\d/.test(commit) && /[a-f]/.test(commit) ? commit : '';
  const visualPendiente = tr.estado === 'parcial' && /(navegador|visual|pantalla|verlo)/.test(normalizar(tr.falta));
  const titulo = (fila?.resumen || fila?.tarea || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*]/g, '').replace(new RegExp(`^${slug}\\s*[—-]?\\s*`), '').trim().slice(0, 120)
    || ((cuerpo || '').match(/^#\s+(.+)$/m) || [])[1]?.trim().slice(0, 120) || '';
  const depende = !fila?.depende || /^[—–-]?$/.test(fila.depende.trim()) ? [] : fila.depende.split(/[,;]/).map(slugDeCelda).filter((s) => s && s.includes('-'));
  return {
    data: {
      slug, titulo, estado: tr.estado, nivel: nivelDe(fila?.nivel || ''), origen: fila?.origen ? origenDe(fila.origen) : origenDe(fila?.texto || ''),
      gravedad: gravedadDe(fila?.gravedad || ''), depende, creada: fecha, cerrada: tr.estado === 'cerrada' ? fecha : '',
      rama: rama ? rama[1] : '', commit: commitValido, toca_pantallas: pantallas,
      verificacion: {
        pruebas: tr.estado === 'cerrada' ? 'desconocido' : 'no-ejecutadas',
        e2e: pantallas === 'no' ? 'no-aplica' : visualPendiente ? 'pendiente' : 'desconocido',
        dispositivo: !movil ? 'no-aplica' : tr.estado === 'parcial' ? 'pendiente' : 'desconocido',
      },
      entorno: '', falta: tr.falta,
    },
    dudoso: tr.dudoso,
  };
}

function fechaDe(p) {
  try { return hoy(fs.statSync(p).mtime); } catch { return hoy(); }
}

export function planearMigracion(root) {
  const tareas = cargarTareas(root);
  const indice = rutaIndice(root);
  const generado = indiceGenerado(root);
  const filas = generado === false ? leerIndiceAnterior(leer(indice)) : [];
  const porSlug = new Map();
  const noInterpretadas = [];
  const dudas = [];
  const existentes = new Set(fs.existsSync(dirTareas(root)) ? fs.readdirSync(dirTareas(root)) : []);
  for (const f of filas) {
    const s = slugDeCelda(f.tarea);
    const valido = s && (existentes.has(s) || /^[a-z0-9][a-z0-9._-]*-[a-z0-9._-]+$/.test(s));
    if (!valido) { noInterpretadas.push(f.texto.slice(0, 160)); continue; }
    if (porSlug.has(s)) { dudas.push({ slug: s, motivo: 'aparece varias veces en el indice: se usa la primera fila' }); continue; }
    porSlug.set(s, f);
  }
  const acciones = [];
  for (const t of tareas.filter((x) => x.antiguo)) {
    const fila = porSlug.get(t.slug);
    const r = datosDeFila(fila, t.slug, t.body, fechaDe(t.dir));
    if (!fila) {
      const conLog = fs.existsSync(path.join(t.dir, 'log.md'));
      r.data.estado = conLog ? 'parcial' : 'pendiente';
      r.data.falta = conLog ? 'sin fila en el indice anterior: revisar el estado real' : '';
      r.data.cerrada = '';
      dudas.push({ slug: t.slug, motivo: `sin fila en el indice: queda ${r.data.estado}` });
    } else if (r.dudoso) {
      dudas.push({ slug: t.slug, motivo: `estado "${(fila.estado || '').slice(0, 60)}" interpretado como ${r.data.estado}` });
    }
    acciones.push({ tipo: 'cabecera', slug: t.slug, data: r.data, estadoAnterior: fila?.estado || '' });
  }
  for (const [s, f] of porSlug) {
    if (existentes.has(s) && tareas.some((t) => t.slug === s)) continue;
    const r = datosDeFila(f, s, '', /^\d{4}-\d{2}-\d{2}$/.test(f.fecha || '') ? f.fecha : hoy());
    if (r.dudoso) dudas.push({ slug: s, motivo: `estado "${(f.estado || '').slice(0, 60)}" interpretado como ${r.data.estado}` });
    acciones.push({ tipo: 'crear', slug: s, data: r.data, fila: f.texto, estadoAnterior: f.estado || '' });
  }
  // Carpetas de tarea sin spec.md ni fila en el indice: sin esto desaparecerian del indice nuevo.
  for (const s of existentes) {
    const dir = path.join(dirTareas(root), s);
    if (porSlug.has(s) || tareas.some((t) => t.slug === s) || !fs.statSync(dir).isDirectory()) continue;
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(s) || !fs.readdirSync(dir).length) continue;
    // Una carpeta que solo guarda salidas de pruebas no es una tarea con estado conocido: se deja como esta.
    if (!fs.existsSync(path.join(dir, 'log.md'))) continue;
    const r = datosDeFila(null, s, '', fechaDe(dir));
    r.data.estado = 'parcial';
    r.data.falta = 'sin spec.md ni fila en el indice anterior: revisar el estado real en log.md';
    dudas.push({ slug: s, motivo: 'carpeta sin spec.md ni fila: queda parcial para revisar' });
    acciones.push({ tipo: 'crear', slug: s, data: r.data, fila: '(sin fila en el indice anterior; ver log.md)', estadoAnterior: '' });
  }
  const ficha = leerFicha(root);
  const fichaNueva = ficha.existe && !ficha.tieneCabecera ? {
    modo_consumo: ficha.data.modo_consumo || '', datos_prueba: '', prefijo_contenedores: '', hosts_produccion: [],
    datos_sensibles: seccion(ficha.texto, /^datos sensibles/).some((l) => l.trim()) ? 'si' : '',
  } : null;
  const traducciones = {};
  for (const a of acciones) {
    const k = `${normalizar(a.estadoAnterior).split(/[\s(:;,]/)[0] || '(sin fila)'} -> ${a.data.estado}`;
    traducciones[k] = (traducciones[k] || 0) + 1;
  }
  return { necesaria: acciones.length > 0 || generado === false || !!fichaNueva, acciones, traducciones, dudas, noInterpretadas, fichaNueva, indiceAnterior: generado === false };
}

export function aplicarMigracion(root, plan) {
  for (const a of plan.acciones) {
    const dir = path.join(dirTareas(root), a.slug);
    const spec = path.join(dir, 'spec.md');
    let body;
    if (a.tipo === 'crear') {
      fs.mkdirSync(dir, { recursive: true });
      body = `# ${a.data.titulo || a.slug}\n\nMigrado del indice anterior. Fila original:\n\n> ${a.fila}\n`;
    } else {
      const prev = parsearCabecera(leer(spec));
      if (prev.data) continue;
      body = prev.body;
    }
    escribirSpec(spec, a.data, body);
  }
  if (plan.indiceAnterior) {
    let destino = path.join(dirTareas(root), 'index-anterior.md');
    if (fs.existsSync(destino)) destino = path.join(dirTareas(root), `index-anterior-${hoy()}.md`);
    fs.copyFileSync(rutaIndice(root), destino);
  }
  if (plan.fichaNueva) {
    const p = path.join(root, '.devteam', 'context.md');
    fs.writeFileSync(p, serializarCabecera(plan.fichaNueva, ORDEN_FICHA) + '\n' + leer(p));
  }
  return regenerarIndice(root, { forzar: true });
}

// ---------------------------------------------------------------- run

const RE_ERROR = /(error|fail|fallo|exception|traceback|assert|panic|fatal|✗|✘|ERR!)/i;

export async function ejecutar(root, slug, etiqueta, comando, io) {
  const dirTarea = path.join(dirTareas(root), slug);
  if (!fs.existsSync(dirTarea)) { io.err(`no existe la tarea ${slug}\n`); return 2; }
  const etq = etiqueta.replace(/[^\w.-]/g, '-');
  const dirLogs = path.join(dirTarea, 'logs');
  fs.mkdirSync(dirLogs, { recursive: true });
  const log = path.join(dirLogs, `${etq}.log`);
  const fd = fs.openSync(log, 'w');
  const t0 = Date.now();
  const shell = process.platform === 'win32' ? true : (fs.existsSync('/bin/bash') ? '/bin/bash' : '/bin/sh');
  const codigo = await new Promise((res) => {
    const p = spawn(comando, { cwd: process.cwd(), shell, stdio: ['ignore', fd, fd] });
    p.on('error', (e) => { fs.writeSync(fd, `\n[devteam run] no se pudo ejecutar: ${e.message}\n`); res(127); });
    p.on('close', (c) => res(c ?? 1));
  });
  fs.closeSync(fd);
  const lineas = quitarAnsi(leer(log)).split('\n').filter((l) => l.trim());
  const seg = ((Date.now() - t0) / 1000).toFixed(1);
  const rel = path.relative(process.cwd(), log) || log;
  const recorta = (l) => (l.length > 300 ? l.slice(0, 300) + '…' : l);
  if (codigo === 0) {
    io.out(`[devteam run] ${etq}: OK en ${seg}s, ${lineas.length} lineas -> ${rel}\n`);
    io.out(lineas.slice(-5).map(recorta).join('\n') + (lineas.length ? '\n' : ''));
  } else {
    io.out(`[devteam run] ${etq}: FALLO (codigo ${codigo}) en ${seg}s, ${lineas.length} lineas -> ${rel}\n`);
    const err = lineas.filter((l) => RE_ERROR.test(l));
    const muestra = (err.length ? err : lineas).slice(-25).map(recorta);
    io.out(`--- ${err.length ? 'lineas de error' : 'final de la salida'} ---\n${muestra.join('\n')}\n`);
  }
  return codigo;
}

// ---------------------------------------------------------------- hooks

export function textoInicio(root, rutaScript, ahora = new Date()) {
  const e = estadoProyecto(root, ahora);
  const f = leerFicha(root);
  const L = [];
  L.push(`devteam: este proyecto tiene .devteam/. Herramienta: node "${rutaScript}" <subcomando> (new, set, index, status, check, run, begin, end, lint, migrate). Crea, actualiza y cierra tareas con ella y ejecuta las pruebas con "run"; no edites a mano el indice ni las cabeceras de los spec.md.`);
  if (e.formatoAnterior) {
    L.push(`Formato anterior: ${e.sinCabecera.length} spec.md sin cabecera${e.indiceAnterior ? ' e indice en texto libre' : ''}. Antes de crear o cerrar tareas, propon al usuario /devteam:migrar (simulacro y despues confirmacion).`);
  }
  L.push(`Modo de consumo: ${f.data.modo_consumo || 'sin declarar'}. Datos de prueba: ${f.data.datos_prueba || 'sin declarar'}${f.data.datos_sensibles === 'si' ? ' (datos sensibles: nunca copies datos personales a informes ni logs)' : ''}.`);
  const receta = seccion(f.texto, /^entorno de pruebas/).map((l) => l.trim()).filter((l) => l && !l.startsWith('<') && !l.startsWith('```') && !l.startsWith('|'));
  L.push(receta.length
    ? `Entorno de pruebas (resumen; la receta completa esta en la seccion "Entorno de pruebas" de la ficha): ${receta.slice(0, 2).join(' ').slice(0, 300)}`
    : 'Entorno de pruebas: sin receta en la ficha. Antes de probar, recuperala de las tareas recientes (log.md, logs/) y de docker ps -a, y escribela.');
  const c = e.cuenta;
  const viejos = e.pendientes.filter((p) => p.revalidar).length;
  L.push(`Tareas: ${c.pendiente} pendientes${viejos ? ` (${viejos} con mas de ${DIAS_CADUCIDAD} dias: revalida su evidencia antes de ejecutarlas)` : ''}, ${c.parcial} parciales, ${c.bloqueada} bloqueadas, ${c.cerrada} cerradas.`);
  for (const p of e.pendientes.slice(0, 5)) L.push(`- pendiente ${p.slug} [${p.gravedad || '-'}, ${p.nivel || 'sin nivel'}, ${p.dias ?? '?'} dias]`);
  for (const t of e.enCurso) L.push(`- en curso ${t.slug}${t.activa?.desde ? ` desde ${t.activa.desde.slice(0, 16)}` : ''}`);
  for (const a of e.abiertas.slice(0, 3)) L.push(`- ${a.estado} ${a.slug}: ${a.falta.slice(0, 120)}`);
  for (const s of e.sprints.filter((x) => x.reanudable)) L.push(`Sprint sin terminar: runs/${s.run} (hace ${s.dias} dias). Si el usuario quiere continuarlo: /devteam:sprint (ofrece reanudar).`);
  for (const a of revisarProyecto(root).avisos.filter((x) => !x.startsWith('formato anterior')).slice(0, 3)) L.push(`Aviso: ${a}`);
  return L.slice(0, 40).join('\n');
}

function registrarErrorHook(e) {
  try {
    fs.appendFileSync(path.join(os.homedir(), '.claude', 'devteam-hooks.log'), `${new Date().toISOString()} ${e?.stack || e}\n`);
  } catch { /* sin registro posible: no bloquear */ }
}

function leerEntradaHook() {
  try {
    if (process.stdin.isTTY) return {};
    const t = fs.readFileSync(0, 'utf8');
    return t.trim() ? JSON.parse(t) : {};
  } catch { return {}; }
}

async function hook(nombre, io, entrada = leerEntradaHook()) {
  try {
    const root = buscarRaiz(entrada.cwd || process.cwd());
    if (!root) return 0;
    if (nombre === 'session-start') {
      const texto = textoInicio(root, rutaDeEsteScript());
      io.out(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: texto } }));
    }
    return 0;
  } catch (e) {
    registrarErrorHook(e);
    return 0;
  }
}

// ---------------------------------------------------------------- linea de comandos

function rutaDeEsteScript() {
  return fileURLToPath(import.meta.url);
}

function parsearArgs(argv) {
  const pos = [];
  const op = {};
  let resto = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') { resto = argv.slice(i + 1); break; }
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split(/=(.*)/s);
      if (v !== undefined) op[k] = v;
      else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) op[k] = argv[++i];
      else op[k] = true;
    } else pos.push(a);
  }
  return { pos, op, resto };
}

const AYUDA = `devteam <subcomando>
  new <slug> [--titulo T] [--origen O] [--nivel ligero|estandar|completo] [--gravedad G] [--depende a,b] [--pantallas si|no] [--dispositivo si|no]
  set <slug> clave=valor ...      p. ej. estado=cerrada commit=abc1234 verificacion.e2e=ok depende=a,b falta="..."
  index                            regenera tasks/index.md desde las cabeceras
  status [--json]                  pendientes con antiguedad, en curso, parciales, sprints sin terminar
  check <slug>                     comprueba que la tarea puede darse por cerrada
  run <slug> <etiqueta> -- <cmd>   ejecuta y guarda la salida en tasks/<slug>/logs/<etiqueta>.log
  begin <slug> | end <slug>        marca o cierra la tarea en curso de esta sesion
  lint [--json]                    limites de la ficha y coherencia de .devteam/
  migrate [--apply] [--json]       convierte el formato anterior (sin --apply solo simula)
  hook session-start               uso interno de los hooks
Opcion comun: --root <dir> (por defecto, el directorio con .devteam/ mas cercano).`;

export async function main(argv, io = { out: (s) => process.stdout.write(s), err: (s) => process.stderr.write(s) }, env = process.env) {
  const { pos, op, resto } = parsearArgs(argv);
  const [cmd, ...args] = pos;
  if (!cmd || cmd === 'help' || op.help) { io.out(AYUDA + '\n'); return cmd ? 0 : 1; }
  if (cmd === 'hook') return hook(args[0], io);
  const root = op.root ? path.resolve(op.root) : buscarRaiz(env.DEVTEAM_ROOT || process.cwd());
  if (!root) { io.err('no hay .devteam/ en este directorio ni en los superiores: ejecuta /devteam:onboard\n'); return 2; }
  const json = (o) => io.out(JSON.stringify(o, null, 2) + '\n');
  const indexar = () => {
    const r = regenerarIndice(root);
    if (!r.ok) io.err(`aviso: no se regenero el indice: ${r.motivo}\n`);
    return r;
  };
  try {
    switch (cmd) {
      case 'new': {
        if (!args[0]) throw new Error('falta el slug');
        const r = nuevaTarea(root, args[0], op);
        indexar();
        io.out(`tarea creada: ${path.relative(root, r.spec)}\n`);
        return 0;
      }
      case 'set': {
        if (!args[0] || args.length < 2) throw new Error('uso: set <slug> clave=valor ...');
        const d = cambiarTarea(root, args[0], args.slice(1));
        indexar();
        io.out(`${args[0]}: estado ${d.estado}\n`);
        return 0;
      }
      case 'index': {
        const r = regenerarIndice(root);
        if (!r.ok) { io.err(r.motivo + '\n'); return 2; }
        io.out(`indice regenerado: ${r.total} tareas${r.sinCabecera.length ? `; sin cabecera: ${r.sinCabecera.join(', ')}` : ''}\n`);
        return 0;
      }
      case 'status': {
        const e = estadoProyecto(root);
        if (op.json) { json(e); return 0; }
        const c = e.cuenta;
        io.out(`${e.total} tareas: ${c.pendiente} pendientes, ${c['en-curso']} en curso, ${c.parcial} parciales, ${c.bloqueada} bloqueadas, ${c.cerrada} cerradas, ${c.abandonada} abandonadas\n`);
        if (e.formatoAnterior) io.out(`formato anterior: ${e.sinCabecera.length} specs sin cabecera${e.indiceAnterior ? ', indice en texto libre' : ''}\n`);
        for (const p of e.pendientes) io.out(`pendiente  ${p.slug} [${p.gravedad || '-'}, ${p.nivel || '-'}, ${p.dias ?? '?'} dias${p.revalidar ? ', revalidar' : ''}]${p.depende.length ? ` depende de ${p.depende.join(', ')}` : ''}\n`);
        for (const t of e.enCurso) io.out(`en curso   ${t.slug}\n`);
        for (const a of e.abiertas) io.out(`${a.estado.padEnd(10)} ${a.slug}: ${a.falta}\n`);
        for (const s of e.sprints) io.out(`sprint sin terminar: runs/${s.run} (hace ${s.dias ?? '?'} dias${s.reanudable ? '' : ', probablemente abandonado'})\n`);
        return 0;
      }
      case 'check': {
        if (!args[0]) throw new Error('falta el slug');
        const r = comprobarTarea(root, args[0]);
        if (r.ok) io.out(`${args[0]}: OK, se puede cerrar\n`);
        else io.out(`${args[0]}: NO se puede cerrar todavia\n${r.errores.map((e) => `- ${e}`).join('\n')}\n`);
        for (const a of r.avisos) io.out(`aviso: ${a}\n`);
        return r.ok ? 0 : 1;
      }
      case 'run': {
        if (args.length < 2 || !resto || !resto.length) throw new Error('uso: run <slug> <etiqueta> -- <comando>');
        return await ejecutar(root, args[0], args[1], resto.length === 1 ? resto[0] : resto.join(' '), io);
      }
      case 'begin': {
        if (!args[0]) throw new Error('falta el slug');
        cambiarTarea(root, args[0], ['estado=en-curso']);
        const marca = { session_id: env.CLAUDE_CODE_SESSION_ID || '', desde: new Date().toISOString() };
        fs.writeFileSync(path.join(dirTareas(root), args[0], '.activa'), JSON.stringify(marca));
        indexar();
        io.out(`${args[0]}: en curso${marca.session_id ? '' : ' (sin session_id: el cierre no se vigilara por sesion)'}\n`);
        return 0;
      }
      case 'end': {
        if (!args[0]) throw new Error('falta el slug');
        indexar();
        const r = comprobarTarea(root, args[0]);
        if (!r.ok) { io.out(`${args[0]}: NO se puede cerrar todavia\n${r.errores.map((e) => `- ${e}`).join('\n')}\n`); return 1; }
        fs.rmSync(path.join(dirTareas(root), args[0], '.activa'), { force: true });
        io.out(`${args[0]}: cierre comprobado (${cargarTareas(root).find((t) => t.slug === args[0]).data.estado})\n`);
        return 0;
      }
      case 'lint': {
        const r = revisarProyecto(root);
        if (op.json) { json(r); return r.ok ? 0 : 1; }
        for (const e of r.errores) io.out(`error: ${e}\n`);
        for (const a of r.avisos) io.out(`aviso: ${a}\n`);
        if (r.ok && !r.avisos.length) io.out('sin observaciones\n');
        return r.ok ? 0 : 1;
      }
      case 'migrate': {
        const plan = planearMigracion(root);
        if (!plan.necesaria) { io.out('nada que migrar: el proyecto ya usa el formato estructurado\n'); return 0; }
        if (op.apply) {
          const r = aplicarMigracion(root, plan);
          io.out(`migrado: ${plan.acciones.length} tareas con cabecera; indice regenerado (${r.total} tareas)${plan.indiceAnterior ? '; el indice anterior queda en tasks/index-anterior.md' : ''}${plan.fichaNueva ? '; ficha con cabecera nueva' : ''}\n`);
          return 0;
        }
        if (op.json) { json({ ...plan, acciones: plan.acciones.map((a) => ({ tipo: a.tipo, slug: a.slug, estado: a.data.estado, falta: a.data.falta })) }); return 0; }
        const crear = plan.acciones.filter((a) => a.tipo === 'crear').length;
        io.out(`SIMULACRO (no se ha cambiado nada)\n`);
        io.out(`- ${plan.acciones.length - crear} spec.md recibirian cabecera; ${crear} tareas del indice sin carpeta se crearian con la fila original\n`);
        io.out(`- traduccion de estados:\n${Object.entries(plan.traducciones).sort((a, b) => b[1] - a[1]).map(([k, n]) => `    ${n} x ${k}`).join('\n')}\n`);
        if (plan.dudas.length) io.out(`- a revisar (${plan.dudas.length}):\n${plan.dudas.slice(0, 40).map((d) => `    ${d.slug}: ${d.motivo}`).join('\n')}\n`);
        if (plan.noInterpretadas.length) io.out(`- filas sin slug reconocible (quedan en index-anterior.md, no se pierden): ${plan.noInterpretadas.length}\n${plan.noInterpretadas.slice(0, 10).map((f) => `    ${f}`).join('\n')}\n`);
        if (plan.fichaNueva) io.out(`- la ficha recibiria cabecera: modo_consumo=${plan.fichaNueva.modo_consumo || '?'}; faltaria completar datos_prueba, prefijo_contenedores y hosts_produccion\n`);
        io.out('Para aplicarlo: devteam migrate --apply\n');
        return 0;
      }
      default:
        io.err(`subcomando desconocido: ${cmd}\n${AYUDA}\n`);
        return 2;
    }
  } catch (e) {
    io.err(`error: ${e.message}\n`);
    return 1;
  }
}

function esEjecucionDirecta() {
  try { return fs.realpathSync(process.argv[1] || '') === fs.realpathSync(rutaDeEsteScript()); } catch { return false; }
}

if (esEjecucionDirecta()) {
  // Si quien lee la salida cierra la tuberia (| head), terminar sin traza.
  process.stdout.on('error', (e) => { if (e.code === 'EPIPE') process.exit(process.exitCode ?? 0); });
  main(process.argv.slice(2)).then((c) => { process.exitCode = c; }, (e) => { process.stderr.write(`${e?.stack || e}\n`); process.exitCode = 1; });
}
