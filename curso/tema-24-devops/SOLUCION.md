# Solución — Tema 24

Soluciones de referencia para el instructor. No compartir con alumnos antes de la sesión.

---

## Ejercicio 1 — `CI-AUDIT.md` esperado

### Tabla de olores esperable (mínimo 5)

| Olor | Riesgo | Severidad |
|---|---|---|
| `uses: actions/checkout@v3` sin pin a SHA | Reproducibilidad / Seguridad: supply-chain attack invisible | Alta |
| `uses: actions/setup-node@v3` (deprecado, recomendado `@v4`) | Reproducibilidad: romperá cuando GitHub lo jubile | Alta |
| Sin `cache:` en `setup-node` ni `actions/cache@v4` | Coste: cada job baja `node_modules` desde cero (~2 min) | Alta |
| Un único job `ci` con `lint && typecheck && test` en el mismo `run:` | DX: un fallo de lint esconde fallos de tipos o tests | Alta |
| Sin bloque `permissions:` declarado | Seguridad: `GITHUB_TOKEN` tiene `write` por defecto | Alta |
| Sin `concurrency:` con `cancel-in-progress` | Coste: runs antiguos siguen quemando minutos al hacer un nuevo push | Media |
| `on: push: branches: '*'` permisivo (corre en cualquier rama) | Coste: pipelines en ramas WIP sin valor | Media |
| Runner `runs-on: ubuntu-latest` (versión flotante) | Reproducibilidad: el runner cambia bajo nuestros pies | Baja |

### Los 3 fixes priorizados

1. **Separar `lint / typecheck / test` en jobs con `needs:`.** Diff conceptual:
   ```diff
   -  ci:
   -    runs-on: ubuntu-latest
   -    steps:
   -      - uses: actions/checkout@v3
   -      - uses: actions/setup-node@v3
   -        with:
   -          node-version: 24
   -      - run: npm install
   -      - run: npm run lint
   -      - run: npm run typecheck
   -      - run: npm test
   +  lint:
   +    runs-on: ubuntu-22.04
   +    steps:
   +      - uses: actions/checkout@v4
   +      - uses: actions/setup-node@v4
   +        with: { node-version: 24, cache: 'npm' }
   +      - run: npm ci
   +      - run: npm run lint
   +  typecheck:
   +    runs-on: ubuntu-22.04
   +    needs: [lint]
   +    steps:
   +      - uses: actions/checkout@v4
   +      - uses: actions/setup-node@v4
   +        with: { node-version: 24, cache: 'npm' }
   +      - run: npm ci
   +      - run: npm run typecheck
   +  test:
   +    runs-on: ubuntu-22.04
   +    needs: [lint, typecheck]
   +    steps:
   +      - uses: actions/checkout@v4
   +      - uses: actions/setup-node@v4
   +        with: { node-version: 24, cache: 'npm' }
   +      - run: npm ci
   +      - run: npm test
   ```
   Renta porque el PR ve tres status checks por separado: un fallo de lint no enmascara fallos de tipos.

2. **Añadir `permissions: contents: read` al workflow.** Diff:
   ```diff
   +permissions:
   +  contents: read
   +
    on:
      pull_request:
      push:
        branches: [main]
   ```
   Renta por seguridad: reduce drásticamente lo que un script comprometido puede hacer con el `GITHUB_TOKEN`.

3. **Añadir `concurrency:` con `cancel-in-progress`.** Diff:
   ```diff
   +concurrency:
   +  group: ci-${{ github.ref }}
   +  cancel-in-progress: true
   +
    on:
      pull_request:
      push:
        branches: [main]
   ```
   Renta por coste: si un PR recibe varios pushes seguidos, solo corre el último.

### Pinear actions a SHA (mínimo `checkout` y `setup-node`)

```yaml
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
- uses: actions/setup-node@8f152de45cc393bb48ce5d89d36b731f54556e65 # v4.0.0
```

(Los SHAs exactos cambian según versión disponible — el alumno puede usar el HEAD de la última release tagueada.)

### Sección "Qué dejo para otra iteración"

Mínimo 2 puntos. Ejemplos válidos:

- **Job de scan (gitleaks o trufflehog) sobre el diff** — útil pero hay que decidir umbral con plataforma antes de meterlo bloqueante.
- **Job de coverage con umbral** — primero hay que establecer cobertura actual y consensuar el mínimo.
- **Matrix de Node 22 + 24** — útil para libs públicas; en una app interna que clavamos a Node 24 no aporta.
- **Restringir `on:` a `push` solo en `main` + `pull_request`** — discutir si las ramas `release/*` necesitan correr el workflow también.
- **Migrar a `runs-on: ubuntu-24.04`** — cuando GitHub anuncie EOL de `22.04`, no antes.

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| Priorizan "renombrar steps" o "ordenar el yaml" arriba | Criterio cosmético. Empujar a seguridad + DX. |
| Aplican los 3 fixes en un solo prompt sin ver diffs | Pierden la trazabilidad. Forzar uno a uno. |
| Ponen `permissions: write-all` "por si acaso" | Lo contrario del fix. `contents: read` y se eleva por job si hace falta. |
| Pinean a SHA pero olvidan el comentario con el tag (`# v4.1.1`) | Aceptable pero pierdes legibilidad. Recomendar dejar el comentario. |
| Usan `concurrency` con `cancel-in-progress: false` "para no perder runs" | Defeat la utilidad. Si es eso, no añadan `concurrency`. |

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
#   docker pull registry.example.com/notebox:$PREVIOUS && \
#     docker service update --image registry.example.com/notebox:$PREVIOUS notebox
#   kubectl set image deployment/notebox notebox=registry.example.com/notebox:$PREVIOUS
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

El alumno debe localizar y citar **solo** las líneas alrededor del error real, no el log entero. Bloque esperable (aprox.):

```
2024-01-15T10:23:45.1234567Z Run npm ci
2024-01-15T10:23:45.2345678Z npm ERR! code EUSAGE
2024-01-15T10:23:45.2456789Z npm ERR!
2024-01-15T10:23:45.2567890Z npm ERR! `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
2024-01-15T10:23:45.2678901Z npm ERR! Missing: vitest@1.6.0 from lock file
2024-01-15T10:23:45.2789012Z npm ERR! Missing: @vitest/expect@1.6.0 from lock file
2024-01-15T10:23:45.2890123Z npm ERR! Missing: @vitest/runner@1.6.0 from lock file
2024-01-15T10:23:45.3001234Z npm ERR!
2024-01-15T10:23:45.3112345Z npm ERR! Clean install a project
2024-01-15T10:23:45.3223456Z
2024-01-15T10:23:45.3334567Z npm ERR! A complete log of this run can be found in: /home/runner/.npm/_logs/2024-01-15T10_23_45_000Z-debug-0.log
2024-01-15T10:23:46.0000000Z ##[error]Process completed with exit code 1.
```

Si el alumno pega el log entero (las 3.000+ líneas) al `.md`, señalar el antipatrón: el `.md` debe contener **el bloque útil**, no todo.

### Las 3 hipótesis esperables (en este orden)

1. **`package.json` y `package-lock.json` desincronizados.** El PR añadió `vitest` a `devDependencies` en `package.json` pero no se regeneró el `package-lock.json`. Verificación: `git log -p package.json package-lock.json` para ver si solo uno de los dos cambió en el PR.

2. **Versión de Node del workflow diferente a la del lockfile.** El lockfile fue generado con Node 20 y el workflow corre Node 18. `npm ci` puede fallar por incompatibilidades. Verificación: comparar `setup-node` del workflow con `engines.node` en `package.json`.

3. **`package-lock.json` corrupto tras un merge.** Conflicto resuelto mal a mano, lockfile inconsistente. Verificación: `git log --merges` en `package-lock.json`, intentar regenerarlo localmente con `npm install --package-lock-only` y comparar.

Lo crítico es que la 1 esté arriba. La pista clave del log es `Missing: vitest@1.6.0 from lock file` — eso descarta runtime/version mismatch y apunta directo a desincronización.

### Decisión del fix

Respuesta modelo:

> "Fix mínimo: regenerar `package-lock.json` localmente con `npm install --package-lock-only` y commitearlo. No toco el workflow — `npm ci` está bien usado (es lo correcto en CI). El bug es del PR que añadió la dep sin regenerar el lock.
>
> **Diff esperado:**
> ```diff
>  # En package-lock.json (regenerado):
>  +    "vitest": "^1.6.0",
>  +    ... (entradas de las deps transitorias añadidas)
> ```
>
> No es opción cambiar `npm ci` por `npm install` en el workflow: rompería la reproducibilidad. El lockfile manda; si está desactualizado, **se actualiza**, no se enmascara."

Aceptable la respuesta alternativa "ajusto el workflow a `npm install`" solo si el alumno justifica explícitamente que **ese repo concreto** no tiene política de lockfile (caso raro, criticar).

### "Qué grep / filtro me habría llevado más rápido al error"

Respuesta modelo. Mínimo 2 keywords útiles:

```bash
grep -n -i "npm ERR\|EUSAGE\|ERESOLVE" logs/pipeline-fail.log
grep -n "##\[error\]" logs/pipeline-fail.log
grep -n -B 2 -A 20 "exit code [^0]" logs/pipeline-fail.log
```

- `npm ERR` lleva directo al bloque de npm (saltando los 200 líneas de setup).
- `##[error]` es el marker que GitHub Actions imprime en cada fallo — siempre útil.
- `exit code [^0]` con contexto antes/después captura el momento exacto del fallo en cualquier step.

### "Cómo evito que vuelva"

Respuesta modelo. Accionable, no decorativo:

> "1. **Job de pipeline `lock-check`** que corre `npm ci` en un job dedicado (ya lo hacíamos, pero implícito en `test`); separarlo da feedback granular y deja claro qué falló si vuelve.
>
> 2. **Pre-commit hook** o **status check obligatorio** que valide que `package-lock.json` está al día tras tocar `package.json`. Patrón típico:
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
> 3. **Convención de equipo:** cualquier PR que toque `package.json` debe tocar `package-lock.json` en el mismo commit. Es revisable a ojo en el diff."

Bonus si proponen un workflow `on: pull_request` con job `lockfile-sync-check` que falla si `package.json` cambia sin `package-lock.json` (o viceversa).

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| Pegan las 3.000 líneas del log al agente "porque es lo que tengo" | Antipatrón. Forzar filtrado previo con `grep`. |
| La hipótesis 1 es "rerun" o "el runner falló" | Sin evidencia. `Missing: vitest@1.6.0` es muy concreto para echar la culpa al runner. |
| Cambian el workflow a `npm install` "para que pase" | Mete bug a futuro. Discutir por qué `npm ci` es correcto en CI. |
| "Cómo evito que vuelva: poner más atención" | No es accionable. Forzar a un check técnico (hook, job, convención escrita). |
| No citan el log en el `.md`: lo describen con palabras | Sin la cita literal, el siguiente que lea el `.md` no puede verificar. |
| Aceptan la primera hipótesis sin verificarla en los archivos del repo | Pueden coger la incorrecta. Forzar verificación cruzada. |

---

## Coherencia con docs/ y guion

- Las tres demos del guion (auditar `ci.yml`, endurecer `release.sh`, triage de `pipeline-fail.log`) coinciden 1:1 con las del `docs/tema-24-devops.md`. Mismos prompts literales.
- Los tres ejercicios entregan tres documentos distintos: `CI-AUDIT.md`, `RELEASE-NOTES.md`, `PIPELINE-TRIAGE.md`. No se confunden entre ramas.
- Las previews 🧩 en docs/ repiten literalmente la rama, el tiempo (30 min) y el tipo (En clase).
- Los fixtures (`.github/workflows/ci.yml`, `.github/workflows/release.yml`, `scripts/release.sh`, `logs/pipeline-fail.log`) están plantados en `tema-24/inicio`. Ningún ejercicio pide al alumno "crea el archivo X" — está ya en el repo.
- El smoke test `test/ci-fixtures.test.ts` valida que los fixtures siguen con la forma esperada entre cohortes.
