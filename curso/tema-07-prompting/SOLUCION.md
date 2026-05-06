# Tema 7 — Solución de referencia

> Este archivo **no debe estar** en la rama `tema-07/inicio`. Vive en `main` y, opcionalmente, en `tema-07/solucion`.

## Mapa de los 4 problemas plantados

| # | Archivo | Síntoma observable | Ejercicio que lo cubre |
|---|---|---|---|
| 1 | `src/services/notes.ts` | `archive`/`unarchive` con `if` anidados y duplicación íntegra | Ejercicio 1 |
| 2 | `src/search/index.ts` | Búsqueda sensible a mayúsculas y a acentos | Ejercicio 2 |
| 3 | `src/routes/notes.ts` | `POST /notes` no valida entrada | Ejercicio 3 |
| 4 | `test/` | No hay tests para `search/` ni para validación HTTP | Se cierra haciendo 2 y 3 |

## Prompts modelo (lo que tú prompteas en las demos)

### Demo 1 — Refactor acotado de `services/notes.ts`

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

Resultado esperado: factorización en `setArchived(id, value)`.

### Demo 2 — Alternativas + implementación búsqueda

Prompt 1 (alternativas):

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

Prompt 2 (implementación, tras elegir opción b):

```
Aplica la opción de normalizar con toLowerCase + NFD + replace de diacríticos.

[RESTRICCIONES]
- Cambio sólo en src/search/index.ts.
- No introduzcas dependencias.
- Añade test/search.test.ts con 3 casos: mayúsculas, acentos, query vacía.

[FORMATO]
Diff de search/index.ts + archivo nuevo de tests entero.
```

### Demo 3 — Validación en la frontera

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

## Resultado final esperado

Después de los 3 ejercicios, el repo debería tener:

- `src/services/notes.ts` con `archive`/`unarchive` factorizados.
- `src/search/index.ts` con normalización Unicode.
- `src/routes/notes.ts` con validación de entrada.
- `test/storage.test.ts` (sin cambios).
- `test/notes.service.test.ts` (sin cambios).
- `test/search.test.ts` **nuevo**.
- `test/routes.notes.test.ts` **nuevo** (validación HTTP).

`npm test` verde con 12-14 tests.

## Errores típicos del alumno (anticipa estos)

- Pide "refactoriza" sin restricciones → Claude toca varios archivos. Úsalo como ejemplo en clase.
- Pide a Claude que arregle search "porque tiene un bug" sin describir el síntoma → Claude inventa otro bug y "lo arregla".
- Mueve la validación al service en lugar de a la ruta. Es un error conceptual que merece pararse y comentarlo.
- Mete `zod` aunque la restricción lo prohíba. Pregunta "¿por qué crees que en la restricción ponía 'sin librerías nuevas'?" — abre conversación sobre presupuestos de cambio.
