# Introducción

> **Ingeniería de software asistida por IA, sobre repositorios reales.** 27 temas · \~30 h totales

## De qué va este curso

Claude Code no es un autocompletado más rápido. Es un **sistema agentic** que lee el repositorio, edita varios archivos a la vez, ejecuta comandos, valida y itera. Cambia la unidad de trabajo: pasamos de "sugerencia por línea" a "tarea por sesión".

Este curso te prepara para usar Claude Code como una herramienta profesional dentro de un equipo de desarrollo: con configuración correcta, permisos razonables, contexto persistente, skills, subagentes, MCP, plugins y flujos de CI/CD reales.

> **El asistente nunca firma el commit. Lo firmas tú.** Si algo rompe producción, no puedes decir "me lo dijo Claude". El criterio técnico sigue siendo del desarrollador.

## Qué vas a aprender

* Distinguir cuándo Claude Code aporta valor real y cuándo estorba.
* Configurar tu entorno (settings, permisos, sandboxing) para trabajar con seguridad.
* Diseñar prompts profesionales y mantener contexto persistente con `CLAUDE.md`.
* Aplicar Claude Code a tareas reales: exploración de repos, nuevas funcionalidades, refactor, testing, documentación, revisión de código y seguridad.
* Extender Claude Code con **skills**, **subagentes**, **MCP** y **plugins** corporativos.
* Integrarlo en flujos de Git, Docker y CI/CD sin perder gobernanza.
* Diseñar una adopción de equipo sostenible y auditable.

## Cómo está organizado el curso

| Parte | Temas | Foco |
|---|---|---|
| **I. Fundamentos y entorno** | 1–8 | Encuadre, interfaces, instalación, settings, permisos, IDE, CLAUDE.md, prompting |
| **II. Aplicar Claude Code al código** | 9–15 | Skills, exploración, nuevas funcionalidades, refactor, testing, docs, code review |
| **III. Calidad, seguridad y Git** | 16–18 | Hardening, migraciones de stack y resolución de conflictos |
| **IV. Extensibilidad avanzada** | 19–22 | Subagentes, MCP, plugins/hooks, CLI avanzada |
| **V. Plataforma y operaciones** | 23–24 | Docker y CI/CD |
| **VI. Arquitectura, equipo y cierre** | 25–27 | Patrones, gobierno corporativo y proyecto final |

Cada tema dura entre **45 y 90 minutos** según su peso conceptual y práctico, y combina:

* **Contenidos teóricos** alineados con los puntos del temario.
* **2–3 demos prácticas** intercaladas con los conceptos para asentar lo que vas viendo.

## Calendario y distribución por sesión

**Fechas:** 22, 25, 27 y 29 de mayo · 1, 3, 5 y 8 de junio (8 sesiones) **Horario:** 09:30 – 13:30 · Sesión final del 8 de junio: 09:30 – 11:30 **Duración total:** 30 horas

| # | Fecha | Día | Horario | Temas | Proyecto final |
|---|---|---|---|---|---|
| 1 | 22 mayo | Vie | 09:30 – 13:30 | Temas 1, 2, 3 y 4 | — |
| 2 | 25 mayo | Lun | 09:30 – 13:30 | Temas 5, 6, 7 y 8 | — |
| 3 | 27 mayo | Mié | 09:30 – 13:30 | Temas 9, 10 y 11 | — |
| 4 | 29 mayo | Vie | 09:30 – 13:30 | Temas 12, 13 y 14 | Arranque |
| 5 | 1 junio | Lun | 09:30 – 13:30 | Temas 15, 16 y 17 | Iteración 1 |
| 6 | 3 junio | Mié | 09:30 – 13:30 | Temas 18, 19, 20 y 21 | Iteración 2 |
| 7 | 5 junio | Vie | 09:30 – 13:30 | Temas 22, 23, 24 y 25 | Iteración 3 |
| 8 | 8 junio | Lun | 09:30 – 11:30 | Tema 26 | Cierre y presentación |

> El **proyecto final (Tema 27)** no se imparte en un único día: se construye sesión a sesión a partir de la **Sesión 4**. Cada sesión añade una iteración aplicando los temas vistos hasta ese momento.

## Detalle por sesión

### Sesión 1 — Vie 22 mayo · Fundamentos y entorno

**Temas:** 1 (Fundamentos agentic) · 2 (Interfaces oficiales) · 3 (Entorno técnico) · 4 (Configuración: settings, scopes y políticas)

*Objetivos:*

* Distinguir autocompletado clásico de un sistema agentic.
* Elegir la interfaz oficial (CLI, IDE, web, Slack, CI/CD) según la tarea.
* Dejar el entorno técnico listo: instalación, permisos, validaciones.
* Dominar la jerarquía de settings y la precedencia entre scopes.

*Takeaways:*

* Claude Code es un agente: trabajamos por tareas, no por líneas.
* **El commit lo firmas tú.** Siempre.
* No hay "una interfaz correcta"; hay una correcta para cada momento.
* Precedencia: **managed > local > project > user**.

### Sesión 2 — Lun 25 mayo · Permisos, IDE, memoria y prompting

**Temas:** 5 (Modos y permisos) · 6 (Integración IDE) · 7 (CLAUDE.md y memoria) · 8 (Prompting profesional)

*Objetivos:*

* Diseñar una política de permisos razonable y usar sandboxing.
* Trabajar fluido desde VS Code o JetBrains.
* Convertir el contexto en un activo del repo con `CLAUDE.md`.
* Construir prompts profesionales para tareas técnicas reales.

*Takeaways:*

* Plan mode por defecto en repos sensibles; aceleras solo cuando el riesgo es bajo.
* El IDE es para revisión visual; la CLI para sesiones largas.
* Si lo dices más de dos veces, **escríbelo** en `CLAUDE.md`.
* Buen prompt = **intención + contexto + restricción**.

### Sesión 3 — Mié 27 mayo · Skills, exploración y nuevas funcionalidades

**Temas:** 9 (Skills reutilizables) · 10 (Exploración de repos) · 11 (Generación de nuevas funcionalidades)

*Objetivos:*

* Crear y reutilizar skills para tareas que el equipo repite.
* Onboarding acelerado a repositorios desconocidos.
* Generar funcionalidades nuevas alineadas con la arquitectura existente.

*Takeaways:*

* Skill = automatizar lo **repetitivo bien delimitado**, no script genérico.
* Patrón base de exploración: **preguntar → leer → responder citando**.
* Cambios mínimos y acotados; alinear con los patrones del repo.

### Sesión 4 — Vie 29 mayo · Refactor, testing, docs + arranque del proyecto final

**Temas:** 12 (Refactor profundo) · 13 (Testing asistido) · 14 (Documentación técnica)

**Proyecto final — Arranque:** diagnóstico del repo, definición de `CLAUDE.md`, skills y subagentes mínimos.

*Objetivos:*

* Refactorizar código heredado sin romper el producto.
* Generar tests con cobertura **útil**, no solo coverage.
* Producir documentación viva (README, ADRs, guías de onboarding).
* **Arrancar el proyecto final**: dejar el repo del proyecto preparado.

*Takeaways:*

* Tests cubren **lógica crítica**, no caminos felices.
* Docs como **activo vivo**, no decoración.
* Refactor en lotes pequeños con tests como red de seguridad.
* El proyecto final se construye sesión a sesión.

### Sesión 5 — Lun 1 junio · Code review, seguridad y migración de stack

**Temas:** 15 (Code review y PRs) · 16 (Seguridad y hardening) · 17 (Dependencias y plan de transición)

**Proyecto final — Iteración 1:** aplicar revisión, hardening de seguridad y plan de migración al proyecto.

*Objetivos:*

* Revisar pull requests con criterio asistido por IA.
* Hardening del código generado: OWASP, secretos, validación, autenticación.
* Diseñar la migración de stack con plan en fases y tests de regresión.

*Takeaways:*

* Revisar diffs con foco en **riesgo real**, no en estética.
* OWASP siempre en mente cuando la IA genera código sensible.
* Migración de stack en **fases pequeñas y reversibles** con tests.

### Sesión 6 — Mié 3 junio · Git, subagentes, MCP y plugins

**Temas:** 18 (Git, branching, hotfixes) · 19 (Subagentes) · 20 (MCP) · 21 (Plugins, marketplaces y hooks)

**Proyecto final — Iteración 2:** integrar subagentes, conectar MCP a una herramienta interna y empaquetar un plugin del equipo.

*Objetivos:*

* Resolver conflictos, hotfixes y branching con asistencia.
* Especializar agentes con subagentes y roles acotados.
* Conectar Claude Code a sistemas internos vía MCP.
* Distribuir capacidades con plugins gobernados.

*Takeaways:*

* Commits útiles, sin auto-firmar a ciegas.
* Subagente = **rol acotado** con herramientas y memoria propias.
* MCP = **contrato claro** con tu infra; gobernarlo con allowlists.
* Plugin = distribución gobernada de skills, agentes, hooks y MCPs.

### Sesión 7 — Vie 5 junio · CLI, Docker, CI/CD y arquitectura

**Temas:** 22 (CLI avanzada) · 23 (Docker) · 24 (DevOps y CI/CD) · 25 (Arquitectura y diseño)

**Proyecto final — Iteración 3:** dockerizar el proyecto, montar pipeline de CI/CD y revisar la arquitectura final.

*Objetivos:*

* Dominar la CLI avanzada: sesiones, slash commands, multiplexores.
* Crear entornos reproducibles con Docker.
* Integrar Claude Code en pipelines de CI/CD corporativos.
* Tomar decisiones arquitectónicas con IA sin perder criterio.

*Takeaways:*

* CLI = **centro operativo** del desarrollador profesional.
* Dockerfiles mínimos, seguros y eficientes.
* CI/CD asiste; **nunca decide release**.
* La IA propone alternativas; **el humano decide arquitectura**.

### Sesión 8 — Lun 8 junio · Gobierno y cierre del proyecto final

**Temas:** 26 (Trabajo en equipo y gobierno corporativo)

**Proyecto final — Cierre:** presentación final, decisiones tomadas, roadmap de adopción en equipo.

*Objetivos:*

* Diseñar una política interna de uso aceptable y gobierno corporativo.
* Presentar el proyecto final con criterios de calidad y adopción.

*Takeaways:*

* Gobierno = **política + auditoría + formación cruzada**.
* La adopción depende del **equipo**, no de la herramienta.
* El proyecto final es la síntesis ejecutable de todo lo aprendido.

## Antes de empezar

1. Lee la sección [**Requisitos previos**](requisitos.md) y completa la checklist.
2. Asegúrate de tener acceso a un repositorio donde puedas practicar (el material del curso usa una pequeña API en Node + TypeScript como hilo conductor).
3. Si trabajas en una organización con políticas estrictas, valida con tu IT los permisos sobre `~/.claude/` y la red corporativa **antes** de la primera sesión.

## A quién va dirigido

Desarrolladores con experiencia profesional. **No es un curso de introducción a la programación.** Se asume que ya manejas Git, terminal, testing básico y arquitectura de aplicaciones.

---

> _"El autocompletado te ayuda a escribir más rápido el código que ya tenías en la cabeza. Claude Code te ayuda a no tener que tenerlo todo en la cabeza."_
