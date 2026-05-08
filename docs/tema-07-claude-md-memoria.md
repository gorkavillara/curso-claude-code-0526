---
hidden: true
---

# Tema 7 — Contexto persistente con CLAUDE.md y memoria

> **Duración estimada:** \~60 min **Tipo:** práctico + demos guiadas

## Objetivo del tema

Convertir el contexto de Claude Code en un **activo del repositorio**: dejar de repetir las mismas instrucciones en cada sesión y que el agente trabaje con las normas reales del equipo.

***

## 1. Diferencia entre instrucciones persistentes y conversación puntual

|              | Conversación puntual     | Instrucción persistente                 |
| ------------ | ------------------------ | --------------------------------------- |
| Duración     | Solo en la sesión actual | Aplica en todas las sesiones futuras    |
| Dónde vive   | En el chat               | `CLAUDE.md`, `.claude/rules/`, settings |
| Quién la usa | Solo tú, en ese momento  | Todo el equipo, siempre                 |
| Uso típico   | "En este caso, ignora X" | "En este repo, nunca hagas X"           |

> Si lo dices más de dos veces, **escríbelo** en `CLAUDE.md`.

## 2. Uso de `CLAUDE.md` para arquitectura, normas de código y workflows del proyecto

`CLAUDE.md` es un archivo markdown que el agente **carga automáticamente** al abrir el repo. Contenido típico:

* **Qué hace el proyecto** (1 párrafo).
* **Arquitectura de alto nivel** (capas, módulos clave, dependencias).
* **Convenciones del equipo** (naming, errores, validación).
* **Comandos del proyecto** (`npm test`, `npm run lint`, etc.).
* **Reglas duras** ("nunca toques `migrations/` sin avisar").

Plantilla mínima:

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

### 🧪 Demo 1 — Crear un `CLAUDE.md` mínimo y ver el cambio de comportamiento

* **Objetivo:** comprobar que las reglas del archivo afectan al comportamiento.
* **Setup:** Notebox sin `CLAUDE.md` todavía.

**Pasos:**

1.  Sin `CLAUDE.md`, pídele:

    ```
    Añade validación: el title no puede ser vacío. Lanza el error correspondiente.
    ```

    Observa: probablemente lanza un `Error` genérico o un `400` directo en la ruta.
2. Crea `CLAUDE.md` con la plantilla del punto 2 (incluye la regla _"Nunca lanzar `Error` directo: usar errores semánticos del dominio"_).
3. Reinicia la sesión. Repite el prompt.
4. Observa: ahora introduce un error semántico (p. ej. `InvalidNoteError`) y lo propaga correctamente a la ruta.

**Qué observar:**

* `CLAUDE.md` no es decorativo: cambia decisiones reales del agente.
* Cuanto más concretas las reglas, más fiable la salida.
* Reglas vagas ("escribe código limpio") no sirven.

## 3. Ubicaciones posibles de `CLAUDE.md` y precedencia entre ámbitos

| Ubicación                    | Alcance                            | Precedencia             |
| ---------------------------- | ---------------------------------- | ----------------------- |
| `~/.claude/CLAUDE.md`        | Personal, global a todos tus repos | Mínima                  |
| `<repo>/CLAUDE.md`           | Equipo, todo el repo               | Media                   |
| `<repo>/<subpath>/CLAUDE.md` | Solo dentro de ese subpath         | Alta dentro del subpath |

> Las instrucciones más específicas (subpath) ganan a las generales (repo) y a las globales (home).

## 4. Organización de reglas por proyecto, por tipo de archivo o por alcance del equipo

Patrones útiles:

* **Por proyecto** → `<repo>/CLAUDE.md` con todo lo del proyecto entero.
* **Por subpath** → `src/payments/CLAUDE.md` con reglas específicas del módulo crítico.
* **Por tipo** → reglas en `.claude/rules/<topic>.md` (ver punto 5).
* **Por equipo** → secciones del `CLAUDE.md` etiquetadas (`## Para devs nuevos`, `## Para revisores`).

## 5. Uso de `.claude/rules/` para segmentar instrucciones especializadas

* Carpeta `.claude/rules/` con uno o varios `.md`, cada uno enfocado a un tema.
* Útil para evitar un `CLAUDE.md` gigante.
* Ejemplos:
  * `.claude/rules/testing.md` → cómo escribir tests en este repo.
  * `.claude/rules/error-handling.md` → patrón de errores semánticos.
  * `.claude/rules/security.md` → qué nunca tocar sin revisión humana.

### 🧪 Demo 2 — Segmentar reglas de testing

* **Objetivo:** mover reglas específicas a un archivo dedicado para mantener el `CLAUDE.md` legible.
* **Setup:** Notebox con `CLAUDE.md` ya creado en la Demo 1.

**Pasos:**

1.  Crea `.claude/rules/testing.md`:

    ```markdown
    # Reglas de testing — Notebox

    - Tests con `node --test`.
    - Cada test cubre **un** comportamiento, no varios.
    - Nombrar tests con el patrón: `<funcion>: <comportamiento esperado>`.
    - No mockear el storage en tests unitarios del service.
    - Test de integración solo en `test/*.integration.test.ts`.
    ```
2. Quita esas líneas del `CLAUDE.md`.
3.  Pide al agente:

    ```
    Añade un test que cubra que createNote rechaza notas con title vacío.
    ```
4. Observa: el test sigue las convenciones de naming y no mockea storage.

**Qué observar:**

* El agente carga ambos archivos automáticamente.
* Segmentar mejora la mantenibilidad: si cambias el patrón de tests, solo tocas un archivo.

## 6. Funcionamiento de auto memory y qué tipo de aprendizajes conviene permitir

* Auto memory = lo que Claude **almacena por sí mismo** sobre tu forma de trabajar.
* Vive en `~/.claude/memory/` (o equivalente, según versión).
* Tipos típicos:
  * Preferencias del usuario ("siempre quiere respuestas en español, conciso").
  * Patrones del proyecto que se repiten ("este equipo siempre nombra los servicios `*-service.ts`").
* Cuándo desactivarla:
  * Repos con datos sensibles donde el contexto no debe persistir.
  * Empresas con políticas estrictas de retención de datos.

## 7. Cómo corregir a Claude para que acumule patrones útiles y no ruido

Cuando el agente meta la pata:

* **No reformules el prompt enésima vez.** Eso solo alarga la sesión.
* Dile **explícitamente**: _"Recuerda esto: en este repo nunca …"_.
* Mejor: añade la regla a `CLAUDE.md` o `.claude/rules/`.
* Si el patrón es **personal** (cómo te gusta a ti), va a `~/.claude/CLAUDE.md`.
* Si el patrón es **del proyecto**, va al repo (versionado).

### 🧪 Demo 3 — Corregir y observar

* **Objetivo:** ver cómo una corrección bien hecha cambia comportamiento futuro.
* **Setup:** sesión activa en Notebox.

**Pasos:**

1.  Pídele:

    ```
    Añade un endpoint POST /notes/import que reciba un array de notas y las cree.
    ```
2. Si lo hace en una sola pasada y crea todo en `routes/`, párale.
3.  Indícale (en sesión):

    ```
    En este repo, la lógica vive en services/, no en routes/. La ruta solo
    parsea, llama al service y traduce errores. Aplica esto siempre.
    ```
4. Repite la tarea. Observa la separación correcta.
5.  **Persiste la regla** en `CLAUDE.md`:

    ```markdown
    ## Convenciones
    - La lógica vive en `services/`, nunca en `routes/`.
    - `routes/` solo parsea input, llama al service y traduce errores.
    ```
6. Sesión nueva. Pide algo similar. Observa que ya separa correctamente sin recordatorio.

**Qué observar:**

* La corrección en sesión sirve **para esa sesión**.
* Para que sirva mañana, **escríbela** en `CLAUDE.md` o `.claude/rules/`.
* Auto memory puede capturar patrones, pero `CLAUDE.md` es más predecible y auditable.

## 8. Límites de memoria y riesgos de instrucciones demasiado ambiguas

| Antipatrón                     | Por qué falla                                        |
| ------------------------------ | ---------------------------------------------------- |
| "Escribe código limpio"        | Ambiguo, cada uno entiende algo distinto             |
| "Sigue las mejores prácticas"  | El agente improvisa lo que le parece "best practice" |
| "Optimiza para mantenibilidad" | Sin criterios concretos = no hay cambio real         |
| "Que sea profesional"          | Vacuo, no afecta decisiones                          |

**Reglas útiles:**

* Verbos concretos (_usa_, _no uses_, _prefiere_, _evita_).
* Ejemplos cortos (_"En lugar de `throw new Error('not found')`, lanza `NotFoundError`"_).
* Limitar a 1 idea por bullet.

> Si tu regla no se puede traducir a un check de PR review, probablemente es ruido.

## 9. Mantenimiento del contexto como activo vivo del repositorio

* `CLAUDE.md` envejece como cualquier doc: revisarlo en cada cambio importante.
* **Una persona del equipo es responsable** de mantenerlo (puede rotar).
* Reglas que ya no se aplican → eliminar, no comentar.
* Cuando un nuevo miembro pregunta lo mismo dos veces, eso es una regla candidata.
* Convertir el `CLAUDE.md` en parte del onboarding humano: lo que sirve a la IA suele servir a humanos nuevos.

## 10. Estrategias para convertir CLAUDE.md en estándar interno de ingeniería

* **Plantilla compartida** entre repos del equipo (mismas secciones: Arquitectura, Convenciones, Comandos, Reglas).
* **Revisión periódica** — entra en el ciclo de mantenimiento técnico.
* **Pull request gating** — si tu cambio rompe una convención del `CLAUDE.md`, justifícalo en la descripción del PR.
* **Cross-link con ADRs** — decisiones grandes en ADRs, su síntesis en `CLAUDE.md`.
* **Auditar contra la realidad** — periódicamente, pedir al propio agente que revise si el `CLAUDE.md` describe lo que hay en el repo (Tema 13).

> El `CLAUDE.md` bien mantenido **es** el manual de estilo del equipo. Y, de paso, configura a la IA.

***

## Resumen

* Si lo repites más de dos veces, escríbelo en `CLAUDE.md`.
* Reglas concretas y verificables. Nada de _"código limpio"_.
* Subpath > repo > home. Más específico gana.
* `.claude/rules/` para segmentar reglas por tema.
* Auto memory = capa adicional, **no** sustituye al `CLAUDE.md` versionado.
* El `CLAUDE.md` es un activo vivo del repo: alguien lo mantiene.
