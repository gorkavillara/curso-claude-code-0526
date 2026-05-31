# Notas internas — Tema 24

Notas operativas del autor sobre decisiones de diseño y limitaciones que no caben en el guion.

---

## Sobre la verificación con GitHub Actions durante la preparación del tema

Durante la generación del tema **no se ejecutaron** los workflows plantados contra un runner real (`act` ni en el fork de GitHub). La validación del fixture se hizo por:

- **Lectura cruzada** del `ci.yml` y el `release.yml` contra la documentación oficial de GitHub Actions.
- **Smoke tests de Node** (`test/ci-fixtures.test.ts`) que verifican estructura y contenido sin levantar runner ni `act`.
- **Sintaxis YAML** validada por `Node` parseando el archivo (el smoke test hace `JSON.parse(yamlStringify(...))` indirectamente).

**Implicación para clase:** el día de la sesión, el instructor **debe verificar al menos una vez** que el workflow plantado se parsea correctamente en la UI de GitHub Actions (clonar el repo, push a fork propio, ver si el workflow aparece o GitHub reporta error). Si aparece un error de sintaxis YAML que no detectaron los smoke tests, anotarlo y arreglar el fixture entre cohortes.

Los tres ejercicios siguen siendo entregables sin runner: el trabajo cognitivo (auditar, endurecer, diagnosticar) no depende de ver el run.

---

## Por qué los olores del workflow están plantados, no pedidos al alumno que los introduzca

El **principio inviolable** de la skill `curso-tema-doc` (Componente 3) exige que el escenario esté en el repo. Por eso `tema-24/inicio` tiene `.github/workflows/ci.yml` **con olores reales**:

- `actions/checkout@v3` sin pin a SHA (y `@v3` ya semi-deprecado).
- `actions/setup-node@v3` sin `cache:`.
- Un único job `ci` que hace `npm install && npm run lint && npm run typecheck && npm test`.
- Sin bloque `permissions:`.
- Sin `concurrency:`.
- `on: push: branches: '*'` permisivo.
- `runs-on: ubuntu-latest` (versión flotante).

El alumno hace `git checkout tema-24/ejercicio-01 && npm install && npm test` y todo está listo para auditar. **No** se le pide "haz un workflow malo a propósito".

Riesgo: un alumno con experiencia en GitHub Actions puede arreglar todo de cabeza sin usar el agente. Buena señal — el agente está para acelerar la revisión, no para sustituir el criterio. El ejercicio entrega `CI-AUDIT.md`; ahí se ve si la priorización fue propia o regurgitada del agente.

---

## Por qué el log plantado es un fallo de `npm ci` por lockfile desactualizado

Hay muchos fallos plantables (timeout, OOM, permiso de secreto, test flake, build error). El elegido es **`npm ci` rompe por lockfile desincronizado** porque:

- Es **comunísimo en el mundo real** — pasa cada vez que un dev añade una dep con `npm install` y olvida commitear el `package-lock.json`.
- Se diagnostica leyendo **una línea concreta** del log (`Missing: vitest@1.6.0 from lock file`) cruzada con `package.json` y `package-lock.json`. El ejercicio cabe en 30 min.
- Enseña la **regla de filtrado de logs**: el log tiene 3.000 líneas pero el error vive en 20.
- Tiene **decisión arquitectónica genuina**: ¿regenero el lockfile o ablando el workflow a `npm install`? Solo una respuesta es correcta, pero el alumno tiene que justificar.
- Es **independiente del runner**: el log está plantado como archivo plano; el alumno no necesita ejecutar `act` ni el pipeline real.

Alternativas valoradas y descartadas:

- **Test flake (intermitente):** difícil de plantar como log único — requeriría dos logs.
- **Timeout en step de deploy:** muy específico de stack; no es portable a cualquier alumno.
- **OOM en step de build:** raro de ver hoy en runners de GitHub estándar.
- **Permiso de secreto:** requiere contexto de organización del runner.

Mantengo el `npm ci` roto como problema central. Los otros aparecen en docs/ como categorías pero no se plantan.

---

## Por qué `scripts/rollback.sh` NO está plantado en `tema-24/inicio`

Hay dos opciones razonables:

1. **Plantar un `rollback.sh` malo** que el alumno endurezca, paralelo a `release.sh`.
2. **No plantarlo** y pedirle al alumno que lo diseñe desde cero usando Claude.

He elegido la opción 2 porque:

- El Ejercicio 2 ya tiene una pieza de "endurecer" (`release.sh`). Repetir el patrón con `rollback.sh` sería redundante.
- Diseñar `rollback.sh` desde cero obliga al alumno a **pensar el flujo completo** (confirmación, verificación de tag, re-deploy, smoke test), no solo a arreglar olores.
- El `EJERCICIO.md` deja claro que el script lo crea el alumno, con plantilla mínima sugerida. No es "si no tienes el archivo créalo" porque **el ejercicio explícitamente pide crearlo** como entregable.

Riesgo: algunos alumnos lo copian directamente del `release.sh` y no piensan el flujo. El instructor debe insistir en clase que `rollback.sh` tiene una lógica distinta (confirmación + re-deploy + smoke test, no bump + tag + push).

---

## Por qué `release.yml` se planta como mínimo y no se trabaja en clase

`tema-24/inicio` también incluye `.github/workflows/release.yml` mínimo (un job que reacciona a `push` de tag `v*` y publica una release). **No** es objeto de ejercicio en clase porque:

- El Ejercicio 1 ya trabaja `ci.yml` y duplicar el patrón no aporta.
- `release.yml` necesita un secreto real (`GITHUB_TOKEN` o `NPM_TOKEN`) para ser interesante de auditar, y en clase no se manejan secretos reales.
- Sirve como **contexto adicional** — el alumno avanzado puede mencionarlo en `CI-AUDIT.md` ("también auditaría release.yml por las mismas razones") y eso es excelente.

Está plantado para que **exista** en el repo y el alumno lo vea, no para que lo toque. El smoke test no lo valida con detalle — solo verifica que existe el archivo.

---

## Por qué `act` no se exige

`act` (https://github.com/nektos/act) permite correr workflows de GitHub Actions localmente. Sería ideal para verificación, pero:

- Requiere Docker (no todos los alumnos lo tienen).
- Tiene divergencias sutiles con el runner real de GitHub (imágenes, env vars, secretos).
- El aprendizaje principal del Tema 24 es **leer y razonar** sobre workflows, no ejecutarlos.

Está mencionado en notas para el formador como herramienta opcional. Si algún alumno la usa, perfecto; si no, el ejercicio se entrega igual.

---

## Sobre la decisión "compose vs código" del Tema 23 reaparece aquí

El Tema 23 tenía la decisión "¿cambio el código o el compose?" para el mismatch `PORT`/`SERVER_PORT`. El Tema 24 tiene una análoga en el Ejercicio 3: "¿regenero el lockfile o cambio el workflow a `npm install`?".

Es intencional: estamos entrenando el reflejo "el fix correcto suele ser el que respeta la convención del proyecto, no el que silencia el síntoma". En el Tema 23 ganaba el código (convención > compose). En el Tema 24 gana el lockfile (lockfile > workflow ablandado). Mismo patrón, distinto contexto.

---

## Sobre el README de `tema-24/inicio`

El README de la rama documenta:

- Los fixtures plantados (`.github/workflows/ci.yml`, `release.yml`, `scripts/release.sh`, `logs/pipeline-fail.log`).
- Cómo arrancar (`npm install && npm test`) sin runner.
- Que los workflows **no se ejecutan** en clase — son objeto de lectura, auditoría y diff.
- Que `rollback.sh` **no** está plantado: lo crea el alumno en el Ejercicio 2.

Es importante que el README **no** mienta: no afirma que el pipeline funciona o falla en un runner real. Solo describe el estado del repo y dónde vive cada fixture.

---

## Sobre `.claude/skills/` de nuevo

Como en todos los temas anteriores, las skills del autor (`curso-tema-doc`, `curso-forms`, etc.) **no se trackean** en ninguna rama del repo de código. Está en `.gitignore` desde temas tempranos. Verificación antes del push:

```bash
for b in tema-24/inicio tema-24/ejercicio-01 tema-24/ejercicio-02 tema-24/ejercicio-03; do
  hits=$(git ls-tree -r "$b" --name-only | grep -E "\.claude/skills/" | wc -l)
  echo "$b: $hits hits"
done
```

Si hay hits, limpiar antes de pushear.
