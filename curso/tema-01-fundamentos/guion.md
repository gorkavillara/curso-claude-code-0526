# Tema 1 — Fundamentos de Claude Code como sistema agentic

> Duración estimada: 45-60 min · Tipo: conceptual + 1 demo.
> Repositorio de prácticas para la demo y los ejercicios: rama `tema-01/inicio` (Node 24 + Express + TypeScript, API mínima de libros).

## 0. Objetivo del tema

Que el alumno salga sabiendo distinguir **autocompletado** de **sistema agentic**, entendiendo dónde Claude Code aporta y dónde estorba, y aceptando que **la responsabilidad técnica sigue siendo del desarrollador**.

No es un tema de herramientas todavía: es de encuadre. Si el alumno se va con la idea correcta de qué es esto, los 26 temas siguientes los entiende.

---

## 1. Encuadre — lo que digo (≈ 10 min)

> "Antes de tocar nada, quiero que tengáis muy clara una idea: Claude Code **no es un autocompletado más rápido**. Es otra cosa. Y si lo usáis como si fuera Copilot tuneado, vais a sacarle la décima parte del valor."

**Puntos a cubrir hablando, sin slides pesadas:**

- **Autocompletado clásico** (Copilot, IntelliSense IA): completa la línea o el bloque que estás escribiendo. Reactivo, local, sin memoria.
- **Sistema agentic**: recibe un objetivo, lee el repositorio, decide qué archivos abrir, edita varios a la vez, ejecuta comandos, valida, itera. **Tiene un bucle de razonamiento, no solo una sugerencia.**
- La diferencia práctica: con autocompletado tú diriges cada línea; con un agente tú diriges la **intención** y el agente hace la pasada.
- Esto cambia la unidad de trabajo: pasamos de "sugerencia por línea" a "tarea por sesión".

**Frase de anclaje** (úsala literal, funciona):

> "El autocompletado te ayuda a escribir más rápido el código que ya tenías en la cabeza. Claude Code te ayuda a no tener que tenerlo todo en la cabeza."

### Dónde aporta más valor (decirlo claro)

- Tareas que cruzan **varios archivos** (refactor, renombrado semántico, propagación de un cambio de contrato).
- Tareas que requieren **leer mucho antes de escribir poco** (entender un módulo legacy, mapear dónde se usa una función).
- **Onboarding** a un repo nuevo.
- **Testing**, **documentación**, **revisión de PRs**: trabajo necesario que el equipo siempre pospone.
- Tareas **repetitivas pero no idénticas** (migrar 30 endpoints siguiendo un patrón con variaciones).

### Dónde NO conviene delegar

- Decisiones de **arquitectura con consecuencias** (elección de stack, contratos públicos, modelo de datos).
- Código donde un error sale **caro y silencioso**: pagos, permisos, autenticación, migraciones destructivas.
- Cambios sobre lógica que **tú ya conoces y te lleva 30 segundos** (la fricción del prompt sale más cara).
- Cuando no puedes **validar** lo que produce (si no sabes si está bien, no lo metas).

### Riesgos reales (no asustar, pero nombrarlos)

- **Alucinación con contexto plausible**: inventa una función que parece existir.
- **Sobreedición**: te toca 12 archivos cuando le pediste 1.
- **Falsa certeza**: explica con seguridad algo que es incorrecto.
- **Pérdida de criterio del equipo**: si todo el mundo prompteа igual, el código se uniformiza por debajo del nivel de los seniors, no por encima.

> "El asistente nunca firma el commit. Lo firmáis vosotros. Si rompe producción, no podéis decir 'me lo dijo Claude'."

---

## 2. Demo en vivo — lo que prompteo (≈ 15 min)

**Objetivo de la demo**: que vean la diferencia entre "pregunta a un chat" y "tarea sobre repo".

### Setup

Haz `git checkout tema-01/inicio` en la raíz del repo del curso. Eso te deja el código de la demo (una pequeña API de inventario de libros con Node + Express + TypeScript) en `src/`, `test/`, `package.json`. La carpeta `curso/` con tus guiones no se modifica al cambiar de rama.

Abre Claude Code apuntando a la raíz del repo. Si quieres ilustrarlo más, también puedes hacer la demo sobre un repo propio que conozcas bien, pero el material de los ejercicios se basa en éste.

### Demo 1 — La pregunta tonta que demuestra la diferencia

Prompt literal para pegar en Claude Code:

```
Sin abrir más archivos de los necesarios, dime en 5 líneas qué hace este
repositorio, cuál es el entry point y cuáles son las 3 dependencias más
importantes. No inventes nada: si no estás seguro de algo, dilo.
```

**Lo que el alumno tiene que ver:**
- Claude **lee archivos** antes de responder (README, package.json/pyproject, main.py).
- Cita rutas concretas.
- Si algo no está claro, lo marca como "no estoy seguro".

Compáralo en voz alta con: *"esto en ChatGPT te lo inventa entero porque no tiene el repo delante."*

### Demo 2 — La trampa: pedir algo sin contexto

Mismo repo, prompt deliberadamente vago:

```
Mejora el código.
```

**Lo que el alumno tiene que ver:**
- Empieza a tocar cosas que nadie le ha pedido.
- Genera ruido.
- Deja claro que **el prompt es el diseño**: si tu prompt es vago, el output también.

Esto sirve de gancho directo para el Tema 7 (prompting profesional).

### Demo 3 — Cuándo NO usarlo (10 segundos, no más)

Abre un archivo y haz un cambio trivial tú mismo a mano (renombrar una variable local, añadir un `if`). Di:

> "Esto no se lo paso a Claude. Tardo más en explicarle el contexto que en hacerlo."

Es importante decirlo. Si no, los alumnos salen pensando que **todo** se promptea.

---

## 3. Cierre y puente (≈ 5 min)

Resumen en tres frases, escritas en pizarra/slide:

1. **Claude Code es un agente sobre tu repo, no un autocompletado.**
2. **Aporta más donde hay que leer mucho, tocar varios sitios, o hacer trabajo aburrido bien.**
3. **El criterio técnico sigue siendo tuyo. Siempre.**

**Puente al Tema 2:**

> "Ahora que sabéis qué es, en el siguiente tema vemos **dónde lo abrís**: terminal, web, IDE, Slack, CI… porque la interfaz que elijas cambia el tipo de tarea que puedes hacer cómodamente."

---

## 4. Notas para el formador

- **Tiempo**: si vas justo, recorta la demo 2. La demo 1 es la importante.
- **Pregunta típica del alumno**: *"¿Y esto en qué se diferencia de Cursor / Windsurf / Copilot Workspace?"* Respuesta corta: todos son agentic; Claude Code está optimizado para terminal y para repos grandes con políticas de equipo (settings, skills, MCP, subagentes). Lo veremos en los temas 4, 17, 18 y 19.
- **Si alguien dice "esto va a sustituir desarrolladores"**: corta seco. *"No. Sustituye tareas, no perfiles. El perfil que sustituye antes es el que solo escribe código sin entenderlo."*
- **No prometas mágia**. Este tema marca la honestidad del curso entero.
