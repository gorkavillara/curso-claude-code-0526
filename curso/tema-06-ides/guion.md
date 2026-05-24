# Tema 6 — Integración con IDEs: VS Code y JetBrains

> Duración estimada: 60 min · Tipo: práctico (alumnos delante del teclado con VS Code).
> Repositorio de prácticas: rama `tema-06/inicio` (notebox, Node 24 + Express + TypeScript).

## 0. Objetivo del tema

Que el alumno integre Claude Code en su flujo de editor habitual: no como una ventana aparte, sino como parte del ciclo seleccionar → preguntar → diff → aceptar. Y que entienda cuándo el IDE es mejor que la CLI y cuándo no.

---

## 1. Flujo de sesión

Estructura **intercalada**: cada demo va seguida inmediatamente del ejercicio correspondiente. El hábito muscular se fija si se practica en caliente — no 20 minutos después.

```
00:00 — Encuadre                              (5 min)
00:05 — Demo 1: ciclo completo en VS Code     (10 min)
00:15 — Ejercicio 1: ciclo completo           (15 min, en clase)
00:30 — Demo 2: revisión de cambios grandes   (10 min)
00:40 — Ejercicio 2: revisión con criterio    (15 min, en clase)
00:55 — Demo 3: debug asistido (solo demo)    (5 min)
60:00 — Cierre y puente                       (5 min)
——————
Ejercicio 3: navegación + debug               (asíncrono — lo hacen solos)
```

> **Si vas justo de tiempo:** la demo 3 puede reducirse a 3 minutos (solo mostrar el concepto, sin ejecutar el ciclo completo). El ejercicio 3 ya está diseñado para ser autónomo.

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "El IDE es el entorno donde pasáis el 80% del día. Si tenéis que saltar a una terminal para hablar con Claude y volver al editor para aceptar los cambios, estáis perdiendo la mitad del flujo. La extensión elimina ese salto."

Dos ideas rápidas:

1. **La selección es contexto gratis.** Seleccionar una función antes de preguntar es como escribir `[CONTEXTO]` en el prompt sin escribirlo.
2. **El diff inline es el punto de control.** Aceptar bloque a bloque es más seguro que aceptar en bloque, y es tan rápido como revisar un PR pequeño.

---

## 3. Demo 1 + Ejercicio 1 — Ciclo completo en VS Code (≈ 25 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-06/inicio`, `npm install`, VS Code abierto con la extensión activa.

Abre `src/services/notes.ts`. **Selecciona la función `createNote`** completa. En el panel lateral escribe:

```
Añade validación: el body no puede superar 5000 caracteres. Devuelve un
error semántico (no un Error genérico) y añade un test que lo cubra.
Ejecuta los tests al terminar.
```

Lo que el alumno ve:
- La selección se transmite como contexto sin que la pegues en el prompt.
- El diff aparece inline, bloque a bloque.
- Si el test falla, la siguiente respuesta del agente ya tiene el output del fallo en su contexto.
- Los tests pasan en el panel sin abrir terminal.

> "La selección hace el trabajo de [CONTEXTO]. Sin ella, Claude decide qué contexto usar — puede elegir demasiado o demasiado poco."

### Ejercicio 1 (15 min)

> **Rama:** `git checkout tema-06/ejercicio-01`

Los alumnos repiten el ciclo con y sin selección sobre la misma tarea, rellenan la tabla comparativa del EJERCICIO.md y verifican que los tests siguen verdes.

**Lo que el formador observa:**
- ¿Revisaron el diff bloque a bloque o aceptaron en bloque?
- ¿Notaron la diferencia de scope entre con y sin selección?

---

## 4. Demo 2 + Ejercicio 2 — Revisión de cambios grandes (≈ 25 min)

### Demo 2 (10 min)

> Setup: mismo repo, hazte checkout de una rama con cambios o usa `tema-06/inicio` comparando contra `main`.

Simula una revisión de PR. En el chat (sin abrir ningún archivo manualmente):

```
Compara la rama actual con main. Resume los cambios en 5 puntos
y marca los 3 más arriesgados con justificación.
```

Lo que el alumno ve:
- Claude lee el diff completo y devuelve los puntos priorizados.
- Propone dónde mirar primero.

Ve a uno de los puntos arriesgados en el editor. Cuando dudes de algo, pregunta:

```
Explícame por qué este cambio en services/ es seguro respecto
a los callers en routes/.
```

Lo que el alumno ve:
- Reduces el coste de revisión sin delegar la revisión.
- El agente puede equivocarse sobre qué es "arriesgado": tú decides.

> "Claude te dice dónde mirar primero, no qué aprobar. El editor es el sitio natural para esto."

### Ejercicio 2 (15 min)

> **Rama:** `git checkout tema-06/ejercicio-02`

Los alumnos tienen un `CAMBIOS_PENDIENTES.md` con 4 cambios documentados (uno revertido). Usan Claude desde VS Code para clasificarlos y profundizar en el más arriesgado.

**Lo que el formador observa:**
- ¿Detectaron el cambio 4 (revertido) sin leer el git log manualmente?
- ¿Usaron la selección para profundizar en un cambio concreto?

---

## 5. Demo 3 — Debug asistido (≈ 5 min, solo demo)

> Esta demo es demostración pura. El ejercicio correspondiente es asíncrono.

**Concepto**: el estado real del debugger (valores de variables en el breakpoint) es más potente que una descripción del bug.

Muestra el flujo:

1. Abre un test con un fallo, pon un breakpoint en la línea de la aserción.
2. Lanza la sesión de debug (`F5`). Cuando pare, copia los valores de las variables relevantes.
3. En el chat:

```
El test pausa aquí. `expected` vale X, `actual` vale Y. Mira la lógica
de createNote y dime por qué difieren.
```

Lo que el alumno ve:
- El agente razona con datos concretos, no con descripciones vagas.
- Cada hipótesis del agente es verificable: vuelves al debugger.
- Esta combinación es difícil de replicar en CLI pura.

> "La diferencia entre 'el test falla' y 'expected=X, actual=Y con estos valores' es la diferencia entre adivinar y diagnosticar."

---

## 6. Ejercicio asíncrono

### Ejercicio 3 — Navegación contextual y debug (25 min, fuera de clase)

> **Rama:** `tema-06/ejercicio-03`

Los alumnos navegan el repo sin abrir archivos manualmente (4 preguntas de navegación), crean un test que falla deliberadamente, y usan los valores exactos del fallo para que Claude diagnostique la causa.

**Revisión en la siguiente sesión:** preguntar a alguien qué encontró en la navegación. ¿Inventó Claude algún endpoint o línea? Usarlo si ocurrió.

---

## 7. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Selección = contexto gratis. Siempre selecciona antes de preguntar sobre código concreto.**
2. **Diff inline = punto de control. Revisa bloque a bloque en cambios sensibles.**
3. **Estado real del debugger > descripción vaga del bug.**
4. **El IDE facilita aceptar cambios. Eso no los hace más seguros.**

**Puente al Tema 7:**

> "Habéis visto cómo dar contexto puntual (selección, diff). En el siguiente tema vemos cómo dar contexto **permanente**: instrucciones que aplican en todas las sesiones sin que las repitáis."

---

## 8. Notas para el formador

- **Requisito técnico**: todos los alumnos necesitan VS Code con la extensión de Claude Code instalada. Verificar antes de empezar.
- Si alguien usa JetBrains: la UX es equivalente pero los atajos son diferentes. Déjales explorar — no es necesario que cambien de IDE para este tema.
- El error más común en el ejercicio 1: aceptar el diff en bloque con "Accept all" en lugar de revisarlo por partes. Señálalo al arrancar el ejercicio.
- Pregunta típica: *"¿Puedo usar la extensión sin la CLI?"* → Sí, pero la CLI y la extensión comparten sesión si arrancas `claude` desde la terminal integrada de VS Code.
- Si la extensión no se detecta automáticamente: `Cmd/Ctrl+Shift+P` → "Claude Code: Open".
- Para la demo 3, si no tienes un test roto preparado: modifica temporalmente un test de `test/notes.service.test.ts` para que falle con un valor específico. El punto es mostrar el flujo, no el bug concreto.
