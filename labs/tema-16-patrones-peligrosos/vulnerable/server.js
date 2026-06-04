// ⚠️  CÓDIGO INTENCIONADAMENTE VULNERABLE — SOLO PARA EL LABORATORIO DEL TEMA 16
// No copies estos patrones a producción. Cada endpoint demuestra uno de los
// 5 patrones peligrosos del punto 4 del Tema 16 (manejo de archivos, comandos
// y llamadas externas). La versión corregida está en ../seguro/server.js
//
// Arranque:  node vulnerable/server.js
// Puerto:    3016 (configurable con la variable de entorno PORT)

const http = require('node:http');
const { exec } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const PORT = process.env.PORT || 3016;
const META_PORT = 9999; // "servicio interno" simulado para la demo de SSRF
const NOTES_DIR = path.join(__dirname, '..', 'data', 'notes');

// ---------------------------------------------------------------------------
// Servicio interno simulado (solo escucha en localhost). Representa un recurso
// que NUNCA debería ser alcanzable desde el exterior: metadatos de cloud,
// panel de admin interno, base de datos, etc. Lo usamos en la demo de SSRF.
// ---------------------------------------------------------------------------
http
  .createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        servicio: 'metadata-interno',
        aviso: 'Esto NO debería ser accesible desde fuera de la red interna',
        secreto: 'AKIA-EJEMPLO-CLAVE-INTERNA-1234',
      }),
    );
  })
  .listen(META_PORT, '127.0.0.1');

// Pequeño helper para leer el body JSON de una request.
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

  // === Patrón 1: Command injection ======================================
  // child_process.exec() concatena el input en una shell. Cualquier
  // metacaracter de shell (; | & && $()) ejecuta comandos arbitrarios.
  if (url.pathname === '/ping') {
    const host = url.searchParams.get('host') || '';
    exec(`ping -n 1 ${host}`, (err, stdout, stderr) => {
      json(200, { comando: `ping -n 1 ${host}`, stdout, stderr: stderr || err?.message });
    });
    return;
  }

  // === Patrón 2: Path traversal =========================================
  // Se concatena el nombre de archivo del usuario a un directorio base sin
  // validar. Con ../ se sale del directorio y se lee cualquier fichero.
  if (url.pathname === '/nota') {
    const file = url.searchParams.get('file') || '';
    const ruta = path.join(NOTES_DIR, file); // ← sin comprobar que sigue dentro de NOTES_DIR
    fs.readFile(ruta, 'utf8', (err, contenido) => {
      if (err) return json(404, { error: err.message });
      json(200, { ruta, contenido });
    });
    return;
  }

  // === Patrón 3: Ejecución de código arbitrario =========================
  // eval() ejecuta la cadena como JavaScript con acceso completo al proceso
  // (require, fs, child_process, process.env...).
  if (url.pathname === '/calc') {
    const expr = url.searchParams.get('expr') || '';
    try {
      const resultado = eval(expr); // ← jamás hagas esto con input externo
      json(200, { expr, resultado: String(resultado) });
    } catch (e) {
      json(400, { expr, error: e.message });
    }
    return;
  }

  // === Patrón 4: SSRF (Server-Side Request Forgery) =====================
  // fetch() a una URL arbitraria del usuario, sin allowlist. El servidor
  // hace de proxy hacia recursos internos no expuestos al exterior.
  if (url.pathname === '/preview') {
    const target = url.searchParams.get('url') || '';
    try {
      const resp = await fetch(target); // ← sin validar destino
      const texto = await resp.text();
      json(200, { url: target, status: resp.status, body: texto });
    } catch (e) {
      json(400, { url: target, error: e.message });
    }
    return;
  }

  // === Patrón 5: Prototype pollution ====================================
  // Deep-merge de JSON del usuario en un objeto sin filtrar __proto__.
  // Permite inyectar propiedades en Object.prototype (afecta a TODOS los
  // objetos del proceso).
  if (url.pathname === '/config' && req.method === 'POST') {
    const body = await leerBody(req);
    try {
      const entrada = JSON.parse(body);
      const config = {};
      mergeProfundo(config, entrada); // ← merge recursivo sin proteger el prototipo
      // Demostramos la contaminación: un objeto recién creado y vacío.
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

  json(404, { error: 'Ruta no encontrada', rutas: ['/ping', '/nota', '/calc', '/preview', 'POST /config'] });
});

// Merge recursivo ingenuo: copia claves del origen al destino sin filtrar.
function mergeProfundo(destino, origen) {
  for (const clave in origen) {
    if (typeof origen[clave] === 'object' && origen[clave] !== null) {
      if (typeof destino[clave] !== 'object' || destino[clave] === null) destino[clave] = {};
      mergeProfundo(destino[clave], origen[clave]);
    } else {
      destino[clave] = origen[clave];
    }
  }
  return destino;
}

server.listen(PORT, () => {
  console.log(`⚠️  Servidor VULNERABLE escuchando en http://localhost:${PORT}`);
  console.log(`    Servicio interno simulado en http://127.0.0.1:${META_PORT} (demo SSRF)`);
});
