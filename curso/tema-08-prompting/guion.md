# Tema 8 — Prompting profesional para desarrollo de software

> Duración estimada: 90 min · Tipo: práctico (alumnos delante del teclado).
> Repositorio de prácticas: rama `tema-08/inicio` (notebox, Node 24 + Express + TypeScript).

## 0. Objetivo del tema

Que el alumno deje de **escribir prompts como si hablara con ChatGPT** y empiece a escribirlos como si redactara una **issue para un compañero senior**. Si el prompt está bien, el output está bien.

---

## 1. Flujo de sesión

Estructura **batch**: primero todas las demos (el cuadro completo de las técnicas), después los tres ejercicios. Los alumnos necesitan haber visto todos los escenarios para saber qué técnica aplicar en cada ejercicio.

```
00:00 — Encuadre                              (10 min)
00:10 — Demo 1: mismo objetivo, dos prompts  (8 min)
00:18 — Demo 2: alternativas con trade-offs  (8 min)
00:26 — Demo 3: cambio mínimo verificado     (8 min)
00:34 — Demo 4: antipatrón en directo        (5 min)
00:39 — Ejercicio 1: prompt malo → bueno     (15 min, en clase)
00:54 — Ejercicio 2: alternativas primero    (15 min, en clase)
70:00 — Ejercicio 3: cambio mínimo           (15 min, en clase)
85:00 — Cierre y puente                      (5 min)
```

> **Si vas justo de tiempo:** recorta la demo 4 (es decorativa) y reduce el ejercicio 3 a 10 minutos (solo la implementación, sin el debate de capas).

---

## 2. Encuadre — lo que digo (≈ 10 min)

> "El prompt es el diseño. Si vuestro prompt es 'mejora el código', estáis pidiendo a un agente que tome decisiones que vosotros no os habéis molestado en tomar. Y luego os quejáis de que toca cosas que no debería."

Tres ideas que repito hasta que se las sepan:

1. **Un buen prompt tiene contexto, objetivo y restricciones.** Si falta uno, el resultado se degrada.
2. **Pedir poco es difícil.** "Cambia solo esta función, mantén la firma, no toques tests" es más útil que "refactoriza esto".
3. **El prompt obliga a razonar.** Si pides "dame 3 alternativas con trade-offs", Claude piensa diferente que si pides "hazlo".

### El esqueleto de un prompt profesional

Lo escribo en pizarra y lo dejo ahí toda la sesión:

```
[CONTEXTO]      qué es el repo / módulo / función
[OBJETIVO]      qué quieres conseguir, en una frase
[RESTRICCIONES] qué NO puede tocar, qué firma mantener, qué tests deben pasar
[FORMATO]       cómo quieres la respuesta (diff, lista, plan, código completo)
[EVIDENCIA]     "cita rutas y líneas, no inventes"
```

---

## 3. Demos en vivo — lo que prompteo (≈ 29 min)

> Antes de empezar: `git checkout tema-08/inicio`, `npm install`, `npm test` verde.

### Demo 1 — Mismo objetivo, dos prompts (≈ 8 min)

**Tarea**: refactorizar `archive()` y `unarchive()` en `src/services/notes.ts`.

**Prompt malo** (lo lanzo primero):

```
Refactoriza notes.ts, está feo.
```

Lo que el alumno ve: toca archivos no pedidos, cambia firmas, "mejora" cosas no solicitadas.

**Prompt bueno** (nuevo chat tras `/clear`):

```
[CONTEXTO]
src/services/notes.ts. Las funciones archive(id) y unarchive(id)
tienen anidación profunda y duplican la misma estructura.

[OBJETIVO]
Reducir la duplicación y aplanar los if anidados.

[RESTRICCIONES]
- Mantén exactamente las firmas: archive(id), unarchive(id).
- No toques ningún otro archivo.
- Los tests de test/notes.service.test.ts deben seguir pasando.
- No introduzcas dependencias nuevas.

[FORMATO]
Archivo final completo + lista corta de cambios.

[EVIDENCIA]
Antes de tocar nada, dime en una frase qué duplican las dos funciones.
```

Lo que el alumno ve: diagnóstico breve → refactor acotado → `npm test` verde.

> "El prompt malo no es 'corto'. Es **vago**. Un prompt corto pero específico gana siempre."

### Demo 2 — Pedir alternativas con trade-offs (≈ 8 min)

**Tarea**: bug en `src/search/index.ts` — "MAÑANA" no encuentra la nota con title "mañana".

```
[CONTEXTO]
src/search/index.ts implementa búsqueda lineal sobre title+body.
Un usuario reporta que "MAÑANA" no encuentra la nota con title "mañana",
y "manana" tampoco.

[OBJETIVO]
Entender las opciones de arreglo. No quiero código todavía.

[FORMATO]
3 alternativas con coste, riesgos y limitaciones de cada una.

[EVIDENCIA]
Cita la línea del bug y explica por qué falla con esos dos inputs.
```

Lo que el alumno ve: Claude propone opciones con trade-offs. Yo elijo (ej: `toLowerCase + normalize('NFD')`) y explico por qué. Segundo prompt acotado para implementar.

> "Pensar antes de codear. La IA no quita ese paso, lo hace más barato."

### Demo 3 — Cambio mínimo con verificación (≈ 8 min)

**Tarea**: `src/routes/notes.ts` no valida la entrada de `POST /notes`.

```
[CONTEXTO]
src/routes/notes.ts maneja POST /notes. No valida la entrada:
title puede venir vacío, body no tiene límite.

[OBJETIVO]
Añadir validación mínima: title requerido (max 200), body opcional (max 5000).
400 con { error: mensaje } si falla.

[RESTRICCIONES]
- Sin librerías de validación.
- Cambio acotado a src/routes/notes.ts.
- Tests existentes sin cambios.

[FORMATO]
Diff (solo líneas cambiadas) + propuesta de 3 tests sin implementarlos.
```

Lo que el alumno ve: cambio acotado, propuesta de tests antes de implementarlos, debate sobre dónde validar.

> "La ruta valida forma. El service valida negocio."

### Demo 4 — Antipatrón en directo (≈ 5 min)

```
Haz que el código esté bien. Aplica las mejores prácticas.
```

*"Mirad lo que está tocando. Esto es lo que pasa si vuestro equipo promptea así durante seis meses."*

---

## 4. Ejercicios en clase (≈ 45 min)

### Ejercicio 1 — Prompt malo → prompt bueno (15 min)

> **Rama:** `git checkout tema-08/ejercicio-01`

Los alumnos lanzan primero un prompt vago sobre el mismo escenario (refactorizar `archive`/`unarchive`), observan el resultado, construyen el prompt con los 5 bloques y comparan. Documentan qué diferencias concretas observaron.

**Lo que el formador observa:**
- ¿El prompt bueno incluye restricciones de firma?
- ¿Añadieron `[EVIDENCIA]` para forzar diagnóstico antes del cambio?
- ¿Los tests siguen verdes después del refactor?

### Ejercicio 2 — Alternativas antes del código (15 min)

> **Rama:** `git checkout tema-08/ejercicio-02`

Los alumnos tienen el bug de búsqueda (`src/search/index.ts`). Primero piden alternativas siguiendo el patrón de la demo 2, eligen una con justificación escrita, y solo después piden la implementación con un segundo prompt acotado.

**Lo que el formador observa:**
- ¿Eligieron la opción con trade-offs documentados o simplemente ejecutaron la primera?
- ¿El segundo prompt de implementación tiene restricciones?

### Ejercicio 3 — Cambio mínimo y capas de validación (15 min)

> **Rama:** `git checkout tema-08/ejercicio-03`

Los alumnos implementan la validación de `POST /notes` (Demo 3) pero deben decidir explícitamente dónde poner la lógica: en la ruta o en el service. Documentan la decisión y sus razones. Después implementan los 3 tests propuestos.

**Lo que el formador observa:**
- ¿Dónde pusieron la validación? ¿La justificación es técnica o solo intuitiva?
- Contrastar las justificaciones en clase al terminar.

---

## 5. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Prompt = contexto + objetivo + restricciones + formato + evidencia.**
2. **Pedir alternativas antes de pedir código.**
3. **Pedir el cambio mínimo y verificarlo (tests, diff, ejecutar).**
4. **Si tu prompt es ambiguo, el problema es tuyo.**

**Puente al Tema 9:**

> "Ahora sabéis promptear una tarea concreta. En el siguiente tema usamos esto para algo más grande: **explorar un repositorio que no conoces** y entender su arquitectura sin abrir 50 archivos a mano."

---

## 6. Notas para el formador

- Si los alumnos no tienen Node 20+, los tests del proyecto fallan (`node --test`). Avísalos antes.
- Si una demo se alarga, recorta la 4 (es decorativa, refuerza pero no enseña nuevo).
- Pregunta típica: *"¿No es muy verboso escribir prompts así?"* → *"Tardas 30 segundos en escribirlo y te ahorra 10 minutos de revertir cambios."*
- El ejercicio 2 tiene trampa: los alumnos tienden a implementar directamente la primera alternativa sin documentar la elección. Recordarlo al arrancar: *"La documentación de la elección es parte del ejercicio."*
- Preguntas trampa que valen oro:
  - *"¿Y si Claude responde algo que parece bien pero no lo es?"* → Tema 13 (revisión).
  - *"¿Esto se puede convertir en plantilla para todo el equipo?"* → Tema 17 (skills). **Siembra el gancho aquí.**
