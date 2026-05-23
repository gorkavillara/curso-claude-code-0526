# Tema 6 — Solución de referencia

## Ejercicio 1 — Ciclo completo desde VS Code

### Diferencia con/sin selección

| | Con selección | Sin selección |
|---|---|---|
| Scope del cambio | Acotado a la función seleccionada | Puede tocar el archivo entero |
| Archivos tocados | Normalmente solo el actual | Puede saltar a otros archivos |
| Velocidad | Más rápida (contexto ya dado) | Más lenta (Claude explora) |

**Lo que el formador valida:**
- ¿El alumno revisó el diff bloque a bloque o aceptó en bloque?
- ¿Pasaron los tests tras aceptar?
- ¿Notó la diferencia entre seleccionar y no seleccionar?

### Resultado esperado de la Parte B

Con la función `archive` seleccionada y el prompt correcto, Claude debe:
1. Mostrar diagnóstico breve en una frase.
2. Proponer solo cambios dentro de `services/notes.ts`.
3. No cambiar la firma `archive(id: string)`.
4. Los tests siguen verdes.

---

## Ejercicio 2 — Revisión de cambios grandes

### Clasificación esperada de los 4 cambios en CAMBIOS_PENDIENTES.md

| Cambio | Clasificación correcta | Motivo |
|---|---|---|
| 1. Refactor archive/unarchive | ✅ Aprobado | Mismo comportamiento, mejor estructura |
| 2. Validación en POST /notes | ✅ Aprobado | body es opcional — compatible con clientes existentes |
| 3. Normalización de búsqueda | ⚠️ Aprobado con comentario | Cambio semántico en búsqueda — debería tener tests explícitos |
| 4. Actualización express 5.0.0 | N/A | Fue revertido antes de entrar |

**Cómo detectar el cambio revertido sin leer git log:**
```
"¿Hay algún cambio en package.json en el historial reciente que haya sido
revertido? ¿Qué cambió y por qué fue revertido?"
```
Claude puede leer el git log y resumirlo.

---

## Ejercicio 3 — Navegación contextual y debug

### Respuestas esperadas de la Parte A

| Pregunta | Respuesta correcta |
|---|---|
| Dónde se llama search | `src/services/notes.ts`, función `search()`, línea ~20 |
| Qué pasa con query=null | Entra en `if (!query) return []` → devuelve array vacío |
| Cuántos endpoints | 5: POST /notes, GET /notes, GET /notes/search, POST /:id/archive, POST /:id/unarchive |
| Dónde se define Note | `src/models/note.ts` |

**Errores frecuentes que señalar:**
- Si Claude inventa endpoints que no existen → ejemplo de alucinación sin evidencia.
- Si Claude dice que search devuelve null en lugar de [] → pedir evidencia con `[EVIDENCIA]`.

### Resultado esperado del debug (Parte B)

El test falla porque `search/index.ts` hace `haystack.includes(q)` sin normalizar. Claude debe:
1. Citar la línea exacta del fallo.
2. Explicar que `"Mañana"` no incluye `"MAÑANA"` con `includes()` (case-sensitive).
3. Proponer `toLowerCase()` mínimo, o `toLowerCase + normalize('NFD')` para acentos también.

Fix esperado:
```ts
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
```
