# Tema 9 — Skills reutilizables para estandarizar tareas técnicas del equipo

> Duración estimada: 80 min · Tipo: práctico (alumnos delante del teclado).
> Repositorio de prácticas: rama `tema-09/inicio` (notebox, Node 24 + Express + TypeScript).

## 0. Objetivo del tema

Que el alumno deje de escribir el mismo prompt largo diez veces y lo encapsule en una skill que el equipo reutiliza. Si sales de esta sesión con una skill funcionando en el repo, el tema ha cumplido.

---

## 1. Flujo de sesión

Estructura **intercalada**: cada demo va seguida del ejercicio correspondiente. Las skills se aprenden haciéndolas, no leyéndolas.

```
00:00 — Encuadre                               (5 min)
00:05 — Demo 1: crear /add-tests desde cero    (10 min)
00:15 — Ejercicio 1: crear /doc-function       (15 min, en clase)
00:30 — Demo 2: auto-trigger vs explícito      (8 min)
00:38 — Ejercicio 2: trigger y naming          (12 min, en clase)
00:50 — Demo 3: skill de code review           (5 min)
00:55 — Ejercicio 3: skill de equipo completa  (20 min, en clase)
75:00 — Cierre y puente                        (5 min)
```

> **Si vas justo de tiempo:** recorta la Demo 3 a 3 minutos (solo mostrar el SKILL.md sin ejecutarlo) y reduce el ejercicio 3 a 15 minutos (solo el diseño, sin verificar invocación).

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "Pensad en cuántas veces habéis escrito el mismo prompt esta semana. 'Añade tests con node --test, sin mockear el storage, cada test cubre un comportamiento...' Si la respuesta es 'más de dos veces', eso no es un prompt — es una skill que no habéis escrito todavía."

Dos ideas rápidas:

1. **Una skill es un contrato de comportamiento, no un atajo de teclado.** Lo que varía cada vez (la función a testear) lo das en el prompt. Lo que no varía (el framework, las convenciones del repo) vive en la skill.
2. **El equipo que escribe skills no se rompe cuando alguien se va.** El contexto está en el archivo, no en la cabeza de nadie.

En pizarra, la estructura de una skill:

```
.claude/skills/<nombre>/SKILL.md
  → name:         slug para /nombre
  → description:  cuándo se activa automáticamente (opcional)
  → cuerpo:       contexto + objetivo + restricciones + formato
```

---

## 3. Demo 1 + Ejercicio 1 — Crear `/add-tests` desde cero (≈ 25 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-09/inicio`, `npm install`. Sin ningún directorio `.claude/skills/`.

Crea `.claude/skills/add-tests/SKILL.md` en directo:

```markdown
---
name: add-tests
description: Añade tests cuando el usuario menciona "tests para" o "cubre con tests"
---

# Skill: add-tests

Añade tests de unidad para la función indicada en el repositorio Notebox.

## Contexto

- Framework: node --test (nativo, sin jest/vitest).
- Tests en test/. Nombre: <módulo>.test.ts.
- No mockear el storage en unit tests del service.
- Cada test cubre un comportamiento.

## Objetivo

Generar los tests mínimos para camino feliz, casos borde y error.

## Formato de salida

1. Lista de comportamientos a testear (antes del código).
2. Código de los tests.
3. Resultado de npm test.
```

Abre una **nueva sesión** y lanza:

```
add-tests para la función createNote de src/services/notes.ts
```

Lo que el alumno ve:
- Claude carga el `SKILL.md` antes de responder.
- Lista comportamientos antes de escribir código.
- Sigue las convenciones del repo sin que las repitas en el prompt.
- El formato es exactamente el definido en la skill.

> "Esto no es magia. Es que el contexto que antes escribíais en el prompt ahora vive en un archivo."

### Ejercicio 1 (15 min)

> **Rama:** `git checkout tema-09/ejercicio-01`

Los alumnos crean una skill `/doc-function` que documenta cualquier función de `src/services/notes.ts` con JSDoc en español. La skill define las convenciones del equipo: `@param`, `@returns`, `@throws` cuando aplica, sin comentarios vacíos de relleno.

Verifican que `/doc-function archiveNote` produce una JSDoc completa y coherente con las convenciones definidas en la skill.

**Lo que el formador observa:**
- ¿La skill define convenciones concretas o instrucciones vagas ("documenta bien")?
- ¿El formato de salida especifica qué etiquetas JSDoc usar?
- ¿Invocaron la skill después de crearla para verificar que funciona?

---

## 4. Demo 2 + Ejercicio 2 — Auto-trigger vs invocación explícita (≈ 20 min)

### Demo 2 (8 min)

> Setup: misma skill `add-tests` de la Demo 1.

Muestra los dos modos con la misma skill:

**Con `description:`** — escribe en el chat sin usar `/add-tests`:

```
quiero cubrir createNote con tests
```

Claude activa la skill automáticamente.

**Sin `description:`** — borra la línea del frontmatter, reinicia la sesión:

```
quiero cubrir createNote con tests
```

Claude responde sin usar la skill (respuesta genérica).

```
/add-tests
```

La skill se activa con invocación explícita.

Lo que el alumno ve:
- El auto-trigger convierte la skill en invisible — el equipo no necesita conocer su nombre.
- Sin `description:`, la skill es un comando consciente.
- La elección depende de si quieres que el agente decida cuándo aplicarla.

> "El auto-trigger es potente y peligroso a la vez. Si la description es demasiado general, se activa cuando no debería. Hacedla específica."

### Ejercicio 2 (12 min)

> **Rama:** `git checkout tema-09/ejercicio-02`

Los alumnos reciben una skill `/add-tests` sin `description:`. Tienen que:
1. Probar la invocación explícita (`/add-tests` para `archiveNote`).
2. Añadir una `description:` bien calibrada — específica, no genérica.
3. Probar el auto-trigger con dos mensajes: uno que sí debe activarla y uno que no debe activarla.
4. Documentar en el EJERCICIO.md qué description eligieron y por qué.

**Lo que el formador observa:**
- ¿La description es lo suficientemente específica para no activarse en contextos no deseados?
- ¿Probaron tanto el caso positivo como el negativo?

---

## 5. Demo 3 + Ejercicio 3 — Skill de code review (≈ 25 min)

### Demo 3 (5 min)

> Setup: misma rama `tema-09/inicio`.

Muestra el SKILL.md de `/review-pr` en directo (no hace falta ejecutarlo, solo mostrar la estructura):

```markdown
---
name: review-pr
description: Revisa los cambios actuales cuando el usuario pide "revisa el PR" o "haz review"
---

# Skill: review-pr

Revisa el diff actual contra las convenciones del repositorio Notebox.

## Criterios de revisión

1. Capas: la lógica de negocio está en services/, no en routes/.
2. Errores semánticos: no se lanza Error genérico.
3. Tests: cualquier cambio en un service tiene tests asociados.
4. Tipado: no hay `any` sin justificación.
5. Scope: el cambio está acotado.

## Formato de salida

Tabla: archivo → observación → severidad (🔴 bloquea / 🟡 mejora / 🟢 ok).
Conclusión: ¿listo para merge o necesita cambios?
```

> "Fijaos que los criterios son específicos de Notebox. 'Lógica en services, no en routes' no es una regla universal — es la regla de este proyecto. Eso es lo que hace valiosa esta skill."

### Ejercicio 3 (20 min)

> **Rama:** `git checkout tema-09/ejercicio-03`

Los alumnos diseñan una skill `/pre-deploy` para el repositorio Notebox. La skill verifica que el repo está listo para desplegar:
- Tests en verde (`npm test`).
- Typecheck limpio (`npm run typecheck`).
- No hay `console.log` en `src/`.
- El `CHANGELOG.md` tiene una entrada para esta versión (si existe).

Implementan la skill, la invocan y documentan en el EJERCICIO.md qué decisiones de diseño tomaron (nombre, descripción, formato de salida, criterios).

**Lo que el formador observa:**
- ¿Los criterios son verificables (el agente puede comprobarlos) o solo aspiracionales?
- ¿El formato de salida especifica qué hacer si algo falla (no solo reportarlo)?
- ¿El nombre de la skill es un verbo en kebab-case?

---

## 6. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Una skill = `SKILL.md` con contexto fijo + objetivo + formato.**
2. **`description:` para auto-trigger; `/nombre` para invocación consciente.**
3. **El valor está en el contexto específico del repo, no en las instrucciones genéricas.**
4. **Una skill por objetivo. Si hace A y B, son dos skills.**

**Puente al Tema 10:**

> "Tenéis skills para tareas repetidas. En el siguiente tema usamos Claude para algo distinto: explorar un repositorio que no conocéis y entender su arquitectura en minutos, sin abrir 50 archivos a mano."

---

## 7. Notas para el formador

- Si alguien pregunta *"¿se puede poner lógica condicional en una skill?"* → No. Una skill es instrucciones de texto, no código. Para lógica dinámica se usan MCP o agentes (Temas 19-20).
- Si alguien pregunta *"¿dónde están las skills del sistema?"* → En `.claude/skills/` del repo o en `~/.claude/skills/` para skills personales.
- El error más común en el ejercicio 1: skills vagas del estilo "documenta bien el código". Pedir que definan exactamente qué etiquetas JSDoc, en qué idioma, con qué formato.
- Pregunta trampa valiosa: *"¿Por qué no usamos CLAUDE.md en lugar de una skill?"* → Buena respuesta: CLAUDE.md aplica siempre; una skill se activa cuando toca. Para instrucciones universales del repo, CLAUDE.md. Para tareas concretas y reutilizables, skills.
- Si el ejercicio 3 se alarga, recortar la parte de invocarla y dejarlo como ejercicio de diseño escrito.
