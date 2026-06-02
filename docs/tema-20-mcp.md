# Tema 20 — MCP oficial, conectores remotos y servidores propios

> **Duración estimada:** \~90 min **Tipo:** conceptual + demos guiadas

## Objetivo del tema

Entender qué es MCP y qué transporte usar en cada caso (stdio / SSE / HTTP), configurar conectores oficiales y servidores propios en Claude Code, gobernar qué herramientas se pueden invocar y cuáles no, y diseñar un servidor MCP mínimo para abrir Claude Code a un sistema interno de la empresa con contratos claros.

***

## 1. Qué es MCP y por qué cambia la integración del asistente con el entorno

**MCP** (Model Context Protocol) es el protocolo que permite a Claude Code hablar con **herramientas externas al proceso del agente**: bases de datos, ticketing, CI, datawarehouse, observabilidad. Antes de MCP, cada integración era un parche; con MCP, hay **un protocolo común** y un ecosistema de servidores reutilizables.

| Sin MCP                                  | Con MCP                                      |
| ---------------------------------------- | -------------------------------------------- |
| Cada integración es un script ad-hoc     | Un servidor MCP estándar reutilizable        |
| Las herramientas viven dentro del agente | Las herramientas viven en procesos separados |
| Mezclar Jira + Git + DWH = pegamento     | El agente las invoca por igual               |
| Auth y permisos artesanales              | Negociación de capabilities en el handshake  |
| Cada equipo reinventa la rueda           | Servidores publicados en el ecosistema       |

> MCP es para Claude Code lo que **LSP fue para los IDEs**: un protocolo abierto que separa el cliente (el agente) del backend (la herramienta).

Tres conceptos básicos que expone un servidor MCP:

* **Tools** — funciones invocables (`create_ticket`, `search_logs`).
* **Resources** — datos consultables identificados por URI (`jira://ticket/EV-1234`, `db://users/42`).
* **Prompts** — plantillas de prompt reutilizables ofrecidas por el servidor.

### 🧪 Demo 1 — Listar tools y resources de un servidor MCP local

* **Objetivo:** ver el handshake MCP en vivo: qué tools y resources publica un servidor stdio y cómo Claude Code los descubre al arrancar.
* **Setup:** rama `tema-20/inicio`. El repo ya trae un `.mcp.json` con dos servidores locales plantados: `filesystem` (oficial de Anthropic) y `notebox` (servidor MCP propio en `mcp-servers/notebox/`). Lanzar Claude Code en la raíz del repo.

**Prompt literal:**

```
Lista los servidores MCP que tienes conectados en este proyecto.
Para cada servidor, dime:
1. Qué tools expone (nombre + descripción corta).
2. Qué resources expone, si alguno.
3. Qué transporte está usando (stdio / SSE / HTTP).

No invoques todavía ninguna tool. Solo describe el catálogo.
```

**Qué observar:**

* Claude responde con **dos servidores**: `filesystem` (varias tools `read_file`, `list_directory`, etc.) y `notebox` (tools tipo `notebox_list_notes`, `notebox_get_note`).
* Ambos usan transporte **stdio** (proceso hijo lanzado por Claude Code).
* El catálogo de tools sale del **handshake MCP** al arrancar, no de archivos del repo. Si paras el servidor, las tools desaparecen.
* Cierra Claude y vuelve a abrirlo sin uno de los servidores (comenta una entrada en `.mcp.json`): el catálogo cambia.

### 🧩 Ejercicio 1 — Conectar y explorar un servidor MCP local

> **Rama:** `git checkout tema-20/ejercicio-01` · **Tiempo:** 20 min · **Tipo:** En clase

Verifica que los dos servidores MCP del `.mcp.json` arrancan, lista sus tools y resources desde Claude Code, e invoca una tool de cada servidor sobre el propio repo. Anota en `NOTAS-MCP.md` qué tool de cada servidor te ha parecido más útil y por qué.

***

## 2. Diferencia entre servidores stdio, SSE y HTTP en el ecosistema MCP

MCP no es un único transporte. Hay tres formas estándar de servir un MCP y cada una encaja en un escenario distinto.

| Transporte                   | Cómo arranca                                                 | Dónde encaja                                              | Latencia | Auth                           |
| ---------------------------- | ------------------------------------------------------------ | --------------------------------------------------------- | -------- | ------------------------------ |
| **stdio**                    | Claude lanza un proceso hijo (`node`, `python`, `npx`...)    | Servidor local, herramientas del propio repo o del equipo | Mínima   | El propio proceso (no hay red) |
| **SSE** (Server-Sent Events) | Claude se conecta a una URL HTTP que mantiene stream abierto | Servidor remoto que necesita push en tiempo real          | Baja     | Headers HTTP (Bearer, OAuth)   |
| **HTTP** (streamable)        | Llamadas HTTP estándar a un endpoint                         | Servidor remoto sin push, request/response                | Variable | Headers HTTP (Bearer, OAuth)   |

> Regla mental: **stdio para lo que vive en tu máquina** (filesystem, git local, scripts internos), **HTTP/SSE para lo que vive en la red** (Jira de empresa, datawarehouse, GitHub Enterprise).

Configuración en `.mcp.json`:

```json
{
  "mcpServers": {
    "filesystem-local": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"]
    },
    "jira-corp": {
      "url": "https://mcp.example.corp/jira",
      "transport": "http"
    }
  }
}
```

* **stdio** declara `command` + `args`. Claude lanza el binario al arrancar la sesión.
* **HTTP / SSE** declaran `url` (y opcionalmente `headers` para auth). No hay proceso local.

## 3. Uso de conectores remotos oficiales y sus implicaciones de seguridad

Anthropic y la comunidad publican **conectores oficiales** para sistemas habituales (GitHub, Slack, Linear, Jira, Notion, varias dbs). Pueden añadirse al `.mcp.json` del proyecto, al config de usuario, o gestionarse desde el panel de **Connectors** de la app/CLI.

| Conector                | Para qué                           | Riesgo principal                           |
| ----------------------- | ---------------------------------- | ------------------------------------------ |
| GitHub MCP              | PRs, issues, búsqueda en repos     | Token con scope amplio = puede mover ramas |
| Linear / Jira MCP       | Tickets, transiciones, comentarios | Borrado o transición masiva accidental     |
| Slack MCP               | Enviar/leer mensajes               | Mensajes a canales públicos por error      |
| Notion / Confluence MCP | Búsqueda + edición de docs         | Edición masiva sobre páginas vivas         |
| Postgres / DWH MCP      | Queries de lectura                 | DROP / DELETE si el rol no es read-only    |

Implicaciones de seguridad que aparecen al conectar un MCP remoto:

* **Las credenciales viven fuera del repo**, pero **las invocaciones** quedan en el log de la sesión. Auditar qué tools se han llamado.
* **El blast radius es el del token**, no el del agente. Si el token tiene write, el agente puede escribir.
* **Mismo MCP, dos perfiles**: un token "lectura" en `.mcp.json` del proyecto, un token "lectura+escritura" en el config personal del usuario que sí tiene permiso.
* **Los servidores remotos pueden cambiar su catálogo**: una tool nueva puede aparecer sin que tú lo sepas. Revisar periódicamente.

> Un conector remoto sin scope acotado es **un préstamo de tus credenciales al agente**. Si no aceptarías darle ese token a un becario el primer día, no lo añadas sin restringir.

## 4. Gestión de autenticación OAuth en MCP remoto cuando aplica

Los conectores oficiales más serios (GitHub, Jira, Linear, Notion) usan **OAuth** en lugar de tokens estáticos. El flujo típico:

1. Añades el servidor al `.mcp.json` (o lo activas desde Connectors).
2. La primera vez que lo invocas, Claude abre el navegador → te autenticas en el proveedor → consientes los scopes → vuelves a Claude.
3. El token (+ refresh) queda guardado **fuera del repo** (en el config de usuario, encriptado).
4. Las invocaciones siguientes son automáticas hasta que el token expira.

Buenas prácticas:

* **Nunca pongas tokens OAuth en el `.mcp.json` del proyecto.** Ese archivo se commitea: cualquiera que lo lea, se lleva el token.
* **Si el conector ofrece scopes**, pide el mínimo: lectura primero; escritura solo si el flujo lo necesita.
* **OAuth de usuario vs OAuth de servicio**: para automatización (cron, CI), usa una cuenta de servicio con scope dedicado, no tu token personal.
* **Revoca rápido**: si dejas un proyecto, revoca el OAuth desde el panel del proveedor, no solo del lado de Claude.

> OAuth no convierte un MCP en seguro por arte de magia. **Reduce el riesgo de leak**, pero el blast radius sigue siendo el de los scopes consentidos. Auditar los scopes es parte del onboarding.

## 5. Mención y activación de herramientas MCP dentro de la sesión

Tener un servidor MCP conectado no significa que sus tools se invoquen automáticamente. Hay tres niveles de "estar activo":

| Nivel                    | Qué significa                                                 | Cuándo se da                                                 |
| ------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------ |
| **Disponible**           | El servidor está conectado y publica tools                    | Claude las ve en su catálogo                                 |
| **Activado**             | Claude decide invocar la tool por iniciativa propia           | El prompt sugiere la tarea ("crea un ticket de Jira con...") |
| **Mencionado explícito** | El usuario nombra la tool ("usa la tool `jira_create_issue`") | Cuando quieres forzar el uso                                 |

Tres formas de **forzar la activación** de una tool MCP:

* Nombrar el **servidor** y dejar que Claude elija la tool: `Usa el servidor jira-corp para...`.
* Nombrar la **tool exacta**: `Invoca la tool jira_search del servidor jira-corp con query "EV in (EV-12, EV-13)"`.
* Inyectar **resources** por URI: `Usa el resource jira://ticket/EV-1234 como contexto antes de responder`.

> Si Claude no usa la tool que esperas, suele ser porque **el prompt no la pide explícitamente** y el agente cree que el conocimiento ya está en el repo. Nómbrala.

## 6. Diseño de servidores MCP propios para sistemas internos de empresa

Cuando el sistema interno **no tiene** conector oficial (datawarehouse propio, microservicio de pricing, herramienta de tickets casera), tiene sentido publicar un MCP propio. El patrón canónico:

1. **Inventario de operaciones** que el agente debe poder hacer (3–7, no 50).
2. **Cada operación = una tool** con `name`, `description`, `inputSchema` (JSON Schema) y handler.
3. **Datos de solo lectura = resources** identificados por URI estable (`pricing://product/123`).
4. **stdio si vive cerca del repo, HTTP si es servicio compartido** del equipo.
5. **Errores como respuestas estructuradas**, no como excepciones que tumben el handshake.
6. **Tests del servidor** independientes del cliente: invocar las tools desde un harness propio.

Stacks habituales: TypeScript con `@modelcontextprotocol/sdk`, Python con `mcp` SDK. Ambos cubren stdio, SSE y HTTP con la misma API.

### 🧪 Demo 2 — Anatomía de un servidor MCP propio (stdio)

* **Objetivo:** abrir un servidor MCP escrito en el repo, ver dónde se declaran las tools, dónde el `inputSchema` y dónde el handler.
* **Setup:** rama `tema-20/inicio`. El servidor propio vive en `mcp-servers/notebox/server.js`. El `.mcp.json` lo conecta como servidor `notebox`.

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

**Qué observar:**

* Claude **lee el código del servidor**, no inventa el catálogo. Cita líneas concretas.
* Las tools tienen `inputSchema` JSON Schema, no `any`. Ese contrato es lo que MCP usa para validar la llamada.
* El handler devuelve `{ content: [...] }`, no un string suelto. Es parte del protocolo.
* Al invocar la tool, el resultado viene del proceso hijo, no del repo. Si para el servidor, la tool desaparece.

### 🧩 Ejercicio 2 — Gobernar MCP con allowlists y denylists

> **Rama:** `git checkout tema-20/ejercicio-02` · **Tiempo:** 25 min · **Tipo:** En clase

Restringe qué tools MCP puede usar Claude en este proyecto editando `.claude/settings.json`: bloquea las tools de escritura del servidor `notebox` (las que modifican notas) y permite solo las de lectura. Verifica desde Claude que las denegadas se rebotan. Documenta el resultado y la justificación en `GOBIERNO-MCP.md`.

***

## 7. Exposición de recursos y herramientas con contratos claros y robustos

Lo que distingue un MCP usable de uno frustrante es la **calidad del contrato** que expone. Reglas duras:

* **Nombres de tools en `snake_case` y prefijados por dominio**: `notebox_create_note`, `jira_search`. No `create_note` suelto: si dos servidores exponen `create`, hay choque mental.
* **`description` que diga qué hace Y cuándo NO usarla.** "Crea una nota nueva. **No uses** esto para duplicar; usa `notebox_duplicate_note`."
* **`inputSchema` con `required` explícito.** Si un campo es opcional, dilo. Si tiene default, ponlo en `description`.
* **Output estructurado, no texto plano.** Devuelve JSON parseable; el agente lo lee mejor que prosa.
* **Errores con código + mensaje** (`{ code: "NOT_FOUND", message: "Note 42 not found" }`), no `throw new Error("404")`.
* **Resources con URI estable** que sobreviva renombres de archivos. `notebox://note/<id>`, no `notebox://file/notes-archive/note42.json`.

| Antipatrón                     | Síntoma                                | Coste                             |
| ------------------------------ | -------------------------------------- | --------------------------------- |
| Una tool gigante `do_anything` | `inputSchema` con 30 campos opcionales | Claude no sabe rellenarla; falla  |
| `description` vacía            | "Crea cosa"                            | Claude usa la tool a la deriva    |
| Output como string             | `"Created note id=42"`                 | Agente parsea con regex; frágil   |
| Excepciones no capturadas      | El handshake MCP se cae                | Toda la sesión pierde el servidor |
| Resources por path             | `notebox://path//tmp/notes/42.json`    | Renombras y se rompe todo         |

> Un MCP es **API pública para un agente**, no un script interno. Aplica los mismos estándares que aplicarías a una REST API que vaya a consumir un cliente externo.

## 8. Gestión de timeouts, reconexión y tolerancia a fallos en MCP

Tres modos de fallo habituales y cómo encararlos:

| Modo de fallo          | Síntoma                   | Mitigación en el servidor                                     | Mitigación en el cliente (Claude)                        |
| ---------------------- | ------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| Tool tarda demasiado   | Claude se queda esperando | `timeout` en cada handler, devuelve error antes de colgarse   | Configurar `MCP_TIMEOUT` razonable; reintentar           |
| Servidor stdio crashea | El proceso muere          | Loggear stack y salir limpio; supervisar con `--watch` en dev | Claude detecta EOF y reinicia                            |
| Servidor HTTP cae      | 503 / timeout             | Health endpoint + reinicio del servicio                       | Tool devuelve error; el agente puede seguir sin esa tool |
| Token OAuth expirado   | 401 al llamar             | Refresh automático antes de devolver                          | Re-prompt al usuario si refresh falla                    |
| Red intermitente (SSE) | Conexión se corta         | Reintento con backoff exponencial                             | Reabrir la conexión al primer uso                        |

Buenas prácticas:

* **Operaciones idempotentes** cuando sea posible. Si Claude reintenta, no quieres duplicar tickets.
* **Cancellation handshake**: respeta cuando el cliente cancela; no dejes jobs huérfanos.
* **Healthcheck** ligero (`ping`/`status`) para que el cliente sepa si vale la pena reintentar.
* **No abuses de los retries** en el servidor: si una operación falla, fallar limpio es mejor que reintentar 7 veces y caer.

> Un MCP que tumba la sesión cuando una tool falla es peor que no tener MCP. **Fail closed con error estructurado.**

## 9. Gobierno de MCP mediante allowlists y denylists administradas

Cuando hay varios MCPs conectados a un proyecto, no todas sus tools deben estar disponibles para cualquier persona o cualquier sesión. Capas de gobierno:

| Nivel            | Dónde se configura                      | Para qué                                                                                                                                                                        |
| ---------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proyecto**     | `.claude/settings.json`                 | Reglas del repo. Versionables, revisables en PR. (`.claude/settings.json` existe pero está en `.gitignore`: úsalo solo para overrides personales que **no** quieras compartir.) |
| **Usuario**      | `~/.claude/settings.json`               | Preferencias personales (qué prefieres bloquear siempre).                                                                                                                       |
| **Organización** | Política central (Anthropic Enterprise) | Reglas duras impuestas por TI / Seguridad.                                                                                                                                      |

Formas de restringir:

```jsonc
{
  "permissions": {
    "allow": [
      "mcp__notebox__notebox_list_notes",
      "mcp__notebox__notebox_get_note",
      "mcp__filesystem-local__read_file"
    ],
    "deny": [
      "mcp__notebox__notebox_delete_note",
      "mcp__jira-corp__jira_transition"
    ]
  }
}
```

* **Allowlist** = "solo esto se puede invocar". Más restrictivo, más explícito.
* **Denylist** = "todo menos esto". Más permisivo, pero más fácil que se cuele algo.
* **Por defecto**: allowlist en proyectos sensibles (producción, seguridad), denylist en herramientas internas.

> En un repo de empresa, el `.mcp.json` y el `settings.json` se revisan en el mismo PR. Cambiar las tools disponibles **es un cambio de superficie de ataque**: merece review.

### 🧪 Demo 3 — Probar una denylist en vivo

* **Objetivo:** ver cómo Claude rechaza una tool denegada en `settings.json` aunque el servidor la exponga.
* **Setup:** rama `tema-20/inicio`. El servidor `notebox` expone una tool `notebox_delete_note`. Editar `.claude/settings.json` para añadir esa tool a `deny`.

**Prompt literal:**

```
Borra la nota con id 1 usando la tool notebox_delete_note del
servidor notebox. Si no puedes, dime exactamente por qué.
```

**Qué observar:**

* Claude **detecta el bloqueo a nivel cliente** antes de invocar la tool. No llega al servidor.
* El mensaje de error cita explícitamente el bloqueo en `settings.json`.
* Si quitas la tool del `deny` y reintentas, la invocación procede. La política manda.
* Si pones `allow` con solo lectura y dejas la denylist vacía, el efecto es equivalente para esa tool, pero **bloquea también** las tools nuevas que aparezcan después. Esa es la diferencia clave entre las dos estrategias.

### 🧩 Ejercicio 3 — Extender el servidor MCP propio con una tool nueva

> **Rama:** `git checkout tema-20/ejercicio-03` · **Tiempo:** 25 min · **Tipo:** En clase

Añade al servidor `notebox` una tool nueva `notebox_count_archived` (devuelve cuántas notas archivadas hay) con su `inputSchema` y manejo de errores estructurado. Publica además un resource `notebox://stats` que devuelva un JSON con totales. Comprueba que Claude la descubre al reiniciar y la invoca correctamente.

***

## 10. Casos de alto valor: Git, documentación, ticketing, CI, datos internos y observabilidad

Dónde MCP suele pagar el coste de configurarlo:

| Caso               | Servidor típico            | Lo que ganas                                  | Lo que no ganas                                  |
| ------------------ | -------------------------- | --------------------------------------------- | ------------------------------------------------ |
| **Git local**      | `mcp-server-git` (oficial) | Diffs, blame, log sin pegar comandos          | No sustituye a la sesión: solo da contexto       |
| **Documentación**  | Notion / Confluence MCP    | Buscar la decisión correcta en un ADR antiguo | Edición masiva sigue mereciendo revisión         |
| **Ticketing**      | Jira / Linear MCP          | Crear ticket desde el diff; cerrar al mergear | Necesita scope acotado; no transition automática |
| **CI**             | GitHub Actions MCP         | Lanzar, ver estado, leer logs                 | Diagnosticar fallos sigue siendo tarea humana    |
| **Datos internos** | DWH read-only MCP          | Resolver dudas con SQL real, sin copiar/pegar | Solo lectura: nada de DDL                        |
| **Observabilidad** | Datadog / Grafana MCP      | Pegar gráficos y métricas reales al contexto  | No sustituye al postmortem; ayuda al input       |

Patrón mental para decidir si vale la pena:

* ¿La tarea **se repite ≥3 veces por semana**? Sí → vale.
* ¿Pegas/copias datos manualmente de esa herramienta al chat? Sí → vale.
* ¿El conector ya existe o lo escribirías en menos de un día? Sí → vale.
* ¿La superficie de auth/permiso es **acotada y read-only por defecto**? Sí → vale.

Si los cuatro no, probablemente sea más coste que valor. **MCP es una inversión de plataforma**, no un experimento por sesión.

***

## Resumen

* **MCP es el LSP de los agentes**: un protocolo común que separa el agente de las herramientas externas.
* Tres transportes: **stdio** para local, **SSE / HTTP** para remoto. Cada uno encaja en un escenario.
* **Tools, resources y prompts** son los tres conceptos que expone un servidor; el catálogo se descubre en el handshake.
* Los conectores oficiales aceleran, pero **OAuth + scope mínimo** son innegociables para producción.
* Un MCP propio se justifica cuando hay **3–7 operaciones repetidas** sobre un sistema interno sin conector oficial.
* **Gobierno = allowlists/denylists versionadas**, no confianza ciega en lo que el servidor expone.
