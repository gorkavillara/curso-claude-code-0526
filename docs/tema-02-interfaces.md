# Tema 2 — Interfaces oficiales de Claude Code y criterios para elegir terminal, web, escritorio o IDE según el tipo de tarea

> **Duración estimada:** ~60 min
> **Tipo:** conceptual + demos guiadas

## Objetivo del tema

Saber **qué interfaz usar en qué momento**. Que la elección no sea costumbre, sino criterio según la tarea.

---

## 1. Trabajo desde terminal CLI para flujos profundos sobre repositorio y comandos

- Interfaz **más potente y completa**.
- Acceso a todos los slash commands, configuración y sesiones largas.
- Cero overhead de UI: ideal para sesiones intensivas.
- Compatible con `tmux` / `screen` para multiplexar.
- Modo REPL interactivo (`claude`) o ejecución puntual con flags (`claude -p "..."`).

> Si vas en serio con Claude Code, la CLI es tu casa.

### 🧪 Demo 1 — Sesión interactiva en terminal

- **Objetivo:** ver el flujo nativo de la CLI antes de meter ningún IDE de por medio.
- **Setup:** repo Notebox abierto en terminal. `claude --version` funcionando.

**Pasos:**

1. Lanza `claude` en la raíz del repo.
2. Pregunta multiarchivo:
   ```
   ¿Qué endpoints expone este servidor y dónde se validan los inputs?
   ```
3. Observa: lee `routes/`, `services/`, `models/`. Cita rutas concretas.
4. Lanza slash commands:
   - `/status` → modelo, modo, permisos.
   - `/usage` → tokens consumidos en la sesión.
5. Sal con `Ctrl+D` o `/exit`.

**Qué observar:**

- La CLI mantiene la conversación viva entre prompts.
- Puedes ejecutar comandos del repo sin salir del agente.
- `/status` y `/usage` son tus dos comandos de control diarios.

> Profundizamos en la CLI en el [Tema 22 — CLI avanzada](tema-22-cli-avanzada.md).

## 2. Uso de la interfaz web para continuidad y acceso rápido en contextos ligeros

- Acceso desde navegador (`claude.ai/code` o equivalente del workspace).
- **Continuidad entre dispositivos:** empiezas en la oficina, sigues en casa.
- Pensada para tareas **ligeras**: dudas, lectura, exploración rápida.
- **Limitación clave:** no ejecuta comandos sobre tu repo local.
- Útil cuando estás en un equipo prestado o sin tu setup.

## 3. Ventajas de la aplicación de escritorio en entornos de trabajo prolongado

- App nativa para macOS y Windows.
- Ventana dedicada, separada del navegador → menos distracciones.
- Más capacidad que la web, menos dispersión que el navegador.
- Útil para **sesiones largas** de exploración o redacción de prompts complejos.

## 4. Integración con VS Code para desarrollo asistido sin salir del editor

- Extensión oficial en el marketplace.
- Panel de chat lateral integrado.
- **Diffs inline** en el editor: aceptas o rechazas cambio a cambio.
- Auto-instalación al lanzar `claude` desde la terminal integrada de VS Code.
- Selección de código → contexto automático para el prompt.
- Drag & drop de archivos al chat (cuando aplica).

### 🧪 Demo 2 — Mismo prompt, terminal vs VS Code

- **Objetivo:** ver la diferencia de UX entre la CLI pura y la integración del IDE.
- **Setup:** Notebox abierto en VS Code con la extensión de Claude Code instalada.

**Pasos:**

1. Abre el panel lateral de Claude Code.
2. Selecciona `src/services/notes.ts` en el explorador.
3. Pídele:
   ```
   Añade un test que verifique que no se pueden crear notas con title vacío.
   Ejecuta los tests al terminar.
   ```
4. Observa el diff: bloques aplicables uno a uno.
5. Acepta/rechaza desde el editor.

**Qué observar:**

- El **diff inline** facilita revisar línea a línea.
- El editor te lleva al punto del cambio sin que lo busques.
- En CLI verías un diff textual; aquí lo ves contextualizado en el archivo.

> El IDE no sustituye a la CLI: la complementa. Decide según la tarea.

## 5. Integración con IDEs de JetBrains y flujos típicos de equipos que usan esa familia

- Plugin oficial para IntelliJ, WebStorm, PyCharm, GoLand, Rider, etc.
- UX equivalente a VS Code (chat lateral + diffs).
- Especialmente relevante para equipos **Java/Kotlin** (Spring, Android) y **Python** profesional.
- Si tu equipo ya vive en JetBrains, no fuerces VS Code: pierdes adopción.

## 6. Uso en Slack para consultas y coordinación de equipo alrededor del código

- Bot oficial integrable en el workspace de Slack.
- Consultas desde canal o DM sin abrir IDE.
- Casos típicos:
  - Dudas rápidas durante el día.
  - Coordinación entre devs y no-devs (PMs, QAs).
  - Compartir respuestas con todo el equipo (canal público).
- **No es para programar.** Es un canal de pregunta-respuesta.

## 7. Presencia en CI/CD mediante GitHub Actions y GitLab para automatización asistida

- Acción oficial de Claude Code en GitHub Actions.
- Equivalente para GitLab CI.
- Casos de uso:
  - Review automático de PRs (comentarios sugeridos, no bloqueantes).
  - Generación / actualización de documentación en cada merge.
  - Triage de issues.
- **No es para deploy.** Es **asistencia** en el pipeline, no decisión de release.

### 🧪 Demo 3 — Claude Code revisando un PR en GitHub Actions

- **Objetivo:** ver Claude trabajando sin humano en un pipeline.
- **Setup:** repo en GitHub con permisos de admin para Actions y un secret con `ANTHROPIC_API_KEY`.

**Pasos:**

1. Añade `.github/workflows/claude-review.yml`:
   ```yaml
   name: Claude Review
   on: pull_request
   jobs:
     review:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: anthropics/claude-code-action@v1
           with:
             anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
             prompt: "Revisa este PR. Comenta solo cambios con riesgo real."
   ```
2. Abre un PR con un cambio menor.
3. Observa el comentario que deja la action.

**Qué observar:**

- Claude no aprueba ni mergea: solo comenta.
- El prompt determina la calidad del review. *"Revisa el PR"* genera ruido; *"comenta solo cambios con riesgo real"* afina.
- El coste sale del workspace de tu organización: cada review consume tokens.

> Profundizamos en CI/CD en el [Tema 24 — DevOps y pipelines](tema-24-devops-cicd.md).

## 8. Ventajas comparativas de cada interfaz según debugging, refactorización o revisión

| Tarea | Interfaz óptima | Por qué |
|---|---|---|
| Debugging multi-archivo | **CLI / IDE** | Ejecutar tests y ver logs en vivo |
| Refactor masivo | **CLI** | Sesión larga, slash commands, control de modo |
| Revisión de PR puntual | **Web / Slack** | Ligero, sin contexto local |
| Code review en CI | **GitHub Actions** | Sistemático, sin humano |
| Onboarding a un repo | **IDE** | Navegación visual + chat lateral |
| Pregunta rápida del equipo | **Slack** | Compartido y archivable |

## 9. Decisiones de uso por tipo de proyecto, tamaño de repositorio y contexto operativo

| Contexto | Interfaz recomendada |
|---|---|
| Repo pequeño + tarea puntual | Web o desktop |
| Monorepo grande | CLI o IDE |
| Equipo distribuido | Slack para sync, IDE para trabajo |
| Trabajo móvil ligero | Web (móvil/tablet) |
| Sesiones largas de refactor | CLI con tmux |
| Revisión sistemática de PRs | CI/CD |

## 10. Estrategia de adopción combinada entre interfaces dentro de un mismo equipo

Una organización madura usa **varias interfaces a la vez**:

- **CLI** → devs senior y líderes técnicos para sesiones intensivas.
- **IDE** (VS Code/JetBrains) → dev en general, día a día.
- **Slack** → toda la organización para preguntas y coordinación.
- **CI/CD** → red de seguridad: review automático en cada PR.
- **Web/desktop** → fallback cuando no hay setup local.

> No hay "una interfaz correcta". Hay **una interfaz correcta para cada momento**.

---

## Resumen

- **CLI** = máxima potencia. **IDE** = mejor UX para revisión visual.
- **Web/desktop** = ligereza y continuidad.
- **Slack** = coordinación, no programación.
- **CI/CD** = asistencia automática, nunca decisión final de release.
- Adopción madura = **combinación**, no unicidad.
