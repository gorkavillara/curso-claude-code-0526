# Soluciones — Tema 20

## Ejercicio 1 — Conectar y explorar un servidor MCP local

### Solución de referencia

El `.mcp.json` plantado en `tema-20/ejercicio-01` declara dos servidores stdio:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"]
    },
    "notebox": {
      "command": "node",
      "args": ["mcp-servers/notebox/server.js"]
    }
  }
}
```

**Prompt esperado:**

```
Lista los servidores MCP que tienes conectados en este proyecto.
Para cada servidor, dime qué tools y resources expone y qué transporte usa.
```

**Catálogo esperado:**

- **filesystem** (stdio) → `read_file`, `read_multiple_files`, `write_file`, `edit_file`, `create_directory`, `list_directory`, `directory_tree`, `move_file`, `search_files`, `get_file_info`, `list_allowed_directories`.
- **notebox** (stdio) → tools: `notebox_list_notes`, `notebox_get_note`, `notebox_create_note`, `notebox_archive_note`, `notebox_delete_note`. Resources: `notebox://notes` (listado), `notebox://note/{id}` (template por id).

**`NOTAS-MCP.md` ejemplo de respuesta correcta:**

```markdown
# Notas MCP

## Tool más útil

- **filesystem**: `read_multiple_files` — permite leer todo `src/` de golpe sin
  ir archivo a archivo. Útil para que Claude se haga el mapa mental del repo.
- **notebox**: `notebox_list_notes` — es la única que da contexto sin requerir
  saber un id concreto.

## Tool que no usaría aquí

- `filesystem.write_file` — abre la puerta a que Claude edite por MCP en lugar
  de por su tool nativa `Edit`, y eso se sale de la auditoría habitual.
- `notebox.notebox_delete_note` — destructiva, sin undo. Va a denylist.

## Cómo restringir filesystem a src/

Cambiar el `args` del servidor en `.mcp.json`:

  "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src"]

Así el servidor solo puede operar dentro de `src/`. Las tools siguen siendo las
mismas, pero su scope efectivo se reduce.
```

### Criterio de éxito

- [ ] Ambos servidores arrancan (el `prompt de confianza` se acepta).
- [ ] El alumno lista las tools y resources de ambos.
- [ ] Invoca **al menos una tool de cada servidor**.
- [ ] `NOTAS-MCP.md` identifica al menos una tool peligrosa y justifica.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Rechazar el prompt de confianza de Claude | Los servidores no arrancan; el ejercicio entero queda muerto. Reiniciar y aceptar. |
| Pedir a Claude que ejecute "código JSON manualmente" para invocar la tool | Recordar: hablamos en lenguaje natural; Claude elige la tool. |
| Confundir el servidor MCP `notebox` con el HTTP API del Notebox | Son procesos distintos. El MCP vive en `mcp-servers/notebox/`, el HTTP en `src/server.ts`. |

---

## Ejercicio 2 — Gobernar MCP con allowlists y denylists

### Solución de referencia

Tools destructivas del servidor `notebox`: `notebox_create_note`, `notebox_archive_note`, `notebox_delete_note`.

**`.claude/settings.local.json` esperado (estrategia allowlist):**

```json
{
  "permissions": {
    "allow": [
      "mcp__notebox__notebox_list_notes",
      "mcp__notebox__notebox_get_note",
      "mcp__filesystem__read_file",
      "mcp__filesystem__list_directory",
      "mcp__filesystem__search_files"
    ],
    "deny": [
      "mcp__notebox__notebox_delete_note",
      "mcp__notebox__notebox_archive_note",
      "mcp__notebox__notebox_create_note",
      "mcp__filesystem__write_file",
      "mcp__filesystem__edit_file",
      "mcp__filesystem__move_file"
    ]
  }
}
```

**Verificación:**

- `Lista las notas` → funciona (`notebox_list_notes` está en allow).
- `Borra la nota 1` → Claude rechaza la invocación citando `settings.local.json`.

**`GOBIERNO-MCP.md` ejemplo de respuesta correcta:**

```markdown
# Gobierno MCP — tema 20 ejercicio 2

## Tools permitidas

Solo lectura: `notebox_list_notes`, `notebox_get_note`. En `filesystem`,
solo `read_*` y `list_directory`.

## Decisión: allowlist + denylist explícita

Aunque la allowlist sola bastaría, mantengo la denylist explícita para que
quede **documentado** qué tools se han considerado peligrosas y rechazado
deliberadamente. Es más texto pero es auditoría.

## Qué pasaría si mañana apareciera notebox_purge

Con allowlist: queda **fuera por defecto**. Tendría que añadirla
explícitamente para que Claude pudiera invocarla. Esa es la ventaja.

Con denylist sola: estaría **permitida** hasta que alguien la añada al deny.
Eso es lo que pasa con denylists puras y por qué en proyectos sensibles
gana la allowlist.
```

### Criterio de éxito

- [ ] `settings.local.json` bloquea al menos `notebox_delete_note`.
- [ ] Al pedir borrar una nota, Claude rebota citando la denylist.
- [ ] Al pedir listar notas, funciona.
- [ ] `GOBIERNO-MCP.md` justifica la decisión y responde la pregunta sobre `notebox_purge`.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| `deny: ["notebox"]` en lugar de por tool | Sintaxis incorrecta. Es `mcp__<servidor>__<tool>`. |
| Solo denylist sin reflexión sobre nuevas tools | El ejercicio pide justificar la elección entre estrategias. Sin eso, está incompleto. |
| No reiniciar Claude tras editar el archivo | Algunos clientes recargan en caliente, otros no. Reiniciar es lo fiable. |
| Confiar en que el servidor protege | El bloqueo es del cliente. Otro cliente MCP contra el mismo servidor lo ignora. |

---

## Ejercicio 3 — Extender el servidor MCP propio

### Solución de referencia

**Cambio en `mcp-servers/notebox/server.js`** (fragmentos relevantes — el resto del servidor se mantiene):

```javascript
// Declarar la tool nueva en la lista de tools
{
  name: "notebox_count_archived",
  description:
    "Devuelve cuántas notas archivadas hay en el almacén. No usar para " +
    "obtener la lista; usa notebox_list_notes con archived=true.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
},
```

```javascript
// Handler de la tool
case "notebox_count_archived": {
  try {
    const count = notes.filter((n) => n.archived).length;
    return {
      content: [{ type: "text", text: JSON.stringify({ count }) }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify({
            code: "COUNT_FAILED",
            message: err.message,
          }),
        },
      ],
    };
  }
}
```

**Resource `notebox://stats`:**

```javascript
// Declarar el resource
{
  uri: "notebox://stats",
  name: "Notebox stats",
  description: "Totales agregados del almacén (total, archived, active).",
  mimeType: "application/json",
}
```

```javascript
// Handler en ReadResourceRequest para uri "notebox://stats"
if (uri === "notebox://stats") {
  const total = notes.length;
  const archived = notes.filter((n) => n.archived).length;
  const active = total - archived;
  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify({ total, archived, active }),
      },
    ],
  };
}
```

**Verificación (después de reiniciar Claude):**

```
Usa la tool notebox_count_archived del servidor notebox y dime el resultado.
```

Esperado: `{"count": <número>}`. Con el fixture inicial, suele ser `1`.

```
Lee el resource notebox://stats y resume los totales.
```

Esperado: JSON con `total`, `archived`, `active`.

**`EXTENSION.md` ejemplo:**

```markdown
# Extensión del servidor notebox

## Tool añadida

`notebox_count_archived` — devuelve `{ count: number }`. inputSchema vacío
(no acepta argumentos).

`description` incluye **cuándo NO usarla**: si necesitas la lista, no esta
tool — usa `notebox_list_notes`.

## Resource añadido

`notebox://stats` — JSON con `{ total, archived, active }`. URI estable que
no depende del estado interno del array.

## Manejo de errores

Handler envuelto en try/catch. Si algo falla, devuelve `isError: true` con
un payload `{ code, message }`. Nunca lanza excepción al cliente.

## Tests que añadiría en producción

1. `notebox_count_archived` con almacén vacío → `{ count: 0 }`.
2. Con todas archivadas → `count` = total.
3. Resource `notebox://stats` con almacén vacío → `{ total: 0, archived: 0, active: 0 }`.
4. URI desconocida (`notebox://nope`) → error estructurado, no excepción.
5. Servidor tras 10000 notas → tiempos de respuesta razonables (no carga, mide).
```

### Criterio de éxito

- [ ] La tool aparece en el catálogo al reiniciar Claude.
- [ ] `inputSchema` es JSON Schema válido (no `any` ni vacío).
- [ ] `description` indica para qué Y cuándo NO usarla.
- [ ] El resource `notebox://stats` devuelve JSON parseable.
- [ ] Los errores se devuelven con `isError: true` + payload estructurado, no `throw`.
- [ ] `EXTENSION.md` documenta tool, resource, error handling y tests.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Tool añadida pero Claude no la ve | No se reinició Claude. El handshake es al arrancar. |
| `inputSchema: {}` plano sin `type` ni `properties` | Claude no sabe rellenarla; falla. Pedir schema explícito. |
| `throw new Error("...")` en el handler | Si la excepción no se captura, el cliente puede perder la conexión. Forzar try/catch + payload de error. |
| Resource URI inestable (`notebox://stats/<timestamp>`) | Los resources deberían tener URIs idempotentes para que el agente pueda cachearlos. |
| Añadir 5 tools por "completitud" | Antipatrón. Una tool por intención. El ejercicio pide una. |
