# Notas internas — Tema 26

## Por qué este tema cierra el bloque

Este es el último tema del bloque T19–T26 antes del proyecto final (T27). Todo lo anterior se ha hecho desde la perspectiva del **dev individual con herramientas**. Aquí el foco cambia a **equipo y organización**: las mismas piezas (settings, `CLAUDE.md`, skills, MCP, plugins, subagentes) reaparecen pero la pregunta es "¿cómo se coordina esto entre personas?".

Es un tema deliberadamente **conceptual + práctica de criterio**. No se modifica código fuente — los tres ejercicios entregan `.md`. El alumno **diagnostica, prioriza, justifica**. Si sale de la sesión con la lista de los tres entregables hechos con citas textuales reales y criterios operativos, el bloque está consolidado.

## Conexión con temas anteriores

- **Tema 4 (settings, scopes y políticas):** este tema usa toda la jerarquía managed/project/user/local. Si los alumnos no se acuerdan, repasar 5 min antes de E2.
- **Tema 7 (`CLAUDE.md` y memoria):** el `CLAUDE.md` del repo se extiende con sección de equipo. Mostrar cómo conviven convenciones técnicas y de equipo.
- **Tema 9 (skills):** las "skills compartidas" del Punto 3 son las skills del Tema 9 pero versionadas para el equipo, no para el autor.
- **Tema 14 (documentación y ADR):** el formato DDR es una versión ligera del ADR. Mostrarlo como continuum, no como alternativa.
- **Tema 15 (code review):** la rúbrica de review de PRs asistidos por IA es la del Tema 15 extendida con dimensión de gobernanza.

## Riesgos en la sesión

- **Discusión filosófica sobre "qué es responsable".** Cortar rápido. La sesión es operativa: lo que importa es qué pone el alumno en su `POLITICA-V2.md`, no la teoría general.
- **Alumnos que ya tienen política en su empresa.** Aprovechar — pedirles que la traigan mentalmente y diagnostiquen con los mismos criterios. Cada participante sale con su política empresa-real auditada.
- **Alumnos que no tienen managed settings disponibles.** Aclarar: el ejercicio es de **criterio de distribución**, no de implementación. Saber dónde iría una regla aunque tu empresa no use managed hoy es valioso.

## Material a tener listo

- Captura del `.claude/settings.json` plantado abierta.
- Captura del `CLAUDE.md` extendido abierta.
- Captura del log de auditoría plantado.
- Recordatorio del orden de precedencia managed > local > project > user.
