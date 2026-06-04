# Laboratorio — Tema 16, punto 4

**Análisis de riesgos en manejo de archivos, comandos y llamadas externas.**

Este lab reproduce, de forma **aislada y reproducible en `localhost`**, los 5 patrones peligrosos de la tabla del [punto 4 del Tema 16](../../docs/tema-16-seguridad.md):

| # | Patrón | Vulnerabilidad | Endpoint |
|---|---|---|---|
| 1 | `child_process.exec(userInput)` | Command injection | `GET /ping` |
| 2 | `fs.readFile(userPath)` sin sanitizar | Path traversal | `GET /nota` |
| 3 | `eval(userInput)` / `new Function(userInput)` | Ejecución de código arbitrario | `GET /calc` |
| 4 | `fetch(userUrl)` sin allowlist | SSRF | `GET /preview` |
| 5 | Deserialización de JSON sin validación | Prototype pollution | `POST /config` |

> ⚠️ **El código de `vulnerable/` es inseguro a propósito.** Sirve para que los alumnos lo detecten con Claude (Demos y Ejercicios del Tema 16) y comparen con el fix. No lo copies a producción y no apuntes los exploits contra sistemas que no sean este lab en tu máquina.

## Requisitos

- **Node.js 18+** (probado en v24). Sin dependencias externas: solo módulos `node:*` y `fetch` global.
- No hay `npm install`. Se ejecuta directamente con `node`.

## Estructura

```
labs/tema-16-patrones-peligrosos/
├── README.md                     ← este archivo
├── vulnerable/server.js          ← los 5 patrones, explotables (puerto 3016)
├── seguro/server.js              ← los 5 fixes (puerto 3017)
└── data/
    ├── notes/bienvenida.txt      ← fichero "legítimo" que /nota SÍ puede leer
    └── SECRETO-NO-PUBLICO.txt    ← fichero sensible FUERA de notes/ (objetivo del traversal)
```

## Arranque

Desde la carpeta del lab (`labs/tema-16-patrones-peligrosos/`):

```powershell
# Terminal 1 — servidor vulnerable
node vulnerable/server.js     # http://localhost:3016

# Terminal 2 (opcional) — servidor con los fixes
node seguro/server.js         # http://localhost:3017
```

El servidor vulnerable levanta además un **servicio interno simulado** en `127.0.0.1:9999` (metadatos con un "secreto"), que representa un recurso que jamás debería ser accesible desde fuera. Lo usamos en la demo de SSRF.

> En Windows usa `curl.exe` (no el alias `curl` de PowerShell, que es `Invoke-WebRequest` y tiene otra sintaxis). Los comandos de abajo usan `curl.exe`.

---

## Reproducción de cada patrón

Cada bloque muestra: **(A)** el ataque contra `vulnerable/` (puerto 3016) y su resultado real, y **(B)** que `seguro/` (puerto 3017) lo bloquea sin romper el uso legítimo.

### 1. Command injection — `GET /ping`

El endpoint hace `exec("ping -n 1 " + host)`. Como `exec` usa una shell, el carácter `&` encadena un segundo comando.

```powershell
# A) Ataque: ejecuta whoami después del ping
curl.exe "http://localhost:3016/ping?host=127.0.0.1%20%26%20whoami"
#   → el stdout incluye el resultado de `whoami` (¡ejecución arbitraria!)

# B) Bloqueado en el seguro (valida el formato del host y usa execFile sin shell)
curl.exe "http://localhost:3017/ping?host=127.0.0.1%20%26%20whoami"   # → {"error":"Host no válido"}
curl.exe "http://localhost:3017/ping?host=127.0.0.1"                   # → ping normal, OK
```

`%20%26%20` es ` & ` codificado. **Fix:** `execFile('ping', ['-n','1', host])` (sin shell) + validación con regex.

### 2. Path traversal — `GET /nota`

Concatena el nombre de archivo a `data/notes/` con `path.join`, sin comprobar que el resultado siga dentro del directorio. Con `../` se escapa.

```powershell
# A) Ataque: leer un fichero fuera de notes/
curl.exe "http://localhost:3016/nota?file=..%2FSECRETO-NO-PUBLICO.txt"
#   → devuelve FLAG{path-traversal-exitoso} (representa /etc/passwd, config, claves...)

# B) Bloqueado en el seguro (resuelve la ruta y exige que empiece por el dir base)
curl.exe "http://localhost:3017/nota?file=..%2FSECRETO-NO-PUBLICO.txt"  # → {"error":"Ruta fuera del directorio permitido"}
curl.exe "http://localhost:3017/nota?file=bienvenida.txt"               # → la nota legítima, OK
```

`%2F` es `/`. **Fix:** `path.resolve(base, file)` y verificar `ruta.startsWith(base + path.sep)`.

### 3. Ejecución de código arbitrario — `GET /calc`

Una "calculadora" que hace `eval(expr)`. `eval` tiene acceso a `require`, `fs`, `process`...

```powershell
# A) Ataque: en vez de calcular, leemos un fichero del servidor
curl.exe "http://localhost:3016/calc?expr=require('fs').readFileSync('data/SECRETO-NO-PUBLICO.txt','utf8')"
#   → devuelve el contenido del secreto (podría ser cualquier comando)

# B) Bloqueado en el seguro (allowlist de caracteres: solo aritmética)
curl.exe "http://localhost:3017/calc?expr=require('fs')"   # → {"error":"Expresión no permitida: solo aritmética básica"}
curl.exe "http://localhost:3017/calc?expr=2*(3%2B4)"       # → {"resultado":"14"}  (%2B es el +)
```

**Fix:** nunca `eval` con input externo. Allowlist `^[\d+\-*/().\s]+$` antes de evaluar.

### 4. SSRF — `GET /preview`

Hace `fetch(url)` a cualquier URL del usuario. El servidor se convierte en proxy hacia la red interna.

```powershell
# A) Ataque: alcanzar el servicio interno que NO está expuesto al exterior
curl.exe "http://localhost:3016/preview?url=http://127.0.0.1:9999/"
#   → devuelve {"secreto":"AKIA-EJEMPLO-CLAVE-INTERNA-1234"} (exfiltración de metadatos internos)

# B) Bloqueado en el seguro (allowlist de hosts + bloqueo de IPs privadas/loopback)
curl.exe "http://localhost:3017/preview?url=http://127.0.0.1:9999/"   # → {"error":"Destino no permitido"}
```

**Fix:** allowlist de dominios permitidos, bloqueo de rangos privados (`127.*`, `10.*`, `192.168.*`, `169.254.*`, `172.16-31.*`) y `redirect: 'error'`.

### 5. Prototype pollution — `POST /config`

Hace un *deep-merge* del JSON del usuario en un objeto, sin filtrar la clave `__proto__`. Eso contamina `Object.prototype`: **todos** los objetos del proceso heredan la propiedad inyectada.

```powershell
# A) Ataque: inyectar isAdmin en el prototipo global
#    (en PowerShell, comillas SIMPLES alrededor del JSON; no escapes las dobles)
curl.exe -X POST "http://localhost:3016/config" -H "content-type: application/json" --data '{"__proto__":{"isAdmin":true,"polluted":"si"}}'
#   → la respuesta muestra que un objeto recién creado {} ya tiene isAdmin=true

# B) Bloqueado en el seguro (rechaza __proto__/constructor/prototype y usa Object.create(null))
curl.exe -X POST "http://localhost:3017/config" -H "content-type: application/json" --data '{"__proto__":{"isAdmin":true,"polluted":"si"}}'
#   → "prototipoContaminado": {} (el objeto nuevo NO hereda nada)
```

**Fix:** lista de claves prohibidas (`__proto__`, `constructor`, `prototype`) y/o `Object.create(null)` como base del merge.

---

## Uso en clase (Tema 16)

1. **Detección (Demos 1–2 / Ejercicio 1):** arranca solo el servidor vulnerable y pide a Claude que audite `vulnerable/server.js` buscando los patrones del punto 4. Comprueba que cita `archivo:línea` y propone fix mínimo.
2. **Explotación:** ejecuta los comandos `A)` para ver el impacto real de cada patrón.
3. **Fix:** compara con `seguro/server.js` (o pide a Claude que aplique el fix sobre el vulnerable) y reejecuta los exploits para confirmar que ahora fallan, mientras el uso legítimo sigue funcionando.

> La decisión sobre qué riesgo residual es aceptable sigue siendo humana. Claude detecta el patrón y propone el fix; tú firmas.
