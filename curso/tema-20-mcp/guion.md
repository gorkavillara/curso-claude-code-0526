# Tema 20 — MCP oficial, conectores remotos y servidores propios

> Duración estimada: 90 min · Tipo: conceptual + demos guiadas.
> Repositorio de prácticas: rama `tema-20/inicio` (Notebox con `.mcp.json` plantado y servidor MCP propio en `mcp-servers/notebox/`).

## 0. Objetivo del tema

Que el alumno entienda MCP como protocolo (no como integración mágica), sepa configurar servidores stdio y remotos en Claude Code, decida cuándo usar un conector oficial vs un MCP propio, gobierne las tools con allowlists/denylists, y diseñe un servidor MCP mínimo con contratos claros.

---

## 1. Flujo de sesión

Estructura **intercalada**. Cada demo introduce un concepto (configurar, escribir servidor, gobernar) y el ejercicio lo aplica en caliente sobre el repo Notebox. MCP es un tema con muchas piezas conceptuales y poca práctica habitual: hay que practicarlo a calzón.

```
00:00 — Encuadre                                      (5 min)
00:05 — Demo 1: listar tools y resources              (10 min)
00:15 — Ejercicio 1: conectar y explorar un MCP local (20 min, en clase)
00:35 — Bloque conceptual (puntos 2–5)                (10 min)
00:45 — Demo 2: anatomía de un servidor MCP propio    (10 min)
00:55 — Ejercicio 2: gobernar MCP con allow/deny      (25 min, en clase)
01:20 — Demo 3: probar una denylist en vivo           (5 min)
01:25 — Ejercicio 3: extender el servidor MCP propio  (25 min, en clase)
01:50 — Cierre y puente                               (5 min)
```

> Nota de timing: este tema dura 90 min ajustados. Si la sesión va corta, recortar el bloque conceptual intermedio a 5 min. Si va larga, mover el Ejercicio 3 a tarea asíncrona en último recurso (no es lo ideal: los tres ejercicios deberían ser en clase).

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "Hasta ahora Claude Code ha vivido **dentro del repo**: lee archivos, edita, ejecuta tests, llama a subagentes. Pero el día a día de un desarrollador no acaba en el repo: hay un Jira con la incidencia, un GitHub con el PR, un datawarehouse con las métricas, un Slack con la conversación, un Datadog con los logs. Hoy abrimos el agente a ese mundo. **MCP** es el protocolo que lo hace posible."

Tres ideas en pizarra:

1. **MCP es el LSP de los agentes.** Protocolo común, ecosistema de servidores reutilizables.
2. **stdio para local, HTTP/SSE para remoto.** No hay un tercero útil.
3. **Conectar un MCP es ampliar la superficie de ataque.** Allowlist/denylist no son opcionales.

> "Hoy no vamos a conectar Jira de empresa porque cada uno tiene el suyo. Vamos a montar el equivalente didáctico: un servidor MCP propio sobre el Notebox que ya conocéis. Cuando lo entendáis aquí, lo replicáis sobre Jira o el sistema interno que toque."

---

## 3. Demo 1 + Ejercicio 1 — Listar tools y resources de un servidor MCP local (≈ 30 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-20/inicio && npm install && npm test`. Verificar que `mcp-servers/notebox/server.js` existe y que `.mcp.json` declara dos servidores: `filesystem` y `notebox`. Arrancar Claude Code en la raíz del repo. **Aceptar el prompt de Claude para confiar en los servidores MCP del proyecto** la primera vez (es la primera vez que Claude ve este `.mcp.json`).

**Prompt literal:**

```
Lista los servidores MCP que tienes conectados en este proyecto.
Para cada servidor, dime:
1. Qué tools expone (nombre + descripción corta).
2. Qué resources expone, si alguno.
3. Qué transporte está usando (stdio / SSE / HTTP).

No invoques todavía ninguna tool. Solo describe el catálogo.
```

Lo que el alumno ve:

- Claude lista **dos servidores**: `filesystem` (multiples tools de FS) y `notebox` (tools `notebox_list_notes`, `notebox_get_note`, `notebox_create_note`, `notebox_archive_note`, `notebox_delete_note`).
- El resource `notebox://notes` aparece bajo el servidor `notebox`.
- Ambos servidores usan **stdio** — Claude los ha lanzado como procesos hijo.
- Si comentas una entrada del `.mcp.json` y reinicias Claude, ese servidor desaparece del catálogo.

> "El catálogo no está en el repo, está en el handshake. Por eso podéis cambiar la implementación del servidor sin tocar nada del cliente: mientras el contrato se respete, Claude no se entera."

### Ejercicio 1 (20 min)

> **Rama:** `git checkout tema-20/ejercicio-01`

Los alumnos:

1. Verifican que `npm install && npm test` van en verde.
2. Lanzan Claude Code y comprueban que los dos servidores MCP del `.mcp.json` arrancan (aceptando los prompts de confianza).
3. Listan tools y resources de cada uno usando el prompt de la demo.
4. Invocan **una tool de cada servidor** sobre el propio repo (ej: `filesystem read_file` sobre `package.json`, `notebox notebox_list_notes`).
5. Rellenan `NOTAS-MCP.md` con:
   - La tool más útil de cada servidor y por qué.
   - Qué tool no usarían en este proyecto y por qué.
   - Cómo cambiarías el `.mcp.json` para que el servidor `filesystem` solo pueda leer dentro de `src/`.

**Lo que el formador observa:**

- ¿Aceptan el prompt de confianza sin mirar qué servidor están aceptando? — Mala señal.
- ¿Identifican que `filesystem` puede leer **cualquier archivo** del proyecto, incluido `.env` si existiera?
- ¿Notan que `notebox_delete_note` es destructiva y debería estar en deny?
- ¿Alguno intenta invocar una tool por su nombre directamente vs pedírselo a Claude en lenguaje natural?

> "El catálogo es vuestro inventario de armas. Si no lo conocéis, no podéis gobernarlo."

---

## 4. Bloque conceptual intermedio — Transporte, conectores remotos, OAuth y activación (≈ 10 min)

> Este bloque es **denso pero corto**. No demos, no ejercicio inmediato. Sirve para que el alumno tenga el marco mental antes del Ejercicio 2.

**Lo que digo (resumen en pizarra):**

1. **stdio / SSE / HTTP** — los tres transportes. Recordar tabla: stdio para local, HTTP/SSE para red. SSE solo si hace falta push.
2. **Conectores oficiales** — GitHub, Linear, Jira, Notion, Postgres, Slack. Cada uno con su risk profile (mostrar tabla del punto 3 de docs/).
3. **OAuth** — token nunca en `.mcp.json`. Scope mínimo. Revocar al salir. Cuenta de servicio para automatización.
4. **Activación** — disponible ≠ activado. Tres formas de forzar invocación: nombrar servidor, nombrar tool, inyectar resource.

> "Notad que **disponible no es activado**. Tener Jira conectado no significa que Claude vaya a tocarlo en cada turno. Tiene que decidirlo o vosotros tenéis que nombrarlo. Si Claude no usa la tool que esperáis, casi siempre es que no la habéis nombrado."

---

## 5. Demo 2 + Ejercicio 2 — Anatomía del servidor propio + gobierno (≈ 35 min)

### Demo 2 (10 min)

> Setup: `git checkout tema-20/inicio`. Abrir `mcp-servers/notebox/server.js` en el IDE para mostrar el código mientras Claude lo describe.

**Prompt literal:**

```
Abre mcp-servers/notebox/server.js y explícame:
1. Qué tools declara (lista por nombre).
2. Qué inputSchema tiene cada tool (campos requeridos).
3. Qué resources publica, si alguno.
4. Cómo lee/escribe los datos (¿in-memory? ¿archivo? ¿API?).
5. Qué pasaría si una tool lanzara una excepción sin capturar.

Después invoca la tool notebox_list_notes y enséñame el output.
```

Lo que el alumno ve:

- Claude lee el código y cita líneas concretas. **Las tools y el inputSchema están en JSON Schema**, no en `any`.
- Los handlers devuelven `{ content: [{ type: "text", text: ... }] }`, no strings sueltos.
- Los datos del servidor viven **en memoria del proceso hijo** (un array `notes`), independiente del Notebox HTTP. Importante: el alumno suele confundir las dos cosas.
- Al invocar `notebox_list_notes`, Claude llama al servidor y devuelve el JSON. Si paras el servidor (matando el proceso), la siguiente invocación falla.

> "Fijaos en que el servidor MCP **no es el Notebox HTTP**. Es un proceso aparte que **podría** hablar con el Notebox HTTP por dentro, o con una DB, o con cualquier cosa. Aquí lo hemos hecho stand-alone para que no haya que arrancar dos servicios."

### Ejercicio 2 (25 min)

> **Rama:** `git checkout tema-20/ejercicio-02`

Los alumnos:

1. Inspeccionan el `.claude/settings.local.json` plantado: ya hay una `allow` y `deny` de ejemplo pero **no cubre todas las tools destructivas** del servidor `notebox`.
2. Identifican qué tools del servidor `notebox` son destructivas (`notebox_delete_note`, `notebox_archive_note`).
3. Editan `settings.local.json` para que **solo se puedan invocar las tools de lectura** del servidor `notebox` (`notebox_list_notes`, `notebox_get_note`). Bloquean explícitamente `notebox_delete_note`.
4. Reinician Claude (o ejecutan `/mcp` reconnect) y verifican:
   - Pedirle "lista las notas" → funciona.
   - Pedirle "borra la nota 1" → debe rebotar con un error que cite el bloqueo.
5. Rellenan `GOBIERNO-MCP.md` documentando:
   - Qué tools quedan permitidas y por qué.
   - Qué decisión han tomado: ¿allowlist (explícita) o denylist (por exclusión)? Justificar.
   - Qué pasaría si mañana el servidor publicara una tool nueva `notebox_purge`.

**Lo que el formador observa:**

- ¿Hacen denylist (cómoda, peligrosa) o allowlist (verbosa, segura)?
- ¿Justifican la decisión o copian la plantilla?
- ¿Verifican que el bloqueo funciona o se fían del archivo?
- ¿Alguno responde correctamente la pregunta de "qué pasa con `notebox_purge`"? Solo allowlist la deja fuera por defecto.

> "Un `settings.local.json` que no entendéis es peor que no tenerlo. Es seguridad de cartón: parece que protege, pero solo hasta que alguien añada una tool nueva."

---

## 6. Demo 3 + Ejercicio 3 — Probar denylist + extender servidor (≈ 30 min)

### Demo 3 (5 min)

> Setup: `git checkout tema-20/inicio`. Añadir manualmente `mcp__notebox__notebox_delete_note` a la lista `deny` de `.claude/settings.local.json`. Reiniciar Claude.

**Prompt literal:**

```
Borra la nota con id 1 usando la tool notebox_delete_note del
servidor notebox. Si no puedes, dime exactamente por qué.
```

Lo que el alumno ve:

- Claude **rechaza la invocación a nivel cliente**, antes de llegar al servidor.
- El mensaje cita explícitamente la denylist en `settings.local.json`.
- Si quitas la entrada del `deny` y reintentas, la invocación funciona (la nota se borra).

> "La denylist es **una regla del cliente**, no del servidor. El servidor sigue exponiendo la tool; Claude decide no llamarla. Esto es importante: si alguien usa otro cliente MCP contra el mismo servidor, no está protegido por vuestro `settings.local.json`."

### Ejercicio 3 (25 min)

> **Rama:** `git checkout tema-20/ejercicio-03`

Los alumnos:

1. Abren `mcp-servers/notebox/server.js`.
2. Añaden una tool nueva `notebox_count_archived` que devuelve `{ count: number }` con el número de notas archivadas. `inputSchema` vacío (sin parámetros).
3. Añaden un resource `notebox://stats` que devuelve un JSON con `{ total, archived, active }`.
4. **Capturan errores estructurados** (no `throw new Error("...")` suelto).
5. Reinician Claude para que descubra la tool nueva en el handshake.
6. Invocan la tool desde el chat y verifican el output.
7. Documentan en `EXTENSION.md`: qué tool añadiste, qué `inputSchema` tiene, qué resource expusiste, qué tests añadirías si esto fuera un servidor de producción.

**Lo que el formador observa:**

- ¿Usan `JSON Schema` válido en `inputSchema` o ponen `any`?
- ¿El `description` dice qué hace **Y cuándo NO** usarla?
- ¿Capturan errores o dejan que el handler crashee?
- ¿Reinician Claude o esperan que descubra la tool en caliente?
- ¿Hay alumnos que añaden 5 tools "ya que estamos"? — Antipatrón: una tool por intención.

> "Las tools nuevas se descubren en el handshake. Si el servidor está corriendo cuando publicáis la tool, no la veréis hasta reiniciar el cliente. Es una de las preguntas trampa más comunes en MCP."

---

## 7. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **MCP = protocolo común**, no integración mágica. Tools, resources, prompts.
2. **stdio / SSE / HTTP**. Local vs remoto. OAuth para serio.
3. **Gobierno con allow/deny.** El catálogo del servidor ≠ lo que el cliente puede invocar.
4. **Servidor propio**: contratos claros, errores estructurados, una tool por intención.

**Puente al Tema 21:**

> "Hemos visto cómo añadir herramientas externas al agente vía MCP. En el próximo tema vamos a empaquetar **el agente entero** — sus comandos, sus hooks, sus skills, sus MCPs — en un **plugin** que el equipo puede instalar como una unidad. Si MCP es 'cómo Claude habla con el mundo', plugins es 'cómo distribuimos el Claude del equipo'."

---

## 8. Notas para el formador

- **Requisito técnico**: Node 24+ instalado y `npx` funcional. El servidor `filesystem` se descarga vía `npx -y @modelcontextprotocol/server-filesystem` la primera vez (lleva 10–20 s; avisad para que no parezca que se ha colgado).

- **El prompt de confianza de Claude**: la primera vez que un proyecto trae `.mcp.json`, Claude pregunta si confías en él. Si los alumnos lo rechazan, los servidores no arrancan y el tema entero se viene abajo. **Avisarlo antes**.

- **Pregunta típica:** *"¿Por qué tengo que reiniciar Claude cuando cambio el servidor?"* → Porque el handshake ocurre al arrancar. Hay clientes con hot reload, pero el caso general es reiniciar. En la sesión, `/mcp` ofrece reconectar sin matar la sesión entera.

- **Pregunta típica:** *"¿Y para subagentes, los MCPs también funcionan?"* → Sí, pero el subagente solo ve las tools MCP que su frontmatter le permite invocar. Si el subagente tiene `tools: Read, Grep` sin permiso MCP, los servidores MCP están desactivados para él. Conectar Tema 19.

- **Error común en el Ejercicio 1:** invocar la tool por código JSON manualmente en lugar de pedírselo a Claude. Recordar: el alumno habla en lenguaje natural; Claude decide qué tool llamar.

- **Error común en el Ejercicio 2:** poner `deny: ["notebox"]` esperando bloquear todo el servidor. La sintaxis es **por tool**: `mcp__notebox__notebox_delete_note`. Confirmar formato.

- **Error común en el Ejercicio 3:** modificar el servidor pero no reiniciar Claude → "no me ve la tool". Reiniciar.

- **Sobre conectores remotos reales:** si algún alumno tiene Jira/Linear/GitHub Enterprise y quiere probar OAuth en vivo, **no en clase**. Pedir que abra un ticket de pruebas en una cuenta personal después y lo comparta. En clase no hay margen para depurar OAuth.

- **Sobre el servidor `filesystem` del ejemplo:** está apuntado a `./` por simplicidad. En un proyecto real, apuntad a `./src` o `./docs` para reducir alcance. Es un buen aprendizaje para el ejercicio 1.

- **Si alguien acaba antes del Ejercicio 3:** que añada una **segunda** tool (`notebox_recent_notes(n)`) y devuelva las `n` notas más recientes ordenadas por id. Más práctica con `inputSchema` y validación de input.

- **Sobre la dependencia `@modelcontextprotocol/sdk`:** el servidor del repo usa la versión publicada. Si la API del SDK cambia entre clases (es joven), regenerar `package-lock.json` antes de la sesión y probar. Vale la pena el `npm ls @modelcontextprotocol/sdk` previo.
