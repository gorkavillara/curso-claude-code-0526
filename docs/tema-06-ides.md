# Tema 6 — Integración con VS Code y JetBrains

> **Duración estimada:** \~60 min **Tipo:** práctico + demos guiadas

## Objetivo del tema

Trabajar Claude Code **desde el editor** sin perder velocidad: chat lateral, diffs inline, navegación contextual y revisión de cambios. Saber cuándo el IDE aporta y cuándo conviene volver a la CLI.

***

## 1. Instalación y uso de la extensión nativa de VS Code

* Extensión oficial en el marketplace de VS Code.
* Tras instalar:
  * Panel lateral con chat de Claude Code.
  * Comando `Claude Code: Open` accesible desde la paleta (`Cmd/Ctrl+Shift+P`).
  * Atajos integrados con la selección actual.
* Login compartido con la CLI: si ya estás autenticado en terminal, la extensión hereda la sesión.

## 2. Auto-instalación de integración cuando se lanza desde terminal compatible

* Si lanzas `claude` desde la **terminal integrada de VS Code** sin la extensión instalada:
  * Detecta el IDE.
  * Te ofrece instalarla automáticamente.
  * Tras aceptar, la sesión sigue dentro del editor con UI mejorada.
* Funciona también con JetBrains si lanzas desde su terminal integrada.

> No tienes que ir al marketplace si ya usas la CLI. El propio agente te lo monta.

## 3. Flujo de trabajo entre chat, diff, edición y ejecución de pruebas

Ciclo típico dentro del IDE:

1. **Selecciona** código en el editor (función, archivo, carpeta).
2. **Pregunta** en el panel lateral con la selección como contexto automático.
3. El agente responde y, si edita, abre el **diff inline**.
4. **Acepta / rechaza** bloque a bloque desde el editor.
5. Pídele ejecutar tests (`npm test`, `pytest`…) → output dentro del IDE.
6. Si falla, sigue iterando en el mismo chat con el mismo contexto.

### 🧪 Demo 1 — Ciclo completo dentro de VS Code

* **Objetivo:** ejercitar el bucle _seleccionar → preguntar → diff → aceptar → ejecutar_ sin salir del editor.
* **Setup:** Notebox abierto en VS Code con la extensión activa.

**Pasos:**

1. Abre `src/services/notes.ts`.
2. Selecciona la función `createNote`.
3.  En el panel lateral:

    ```
    Añade validación: el body no puede superar 5000 caracteres. Devuelve un
    error semántico (no un Error genérico) y añade un test que lo cubra.
    Ejecuta los tests al terminar.
    ```
4. Acepta los bloques del diff uno a uno.
5. Verifica que el panel muestra los tests pasando.

**Qué observar:**

* La selección se transmite como contexto sin que la pegues.
* El diff inline te lleva al sitio del cambio.
* Si un test falla, la siguiente respuesta del agente ya tiene el output del fallo en su contexto.

### 🧩 Ejercicio 1 — Ciclo completo con y sin selección

> **Rama:** `git checkout tema-06/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Repite el ciclo seleccionar → preguntar → diff → ejecutar sobre la misma tarea, una vez con la función seleccionada y otra sin selección. Rellena la tabla comparativa del `EJERCICIO.md` y verifica que los tests siguen verdes.

## 4. Uso de drag and drop de archivos y carpetas en chats de IDE cuando aplica

* Arrastra archivos del explorador al chat → se añaden como contexto.
* Sirve para carpetas enteras (con cuidado: muchos tokens).
* Útil cuando un archivo no aparecería de forma natural por nombre o ruta (ej.: `notes.json` de fixtures).

## 5. Revisión de cambios grandes desde el editor con apoyo de Claude Code

* Para PRs grandes: abre el diff en el panel "Source Control" o desde `gh pr checkout`.
* En el chat: _"resume los cambios de este PR y márcame los riesgos"_.
* El agente cruza el diff con el resto del repo (no solo lee el patch).
* Revisar línea a línea sigue siendo tu trabajo — Claude te **prioriza** dónde mirar primero.

### 🧪 Demo 2 — Revisar un PR grande desde el editor

* **Objetivo:** usar Claude como "co-pilot de revisión" para no leer todo a ciegas.
* **Setup:** un PR no trivial en cualquier repo (puedes usar uno real de tu trabajo en una rama de prueba).

**Pasos:**

1. Hazte checkout del PR localmente.
2.  Abre VS Code y, en el chat:

    ```
    Compara la rama actual con main. Resume los cambios en 5 puntos
    y marca los 3 más arriesgados con justificación.
    ```
3. El agente lee el diff completo y te devuelve los puntos.
4. Ve a cada punto arriesgado en el editor y léelo a mano.
5. Cuando dudes de algo, pregunta en el chat: _"explícame por qué este cambio en `services/X` es seguro respecto a los callers en `routes/Y`"_.

**Qué observar:**

* Reduces el coste de revisión sin delegar la revisión.
* El agente puede equivocarse sobre qué es "arriesgado": tú decides.
* El editor es el sitio natural para esta tarea, mucho mejor que la CLI.

### 🧩 Ejercicio 2 — Revisión de cambios grandes

> **Rama:** `git checkout tema-06/ejercicio-02` · **Tiempo:** 15 min · **Tipo:** En clase

Tienes un `CAMBIOS_PENDIENTES.md` con 4 cambios documentados (uno de ellos revertido). Usa Claude desde VS Code para clasificarlos y profundizar en el más arriesgado, detectando el revertido sin leer el `git log` manualmente.

## 6. Navegación contextual entre símbolos, archivos y zonas candidatas de cambio

* _"Llévame a donde se valida X"_ → el agente abre el archivo y línea.
* _"¿Dónde se llama a `createNote`?"_ → equivalente a _find usages_, pero con explicación.
* Útil en repos legacy donde _go to definition_ del IDE no resuelve bien (mocks, inyección dinámica, generadores).

## 7. Integración con debugging y feedback visual del IDE

* Pon un breakpoint, lanza la sesión de debug del IDE.
* Cuando para en el breakpoint, comparte el contexto de variables al chat.
* _"Tengo `note.body` con esto y `existing` con esto otro. ¿Por qué falla la comparación?"_
* El agente puede leer el código alrededor y proponer hipótesis con conocimiento del estado real.

### 🧪 Demo 3 — Debug asistido en VS Code

* **Objetivo:** combinar herramientas del IDE (breakpoint, watch) con razonamiento del agente.
* **Setup:** Notebox con un test que falla intencionadamente (por ejemplo, modifica un test para que dé un error sutil).

**Pasos:**

1. Abre el test, pon un breakpoint en la línea de la aserción.
2. Lanza la sesión de debug (`F5`).
3. Cuando pare, copia los valores de las variables relevantes.
4.  En el chat:

    ```
    El test pausa aquí. `expected` vale X, `actual` vale Y. Mira la lógica
    de createNote y dime por qué difieren.
    ```
5. Sigue las pistas del agente, hipótesis a hipótesis.

**Qué observar:**

* El estado real (variables en el debugger) es **más potente** que los logs.
* El agente razona mejor con datos concretos que con descripciones vagas.
* Esta combinación es difícil de replicar en CLI pura.

### 🧩 Ejercicio 3 — Navegación contextual y debug asistido

> **Rama:** `git checkout tema-06/ejercicio-03` · **Tiempo:** 15 min · **Tipo:** En clase

Responde 4 preguntas de navegación del repo sin abrir archivos manualmente. Después crea un test que falla deliberadamente y usa los valores exactos del fallo para que Claude diagnostique la causa.

## 8. Particularidades del trabajo desde JetBrains frente a VS Code

|                               | VS Code                    | JetBrains                                |
| ----------------------------- | -------------------------- | ---------------------------------------- |
| UX general                    | Chat lateral, diffs inline | Equivalente, integrada con tools windows |
| Refactor automatizado del IDE | Bueno                      | **Excelente** (rename, extract, move)    |
| Análisis estático nativo      | Por extensión              | Profundo y nativo                        |
| Integración con DBs / Docker  | Por extensión              | Nativa en Ultimate                       |
| Curva de adopción             | Baja                       | Media-alta                               |

> En JetBrains usa el agente para tareas de **escritura y exploración**, y deja los refactors mecánicos al refactor del IDE — no compitas.

## 9. Decisiones de productividad según tamaño y tipo de repositorio

| Repo                               | Mejor herramienta                                       |
| ---------------------------------- | ------------------------------------------------------- |
| Pequeño (≤ 50 archivos)            | CLI o VS Code, indistinto                               |
| Mediano (frontend o API estándar)  | **VS Code** con la extensión                            |
| Grande monolítico (≥ 500 archivos) | **CLI** para sesiones largas; IDE para revisión puntual |
| Backend Java/Kotlin/Python pesado  | **JetBrains** + extensión                               |
| Monorepo multi-stack               | CLI con `--add-dir`                                     |

## 10. Buenas prácticas para que la integración IDE no sustituya el criterio técnico

* **Acepta diffs uno a uno** en cambios sensibles, no en bloque.
* **No actives `auto` mode dentro del IDE.** El editor te facilita la revisión: aprovéchalo.
* **Activa el linter y el formatter del proyecto** — son tu segunda red de seguridad.
* **No uses el IDE para "explorar" repos sensibles** sin antes configurar `denyRead` (Tema 4).
* Si el agente edita 12 archivos en una iteración, **detente y revisa**. Mejor 3 iteraciones pequeñas que una grande sin control.

> El IDE hace que aceptar cambios sea fácil. Eso no significa que aceptarlos sea seguro.

***

## Resumen

* VS Code y JetBrains tienen extensión oficial con UX equivalente.
* Auto-instalación al lanzar `claude` desde la terminal del IDE.
* Bucle natural en IDE: **seleccionar → preguntar → diff → aceptar → ejecutar**.
* Revisar PRs grandes con el agente como **co-piloto de revisión**, no como revisor.
* En JetBrains: deja los refactors mecánicos al IDE; usa el agente para escritura y exploración.
* El editor facilita aceptar cambios. **No relaja la revisión.**
