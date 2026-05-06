# Tema 7 — Prompting profesional para desarrollo de software

> Duración estimada: 75-90 min · Tipo: práctico (alumnos delante del teclado).
> Repositorio de prácticas: rama `tema-07/inicio` (Node 24 + Express + TypeScript, ver `codigo/`).

## 0. Objetivo del tema

Que el alumno deje de **escribir prompts como si hablara con ChatGPT** y empiece a escribirlos como si redactara una **issue para un compañero senior**. Eso es todo. Si el prompt está bien, el output está bien.

Un alumno bueno termina este tema sabiendo:

- Por qué un prompt sin contexto produce sobreedición.
- Cómo dar contexto sin escribir un ensayo.
- Cómo pedir **cambios mínimos** y cómo pedir **alternativas**.
- Cómo obligar a Claude a **citar evidencia** del repo (rutas, funciones).
- Qué prompts son antipatrones y por qué.

---

## 1. Encuadre — lo que digo (≈ 10 min)

> "El prompt es el diseño. Si vuestro prompt es 'mejora el código', estáis pidiendo a un agente que tome decisiones que vosotros no os habéis molestado en tomar. Y luego os quejáis de que toca cosas que no debería."

Tres ideas que repito hasta que se las sepan:

1. **Un buen prompt tiene contexto, objetivo y restricciones.** Si falta uno, el resultado se degrada.
2. **Pedir poco es difícil.** "Cambia solo esta función, mantén la firma, no toques tests" es más útil que "refactoriza esto".
3. **El prompt obliga a razonar.** Si pides "dame 3 alternativas con trade-offs", Claude piensa diferente que si pides "hazlo".

### El esqueleto de un prompt profesional

Lo escribo en pizarra y lo dejo ahí toda la sesión:

```
[CONTEXTO]    qué es el repo / módulo / función
[OBJETIVO]    qué quieres conseguir, en una frase
[RESTRICCIONES]  qué NO puede tocar, qué firma mantener, qué tests deben seguir pasando
[FORMATO]     cómo quieres la respuesta (diff, lista, plan, código completo)
[EVIDENCIA]   "cita rutas y líneas, no inventes"
```

No siempre necesitas los 5 bloques. Pero si la tarea es no trivial y te falta alguno, se nota.

### Antipatrones que vamos a evitar

- **"Mejora esto"** sin objetivo → sobreedición.
- **"Hazlo limpio / pythonic / idiomático"** → criterio del modelo, no tuyo.
- **"Arregla el bug"** sin describir el síntoma → busca a ciegas.
- **"Haz que funcione"** → fuerza al modelo a inventar.
- **Reabrir conversación 20 veces con micro-correcciones** → mejor un prompt con todas las restricciones desde el principio.

---

## 2. Demos en vivo — lo que prompteo (≈ 35 min)

> Antes de empezar las demos: asegúrate de tener clonada la rama `tema-07/inicio` y `npm install` hecho. La sesión de Claude Code apunta a `curso/tema-07-prompting/codigo/`.

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

**Prompt bueno** (lo lanzo después, en la misma conversación tras `/clear` o en un chat nuevo):

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
- Tests siguen verdes (lo enseño en directo: `npm test`).

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
- Claude propone p.ej. (a) `toLowerCase`, (b) `toLowerCase + normalize('NFD')`, (c) usar una lib tipo `fuse.js`.
- Aparecen los trade-offs por escrito.
- **Yo elijo** la opción (b). Explico por qué a los alumnos.
- Después prompteo el cambio con un segundo prompt acotado.

> "Lo que acabamos de hacer es lo que un buen ingeniero hace por defecto: pensar antes de codear. La IA no quita ese paso, lo hace más barato."

### Demo 3 — Cambio mínimo con verificación (≈ 8 min)

**Tarea**: `routes/notes.ts` no valida la entrada de `POST /notes`. Acepta título vacío y body sin límite.

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
test/notes.service.test.ts o un archivo nuevo, sin escribirlos todavía.
```

Lo que el alumno ve:
- Cambio acotado a `routes/notes.ts`.
- Propuesta de tests (no implementación todavía).
- Discusión sobre **dónde validar**: route vs service. Yo defiendo "en la frontera". Lo dejo claro.

### Demo 4 — Antipatrón en directo (≈ 5 min)

Pego este prompt y dejo que pase lo que pase:

```
Haz que el código esté bien. Aplica las mejores prácticas.
```

Comentario para los alumnos: *"Mirad lo que está tocando. Esto es lo que pasa si vuestro equipo promptea así durante seis meses. El repo se vuelve un patchwork de 'mejores prácticas' que nadie ha decidido."*

---

## 3. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Prompt = contexto + objetivo + restricciones + formato + evidencia.**
2. **Pedir alternativas antes de pedir código.**
3. **Pedir el cambio mínimo y verificarlo (tests, diff, ejecutar).**
4. **Si tu prompt es ambiguo, el problema es tuyo.**

**Puente al Tema 8:**

> "Ahora sabéis prompter una tarea. En el siguiente tema usamos esto para algo más grande: **explorar un repositorio que no conoces** y entender su arquitectura sin abrir 50 archivos a mano."

---

## 4. Notas para el formador

- Si los alumnos no tienen Node 20+, los tests del proyecto fallan (usa `node --test`). Avísalos antes.
- Si una demo se alarga, recorta la 4 (es decorativa, refuerza pero no enseña nuevo).
- Pregunta típica: *"¿No es muy verboso escribir prompts así?"* → Respuesta: *"Tardas 30 segundos en escribirlo y te ahorra 10 minutos de revertir cambios. La verbosidad es el precio del control."*
- Preguntas trampa que valen oro si salen del alumnado:
  - *"¿Y si Claude responde algo que parece bien pero no lo es?"* → Tema 13 (revisión).
  - *"¿Esto se puede convertir en plantilla para todo el equipo?"* → Tema 17 (skills). **Siembra el gancho aquí.**
