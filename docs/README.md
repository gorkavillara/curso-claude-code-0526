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

| Parte                                         | Temas | Foco                                                                                  |
| --------------------------------------------- | ----- | ------------------------------------------------------------------------------------- |
| **I. Fundamentos y entorno**                  | 1–7   | Encuadre, interfaces, instalación, configuración, permisos, IDE, contexto persistente |
| **II. Flujos de desarrollo asistido**         | 8–14  | Prompting, exploración, nuevas funcionalidades, refactor, testing, docs, code review  |
| **III. Seguridad, dependencias y Git**        | 15–17 | Hardening, migraciones de librerías, branching y commits                              |
| **IV. Extensibilidad**                        | 18–22 | Skills, subagentes, MCP, plugins/hooks, CLI avanzada                                  |
| **V. Plataforma y operaciones**               | 23–24 | Docker, CI/CD                                                                         |
| **VI. Arquitectura, equipo y proyecto final** | 25–27 | Patrones, gobierno corporativo y proyecto final                                       |

Cada tema dura **aproximadamente una hora** y combina:

* **Contenidos teóricos** alineados con los puntos del temario.
* **2–3 demos prácticas** intercaladas con los conceptos para asentar lo que vas viendo.

## Antes de empezar

1. Lee la sección [**Requisitos previos**](requisitos.md) y completa la checklist.
2. Asegúrate de tener acceso a un repositorio donde puedas practicar (el material del curso usa una pequeña API en Node + TypeScript como hilo conductor).
3. Si trabajas en una organización con políticas estrictas, valida con tu IT los permisos sobre `~/.claude/` y la red corporativa **antes** de la primera sesión.

## A quién va dirigido

Desarrolladores con experiencia profesional. **No es un curso de introducción a la programación.** Se asume que ya manejas Git, terminal, testing básico y arquitectura de aplicaciones.

***

> _"El autocompletado te ayuda a escribir más rápido el código que ya tenías en la cabeza. Claude Code te ayuda a no tener que tenerlo todo en la cabeza."_
