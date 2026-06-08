# Solución — Tema 24

Soluciones de referencia para el instructor. No compartir con alumnos antes de la sesión.

> **Plataforma:** los ejercicios son sobre **GitLab CI** (`.gitlab-ci.yml`). Las demos del guion se hacen sobre GitHub Actions (`.github/workflows/ci.yml` en `tema-24/inicio`); el patrón es el mismo y la doc da la tabla de equivalencias.

---

## Ejercicio 1 — `CI-AUDIT.md` esperado

### Tabla de olores esperable (mínimo 5)

| Olor | Riesgo | Severidad |
|---|---|---|
| `image: node:latest` (tag flotante, sin pin a versión ni digest `@sha256`) | Reproducibilidad: la imagen base cambia bajo nuestros pies | Alta |
| Un único job `ci` que mezcla `npm ci + lint + typecheck + test + build` | DX: un fallo de lint esconde fallos de tipos o tests | Alta |
| Secreto `NPM_TOKEN` en `variables:` global (visible para todos los jobs) | Seguridad: cualquier job, lint incluido, ve el secreto; filtrable con un `echo` accidental | Alta |
| Sin bloque `cache:` para `~/.npm` | Coste: cada pipeline baja las deps desde cero (~2 min) | Alta |
| Sin `interruptible: true` en los jobs | Coste: un push nuevo no cancela el pipeline anterior en cola | Media |
| Sin `workflow: rules` (corre en cualquier rama y evento) | Coste: pipelines en ramas WIP sin valor | Media |
| `release` heredando `image: node:latest` y el secreto global | Reproducibilidad + Seguridad: el job de release arrastra los mismos olores | Media |

### Los 3 fixes priorizados

1. **Separar `lint / typecheck / test` en stages (o jobs con `needs:`).** Diff conceptual:
   ```diff
   -stages:
   -  - ci
   -
   -ci:
   -  stage: ci
   -  script:
   -    - npm ci
   -    - npm run lint --if-present
   -    - npm run typecheck
   -    - npm test
   -    - npm run build --if-present
   +stages:
   +  - lint
   +  - typecheck
   +  - test
   +
   +.node:
   +  image: node:24.0.0@sha256:<digest>   # base común
   +  cache:
   +    key:
   +      files: [package-lock.json]
   +    paths: [.npm/]
   +  before_script:
   +    - npm ci --cache .npm --prefer-offline
   +
   +lint:
   +  extends: .node
   +  stage: lint
   +  interruptible: true
   +  script: [npm run lint --if-present]
   +
   +typecheck:
   +  extends: .node
   +  stage: typecheck
   +  interruptible: true
   +  script: [npm run typecheck]
   +
   +test:
   +  extends: .node
   +  stage: test
   +  interruptible: true
   +  script: [npm test]
   ```
   Renta porque el MR ve tres jobs por separado: un fallo de lint no enmascara fallos de tipos.

2. **Sacar el secreto `NPM_TOKEN` de `variables:` global.** El secreto real vive en **Settings → CI/CD → Variables** (marcada *Protected* + *Masked*), no en el YAML. Diff:
   ```diff
   -variables:
   -  NPM_TOKEN: "demo-npm-token-CHANGEME"   # secreto global
   ```
   ```diff
   # Solo el job que lo necesita lo referencia (el valor llega desde
   # las CI/CD Variables protegidas del proyecto, no desde el YAML):
   +release:
   +  script:
   +    - echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
   ```
   Renta por seguridad: `lint` y `test` dejan de ver el token. **Clave conceptual:** parte de la mitigación NO se ve en el `.gitlab-ci.yml` — vive en la configuración del proyecto.

3. **Añadir `interruptible: true` a los jobs** (+ activar *Auto-cancel redundant pipelines* en Settings → CI/CD → General pipelines). Diff:
   ```diff
    test:
      stage: test
   +  interruptible: true
      script: [npm test]
   ```
   Renta por coste: si un MR recibe varios pushes seguidos, GitLab cancela el pipeline anterior y solo corre el último.

### Pin de la imagen a digest

```yaml
# node:24.0.0 (tag legible como referencia; el digest es lo inmutable)
image: node:24.0.0@sha256:6c3f7a1e9d2b4c5f8a0e1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60
```

(El digest exacto cambia según la versión disponible — el alumno puede resolverlo con `docker pull node:24.0.0 && docker inspect --format='{{index .RepoDigests 0}}' node:24.0.0`, o dejar un placeholder `@sha256:<digest>` si no tiene red.)

### Sección "Qué dejo para otra iteración"

Mínimo 2 puntos. Ejemplos válidos:

- **`workflow: rules`** para limitar el pipeline a MRs y a la rama por defecto — útil pero hay que consensuar con plataforma qué ramas disparan pipeline.
- **Job de `secret_detection` / SAST** (plantillas `Security/Secret-Detection.gitlab-ci.yml`) — útil, pero primero hay que decidir umbral con plataforma antes de meterlo bloqueante.
- **Job de coverage con umbral** (`coverage:` + `rules`) — primero hay que establecer cobertura actual y consensuar el mínimo.
- **Matrix con `parallel: matrix:` para Node 22 + 24** — útil para libs públicas; en una app interna que clavamos a Node 24 no aporta.
- **Auditar el job `release`** por los mismos criterios (imagen, cache, secreto) — fuera del alcance de esta iteración.

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| Priorizan "renombrar el job" o "ordenar el yaml" arriba | Criterio cosmético. Empujar a seguridad + DX. |
| Aplican los 3 fixes en un solo prompt sin ver diffs | Pierden la trazabilidad. Forzar uno a uno. |
| "Mitigan" el secreto poniéndolo en `variables:` de cada job | Sigue en el YAML en claro. El valor real va en CI/CD Variables protegidas. |
| Creen que sacar el secreto del YAML basta y olvidan marcarla *Protected/Masked* | La mitigación se completa en Settings del proyecto, no solo en el YAML. |
| Pinean a digest pero olvidan el comentario con el tag legible | Aceptable pero pierdes legibilidad. Recomendar dejar el comentario. |
| Usan `interruptible: false` "para no perder runs" | Defeat la utilidad. Si es eso, que lo justifiquen. |

---

## Ejercicio 2 — `RELEASE-NOTES.md` esperado

### Tabla de validaciones aplicadas

| Validación | Por qué importa | Exit code |
|---|---|---|
| `set -euo pipefail` activo | Corta al primer fallo, falla con variables no definidas, no enmascara errores en pipes | (preludio) |
| Versión pasada como `$1` | Sin versión no hay release | 1 |
| `git diff --quiet` (working tree limpio) | Evita publicar cambios no commiteados | 2 |
| `git rev-parse --abbrev-ref HEAD == main` | Evita releases desde feature branches | 3 |
| `git rev-parse "v$VERSION"` no existe | Evita pisar releases anteriores | 4 |
| `npm test` verde | El release nunca sale en rojo | 5 |

### Diff esperable de `release.sh`

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
npm test || { echo "Tests fallaron" >&2; exit 5; }

# 3. Bump + tag local. Push manual por humano.
npm version "$VERSION" --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore(release): v$VERSION"
git tag -a "v$VERSION" -m "Release v$VERSION"

echo ""
echo "Tag v$VERSION creado localmente."
echo "Revisa el commit con: git show HEAD"
echo "Publica con: git push origin main --follow-tags"
```

> Nota: al pushear el tag `v$VERSION`, el job `release` del `.gitlab-ci.yml` (regla `$CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/`) es el que se dispara en GitLab. El script local crea el tag; GitLab CI reacciona al push.

### Contenido completo de `rollback.sh` esperable

```bash
#!/usr/bin/env bash
set -euo pipefail

PREVIOUS="${1:-}"
[[ -n "$PREVIOUS" ]] || { echo "Uso: $0 <version-anterior>  (ej: 1.3.5)" >&2; exit 1; }

# 1. Verifica que la versión anterior existe como tag.
git fetch --tags
git rev-parse "v$PREVIOUS" >/dev/null 2>&1 || { echo "Tag v$PREVIOUS no existe" >&2; exit 2; }

# 2. Confirmación humana antes de actuar.
echo "Vas a hacer rollback a v$PREVIOUS. ¿Seguro? (y/N)"
read -r confirm
[[ "$confirm" == "y" ]] || { echo "Cancelado"; exit 0; }

# 3. Re-deploy del artifact anterior. PLACEHOLDER — adaptar al stack real.
echo "Re-deployando v$PREVIOUS..."
# Ejemplos según stack:
#   docker pull registry.gitlab.com/notebox/notebox:$PREVIOUS && \
#     docker service update --image registry.gitlab.com/notebox/notebox:$PREVIOUS notebox
#   kubectl set image deployment/notebox notebox=registry.gitlab.com/notebox/notebox:$PREVIOUS
#   npm dist-tag add notebox@$PREVIOUS latest

# 4. Smoke test post-rollback.
echo "Esperando 5s a que el servicio responda..."
sleep 5
HEALTH_URL="${HEALTH_URL:-https://notebox.example.com/health}"
curl -fsS "$HEALTH_URL" >/dev/null || { echo "Smoke test FALLÓ tras rollback a v$PREVIOUS" >&2; exit 5; }
echo "Rollback a v$PREVIOUS completado y verificado."
```

### "¿Qué decisión no automatizo nunca y por qué?" — respuesta modelo

Mínimo 2 ejemplos. Respuesta esperable:

> "1. **Qué versión sale a producción.** Es decisión de producto + tech lead — depende de criterios que el script no conoce (ventana de despliegue, dependencias de otros equipos, contexto de mercado). El script asume que **ya decidiste**; valida y ejecuta.
>
> 2. **Cuándo hacer rollback.** Hay señales que no caben en un dashboard: cliente al teléfono, regresión visual sutil, percepción del equipo de soporte. El humano de guardia decide; el script ejecuta sin pelear.
>
> 3. **Saltarse una validación del pipeline.** Si los tests fallan y la respuesta es 'lánzalo igual', la validación no protege de nada. Si la urgencia justifica saltarlo, lo justifica un humano firmando, no un flag en el script."

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| `set -e` solo (sin `-u` ni `-o pipefail`) | Variables tipográficas y errores en pipes pasan en silencio. Forzar `-euo pipefail`. |
| `$VERSION` sin entrecomillar | Bug latente si la versión tiene espacios o caracteres especiales. `"$VERSION"` siempre. |
| `git push --tags` o `git push origin main --follow-tags` automático | Defeat el patrón "el script no publica, el humano sí". |
| Rollback sin confirmación interactiva | Riesgo en producción. Forzar `read -r confirm`. |
| Smoke test con `curl` sin `-f` | `curl` devuelve 0 aunque la respuesta sea 500. Forzar `-fsS`. |
| Rollback que hace `git revert` en lugar de re-deploy del artifact | Confunde rollback de código con rollback de despliegue. Discutir. |
| `RELEASE-NOTES.md` sin justificar qué no automatizan | El **qué** sin el **por qué** no es aprendizaje. |

---

## Ejercicio 3 — `PIPELINE-TRIAGE.md` esperado

### Bloque del log relevante (citado literal)

El alumno debe localizar y citar **solo** las líneas alrededor del error real, no el log entero. Bloque esperable (job de GitLab Runner):

```
$ npm ci
npm error code EUSAGE
npm error
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
npm error
npm error Missing: vitest@1.6.0 from lock file
npm error Missing: @vitest/expect@1.6.0 from lock file
npm error Missing: @vitest/runner@1.6.0 from lock file
npm error Missing: @vitest/snapshot@1.6.0 from lock file
npm error Missing: @vitest/utils@1.6.0 from lock file
npm error
npm error Clean install a project
...
npm error A complete log of this run can be found in: /root/.npm/_logs/2024-01-15T10_23_45_123Z-debug-0.log
section_end:1705315417:step_script
ERROR: Job failed: exit code 1
```

Si el alumno pega el log entero al `.md`, señalar el antipatrón: el `.md` debe contener **el bloque útil**, no todo.

### Las 3 hipótesis esperables (en este orden)

1. **`package.json` y `package-lock.json` desincronizados.** El MR añadió `vitest` a `devDependencies` en `package.json` pero no se regeneró el `package-lock.json`. Verificación: `git log -p package.json package-lock.json` para ver si solo uno de los dos cambió en el MR.

2. **La `image: node:latest` resolvió a una versión de Node/npm distinta de la del lockfile.** Como la imagen es flotante, el lockfile pudo generarse con un npm anterior. Verificación: comparar el `node --version` / `npm --version` del log con `engines.node` en `package.json`.

3. **`package-lock.json` corrupto tras un merge.** Conflicto resuelto mal a mano, lockfile inconsistente. Verificación: `git log --merges` en `package-lock.json`, intentar regenerarlo localmente con `npm install --package-lock-only` y comparar.

Lo crítico es que la 1 esté arriba. La pista clave del log es `Missing: vitest@1.6.0 from lock file` — eso descarta runtime/version mismatch y apunta directo a desincronización.

### Decisión del fix

Respuesta modelo:

> "Fix mínimo: regenerar `package-lock.json` localmente con `npm install --package-lock-only` y commitearlo. No toco el `.gitlab-ci.yml` — `npm ci` está bien usado (es lo correcto en CI). El bug es del MR que añadió la dep sin regenerar el lock.
>
> **Diff esperado:**
> ```diff
>  # En package-lock.json (regenerado):
>  +    "vitest": "^1.6.0",
>  +    ... (entradas de las deps transitorias añadidas)
> ```
>
> No es opción cambiar `npm ci` por `npm install` en el `.gitlab-ci.yml`: rompería la reproducibilidad. El lockfile manda; si está desactualizado, **se actualiza**, no se enmascara. (Bonus: pinear la imagen a una versión fija evita además la hipótesis 2.)"

Aceptable la respuesta alternativa "ablando el pipeline a `npm install`" solo si el alumno justifica explícitamente que **ese repo concreto** no tiene política de lockfile (caso raro, criticar).

### "Qué grep / filtro me habría llevado más rápido al error"

Respuesta modelo. Mínimo 2 keywords útiles:

```bash
grep -n -i "npm error\|EUSAGE\|ERESOLVE" logs/pipeline-fail.log
grep -n "ERROR: Job failed" logs/pipeline-fail.log
grep -n -B 2 -A 20 "exit code [^0]" logs/pipeline-fail.log
```

- `npm error` lleva directo al bloque de npm (saltando las ~40 líneas de setup del runner).
- `ERROR: Job failed` es la línea que GitLab Runner imprime al final de cada job fallido — siempre útil para encontrar el desenlace.
- `exit code [^0]` con contexto antes/después captura el momento exacto del fallo.

### "Cómo evito que vuelva"

Respuesta modelo. Accionable, no decorativo:

> "1. **Job de pipeline `lockfile-check`** (stage temprano) que corre `npm ci` aislado: da feedback granular y deja claro que el problema es el lock, no los tests.
>
> 2. **Pre-commit hook** o **status check obligatorio en el MR** que valide que `package-lock.json` está al día tras tocar `package.json`. Patrón típico:
> ```bash
> # .githooks/pre-commit
> git diff --cached --name-only | grep -q '^package\.json$' && {
>   npm install --package-lock-only --quiet
>   git diff --quiet package-lock.json || {
>     echo 'package-lock.json desactualizado — regenéralo y vuelve a commitear' >&2
>     exit 1
>   }
> }
> ```
>
> 3. **Convención de equipo:** cualquier MR que toque `package.json` debe tocar `package-lock.json` en el mismo commit. Es revisable a ojo en el diff."

Bonus si proponen un job `lockfile-sync-check` con `rules: - if: $CI_PIPELINE_SOURCE == "merge_request_event"` que falla si `package.json` cambia sin `package-lock.json` (o viceversa).

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| Pegan el log entero al agente "porque es lo que tengo" | Antipatrón. Forzar filtrado previo con `grep`. |
| La hipótesis 1 es "rerun" o "el runner falló" | Sin evidencia. `Missing: vitest@1.6.0` es muy concreto para echar la culpa al runner. |
| Cambian el `.gitlab-ci.yml` a `npm install` "para que pase" | Mete bug a futuro. Discutir por qué `npm ci` es correcto en CI. |
| "Cómo evito que vuelva: poner más atención" | No es accionable. Forzar a un check técnico (hook, job, convención escrita). |
| No citan el log en el `.md`: lo describen con palabras | Sin la cita literal, el siguiente que lea el `.md` no puede verificar. |
| Aceptan la primera hipótesis sin verificarla en los archivos del repo | Pueden coger la incorrecta. Forzar verificación cruzada. |

---

## Coherencia con docs/ y guion

- Las tres demos del guion (auditar `ci.yml`, endurecer `release.sh`, triage de `pipeline-fail.log`) se hacen sobre **GitHub Actions** en `tema-24/inicio` y coinciden 1:1 con las del `docs/tema-24-devops.md`. Mismos prompts literales.
- Los tres **ejercicios** son sobre **GitLab CI** (`.gitlab-ci.yml`) y entregan tres documentos distintos: `CI-AUDIT.md`, `RELEASE-NOTES.md`, `PIPELINE-TRIAGE.md`. No se confunden entre ramas.
- Las previews 🧩 en docs/ repiten literalmente la rama, el tiempo (30 min) y el tipo (En clase), y describen el ejercicio sobre `.gitlab-ci.yml`.
- Los fixtures de GitLab (`.gitlab-ci.yml` con olores, `scripts/release.sh` sin validaciones, `logs/pipeline-fail.log` en formato GitLab Runner) están plantados en cada rama `tema-24/ejercicio-0N`. La rama `tema-24/inicio` conserva los fixtures de GitHub Actions para las demos. Ningún ejercicio pide al alumno "crea el archivo X" — está ya en el repo.
- El smoke test `test/ci-fixtures.test.ts` (en cada rama de ejercicio) valida que el fixture de GitLab sigue con la forma esperada entre cohortes.
