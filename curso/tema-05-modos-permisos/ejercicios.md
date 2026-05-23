# Tema 5 — Ejercicios: Modos, permisos y control de riesgo

> Material de partida: repo `04 - Claude-codigo`.
> Cada ejercicio tiene su propia rama: `tema-05/ejercicio-01`, `tema-05/ejercicio-02`, `tema-05/ejercicio-03`.
> Cada rama contiene un `EJERCICIO.md` con los pasos concretos.
>
> **Antes de empezar:** `git checkout tema-05/ejercicio-0X`, `npm install`, `npm test` (verde).

---

## Ejercicio 1 — Clasificar tareas por modo de ejecución

**Rama:** `tema-05/ejercicio-01` · **Tiempo:** 30 min

Tienes 12 tareas reales sobre el repo notebox. Para cada una debes decidir qué modo de Claude Code usar (`plan` / `default` / `auto`) y justificarlo en una frase.

Después ejecutas 3 de ellas en el modo elegido y anotas si el resultado fue el esperado.

Lee el `EJERCICIO.md` de la rama para los detalles completos.

**Lo que trabaja:**
- Criterio para elegir modo antes de lanzar un prompt
- Consecuencias prácticas de usar `auto` en tareas con efectos irreversibles

---

## Ejercicio 2 — Política de permisos para el equipo

**Rama:** `tema-05/ejercicio-02` · **Tiempo:** 40 min

Escenario de una fintech. El repo tiene `.env` con claves reales, un script de deploy a producción y migraciones de BD. El `.claude/settings.ejercicio.json` actual (del becario) está mal: permite todo.

Debes diagnosticar el problema, diseñar la política correcta y testearla con 5 prompts concretos.

Lee el `EJERCICIO.md` de la rama para los detalles completos.

**Lo que trabaja:**
- Escritura de reglas `deny` en `.claude/settings.json`
- Balance entre bloquear lo peligroso y no obstaculizar el trabajo cotidiano

---

## Ejercicio 3 — Autopsia de un incidente

**Rama:** `tema-05/ejercicio-03` · **Tiempo:** 35 min

Tienes el transcript de una sesión real donde Claude se salió del scope por un prompt vago en modo `auto`. Causó 4 daños: borró logs de producción, desincronizó dependencias, leyó `.env` y cambió comportamiento de tokens.

Analizas el incidente, reescribes el prompt, usas el modo plan como red de seguridad y escribes la regla preventiva.

Lee `INCIDENTE.md` y `EJERCICIO.md` de la rama para los detalles completos.

**Lo que trabaja:**
- Reconocer los síntomas de un prompt demasiado abierto
- Modo plan como herramienta de revisión antes de ejecutar
- Permisos como última línea de defensa
