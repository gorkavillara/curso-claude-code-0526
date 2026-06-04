# Tema 24 — DevOps, CI/CD, pipelines y automatización del ciclo de entrega

> **Duración estimada:** \~90 min **Tipo:** práctico + demos guiadas

## Objetivo del tema

Usar Claude Code como copiloto del pipeline: auditar workflows de GitHub Actions y GitLab CI con criterio de seguridad y reproducibilidad, generar scripts de release y rollback con validaciones reales, y diagnosticar fallos de pipeline a partir de logs. Al terminar, el alumno trata el `.github/workflows/` y los scripts de `scripts/` como **código de producción** — se revisan en PR, se versionan, se prueban — en lugar de tocarlos a ciegas hasta que "pasa el pipeline".

***

## 1. Revisión y creación de workflows de GitHub Actions y GitLab CI

Un workflow mal hecho **no falla**: pasa en verde y deja deuda invisible — actions sin pinear que cambian bajo los pies, secretos al alcance de cualquier step, `npm install` sin cache que dura 4 minutos cada PR, runs antiguos que siguen quemando minutos cuando ya hay un push más reciente.

| Olor en un workflow                               | Síntoma visible                                      | Coste real                                               |
| ------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| `uses: actions/checkout@v4` sin pin a SHA         | "Funcionaba ayer, hoy falla por la cara"             | Supply-chain attacks invisibles, builds no reproducibles |
| `actions/setup-node@v3` ya deprecado              | Warnings en el log, runner viejo                     | Romperá en silencio cuando GitHub jubile la action       |
| Sin `cache:` ni `actions/cache@v4` para `~/.npm`  | Cada job baja deps desde cero                        | Pipelines de 6 min para tests de 30 s                    |
| Un único job que hace `lint && typecheck && test` | Un fallo de lint enmascara los de test               | Sin paralelismo, sin feedback granular                   |
| Sin `permissions:` declaradas en el workflow      | El `GITHUB_TOKEN` tiene `write` en todo              | Cualquier dependencia comprometida escribe en el repo    |
| Sin `concurrency:` con `cancel-in-progress`       | Cada push abre un run nuevo sin cancelar el anterior | Runs zombis comiendo minutos del plan                    |
| `branches: [main, master, develop, '*']`          | Workflow corre en cualquier rama, incluida WIP       | Minutos quemados en código no listo                      |
| Secretos pasados como `env:` global               | Cada step, lint incluido, ve el token                | Filtrable con un `console.log(process.env)` accidental   |

> Regla mental: **el workflow es código y vive como código** — en PR, con un revisor, con tests. Las acciones de terceros se tratan como dependencias: pinneadas a SHA, no a `@v3`.

Lo que se pide al agente cuando audita un workflow:

* **Reproducibilidad:** ¿las actions están pinneadas a SHA, hay cache de deps, las versiones de runner (`ubuntu-22.04` no `ubuntu-latest`) están fijadas?
* **Permisos mínimos:** ¿hay `permissions:` declaradas (idealmente `contents: read`), o el token tiene `write` en todo?
* **Granularidad:** ¿lint, typecheck y test viven en jobs separados con `needs:` razonable o en uno solo que enmascara fallos?
* **Concurrencia:** ¿`concurrency:` cancela runs antiguos del mismo PR o se acumulan en cola?
* **Disparadores:** ¿el `on:` se limita a `push` a ramas relevantes y `pull_request`, o corre en cada commit a cualquier rama?

### Equivalencias GitHub Actions ↔ GitLab CI

| Concepto            | GitHub Actions                                      | GitLab CI                                   |
| ------------------- | --------------------------------------------------- | ------------------------------------------- |
| Unidad de ejecución | `job` con `steps:`                                  | `job` con `script:`                         |
| Action reusable     | `uses: org/action@sha`                              | `include:` de plantillas, o imágenes Docker |
| Cache de deps       | `actions/cache@v4` o `cache:` en `setup-node`       | `cache:` con `key:` y `paths:`              |
| Secretos            | `secrets.X` (env por step)                          | `variables:` protegidas en project settings |
| Concurrencia        | `concurrency: group: ..., cancel-in-progress: true` | `interruptible: true` en el job             |
| Permisos del token  | `permissions:` por workflow/job                     | `CI_JOB_TOKEN` con scopes en settings       |

### 🧪 Demo 1 — Auditar un workflow de CI plantado y endurecerlo en pasos verificables

* **Objetivo:** convertir un `.github/workflows/ci.yml` con olores reales (actions flotantes, sin cache, sin `permissions`, sin `concurrency`, lint/typecheck/test fusionados) en un workflow auditado y endurecido, dejando trazabilidad en un `CI-AUDIT.md`.
* **Setup:** rama `tema-24/inicio`. El repo trae `.github/workflows/ci.yml` plantado con los olores listados. Existe también `.github/workflows/release.yml` minimal y `scripts/release.sh` plantado.

**Pasos:**

1.  Desde el REPL, pedir un diagnóstico estructurado:

    ```
    Audita .github/workflows/ci.yml. Lista los problemas en una tabla con
    columnas: olor, riesgo (reproducibilidad / seguridad / coste / DX),
    severidad (alta/media/baja). Sin reescribir todavía.
    ```
2.  Pedir la priorización con criterio:

    ```
    De los problemas detectados, dame los 3 que más rentan arreglar primero
    y por qué. Considera impacto en seguridad, tiempo de pipeline y
    feedback al desarrollador.
    ```
3.  Aplicar los 3 fixes en orden, uno a uno, verificando cada uno:

    ```
    Aplica el fix 1 (separar lint / typecheck / test en jobs con needs).
    Muéstrame el diff. Explica qué cambia en el feedback del PR.
    ```
4.  Pedir el bloque `permissions:` mínimo y el `concurrency:` correcto:

    ```
    Añade permissions: contents: read al workflow y un concurrency: group
    por rama con cancel-in-progress: true. Diff antes/después.
    ```
5.  Pinear actions a SHA específico (no a `@v4`):

    ```
    Resuelve cada uses: actions/X@vY a su SHA inmutable y deja el tag
    como comentario al lado. Muéstrame el diff completo.
    ```

**Qué observar:**

* La tabla de olores debe priorizar **seguridad y reproducibilidad** sobre cosmética. Si el agente pone "renombrar el job" arriba, hay que corregir el criterio en el prompt.
* Separar `lint / typecheck / test` en jobs con `needs:` da feedback granular: un fallo de lint no esconde fallos de tipos. El PR ve los tres status checks por separado.
* `permissions: contents: read` no rompe nada en un CI normal; reduce drásticamente lo que puede hacer un script comprometido. Si alguna step necesita `write` (subir release notes, comentar PR), se eleva **solo en ese job**.
* Pinear a SHA no es paranoia: GitHub recomienda explícitamente hacerlo en workflows que tocan secretos o producen artifacts.

### 🧩 Ejercicio 1 — Auditoría y endurecimiento del workflow de CI

> **Rama:** `git checkout tema-24/ejercicio-01` · **Tiempo:** 30 min · **Tipo:** En clase

Audita el `.github/workflows/ci.yml` plantado, prioriza los problemas en una tabla y aplica los 3 fixes más rentables, justificando cada uno. Entrega `CI-AUDIT.md` con la tabla de olores, los fixes aplicados (con diff antes/después), el bloque `permissions:` mínimo elegido y una sección "qué dejaría para una siguiente iteración".

***

## 2. Asistencia en pipelines de build, test, lint, scan y deploy

Cada etapa del pipeline tiene una función distinta y se diseña con criterios diferentes. Mezclarlas en un único job es el error más común.

| Etapa                  | Qué valida                                    | Falla rápido si...                               | Antipatrón                                                  |
| ---------------------- | --------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| **Build**              | El código compila y los artifacts se generan  | Hay error de sintaxis o falta una dep            | Construir dentro del job de tests, sin separar              |
| **Lint**               | Convenciones de estilo y reglas estáticas     | Una regla configurada se viola                   | Bloquear el merge por reglas no acordadas con el equipo     |
| **Typecheck**          | El tipo system es coherente                   | Hay `any` no justificado, tipos faltantes        | Saltarlo "porque el test ya cubre" — no es lo mismo         |
| **Test**               | Comportamiento esperado en unit + integración | Una assertion falla o tarda más de lo razonable  | Tests con `sleep(5)`, tests que dependen del orden          |
| **Scan** (SAST / deps) | Vulnerabilidades conocidas en código o deps   | Hay un CVE crítico nuevo o un secreto en el diff | Fallar el pipeline por CVEs `medium` sin contexto           |
| **Deploy**             | El artifact se publica al entorno correcto    | El smoke test post-deploy no responde            | Deployar desde cualquier rama, sin gating ni `environment:` |

> Regla mental: **un pipeline son etapas con criterios distintos**. Si todas fallan o pasan a la vez, no hay pipeline: hay un script largo disfrazado.

### Patrones útiles

* **`needs:` para gating real:** `test` necesita `build`, `deploy` necesita `test`. Si `build` falla, el resto no corre. Si `test` falla, no se gasta minuto en deploy.
* **Jobs paralelos cuando son independientes:** `lint` y `typecheck` pueden correr a la vez. No se gana nada haciéndolos secuenciales.
* **`continue-on-error: true`** para etapas exploratorias (un `scan` nuevo en evaluación): se ve el resultado, no bloquea, hasta que se decide promoverlo.
* **`environment:` con reglas de protección:** `deploy-prod` con required reviewers, ventana horaria, secretos específicos. Es la frontera entre "el pipeline puede" y "el pipeline debe pedir permiso".

### Antipatrones frecuentes

* ❌ Un único job `ci` con `npm run lint && npm run typecheck && npm test && npm run build`. Falla uno, no sabes el estado de los otros.
* ❌ `npm run scan` que falla por CVEs `low/medium` sin que el equipo haya decidido qué bloquea. Resultado: `if: always()` o `continue-on-error` puesto en pánico, y el scan no protege de nada.
* ❌ Deploy disparado por `push` a `main` sin smoke test post-deploy: si el deploy "termina ok" pero la app no responde, nadie se entera hasta el cliente.
* ❌ Test job que no produce artifact de cobertura ni de informe: cuando falla en CI y pasa en local, no hay forma de comparar.

***

## 3. Generación de scripts de soporte para release y rollback

Un release manual es un release frágil. Un `scripts/release.sh` versionado, con validaciones, deja claro **qué pasa y en qué orden** — y permite repetirlo sin depender de la memoria del que lo lanzó la última vez.

| Validación previa al release                        | Por qué importa                                    |
| --------------------------------------------------- | -------------------------------------------------- |
| Working tree limpio (`git diff --quiet`)            | Evita publicar cambios no commiteados              |
| Rama correcta (`main` / `release/*`)                | Evita releases accidentales desde feature branches |
| Tests verdes (`npm test`)                           | El release nunca sale en rojo                      |
| Tag no existente (`git rev-parse vX.Y.Z` falla)     | Evita pisar un release anterior                    |
| Changelog actualizado                               | El release tiene narrativa, no solo número         |
| Login en el registry (`npm whoami`, `docker login`) | Falla antes de empezar, no a mitad                 |

> Regla mental: **el script de release no decide; valida y ejecuta**. La decisión de cuándo y qué versión sale es humana. El script se asegura de que **si decides sacar `v1.4.0`, todo está en su sitio antes de tocar nada**.

### Anatomía de un `release.sh` razonable

```bash
#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Uso: $0 <version>  (ej: 1.4.0)" >&2
  exit 1
fi

# 1. Validaciones que fallan rápido (sin tocar nada).
git diff --quiet || { echo "Working tree sucio" >&2; exit 2; }
[[ "$(git rev-parse --abbrev-ref HEAD)" == "main" ]] || { echo "No estás en main" >&2; exit 3; }
git fetch --tags
git rev-parse "v$VERSION" >/dev/null 2>&1 && { echo "Tag v$VERSION ya existe" >&2; exit 4; }

# 2. Tests verdes antes de tocar versionado.
npm ci
npm test

# 3. Bump + tag + push del tag (no push del branch — eso es decisión humana).
npm version "$VERSION" --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore(release): v$VERSION"
git tag -a "v$VERSION" -m "Release v$VERSION"

echo "Tag v$VERSION creado localmente. Revisa el commit y haz: git push origin main --follow-tags"
```

### Anatomía de un `rollback.sh` razonable

Un rollback no es "revertir el commit": es **volver a un estado conocido y verificable**. Idealmente: re-deploy del artifact de la versión anterior, no rebuild.

```bash
#!/usr/bin/env bash
set -euo pipefail

PREVIOUS="${1:-}"
[[ -n "$PREVIOUS" ]] || { echo "Uso: $0 <version-anterior>" >&2; exit 1; }

# 1. Verifica que la versión anterior existe como tag y como artifact publicado.
git rev-parse "v$PREVIOUS" >/dev/null 2>&1 || { echo "Tag v$PREVIOUS no existe" >&2; exit 2; }

# 2. Confirma humano antes de actuar.
echo "Vas a hacer rollback a v$PREVIOUS. ¿Seguro? (y/N)"
read -r confirm
[[ "$confirm" == "y" ]] || { echo "Cancelado"; exit 0; }

# 3. Re-deploy del artifact anterior (ejemplo: imagen Docker o release de npm).
echo "Re-deployando v$PREVIOUS..."
# docker pull registry/notebox:$PREVIOUS && ...
# kubectl set image deployment/notebox notebox=registry/notebox:$PREVIOUS

# 4. Smoke test post-rollback.
sleep 5
curl -fsS https://notebox.example.com/health || { echo "Smoke test FALLÓ tras rollback"; exit 5; }
echo "Rollback a v$PREVIOUS completado y verificado."
```

### 🧪 Demo 2 — Endurecer un `release.sh` plantado con validaciones

* **Objetivo:** partir de un `scripts/release.sh` plantado **sin validaciones** (sube tag y push sin comprobar nada) y endurecerlo con working tree limpio, rama correcta, tag inexistente, tests verdes y mensaje final que no haga push del branch automáticamente.
* **Setup:** rama `tema-24/inicio`. El repo trae `scripts/release.sh` plantado, ejecutable, con olores reales: `set -e` solo (sin `-u` ni `-o pipefail`), sin validar working tree, sin validar rama, hace `git push --tags` sin pedir confirmación.

**Pasos:**

1.  Pedir el diagnóstico inicial:

    ```
    Lee scripts/release.sh. Lista qué validaciones le faltan a un script
    de release decente y qué riesgos tiene cada omisión. Tabla con
    columnas: validación faltante, riesgo, cómo añadirla.
    ```
2.  Añadir el preludio `set -euo pipefail` y validar argumentos:

    ```
    Cambia el shebang y el set inicial a -euo pipefail. Valida que se
    pasa la versión como primer argumento. Diff antes/después.
    ```
3.  Añadir las 4 validaciones previas, en orden de coste:

    ```
    Añade estas validaciones antes de tocar tags, en este orden:
    working tree limpio, rama actual = main, tag no existe, npm test
    verde. Cada una con un mensaje de error específico y exit code
    distinto. Diff completo.
    ```
4.  Cambiar el push final a impresión de instrucción para el humano:

    ```
    Reemplaza el git push --tags automático por un echo con el comando
    exacto que el dev tiene que ejecutar manualmente. El script crea el
    tag local; el push lo decide el humano.
    ```
5.  Revisar el resultado con `shellcheck` mental:

    ```
    Repasa el script final. Hay alguna comilla mal puesta, variable
    sin entrecomillar, comando que podría fallar silenciosamente?
    ```

**Qué observar:**

* `set -euo pipefail` no es opcional en scripts de release. `-e` corta al primer fallo, `-u` falla con variables no definidas, `-o pipefail` no enmascara errores en pipes.
* Cada validación tiene un **exit code distinto**: facilita debugging en logs de pipeline (`exit 2` = working tree sucio es distinto de `exit 4` = tag ya existe).
* El script **no** debe pushear el branch automáticamente. Crea el tag, da las instrucciones, y el humano decide cuándo publicar.
* Si el agente propone añadir `trap` para limpieza, valorarlo: en un release típico no hace falta, pero en uno que toque artifacts (uploads parciales, builds en `/tmp`) sí.

### 🧩 Ejercicio 2 — Endurecimiento de un script de release y diseño de su rollback

> **Rama:** `git checkout tema-24/ejercicio-02` · **Tiempo:** 30 min · **Tipo:** En clase

Endurece el `scripts/release.sh` plantado con `set -euo pipefail`, validación de argumentos y al menos 4 validaciones previas (working tree, rama, tag, tests). Después, **diseña `scripts/rollback.sh`** con confirmación interactiva, verificación de que la versión anterior existe como tag, y un smoke test post-rollback. Entrega `RELEASE-NOTES.md` con: tabla de validaciones aplicadas (qué, por qué, exit code), diff de `release.sh`, contenido completo de `rollback.sh` propuesto, y respuesta razonada a "¿qué decisión no automatizo nunca y por qué?".

***

## 4. Análisis de logs de pipeline y diagnóstico de fallos recurrentes

Los logs de pipeline son el equivalente a los logs de contenedor del Tema 23, pero con una diferencia clave: están **enmascarados por la verbosidad del runner** — setup de Node, instalación de deps, configuración del action, todo antes del error real.

| Tipo de fallo                                | Dónde mirar primero                       | Estrategia con Claude                                                    |
| -------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| **Build error** (`tsc`, `webpack`)           | Step "Build" → última línea no-info       | Pegar **solo** las 20–30 líneas alrededor del error, no el log completo  |
| **Test flake** (a veces verde, a veces rojo) | Comparar runs anteriores del mismo branch | Pedir "patrones comunes entre los 3 últimos fallos" — no solo este       |
| **Dependency error** (`npm ci` rompe)        | Comparar `package-lock.json` reciente     | "¿Qué cambió en deps en este PR vs main?"                                |
| **Permission / secret error**                | Step concreto, fallos `403`/`401`         | "¿Qué permisos pide este step y qué `permissions:` declara el workflow?" |
| **Timeout / OOM**                            | `runs-on` + `timeout-minutes`             | Heurística: "¿qué cambió en tamaño de input desde el último run verde?"  |

> Regla mental: **el log de pipeline es ruido + señal**. El primer trabajo es identificar dónde acaba el setup y empieza el error real. El agente lee esos 500 líneas más rápido que tú, pero solo si le das el bloque correcto.

### Antipatrones del análisis de logs

* ❌ Pegar el log completo (3.000 líneas) y pedir "qué falla". El agente se ahoga; tú también.
* ❌ Pegar solo "Error: 1" y esperar diagnóstico. Sin contexto inmediato (10–20 líneas previas), es adivinación.
* ❌ Repetir el run "a ver si pasa esta vez" sin entender por qué falló. Si pasa la segunda vez sin cambios, es **flake** — anótalo y atácalo, no lo ignores.
* ❌ Comparar el log fallido con tu memoria de un log verde de hace dos semanas. Compara contra el último run verde concreto, en archivo, no de cabeza.

### 🧪 Demo 3 — Diagnosticar un fallo de pipeline a partir de un log plantado

* **Objetivo:** leer un `logs/pipeline-fail.log` plantado, identificar el bloque relevante (ignorando el ruido de setup), pedir 3 hipótesis ordenadas, verificar la correcta cruzándola con el workflow y el código, y proponer un fix justificado.
* **Setup:** rama `tema-24/inicio`. El repo trae `logs/pipeline-fail.log` plantado con un fallo de pipeline real (`npm ci` rompe porque el lockfile está desactualizado), precedido por \~200 líneas de setup ruidoso del runner.

**Pasos:**

1.  Localizar el bloque relevante sin pegar todo el log:

    ```
    Lee logs/pipeline-fail.log. Identifica las primeras 20 líneas que
    contienen el error real (ignorando el setup del runner). Cítalas
    literalmente.
    ```
2.  Pedir las 3 hipótesis ordenadas:

    ```
    Con esas líneas, dame 3 hipótesis ordenadas por probabilidad sobre
    qué está fallando. Para cada una: cómo verificarla en menos de 5 min.
    ```
3.  Verificar la hipótesis 1 contra el workflow y el repo:

    ```
    Verifica la hipótesis 1 leyendo .github/workflows/ci.yml y
    package-lock.json. ¿Coincide el setup con lo que falla en el log?
    ```
4.  Aplicar el fix mínimo (regenerar `package-lock.json` o ajustar el step de install):

    ```
    Propón el fix mínimo. No lo apliques todavía — quiero ver el diff y
    decidir si toco el workflow o regenero el lockfile.
    ```
5.  Documentar el patrón para el siguiente fallo similar:

    ```
    ¿Qué línea del log es la que más rápido habría llevado a la causa?
    ¿Cómo la buscaría yo la próxima vez (grep, filtro, qué keyword)?
    ```

**Qué observar:**

* Las primeras 200 líneas del log son **ruido** (setup del runner, descarga de actions, `node --version`). El error vive en un bloque de 20 líneas hacia la mitad. Si el alumno pega el log entero al agente, fuerza a leer con keyword (`error`, `EUSAGE`, `EEXIST`).
* El fix no siempre es "regenera el lockfile": a veces el lockfile está bien y el workflow es el que clava una versión vieja de Node. La decisión depende de qué cambió en el PR.
* "Repetir el run" no aparece como hipótesis válida. Si el fallo es reproducible (mismo log, mismas líneas), no es flake — es bug. Si es intermitente, hay que ir a comparar varios runs.
* Documentar el patrón es lo que evita el segundo diagnóstico de hora y media: la próxima vez que aparezca `npm ci` rompiendo en CI, el grep "EUSAGE" lo lleva en segundos.

### 🧩 Ejercicio 3 — Diagnóstico de un fallo de pipeline real

> **Rama:** `git checkout tema-24/ejercicio-03` · **Tiempo:** 30 min · **Tipo:** En clase

Lee el `logs/pipeline-fail.log` plantado, identifica el bloque del error real (sin pegar las 3.000 líneas al agente), pide 3 hipótesis ordenadas y verifícalas contra `.github/workflows/ci.yml` y `package.json`/`package-lock.json`. Aplica el fix razonado y deja documentado el patrón. Entrega `PIPELINE-TRIAGE.md` con: bloque del log relevante (citado), 3 hipótesis con su verificación, decisión sobre el fix (workflow vs lockfile vs ambos) con diff, y "qué grep o filtro habría llevado más rápido al error".

***

## 5. Refuerzo de convenciones de calidad antes del merge a ramas protegidas

Una rama protegida es la última frontera antes de producción. **Lo que no falla aquí, no falla en ningún lado.** El pipeline en PR es el guardián; las reglas de branch protection son el cerrojo.

| Convención típica         | Cómo se materializa                                             | Riesgo si falta                                                      |
| ------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| Tests verdes obligatorios | `Required status checks` en GitHub / `merge requests` en GitLab | Merge con tests rojos = bug en `main`                                |
| Cobertura mínima          | Job de coverage que falla si baja del umbral                    | "Cobertura del 30% es suficiente" hasta que un bug pasa por el hueco |
| Review obligatoria        | `Require pull request reviews before merging`                   | Cambios sin revisar entran a producción                              |
| Lint y typecheck verdes   | Status checks separados                                         | Deuda visual y de tipos acumulada                                    |
| Sin secretos en el diff   | Job de `gitleaks` o `trufflehog` en el PR                       | Tokens en el repo = revocación urgente                               |
| Conventional commits      | Job que valida el título del PR                                 | Changelog manual y release notes inconsistentes                      |
| Histórico limpio          | `Require linear history` o squash merge obligatorio             | `main` con commits revertidos, ruido en `git log`                    |

> Regla mental: **lo que importa, se mide; lo que se mide, se protege**. Si una regla no está como `required status check`, no es una regla — es una sugerencia que se ignora cuando hay prisa.

Claude Code ayuda aquí como **redactor de los status checks que faltan**: lee las branch protection rules, las compara con el `.github/workflows/`, y señala qué reglas están "soft" cuando deberían ser "hard". También redacta el job de coverage o de scan que cubre el hueco — pero **la decisión de qué bloquea el merge sigue siendo humana**.

***

## 6. Integración de Claude Code con estándares de release engineering

Release engineering tiene vocabulario propio: **semantic versioning, conventional commits, changelogs generados, environments con gating, release notes**. Claude Code es buen redactor de cada pieza siempre que tú le des el estándar.

| Pieza              | Estándar habitual                                  | Lo que Claude aporta                                                                   |
| ------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Versión            | `semver` (`MAJOR.MINOR.PATCH`)                     | Decide bump correcto leyendo el diff (`feat` → minor, `fix` → patch, breaking → major) |
| Commit messages    | `conventional commits` (`feat:`, `fix:`, `chore:`) | Reformatea commits sueltos al estándar; valida que el PR usa el prefijo                |
| Changelog          | `keepachangelog.com` o generado de commits         | Agrupa commits por tipo, escribe la sección humana                                     |
| Release notes      | Plantilla del equipo                               | Resume diff técnico en lenguaje de producto                                            |
| ADR                | `architecture decision records`                    | Redacta el ADR con contexto, decisión, consecuencias                                   |
| Tag y release page | `git tag` + GitHub release                         | Pega el changelog en la release page con formato                                       |

> Regla mental: **la IA acelera la redacción, no decide la política**. Quién decide qué es un breaking change, qué entra en este release y qué espera al siguiente, sigue siendo el tech lead o el release manager.

### Antipatrones de release engineering con IA

* ❌ Pedir "bumpea la versión" sin que el equipo tenga regla de semver clara. Claude inventa una y nadie sabe si es correcta.
* ❌ Generar el changelog desde 50 commits con mensajes ad-hoc (`"arreglos"`, `"varios"`). Si el input es basura, el output también.
* ❌ Delegar la release note final sin revisarla: la IA describe qué cambió, no por qué le importa al cliente.
* ❌ Confundir "el agente sabe hacer un release" con "el agente puede hacer un release". Lo primero es cierto; lo segundo requiere que tu equipo lo haya decidido y los permisos lo permitan.

***

## 7. Automatización de tareas repetitivas de mantenimiento del pipeline

Cada semana el pipeline pide pequeño mantenimiento: actualizar versiones de actions, regenerar lockfiles tras deps nuevas, regrabar fixtures expirados, rotar caches. Son tareas mecánicas, repetitivas, y por eso se delegan mal.

| Tarea repetitiva                                           | Cómo automatizarla razonablemente                                 |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| Actualización de actions (`@v3` → `@v4`)                   | `dependabot` para actions + revisión humana del PR generado       |
| Renovación de SHA pinneadas                                | Job semanal que abre PR con SHA actualizadas                      |
| Limpieza de runs antiguos                                  | Workflow `on: schedule` que borra runs > 90 días                  |
| Rotación de caches                                         | `actions/cache@v4` con `key:` versionada por hash del lockfile    |
| Actualización del runner (`ubuntu-22.04` → `ubuntu-24.04`) | Job manual cuando GitHub anuncia EOL del anterior                 |
| Regeneración de mocks / fixtures                           | Script en `scripts/refresh-fixtures.sh` lanzado a mano o por cron |

> Regla mental: **la automatización no es para no pensar, es para no repetir**. Cada tarea automatizada debería seguir generando un PR revisable, no un commit directo a `main` sin testigos.

El antipatrón más típico: configurar dependabot con automerge en `main` para actions. Suena cómodo hasta que una action comprometida llega a producción **sin que nadie la haya mirado**. La automatización abre el PR; el humano lo merge.

***

## 8. Soporte a hotfixes urgentes con validación técnica acelerada

Un hotfix es la prueba del pipeline. Si en una emergencia hay que **saltarse el pipeline para llegar a tiempo**, el pipeline ya está roto.

Disciplina de hotfix:

1. **Rama desde el tag de producción**, no desde `main`. `git checkout -b hotfix/<id> v1.4.0`.
2. **Fix mínimo posible**. No "ya que estamos arreglo este otro". Cada cambio aumenta el riesgo del despliegue.
3. **Test del fix obligatorio**. Si no se puede testear, no es hotfix — es esperanza.
4. **Pipeline completo, no `[skip ci]`**. El hotfix corre lint, typecheck, test, scan igual que cualquier PR. La diferencia es **prioridad humana**, no atajo técnico.
5. **Merge al tag, al `main`, y a las ramas activas (`develop`, `release/*`)**. El fix tiene que viajar a todas las líneas vivas.
6. **Post-mortem corto a las 24h**. Por qué entró el bug, qué barrera del pipeline no lo capturó, qué se cambia para que no vuelva.

> Regla mental: **el hotfix más rápido es el que el pipeline ya cubre**. El segundo más rápido es el que el equipo ha ensayado antes en frío.

Claude Code en hotfix:

* **Acelera la redacción del fix** cuando el dev de guardia no es el que escribió el código original.
* **Genera el test que captura el bug** antes de aplicar el fix, para que el pipeline lo proteja del segundo encuentro.
* **Redacta el commit, el PR description y el post-mortem inicial** — el dev de guardia revisa, no escribe desde cero.
* **No decide qué se despliega ni cuándo**. Esa decisión es del de guardia.

***

## 9. Buenas prácticas para no delegar decisiones críticas de despliegue a la IA

Lo que la IA **no** debe decidir:

* **Qué versión sale a producción.** Decisión humana, asentada en criterios de negocio.
* **A qué entorno deploy.** El gating de `environment:` con required reviewers existe por algo.
* **Cuándo hacer rollback.** Hay señales que un dashboard no capta (cliente al teléfono, contexto de mercado).
* **Si saltarse una validación del pipeline.** Si una check falla y la respuesta es "skip it esta vez", la check no protege de nada.
* **Aprobación final de un PR a rama protegida.** GitHub no deja a una IA aprobar PRs; tu equipo tampoco debería querer que lo haga.

Lo que la IA **sí** puede hacer:

* Redactar el workflow, el script, el commit, el changelog, las release notes.
* Auditar configuraciones existentes y proponer mejoras priorizadas.
* Diagnosticar fallos de pipeline a partir de logs.
* Generar tests que capturen bugs antes de que se repitan.
* Documentar decisiones humanas en formato consistente (ADR, post-mortem).

> Regla mental: **la IA es muy buena con la redacción y los patrones; muy mala con la responsabilidad**. El responsable de un deploy fallido sigue siendo una persona. Si el equipo no lo tiene claro, los procesos están rotos antes de meter agentes.

| Decisión típica                                  | ¿Quién decide?               | ¿Quién redacta?                          |
| ------------------------------------------------ | ---------------------------- | ---------------------------------------- |
| Bump de versión (`v1.4.0` → `v1.5.0` o `v2.0.0`) | Tech lead / release manager  | Claude propone bump y lo justifica       |
| Aprobar deploy a producción                      | Operador humano con permisos | Claude resume el diff del release        |
| Rollback ahora vs hotfix                         | Dev de guardia + producto    | Claude prepara comandos de cada opción   |
| Saltarse un status check                         | Nadie debería poder          | Claude no participa                      |
| Mensaje de incidente al cliente                  | Producto + soporte           | Claude redacta borrador, humanos revisan |

***

## 10. Diseño de una colaboración sana entre desarrolladores, plataforma y DevOps

En equipos con plataforma y DevOps separados de desarrollo, el pipeline es **frontera política**: dónde acaba el dev y empieza la plataforma, quién toca qué archivo, qué cambios pasan por review de quién. Sin reglas claras, Claude Code amplifica la fricción — genera workflows que un equipo no validó, scripts que el otro mantiene a regañadientes.

> **Nota sobre los equipos implicados.** Los nombres varían mucho según la empresa; lo que importa es el rol, no la etiqueta:
>
> - **Desarrollo (dev):** escribe el código de producto, sus features y sus tests. *Usa* el pipeline.
> - **Plataforma (Platform Engineering):** *posee* la infraestructura de entrega — workflows base, scripts de release, environments, secretos, scanners. La encontrarás también como *plataforma interna*, *Developer Experience (DevEx/DX)*, *Release Engineering* o, en empresas pequeñas, dentro de *Infraestructura* o del *departamento de Sistemas* (aunque "Sistemas" suele abarcar además IT clásico: redes, hardware, soporte).
> - **DevOps:** en origen es una **cultura** (romper el muro entre dev y operaciones), no un puesto. En el mercado, "**ingeniero de DevOps**" es el nombre más habitual para quien monta y opera el pipeline — en muchas organizaciones hace de facto el trabajo de plataforma. En equipos grandes se separa para centrar el foco en despliegue, observabilidad y fiabilidad en producción (solapa con **SRE**).
>
> Aquí se separan **plataforma** y **DevOps** para ilustrar la negociación de fronteras. En una empresa pequeña pueden ser la misma persona — y se le suele llamar "el de DevOps".

| Quién toca qué                           | Patrón sano                                               | Antipatrón                                                |
| ---------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| Workflows base (`.github/workflows/*`)   | Plataforma propone, dev revisa, ambos aprueban            | Dev modifica sin pedir, "ya luego veo qué rompí"          |
| Scripts de release y deploy              | Plataforma mantiene, dev usa                              | Cada dev tiene su `scripts/mi-release.sh`                 |
| Configuración de environments y secretos | Plataforma                                                | Dev "necesita rapidito" un secreto y lo pega al workflow  |
| Dependabot, scanners, policies           | Plataforma define, dev acepta o rechaza con justificación | Dev desactiva scanners porque "siempre falla"             |
| Logs y observability de pipeline         | DevOps centraliza, dev consulta                           | Cada uno mira sus runs sin agregación                     |
| Reglas de branch protection              | Tech lead + plataforma                                    | Una sola persona con poder de cambiarlas sin trazabilidad |

### Heurísticas para usar Claude Code en este contexto

* **Antes de aceptar un workflow generado por IA, identifica quién lo va a mantener.** Si el dev lo escribe y la plataforma no se entera, alguien terminará pisándolo.
* **Mismo principio con scripts de release.** Si el agente sugiere un `release.sh` brillante, asegúrate de que la plataforma lo ha visto antes de mergearlo.
* **No uses Claude Code para esquivar un proceso.** Si el equipo de plataforma pide ticket para tocar un secreto, generar un workflow alternativo con IA para evitar el ticket es deuda política, no productividad.
* **Sí úsalo para preparar mejor la conversación.** Un PR con un diff de workflow razonado y un `CI-AUDIT.md` claro acelera la review de plataforma, no la esquiva.

> Una colaboración sana se nota: **el dev sabe qué puede tocar y a quién pedir lo demás, la plataforma sabe que los cambios llegan con contexto, DevOps sabe que el pipeline lo entiende todo el mundo**. Si Claude Code ayuda a llegar antes a ese estado, está cumpliendo su papel. Si lo usa cada uno por su lado para esquivar al otro, está empeorando el problema.

***

## Resumen

* **Workflow = código.** Se audita por seguridad, reproducibilidad, granularidad y concurrencia. Actions pinneadas a SHA, `permissions:` mínimas, `concurrency:` con `cancel-in-progress`, jobs separados con `needs:`.
* **Pipelines en etapas con criterios distintos.** Build, test, lint, typecheck, scan, deploy — cada una falla por razones diferentes y se diseña para fallar rápido en su propio nivel.
* **Scripts de release y rollback validan antes de actuar.** `set -euo pipefail`, working tree limpio, rama correcta, tag inexistente, tests verdes, push manual. El script no decide; ejecuta lo que tú decidiste.
* **Logs de pipeline = ruido + señal.** El primer trabajo es identificar el bloque del error real entre las 200 líneas de setup. Sin ese filtro, el diagnóstico es adivinación.
* **La IA acelera la redacción y la auditoría, no las decisiones críticas.** Qué versión sale, a qué entorno, cuándo hacer rollback y cuándo saltarse una check siguen siendo decisiones humanas con responsable identificado.
