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

| Parte                                 | Temas | Foco                                                                              |
| ------------------------------------- | ----- | --------------------------------------------------------------------------------- |
| **I. Fundamentos y entorno**          | 1–8   | Encuadre, interfaces, instalación, settings, permisos, IDE, CLAUDE.md, prompting  |
| **II. Aplicar Claude Code al código** | 9–15  | Skills, exploración, nuevas funcionalidades, refactor, testing, docs, code review |
| **III. Calidad, seguridad y Git**     | 16–18 | Hardening, migraciones de stack y resolución de conflictos                        |
| **IV. Extensibilidad avanzada**       | 19–22 | Subagentes, MCP, plugins/hooks, CLI avanzada                                      |
| **V. Plataforma y operaciones**       | 23–24 | Docker y CI/CD                                                                    |
| **VI. Arquitectura, equipo y cierre** | 25–27 | Patrones, gobierno corporativo y cierre del curso                                 |

Cada tema dura entre **45 y 90 minutos** según su peso conceptual y práctico, y combina:

* **Contenidos teóricos** alineados con los puntos del temario.
* **2–3 demos prácticas** intercaladas con los conceptos para asentar lo que vas viendo.

## Calendario y distribución por sesión

**Fechas:** 22, 25, 27 y 29 de mayo · 1, 3, 5 y 8 de junio (8 sesiones) **Horario:** 09:30 – 13:30 · Sesión final del 8 de junio: 09:30 – 11:30 **Duración total:** 30 horas

| # | Fecha   | Día | Horario       | Temas                 |
| - | ------- | --- | ------------- | --------------------- |
| 1 | 22 mayo | Vie | 09:30 – 13:30 | Temas 1, 2, 3 y 4     |
| 2 | 25 mayo | Lun | 09:30 – 13:30 | Temas 5, 6, 7 y 8     |
| 3 | 27 mayo | Mié | 09:30 – 13:30 | Temas 9, 10 y 11      |
| 4 | 29 mayo | Vie | 09:30 – 13:30 | Temas 12, 13 y 14     |
| 5 | 1 junio | Lun | 09:30 – 13:30 | Temas 15, 16, 17 y 18 |
| 6 | 3 junio | Mié | 09:30 – 13:30 | Temas 19, 20 y 21     |
| 7 | 5 junio | Vie | 09:30 – 13:30 | Temas 22, 23, 24 y 25 |
| 8 | 8 junio | Lun | 09:30 – 11:30 | Temas 26 y 27         |

## Detalle por sesión

### Sesión 1 — Vie 22 mayo · Fundamentos y entorno

**Temas:** 1 (Fundamentos agentic) · 2 (Interfaces oficiales) · 3 (Entorno técnico) · 4 (Configuración: settings, scopes y políticas)

_Objetivos:_

* Distinguir autocompletado clásico de un sistema agentic.
* Elegir la interfaz oficial (CLI, IDE, web, Slack, CI/CD) según la tarea.
* Dejar el entorno técnico listo: instalación, permisos, validaciones.
* Dominar la jerarquía de settings y la precedencia entre scopes.

_Takeaways:_

* Claude Code es un agente: trabajamos por tareas, no por líneas.
* **El commit lo firmas tú.** Siempre.
* No hay "una interfaz correcta"; hay una correcta para cada momento.
* Precedencia: **managed > local > project > user**.

### Sesión 2 — Lun 25 mayo · Permisos, IDE, memoria y prompting

**Temas:** 5 (Modos y permisos) · 6 (Integración IDE) · 7 (CLAUDE.md y memoria) · 8 (Prompting profesional)

_Objetivos:_

* Diseñar una política de permisos razonable y usar sandboxing.
* Trabajar fluido desde VS Code o JetBrains.
* Convertir el contexto en un activo del repo con `CLAUDE.md`.
* Construir prompts profesionales para tareas técnicas reales.

_Takeaways:_

* Plan mode por defecto en repos sensibles; aceleras solo cuando el riesgo es bajo.
* El IDE es para revisión visual; la CLI para sesiones largas.
* Si lo dices más de dos veces, **escríbelo** en `CLAUDE.md`.
* Buen prompt = **intención + contexto + restricción**.

### Sesión 3 — Mié 27 mayo · Skills, exploración y nuevas funcionalidades

**Temas:** 9 (Skills reutilizables) · 10 (Exploración de repos) · 11 (Generación de nuevas funcionalidades)

_Objetivos:_

* Crear y reutilizar skills para tareas que el equipo repite.
* Onboarding acelerado a repositorios desconocidos.
* Generar funcionalidades nuevas alineadas con la arquitectura existente.

_Takeaways:_

* Skill = automatizar lo **repetitivo bien delimitado**, no script genérico.
* Patrón base de exploración: **preguntar → leer → responder citando**.
* Cambios mínimos y acotados; alinear con los patrones del repo.

### Sesión 4 — Vie 29 mayo · Refactor, testing y documentación

**Temas:** 12 (Refactor profundo) · 13 (Testing asistido) · 14 (Documentación técnica)

_Objetivos:_

* Refactorizar código heredado sin romper el producto.
* Generar tests con cobertura **útil**, no solo coverage.
* Producir documentación viva (README, ADRs, guías de onboarding).

_Takeaways:_

* Tests cubren **lógica crítica**, no caminos felices.
* Docs como **activo vivo**, no decoración.
* Refactor en lotes pequeños con tests como red de seguridad.

### Sesión 5 — Lun 1 junio · Code review, seguridad, dependencias y Git

**Temas:** 15 (Code review y PRs) · 16 (Seguridad y hardening) · 17 (Dependencias y plan de transición) · 18 (Git, branching, hotfixes)

_Objetivos:_

* Revisar pull requests con criterio asistido por IA.
* Hardening del código generado: OWASP, secretos, validación, autenticación.
* Planificar migraciones de librerías o frameworks en fases con tests de regresión.
* Resolver conflictos, hotfixes y branching con asistencia.

_Takeaways:_

* Revisar diffs con foco en **riesgo real**, no en estética.
* OWASP siempre en mente cuando la IA genera código sensible.
* Migraciones en **fases pequeñas y reversibles** con tests.
* Commits útiles, sin auto-firmar a ciegas.

### Sesión 6 — Mié 3 junio · Subagentes, MCP y plugins

**Temas:** 19 (Subagentes) · 20 (MCP) · 21 (Plugins, marketplaces y hooks)

_Objetivos:_

* Especializar agentes con subagentes y roles acotados.
* Conectar Claude Code a sistemas internos vía MCP.
* Distribuir capacidades con plugins gobernados.

_Takeaways:_

* Subagente = **rol acotado** con herramientas y memoria propias.
* MCP = **contrato claro** con tu infra; gobernarlo con allowlists.
* Plugin = distribución gobernada de skills, agentes, hooks y MCPs.

### Sesión 7 — Vie 5 junio · CLI, Docker, CI/CD y arquitectura

**Temas:** 22 (CLI avanzada) · 23 (Docker) · 24 (DevOps y CI/CD) · 25 (Arquitectura y diseño)

_Objetivos:_

* Dominar la CLI avanzada: sesiones, slash commands, multiplexores.
* Crear entornos reproducibles con Docker.
* Integrar Claude Code en pipelines de CI/CD corporativos.
* Tomar decisiones arquitectónicas con IA sin perder criterio.

_Takeaways:_

* CLI = **centro operativo** del desarrollador profesional.
* Dockerfiles mínimos, seguros y eficientes.
* CI/CD asiste; **nunca decide release**.
* La IA propone alternativas; **el humano decide arquitectura**.

### Sesión 8 — Lun 8 junio · Equipo, gobierno y cierre

**Temas:** 26 (Trabajo en equipo y gobierno corporativo) · 27 (Cierre del curso)

_Objetivos:_

* Diseñar una política interna de uso aceptable y gobierno corporativo.
* Cerrar el curso con un repaso ejecutivo de adopción y siguientes pasos.

_Takeaways:_

* Gobierno = **política + auditoría + formación cruzada**.
* La adopción depende del **equipo**, no de la herramienta.

## Antes de empezar

1. Lee la sección [**Requisitos previos**](requisitos.md) y completa la checklist.
2. Asegúrate de tener acceso a un repositorio donde puedas practicar (el material del curso usa una pequeña API en Node + TypeScript como hilo conductor).
3. Si trabajas en una organización con políticas estrictas, valida con tu IT los permisos sobre `~/.claude/` y la red corporativa **antes** de la primera sesión.
4. Accede al código que trabajaremos durante el curso en: [https://github.com/gorkavillara/curso-claude-code-codigo](https://github.com/gorkavillara/curso-claude-code-codigo)

## A quién va dirigido

Desarrolladores con experiencia profesional. **No es un curso de introducción a la programación.** Se asume que ya manejas Git, terminal, testing básico y arquitectura de aplicaciones.

***

> _"El autocompletado te ayuda a escribir más rápido el código que ya tenías en la cabeza. Claude Code te ayuda a no tener que tenerlo todo en la cabeza."_
