---
name: curso-tema-doc
description: Genera los tres componentes de un tema del curso de Claude Code — documentación pública en docs/, guion del instructor en curso/ y ejercicios con ramas en el repo de código. Trigger cuando el usuario pida "haz el tema X", "documenta el tema X", "genera la doc del tema X" o equivalente.
---

# Skill: curso-tema-doc

Un tema completo son **tres componentes sincronizados**. Nunca entregues uno sin los otros.

| Componente | Dónde vive | Destinatario |
|---|---|---|
| Documentación pública | `docs/tema-XX-<slug>.md` + `docs/SUMMARY.md` | Alumnos (GitBook) |
| Guion del instructor | `curso/tema-XX-<slug>/guion.md` | Instructor (privado) |
| Ejercicios en código | Ramas `tema-XX/ejercicio-0N` en `../04 - Claude-codigo` | Alumnos (repo prácticas) |

Además, en `curso/tema-XX-<slug>/` van también:
- `ejercicios.md` — índice de las 3 ramas de ejercicio con descripción breve
- `SOLUCION.md` — soluciones de referencia para el instructor

---

## Inputs

- **Número de tema** (1–27). Si el usuario no lo dice, pregúntalo.
- (Opcional) Indicaciones específicas del usuario para alguna demo o sección.

---

## Fuentes obligatorias antes de escribir

Lee siempre, en este orden:

1. `anexo.md` → título y puntos exactos del tema solicitado.
2. `docs/tema-01-fundamentos.md` → plantilla viva de formato y demos.
3. `docs/SUMMARY.md` → confirma el filename del tema y cross-links.
4. `README.md` + `package.json` del repo Notebox (raíz) → repo de prácticas para las demos.
5. Si existe, el tema anterior y el siguiente en `docs/` → para los bloques "Puente al Tema X".

> Si el filename del tema no aparece en `SUMMARY.md`, **detente y pide confirmación** antes de inventarlo.

---

## COMPONENTE 1 — Documentación pública (`docs/`)

### Reglas inviolables

1. **El título (H1) es el subtítulo de `anexo.md`** en sentence case, precedido de `# Tema X — `.
2. **Cada punto del tema aparece EXACTAMENTE como en `anexo.md`** como `## N. <punto>`. Sin correcciones ni fusiones.
3. **Recompón saltos de línea** del anexo (un punto puede ocupar 2–3 líneas; júntalas).
4. **Duración estimada:** `~60 min`.
5. **No hay sección "Demos prácticas"** al final. Las demos van intercaladas.
6. **No añadir secciones que no estén en el Tema 1** (sin "Recursos", "FAQ", "Ejercicios").
7. **Idioma:** español, tildes correctas, tono directo, segunda persona ("tú").

### Estructura obligatoria

```markdown
---
hidden: true
---

# Tema X — <Subtítulo de anexo.md en sentence case>

> **Duración estimada:** ~60 min
> **Tipo:** <conceptual | práctico | conceptual + demos guiadas>

## Objetivo del tema

<1–2 frases. Qué se lleva el alumno al terminar.>

***

## 1. <Punto 1 EXACTO de anexo.md>

<Contenido esquemático: tabla, bullets, frases punzantes.>

### 🧪 Demo 1 — <Título>

<Bloque de demo según la plantilla de demos.>

### 🧩 Ejercicio 1 — <Título>

<Preview corta del ejercicio según la plantilla de previews.>

## 2. <Punto 2 EXACTO>

...

***

## Resumen

- <4–5 bullets cortos.>
```

### Reglas de estilo

- **Tabla**: comparativas, listas con 2+ columnas equivalentes, pasos paralelos de dos herramientas.
- **Bullets**: casos de uso, riesgos, antipatrones, "qué observar", checkboxes de validación.
- **Prosa**: solo cuando una idea no se descompone en bullets. Máximo 2–3 frases seguidas.
- **Blockquotes** (`> `): frases memorables, avisos, reglas mentales.
- **Cross-links**: cuando un punto se profundiza en otro tema, enlaza usando el filename de `SUMMARY.md`.

### Reglas para las demos en docs/

- **2–3 demos por tema**, no más. Intercaladas, no al final.
- **Formato de demo** (replicar exactamente):

```markdown
### 🧪 Demo N — <Título>

- **Objetivo:** <una frase>.
- **Setup:** <qué tener listo>.

**Pasos:**

1. <…>
2. <…>

**Qué observar:**

- <punto 1>
- <punto 2>
```

- Las demos usan el **repo Notebox** (raíz: `src/`, `test/`, `package.json`). Si necesitan otro repo, especifícalo en Setup.

### Reglas para las previews de ejercicios en docs/

Cada ejercicio del tema tiene también una **preview corta** en `docs/`. La preview es una tarjeta de 1–2 frases que el alumno puede leer antes de la sesión y reutilizar como referencia rápida durante el ejercicio. No reemplaza el `EJERCICIO.md` de la rama, ni el guion del instructor: es un puntero visible desde la doc pública.

- **Una preview por cada ejercicio** del `ejercicios.md` del tema (típicamente 3, más extras si los hay).
- **Placement:** inmediatamente **después** del bloque "Qué observar" de la demo correspondiente (E1 ↔ Demo 1, E2 ↔ Demo 2, E3 ↔ Demo 3). Si hay un ejercicio extra (E4, E5...) sin demo asociada, agrúpalo al final, antes de pasar al siguiente punto del temario.
- **Formato de preview** (replicar exactamente):

```markdown
### 🧩 Ejercicio N — <Título>

> **Rama:** `git checkout tema-XX/ejercicio-0N` · **Tiempo:** XX min · **Tipo:** En clase

<Descripción en 1–2 frases. Qué hace el alumno y qué entrega. Sin "lo que el formador observa" — eso vive en el guion.>
```

- **Tipo:** usa `En clase` para los ejercicios normales del tema. Para ejercicios opcionales escribe `Extra (fuera de sesión)`. Para asíncronos `Asíncrono` (poco habitual — los tres ejercicios estándar siempre son en clase).
- **Tiempo:** debe coincidir con el del guion (`### Ejercicio N (XX min)`) y con la columna del `ejercicios.md`. Si divergen, gana el guion y se actualizan los otros dos.
- **Rama:** debe coincidir literalmente con la rama del repo de código. Si un tema reutiliza una sola rama para todos sus ejercicios (caso tema-01, que tiene solo `tema-01/ejercicio`), repite esa rama en las tres previews.
- **Sin emoji distinto:** 🧩 es la convención para previews de ejercicios; 🧪 está reservado para demos. No mezclarlas.

---

## COMPONENTE 2 — Guion del instructor (`curso/`)

### Regla principal: las demos del guion = las demos de docs/

**El guion no inventa demos distintas.** Usa exactamente los mismos prompts, los mismos archivos y los mismos objetivos que están en la documentación pública. Lo que añade el guion es:

- Timing (cuántos minutos dura cada parte).
- Encuadre verbal (qué dice el instructor antes de empezar).
- Descripción de ejercicios en clase (no están en docs/).
- Notas para el formador (errores comunes, preguntas trampa, variantes).

### Estructura de sesión: batch vs intercalado

Elige según el tipo de tema:

| Cuándo usar **batch** | Cuándo usar **intercalado** |
|---|---|
| Las demos se encadenan y el alumno necesita el cuadro completo para hacer cualquier ejercicio | Cada demo es una técnica autónoma: practicarla en caliente refuerza el hábito |
| Temas conceptuales con interdependencias entre demos | Temas prácticos donde D1→Ej1→D2→Ej2 tiene sentido |

**Plantilla batch:**
```
00:00 — Encuadre              (X min)
00:XX — Demo 1                (X min)
00:XX — Demo 2                (X min)
00:XX — Demo 3                (X min)
00:XX — Ejercicio 1 (clase)   (X min)
00:XX — Ejercicio 2 (clase)   (X min)
00:XX — Ejercicio 3 (clase)   (X min)
XX:00 — Cierre y puente       (5 min)
```

**Plantilla intercalada:**
```
00:00 — Encuadre                   (X min)
00:XX — Demo 1                     (X min)
00:XX — Ejercicio 1 (clase)        (X min)
00:XX — Demo 2                     (X min)
00:XX — Ejercicio 2 (clase)        (X min)
00:XX — Demo 3                     (X min)
00:XX — Ejercicio 3 (clase)        (X min)
XX:00 — Cierre y puente            (5 min)
```

### Secciones del guion

```markdown
# Tema X — <Título>

> Duración estimada: YY min · Tipo: ...
> Repositorio de prácticas: rama `tema-XX/inicio` (notebox, Node 24 + ...).

## 0. Objetivo del tema
<1–2 frases, igual que en docs pero orientado al instructor.>

## 1. Flujo de sesión
<Bloque de código con timing.>

## 2. Encuadre — lo que digo (≈ X min)
<Frase de apertura entre > (cita). 2–3 ideas en pizarra.>

## 3. Demo 1 + Ejercicio 1 — <Título> (≈ XX min)
### Demo 1 (X min)
<Prompt exacto de la demo de docs/. Setup. Lo que el alumno ve. Frase de cierre.>

### Ejercicio 1 (X min)
> **Rama:** `git checkout tema-XX/ejercicio-01`
<Descripción del ejercicio. Lo que el formador observa.>

## 4. Demo 2 + Ejercicio 2 — ...
...

## 5. Demo 3 — ... (solo demo, si aplica)
...

## 6. Ejercicio asíncrono
### Ejercicio 3 — ...
...

## 7. Cierre y puente (≈ 5 min)
<Resumen en pizarra (4 bullets). Frase de puente al tema siguiente.>

## 8. Notas para el formador
<Requisitos técnicos, errores comunes, preguntas trampa, variantes de tiempo.>
```

### Cómo añadir el guion a git

`curso/` está en `.gitignore` del repo docs. Los nuevos archivos en `curso/` deben añadirse con:
```bash
git add -f "curso/tema-XX-<slug>/guion.md"
```

---

## COMPONENTE 3 — Ejercicios en el repo de código (`../04 - Claude-codigo`)

### Principio inviolable

**El ejercicio debe ser ejecutable por el alumno con `git checkout tema-XX/ejercicio-0N && npm install && npm test` — sin configuración manual previa.** Si el ejercicio necesita un escenario (bug, PR a revisar, drift, secretos, conflicto, dependencias desactualizadas, tests problemáticos), ese escenario está **plantado en el código del repo** antes del push, **no instruido en `EJERCICIO.md`**.

> Si el `EJERCICIO.md` dice "si tu copia no tiene X, créalo así..." o "el instructor habrá plantado...", el ejercicio no está terminado. El fixture va en el repo.

### Estructura de ramas

Por cada tema se crean (como mínimo):

| Rama | Propósito |
|---|---|
| `tema-XX/inicio` | Base del repo para la sesión (con los fixtures comunes ya plantados) |
| `tema-XX/ejercicio-01` | Ejercicio 1 (en clase) |
| `tema-XX/ejercicio-02` | Ejercicio 2 (en clase) |
| `tema-XX/ejercicio-03` | Ejercicio 3 (en clase) |

Cuando el ejercicio lo requiera, ramas auxiliares:

| Rama auxiliar | Cuándo |
|---|---|
| `tema-XX/feature-<slug>` | Conflictos de merge: el alumno mergea esta rama contra `tema-XX/ejercicio-0N` y resuelve el conflicto |
| `tema-XX/pr-baseline` (opcional) | Baseline explícita para reviews de PR cuando `tema-XX/inicio` no encaja semánticamente |

> **Los tres ejercicios siempre se hacen en clase.** No hay ejercicios asíncronos.

Para crear una rama:
```bash
# Desde la rama base adecuada (generalmente el inicio del tema o del anterior)
git checkout -b tema-XX/ejercicio-01
```

### Contenido de cada rama

Cada rama tiene, como mínimo, un `EJERCICIO.md` en la raíz con:
1. Objetivo del ejercicio (1–2 frases).
2. Contexto (rama, archivos relevantes, baseline para diffs si aplica).
3. Pasos concretos (numerados, ejecutables sobre el código tal como está).
4. Criterio de éxito ("los tests deben estar en verde", "rellena la tabla", etc.).
5. Preguntas de reflexión.

### Fixtures obligatorios por categoría

Identifica de qué tipo es cada ejercicio y planta el fixture correspondiente **antes** de pushear:

| Tipo de ejercicio | Fixture obligatorio | Dónde vive |
|---|---|---|
| Bug → regresión / hotfix | Bug reproducible en `src/` (ej. `search()` case-sensitive, validación rota) | Estado de `src/` en `tema-XX/inicio` |
| Refactor de duplicación / olores | Código duplicado real, función larga, if/else anidado en `src/` | Estado de `src/` en `tema-XX/inicio` |
| Review de PR | Commits del "PR" encima del baseline, con problemas plantados (validación movida, `console.log`, `throw new Error`, dep nueva sin justificar, tests ausentes) | Cherry-pick en cada `tema-XX/ejercicio-0N`; baseline = `tema-XX/inicio` o `tema-XX/pr-baseline` |
| Conflicto de merge | Rama feature auxiliar con cambio + commit en la rama actual que colisiona en las mismas líneas | `tema-XX/feature-<slug>` + commit plantado en `tema-XX/ejercicio-0N` |
| Secretos / seguridad | `.env` tracked con valores demo, `console.log` que imprime body/headers, error handler que filtra stack | Estado de `src/` y raíz en `tema-XX/inicio` (sacar `.env` del `.gitignore` para tracking) |
| Drift docs ↔ código | README con mentiras verificables (endpoints inventados, scripts que no existen en `package.json`, descripciones falsas) | `README.md` de `tema-XX/inicio` |
| Tests problemáticos | Suite con al menos un test frágil (verifica detalles internos), uno tautológico (assert trivialmente cierto) y uno redundante/parametrizable | `test/` en `tema-XX/inicio` |
| Codemod / breaking change mecánico | Ocurrencias reales del patrón a migrar (ej. `.del(`, `res.send(status)`) en varios archivos de `src/` | Estado de `src/` en `tema-XX/inicio` |
| Dependencias desactualizadas | `package.json` con versiones que disparen `npm outdated` y `npm audit` con señal real | `package.json` de `tema-XX/inicio` |

### Cuándo plantar en `inicio` vs en cada `ejercicio-0N`

- **En `tema-XX/inicio`**: fixtures que valen para varios ejercicios del tema (bug que el ej-01 detecta y el ej-02 arregla; suite con tests problemáticos que se revisan en el ej-03; secretos plantados que se auditan en el ej-01 y mitigan en el ej-02).
- **En cada `tema-XX/ejercicio-0N`** (cherry-pick): cuando el fixture sólo aplica a un ejercicio concreto y enturbiaría los demás. Caso típico: el "PR plantado" que se revisa en los tres ejercicios de code review se cherry-pickea en cada uno, manteniendo `tema-XX/inicio` como baseline limpia para el diff.

### Verificar el ejercicio antes de pushear

Para cada ejercicio:

```bash
git checkout tema-XX/ejercicio-0N
npm install
npm test               # tests verdes (o rojos si el ejercicio espera empezar en rojo — anótalo en el EJERCICIO.md)
# Lanza el primer prompt del EJERCICIO.md. ¿Tiene Claude todo el contexto en el repo para responder?
```

Si el alumno necesita ejecutar un comando que no está en `EJERCICIO.md` para que el ejercicio funcione, el fixture no está completo.

### Qué ignorar

`curso/` debe estar en `.gitignore` de cada rama del repo de código. Verificar que existe la entrada o añadirla. También `.claude/skills/` para evitar trackear skills del autor.

---

## COMPONENTE 4 — Soluciones e índice (`curso/`)

### `ejercicios.md`

Índice sencillo con una línea por ejercicio:

```markdown
# Ejercicios — Tema X

| Ejercicio | Rama | Tipo | Descripción breve |
|---|---|---|---|
| Ejercicio 1 | `tema-XX/ejercicio-01` | En clase | ... |
| Ejercicio 2 | `tema-XX/ejercicio-02` | En clase | ... |
| Ejercicio 3 | `tema-XX/ejercicio-03` | Asíncrono | ... |
```

### `SOLUCION.md`

Soluciones de referencia para el instructor. Incluir:
- Respuestas modelo a cada ejercicio.
- Código correcto cuando aplique.
- Tabla de errores frecuentes y cómo señalarlos en clase.

---

## Convención de filenames

Los slugs están en `docs/SUMMARY.md`. Úsalos tal cual. Referencia:

| Tema | Filename |
|---|---|
| 1 | `tema-01-fundamentos.md` |
| 2 | `tema-02-interfaces.md` |
| 3 | `tema-03-entorno.md` |
| 4 | `tema-04-configuracion.md` |
| 5 | `tema-05-permisos-sandboxing.md` |
| 6 | `tema-06-ides.md` |
| 7 | `tema-07-claude-md-memoria.md` |
| 8 | `tema-08-prompting.md` |
| 9 | `tema-09-skills.md` |
| 10 | `tema-10-exploracion-repos.md` |
| 11 | `tema-11-nuevas-funcionalidades.md` |
| 12 | `tema-12-refactorizacion.md` |
| 13 | `tema-13-testing.md` |
| 14 | `tema-14-documentacion.md` |
| 15 | `tema-15-code-review.md` |
| 16 | `tema-16-seguridad.md` |
| 17 | `tema-17-dependencias-migraciones.md` |
| 18 | `tema-18-git.md` |
| 19 | `tema-19-subagentes.md` |
| 20 | `tema-20-mcp.md` |
| 21 | `tema-21-plugins-hooks.md` |
| 22 | `tema-22-cli-avanzada.md` |
| 23 | `tema-23-docker.md` |
| 24 | `tema-24-devops-cicd.md` |
| 25 | `tema-25-arquitectura.md` |
| 26 | `tema-26-equipo-gobierno.md` |
| 27 | `tema-27-proyecto-final.md` |

> Si `SUMMARY.md` no coincide, **gana `SUMMARY.md`**.

---

## Pasos de ejecución

1. **Leer fuentes.** `anexo.md` + tema-01 + SUMMARY.md + README.md del Notebox.
2. **Verificar filename** en `SUMMARY.md`.
3. **Decidir estructura de sesión.** ¿Batch o intercalada? Ver tabla de criterios.
4. **Diseñar demos** (2–3). Antes de escribir nada: qué se demuestra, dónde va en docs/, qué prompt literal usa.
5. **Escribir `docs/tema-XX.md`** con las demos diseñadas.
6. **Actualizar `docs/SUMMARY.md`** si el tema no estaba enlazado.
7. **Escribir `curso/tema-XX-<slug>/guion.md`** usando los mismos prompts de las demos. Añadirlo con `git add -f`.
8. **Crear ramas y EJERCICIO.md** en `../04 - Claude-codigo` para los 3 ejercicios.
9. **Escribir `curso/tema-XX-<slug>/ejercicios.md`** y **`SOLUCION.md`**. Añadirlos con `git add -f`.
10. **Revisar coherencia** entre los 3 componentes:
    - [ ] Demos en docs/ = demos en guion (mismos prompts, mismos archivos).
    - [ ] Los 3 ejercicios del guion coinciden con las 3 ramas creadas.
    - [ ] Cada ejercicio tiene su **preview** (🧩) en docs/, intercalada tras la demo correspondiente.
    - [ ] Las previews repiten literalmente la rama, el tiempo y el título que aparecen en el guion y en `ejercicios.md`.
    - [ ] Todos los puntos del anexo están en docs/, en orden, con texto exacto.
    - [ ] Hay 2–3 demos intercaladas en docs/, no al final.
    - [ ] `SUMMARY.md` actualizado.
    - [ ] Tildes y español correcto.
    - [ ] **Cada ejercicio es ejecutable end-to-end con `git checkout` sin pasos manuales de setup** (ver tabla de fixtures del Componente 3).
    - [ ] Si `EJERCICIO.md` menciona un bug / PR / drift / feature / secret / dep desactualizada / test problemático, ese escenario está **plantado** en `src/`, en una rama auxiliar o en archivos tracked.
    - [ ] Probaste al menos un ejercicio del tema con `git checkout` limpio antes de hacer push (`npm install && npm test` + primer prompt funciona sin trampas).
11. **Push a `origin`.** El tema no está terminado hasta que las ramas están en remoto. Antes de pushear:
    - [ ] Verificar que NINGUNA rama tracquea `.claude/skills/` con skills del autor (`curso-tema-doc`, `curso-forms`, `gmail-skill`, `google-slides-skill`, u otras que no sean del curso). Comando:
      ```bash
      for b in tema-XX/inicio tema-XX/ejercicio-01 tema-XX/ejercicio-02 tema-XX/ejercicio-03; do
        hits=$(git ls-tree -r "$b" --name-only | grep -E "\.claude/skills/" | wc -l)
        echo "$b: $hits hits"
      done
      ```
      Si hay hits, hacer `git rm -r .claude/skills` + añadir `.claude/skills/` al `.gitignore` antes de pushear.
    - [ ] Para ramas nuevas o que sólo añaden commits (cherry-pick, additive): `git push -u origin tema-XX/inicio tema-XX/ejercicio-01 ...`.
    - [ ] Para ramas que han sido **rebaseadas** (rewriting de history, p. ej. cuando plantas un fixture en `inicio` y rebaseas los ejercicios sobre el nuevo `inicio`): `git push --force-with-lease origin ...`. Nunca `--force` sin `-with-lease`.
    - [ ] Si creaste ramas auxiliares (`tema-XX/feature-<slug>`, `tema-XX/pr-baseline`), pushearlas también.
12. **Reportar** al usuario: qué demos se diseñaron, qué ramas se crearon (con sus URLs en origin), qué fixtures se plantaron y dónde, qué archivos nuevos hay.

---

## Antipatrones

- ❌ Crear demos distintas en el guion y en docs/. Son las mismas demos.
- ❌ Crear solo docs/ sin guion ni ejercicios.
- ❌ Crear solo ejercicios sin docs/ ni guion.
- ❌ Reescribir los puntos del anexo. Son canon.
- ❌ Poner las demos al final en una sección "Demos prácticas".
- ❌ Hacer 4+ demos por tema.
- ❌ Inventar comandos o features de Claude Code que no existan.
- ❌ Crear archivos en `docs/` que no estén en `SUMMARY.md`.
- ❌ Olvidar `git add -f` para archivos en `curso/` (están en .gitignore).
- ❌ Crear ramas en el repo de código sin `curso/` en el `.gitignore` de la rama.
- ❌ Crear el ejercicio en `guion.md` + `ejercicios.md` pero olvidar la preview 🧩 en `docs/`.
- ❌ Copiar la descripción larga del guion en la preview. La preview son 1–2 frases; lo demás vive en el guion.
- ❌ Usar 🧪 para previews de ejercicios o 🧩 para demos. Cada emoji tiene un solo significado.
- ❌ **`EJERCICIO.md` que pide al alumno reproducir el escenario manualmente** ("si tu copia no tiene X, créalo así...", "el instructor habrá plantado..."). El fixture va en el repo.
- ❌ Referenciar `main` en el `EJERCICIO.md` cuando la rama no parte semánticamente de `main`. Usa una baseline explícita (`tema-XX/inicio`, `tema-XX/pr-baseline`).
- ❌ Ejercicio que asume conocimiento de algo plantado pero **no plantado** (bug que no se reproduce, PR que no existe, dependencia que no aparece en `package.json`).
- ❌ Pushear ejercicios sin haber hecho `git checkout` limpio y probado el primer prompt.
- ❌ **Dejar las ramas sin pushear a `origin`.** Sin push, los alumnos no las ven y el tema no está terminado. Es el último paso del flujo, no opcional.
- ❌ Pushear sin verificar antes que `.claude/skills/` no contiene skills del autor. Si se cuelan, hay que limpiar y force-push, que es ruido evitable.
- ❌ Usar `git push --force` sin `-with-lease`. `--force-with-lease` falla si alguien empujó algo nuevo a la rama remota desde tu último fetch; `--force` lo machaca silenciosamente.

---

## Ejemplo canónico

`docs/tema-01-fundamentos.md` → formato y estilo de docs/.
`curso/tema-06-ides/guion.md` + `docs/tema-06-ides.md` → par guion↔docs en sincronía.
`curso/tema-05-permisos-sandboxing/` → carpeta completa con guion + ejercicios + SOLUCION.
