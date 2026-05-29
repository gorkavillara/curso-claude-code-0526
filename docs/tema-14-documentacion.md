# Tema 14 — Documentación técnica, README y ADR

> **Duración estimada:** \~60 min **Tipo:** práctico + demos guiadas

## Objetivo del tema

Generar documentación que se lee y se actualiza, no la que decora el repo. Usar Claude para arrancar el borrador y para detectar drift entre código y docs — pero conservar el criterio de qué merece estar escrito.

***

## 1. Generación de README útiles para arranque y mantenimiento del proyecto

Un README útil contesta cinco preguntas en menos de un minuto:

| Pregunta                  | Sección típica                          |
| ------------------------- | --------------------------------------- |
| ¿Qué hace este proyecto?  | Una frase al principio                  |
| ¿Cómo lo arranco?         | "Quick start": 3 comandos máximo        |
| ¿Cómo está organizado?    | Mapa de carpetas con una línea cada una |
| ¿Cómo testeo y despliego? | "Comandos útiles"                       |
| ¿A quién pregunto?        | "Mantenimiento" — owner y canal         |

> Si la respuesta a "¿qué hace?" tarda más de una línea, el README está mal.

### 🧪 Demo 1 — README desde cero para Notebox

* **Objetivo:** generar un README mínimo útil sin escribir prosa decorativa.
* **Setup:** `git checkout tema-14/inicio`, repo sin README o con uno minimalista.

**Prompt literal:**

```
Genera un README.md para este repositorio. Estructura obligatoria:
1. Una sola frase de qué es (sin marketing).
2. Quick start con máximo 3 comandos.
3. Mapa de carpetas: una línea por cada subcarpeta de src/ y test/.
4. Comandos útiles (test, dev, build, typecheck).
5. Mantenimiento: a quién avisar (déjalo como placeholder).
Cita rutas reales. No inventes scripts que no están en package.json.
```

**Qué observar:**

* Una sola frase para describir el proyecto.
* Comandos copiados de `package.json`, no inventados.
* Sin secciones tipo "Features", "Roadmap", "Contributing" salvo que aporten.
* Mapa de carpetas con rutas reales.

### 🧩 Ejercicio 1 — README mínimo y útil

> **Rama:** `git checkout tema-14/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Genera un README para Notebox siguiendo el formato de la demo. Verifica que cada comando del README **se ejecuta sin error** y que las rutas citadas existen. Recorta lo que no aporta.

## 2. Documentación de módulos, servicios y puntos de extensión

Para módulos internos, lo útil **no es JSDoc en cada función**. Es un `README.md` o `MODULE.md` por módulo con:

* **Responsabilidad** en una frase.
* **API pública** (qué se exporta, no qué se usa internamente).
* **Puntos de extensión:** dónde añadir un nuevo caso sin tocar lo demás.
* **Lo que no debe hacer:** límites explícitos del módulo.

> El "qué no debe hacer" es lo que evita que el módulo se infle. Es la sección más infravalorada.

## 3. Explicación de decisiones arquitectónicas mediante ADRs claros

Un ADR (Architecture Decision Record) responde tres preguntas:

```markdown
# ADR-NNN: <decisión en imperativo>

## Contexto
<problema concreto, datos que conoces, restricciones>

## Decisión
<qué se ha decidido, en una frase>

## Consecuencias
<qué se gana, qué se pierde, qué queda por verificar>
```

Reglas:

* **Una decisión, un ADR.** Si decides 3 cosas, son 3 ADRs.
* **Numerado y eterno.** No se borra: se sustituye con un ADR nuevo que lo deprecate.
* **Decisión presente, no aspiracional.** "Vamos a hacer X" — no "deberíamos plantearnos X".

### 🧪 Demo 2 — Escribir un ADR sobre el storage en memoria

* **Objetivo:** documentar una decisión arquitectónica concreta del repo (por qué storage in-memory).
* **Setup:** misma rama. La decisión existe en el código pero no está documentada.

**Prompt literal:**

```
[CONTEXTO]
El storage de Notebox está implementado en memoria (src/storage/memory.ts).
No hay persistencia entre arranques. Esta es una decisión deliberada del
contexto del curso, no un error.

[OBJETIVO]
Genera el ADR-001 que documenta esta decisión.

[FORMATO]
3 secciones: Contexto, Decisión, Consecuencias.
Máximo media página. Sin prosa decorativa.
```

**Qué observar:**

* "Decisión" en presente: "El storage es in-memory" — no "se considera usar".
* "Consecuencias" incluye lo que se pierde (no hay persistencia) y lo que queda por verificar (cuándo migrar a DB real).
* La decisión está justificada con datos reales del contexto, no con buzzwords.

### 🧩 Ejercicio 2 — ADR sobre una decisión real

> **Rama:** `git checkout tema-14/ejercicio-02` · **Tiempo:** 15 min · **Tipo:** En clase

Identifica una decisión arquitectónica del repo que no está documentada (storage in-memory, errores semánticos, validación en service vs ruta, etc.) y escribe el ADR correspondiente. Máximo media página, las tres secciones.

## 4. Elaboración de guías de onboarding para nuevos desarrolladores

Profundizamos en cómo generar la guía automáticamente en el [Tema 10](tema-10-exploracion-repos.md). Aquí lo importante es **qué humanos deben añadir**:

* Las decisiones de diseño intencionales que no se infieren del código.
* Quién es quién en el equipo y a quién preguntar.
* Las trampas históricas (bugs míticos, áreas embrujadas).

> Lo que la IA puede generar es la parte derivable del código. El resto es trabajo humano y no se delega.

## 5. Documentación de flujos de despliegue, debugging y troubleshooting

Lo más valioso del repo no es cómo se compila. Es **qué hacer cuando algo falla**.

Estructura mínima de `TROUBLESHOOTING.md`:

```markdown
## Síntoma: [descripción observable]
- Causa típica: [...]
- Cómo verificarlo: [comando concreto]
- Solución: [...]
- Si no funciona: [a quién escalar]
```

Una sola página con 5–10 síntomas reales vale más que 50 páginas teóricas.

## 6. Creación de ejemplos de uso para librerías internas y APIs

Para APIs internas, el README debe incluir **al menos un ejemplo end-to-end** por endpoint:

```markdown
## POST /notes
Crea una nota.

curl -X POST http://localhost:3000/notes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Reunión","body":"Notas..."}'

# Respuesta: 201 con la nota creada
```

Reglas:

* **Ejemplo completo y ejecutable.** Sin placeholders del estilo `<TODO>`.
* **Una request, una respuesta esperada.**
* **Casos de error documentados** con su código HTTP.

## 7. Refuerzo de comentarios de código donde realmente aportan

Cuándo escribir un comentario:

| Sí escribir                                                     | No escribir                                              |
| --------------------------------------------------------------- | -------------------------------------------------------- |
| Por qué (decisión no obvia del código)                          | Qué (lo dice el nombre de la función)                    |
| Workaround de un bug externo con link al issue                  | "Esta función crea una nota"                             |
| Invariante no expresada en tipos                                | Repetición del nombre del parámetro                      |
| Trade-off intencional ("usamos O(n²) porque n<100 garantizado") | Decoración tipo `// ============= helpers =============` |

> Si quitar el comentario no confunde a nadie, sobraba.

## 8. Sincronización entre documentación y comportamiento actual del sistema

El antipatrón clásico: el README dice "soportamos X" pero X se quitó hace 6 meses.

Cómo detectar drift:

```
Compara el README.md de este repositorio con el estado actual del código.
Identifica:
- Comandos que ya no funcionan o no existen en package.json.
- Endpoints documentados que no están implementados.
- Endpoints implementados que no están documentados.
- Convenciones descritas que el código ya no cumple.
Cita ruta y línea para cada inconsistencia.
```

> El drift entre docs y código es una forma especialmente cara de mentir. Hace que un dev nuevo no sepa qué es verdad.

### 🧪 Demo 3 — Detectar drift entre README y código

* **Objetivo:** identificar y reparar inconsistencias entre docs y código.
* **Setup:** misma rama. README con drift introducido a propósito.

**Prompt literal:**

```
Compara README.md con el estado actual de src/ y package.json.
Identifica las inconsistencias en una tabla: descripción del drift,
qué dice el README, qué hay en el código, propuesta de fix (actualizar
docs o actualizar código).
```

**Qué observar:**

* Claude detecta comandos del README que no están en `package.json`.
* Distingue entre "actualizar docs" y "actualizar código" según el caso.
* Cita rutas y líneas concretas.

### 🧩 Ejercicio 3 — Detectar y reparar drift

> **Rama:** `git checkout tema-14/ejercicio-03` · **Tiempo:** 15 min · **Tipo:** En clase

Detecta las inconsistencias entre `README.md` y el estado actual del repo. Entrega una tabla (drift, dice docs, hay en código, fix) y aplica al menos 2 fixes. Verifica que tras los cambios el README ya no miente.

## 9. Revisión crítica de texto generado para evitar documentación vacía

Señales de documentación generada que no aporta:

* "Este módulo es responsable de manejar la lógica de..." (vacío).
* "Es importante notar que..." (prefiere imperativo directo).
* Listas que repiten lo que ya se ve en el código.
* Secciones tipo "Conclusión" en un README.

> Si el texto sobrevive a ser borrado entero, no hacía falta escribirlo.

## 10. Conversión de Claude Code en apoyo sistemático a la memoria técnica del equipo

Usos sistemáticos:

* **Generar borradores** de README, ADR y troubleshooting que un humano revisa.
* **Detectar drift** periódicamente (mensual, antes de releases).
* **Convertir conversaciones de Slack** en ADRs cuando la decisión es importante.
* **Mantener guías de onboarding** actualizadas tras grandes refactors.

Lo que sigue siendo humano:

* Decidir qué merece estar documentado.
* Decir quién es el dueño.
* Las trampas históricas que no están en el código.

***

## Resumen

* README útil = 5 preguntas contestadas en 1 minuto.
* ADR = una decisión, presente imperativa, consecuencias incluidas.
* "Qué no debe hacer" un módulo es la sección más infravalorada.
* Comentarios solo donde explican el **por qué**, no el qué.
* Drift entre docs y código = mentir. Detéctalo cada release.
* Claude genera el borrador. Tú decides qué merece estar escrito.
