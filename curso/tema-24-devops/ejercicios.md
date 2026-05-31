# Ejercicios — Tema 24

| Ejercicio | Rama | Tipo | Descripción breve |
|---|---|---|---|
| Ejercicio 1 | `tema-24/ejercicio-01` | En clase | Auditar `.github/workflows/ci.yml`, priorizar olores y aplicar los 3 fixes más rentables (jobs separados con `needs:`, `permissions:` mínimas, `concurrency:` con cancel). Entrega `CI-AUDIT.md`. |
| Ejercicio 2 | `tema-24/ejercicio-02` | En clase | Endurecer `scripts/release.sh` con `set -euo pipefail` + 4 validaciones previas, y diseñar `scripts/rollback.sh` con confirmación + smoke test. Entrega `RELEASE-NOTES.md`. |
| Ejercicio 3 | `tema-24/ejercicio-03` | En clase | Triage de `logs/pipeline-fail.log`: localizar bloque del error real, 3 hipótesis ordenadas, verificación cruzada con workflow + lockfile, decisión del fix con diff. Entrega `PIPELINE-TRIAGE.md`. |

> Todos los ejercicios parten de `tema-24/inicio` con los fixtures plantados (`.github/workflows/ci.yml` y `release.yml`, `scripts/release.sh` sin validaciones, `logs/pipeline-fail.log` con fallo real de `npm ci`). El alumno no necesita crear nada manualmente ni levantar runner ni ejecutar el pipeline real. Los `.md` se entregan leyendo y editando los archivos del repo.
