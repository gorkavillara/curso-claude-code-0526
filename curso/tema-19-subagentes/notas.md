[Documentar en faq-alumnos -> Dudas surgidas en las sesiones]

- Diferencia conceptual exacta entre skill y subagente — pregunta recurrente. Reforzar que la skill se ejecuta dentro del agente principal y el subagente es un proceso conceptualmente separado con su propia auto memory.

- Si dos miembros del equipo cargan subagentes distintos a nivel usuario (`~/.claude/agents/`), ¿qué pasa? — La respuesta es que cada uno trabaja con su set, y por eso lo razonable es subir al repo cualquier subagente "compartible".

- Qué ocurre exactamente cuando un subagente intenta usar una tool que no tiene permitida — verificarlo en clase y dejar capturado el comportamiento concreto.

[Modificación de la documentación de temas generados en la carpeta docs]

- Verificar si `--agents` admite múltiples archivos (`--agents a.md --agents b.md`) o si hay que hacerlo de otra forma.

- Confirmar nomenclatura exacta del frontmatter (`tools:` vs `allowed_tools:`).

- Si añadimos un ejercicio extra para alumnos avanzados: "diseña un subagente `pr-describer` con solo Read/Bash(git diff:*)/Bash(git log:*) que produzca el body de un PR a partir del historial reciente".

- Tema 19 punto 5 — comprobar en vivo que `claude --agents path/agent.md` funciona como inyección ad-hoc.

- Si algún alumno pregunta por subagentes en el cloud / Managed Agents → eso es Tema futuro (proyecto final o avanzado). Aquí solo subagentes locales.
