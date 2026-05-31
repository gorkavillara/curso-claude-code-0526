# Soluciones — Tema 25

> Referencia para el instructor. Las soluciones no son únicas: hay un margen amplio de respuestas correctas según los pesos que el alumno asigne a los ejes. Lo importante es la **estructura del razonamiento**, no que coincida con esta solución modelo.

---

## Ejercicio 1 — Alternativas de persistencia

### Tabla esperada (mínimo 3 alternativas reales)

| Alternativa | Qué es | Archivos tocados | Coste impl. | Coste cambio | Riesgo | Simplicidad | Encaje con services/ |
|---|---|---|---|---|---|---|---|
| **SQLite embebido** (`better-sqlite3`) | Fichero `.sqlite` en disco, motor relacional embebido | Nuevo `src/storage/sqlite.ts`, mantener interfaz de `memory.ts` | Bajo | Bajo (interfaz compatible) | Bajo | Alta (sin servidor) | Alto |
| **Postgres en Docker** (`pg`) | Servidor relacional en contenedor con docker-compose | Nuevo `src/storage/postgres.ts`, ajustes en `docker-compose.yml`, conexión por env | Medio | Bajo (interfaz compatible) | Medio (servidor más en stack) | Media (requiere arrancar contenedor) | Alto |
| **Fichero JSON** (`fs.promises`) | Persistencia trivial en `data/notes.json` | Nuevo `src/storage/json.ts`, gestión de concurrencia y atomicidad | Bajo | Alto (cuando aparezcan queries, hay que migrar) | Alto (race conditions en escritura) | Muy alta | Medio |

### Recomendación modelo

**SQLite embebido.** Notebox sigue siendo ejemplo de curso y SQLite arranca con `npm install` sin servidor externo, lo que respeta el principio del ADR-001 (arranque sin fricción). Frente a Postgres, perdemos capacidad de escalar a múltiples instancias y de hacer queries concurrentes desde varios procesos; frente al JSON, ganamos seguridad transaccional y queries reales. La interfaz de `storage/memory.ts` (save, findById, list, update) se mantiene — el cambio es un adapter nuevo, no una reescritura.

**Lo que se pierde con SQLite:** no es escalable horizontalmente (un fichero, un proceso); las migraciones de esquema requieren herramienta extra (`drizzle`, `prisma` o SQL manual); en CI hay que decidir qué se hace con el fichero (¿efímero? ¿committed?).

### Alternativa descartada

**Fichero JSON.** Aunque es la opción más simple inicialmente, el coste de cambio futuro es muy alto: la primera query no trivial (filtrar por fecha, paginar, ordenar) obliga a reescribir toda la capa. Es un atajo que se paga caro a las 3 features.

### "Qué información me falta para decidir"

- No conozco el roadmap de Notebox. Si el plan es subirlo a producción real, SQLite no escala — Postgres sería la opción correcta desde el principio.
- No sé qué restricciones de cumplimiento aplican a los datos. Notas de usuarios pueden caer bajo GDPR; el sitio donde viven los datos importa.
- No conozco la experiencia del equipo con Postgres operacionalmente. Si nadie lo ha mantenido nunca, el coste oculto es alto.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Trade-offs genéricos sin pesos | "Esto vale para cualquier proyecto. Pesa los ejes para Notebox concreto" |
| Recomendación solo con ventajas | "Dime qué pierdes con esa elección. Si no pierdes nada, no es trade-off" |
| 3 variantes de la misma alternativa (Postgres / Postgres pool / Postgres en RDS) | "Dame medios de persistencia distintos, no afinaciones del mismo" |
| Sección "información me falta" vacía o decorativa | "¿De verdad no te falta información? Roadmap, cumplimiento, equipo — algo de eso te tiene que faltar" |

---

## Ejercicio 2 — ADR-003 Validación de input

### ADR modelo (formato exacto del repo)

```markdown
# ADR-003 — Validación de input en la capa de services

**Contexto:** El endpoint POST `/notes` recibe `title` y `body` desde `req.body` y los pasa directamente a `notesService.create()` (`src/routes/notes.ts:6-10`). No hay validación: un `title` vacío, `undefined` o de 10.000 caracteres atraviesa la frontera y se persiste tal cual. Las rutas de `archive`/`unarchive` validan presencia del recurso por `findById`, pero no validan el `id` recibido (puede ser `""` o un UUID inválido). Además, el servidor MCP (`mcp-servers/notebox/server.js`) consume `notesService.create()` directamente, sin pasar por las rutas Express — por lo que cualquier validación en `routes/` no protege esa entrada.

**Decisión:** La validación de input vive en la capa de services (`src/services/notes.ts`). Cada función pública (`create`, `archive`, `unarchive`, `search`) valida sus parámetros al inicio y lanza un error tipado en caso de incumplimiento. Las rutas de Express y el servidor MCP confían en que services garantiza la integridad del input.

**Consecuencias:** Se gana un único punto de validación que protege tanto a la API HTTP como al servidor MCP del Tema 20 — la regla "valida en la frontera externa" se cumple ubicando la frontera en services, no en routes (porque hay dos consumidores externos: HTTP y MCP). Se pierde la posibilidad de devolver respuestas HTTP específicas (400 con detalle de campo) sin un adaptador en routes que mapee el error tipado al status code — esto es coste accesorio, no estructural. Queda por verificar: definir el tipo de error (`InvalidInputError` con `field` y `message`), añadir el adaptador en routes para mapear a 400, y migrar los tests de `notes.service.test.ts` para cubrir los casos de validación. Este ADR no contradice los ADR-001 ni ADR-002.
```

### `docs/architecture/README.md` actualizado

```markdown
# ADRs vigentes — Notebox

| ADR | Estado | Decisión |
|---|---|---|
| [ADR-001](./ADR-001-storage-en-memoria.md) | Aceptado | El almacenamiento por defecto es en memoria |
| [ADR-002](./ADR-002-express-framework.md) | Aceptado | Express como framework HTTP |
| [ADR-003](./ADR-003-validacion-de-input.md) | Aceptado | La validación de input vive en services |

## Decisiones pendientes

- [PENDING-001](./PENDING-001-persistencia.md) — Migrar storage in-memory a algo persistente.
- [PENDING-002](./PENDING-002-validacion-en-routes-o-services.md) — **Resuelto** por ADR-003.
```

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Decisión aspiracional ("se propone que...") | "Imperativo presente. La decisión ya está tomada en el ADR — no se está proponiendo" |
| Consecuencias solo con ventajas | "Falta 'qué se pierde'. Toda decisión arquitectónica sacrifica algo" |
| ADR sin citar archivos del repo | "¿Dónde está esto en el código? Cita ruta y línea o el ADR flota" |
| Olvidar actualizar el `README.md` del índice | "El ADR existe pero nadie lo encuentra. El índice es parte del entregable" |
| No mencionar la conexión con el servidor MCP | "Hay dos consumidores externos, no uno. Tu ADR considera HTTP pero olvida MCP" |

---

## Ejercicio 3 — Deuda arquitectónica + plan de mitigación

### Inventario priorizado (modelo)

| # | Olor | Archivo | Tipo | Coste ahora | Coste en 6m |
|---|---|---|---|---|---|
| 1 | Anidamiento profundo (5 niveles) en `archive`/`unarchive` | `src/services/notes.ts:20-62` | Anidamiento + lógica duplicada | ~30 líneas | ~80 líneas (con paginación y nuevas features) |
| 2 | Storage acoplado por import directo | `src/services/notes.ts:2`, `src/search/index.ts` | Acoplamiento (sin interfaz explícita) | ~5 archivos | ~12 archivos cuando aparezcan adapters |
| 3 | Validación inconsistente entre rutas | `src/routes/notes.ts:6-34` | Lógica dispersa / hueco de validación | ~40 líneas | ~100 líneas + bugs en producción |
| 4 | Búsqueda case-sensitive | `src/search/index.ts:6-9` | Bug arquitectónico (decisión no documentada) | ~10 líneas | ~10 líneas (no se compone) |
| 5 | Naming inconsistente de errores (return null vs throw) | `src/services/notes.ts` (varios) | Inconsistencia de contrato | ~20 líneas | ~60 líneas si el ADR-003 entra |

### Conexión con paginación

La feature pide `GET /notes?limit=N&offset=M`. Para implementarla limpiamente hay que añadir un nuevo método `list(filters, pagination)` en `services/notes.ts` y propagarlo a `storage`. Aquí mordemos primero **el olor #2 (acoplamiento)**: `services` importa directo de `storage/memory.ts`, así que el cambio de firma de `list` exige tocar las dos capas a la vez, sin posibilidad de iterar. Inmediatamente después, el olor #1 (anidamiento) se vuelve crítico — extender `archive`/`unarchive` con paginación de listas filtradas en ese estilo es inviable.

### Plan incremental para los 3 más rentables

**Paso 1 (olor #1, ~15 min):** aplanar `archive`/`unarchive` en `services/notes.ts`. Sustituir el anidamiento por early returns. Tests cubiertos: `test/notes.service.test.ts` (los 8 casos actuales pasan sin cambios).

**Paso 2 (olor #2, ~30 min):** introducir interfaz `Storage` en `src/storage/types.ts`, hacer que `memory.ts` la cumpla. `services/notes.ts` importa la interfaz, no la implementación. **No introducir adapter nuevo todavía** — eso entra solo cuando aparezca el segundo consumidor (Ejercicio 1 del Tema 25). Tests cubiertos: los existentes siguen pasando; no se añaden tests nuevos.

**Paso 3 (olor #3, ~45 min):** parquear hasta que ADR-003 esté firmado (depende del Ejercicio 2). Cuando ADR-003 esté aceptado, mover la validación a `services/` siguiendo el plan del ADR. Tests cubiertos: añadir suite `test/notes.validation.test.ts` con casos de validación (title vacío, body demasiado largo, id inválido).

### Qué dejo sin tocar y por qué

- **Olor #4 (búsqueda case-sensitive).** No se compone con el tiempo (siempre cuesta ~10 líneas). No afecta a la feature de paginación. Lo arreglo cuando un usuario o un test lo reporte como bug. Mientras tanto, está acotado.
- **Olor #5 (naming inconsistente de errores).** Se resuelve naturalmente cuando ADR-003 entre en vigor — el adaptador HTTP en routes mapeará un error tipado a status codes y eso fuerza un único contrato. Tocarlo antes es trabajo duplicado.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Inventario sin citar archivo / línea | "¿Dónde? Sin coordenadas no es diagnóstico" |
| Conexión con paginación decorativa ("la deuda nos afectará") | "Sé operativo. Qué archivo, qué línea, qué cambio bloquea" |
| Plan no incremental (reescritura masiva) | "Tema 12: refactorización progresiva. Un cambio, una verificación" |
| "Qué dejo sin tocar" vacío o "todo lo demás" | "Eso no es priorización. Dame dos olores que dejas conscientemente y por qué" |
| Introducir abstracción nueva sin segundo consumidor (Repository encima de storage) | "Storage ya es Repository. No añadas capa para 'formalizar'. YAGNI" |

---

## Notas transversales

### Sobre la calidad del prompting en arquitectura

El alumno bien posicionado en arquitectura **no le pide a Claude que decida** — le pide que enumere, compare y cite. Las preguntas eficaces tienen forma:

- "Dame 3 alternativas, no la mejor."
- "Trade-offs en ejes X, Y, Z."
- "Qué se pierde con esta opción."
- "Qué información me falta para decidir."

Las preguntas ineficaces tienen forma:

- "Cuál es la mejor arquitectura."
- "Qué patrón uso aquí."
- "Hazme una solución limpia."

Si el alumno solo formula del segundo tipo, redirigir explícitamente. El Tema 8 (Prompting profesional) es prerrequisito; este tema lo aplica a un dominio específico.

### Sobre la presencia del agente en decisiones arquitectónicas senior

En un equipo real, las decisiones arquitectónicas profundas se toman en **reunión humana**. Claude Code aporta análisis previo (la tabla de alternativas, el ADR borrador, la auditoría de deuda) — pero la firma sigue siendo de una persona con responsabilidad. Si algún alumno pregunta "¿entonces para qué usamos a Claude?", la respuesta es: para **acelerar la preparación de la conversación**, no para sustituirla. Una reunión arquitectónica que llega con la tabla ya hecha dura 30 minutos; una que empieza desde cero dura 3 horas.
