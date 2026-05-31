# Tema 22 — Opciones avanzadas de CLI, sesiones, historiales y productividad

> Duración estimada: 90 min · Tipo: práctico + demos guiadas.
> Repositorio de prácticas: rama `tema-22/inicio` (Notebox con comando slash `repo-status` plantado, script `scripts/dev-server.sh` en background, `notas-sesion.md` para sesión larga y directorio gemelo `../notas-soporte/` para `--add-dir`).

## 0. Objetivo del tema

Que el alumno deje de tratar la CLI como un chat y la trate como **entorno de trabajo**: elija conscientemente entre REPL y `-p`, sepa gestionar una sesión larga con `/compact`, `/resume` y `/rewind`, mueva trabajo a background, configure prompt de arranque por sesión y conecte todo con un multiplexor.

---

## 1. Flujo de sesión

Estructura **intercalada**. Cada bloque introduce una pieza autónoma (modos de invocación, sesiones largas, productividad) y el ejercicio aplica el patrón en caliente. Como en el Tema 21, son piezas pequeñas que rinden mejor practicadas una a una.

```
00:00 — Encuadre                                            (5 min)
00:05 — Demo 1: REPL vs -p, slash commands, --add-dir       (10 min)
00:15 — Ejercicio 1: CLI, flags y comandos del proyecto     (30 min, en clase)
00:45 — Demo 2: sesión larga, /compact, /resume, /rewind    (10 min)
00:55 — Ejercicio 2: sesiones largas y compactación         (30 min, en clase)
01:25 — Demo 3: background + --append-system-prompt + tmux  (10 min)
01:35 — Ejercicio 3: productividad y layout                 (30 min, en clase)
02:05 — Cierre y puente                                     (5 min)
```

> Nota de timing: el tema cabe en 90 min si los ejercicios se acortan a 20 min cada uno. La versión completa son ~125 min y se recomienda en formato bloque de 2h. Si la sesión va corta, recorta el Ejercicio 3 (productividad) a 15 min: el aprendizaje principal está en E1 y E2.

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "Llevamos 21 temas tratando Claude Code como un chat. Hoy bajamos un nivel: la CLI. Sesiones que duran horas, comandos en background, recuperación de contexto, atajos, layout en tmux. Cuando dominas la CLI, Claude Code deja de ser ‘otra app abierta’ y se convierte en tu centro operativo. Si seguís pegando rutas absolutas y reabriendo Claude cada media hora, este tema os va a ahorrar 30 minutos al día."

Tres ideas en pizarra:

1. **REPL vs `-p`.** Sesiones para trabajo, flags para automatización. No mezclar.
2. **`/compact` no es magia.** Es un resumen. Después sabes menos detalles. Decide cuándo conviene.
3. **Background y `--append-system-prompt` os devuelven el control del entorno.** Sin ellos, la CLI bloquea; con ellos, conversa mientras todo lo demás corre.

> "Hoy vais a tocar **tres ramas**: una para el REPL y los comandos slash del proyecto, otra para sesión larga con `/compact` y `/resume`, otra para productividad con background, system prompt y layout. Ninguna requiere instalar nada nuevo: todo está plantado en el repo. Al cerrar la sesión, tendréis tres documentos vuestros con vuestro setup propuesto: `CLI-INVENTARIO.md`, `SESION-LARGA.md`, `PRODUCTIVIDAD.md`."

---

## 3. Demo 1 + Ejercicio 1 — REPL, flags y comandos slash del proyecto (≈ 40 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-22/inicio && npm install && npm test`. Verificar que existe `.claude/commands/repo-status.md` y que `../notas-soporte/` está al lado del repo (lo plantamos un nivel por encima del repo en el ejercicio; para la demo, basta con que esté listo). Arrancar terminal en la raíz del repo.

**Prompt literal (modo `-p`, desde el shell):**

```
claude -p "Lista los archivos de src/ y dime qué hace cada uno en una línea."
```

**Prompt literal (dentro del REPL, tras `claude`):**

```
/status
/repo-status
/add-dir ../notas-soporte
Cita un archivo de ../notas-soporte/ y explica qué contiene.
```

Lo que el alumno ve:

- `claude -p` ejecuta y vuelve al prompt del shell. No hay "sesión" detrás.
- En el REPL, `/status` muestra modelo, directorios incluidos, herramientas, hooks activos. Lectura imprescindible.
- `/repo-status` es un comando slash **del proyecto** (vive en `.claude/commands/`). Aparece en `/help` junto a los oficiales.
- Tras `/add-dir ../notas-soporte`, ese directorio aparece en `/status`. El agente ya puede leerlo.

> "Comando del proyecto, no del usuario, no de un plugin. Está en `.claude/commands/`, viaja en el repo, lo ve todo el equipo. Es la forma más barata de codificar un prompt recurrente."

### Ejercicio 1 (30 min)

> **Rama:** `git checkout tema-22/ejercicio-01`

Los alumnos:

1. Verifican `npm install && npm test`. Todo en verde.
2. Ejecutan `claude -p "Resume en 5 líneas qué hay en este repo."` desde el shell. Comparan con lanzar lo mismo desde el REPL.
3. Abren el REPL (`claude`) y ejecutan, en orden, `/help`, `/status`, `/usage`, `/repo-status`.
4. Añaden el directorio adicional plantado: `/add-dir ../notas-soporte`. Verifican que aparece en `/status`.
5. Piden a Claude: `Lista los archivos de ../notas-soporte/ y dime qué patrón siguen.` Confirman que los lee.
6. Rellenan `CLI-INVENTARIO.md` con:
   - Lista de comandos slash disponibles (oficiales + del proyecto).
   - Diferencias entre REPL y `-p` (al menos 3).
   - Dos automatizaciones que harían con `claude -p` en un script (ej. resumen de PR diario, audit de un log).
   - Cuándo usarían `claude -c` vs `claude -r`.

**Lo que el formador observa:**

- ¿Entienden que `-p` no mantiene contexto? Es la confusión más típica.
- ¿Identifican `/repo-status` como del proyecto (frente a oficial o de plugin)?
- ¿Usan `/add-dir` o intentan pegar la ruta absoluta dentro del prompt? El segundo camino funciona en peor calidad.
- ¿Alguno propone un comando slash propio para una tarea suya? Buena señal.

> "Si os encontráis lanzando `claude` para preguntar una sola cosa y salir, queréis `claude -p`. Si os encontráis lanzando `claude -p` cuatro veces seguidas con prompts parecidos, queréis un slash command del proyecto."

---

## 4. Demo 2 + Ejercicio 2 — Sesiones largas, `/compact`, `/resume`, `/rewind` (≈ 40 min)

### Demo 2 (10 min)

> Setup: `git checkout tema-22/inicio`. Verificar que existe `notas-sesion.md` en la raíz con tres tareas pequeñas (añadir una validación, escribir un test, actualizar README). Lanzar `claude` en la raíz.

**Prompt literal (dentro de la sesión):**

```
Lee notas-sesion.md y resuelve la tarea 1.
```
(esperar resolución)
```
Ahora la tarea 2.
```
(esperar resolución)
```
Ahora la tarea 3.
```
(esperar resolución)
```
/status
/usage
/compact Resume las decisiones tomadas en las tareas 1 a 3 y mantén la lista de archivos modificados.
¿Qué archivos hemos tocado hasta ahora?
/rewind
```
Salir con `/exit`. Desde el shell:
```bash
claude -r
```
Elegir la sesión recién cerrada del selector.

Lo que el alumno ve:

- Tras tres tareas, `/status` y `/usage` muestran la huella del contexto.
- `/compact` con instrucción de foco produce un resumen explícito. La siguiente pregunta opera sobre ese resumen, no sobre el detalle.
- `/rewind` vuelve atrás el último paso del agente. No es git.
- `claude -r` muestra el selector. Las sesiones aparecen con timestamp y título derivado de la primera frase.

> "`/compact` no es deshacer. Es un cambio de estado: pasáis de tener el detalle completo a tener un resumen. Si la tarea siguiente necesita el detalle, compactar es un error. Pensad en `/compact` como en `git stash` con resumen: útil, pero con coste."

### Ejercicio 2 (30 min)

> **Rama:** `git checkout tema-22/ejercicio-02`

Los alumnos:

1. Verifican `npm install && npm test`.
2. Abren `claude` y trabajan secuencialmente las tres tareas plantadas en `notas-sesion.md`.
3. Ejecutan `/status` y `/usage` antes y después de cada tarea. Anotan el tamaño aproximado en `SESION-LARGA.md`.
4. Ejecutan `/compact` con un foco explícito (en el prompt del compact deben indicar qué se conserva y qué no).
5. Verifican qué recuerda Claude tras el compact: piden la lista de archivos modificados y un detalle pequeño de la tarea 1.
6. Salen y retoman con `claude -r`. Confirman que la sesión compactada está ahí.
7. Provocan un cambio del agente menor (ej. `Añade un comentario en src/server.ts explicando el entry point`) y aplican `/rewind`. Verifican que el comentario desaparece.
8. Rellenan `SESION-LARGA.md`:
   - Tamaño antes y después de cada compact.
   - Qué se ha perdido tras el compact (concreto: ¿recuerda el nombre exacto del archivo X? ¿el mensaje exacto del test Y?).
   - Cómo gobernarías una sesión de 4–5 horas en equipo: ¿una sesión por intención? ¿compactar cada cuánto? ¿cierres limpios entre tareas? Justificar.

**Lo que el formador observa:**

- ¿Compactan con foco o con `/compact` a secas? La diferencia es enorme.
- ¿Entienden que `/rewind` no es `git reset`? Confusión típica.
- ¿Encuentran su sesión en `claude -r` o no la reconocen? Si no la encuentran, suele ser que estaban en otro directorio.
- ¿Algún alumno cuestiona si `/compact` les sale rentable o si prefieren cerrar y abrir limpio? Discusión sana.

> "La pregunta no es ‘¿compactar sí o no?’ Es ‘¿qué necesito que recuerde la sesión dentro de 20 minutos?’. Si la respuesta es ‘los archivos tocados y las decisiones’, `/compact` con foco. Si la respuesta es ‘nada concreto, voy a otra cosa’, mejor `/clear` o cerrar y abrir."

---

## 5. Demo 3 + Ejercicio 3 — Background, `--append-system-prompt` y layout (≈ 40 min)

### Demo 3 (10 min)

> Setup: `git checkout tema-22/inicio`. Verificar que `scripts/dev-server.sh` existe y es ejecutable, que la carpeta `logs/` está creada (con `.gitkeep`). Cerrar cualquier sesión previa de Claude. Si tu shell es Windows puro, usar Git Bash o WSL: el script es bash.

**Comando de arranque (desde el shell):**

```bash
claude --append-system-prompt "Responde en español, tono directo. Antes de cualquier edición lanza `npm test`. Si fallan tests, para y pídeme instrucciones."
```

**Prompt literal (dentro de la sesión):**

```
Lanza `scripts/dev-server.sh` en background y devuélveme el control.
Cuando el servidor arranque, pídeme la primera petición que quiero probar.
```
(esperar)
```
Lee logs/dev-server.log y dime qué se ha registrado en los últimos 20 segundos.
```

Bloque conceptual (en pizarra, sin teclear): mostrar layout de tmux con 4 paneles (Claude, tests, dev-server, shell). Comentar `tmux new -s feature-x`, `tmux attach`, `Ctrl+B + flechas`.

Lo que el alumno ve:

- El `--append-system-prompt` se nota desde la primera respuesta: idioma, tono, regla del `npm test`.
- El `dev-server.sh` arranca en background. El control vuelve al REPL inmediatamente.
- `logs/dev-server.log` se lee como cualquier archivo. La sesión sigue viva.
- El multiplexor no es de Claude: es del entorno del alumno. Por eso aquí solo se demuestra conceptualmente.

> "El `--append-system-prompt` es la regla del día. Hoy backend, hoy auditoría, hoy en español. No reemplaza al `CLAUDE.md` (que es del repo), reemplaza al ‘recuérdale a Claude que…’ que escribiríais en cada prompt."

### Ejercicio 3 (30 min)

> **Rama:** `git checkout tema-22/ejercicio-03`

Los alumnos:

1. Verifican `npm install && npm test`.
2. Lanzan Claude con un `--append-system-prompt` propio (al menos 2 reglas: una de idioma/tono, una de comportamiento). Ejemplo válido: `Responde en español. No edites tests sin pedírmelo explícitamente.`
3. Piden al agente que arranque `scripts/dev-server.sh` en background.
4. Mientras el server corre, piden al agente que inspeccione `logs/dev-server.log` periódicamente y resuma actividad.
5. Hacen una edición pequeña en `src/server.ts` y verifican que el agente respeta la regla del system prompt (ej. si la regla decía "lanza tests antes", debe lanzarlos).
6. Rellenan `PRODUCTIVIDAD.md`:
   - El `--append-system-prompt` que crearían para su día a día (1 párrafo, en español).
   - Tres aliases del shell que añadirían a su `~/.zshrc` / `~/.bashrc` para acelerar trabajo con Claude.
   - Layout de tmux/screen/zellij ideal (ASCII o lista): qué hay en cada panel y por qué.
   - Una regla que jamás pondrían en `--append-system-prompt` (anti-ejemplo, para forzar pensar).

**Lo que el formador observa:**

- ¿Notan que el system append se respeta? Si no, suele ser que pusieron una regla contradictoria con el system oficial.
- ¿Lanzan el server en background o en foreground por error? El segundo bloquea el REPL.
- ¿Sus alias tienen sentido (resúmenes, audits, continuación) o son cosméticos?
- ¿Algún alumno escribe un layout sin Claude en él? Buena señal de pensar el entorno completo, no solo el agente.

> "Si vuestro `--append-system-prompt` ocupa 30 líneas, es un `CLAUDE.md` mal puesto. La regla del día son 2–4 líneas. Lo del proyecto va en el repo. Lo del usuario va en el `settings.json`. Mezclar scopes os volverá a explotar en la cara dentro de un mes."

---

## 6. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **REPL para trabajo, `-p` para automatización.** Distintos modos, distintos usos.
2. **Sesiones largas se gobiernan**: `/status`, `/usage`, `/compact` con foco, `/resume`, `/rewind`.
3. **Background, `--add-dir`, `--append-system-prompt`** convierten la CLI en herramienta de día completo.
4. **Multiplexor + alias + comandos del proyecto** = CLI como centro operativo.

**Puente al Tema 23:**

> "Hemos convertido la CLI en vuestro centro operativo local. En el Tema 23 damos otro salto: cómo Claude Code os ayuda a empaquetar todo eso en **entornos reproducibles**. Docker, Dockerfiles, `docker-compose`, local dev consistente entre máquinas. Lo que hoy es vuestro setup, mañana es el setup del equipo entero."

---

## 7. Notas para el formador

- **Requisito técnico:** Node 24+, bash disponible (Git Bash en Windows o WSL). El script `scripts/dev-server.sh` es bash. Si algún alumno está en PowerShell puro, hay variante conceptual: lanzar `node` directo o documentar que el script no aplica en su entorno. No detener la clase por esto.

- **`/rewind` no siempre está disponible según la versión instalada.** Si en clase no aparece, los alumnos lo anotan en `SESION-LARGA.md` como "no disponible en mi versión" y siguen. La idea conceptual (deshacer el último paso del agente) sigue valiendo. **Probarlo el día anterior** con la versión que vais a usar.

- **`/compact` puede comportarse de forma distinta entre versiones.** En algunas, acepta una instrucción de foco como argumento; en otras, pide la instrucción tras el slash. Avisar.

- **Pregunta típica:** *"¿Y por qué no abrir varias instancias de Claude en pestañas distintas en vez de tmux?"* → Funciona pero pierdes layout reproducible y, si se cae la SSH, pierdes todo. tmux te da sesiones persistentes que sobreviven a reinicio de conexión. No es Claude lo que cambia; es la disciplina del entorno.

- **Pregunta típica:** *"¿`--append-system-prompt` no es trampa? ¿No debería ir en `CLAUDE.md`?"* → No: `CLAUDE.md` es del **repo** y aplica a todas las sesiones que se lancen ahí. `--append-system-prompt` es de **esa invocación**. Útil para reglas del día, experimentos y scripts. Si una regla se repite cada día, promovedla a `CLAUDE.md`. Si es de hoy, se queda como append.

- **Error común en el Ejercicio 1:** confunden `claude -c` (continúa la última) con `claude -r` (selector). Aclarar: `-c` es "vuelve a la última", `-r` es "elige cuál".

- **Error común en el Ejercicio 2:** ejecutan `/compact` sin foco. El resumen sale genérico. Forzarles a escribir la instrucción ("resume X, mantén Y, descarta Z") como parte del ejercicio.

- **Error común en el Ejercicio 3:** ponen reglas contradictorias en `--append-system-prompt` (ej. "responde en inglés" cuando el resto del entorno está en español). Detectarlo en `PRODUCTIVIDAD.md`.

- **Sobre tmux/screen/zellij:** **no se enseña a configurar el multiplexor en clase.** Cada alumno usa el suyo. Si alguien quiere ver un layout funcionando, el instructor lo muestra rápido en su pantalla y deja el resto para fuera de sesión. Documentado así en `notas.md` del Componente 4.

- **Si la sesión va sobrada:** pedir al alumno más rápido que escriba **un segundo comando slash del proyecto** que se ajuste a un patrón suyo recurrente (ej. `/audit-diff`, `/release-notes`). Práctica adicional con `.claude/commands/`.

- **Sobre `.claude/skills/` en el repo:** sigue valiendo lo del Tema 21. Las skills DEL AUTOR (las que usa el instructor para preparar el curso) NO se trackean — están en `.gitignore`. Si el alumno crea sus propias skills durante el ejercicio, las ignora también.
