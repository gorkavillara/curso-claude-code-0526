# Notas internas — Tema 25

## Decisiones de diseño del tema

- **Tipo de sesión:** intercalada, consistente con Temas 22/23/24. Cada bloque (alternativas / ADR / deuda) es autónomo y el ejercicio aplica el patrón en caliente sobre el repo.
- **Ningún ejercicio modifica código fuente.** Los tres entregan `.md`. Esto es consciente: el tema es conceptual, sobre decisión arquitectónica y redacción de artefactos. Implementar las decisiones no encaja en 30 minutos por ejercicio.
- **Fixtures plantados como decisiones pendientes.** PENDING-001 y PENDING-002 son el equivalente arquitectónico del bug plantado de otros temas: el alumno los encuentra ya servidos, no tiene que inventar el contexto.
- **DEUDA-CONOCIDA.md como contexto del ejercicio 3.** Plantar la lista de olores reales + la próxima feature evita que el alumno tenga que adivinar el roadmap.

## Conexión con temas anteriores

| Tema | Conexión | Cómo se materializa |
|---|---|---|
| Tema 7 (CLAUDE.md) | El `CLAUDE.md` del repo puede referenciar los ADRs vigentes | Mencionar en el cierre — alta densidad |
| Tema 8 (Prompting) | Las preguntas eficaces de arquitectura son una aplicación del prompting profesional | Demo 1 lo ejercita directamente con anclado de ejes |
| Tema 12 (Refactorización) | El plan incremental del Ejercicio 3 sigue la disciplina del Tema 12 | Notas para el formador lo refuerzan |
| Tema 14 (ADRs en documentación) | Tema 14 enseñó a escribir; Tema 25 enseña a decidir y luego escribir | Demo 2 + Ejercicio 2 son la profundización |
| Tema 19 (Subagentes) | Un subagente especializado en arquitectura podría ser el siguiente paso | No se desarrolla en este tema, pero se menciona como continuidad |
| Tema 20 (MCP) | El servidor MCP es un consumidor real de services → motiva el ADR-003 | El PENDING-002 lo cita explícitamente |

## Riesgos del tema

- **Que la sesión derive a debate filosófico** sobre "qué es buena arquitectura" en abstracto. Cortar — el ejercicio es concreto: tablas, ADRs, archivos del repo.
- **Que el alumno espere que el agente decida.** Es el riesgo principal. Detectarlo en la Demo 1: si el alumno acepta la recomendación sin pedir contras, redirigir.
- **Que los ADRs queden vacíos / aspiracionales.** Forzar el presente imperativo y la sección "qué se pierde". Sin eso, el ADR no es ADR.
- **Que el Ejercicio 3 derive en reescritura masiva.** Si el plan propone refactor de toda una capa en un paso, recordar el Tema 12.

## Si el tema va corto (60 min)

Recortar Ejercicio 3 a 15 min (solo inventario de la tabla, sin plan completo) o convertirlo en práctica guiada con el formador. El núcleo del tema queda en E1 y E2 — esos no se recortan.

## Si el tema va sobrado (>120 min)

- Pedir un ADR de sustitución que deprecie ADR-001 a favor de la alternativa elegida en E1.
- Pedir al alumno avanzado que escriba el plan de migración de datos para la alternativa elegida (data in flight, downtime, rollback).
- Discutir en pizarra la diferencia entre "decisión arquitectónica" y "decisión de diseño detallado" — dónde está la frontera, qué merece ADR y qué basta comentario en código.

## Fixtures que pueden necesitar refresh entre cohortes

- `docs/architecture/DEUDA-CONOCIDA.md` cita "próxima feature: paginación". Si en cohortes posteriores Notebox ya tiene paginación implementada (porque otro tema la usó), cambiar la feature a otra plausible: "exportación a JSON", "índice por etiquetas", "tags como entidad propia".
- Los ADR-001 y ADR-002 se mantienen estables.
- El smoke test `test/architecture-fixtures.test.ts` valida que los archivos existen — si se renombran, ajustar el test.

## Sobre el orden de los ejercicios

El orden es deliberado: explorar → redactar → auditar. Cada paso introduce una habilidad acumulativa:

1. **E1** entrena el reflejo de **no saltar a la implementación**. Espacio de alternativas primero.
2. **E2** entrena el rigor de **decisión documentada** con formato vinculante.
3. **E3** entrena la **mirada estructural** sobre el repo completo, ya con los dos reflejos anteriores activos.

Si se invierte el orden (auditoría primero), el alumno cae en la trampa de proponer fixes antes de entender alternativas. No invertir.
