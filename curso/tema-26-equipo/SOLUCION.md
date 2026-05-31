# Soluciones de referencia — Tema 26

> Material privado para el formador. Las soluciones no son únicas — sirven como referencia de "qué calidad de entrega esperar" en clase y qué errores señalar.

## Ejercicio 1 — Auditar la política plantada

### Vaguedades esperables (al menos 4 de las 5)

| Cita textual (de la política plantada) | Por qué es vaga | Reformulación operativa |
|---|---|---|
| "Usar la IA de forma responsable" | "Responsable" no es regla — no se puede aplicar mañana | "No se commitea código generado sin tests en verde local" |
| "Tener cuidado con el código generado" | Sin objeto, sin verbo de acción | "Cualquier diff de más de 100 líneas o que toque `services/` requiere review humano antes de mergear" |
| "Consultar al equipo si hay dudas" | Sin trigger, sin destinatario | "Si la duda toca auth, pagos o migraciones, escalar al tech lead antes del commit" |
| "Evitar dependencias innecesarias" | "Innecesarias" es subjetivo | "Toda dependencia nueva en `package.json` requiere comentario en el PR justificando por qué no se puede resolver con código existente" |
| "Documentar las decisiones importantes" | Sin formato, sin sitio | "Decisiones de blast radius alto se documentan como DDR en `docs/governance/decisiones/` antes del merge" |

### Contradicciones esperables

- **Política dice:** "No leer ficheros sensibles" / **Settings dice:** `deny: Read(./.env)` pero **NO** deniega `Read(./.env.example)`. La política deja ambiguo si `.env.example` cuenta como sensible. Solución: la política aclara que `.env.example` está permitido por ser plantilla pública.
- **Política dice:** "Todo cambio se revisa" / **Settings dice:** `defaultMode: acceptEdits`. Hay tensión real: si el modo por defecto acepta ediciones, ¿cuándo se revisa? Solución: la política explicita que `acceptEdits` aplica a tareas de bajo blast radius, no a `services/` ni `package.json`.

### Huecos esperables (mínimo 3)

- Modificación de `package.json` (añadir/quitar deps): no aparece en política. Debería ir en "con review".
- Cambios en `services/` (la capa con más deuda): no aparece. Debería ir en "con review".
- Edición de tests existentes (vs añadir nuevos): no se distingue. Editar tests es de mayor blast radius que añadirlos.
- Modificación de hooks o plugins en `.claude/`: no aparece. Debería ir en "con review" o "prohibido sin aprobación".

### Errores frecuentes a señalar

- Alumno resume vaguedades sin cita textual → "pega la frase concreta de la política".
- Alumno reescribe la política entera → "tres cambios priorizados, no rewrite".
- "Qué dejo igual" vacío o de relleno → "una política que se reescribe entera cada vez no se mantiene".

---

## Ejercicio 2 — Distribución de reglas

### Reglas que conviene subir a managed (al menos 2)

- `deny: Read(./.env)` — protección de secretos es no negociable a nivel org, no por repo.
- `deny: Bash(rm -rf *)` — comando peligroso transversal, ningún repo de la org debería poder ejecutarlo.

### Reglas que conviene bajar a `CLAUDE.md` (al menos 2)

- "Responde en español" si está en settings.json → es convención, no restricción técnica imponible.
- "Prefiere respuestas concisas" si está en settings.json → convención de estilo, va en `CLAUDE.md`.
- "Los tests viven en `test/`" si aparece como permission → convención del proyecto, va en `CLAUDE.md`.

### Reglas mal expresadas (al menos 2)

- Prosa en `CLAUDE.md` tipo "no commitees archivos .env" → debería ser `deny: Write(./.env)` en settings.json (técnicamente imponible).
- Setting tipo "modelo prefiere alternativas con trade-offs" → no es regla, es convención. Va en `CLAUDE.md`.

### Tabla de distribución modelo

| Regla | Sitio actual | Sitio propuesto | Motivo |
|---|---|---|---|
| `deny Read(./.env)` | project | **managed** | Protección de secretos transversal a toda la org |
| `deny Bash(rm -rf *)` | project | **managed** | Comando peligroso, no negociable |
| `allow Bash(npm test)` | project | project | Contrato técnico de este repo |
| `enabledPlugins: pr-helper` | project | project | Específico de este repo |
| "Responde en español" | settings | **`CLAUDE.md`** | Convención humana, no imponible técnicamente |
| "Tests en `test/`" | (prosa en `CLAUDE.md`) | `CLAUDE.md` | Está en sitio correcto |
| `defaultMode: acceptEdits` | project | project | Decisión del equipo del repo |
| "No añadir deps sin justificar" | (prosa en `CLAUDE.md`) | `CLAUDE.md` | Convención del equipo, hook opcional |

### Errores frecuentes a señalar

- Alumno sube todo a managed → "managed es no negociable a nivel org, no contenedor universal".
- Alumno mezcla regla técnica y convención en la misma columna → "una es allow/deny, la otra es texto en `CLAUDE.md`".
- Justificaciones tipo "queda mejor ahí" → "criterio operativo, no estético".

---

## Ejercicio 3 — Trazabilidad de decisiones

### Diagnóstico de las 3 entradas plantadas

- **Entrada 1 (granular):** "2026-04-12 — Pedí a Claude renombrar `getNote` a `findNoteById`. Aceptado." → **Ruido**. Es un refactor local, no tiene blast radius. No debería estar en el log.
- **Entrada 2 (vaga):** "2026-04-20 — Decidimos cambiar el enfoque de validación. Lo discutimos con Claude." → **Vaga**. No reconstruye razonamiento: ¿qué cambio? ¿qué prompts? ¿quién firmó? No sirve a 6 meses.
- **Entrada 3 (razonable):** "2026-05-03 — DDR-007. Decisión: la validación de input vive en `services/`. Contexto: PENDING-002. Prompts pegados en docs/governance/decisiones/DDR-007. Firma: M. García (tech lead)." → **Razonable**. Tiene fecha, decisión clara, contexto, prompts archivados, firmante.

### Qué se audita y qué no (5+5)

**Sí se audita (blast radius alto):**

1. Decisiones arquitectónicas (storage, auth, framework).
2. Migraciones de schema o de datos.
3. Cambios que tocan auth o pagos.
4. Adopción o eliminación de dependencias críticas (Express, drivers, runtimes).
5. Cambios a la política de IA o a managed settings.

**No se audita (blast radius bajo):**

1. Refactors locales (renombrar variable, extraer función pequeña).
2. Tests unitarios añadidos sin cambio funcional.
3. Documentación (README, docstrings).
4. Reformateo / linter / typos.
5. Cambios en mensajes de log o textos de error.

### Formato canónico esperable (máx 8 líneas)

```markdown
## DDR-NNN — <decisión en imperativa>

- Fecha: YYYY-MM-DD
- Contexto: 1 frase + enlace a issue/ADR si aplica
- Decisión: 1 frase en presente imperativo
- Prompts usados: enlace a `docs/governance/decisiones/DDR-NNN-prompts.md`
- Alternativas descartadas: 1 frase
- Firmante humano: nombre + rol
- Revisión a 3 meses: SI / NO + fecha
```

### Ciclo de mantenimiento esperable

- **Dueño:** tech lead del repo (o el reviewer del PR donde se materializa la decisión).
- **Trigger:** cuando un PR contiene un cambio de blast radius alto identificado por la rúbrica de review.
- **Revisión:** quincenal — el tech lead revisa entradas nuevas en daily extendido y confirma que están bien dimensionadas.

### Antipatrones esperables (mínimo 3 con contramedida)

| Antipatrón | Contramedida |
|---|---|
| Loggear cada prompt automáticamente | Auditoría es deliberada — solo blast radius alto. Hook que detecta el tag `[DDR]` en el commit message como único disparador |
| Escribir entradas vacías para cumplir métrica | No medir "entradas/mes". Medir "decisiones reconstruibles a 3 meses" — cualitativo, no cuantitativo |
| Abandonar el log a los 2 meses | Dueño asignado + revisión quincenal en daily — si la revisión deja de ocurrir, sale señal en el sprint review |
| Log granular con 50 campos por entrada | Plantilla de 7 campos máximo. Si una decisión necesita más, va a ADR completo (no DDR) |

### Errores frecuentes a señalar

- Alumno cita "entrada 2 es vaga" sin pegar texto → "cita textual, no resumen".
- "Sí se audita" lista demasiado granular (tests, refactors) → "blast radius alto, no preferencia".
- Plantilla con 12+ campos → "8 líneas máximo, no se rellena si es más larga".
- Sin trigger definido → "sin trigger, el log se abandona".
- Antipatrones sin contramedida concreta → "una contramedida ejecutable por antipatrón".

---

## Notas generales de evaluación

- **Los tres ejercicios entregan `.md`.** No se modifica código fuente — el aprendizaje es de criterio, no de implementación.
- **El criterio gana al volumen.** Un alumno que entrega 3 vaguedades bien diagnosticadas con cita textual está mejor que uno que entrega 10 sin pegar texto.
- **La sección "qué dejo igual / qué no audito" es la más reveladora.** Discrimina alumnos que entienden el ejercicio (criterio) de los que solo lo aplican mecánicamente.
- **Si un alumno entrega los tres ejercicios con criterios operativos y citas textuales reales del repo, el tema está consolidado.**
