// ✅  VERSIÓN CORREGIDA — los mismos 5 endpoints, ahora defendidos.
// Compara línea a línea con ../vulnerable/server.js para ver el fix de cada
// patrón. La idea del Tema 16: Claude propone el patrón inseguro y el fix;
// tú firmas la decisión.
//
// Arranque:  node seguro/server.js
// Puerto:    3017 (configurable con PORT)

const http = require('node:http');
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const net = require('node:net');

const PORT = process.env.PORT || 3017;
const NOTES_DIR = path.join(__dirname, '..', 'data', 'notes');

// Nota: este servidor NO necesita levantar el "servicio interno" de la demo de
// SSRF. El fix bloquea por allowlist + IP privada ANTES de hacer fetch, así que
// nunca llega a conectar. (Evita además chocar con el puerto 9999 si el lab
// vulnerable está corriendo a la vez.)

function leerBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const json = (code, obj) => {
    res.writeHead(code, { 'content-type': 'application/json' });
    res.end(JSON.stringify(obj, null, 2));
  };

  // === Fix 1: Command injection =========================================
  // execFile NO usa shell: los argumentos se pasan como array y no se
  // interpretan metacaracteres. Además validamos el formato del host.
  if (url.pathname === '/ping') {
    const host = url.searchParams.get('host') || '';
    if (!/^[a-zA-Z0-9.\-]{1,253}$/.test(host)) {
      return json(400, { error: 'Host no válido' });
    }
    execFile('ping', ['-n', '1', host], (err, stdout, stderr) => {
      json(200, { host, stdout, stderr: stderr || err?.message });
    });
    return;
  }

  // === Fix 2: Path traversal ============================================
  // Resolvemos la ruta absoluta y comprobamos que sigue DENTRO del
  // directorio base antes de leer.
  if (url.pathname === '/nota') {
    const file = url.searchParams.get('file') || '';
    const ruta = path.resolve(NOTES_DIR, file);
    if (ruta !== NOTES_DIR && !ruta.startsWith(NOTES_DIR + path.sep)) {
      return json(400, { error: 'Ruta fuera del directorio permitido' });
    }
    fs.readFile(ruta, 'utf8', (err, contenido) => {
      if (err) return json(404, { error: 'Nota no encontrada' });
      json(200, { file, contenido });
    });
    return;
  }

  // === Fix 3: Ejecución de código arbitrario ============================
  // Nada de eval. Parser aritmético acotado: solo dígitos, operadores y
  // paréntesis. Cualquier otro carácter se rechaza.
  if (url.pathname === '/calc') {
    const expr = url.searchParams.get('expr') || '';
    if (!/^[\d+\-*/().\s]+$/.test(expr)) {
      return json(400, { error: 'Expresión no permitida: solo aritmética básica' });
    }
    try {
      // Function acotada a una expresión ya saneada por la allowlist anterior.
      const resultado = Function(`"use strict"; return (${expr});`)();
      json(200, { expr, resultado: String(resultado) });
    } catch (e) {
      json(400, { expr, error: 'Expresión inválida' });
    }
    return;
  }

  // === Fix 4: SSRF ======================================================
  // Allowlist de hosts permitidos + bloqueo de IPs privadas/loopback.
  if (url.pathname === '/preview') {
    const target = url.searchParams.get('url') || '';
    let parsed;
    try {
      parsed = new URL(target);
    } catch {
      return json(400, { error: 'URL no válida' });
    }
    const ALLOWLIST = ['example.com', 'www.example.com'];
    if (!['http:', 'https:'].includes(parsed.protocol) || !ALLOWLIST.includes(parsed.hostname)) {
      return json(403, { error: 'Destino no permitido', allowlist: ALLOWLIST });
    }
    if (esIpPrivada(parsed.hostname)) {
      return json(403, { error: 'Destino interno bloqueado' });
    }
    try {
      const resp = await fetch(parsed.href, { redirect: 'error' });
      json(200, { url: parsed.href, status: resp.status });
    } catch (e) {
      json(400, { error: 'No se pudo recuperar la URL' });
    }
    return;
  }

  // === Fix 5: Prototype pollution =======================================
  // Rechazamos claves peligrosas y usamos un objeto sin prototipo como base.
  if (url.pathname === '/config' && req.method === 'POST') {
    const body = await leerBody(req);
    try {
      const entrada = JSON.parse(body);
      const config = Object.create(null);
      mergeSeguro(config, entrada);
      const objetoNuevo = {};
      json(200, {
        configResultante: config,
        prototipoContaminado: {
          'objetoNuevo.isAdmin': objetoNuevo.isAdmin,
          'objetoNuevo.polluted': objetoNuevo.polluted,
        },
      });
    } catch (e) {
      json(400, { error: e.message });
    }
    return;
  }

  json(404, { error: 'Ruta no encontrada' });
});

const CLAVES_PROHIBIDAS = new Set(['__proto__', 'constructor', 'prototype']);
function mergeSeguro(destino, origen) {
  for (const clave in origen) {
    if (CLAVES_PROHIBIDAS.has(clave)) continue; // ← filtro del prototipo
    if (typeof origen[clave] === 'object' && origen[clave] !== null) {
      if (typeof destino[clave] !== 'object' || destino[clave] === null) destino[clave] = Object.create(null);
      mergeSeguro(destino[clave], origen[clave]);
    } else {
      destino[clave] = origen[clave];
    }
  }
  return destino;
}

function esIpPrivada(host) {
  if (host === 'localhost') return true;
  if (net.isIP(host) === 0) return false; // no es IP literal
  return (
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === '0.0.0.0' ||
    host === '::1'
  );
}

server.listen(PORT, () => {
  console.log(`✅  Servidor SEGURO escuchando en http://localhost:${PORT}`);
});
