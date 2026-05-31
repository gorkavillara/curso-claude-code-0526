# Ejercicios — Tema 26

| Ejercicio | Rama | Tiempo | Tipo | Descripción breve |
|---|---|---|---|---|
| Ejercicio 1 | `tema-26/ejercicio-01` | 25 min | En clase | Audita `docs/governance/POLITICA-CLAUDE-CODE.md` plantada (vaguedades, contradicciones con `.claude/settings.json`, huecos). Entrega `POLITICA-CLAUDE-CODE-V2.md` con tabla de vaguedades, contradicciones, huecos, política reescrita aplicando los 3 cambios más rentables y "qué dejo igual". |
| Ejercicio 2 | `tema-26/ejercicio-02` | 25 min | En clase | Audita `.claude/settings.json`, `CLAUDE.md` y `MANAGED-SETTINGS-EJEMPLO.json`. Entrega `DISTRIBUCION-REGLAS.md` con tabla de redistribución (regla, sitio actual, sitio propuesto, motivo), mínimo 2 reglas a subir a managed, 2 a bajar a `CLAUDE.md` y 2 mal expresadas. |
| Ejercicio 3 | `tema-26/ejercicio-03` | 25 min | En clase | Audita el log plantado en `.claude/auditoria/decisiones.md` y la `PLANTILLA-DDR.md`. Entrega `TRAZABILIDAD-DECISIONES.md` con diagnóstico de las 3 entradas (con cita textual), lista 5+5 de qué se audita y qué no, formato canónico final (máx 8 líneas), ciclo de mantenimiento (dueño + trigger) y 3 antipatrones con contramedida. |

## Fixtures plantados en `tema-26/inicio`

- `docs/governance/POLITICA-CLAUDE-CODE.md` — política deliberadamente vaga (con contradicciones y huecos reales respecto a settings y `CLAUDE.md`).
- `docs/governance/MANAGED-SETTINGS-EJEMPLO.json` — referencia de cómo se vería el nivel managed para la organización.
- `docs/governance/RUBRICA-REVIEW.md` — rúbrica de review de PRs asistidos por IA.
- `docs/governance/PLANTILLA-DDR.md` — plantilla de Decisión Documentada Rápida.
- `CLAUDE.md` — convenciones de equipo (extiende el `CLAUDE.md` heredado de temas anteriores; añade sección "Equipo y gobierno").
- `.claude/settings.json` — settings versionados con mezcla deliberada de reglas técnicas y "convenciones" que deberían ir en `CLAUDE.md`.
- `.claude/auditoria/decisiones.md` — log de ejemplo con 3 entradas dimensionadas a propósito: una granular (ruido), una vaga (sin valor), una razonable (referencia).
- `test/governance-fixtures.test.ts` — smoke test que valida que los archivos plantados existen y mantienen la forma esperada.
