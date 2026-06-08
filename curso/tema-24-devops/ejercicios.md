# Ejercicios — Tema 24

| Ejercicio | Rama | Tipo | Descripción breve |
|---|---|---|---|
| Ejercicio 1 | `tema-24/ejercicio-01` | En clase | Auditar `.gitlab-ci.yml`, priorizar olores y aplicar los 3 fixes más rentables (stages/jobs separados, secreto fuera de `variables:` global, `interruptible: true`) + pin de imagen a digest. Entrega `CI-AUDIT.md`. |
| Ejercicio 2 | `tema-24/ejercicio-02` | En clase | Endurecer `scripts/release.sh` con `set -euo pipefail` + 4 validaciones previas, y diseñar `scripts/rollback.sh` con confirmación + smoke test. Entrega `RELEASE-NOTES.md`. |
| Ejercicio 3 | `tema-24/ejercicio-03` | En clase | Triage de `logs/pipeline-fail.log` (job de GitLab Runner): localizar bloque del error real, 3 hipótesis ordenadas, verificación cruzada con `.gitlab-ci.yml` + lockfile, decisión del fix con diff. Entrega `PIPELINE-TRIAGE.md`. |

> Cada ejercicio parte de su propia rama con los fixtures de **GitLab CI** ya plantados (`.gitlab-ci.yml` con olores reales, `scripts/release.sh` sin validaciones, `logs/pipeline-fail.log` con fallo real de `npm ci` en formato GitLab Runner). El alumno no necesita crear nada manualmente ni levantar runner ni ejecutar el pipeline real. Los `.md` se entregan leyendo y editando los archivos del repo.
>
> **Nota de plataforma:** las demos del guion se hacen sobre GitHub Actions (`.github/workflows/ci.yml` en `tema-24/inicio`) y los ejercicios sobre GitLab CI (`.gitlab-ci.yml`). Es deliberado: el tema cubre ambas plataformas y el alumno aplica en GitLab el patrón visto en Actions.
