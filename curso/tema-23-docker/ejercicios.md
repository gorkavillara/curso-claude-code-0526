# Ejercicios — Tema 23

| Ejercicio | Rama | Tipo | Descripción breve |
|---|---|---|---|
| Ejercicio 1 | `tema-23/ejercicio-01` | En clase | Auditar el `Dockerfile` plantado, priorizar olores y aplicar los 3 fixes más rentables. Entrega `DOCKERFILE-AUDIT.md`. |
| Ejercicio 2 | `tema-23/ejercicio-02` | En clase | Extender `docker-compose.yml` con healthcheck, servicio Postgres pinneado, `env_file` y `depends_on` condicional. Entrega `COMPOSE-NOTES.md`. |
| Ejercicio 3 | `tema-23/ejercicio-03` | En clase | Diagnosticar el mismatch `PORT` (compose) ↔ `SERVER_PORT` (código) con disciplina de log + 3 hipótesis ordenadas + verificación. Entrega `TROUBLESHOOTING.md`. |

> Todos los ejercicios parten de `tema-23/inicio` con los fixtures plantados (`Dockerfile` con olores reales, `docker-compose.yml` con mismatch intencional, `.env.example`, `/health` ya implementado en `src/server.ts`). El alumno no necesita crear nada manualmente. Docker es opcional para verificar; los `.md` se entregan igualmente leyendo y editando los archivos.
