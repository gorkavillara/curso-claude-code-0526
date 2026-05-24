# Tema 7 — Contexto persistente: CLAUDE.md y memoria

> Duración estimada: 80 min · Tipo: práctico (alumnos delante del teclado).
> Repositorio de prácticas: rama `tema-07/inicio` (notebox, Node 24 + Express + TypeScript).

## 0. Objetivo del tema

Que el alumno deje de repetir instrucciones sesión a sesión y empiece a **escribir el contexto una vez**: en `CLAUDE.md`, en `.claude/rules/`, en la memoria global. Si es una regla del proyecto, vive en el repo. Si es una preferencia personal, vive en el home.

---

## 1. Flujo de sesión

Estructura **intercalada**: cada demo va seguida del ejercicio correspondiente. Así el alumno escribe el `CLAUDE.md` inmediatamente después de ver cómo funciona.

```
00:00 — Encuadre                              (5 min)
00:05 — Demo 1: CLAUDE.md desde cero         (10 min)
00:15 — Ejercicio 1: crear CLAUDE.md         (15 min, en clase)
00:30 — Demo 2: segmentar con rules/         (10 min)
00:40 — Ejercicio 2: segmentar y depurar     (15 min, en clase)
00:55 — Demo 3: corregir y persistir         (5 min)
60:00 — Ejercicio 3: auto memory y personal  (15 min, en clase)
75:00 — Cierre y puente                      (5 min)
```

> **Si vas justo de tiempo:** comprime la demo 3 a 2-3 minutos (solo mostrar el concepto) y reduce el ejercicio 3 a 10 minutos (solo la parte de `~/.claude/CLAUDE.md`, omite la reflexión escrita).

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "¿Cuántas veces habéis escrito 'en este proyecto, los errores van con clases semánticas, no con Error genérico'? Si la respuesta es 'más de dos', eso es ruido que estáis pagando con tiempo. `CLAUDE.md` existe para que lo digáis una vez y valga para siempre."

Dos ideas rápidas:

1. **Si lo dices más de dos veces, escríbelo.** Cualquier instrucción que repites en sesiones distintas es candidata a `CLAUDE.md`.
2. **El `CLAUDE.md` versionado es más fiable que la memoria automática.** Auto memory es una capa adicional; el archivo en el repo lo revisa cualquier ingeniero del equipo.

---

## 3. Demo 1 + Ejercicio 1 — CLAUDE.md desde cero (≈ 25 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-07/inicio`, `npm install`, VS Code abierto sin ningún `CLAUDE.md`.

**Sin `CLAUDE.md`**, lanza este prompt:

```
Añade validación: el title no puede ser vacío. Lanza el error correspondiente.
```

Observa: probablemente lanza un `Error` genérico o un `400` directo en la ruta. No hay patrón de error semántico.

Ahora **crea `CLAUDE.md`** en la raíz del repo:

```markdown
# Notebox

API mínima de notas en Node 24 + Express + TypeScript.

## Arquitectura
- `src/routes/` → endpoints HTTP (Express).
- `src/services/` → lógica de negocio.
- `src/storage/` → persistencia (in-memory).
- `src/models/` → tipos y factories.

## Convenciones
- Nunca lanzar `Error` directo: usar errores semánticos del dominio.
- Validar inputs en el service, no en la ruta.
- Tests con `node --test`. No mockear el storage en unit tests del service.

## Comandos
- `npm test`, `npm run typecheck`, `npm run dev`.

## Reglas
- No tocar `node_modules/` ni `dist/`.
- Cambios al modelo `Note` requieren actualizar tests existentes.
```

**Reinicia la sesión** (nueva conversación). Repite el mismo prompt.

Lo que el alumno ve:
- Ahora Claude introduce un error semántico (`InvalidNoteError` o similar) y lo propaga a la ruta.
- El cambio no viene de un prompt diferente — viene del archivo que cargó al arrancar.

> "`CLAUDE.md` no es decorativo. Cambia decisiones reales. Cuanto más concretas las reglas, más predecible la salida."

### Ejercicio 1 (15 min)

> **Rama:** `git checkout tema-07/ejercicio-01`

Los alumnos crean su propio `CLAUDE.md` para el repo notebox: lanzan un prompt sin él, observan el resultado, crean el archivo, y repiten el mismo prompt en sesión nueva. Documentan los cambios observados en la tabla del EJERCICIO.md.

**Lo que el formador observa:**
- ¿Las reglas son concretas y verificables, o vagas ("escribe código limpio")?
- ¿Notaron diferencia de comportamiento antes/después?

---

## 4. Demo 2 + Ejercicio 2 — Segmentar con `.claude/rules/` (≈ 25 min)

### Demo 2 (10 min)

> Setup: mismo repo, con el `CLAUDE.md` de la Demo 1.

Crea `.claude/rules/testing.md`:

```markdown
# Reglas de testing — Notebox

- Tests con `node --test`.
- Cada test cubre **un** comportamiento, no varios.
- Nombrar tests con el patrón: `<función>: <comportamiento esperado>`.
- No mockear el storage en tests unitarios del service.
- Tests de integración solo en `test/*.integration.test.ts`.
```

Quita esas líneas del `CLAUDE.md`. Lanza:

```
Añade un test que cubra que createNote rechaza notas con title vacío.
```

Lo que el alumno ve:
- El agente carga ambos archivos automáticamente.
- El test sigue el patrón de naming y no mockea storage.
- `CLAUDE.md` más corto → más legible → más fácil de mantener.

> "Si tu `CLAUDE.md` tiene más de 50 líneas, tienes candidatos para `.claude/rules/`."

### Ejercicio 2 (15 min)

> **Rama:** `git checkout tema-07/ejercicio-02`

Los alumnos reciben un `CLAUDE.md` con 8 reglas mezcladas (testing, errores, arquitectura) y deben: identificar las reglas vagas (hay 3), moverlas al archivo correcto en `.claude/rules/`, y verificar que el comportamiento se mantiene lanzando el prompt de verificación del EJERCICIO.md.

**Lo que el formador observa:**
- ¿Identificaron las 3 reglas vagas ("código limpio", "sé profesional", "optimiza para mantenibilidad")?
- ¿El archivo `rules/` tiene una idea por bullet?

---

## 5. Demo 3 + Ejercicio 3 — Corregir y persistir (≈ 20 min)

### Demo 3 (5 min)

**Concepto**: una corrección en sesión solo vale para esa sesión. Para que valga mañana, escríbela.

Muestra el flujo:

1. Claude mete lógica en `routes/` (debería ir en `services/`).
2. Corrección en sesión: *"En este repo, la lógica vive en `services/`, nunca en `routes/`."*
3. Claude lo hace bien en esa sesión.
4. Sesión nueva → vuelve al error. No hay memoria entre sesiones sin `CLAUDE.md`.
5. Añadir la regla a `CLAUDE.md`:

```markdown
## Convenciones
- La lógica vive en `services/`, nunca en `routes/`.
- `routes/` solo parsea input, llama al service y traduce errores.
```

6. Sesión nueva → separa correctamente sin recordatorio.

> "La corrección en sesión es temporal. `CLAUDE.md` es permanente."

### Ejercicio 3 — Auto memory y contexto personal (15 min)

> **Rama:** `git checkout tema-07/ejercicio-03`

Los alumnos exploran `~/.claude/CLAUDE.md` para añadir preferencias personales que apliquen en todos sus repos (idioma de respuesta, estilo de código, formato preferido). Reflexionan sobre la diferencia entre contexto personal y contexto de proyecto y lo documentan en el EJERCICIO.md.

**Lo que el formador observa:**
- ¿Entienden la diferencia entre `~/.claude/CLAUDE.md` (personal, global) y `<repo>/CLAUDE.md` (equipo, versionado)?
- Si alguien detecta que auto memory contradice una regla del repo, usarlo para hablar de precedencia.

---

## 6. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Si lo dices más de dos veces, escríbelo en `CLAUDE.md`.**
2. **Reglas concretas y verificables. "Código limpio" no es una regla.**
3. **`.claude/rules/` para segmentar por tema cuando el archivo crece.**
4. **La corrección en sesión es temporal. Persiste lo que importa.**

**Puente al Tema 8:**

> "Sabéis cómo dar contexto permanente al agente. Ahora vemos cómo dar contexto preciso en el momento: cómo estructurar el prompt para que el resultado sea el que queréis, no el que el agente decide."

---

## 7. Notas para el formador

- **Diferencia clave para remarcar**: `CLAUDE.md` en el repo (versionado, para el equipo) vs `~/.claude/CLAUDE.md` (personal, para todos tus repos). Los alumnos los confunden.
- Si alguien pregunta *"¿y si `CLAUDE.md` tiene instrucciones contradictorias?"*: más específico gana. Subpath > repo > home.
- El error más común en el ejercicio 2: mover líneas pero no verificar que el agente aún las carga. Pedir que lancen el prompt de verificación siempre.
- Pregunta típica: *"¿Cuánto debe medir el `CLAUDE.md`?"* → Regla práctica: si tardan más de 2 minutos en leerlo, está demasiado largo.
- Si hay tiempo extra al final del ejercicio 2, mostrar la precedencia subpath: crear `src/payments/CLAUDE.md` con una regla más restrictiva y ver cómo gana a la general.
