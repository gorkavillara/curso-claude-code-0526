# Preguntas frecuentes de alumnos

Preguntas recibidas antes o durante el curso. Cada una lleva el tema o temas donde se responde, y una nota cuando el material del curso no alcanza a cubrirla del todo.

---

## 1. "Permisos para ejecutar dependencias del Claude Agent SDK" — ¿cómo se configura?

**Temas:** Requisitos previos · Tema 3 (Preparación del entorno técnico)

Se instalan paquetes del SDK de Anthropic en los bloques avanzados (Temas 19–21). El permiso que hay que verificar antes del curso:

```bash
# Node / npm
npm install @anthropic-ai/sdk

# Python (si se usa el SDK en Python)
pip install anthropic
```

Lo que bloquea esto en entornos corporativos:

- Proxy o firewall que intercepta `registry.npmjs.org` o `pypi.org`
- EDR que bloquea escritura en `node_modules` en ciertas rutas
- npm configurado con un registry interno que no tiene los paquetes de Anthropic

**Verificación práctica (Windows PowerShell):**

```powershell
$tmp = "$env:TEMP\test-claude-sdk"
New-Item -ItemType Directory -Force $tmp | Out-Null
Set-Location $tmp
npm init -y
npm install @anthropic-ai/sdk
# Debe completarse sin error de red ni de permisos
```

Si falla → hablar con IT para añadir excepción en el proxy o en el registry interno.

---

## 2. Microservicios y multi-repo: contexto, memoria y trabajo coordinado

**Temas:** Tema 7 (CLAUDE.md y memoria) · Tema 19 (Subagentes) · Tema 22 (CLI avanzada: `--add-dir`) · Tema 25 (Arquitectura) · Tema 26 (Gobierno corporativo)

El curso está centrado en un repositorio único, pero la estrategia para multi-repo funciona así:

### Contexto por repositorio

Cada repo tiene su propio `CLAUDE.md` con la arquitectura, convenciones y puntos de extensión de ese servicio. Es el contrato que el agente lee al arrancar en ese directorio.

### Trabajo coordinado entre repos

Claude Code permite añadir directorios adicionales en la misma sesión:

```bash
# Sesión sobre el frontend, con acceso de lectura al backend
claude --add-dir ../api-backend
```

El agente puede leer y editar en ambos repos simultáneamente. Se puede pedir explícitamente: *"crea esta pantalla en el front e implementa los endpoints correspondientes en el backend"* y Claude opera en los dos árboles.

### Memoria y conocimiento compartido

Para conocimiento que cruza repos (contratos de API, decisiones de arquitectura global, patrones de dominio):

- Un **repo de documentación compartida** (`arquitectura/`, `adr/`, `contratos-api/`) que se añade como directorio adicional en cualquier sesión: `claude --add-dir ../docs-arquitectura`
- En ese repo, un `CLAUDE.md` raíz que describe qué contiene y cómo usarlo
- Los contratos de API (OpenAPI, AsyncAPI) viven ahí y son la fuente de verdad para todos los servicios

### Para preguntas arquitectónicas globales

Arrancar Claude Code desde el repo de documentación compartida con acceso a los repos que se quiera analizar mediante `--add-dir`. El agente puede razonar sobre el conjunto.

---

## 3. Documentación compartida en arquitecturas multi-repo

**Temas:** Tema 14 (Documentación técnica) · Tema 25 (Arquitectura) · Tema 26 (Gobierno)

Opciones ordenadas de menor a mayor fricción:

### Opción A: Repo de arquitectura dedicado

Un repositorio `arquitectura` o `docs-ingenieria` que contiene:

```
arquitectura/
├── CLAUDE.md              ← instrucciones para el agente sobre este repo
├── adr/                   ← Architecture Decision Records
├── contratos/             ← APIs, eventos, esquemas compartidos
├── servicios/             ← mapa de servicios, responsabilidades, dependencias
├── infra/                 ← infra global, entornos, secretos (sin valores reales)
└── onboarding.md          ← guía de entrada para nuevos desarrolladores
```

Ventaja: versionado en Git, auditable, usable desde cualquier repo con `--add-dir`.

### Opción B: Wiki corporativa vía MCP

Si la documentación ya vive en Confluence, Notion o similar, se expone como servidor MCP y el agente la consulta directamente. Cubierto en Tema 20.

### Opción C: CLAUDE.md con referencias cruzadas

Cada `CLAUDE.md` de servicio incluye una sección de referencias explícitas:

```markdown
## Contexto de arquitectura global
Ver contratos en `../arquitectura/contratos/` (añadir con --add-dir).
Este servicio implementa el contrato `pedidos-v2.yaml`.
```

---

## 4. Documentación de infraestructura y arquitectura global de empresa

**Temas:** Tema 26 (Gobierno corporativo) · Tema 20 (MCP para sistemas internos)

El planteamiento es el mismo que el punto anterior pero orientado a Sistemas / IT en lugar de a desarrollo de producto:

- Un repo `infra-docs` o equivalente con topología de red, servicios desplegados, runbooks, políticas de acceso
- Servidores MCP que exponen inventario de infraestructura (Terraform state, inventario de Ansible, registros de Kubernetes) para que el agente pueda consultarlos sin que el operador tenga que copiar y pegar
- El agente se convierte en un copiloto de operaciones: *"¿qué servicios dependen del host X?"*, *"genera el runbook para reiniciar el cluster de pagos"*

---

## 5. Cómo funciona el contexto de Claude Code

**Temas:** Tema 1 (Fundamentos) · Tema 7 (CLAUDE.md y memoria) · Tema 22 (CLI avanzada: sesiones y compactación)

Hay cuatro capas, independientes:

| Capa | Dónde vive | Duración |
|---|---|---|
| **Contexto de conversación** | RAM de la sesión activa | Solo mientras la sesión está abierta. Se pierde al salir. |
| **Contexto de proyecto** | `CLAUDE.md` y `.claude/rules/` en el repositorio | Permanente, versionado en Git. Se carga en cada sesión sobre ese repo. |
| **Contexto de usuario** | `~/.claude/settings.json`, `~/.claude/CLAUDE.md` | Permanente, local a la máquina. Se aplica en todas las sesiones de ese usuario. |
| **Auto memory** | `~/.claude/memory/` (archivos Markdown) | Permanente, local. El agente lo escribe y lee para recordar decisiones entre sesiones. |

**No hay un contexto "global" de organización por defecto.** El equivalente es el plan managed settings (para Team/Enterprise), que inyecta instrucciones corporativas en todas las sesiones de la organización.

Cuando una sesión se alarga mucho, Claude Code compacta automáticamente el historial para caber en el contexto del modelo. Se puede forzar con `/compact`. La sesión se puede reanudar con `/resume` aunque se haya cerrado la terminal.

---

## 6. Refactoring de Omnis con Claude Code

**Temas:** Tema 10 (Exploración de repos) · Tema 12 (Refactorización) · Tema 17 (Dependencias y migraciones de stack)

Omnis Studio usa un lenguaje propietario (4GL/Omnis Script) que los modelos conocen peor que Python, TypeScript o Java. Eso cambia la estrategia:

**Qué funciona bien:**
- Exploración y comprensión del código existente: *"explícame qué hace esta clase Omnis"*
- Documentar lógica de negocio embebida en el código antes de migrar
- Generar la capa destino (si la migración va hacia un stack moderno): Claude genera el backend REST o el frontend nuevo con mucho más precisión que el Omnis Script de origen
- Diseñar el plan de migración por fases con tests de regresión

**Qué requiere más supervisión:**
- Edición directa de código Omnis Script: Claude puede cometer errores sintácticos en un lenguaje poco representado en sus datos de entrenamiento. Hay que revisar con más cuidado que en lenguajes estándar.

**Estrategia recomendada para Omnis:**
1. Usar Claude para entender y documentar el sistema actual (qué hace, no cómo está escrito)
2. Definir la arquitectura destino con Claude como copiloto de diseño
3. Implementar la capa nueva en el lenguaje destino (donde Claude es más preciso)
4. Usar Claude para generar los tests de regresión que validan la equivalencia funcional
5. Migrar gradualmente por módulos

---

## 7. Agentes autónomos 24/7: revisión de logs, alertas en Slack, tareas en Redmine

**Temas:** Tema 19 (Subagentes) · Tema 20 (MCP) · Tema 24 (CI/CD y automatización)

Claude Code como herramienta interactiva no corre en modo daemon. Para agentes autónomos que funcionen sin intervención humana, la vía es el **Claude Agent SDK** (cubierto en el bloque avanzado del curso):

```typescript
// Patrón: agente de monitorización con cron
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function revisarLogs() {
  const logs = await obtenerLogsRecientes(); // función propia

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    system: `Eres un agente de monitorización. Analiza los logs y determina si hay errores críticos.
             Si los hay, devuelve JSON con: { alerta: true, resumen: "...", severidad: "alta|media" }`,
    messages: [{ role: "user", content: logs }],
  });

  const resultado = JSON.parse(response.content[0].text);
  if (resultado.alerta) {
    await enviarSlack(resultado.resumen);
    await crearTareaRedmine(resultado);
  }
}

// Ejecutar con cron, GitHub Actions scheduled, o un proceso Node con setInterval
```

**Infraestructura para hacerlo 24/7:**
- Cron job en un servidor (Linux `crontab`, Windows Task Scheduler)
- GitHub Actions con `schedule:` (trigger `cron`)
- Un contenedor Docker con el agente corriendo en loop

**Sobre Cowork / OpenHands y frameworks de agentes alternativos:**

Existen frameworks de agentes autónomos de código (OpenHands, anteriormente OpenDevin; CrewAI; LangGraph) que permiten orquestar múltiples agentes especializados. Se pueden combinar con Claude vía API. El Tema 19 da la base conceptual; integrar uno de estos frameworks en un flujo real es material más avanzado que puede abordarse como extensión del curso.

---

## 8. LLMs locales en hardware propio (NVIDIA DGX Spark) para datos confidenciales

**Fuera del alcance del curso tal como está diseñado.**

Claude Code como producto conecta siempre con los modelos de Anthropic vía API. No soporta modelos locales de forma nativa.

Sin embargo, el **Claude Agent SDK** permite construir agentes propios que usen cualquier proveedor, incluido un modelo local servido mediante una API compatible con OpenAI (vLLM, Ollama, LM Studio, TensorRT-LLM en DGX Spark):

```typescript
// Ejemplo: agente con modelo local via API compatible OpenAI
import OpenAI from "openai"; // o el cliente HTTP que prefieras

const localClient = new OpenAI({
  baseURL: "http://mi-dgx-spark:8000/v1", // endpoint local
  apiKey: "local", // ignorado por vLLM/Ollama
});
```

**Consideraciones para DGX Spark:**
- Modelos recomendados para tareas de código: Llama 3.1 70B/405B, Qwen2.5-Coder, DeepSeek-Coder V2
- Servir con vLLM: alto throughput, API compatible con OpenAI, soporte multi-GPU
- La calidad en tareas complejas de razonamiento sobre código será menor que Claude Opus salvo con los modelos más grandes (405B+)

**Patrón de uso mixto (confidencialidad + calidad):**
- Datos confidenciales (código propietario, credenciales, PII) → modelo local en DGX
- Razonamiento arquitectónico, generación de tests, code review de código no sensible → Claude vía API con datos sanitizados

Este tema merece una sesión específica si la organización tiene requisitos de soberanía de datos. Puede abordarse como taller complementario al curso.

---

## Dudas surgidas en las sesiones

Recopilación de preguntas que aparecieron durante la formación y que merecen respuesta documentada para futuros repasos.

## 9. "¿Qué diferencia hay entre `sandbox.enabled: true` y el auto mode? ¿No hacen lo mismo?"

**Temas:** T4 · T5

No, son **mecanismos ortogonales**. Resuelven problemas distintos y se pueden combinar:

- **Auto mode** controla **quién decide**: cuando está activo, Claude no pide confirmación para acciones rutinarias y actúa por su cuenta. Es una decisión sobre permisos.
- **`sandbox.enabled: true`** (en `settings.json`) controla **dónde se ejecuta**: Claude lanza comandos en un sandbox con sistema de ficheros y red restringidos. Aunque tenga permiso para ejecutar `rm -rf /`, ese borrado solo afecta al sandbox; los archivos reales siguen intactos.

La forma simple de recordarlo: **auto mode quita los prompts, sandbox limita el blast radius**.

**Ejemplo para testear en clase:**

| Configuración | Qué ocurre al pedir "borra `tmp/test.txt`" |
|---|---|
| Auto mode OFF + sandbox OFF | Claude pide confirmación. Si apruebas, el archivo se borra de verdad. |
| Auto mode ON  + sandbox OFF | Claude borra sin preguntar. El archivo desaparece. |
| Auto mode OFF + sandbox ON  | Claude pide confirmación, pero aunque apruebes el borrado solo afecta al sandbox. El archivo real persiste. |
| Auto mode ON  + sandbox ON  | Claude borra sin preguntar **dentro del sandbox**. El archivo real persiste. |

**Combo recomendado para exploración agresiva** (refactors grandes, prueba y error, agentes autónomos): auto mode + sandbox. Tienes velocidad sin riesgo. Para tareas críticas sobre código real, mantén al menos uno de los dos desactivado.

## 10. "¿Qué hace exactamente la carpeta `.claude/rules/`?"

**Temas:** T7

Es la carpeta donde se guardan **normas especializadas del proyecto segmentadas por dominio**: `testing.md`, `security.md`, `error-handling.md`, `naming.md`, etc. Cada archivo contiene reglas extensas que no tendría sentido meter en `CLAUDE.md` (lo saturarían).

Claude **no carga todas las rules siempre** — eso reventaría el contexto. Carga la rule cuando detecta que su contenido o cabecera coincide con la intención del prompt actual: pides un test → carga `testing.md`; pides hardening → carga `security.md`.

Esto permite mantener `CLAUDE.md` ligero (visión general del proyecto) y delegar la profundidad a rules cargadas bajo demanda.

→ Ver **Tema 7, sección 5** para estructura, ejemplos y la sección "Cuándo se carga una rule en contexto".

## 11. "Si empiezo un mensaje con `#`, ¿se añade a `CLAUDE.md`?"

**Temas:** T7

Sí. Claude Code interpreta cualquier mensaje que empieza con `#` como **una instrucción de memoria**: añade el resto del texto a `CLAUDE.md` (o a `CLAUDE.local.md`, según la elección que ofrece la propia herramienta).

**Comportamiento esperado** (basado en la documentación oficial de Claude Code; conviene reproducirlo en clase con la versión instalada):

- Al enviar `# las funciones públicas deben llevar docstring`, Claude Code ofrece elegir a qué archivo de memoria añadirlo: `./CLAUDE.md` (proyecto, versionado), `./CLAUDE.local.md` (proyecto, no versionado) o `~/.claude/CLAUDE.md` (usuario, global).
- Una vez elegido, escribe la entrada y queda disponible para futuras sesiones.
- Funciona aunque no exista aún el archivo de destino: lo crea.

**Cuándo usarlo:** notas cortas que quieres consolidar sin abrir el archivo. Para entradas largas o reorganizar la memoria, sigue siendo mejor editar `CLAUDE.md` directamente.

> ⚠️ **A verificar en cada versión:** la sintaxis exacta y el menú de elección pueden cambiar entre versiones de Claude Code. Si dudas, prueba con una nota corta antes de confiar en ello para algo importante.

---

## Índice de preguntas por tema del curso

| Pregunta | Temas relacionados |
|---|---|
| Permisos Agent SDK | Requisitos · T3 |
| Multi-repo y microservicios | T7 · T19 · T22 · T25 · T26 |
| Documentación multi-repo | T14 · T25 · T26 |
| Documentación de infra global | T20 · T26 |
| Cómo funciona el contexto | T1 · T7 · T22 |
| Refactoring de Omnis | T10 · T12 · T17 |
| Agentes autónomos 24/7 | T19 · T20 · T24 |
| LLMs locales (DGX Spark) | Fuera del temario principal |
| Sandbox vs auto mode | T4 · T5 |
| Carpeta `.claude/rules/` | T7 |
| Sintaxis `#` para memoria | T7 |
