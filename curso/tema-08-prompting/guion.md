# Tema 8 — Prompting profesional para desarrollo de software

> Duración estimada: 75-90 min · Tipo: práctico (alumnos delante del teclado).
> Repositorio de prácticas: rama `tema-08/inicio` (notebox, Node 24 + Express + TypeScript).

## 0. Objetivo del tema

Que el alumno deje de **escribir prompts como si hablara con ChatGPT** y empiece a escribirlos como si redactara una **issue para un compañero senior**. Si el prompt está bien, el output está bien.

---

## 1. Flujo de sesión

Estructura **batch**: primero todas las demos (el cuadro completo de las 5 técnicas), después los ejercicios. Los alumnos necesitan haber visto los 4 escenarios para entender qué técnica aplicar en cada ejercicio.

```
00:00 — Encuadre                              (10 min)
00:10 — Demo 1: mismo objetivo, dos prompts  (8 min)
00:18 — Demo 2: alternativas con trade-offs  (8 min)
00:26 — Demo 3: cambio mínimo verificado     (8 min)
00:34 — Demo 4: antipatrón en directo        (5 min)
00:39 — Ejercicio 1: prompt malo → bueno     (15 min, en clase)
00:54 — Ejercicio 2: alternativas primero    (15 min, en clase)
70:00 — Cierre y puente                      (5 min)
——————
Ejercicio 3: cambio mínimo                   (asíncrono — lo hacen solos)
```

> **Si vas justo de tiempo:** recorta la demo 4 (es decorativa, refuerza pero no enseña nuevo) y deja el ejercicio 2 como inicio de asíncrono.

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

No siempre necesitas los 5 bloques. Pero si la tarea es no trivial y te falta alguno, se nota.

### Antipatrones que vamos a evitar

- **"Mejora esto"** sin objetivo → sobreedición.
- **"Hazlo limpio / pythonic / idiomático"** → criterio del modelo, no tuyo.
- **"Arregla el bug"** sin describir el síntoma → busca a ciegas.
- **"Haz que funcione"** → fuerza al modelo a inventar.
- **Reabrir conversación 20 veces con micro-correcciones** → mejor un prompt con todas las restricciones desde el principio.

---

## 3. Demos en vivo — lo que prompteo (≈ 29 min)

> Antes de empezar: `git checkout tema-08/inicio`, `npm install`, `npm test` verde. Claude Code abierto apuntando a la raíz del repo.

### Demo 1 — Mismo objetivo, dos prompts (≈ 8 min)

**Tarea**: refactorizar `archive()` y `unarchive()` en `src/services/notes.ts`. Tienen anidación profunda y duplicación.

**Prompt malo** (lo lanzo primero, deliberadamente):

```
Refactoriza notes.ts, está feo.
```

Lo que el alumno ve:
- Toca cosas que no le hemos pedido.
- A veces cambia firmas.
- A veces "mejora" cosas que no son problema (renombra variables, cambia estilo).

**Prompt bueno** (nuevo chat tras `/clear`):

```
[CONTEXTO]
Estoy en el archivo src/services/notes.ts. Las funciones archive(id) y
unarchive(id) tienen anidación profunda y duplican la misma estructura.

[OBJETIVO]
Reducir la duplicación entre ambas y aplanar los if anidados.

[RESTRICCIONES]
- Mantén exactamente las firmas: archive(id), unarchive(id).
- No toques ningún otro archivo.
- Los tests de test/notes.service.test.ts deben seguir pasando sin cambios.
- No introduzcas dependencias nuevas.

[FORMATO]
Muéstrame el archivo completo final y, debajo, una lista corta de los
cambios que has hecho.

[EVIDENCIA]
Antes de tocar nada, dime en una línea qué es lo que duplican ambas funciones.
```

Lo que el alumno ve:
- Diagnóstico breve antes del cambio.
- Refactor acotado.
- Tests siguen verdes (`npm test` en directo).

> "El prompt malo no es 'corto'. Es **vago**. Un prompt corto pero específico es mejor que uno largo y disperso."

### Demo 2 — Pedir alternativas con trade-offs (≈ 8 min)

**Tarea**: hay un bug en `src/search/index.ts`: la búsqueda no encuentra "MAÑANA" cuando la nota dice "mañana", y tampoco "manana" sin tilde.

Antes de pedir el arreglo, **pido alternativas**. Esto cambia la conversación.

```
[CONTEXTO]
src/search/index.ts implementa una búsqueda lineal sobre title+body. Un
usuario reporta que buscar "MAÑANA" no devuelve la nota cuyo título es
"mañana", y que buscar "manana" tampoco la encuentra.

[OBJETIVO]
Quiero entender qué opciones hay para arreglarlo, no quiero el código todavía.

[FORMATO]
Dame 3 alternativas. Por cada una:
- Qué cambia exactamente.
- Coste aproximado de implementación (líneas de código y dependencias).
- Riesgos o efectos secundarios sobre el resto del sistema.
- En qué casos esta opción se queda corta.

[EVIDENCIA]
Cita la línea concreta del bug y por qué falla con esos inputs.
```

Lo que el alumno ve:
- Claude propone (a) `toLowerCase`, (b) `toLowerCase + normalize('NFD')`, (c) usar una lib tipo `fuse.js`.
- Aparecen los trade-offs por escrito.
- **Yo elijo** la opción (b). Explico por qué a los alumnos.
- Después prompteo el cambio con un segundo prompt acotado.

> "Lo que acabamos de hacer es lo que un buen ingeniero hace por defecto: pensar antes de codear. La IA no quita ese paso, lo hace más barato."

### Demo 3 — Cambio mínimo con verificación (≈ 8 min)

**Tarea**: `src/routes/notes.ts` no valida la entrada de `POST /notes`. Acepta título vacío y body sin límite.

```
[CONTEXTO]
src/routes/notes.ts maneja POST /notes. Hoy no valida la entrada: title
puede venir vacío o ausente, y body no tiene límite de tamaño.

[OBJETIVO]
Añadir validación mínima en la capa de ruta:
- title: requerido, string no vacío, máximo 200 caracteres.
- body: opcional, máximo 5000 caracteres.

[RESTRICCIONES]
- Cambio mínimo. No introduzcas librerías de validación (zod, joi, etc.).
- No toques services/, storage/, ni los tests existentes.
- Si la entrada es inválida, responde 400 con { error: <mensaje> }.
- Mantén el comportamiento actual para entradas válidas.

[FORMATO]
Muéstrame el diff (solo las líneas cambiadas) y propón 3 tests para
verificar la validación, sin escribirlos todavía.
```

Lo que el alumno ve:
- Cambio acotado a `src/routes/notes.ts`.
- Propuesta de tests (no implementación todavía).
- Discusión sobre **dónde validar**: route vs service. Defiendo "en la frontera". Lo dejo claro.

### Demo 4 — Antipatrón en directo (≈ 5 min)

Pego este prompt y dejo que pase lo que pase:

```
Haz que el código esté bien. Aplica las mejores prácticas.
```

Comentario para los alumnos: *"Mirad lo que está tocando. Esto es lo que pasa si vuestro equipo promptea así durante seis meses. El repo se vuelve un patchwork de 'mejores prácticas' que nadie ha decidido."*

---

## 4. Ejercicios en clase (≈ 30 min)

> **Rama:** `git checkout tema-08/ejercicio-01` para el ejercicio 1, `tema-08/ejercicio-02` para el 2.

### Ejercicio 1 — Prompt malo → prompt bueno (15 min)

Los alumnos reciben el mismo escenario de la Demo 1 (refactorizar `archive`/`unarchive`) pero desde cero: lanzan primero un prompt vago, observan el resultado, luego construyen el prompt con los 5 bloques y comparan. Documentan qué diferencias concretas observaron.

**Lo que el formador observa:**
- ¿El prompt bueno incluye restricciones de firma?
- ¿Añadieron `[EVIDENCIA]` para forzar diagnóstico antes del cambio?
- ¿Los tests siguen verdes después del refactor?

### Ejercicio 2 — Alternativas antes del código (15 min)

Los alumnos tienen el bug de búsqueda (`src/search/index.ts`, misma casuística que la Demo 2). Primero piden alternativas siguiendo el patrón del prompt de la demo, eligen una con justificación escrita, y solo después piden la implementación con un segundo prompt acotado.

**Lo que el formador observa:**
- ¿Eligieron la opción con trade-offs documentados o simplemente ejecutaron la primera?
- ¿El segundo prompt de implementación tiene restricciones?

---

## 5. Ejercicio asíncrono

### Ejercicio 3 — Cambio mínimo y capas de validación (30 min, fuera de clase)

> **Rama:** `tema-08/ejercicio-03`

Los alumnos implementan la validación de `POST /notes` (Demo 3) pero deben decidir explícitamente dónde poner la lógica: en la ruta o en el service. Documentan la decisión y sus razones. Después escriben los 3 tests que propuso Claude en la demo.

**Revisión en la siguiente sesión:** preguntar dónde pusieron la validación. Contrastar las justificaciones. ¿Alguien la puso en el service? ¿Por qué?

---

## 6. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Prompt = contexto + objetivo + restricciones + formato + evidencia.**
2. **Pedir alternativas antes de pedir código.**
3. **Pedir el cambio mínimo y verificarlo (tests, diff, ejecutar).**
4. **Si tu prompt es ambiguo, el problema es tuyo.**

**Puente al Tema 9:**

> "Ahora sabéis promptear una tarea concreta. En el siguiente tema usamos esto para algo más grande: **explorar un repositorio que no conoces** y entender su arquitectura sin abrir 50 archivos a mano."

---

## 7. Notas para el formador

- Si los alumnos no tienen Node 20+, los tests del proyecto fallan (usa `node --test`). Avísalos antes.
- Si una demo se alarga, recorta la 4 (es decorativa, refuerza pero no enseña nuevo).
- Pregunta típica: *"¿No es muy verboso escribir prompts así?"* → Respuesta: *"Tardas 30 segundos en escribirlo y te ahorra 10 minutos de revertir cambios. La verbosidad es el precio del control."*
- Preguntas trampa que valen oro si salen del alumnado:
  - *"¿Y si Claude responde algo que parece bien pero no lo es?"* → Tema 13 (revisión).
  - *"¿Esto se puede convertir en plantilla para todo el equipo?"* → Tema 17 (skills). **Siembra el gancho aquí.**
- El ejercicio 2 tiene trampa: los alumnos tienden a implementar directamente la primera alternativa sin documentar la elección. Recordarlo al arrancar: *"La documentación de la elección es parte del ejercicio."*
