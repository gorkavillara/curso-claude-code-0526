# Tema 8 — Prompting profesional para desarrollo de software

> **Duración estimada:** \~60 min **Tipo:** práctico — alumnos delante del teclado

## Objetivo del tema

Dejar de escribir prompts como si fuera un chatbot y empezar a escribirlos como una issue bien redactada: con contexto, objetivo y restricciones. Si el prompt está bien, el output está bien.

***

## 1. Estructura de prompts eficaces para tareas de análisis, edición y validación

El esqueleto COA (Contexto, Objetivo, Acción):

| Bloque            | Qué incluye                                                   | Por qué importa                        |
| ----------------- | ------------------------------------------------------------- | -------------------------------------- |
| `[CONTEXTO]`      | Repo, módulo, función afectada                                | Sin esto, el agente inventa el alcance |
| `[OBJETIVO]`      | Qué quieres conseguir, en una frase                           | Define el éxito antes de empezar       |
| `[RESTRICCIONES]` | Qué NO puede tocar, qué firma mantener, qué tests deben pasar | Evita la sobreedición                  |
| `[FORMATO]`       | Diff, lista, plan, código completo                            | Controla la forma de la respuesta      |
| `[EVIDENCIA]`     | "Cita rutas y líneas antes de editar"                         | Obliga a razonar con datos reales      |

No necesitas los 5 bloques siempre. Pero si la tarea no es trivial y falta uno, se nota.

> Si tu prompt es ambiguo, el problema es tuyo.

### Demo 1 — Mismo objetivo, dos prompts

* **Objetivo:** ver cómo cambia el output con el mismo objetivo pero diferente nivel de restricciones.
* **Setup:** rama `tema-08/inicio` (`git checkout tema-08/inicio`, `npm install`, `npm test` verde).

**Prompt malo (lanzarlo primero):**

```
Refactoriza notes.ts, está feo.
```

**Prompt bueno (lanzarlo después, en sesión nueva):**

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

**Qué observar:**

* Con el prompt malo: toca archivos no pedidos, cambia firmas, "mejora" cosas no solicitadas.
* Con el prompt bueno: diagnóstico breve → refactor acotado → tests verdes.

> El prompt malo no es "corto". Es **vago**. Un prompt corto pero específico gana siempre.

### 🧩 Ejercicio 1 — Prompt malo → prompt bueno

> **Rama:** `git checkout tema-08/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Lanza primero un prompt vago para refactorizar `archive`/`unarchive`, observa el resultado, construye después el prompt con los 5 bloques y compara. Documenta qué diferencias concretas observas entre ambos outputs.

## 2. Uso de contexto explícito sobre arquitectura, objetivo y restricciones del cambio

El contexto no es documentación: es el **scope del cambio**.

* Sin contexto → el agente decide qué contexto usar (puede ser demasiado o demasiado poco).
* Con contexto → defines exactamente qué está dentro y qué está fuera del cambio.

Contexto útil:

* Nombre del archivo y función afectada.
* Por qué existe el problema (síntoma observable, no hipótesis).
* Qué otros archivos dependen de lo que vas a cambiar.

Contexto inútil:

* Historia del proyecto.
* "Como ya sabes, el año pasado…"
* El README completo.

## 3. Prompts para generar código nuevo sin romper estándares existentes

Añade siempre estas restricciones cuando generas código nuevo:

```
[RESTRICCIONES]
- Sigue el patrón del endpoint existente más similar (cita cuál).
- No introduces nuevas dependencias salvo que lo justifiques primero.
- El nuevo código pasa el linter y los tests existentes.
```

La restricción clave: **"sigue el patrón del X existente"**. Sin ella, Claude elige su propio patrón.

## 4. Prompts para pedir análisis comparativos, alternativas y trade-offs

Antes de pedir la implementación, pide el análisis. Cambia la conversación:

```
[OBJETIVO]
Quiero entender qué opciones hay. No quiero código todavía.

[FORMATO]
3 alternativas. Por cada una:
- Qué cambia exactamente.
- Coste (líneas + dependencias).
- Riesgos.
- En qué casos se queda corta.
```

Después **tú decides** cuál implementar. No lo delegues.

### Demo 2 — Alternativas antes de código

* **Objetivo:** demostrar que pedir alternativas antes de código cambia la calidad de la decisión.
* **Setup:** rama `tema-08/inicio`.

**Prompt:**

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

**Qué observar:**

* Claude propone opciones con trade-offs concretos.
* Yo elijo (ej: `toLowerCase + normalize('NFD')`) y explico por qué.
* Segundo prompt para implementar: acotado, con restricciones, con tests.

> "Lo que acabamos de hacer es lo que un buen ingeniero hace por defecto: pensar antes de codear. La IA no quita ese paso."

### 🧩 Ejercicio 2 — Alternativas antes del código

> **Rama:** `git checkout tema-08/ejercicio-02` · **Tiempo:** 15 min · **Tipo:** En clase

Sobre el bug de búsqueda en `src/search/index.ts`, pide primero alternativas con trade-offs (como en la Demo 2), elige una con justificación escrita y solo después pide la implementación con un segundo prompt acotado.

## 5. Prompts para refactorización, debugging, testing y documentación

### Refactorización

Restricciones clave: firmas exactas, archivos que no se tocan, tests que deben seguir verdes.

### Debugging

Dar el estado real: valores exactos de variables, output exacto del test que falla. No describir el problema en abstracto.

### Testing

Especificar: qué comportamiento cubre cada test, formato de naming, qué no mockear.

### Documentación

Especificar: qué nivel de detalle, qué audiencia, qué no incluir. "Explica esto" produce párrafos largos. "Explica esto en 3 bullets para un junior que no conoce Express" produce algo usable.

## 6. Técnicas para pedir cambios mínimos y evitar reescrituras innecesarias

La restricción más importante: **"no toques ningún otro archivo"**.

Otras técnicas:

* "Diff mínimo" → pedirle explícitamente el diff en lugar del archivo completo.
* "Propón primero, implementa después" → dos prompts en lugar de uno.
* "Lista los archivos que vas a tocar antes de tocar ninguno" → checkpoint antes del cambio.

> "Pedir poco es difícil. Cambias solo esta función, mantienes la firma, no tocas tests. Más útil que 'refactoriza esto'."

## 7. Cómo obtener respuestas estructuradas, listados de riesgos y planes de acción

El bloque `[FORMATO]` controla la estructura:

```
[FORMATO]
- Una tabla con columnas: opción / pros / contras / cuándo usar
- Máximo 5 filas
- Sin código todavía
```

Para planes de acción:

```
[FORMATO]
Lista numerada de pasos. Para cada paso:
1. Qué archivo toca.
2. Qué hace exactamente.
3. Cómo verifico que está bien.
```

Para riesgos:

```
[FORMATO]
Lista de riesgos ordenados por impacto descendente.
Por cada riesgo: probabilidad (alta/media/baja) + mitigación.
```

### Demo 3 — Cambio mínimo con verificación

* **Objetivo:** practicar el ciclo "propón tests → implementa → verifica".
* **Setup:** rama `tema-08/inicio`.

**Prompt:**

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

**Qué observar:**

* Cambio acotado a `routes/notes.ts`.
* Propuesta de tests antes de implementarlos: yo reviso primero.
* Debate sobre dónde validar: ruta vs service.

> La ruta valida forma (¿está presente? ¿es un string?). El service valida negocio (¿puede archivar?).

### 🧩 Ejercicio 3 — Cambio mínimo y capas de validación

> **Rama:** `git checkout tema-08/ejercicio-03` · **Tiempo:** 15 min · **Tipo:** En clase

Implementa la validación de `POST /notes` decidiendo explícitamente dónde colocar la lógica (ruta vs service) y por qué. Documenta la decisión con sus razones e implementa los 3 tests propuestos.

## 8. Diseño de prompts que obligan a razonar con evidencia del repositorio

El bloque `[EVIDENCIA]` es el más infravalorado:

```
[EVIDENCIA]
Antes de proponer nada, cita:
- La función exacta donde está el bug (ruta y línea).
- El valor que recibe vs el que debería recibir.
```

Sin esto, Claude puede proponer soluciones correctas para un bug que no es el que tú ves.

Con esto, la respuesta está anclada a código real — verificable inmediatamente.

## 9. Estrategias para iterar sobre una respuesta hasta volverla desplegable

Un buen prompt rara vez produce output listo en el primer intento. El ciclo:

1. Primera respuesta → revisar si el scope es correcto.
2. Si se pasó → "Limita esto solo a X, deshaz los cambios de Y".
3. Si le faltó → "Añade también Z, con las mismas restricciones".
4. `npm test` → si falla, el output del fallo es el siguiente contexto.

No abrir conversaciones nuevas innecesariamente: el historial de la sesión es contexto acumulado.

## 10. Antipatrones de prompting que producen ruido, sobreedición o falsas certezas

| Antipatrón                                 | Por qué falla                                                     |
| ------------------------------------------ | ----------------------------------------------------------------- |
| "Mejora esto"                              | Sin objetivo → sobreedición                                       |
| "Hazlo limpio / pythonic / idiomático"     | El criterio es del modelo, no tuyo                                |
| "Arregla el bug" sin describir síntoma     | Busca a ciegas o inventa el bug                                   |
| "Haz que funcione"                         | Fuerza al modelo a inventar un estado deseado                     |
| Micro-correcciones en 20 mensajes seguidos | Un prompt con todas las restricciones desde el principio es mejor |
| "Aplica las mejores prácticas"             | Completamente delegado, sin criterio propio                       |

***

## Resumen

* **Prompt = contexto + objetivo + restricciones + formato + evidencia.**
* Pedir alternativas antes de pedir código.
* "No toques ningún otro archivo" es la restricción más importante.
* El bloque `[EVIDENCIA]` ancla la respuesta a código real.
* Si tu prompt es ambiguo, el problema es tuyo.
