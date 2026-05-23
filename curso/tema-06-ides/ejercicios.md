# Tema 6 — Ejercicios: Integración con IDEs

> Cada ejercicio tiene su propia rama en el repo de código.
> **Antes de empezar:** `git checkout tema-06/ejercicio-0N`, `npm install`, la extensión de Claude Code activa en VS Code.

---

## Ejercicio 1 — Ciclo completo desde VS Code

**Rama:** `tema-06/ejercicio-01` · **Tiempo:** 30 min

Practica el bucle natural del IDE: seleccionar código → preguntar en el panel lateral → revisar diff bloque a bloque → aceptar → ejecutar tests. Compara el resultado con y sin selección activa.

---

## Ejercicio 2 — Revisión de cambios grandes desde el editor

**Rama:** `tema-06/ejercicio-02` · **Tiempo:** 35 min

Usa Claude como co-piloto de revisión sobre un conjunto de cambios documentados en `CAMBIOS_PENDIENTES.md`. Identifica los cambios arriesgados, profundiza en uno, y clasifica todos usando tu criterio contrastado con Claude.

---

## Ejercicio 3 — Navegación contextual y debug asistido

**Rama:** `tema-06/ejercicio-03` · **Tiempo:** 25 min

Navega el repo sin abrir archivos manualmente usando el panel lateral. Después simula un debugging real: crea un test que falla, copia los valores exactos del fallo, y usa ese estado como contexto para que Claude diagnostique la causa.
