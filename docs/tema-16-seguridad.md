# Tema 16 — Seguridad, vulnerabilidades y hardening

> **Duración estimada:** \~60 min **Tipo:** práctico — alumnos delante del teclado

## Objetivo del tema

Usar Claude como detector de patrones inseguros: inputs sin sanear, secretos expuestos, errores informativos para el atacante. La decisión sobre qué es aceptable sigue siendo humana — Claude propone, tú firmas.

***

## 1. Revisión de entradas, validaciones y saneamiento de datos de usuario

Toda entrada que viene del exterior es **maliciosa hasta demostrar lo contrario**.

Capas de defensa típicas:

| Capa     | Qué valida                                        |
| -------- | ------------------------------------------------- |
| Ruta     | Formato (tipo, presencia, longitud razonable)     |
| Servicio | Negocio (estado válido, conflictos, autorización) |
| Storage  | Tipo en persistencia (último filtro)              |
| Output   | Escape al renderizar (HTML, SQL, shell)           |

> Una sola capa de validación = un único punto de fallo. Defensa en profundidad o nada.

### 🧪 Demo 1 — Auditar validación de entrada en Notebox

* **Objetivo:** identificar entradas sin validar y proponer fixes priorizados.
* **Setup:** `git checkout tema-16/inicio`, `npm test` verde.

**Prompt literal:**

```
[CONTEXTO]
Notebox recibe inputs HTTP en src/routes/. Las funciones de servicio
usan estos inputs sin garantizar validación previa.

[OBJETIVO]
Audita todas las entradas de usuario que entran por src/routes/ y
detecta:
1. Entradas que no se validan (cita ruta:línea).
2. Validación insuficiente (qué falta: longitud, tipo, formato).
3. Datos que se pasan al storage sin sanear.

[FORMATO]
Tabla: entrada, archivo:línea, riesgo concreto, fix mínimo.
Ordenado por severidad. No incluyas riesgos genéricos.
```

**Qué observar:**

* Claude cita rutas y líneas concretas, no categorías generales.
* Los riesgos están priorizados, no listados en bloque.
* El fix propuesto es mínimo y aplicable.

### 🧩 Ejercicio 1 — Auditar validación de inputs

> **Rama:** `git checkout tema-16/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Audita las entradas HTTP del repo y entrega una tabla con 5 problemas ordenados por severidad: entrada, archivo:línea, riesgo concreto, fix mínimo. Aplica los 2 de severidad más alta y verifica que los tests siguen verdes.

## 2. Detección de prácticas inseguras en autenticación y autorización

Patrones a buscar:

* Tokens en URLs (acaban en logs).
* Comparación de tokens con `==` en lugar de comparación constante en tiempo.
* Sesiones sin expiración.
* Falta de rate limiting en login.
* Autorización basada solo en cookie sin verificar identidad en cada request.

> Notebox no tiene auth, pero los patrones aplican igual cuando la añadas. Profundizamos en arquitectura en el [Tema 25](tema-25-arquitectura.md).

## 3. Revisión de exposición accidental de secretos y configuraciones sensibles

Lugares donde se filtran secretos:

| Sitio                        | Cómo se filtra                            |
| ---------------------------- | ----------------------------------------- |
| Logs                         | `console.log(req.body)` con tokens dentro |
| Errores devueltos al cliente | Stack traces con paths internos           |
| Commits accidentales         | `.env` versionado por error               |
| Variables en código          | Hardcoded API keys                        |
| URLs de redirect             | Tokens en query string                    |

### 🧪 Demo 2 — Detectar exposición de secretos

* **Objetivo:** encontrar puntos donde el repo podría filtrar información sensible.
* **Setup:** misma rama. Hay secretos plantados (un `.env` con clave, un `console.log` que la imprime).

**Prompt literal:**

```
[CONTEXTO]
Analiza el repositorio buscando posibles exposiciones de secretos o
información sensible.

[OBJETIVO]
Identifica:
1. Archivos sensibles que pueden estar versionados (.env, credentials, keys).
2. Lugares donde se loguea información que podría incluir secretos.
3. Mensajes de error que podrían filtrar información del sistema al cliente.
4. URLs que contienen tokens en query strings.

[FORMATO]
Por cada hallazgo: archivo:línea, qué se expone, qué hacer.
No incluyas hallazgos especulativos sin línea concreta.
```

**Qué observar:**

* Encuentra `.env` versionado y propone añadirlo a `.gitignore`.
* Detecta el `console.log` que imprime el body de la request.
* Distingue entre exposición confirmada y patrón sospechoso.

### 🧩 Ejercicio 2 — Localizar y mitigar fugas de secretos

> **Rama:** `git checkout tema-16/ejercicio-02` · **Tiempo:** 15 min · **Tipo:** En clase

Detecta exposiciones reales en el repo (mínimo 3). Por cada una, aplica el fix: añadir a `.gitignore`, redactar logs, mover a variable de entorno, etc. Verifica que tras los fixes, una segunda pasada del prompt no detecta las mismas.

## 4. Análisis de riesgos en manejo de archivos, comandos y llamadas externas

Patrones peligrosos:

| Patrón                                        | Por qué es peligroso                |
| --------------------------------------------- | ----------------------------------- |
| `child_process.exec(userInput)`               | Command injection                   |
| `fs.readFile(userPath)` sin sanitizar         | Path traversal (`../../etc/passwd`) |
| `eval(userInput)` o `new Function(userInput)` | Ejecución de código arbitrario      |
| `fetch(userUrl)` sin allowlist                | SSRF (acceso a redes internas)      |
| Deserialización de JSON sin validación        | Prototype pollution                 |

> Si tu código recibe **algo del usuario** y lo pasa a alguna de estas funciones, ya tienes una vulnerabilidad pendiente de explotar.

## 5. Validación de dependencias desde perspectiva de superficie de ataque

Preguntas antes de añadir una dependencia:

* ¿Quién la mantiene? ¿Una persona o un equipo?
* ¿Cuánto tiempo entre commits recientes?
* ¿Cuántas dependencias transitivas arrastra?
* ¿Está auditada (`npm audit`)?
* ¿La necesitas o estás reemplazando 5 líneas de stdlib?

> Cada dependencia es código que ejecutas con permisos de tu proyecto. Trátala como código del equipo, no como "magia gratis".

## 6. Petición de revisiones específicas orientadas a OWASP y buenas prácticas

OWASP Top 10 traducido a Notebox:

| OWASP                         | Pregunta concreta para Claude                                      |
| ----------------------------- | ------------------------------------------------------------------ |
| A01 Broken Access Control     | "¿Hay endpoints donde el ID se acepta sin verificar ownership?"    |
| A03 Injection                 | "¿Hay queries o comandos construidos por concatenación de inputs?" |
| A05 Security Misconfiguration | "¿`.env` está versionado? ¿Modo debug en producción?"              |
| A07 Auth Failures             | "¿Hay endpoints sin autenticación que deberían tenerla?"           |
| A09 Logging Failures          | "¿Hay eventos relevantes (login, archive) sin loguear?"            |

### 🧪 Demo 3 — Revisión OWASP de un endpoint

* **Objetivo:** revisar un endpoint con criterios OWASP específicos.
* **Setup:** misma rama. Endpoint `POST /notes` con problemas.

**Prompt literal:**

```
[CONTEXTO]
Endpoint POST /notes en src/routes/notes.ts. Acepta { title, body }.

[OBJETIVO]
Aplica una revisión OWASP a este endpoint. Cubre específicamente:
- A01 Broken Access Control: ¿alguien puede crear notas de otro?
- A03 Injection: ¿hay alguna construcción dinámica con el input?
- A04 Insecure Design: ¿el contrato permite payloads enormes que tumben el servidor?
- A07 Auth: ¿está protegido o es público?
- A09 Logging: ¿se loguea la creación con datos suficientes para auditoría?

[FORMATO]
Por cada OWASP: hallazgo (sí/no/parcial), evidencia, fix.
```

**Qué observar:**

* Claude responde por OWASP, no en bloque.
* Cuando no aplica, dice "no aplica" en vez de inventar.
* Los fixes son específicos al endpoint.

### 🧩 Ejercicio 3 — Revisión OWASP de un endpoint problemático

> **Rama:** `git checkout tema-16/ejercicio-03` · **Tiempo:** 15 min · **Tipo:** En clase

Revisa el endpoint indicado en `EJERCICIO.md` aplicando 5 OWASP específicos. Entrega la tabla con hallazgos, evidencia y fix. Aplica los fixes de severidad alta y verifica que el endpoint sigue funcionando.

## 7. Seguridad en APIs, sesiones, CORS, tokens y control de acceso

Configuración mínima razonable en una API REST:

```ts
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? false }));
app.use(helmet());  // headers de seguridad por defecto
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
```

Para tokens:

* **Httponly + Secure + SameSite** en cookies de sesión.
* **Expiración corta** (acceso) + **refresh largo** (rotable).
* **Revocación posible** (lista negra de tokens revocados, o tokens de corta vida).

## 8. Revisión de errores que revelan información sensible al cliente

Antipatrones de respuestas de error:

```json
// MAL: stack trace con paths
{ "error": "Error: ENOENT: ../../etc/passwd at /app/src/storage.ts:42" }

// MAL: revela existencia de recurso
{ "error": "User exists but password incorrect" }

// BIEN
{ "error": "Authentication failed" }
```

> Los errores son una vía de exfiltración. Trátalos como output controlado, no como debug.

## 9. Integración de chequeos de seguridad en hotfixes y nuevas funcionalidades

Antes de mergear cualquier PR que toque inputs, auth, almacenamiento o configuración:

* [ ] ¿Hay tests nuevos para casos maliciosos (no solo camino feliz)?
* [ ] ¿`npm audit` no introduce nuevas vulnerabilidades?
* [ ] ¿Los errores no revelan info interna?
* [ ] ¿Los logs no contienen secretos?
* [ ] ¿La revisión OWASP del nuevo código se hizo?

> Esto es trabajo del autor del PR, no del reviewer. Si llega al reviewer sin esta lista, vuelve al autor.

## 10. Uso de Claude Code como apoyo a la seguridad sin delegar la decisión final

Lo que Claude hace bien:

* Detectar patrones inseguros conocidos.
* Recordar el OWASP Top 10 sin equivocarse.
* Generar tests con inputs maliciosos.

Lo que Claude no puede hacer:

* Decidir si el riesgo residual es aceptable para tu producto.
* Conocer las amenazas específicas de tu sector (fintech, salud, defensa).
* Evaluar el impacto reputacional de un incidente.

> La seguridad es decisión humana respaldada por análisis técnico. Claude aporta el análisis. La decisión la firmas tú.

***

## Resumen

* Defensa en profundidad: validación en cada capa, no en una sola.
* Toda entrada del exterior es maliciosa hasta probar lo contrario.
* Logs y mensajes de error son vías de exfiltración. Vigílalos.
* OWASP Top 10 traducido a tus endpoints concretos, no genérico.
* Claude detecta patrones. Tú decides qué riesgo es aceptable.
