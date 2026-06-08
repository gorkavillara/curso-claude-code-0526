# Tema 24 — DevOps, CI/CD, pipelines y automatización

> Duración estimada: 90 min · Tipo: práctico + demos guiadas.
> Repositorio de prácticas: rama `tema-24/inicio` (Notebox con `.github/workflows/ci.yml` y `release.yml` plantados con olores reales, `scripts/release.sh` sin validaciones, `logs/pipeline-fail.log` con un fallo real de `npm ci` por lockfile desactualizado).

## 0. Objetivo del tema

Que el alumno trate el `.github/workflows/` y los scripts de `scripts/` como **código de producción**: los audite con criterio (seguridad, reproducibilidad, granularidad), los endurezca con validaciones reales (`set -euo pipefail`, working tree, rama, tag, tests), y diagnostique fallos de pipeline aplicando la disciplina del **bloque relevante + 3 hipótesis + verificación**. Claude Code entra como auditor y redactor, no como decisor: qué versión sale o cuándo hacer rollback siguen siendo decisiones humanas con responsable.

---

## 1. Flujo de sesión

Estructura **intercalada**, como los Temas 22 y 23. Cada bloque (CI workflow / release script / pipeline log) es una pieza autónoma y el ejercicio aplica el patrón en caliente.

```
00:00 — Encuadre                                          (5 min)
00:05 — Demo 1: auditar ci.yml, 3 fixes priorizados       (10 min)
00:15 — Ejercicio 1: endurecimiento del workflow          (30 min, en clase)
00:45 — Demo 2: endurecer release.sh con validaciones     (10 min)
00:55 — Ejercicio 2: release.sh + diseño de rollback.sh   (30 min, en clase)
01:25 — Demo 3: diagnóstico de fallo en log de pipeline   (10 min)
01:35 — Ejercicio 3: triage del log plantado              (30 min, en clase)
02:05 — Cierre y puente                                   (5 min)
```

> Nota de timing: el tema cabe en 90 min si los ejercicios bajan a 20 min cada uno. La versión completa son ~125 min y se recomienda en formato bloque de 2h. Si la sesión va corta, recortar el Ejercicio 3 (log triage) a 15 min — el aprendizaje principal está en E1 (auditar workflow) y E2 (script de release).

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "El Tema 23 era el entorno donde corre la app. Hoy damos el siguiente paso: el pipeline que la lleva ahí. GitHub Actions, GitLab CI, jobs de build / test / lint / scan / deploy. Y como cualquier código de producción, los workflows fallan en silencio — un `@v3` que cambia bajo nuestros pies, un permiso de más en el `GITHUB_TOKEN`, un `npm ci` sin cache que dura 4 min cada PR. Lo que vemos en pipeline es la última frontera antes de producción; Claude Code nos ayuda a auditarla con criterio, no a generarla y olvidarla."

Tres ideas en pizarra:

1. **Workflow = código.** Se audita por seguridad, reproducibilidad, granularidad y concurrencia. Actions pinneadas a SHA, `permissions: contents: read`, `concurrency:` con `cancel-in-progress`, jobs separados con `needs:`.
2. **Scripts de release validan antes de actuar.** `set -euo pipefail`, working tree limpio, rama correcta, tag inexistente, tests verdes. El script no decide; ejecuta. El push lo hace el humano.
3. **Logs de pipeline = ruido + señal.** El primer trabajo es identificar el bloque del error real entre 200 líneas de setup. Sin ese filtro, el diagnóstico es adivinación.

> "Hoy vais a tocar **tres ramas**: una para endurecer el workflow de CI plantado, otra para reescribir el `release.sh` y diseñar el `rollback.sh`, otra para diagnosticar un fallo de pipeline a partir de su log. Ninguna requiere ejecutar el pipeline real — los ejercicios entregan los `.md` y los diffs. La verificación con Docker o con un runner real es bonus."

---

## 3. Demo 1 + Ejercicio 1 — Auditoría del workflow de CI (≈ 40 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-24/inicio && npm install && npm test`. Verificar que existe `.github/workflows/ci.yml` con los olores plantados (actions sin pin a SHA, sin cache, sin `permissions`, sin `concurrency`, lint/typecheck/test fusionados en un job único). Abrir el REPL desde la raíz.

**Prompt literal (dentro del REPL):**

```
Audita .github/workflows/ci.yml. Lista los problemas en una tabla con
columnas: olor, riesgo (reproducibilidad / seguridad / coste / DX),
severidad (alta/media/baja). Sin reescribir todavía.
```

(esperar diagnóstico)

```
De los problemas detectados, dame los 3 que más rentan arreglar primero
y por qué. Considera impacto en seguridad, tiempo de pipeline y
feedback al desarrollador.
```

(esperar priorización)

```
Aplica el fix 1 (separar lint / typecheck / test en jobs con needs).
Muéstrame el diff. Explica qué cambia en el feedback del PR.
```

(repetir para fix 2 y 3)

```
Añade permissions: contents: read al workflow y un concurrency: group
por rama con cancel-in-progress: true. Diff antes/después.
```

```
Resuelve cada uses: actions/X@vY a su SHA inmutable y deja el tag
como comentario al lado. Muéstrame el diff completo.
```

Lo que el alumno ve:

- La tabla de olores debe incluir, como mínimo: actions sin SHA pin, sin cache, sin `permissions`, sin `concurrency`, lint/typecheck/test fusionados, `branches: '*'` permisivo, secretos como env global.
- La priorización **debe** apuntar a las tres rentables: `permissions:` mínimas (seguridad), separar jobs (DX), `concurrency:` con cancel (coste). Si el agente prioriza cosmética, redirigir con prompt explícito.
- Separar `lint / typecheck / test` en jobs con `needs:` da feedback granular: un fallo de lint no esconde fallos de tipos. El PR ve tres status checks por separado.
- Pinear a SHA no es paranoia. GitHub lo recomienda explícitamente para workflows que tocan secretos.

> "El workflow no es un script que generamos una vez y olvidamos. Es código. Y como cualquier código, se audita y se versiona. Hoy hacemos esa auditoría con Claude. La próxima vez, en el PR del compañero."

### Ejercicio 1 (30 min)

> **Rama:** `git checkout tema-24/ejercicio-01`

Los alumnos:

> **Nota de plataforma:** la Demo 1 se hace sobre `.github/workflows/ci.yml` en `tema-24/inicio` (GitHub Actions), pero **el ejercicio es sobre GitLab CI** — la rama `tema-24/ejercicio-01` trae un `.gitlab-ci.yml` plantado con los olores equivalentes. El tema cubre ambas plataformas (punto 1 del temario); el patrón de auditoría es el mismo, cambia la sintaxis. Encuadrarlo así: "lo habéis visto en Actions, lo practicáis en GitLab CI; el criterio no cambia".

1. Verifican `npm install && npm test`. Todo en verde (incluido el smoke test `ci-fixtures.test.ts` que valida que el `.gitlab-ci.yml` sigue con los olores plantados).
2. Auditan el `.gitlab-ci.yml` plantado con el primer prompt (tabla de olores).
3. Priorizan los problemas (segundo prompt). Razonan por qué cada uno está donde está.
4. Aplican **los 3 fixes más rentables**, uno a uno, viendo el diff antes de aceptar. Mínimo: separar `lint / typecheck / test` en stages (o jobs con `needs:`), sacar el secreto `NPM_TOKEN` de `variables:` global, añadir `interruptible: true`.
5. Pinean la `image: node:latest` a una versión + digest `@sha256` inmutable (no al tag flotante).
6. Rellenan `CI-AUDIT.md`:
   - Tabla de olores detectados (mínimo 5).
   - Los 3 fixes aplicados con diff antes/después.
   - Sección "Qué dejo para otra iteración" — al menos 2 puntos con justificación.

**Lo que el formador observa:**

- ¿Detectan los olores estructurales (secreto global, sin `interruptible:`, jobs/stages separados) o se quedan en cosmética (renombrar el job)?
- ¿La priorización tiene criterio o es alfabética? Empujar a "qué renta más en términos de seguridad + DX por minuto de trabajo".
- ¿Aceptan el primer diff sin leerlo? Pedir que **antes de cada `aplica`** ya hayan dicho qué esperan ver.
- ¿Entienden que la mitigación del secreto vive en parte fuera del YAML (CI/CD Variables protegidas del proyecto)? Es la trampa conceptual de GitLab: el `.gitlab-ci.yml` no lo cuenta todo.
- ¿Algún alumno propone añadir un job de scan (gitleaks/SAST de GitLab) o de coverage? Buena señal — anotarlo como ejercicio extra.

> "Tres fixes hoy. Lo demás probablemente mañana. La regla del Tema 23 sigue vigente: un cambio, una verificación. Reescribir el workflow entero al primer error es la receta para introducir tres bugs nuevos."

---

## 4. Demo 2 + Ejercicio 2 — Script de release y rollback (≈ 40 min)

### Demo 2 (10 min)

> Setup: `git checkout tema-24/inicio`. Verificar que existe `scripts/release.sh` plantado con olores reales: solo `set -e`, sin validar working tree, sin validar rama, hace `git push --tags` directo sin confirmación.

**Prompt literal (dentro del REPL):**

```
Lee scripts/release.sh. Lista qué validaciones le faltan a un script
de release decente y qué riesgos tiene cada omisión. Tabla con
columnas: validación faltante, riesgo, cómo añadirla.
```

(esperar)

```
Cambia el shebang y el set inicial a -euo pipefail. Valida que se
pasa la versión como primer argumento. Diff antes/después.
```

(esperar)

```
Añade estas validaciones antes de tocar tags, en este orden:
working tree limpio, rama actual = main, tag no existe, npm test
verde. Cada una con un mensaje de error específico y exit code
distinto. Diff completo.
```

(esperar)

```
Reemplaza el git push --tags automático por un echo con el comando
exacto que el dev tiene que ejecutar manualmente. El script crea el
tag local; el push lo decide el humano.
```

(esperar)

```
Repasa el script final. Hay alguna comilla mal puesta, variable
sin entrecomillar, comando que podría fallar silenciosamente?
```

Lo que el alumno ve:

- `set -euo pipefail` no es opcional. `-e` corta al primer fallo, `-u` falla con variables no definidas, `-o pipefail` no enmascara errores en pipes.
- Cada validación con **exit code distinto** facilita debugging en logs de pipeline.
- El script **no** debe pushear el branch automáticamente. Crea el tag, da instrucciones, el humano publica.
- Variables siempre entrecomilladas (`"$VERSION"`, no `$VERSION`). En shell scripts, el descuido aquí es el origen del 90% de bugs sutiles.

> "El script de release no decide. Valida y ejecuta. La decisión de cuándo y qué versión sale es humana. El script se asegura de que **si decides sacar v1.4.0, todo está en su sitio antes de tocar nada**."

### Ejercicio 2 (30 min)

> **Rama:** `git checkout tema-24/ejercicio-02`

Los alumnos:

1. Verifican `npm install && npm test`.
2. Endurecen `scripts/release.sh` con `set -euo pipefail`, validación de argumentos y **al menos 4 validaciones previas**: working tree limpio, rama = main, tag no existe, tests verdes.
3. Reemplazan el `git push --tags` por un `echo` con la instrucción exacta.
4. Crean `scripts/rollback.sh` nuevo (no plantado a propósito — el ejercicio incluye **diseñarlo** desde cero usando Claude como pair):
   - Confirmación interactiva (`read -r confirm`).
   - Verificación de que la versión anterior existe como tag (`git rev-parse v$PREV`).
   - Placeholder con comentario para el comando real de re-deploy.
   - Smoke test post-rollback (`curl -fsS <health>`).
5. Rellenan `RELEASE-NOTES.md`:
   - Tabla de validaciones aplicadas (qué valida, por qué importa, exit code asignado).
   - Diff completo de `release.sh`.
   - Contenido completo de `rollback.sh` propuesto.
   - Respuesta razonada a "¿qué decisión no automatizo nunca y por qué?" — mínimo 2 ejemplos (típicos: qué versión sale, cuándo hacer rollback).

**Lo que el formador observa:**

- ¿Ponen `set -euo pipefail` completo o se quedan en `set -e`? Forzar el `-uo pipefail`.
- ¿Entrecomillan variables (`"$VERSION"`, `"$PREV"`) o las dejan sueltas? Crítico — bug latente.
- ¿El rollback hace confirmación interactiva o ejecuta directo? Si ejecuta directo, discutir el riesgo.
- ¿El smoke test post-rollback tiene `-f` (fail on error)? `curl` sin `-f` devuelve 0 aunque la respuesta sea 500.
- ¿En el `.md` justifican qué no automatizan o lo dejan vacío? El **por qué** vale más que el listado.

> "Una pregunta de control: si tu compañero en guardia tiene que lanzar el rollback a las 3 de la mañana, ¿le sirve este script tal cual lo entregas? ¿Pide confirmación? ¿Le dice qué hacer si el smoke test falla? Esos son los detalles que separan un script que ayuda de uno que mete miedo."

---

## 5. Demo 3 + Ejercicio 3 — Triage de log de pipeline (≈ 40 min)

### Demo 3 (10 min)

> Setup: `git checkout tema-24/inicio`. El repo trae `logs/pipeline-fail.log` plantado con un fallo real: `npm ci` rompe porque el lockfile está desactualizado (mismatch entre `package.json` y `package-lock.json`). Las primeras ~200 líneas son ruido de setup del runner.

**Prompt literal (dentro del REPL):**

```
Lee logs/pipeline-fail.log. Identifica las primeras 20 líneas que
contienen el error real (ignorando el setup del runner). Cítalas
literalmente.
```

(esperar — el agente debe localizar el bloque del `npm ci`)

```
Con esas líneas, dame 3 hipótesis ordenadas por probabilidad sobre
qué está fallando. Para cada una: cómo verificarla en menos de 5 min.
```

(esperar — hipótesis 1 debería ser lockfile desactualizado)

```
Verifica la hipótesis 1 leyendo .github/workflows/ci.yml y
package-lock.json. ¿Coincide el setup con lo que falla en el log?
```

(esperar)

```
Propón el fix mínimo. No lo apliques todavía — quiero ver el diff y
decidir si toco el workflow o regenero el lockfile.
```

(esperar)

```
¿Qué línea del log es la que más rápido habría llevado a la causa?
¿Cómo la buscaría yo la próxima vez (grep, filtro, qué keyword)?
```

Lo que el alumno ve:

- Las primeras 200 líneas del log son **ruido**. Si el alumno pega el log entero al agente, fuerza a leer con keyword.
- El fix no siempre es "regenera el lockfile": a veces el lockfile está bien y el workflow clava una versión vieja de Node, o el `npm ci` viene precedido de un step que toca el package.json. La decisión depende de qué cambió en el PR.
- "Repetir el run" no es hipótesis válida. Si el fallo es reproducible, no es flake.
- Documentar el grep (`grep -n "EUSAGE\|ERESOLVE\|npm ERR" pipeline-fail.log`) es lo que evita el segundo diagnóstico de hora y media.

> "La regla del Tema 23 vuelve, refinada: el primer prompt lleva el bloque relevante del log + el archivo más probable + el comando que falló. Para logs de pipeline el filtro es extra: identificar dónde acaba el setup y empieza el error real. Hoy practicamos ese reflejo."

### Ejercicio 3 (30 min)

> **Rama:** `git checkout tema-24/ejercicio-03`

Los alumnos:

1. Verifican `npm install && npm test`.
2. Leen `logs/pipeline-fail.log` (un job de GitLab Runner) y **localizan el bloque del error real** (sin pegar el log entero al agente).
3. Piden las 3 hipótesis ordenadas por probabilidad.
4. Verifican la hipótesis 1 cruzándola con `.gitlab-ci.yml`, `package.json` y `package-lock.json`.
5. Deciden el fix: ¿regenerar lockfile (`npm install --package-lock-only`), ablandar el `.gitlab-ci.yml` para usar `npm install` en vez de `npm ci`, o ambas cosas? Justificar.
6. Rellenan `PIPELINE-TRIAGE.md`:
   - Bloque del log relevante (citado literal — máximo 30 líneas).
   - Las 3 hipótesis, en orden, con verificación de cada una.
   - Decisión del fix con diff propuesto (`.gitlab-ci.yml` vs lockfile vs ambos).
   - "Qué grep / filtro me habría llevado más rápido al error" — al menos 2 keywords útiles.
   - "Cómo evito que vuelva" — un check de pipeline o convención de equipo.

**Lo que el formador observa:**

- ¿Pegan el log entero al agente o filtran antes? La diferencia decide el resto del ejercicio.
- ¿Aceptan la primera hipótesis sin verificarla en los archivos? Forzar verificación.
- ¿El "cómo evito que vuelva" es accionable o decorativo? "Más cuidado con el lockfile" no cuenta. "Job de pipeline que valida que `npm ci` pasa antes del merge" sí.
- ¿Algún alumno propone un script `scripts/check-lockfile.sh` o un hook pre-commit? Excelente — apuntarlo en el cierre.

> "Un fix sin un patrón documentado es un fix que volverá. La diferencia entre el dev que apaga fuegos eternamente y el que aprende es esa frase final del `.md`: 'la próxima vez busco esto, valido lo otro, y no me come una hora'."

---

## 6. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Workflow = código.** Actions a SHA, `permissions:` mínimas, `concurrency:` con cancel, jobs separados con `needs:`.
2. **Scripts de release validan antes de actuar.** `set -euo pipefail`, working tree, rama, tag, tests. Push manual. Rollback con confirmación + smoke test.
3. **Triage de log = ruido + señal.** Bloque relevante primero, 3 hipótesis, verificación cruzada con workflow + repo. Documentar el patrón para el siguiente.
4. **La IA acelera, no decide.** Qué versión sale, a qué entorno, cuándo hacer rollback — siguen siendo decisiones humanas con responsable.

**Puente al Tema 25:**

> "Hemos llevado el código desde el editor (Temas 1-22) hasta el contenedor (Tema 23) y hasta el pipeline (Tema 24). En el Tema 25 subimos al nivel arquitectónico: cómo Claude Code os ayuda a explorar alternativas de diseño, evaluar trade-offs y redactar ADRs **sin perder el criterio técnico senior**. El agente propone patrones; tú decides cuáles entran al repo."

---

## 7. Notas para el formador

- **Requisito técnico:** Node 24+ para los tests. El pipeline real (runner de GitLab CI) **no se ejecuta** en el ejercicio — el alumno entrega los `.md` y los diffs leyendo y editando los archivos. Si la mayoría de la clase tiene acceso a un proyecto GitLab con CI/CD activo, animar a pushear el `.gitlab-ci.yml` corregido y ver el pipeline. Si no, el aprendizaje principal no depende del runner.

- **Sobre la mezcla de plataformas:** las **demos** del guion (Demo 1 y la verificación de la Demo 3) se hacen sobre `.github/workflows/ci.yml` en `tema-24/inicio` (GitHub Actions), mientras que **los ejercicios** son sobre `.gitlab-ci.yml` (GitLab CI). Es deliberado: el punto 1 del temario cubre ambas plataformas y el objetivo es que el alumno vea el patrón en una y lo aplique en la otra. Si genera confusión, recordar la tabla de equivalencias de la doc.

- **Pregunta típica:** *"¿No es paranoia pinear a SHA en vez de `@v4`?"* → No. GitHub lo recomienda explícitamente en workflows que tocan secretos o producen artifacts. La mayoría de supply-chain attacks recientes con actions pasaron por el cambio silencioso del tag. Dependabot abre el PR cuando hay nueva SHA; no es trabajo extra a futuro.

- **Pregunta típica:** *"`permissions: contents: read` no rompe nada?"* → En un CI de tests, no. Si algún step necesita escribir (crear release, comentar PR), se eleva el permiso **solo en ese job**, no globalmente. Es exactamente lo que recomienda GitHub.

- **Pregunta típica:** *"¿Por qué el script de release no hace `git push` automáticamente?"* → Porque crear un tag local es reversible (`git tag -d`); pushear no. Separar las dos acciones da al humano un punto de revisión antes de publicar. La fricción extra son 5 segundos; el coste de pushear un tag mal es alto.

- **Pregunta típica:** *"`set -euo pipefail` no es overkill?"* → No. `-e` corta al primer fallo, `-u` te avisa de variables tipográficas (`$VERISON` en lugar de `$VERSION`), `-o pipefail` no enmascara errores en pipes (`fallo | tee log` devolvía 0 sin `pipefail`). Tres flags, cero coste, mucho upside.

- **Error común en el Ejercicio 1:** confunden olores estructurales (secreto en `variables:` global, sin `interruptible:`, stages/jobs separados) con cosmética (renombrar el job, reordenar el YAML). Empujar a "qué renta en seguridad + DX por minuto". Recordar que la mitigación del secreto se completa en las *CI/CD Variables* protegidas del proyecto, no solo en el YAML.

- **Error común en el Ejercicio 2:** dejan el `rollback.sh` sin confirmación interactiva o sin `-f` en el `curl` del smoke test. Detectarlo en `RELEASE-NOTES.md`. Si está, discutir el riesgo.

- **Error común en el Ejercicio 3:** pegan el log entero al agente y aceptan la primera adivinanza. Forzar el filtrado previo. Si dicen "el log es muy largo, no sé qué buscar", enseñarles `grep -n -i "error\|fatal\|EUSAGE" logs/pipeline-fail.log` como filtro inicial.

- **Si la sesión va sobrada:** pedir al alumno más rápido que **añada un job de scan (gitleaks)** al workflow del Ejercicio 1 con `continue-on-error: true` y discuta cuándo lo promovería a bloqueante. Práctica adicional, alta densidad pedagógica.

- **Sobre `.claude/skills/`:** sigue valiendo el patrón de temas anteriores. Las skills DEL AUTOR (`curso-tema-doc`, etc.) NO se trackean — están en `.gitignore` del repo de código. Verificar antes de pushear.

- **Sobre runners reales:** si la clase tiene un proyecto GitLab con CI/CD activado y quiere ver el pipeline, advertir que el primer run con el `.gitlab-ci.yml` corregido puede tardar más por el cache vacío. A partir del segundo, se ve la mejora del bloque `cache:` de `~/.npm`.

- **Sobre GitHub Actions:** los ejercicios son sobre `.gitlab-ci.yml`, pero la Demo 1 y la doc dan el contraste con GitHub Actions. Si algún alumno trabaja exclusivamente en GitHub, animarle a traducir el `.gitlab-ci.yml` del Ejercicio 1 a `.github/workflows/ci.yml` como práctica extra y compararlo. El patrón es el mismo (jobs separados, cancelar runs viejos, cache, permisos/secretos mínimos), cambia la sintaxis: `stages`/`needs:` ↔ `jobs`/`needs:`, `interruptible:` ↔ `concurrency: cancel-in-progress`, `variables:` protegidas ↔ `permissions:` + `secrets:`.
