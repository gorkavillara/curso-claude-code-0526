# Tema 5 — Solución de referencia

## Ejercicio 1 — Clasificar tareas por modo

### Tabla resuelta

| # | Tarea | Modo correcto | Por qué |
|---|---|---|---|
| 1 | Borra todos los archivos `.log` de la raíz | **plan** | Irreversible. Conviene ver exactamente qué borrará antes de ejecutar. |
| 2 | Añade el campo `priority` al modelo `Note` | **default** | Cambio acotado. El diff es pequeño y verificable con `npm test`. |
| 3 | Migra el almacenamiento de memoria a SQLite | **plan** | Afecta a toda la app. El plan debe revisarse antes de tocar nada. |
| 4 | Escribe tests para `src/search/index.ts` | **auto** | Resultado verificable instantáneamente (`npm test`). Bajo riesgo. |
| 5 | Actualiza todas las dependencias npm | **plan** | Puede romper compatibilidad. Hay que ver qué cambia antes de `npm install`. |
| 6 | Lee el `.env` y dime qué variables faltan | **nunca sin permiso** | Expone secretos. Antes de lanzar este prompt: añadir `deny Read(.env)` en settings. |
| 7 | Renombra `q` a `query` en `src/search/index.ts` | **auto** | Cambio mecánico, una sola función, 1-2 líneas. |
| 8 | Añade autenticación JWT a todos los endpoints | **plan** | Cambio transversal con implicaciones de seguridad. El plan es obligatorio. |
| 9 | Elimina los tests que están en rojo | **nunca en auto** | Claude puede borrar tests válidos que fallan por un bug en el código, no por ser incorrectos. |
| 10 | Refactoriza `services/notes.ts` para mejorar la legibilidad | **default con restricciones** | Vago sin restricciones → sobreedición. Mejor con un prompt del Tema 7. |
| 11 | Crea el endpoint `DELETE /notes/:id` | **default** | Tarea acotada con patrón existente. Un test verifica el resultado. |
| 12 | Haz que el código siga las mejores prácticas | **nunca sin contexto** | "Mejores prácticas" las decide Claude, no el equipo. Antipatrón del Tema 7. |

### Las 4 trampas

Las tareas **5, 6, 9 y 12** son las más peligrosas en modo `auto`:

- **5**: Una actualización masiva puede romper builds en silencio.
- **6**: Leer `.env` expone credenciales al contexto de la conversación.
- **9**: Claude distingue "test rojo por bug en tests" vs "test rojo por bug en código" con dificultad. Puede borrar los equivocados.
- **12**: Criterio totalmente delegado. El repo queda como un patchwork de "mejoras" que nadie decidió.

---

## Ejercicio 2 — Política de permisos

### Diagnóstico del settings inicial (el del becario)

```json
{
  "permissions": {
    "allow": ["Bash(*)"],
    "deny": []
  }
}
```

Problemas:
- `allow: ["Bash(*)"]` permite **cualquier comando shell** sin confirmación.
- `deny: []` no bloquea nada.
- No hay reglas sobre archivos sensibles.

### Política correcta

```json
{
  "permissions": {
    "allow": [
      "Edit(src/**)",
      "Edit(test/**)",
      "Write(src/**)",
      "Write(test/**)",
      "Read(src/**)",
      "Read(test/**)",
      "Read(package.json)",
      "Read(tsconfig.json)",
      "Bash(npm install)",
      "Bash(npm test)",
      "Bash(npm run *)"
    ],
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Write(.env)",
      "Write(.env.*)",
      "Bash(scripts/deploy.sh*)",
      "Write(db/migrations/**)",
      "Bash(rm -rf*)",
      "Bash(git push*)",
      "Bash(git reset --hard*)"
    ]
  }
}
```

### Resultado esperado de los 5 tests

| Prompt | Resultado |
|---|---|
| "Muéstrame el contenido de .env" | **Bloqueado** — `deny Read(.env)` |
| "Ejecuta scripts/deploy.sh" | **Bloqueado** — `deny Bash(scripts/deploy.sh*)` |
| "Crea migración en db/migrations/" | **Bloqueado o pide confirmación** — `deny Write(db/migrations/**)` |
| "Añade validación en src/routes/notes.ts" | **Se ejecuta** — `allow Edit(src/**)` |
| "Borra temporales con rm -rf tmp/" | **Bloqueado** — `deny Bash(rm -rf*)` |

### El límite de la política (Parte D)

La política no detecta que Claude inyecte `fs.readFileSync('.env')` dentro de un `.ts` permitido. Esa es una limitación inherente: los permisos protegen **acciones directas de Claude Code**, no el código que Claude escribe que luego ejecuta el propio runtime.

Mitigación: revisar el diff antes de ejecutar (Tema 7), o usar modo `plan` para tareas de refactor.

---

## Ejercicio 3 — Autopsia del incidente

### Parte A — Análisis

1. Claude se salió del scope en el **Paso 2** (`rm -rf logs/`). El Paso 1 era el trabajo pedido; todo lo demás fue iniciativa propia.
2. La frase clave: **"está un poco desordenado"**. "Desordenado" es ambiguo y da pie a que Claude decida qué limpieza hacer.
3. El daño más grave: **Paso 2** (`rm -rf logs/`) — irreversible. Los logs de análisis de un bug activo en producción no se recuperan.
4. Modo correcto: **`plan`** o **`default`**. Solo con `plan` habría podido ver los pasos antes de ejecutar y rechazar el Paso 2.

### Parte B — Prompt reescrito

```
[CONTEXTO]
src/services/notes.ts tiene duplicación entre archive() y unarchive():
ambas repiten la misma estructura de ifs anidados.

[OBJETIVO]
Reducir esa duplicación extrayendo una función auxiliar privada.

[RESTRICCIONES]
- Solo tocar src/services/notes.ts. Ningún otro archivo.
- Mantener exactamente las firmas archive(id) y unarchive(id).
- No ejecutar ningún comando shell.
- npm test debe seguir verde sin cambios en test/.

[FORMATO]
Muéstrame el archivo final completo y una lista de los cambios.
```

### Parte C — Modo plan

Al lanzar "Refactoriza src/services/notes.ts, está un poco desordenado" en modo plan, Claude típicamente propone:

1. Refactorizar `archive`/`unarchive` (✅ aprobar)
2. Limpiar archivos no rastreados / logs (❌ rechazar — no pedido)
3. Actualizar dependencias (❌ rechazar — no pedido)
4. Revisar `.env` (❌ rechazar — siempre)

El prompt de ajuste del plan:

```
Limita el plan únicamente a src/services/notes.ts.
No propongas cambios en ningún otro archivo.
No ejecutes comandos shell más allá de npm test al final.
```

### Parte D — Regla preventiva

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Bash(rm -rf*)",
      "Bash(git push*)"
    ]
  }
}
```

Estas dos reglas hacen imposibles los daños de los Pasos 2 y 4. Los Pasos 1 y 3 (refactor y dependencias) solo se evitan con un prompt bien escrito o con modo `plan` + revisión manual.

### Lección final

> El modo plan no es lento: es el paso de revisión que cualquier buen ingeniero haría de cabeza. Claude Code lo hace visible y cancelable.

Los permisos son la última línea de defensa. El primer filtro siempre es el prompt.
