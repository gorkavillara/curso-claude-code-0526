# Tema 21 — Sistema de plugins, marketplaces, hooks y extensibilidad

> Duración estimada: 90 min · Tipo: conceptual + demos guiadas.
> Repositorio de prácticas: rama `tema-21/inicio` (Notebox con plugin local `pr-helper` plantado en `.claude/plugins/` y hook `PreToolUse` declarado en `.claude/settings.json`).

## 0. Objetivo del tema

Que el alumno entienda qué empaqueta un plugin (commands, skills, agents, hooks, MCP), distinga el ciclo `install/enable/validate`, escriba un hook `PreToolUse` real con justificación de gobierno, y diseñe o extienda un plugin propio sin convertir la extensibilidad en deuda técnica.

---

## 1. Flujo de sesión

Estructura **intercalada**. Cada demo introduce una pieza autónoma (anatomía del plugin, hook de gobierno, validación), y el ejercicio aplica el patrón en caliente. Igual que en MCP, plugins tiene muchas piezas conceptuales: hay que practicarlas una a una.

```
00:00 — Encuadre                                            (5 min)
00:05 — Demo 1: inspeccionar plugin local                   (10 min)
00:15 — Ejercicio 1: activar e inventariar plugin           (25 min, en clase)
00:40 — Bloque conceptual (puntos 5–7)                      (10 min)
00:50 — Demo 2: hook PreToolUse de gobierno                 (10 min)
01:00 — Ejercicio 2: escribir hook con justificación        (25 min, en clase)
01:25 — Demo 3: validar plugin (`/plugin validate`)         (5 min)
01:30 — Ejercicio 3: crear/extender plugin propio           (20 min, en clase)
01:50 — Cierre y puente                                     (5 min)
```

> Nota de timing: el tema cabe en 90 min ajustados. Si la sesión va corta, recortar el bloque conceptual intermedio a 5 min. Si va larga, el Ejercicio 3 puede acortarse pidiendo solo el cambio + propuesta de versión (sin documentación extensa).

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "El Tema 20 abrió Claude al mundo con MCP: ya puede hablar con Jira, con tu DWH, con GitHub. Hoy resolvemos el otro lado del problema: **cómo distribuís VUESTRO Claude**. Vuestros commands, vuestros hooks, vuestras skills, vuestros MCPs, en una unidad que el resto del equipo se instala con un comando. Eso es un plugin."

Tres ideas en pizarra:

1. **Plugin = paquete npm para Claude Code.** Empaqueta, versiona, instala.
2. **Hooks = gobierno fino.** `PreToolUse` previene, `PostToolUse` audita. Salen del agente, no del prompt.
3. **Sin inventario y sin semver, los plugins son deuda con permisos.** La extensibilidad sin disciplina mata.

> "Hoy vais a tocar **un plugin real plantado en el repo**: lo activáis, lo inventariáis, le añadís una pieza nueva y lo validáis. No vamos a publicar a un marketplace remoto en clase porque cada empresa tiene el suyo (y a menudo no tiene). Cuando entendáis el patrón aquí, lo replicáis en el marketplace interno que tengáis."

---

## 3. Demo 1 + Ejercicio 1 — Inspeccionar y activar el plugin local (≈ 35 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-21/inicio && npm install && npm test`. Verificar que `.claude/plugins/pr-helper/` existe con sus subcarpetas (`commands/`, `hooks/`, `skills/`, `agents/`, `plugin.json`). Arrancar Claude Code en la raíz del repo.

**Prompt literal:**

```
Abre el plugin local `.claude/plugins/pr-helper/` y explícame:
1. Qué declara su plugin.json (nombre, versión, autor, descripción).
2. Qué commands expone (lista por nombre).
3. Qué hooks declara y a qué evento se enganchan.
4. Qué skills y agentes empaqueta.
5. Si tuvieras que distribuir este plugin a otro equipo, qué archivos
   serían imprescindibles y qué archivos sobran.

No ejecutes nada todavía. Solo describe el catálogo del plugin.
```

Lo que el alumno ve:

- Claude lee `plugin.json` y cita campos concretos.
- Identifica los `commands/*.md` con frontmatter y los lista.
- Detecta el hook `PreToolUse` declarado en el `plugin.json`.
- Ve la skill `commit-msg-style` y el agente `pr-reviewer` empaquetados.
- Subraya: el plugin **está plantado pero no necesariamente activo** — `/plugin enable` es lo que lo carga.

> "Plantar un plugin en el repo no lo activa. Es como tener un paquete en `node_modules` sin importarlo: está, pero no corre. La activación es deliberada, y eso es lo que os permite gobernar."

### Ejercicio 1 (25 min)

> **Rama:** `git checkout tema-21/ejercicio-01`

Los alumnos:

1. Verifican que `npm install && npm test` van en verde.
2. Activan el plugin: `/plugin enable pr-helper` (si la versión instalada de Claude Code no expone el comando, aceptan el plugin como local mediante la activación que les ofrezca el cliente; el `EJERCICIO.md` cubre ambos casos).
3. Listan los commands disponibles del plugin y ejecutan uno (típicamente `/pr-helper:summary` o `/pr-helper:checklist`).
4. Inventarían el plugin entero en `INVENTARIO-PLUGIN.md`:
   - Commands disponibles + qué hace cada uno.
   - Hooks declarados + evento al que se enganchan.
   - Skills empaquetadas + cuándo se activan.
   - Agents disponibles + cuándo invocarlos.
5. Justifican: ¿qué partes del plugin **activarías a nivel proyecto** (todo el equipo) y cuáles **a nivel usuario** (personal)? Por ejemplo, un hook de auditoría que debería viajar con el repo vs un command de productividad personal.

**Lo que el formador observa:**

- ¿Diferencian "plantado" de "activado"? Es un error muy común.
- ¿Identifican el hook como parte del plugin, no como configuración suelta?
- ¿Justifican la separación repo / usuario o lo dejan todo en el mismo scope?
- ¿Alguno propone añadir el plugin al `inventario` del README sin que se lo pidan? — Buena señal de cultura.

> "Un plugin sin inventario explícito en el repo es un plugin fantasma. Hoy lo activáis vosotros; mañana el dev nuevo se pregunta de dónde sale un command que nadie le explicó."

---

## 4. Bloque conceptual intermedio — Marketplaces, scope repo/usuario, restricciones corporativas (≈ 10 min)

> Bloque denso, sin demo, sin ejercicio inmediato. Sirve para que el alumno tenga el marco mental antes del Ejercicio 2.

**Lo que digo (resumen en pizarra):**

1. **`extraKnownMarketplaces`** — campo en `settings.json` para añadir marketplaces internos. Cada entrada es una URL JSON con plugins. `trust: prompt` vs `trusted` cambia cómo se instalan.
2. **Scopes** — `.claude/plugins/` del repo (equipo) vs `~/.claude/plugins/` (usuario) vs política central (org). No mezclar: el plugin que necesita TODO el equipo va en el repo, commiteado.
3. **Restricciones corporativas** — `allowedPlugins` / `deniedPlugins`, marketplaces aprobados, code review obligatorio sobre `plugin.json` y hooks. Conectar un marketplace = ampliar superficie.
4. **Plugins que empaquetan MCPs (puente con Tema 20)** — un plugin del equipo de plataforma puede incluir su propio servidor MCP interno. Misma anatomía, embebida en el plugin.

> "Si dejáis que cada dev añada marketplaces a su antojo, el agente acaba ejecutando código de fuentes que nadie ha revisado. Es el mismo problema que un mirror de npm con permisos. Aplicad el mismo escrutinio."

---

## 5. Demo 2 + Ejercicio 2 — Hook PreToolUse de gobierno (≈ 35 min)

### Demo 2 (10 min)

> Setup: `git checkout tema-21/inicio`. Verificar que `.claude/settings.json` declara un hook `PreToolUse` que apunta a `.claude/plugins/pr-helper/hooks/pre-bash-audit.sh`. Crear si hace falta la carpeta `.claude/audit/` (debería existir vacía). Lanzar Claude.

**Prompt literal:**

```
Ejecuta `ls -la` desde Bash y luego `node --version`.
Después, abre .claude/audit/bash.log y dime qué se ha registrado:
1. Qué campos guarda el log por cada invocación.
2. En qué momento se ha escrito cada línea (antes o después del comando).
3. Si tú quisieras BLOQUEAR un comando concreto (no solo loguearlo),
   qué cambio mínimo tendrías que hacer en el hook.
```

Lo que el alumno ve:

- Cada `Bash` se intercepta. Antes de ejecutarse, el hook escribe una línea en `bash.log` con timestamp y comando.
- El log tiene `[timestamp] tool: command`. Es ASCII plano, fácil de leer.
- Para **bloquear**, basta con que el hook detecte el patrón y `exit 2` con un mensaje a stderr.
- El hook es **del cliente**: Claude no es consciente de él. No aparece en el prompt ni en la respuesta hasta que dispara un bloqueo.

> "Esto es gobierno **fuera del prompt**. Por mucho que el alumno engañe a Claude para que ejecute `rm -rf`, si el hook lo bloquea, Bash no corre. Es la diferencia entre 'pedirle a Claude que no haga algo' y 'impedir técnicamente que pueda hacerlo'."

### Ejercicio 2 (25 min)

> **Rama:** `git checkout tema-21/ejercicio-02`

Los alumnos:

1. Abren el hook plantado `.claude/plugins/pr-helper/hooks/pre-bash-audit.sh`.
2. Lo extienden: en lugar de **loguear todo Bash**, debe:
   - **Bloquear** cualquier comando que contenga `rm -rf` o que toque `.env`.
   - **Loguear** el resto en `.claude/audit/bash.log` con timestamp y comando.
   - Devolver `exit 2` + mensaje por stderr cuando bloquee, `exit 0` cuando solo loguee.
3. Verifican desde Claude:
   - `ls -la` → se loguea, se ejecuta.
   - `rm -rf /tmp/foo` → se bloquea, no se ejecuta, Claude muestra el mensaje de error del hook.
   - `cat .env` → se bloquea con la misma justificación.
4. Rellenan `GOBIERNO-HOOK.md`:
   - Qué política técnica refuerza el hook (relacionarla con la sesión de seguridad del Tema 16).
   - Por qué `PreToolUse` y no `PostToolUse`. ¿Qué se pierde con cada uno?
   - Qué pasa si otro miembro del equipo desactiva el hook (`enabled: false` en `settings.json` local) — ¿el resto del equipo se entera? ¿Cómo lo gobiernas?

**Lo que el formador observa:**

- ¿Usan `grep` simple o regex robusto? `rm -rf` puede aparecer con espacios variados.
- ¿Capturan el exit code correctamente? `exit 1` no bloquea en Claude Code; `exit 2` sí.
- ¿Distinguen `PreToolUse` de `PostToolUse` o los confunden?
- ¿Reflexionan sobre que `.claude/settings.json` puede ser sobrescrito por `.claude/settings.local.json`? El hook se puede saltar si no se gobierna a nivel organizacional.

> "Un hook fácil de saltar no es gobierno, es teatro. La política real exige que NO se pueda desactivar localmente sin que alguien con permisos lo apruebe. Eso es responsabilidad del settings de organización, no del repo."

---

## 6. Demo 3 + Ejercicio 3 — Validar y extender un plugin (≈ 25 min)

### Demo 3 (5 min)

> Setup: `git checkout tema-21/inicio`. Lanzar Claude en la raíz.

**Prompt literal:**

```
Valida el plugin `pr-helper` plantado en `.claude/plugins/pr-helper/`.
Si Claude Code expone `/plugin validate` en esta sesión, úsalo directamente
y muéstrame el output completo. Si no, audita manualmente:
1. ¿plugin.json tiene name, version, description?
2. ¿Cada command en commands/ tiene frontmatter válido?
3. ¿Los hooks declarados existen como scripts y son ejecutables?
4. ¿Las skills y agents tienen su frontmatter mínimo?

Devuélveme el informe estructurado con OK / WARN / FAIL por cada chequeo
y termina con una propuesta de versión para publicar este plugin (semver).
```

Lo que el alumno ve:

- Si `/plugin validate` está disponible, Claude lo ejecuta y muestra el informe estructurado.
- Si no, Claude inspecciona archivo por archivo y devuelve OK/WARN/FAIL.
- Subrayar la propuesta de **semver**: el plugin no está en el aire, tiene versiones, breaking changes, hotfixes. Como un paquete.

> "Validar no garantiza que el plugin funcione bien. Garantiza que tiene la **forma correcta** para ser instalable. Es el equivalente a `npm publish --dry-run`. Si esto no pasa, no hay publicar que valga."

### Ejercicio 3 (20 min)

> **Rama:** `git checkout tema-21/ejercicio-03`

Los alumnos:

1. Eligen una capacidad a añadir al plugin `pr-helper`:
   - Una skill nueva en `.claude/plugins/pr-helper/skills/<nombre>/SKILL.md`, o
   - Un command nuevo en `.claude/plugins/pr-helper/commands/<nombre>.md`, o
   - Un hook adicional declarado en `plugin.json`.
2. Implementan el cambio.
3. Actualizan `plugin.json` con la versión nueva (semver coherente: feature → bump minor, fix → bump patch, breaking → bump major).
4. Validan el plugin completo (manualmente o con `/plugin validate` si está disponible).
5. Documentan en `PLUGIN-CAMBIO.md`:
   - Qué capacidad añadiste y por qué.
   - Qué versión semver le subes y por qué.
   - Qué tests harías antes de publicarlo a un marketplace interno (al menos 3).
   - Si tuvieras que distribuirlo, qué fuente usarías: marketplace, git URL o ruta local.

**Lo que el formador observa:**

- ¿Hacen un cambio coherente con lo que ya hace el plugin o añaden una capacidad inconexa?
- ¿Suben la versión correctamente (semver) o ponen un número arbitrario?
- ¿Los tests propuestos tienen sentido (comportamiento, no implementación)?
- ¿Hay alumnos que intentan añadir 4 cosas "ya que estamos"? — Antipatrón: una intención por iteración.

> "Un plugin propio sin tests es un experimento. Con tests es un componente. La diferencia es si vais a poder cambiarlo sin miedo dentro de 6 meses."

---

## 7. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Plugin = unidad versionable** que empaqueta commands, skills, agents, hooks y MCPs.
2. **Install ≠ enable.** Y `validate` antes de publicar.
3. **Hooks** son el gobierno técnico: `PreToolUse` previene, `PostToolUse` audita.
4. **Sin inventario, semver, revisión y tests, los plugins son deuda con permisos.**

**Puente al Tema 22:**

> "Hemos visto cómo extender Claude Code con plugins. En el próximo tema bajamos otro nivel: la CLI propiamente dicha. Sesiones largas, comandos en background, `/resume`, `/rewind`, atajos de teclado, integración con tmux. Cuando dominas la CLI, Claude Code deja de ser un chat y se convierte en tu centro operativo del día."

---

## 8. Notas para el formador

- **Requisito técnico:** Node 24+, `jq` disponible (el hook bash lo usa para parsear el JSON del evento). Si algún alumno está en Windows puro sin Git Bash con `jq`, el hook lanza error: avisar de que `jq` debe estar en el PATH. Alternativa: reemplazar el `jq` por un parseado con `node -e` (más portable; documentado en `notas.md`).

- **`/plugin install` / `/plugin enable` no siempre están disponibles según la versión instalada de Claude Code.** Si en clase no aparecen los comandos, el plugin se puede **activar manualmente** copiando una entrada `enabledPlugins` o equivalente en `settings.json`, o simplemente referenciando los commands del plugin con la convención `<plugin>:<command>`. El `EJERCICIO.md` debe cubrir ambos caminos. **Probarlo el día anterior** con la versión que vais a usar.

- **Pregunta típica:** *"¿Y los marketplaces oficiales? ¿Qué hay publicado?"* → Anthropic mantiene uno por defecto, pero su catálogo evoluciona rápido. No lo memorices: enseña el patrón y deja que cada equipo monte el suyo cuando lo necesite.

- **Pregunta típica:** *"¿Por qué el hook está en `settings.json` y no en `plugin.json`?"* → Hay dos formas válidas: hooks de proyecto (en `settings.json`, viajan con el repo, no son parte de un plugin) y hooks de plugin (declarados en `plugin.json`, viajan con el plugin). Usar la primera cuando es política del repo; la segunda cuando es comportamiento del plugin. En la demo usamos el `settings.json` por simplicidad, pero el ejercicio 2 puede hacerse en cualquiera de los dos.

- **Error común en el Ejercicio 1:** activan el plugin pero no comprueban que los hooks declarados por el plugin están realmente activos. Pedirles que ejecuten un `Bash` y verifiquen que el hook se dispara.

- **Error común en el Ejercicio 2:** usan `exit 1` esperando que bloquee. En Claude Code, el código de salida que bloquea es **2**. Otros códigos pueden interpretarse como error genérico sin bloqueo. Documentar en `GOBIERNO-HOOK.md`.

- **Error común en el Ejercicio 3:** modifican el plugin pero no suben la versión, o la suben sin lógica (de `1.0.0` a `2.0.0` por un cambio cosmético). Insistir en semver.

- **Sobre marketplaces remotos en vivo:** **no se hace en clase.** Cada empresa tiene su flujo (o no tiene). Si algún alumno quiere demostrarlo con un marketplace propio, dejar tiempo al final (5 min) para que lo enseñe; pero no es parte del recorrido obligatorio.
  - **Recurso opcional disponible:** hay un marketplace público real montado para el curso en `github.com/gorkavillara/cc-marketplace-imagina` (plugin `test-helper`). Si la sesión va sobrada o un alumno quiere ver el flujo remoto, basta con `/plugin marketplace add gorkavillara/cc-marketplace-imagina` y `/plugin install test-helper@imagina-marketplace`. No sustituye el ejercicio 1 (que sigue siendo local); es solo demostración del flujo remoto.

- **Sobre la dependencia `jq` y la portabilidad del hook:** si el bash con `jq` da problemas en la sala, el `notas.md` propone una variante con `node -e` (puro Node, sin dependencias externas). Si la sesión es de mayoría Windows, considerar usar la variante Node desde el principio.

- **Si la sesión va sobrada:** pedir al alumno más rápido que escriba un **segundo hook** (`PostToolUse`) que valide que tras una `Edit` no se ha introducido un secret. Practica adicional con el patrón de gobierno.

- **Sobre `.claude/skills/` en el repo:** las skills DEL AUTOR (las que el instructor usa para preparar el curso, como `curso-tema-doc`, `curso-forms`) NO se trackean — están en `.gitignore`. Pero las skills empaquetadas en `.claude/plugins/<plugin>/skills/` SÍ se trackean: forman parte del plugin. Esta distinción es importante: la línea está en si la skill **pertenece a un plugin** o no.
