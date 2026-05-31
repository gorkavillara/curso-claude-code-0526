---
hidden: true
---

# Tema 23 — Docker, entornos reproducibles y ayuda de Claude Code en empaquetado, local dev y troubleshooting

> **Duración estimada:** ~90 min
> **Tipo:** práctico + demos guiadas

## Objetivo del tema

Usar Claude Code como copiloto en el ciclo de empaquetado: auditar y reescribir un `Dockerfile`, montar un `docker-compose` para entornos locales multi-servicio y diagnosticar fallos reales de build y runtime. Al terminar, el alumno trata Docker como **un archivo más del repo** que se revisa, se versiona y se itera con el agente, en lugar de un trozo de infraestructura aparte que se copia de StackOverflow.

***

## 1. Creación y revisión de Dockerfiles con foco en simplicidad y seguridad

Un `Dockerfile` mal hecho no falla: **construye igual** y pasa a producción. Por eso la revisión asistida importa.

| Olor en un Dockerfile | Síntoma visible | Coste real |
|---|---|---|
| Imagen base sin variante slim/alpine | `node:24` ocupa ~1 GB | Builds lentas, push pesado, superficie de ataque grande |
| `npm install` en lugar de `npm ci` | Resoluciones distintas entre máquinas | Builds no reproducibles, "en mi máquina sí" |
| Sin usuario no-root | Contenedor corre como `root` | CVE de la app = root dentro del contenedor |
| `COPY . .` antes de instalar deps | Cada cambio de código invalida el `npm install` | Builds de 3 min para cambiar una línea |
| Sin `.dockerignore` (o pésimo) | `node_modules/`, `.git/`, `.env`, `logs/` entran al contexto | Build context de cientos de MB, secretos filtrados |
| `EXPOSE` ausente o mentiroso | El puerto real no coincide con el documentado | Onboarding confuso, `docker run -p` a ciegas |
| Versiones flotantes (`FROM node:latest`) | Reproducibilidad nula | Build que funcionaba ayer falla hoy |

> Regla mental: **el Dockerfile no es una receta, es código**. Se revisa como código: en PR, con un revisor, con tests. Claude Code es ese revisor cuando no hay nadie más.

Lo que se pide al agente cuando audita un Dockerfile:

- **Simplicidad:** ¿hay capas redundantes, comandos encadenables, `RUN` que podrían fusionarse?
- **Seguridad:** ¿usuario no-root, imagen base mínima, `.dockerignore` correcto, sin secretos en `ENV`?
- **Reproducibilidad:** ¿versiones pinneadas, `npm ci` en lugar de `npm install`, lock files copiados?
- **Tamaño:** ¿se podría usar multi-stage para dejar fuera devDependencies y herramientas de build?
- **Cache:** ¿el orden de las capas aprovecha el cache de Docker o lo invalida en cada cambio?

### 🧪 Demo 1 — Auditar un Dockerfile plantado y aplicar 3 fixes priorizados

- **Objetivo:** convertir un `Dockerfile` con olores reales en uno auditado, ordenado y seguro, dejando trazabilidad en un `DOCKERFILE-AUDIT.md`.
- **Setup:** rama `tema-23/inicio`. El repo trae un `Dockerfile` con problemas plantados: `FROM node:24` (sin slim), `COPY . .` antes de instalar dependencias, `npm install` en lugar de `npm ci`, sin usuario no-root, sin `.dockerignore`.

**Pasos:**

1. Desde el REPL, pedir un diagnóstico estructurado:
   ```
   Audita el Dockerfile de este repo. Lista los problemas en una tabla con
   columnas: olor, impacto, severidad (alta/media/baja). Sin reescribir todavía.
   ```
2. Pedir la priorización con criterio:
   ```
   De los problemas detectados, dame los 3 que más rentan arreglar primero
   y por qué. Considera impacto en build time, tamaño de imagen y seguridad.
   ```
3. Aplicar los 3 fixes en orden, uno a uno, verificando cada uno:
   ```
   Aplica el fix 1. Muéstrame el diff. Explica qué cambia en la build.
   ```
4. Generar `.dockerignore` mínimo correcto:
   ```
   Crea un .dockerignore mínimo correcto: ignorar node_modules/, .git/,
   .env*, logs/, coverage/, *.md salvo README.md.
   ```
5. Si hay Docker disponible, ejecutar `docker build -t notebox:audit .` antes y después. Comparar tamaño con `docker images notebox`.

**Qué observar:**

- La tabla de olores debe priorizar **seguridad y reproducibilidad** sobre cosmética. Si el agente pone "cambiar comentarios" arriba, hay que corregir el criterio en el prompt.
- Tras ordenar `COPY package*.json` antes de `RUN npm ci` y luego `COPY . .`, la build cachea el `install` salvo que cambien las dependencias.
- `npm ci` falla si `package-lock.json` está desactualizado: eso es **una feature**, no un bug. Build reproducible o build que avisa.
- Sin `.dockerignore`, `docker build` envía `node_modules/` al daemon: contexto inflado, build lenta y riesgo de meter binarios incompatibles dentro de la imagen.

### 🧩 Ejercicio 1 — Auditoría y reescritura del Dockerfile

> **Rama:** `git checkout tema-23/ejercicio-01` · **Tiempo:** 30 min · **Tipo:** En clase

Audita el `Dockerfile` plantado, prioriza los problemas en una tabla y aplica los 3 fixes más rentables, justificando cada uno. Entrega `DOCKERFILE-AUDIT.md` con la tabla de olores, los fixes aplicados (con diff antes/después) y una decisión razonada sobre multi-stage (¿lo introduces o lo dejas para otra iteración?).

---

## 2. Generación de `docker-compose` o equivalentes para entornos locales

Una app sola es un contenedor. Una app **realista** son varios servicios: la API, una base de datos, una cola, quizá un Redis para sesiones. `docker-compose` declara ese conjunto como código.

| Pieza de `docker-compose.yml` | Qué declara |
|---|---|
| `services` | Cada contenedor del entorno (app, db, redis, worker, …) con su imagen, build context, ports, env, depends_on |
| `volumes` | Persistencia de datos entre reinicios (`db-data:`), montaje de código para hot-reload (`./src:/app/src`) |
| `networks` | Aislamiento entre servicios y exposición controlada al host |
| `environment` / `env_file` | Variables por servicio, idealmente leídas de `.env` no trackeado |
| `healthcheck` | Comando que decide si un servicio está realmente listo (no solo arrancado) |
| `depends_on` (`condition: service_healthy`) | Orden de arranque con espera real, no `sleep 5` |

> Regla mental: **`docker-compose.yml` es el README ejecutable del entorno**. Si el README dice "necesitas Postgres 15" y el compose no lo declara, gana el compose. Si el compose miente, no hay onboarding.

### Antipatrones frecuentes

- ❌ Servicios que dependen unos de otros sin `healthcheck`: `depends_on` sin `condition` solo espera al arranque del proceso, no a que el servicio esté listo para aceptar conexiones.
- ❌ Variables secretas en `environment:` literal dentro del `yaml`: deberían leerse de `env_file` o `secrets`.
- ❌ Puertos publicados al host innecesariamente (`5432:5432` cuando solo la app los consume) — expone Postgres a la red local.
- ❌ Volúmenes de bind mount con permisos rotos en Linux por diferencia de UID entre host y contenedor.
- ❌ `image: postgres:latest` — versión flotante, reproducibilidad cero.

### 🧪 Demo 2 — Extender el `docker-compose` plantado con un servicio dependiente

- **Objetivo:** partir de un `docker-compose.yml` mínimo (solo la app) y añadir un segundo servicio (`db-dummy`) con `healthcheck`, `depends_on` condicional y `env_file`, dejando todo arrancable con `docker compose up`.
- **Setup:** rama `tema-23/inicio`. El repo trae un `docker-compose.yml` plantado con un único servicio `app` y un placeholder `db-dummy` comentado. También un `.env.example` con las variables esperadas.

**Pasos:**

1. Pedir el diagnóstico del compose actual:
   ```
   Lee docker-compose.yml. Lista qué hay declarado y qué faltaría
   para un entorno realista (db, healthcheck, env_file, networks).
   ```
2. Pedir el `healthcheck` para el servicio `app` apuntando a `/health` (ya existe en `src/server.ts`):
   ```
   Añade un healthcheck al servicio app que llame a GET /health
   cada 10s con un retry de 3. Muéstrame el diff.
   ```
3. Descomentar y completar `db-dummy` (imagen `postgres:16-alpine`, volumen nombrado, healthcheck con `pg_isready`, env vars desde `env_file: .env`):
   ```
   Activa el servicio db-dummy con postgres:16-alpine, healthcheck con
   pg_isready, env_file .env (no environment literal). La app debe esperar
   a que db-dummy esté healthy antes de arrancar.
   ```
4. Crear `.env` local copiando de `.env.example` (no se commitea: ya está en `.gitignore`).
5. Si hay Docker disponible: `docker compose config` para validar el YAML, `docker compose up -d`, `docker compose ps` para ver estado y health.

**Qué observar:**

- `depends_on` con `condition: service_healthy` espera al healthcheck, no al `start`. La diferencia se ve cuando la app arranca y, sin healthcheck real, intenta conectar antes de que Postgres esté listo.
- `env_file` es la frontera entre lo trackeado (`docker-compose.yml`) y lo secreto (`.env`). Si Claude sugiere meter passwords en `environment:` literal, parar y corregir.
- `docker compose config` resuelve variables y valida el YAML sin levantar nada. Es el `--dry-run` del compose.
- Los volúmenes **nombrados** (`db-data:`) sobreviven a `docker compose down`; los volúmenes **anónimos** o `tmpfs` se pierden. Saber cuál usas evita perder datos de desarrollo.

### 🧩 Ejercicio 2 — Compose multi-servicio para entorno local

> **Rama:** `git checkout tema-23/ejercicio-02` · **Tiempo:** 30 min · **Tipo:** En clase

Extiende el `docker-compose.yml` plantado para que la app y `db-dummy` arranquen como un entorno completo: añade `healthcheck` al servicio `app`, activa `db-dummy` con Postgres pinneado, configura `depends_on` condicional al health, mueve credenciales a `env_file`. Entrega `COMPOSE-NOTES.md` con el YAML final comentado, la decisión sobre exponer o no puertos al host y una sección "qué arrancaría distinto en producción".

---

## 3. Diagnóstico de builds rotas, imágenes pesadas y errores de arranque

Una build rota se manifiesta de tres maneras y cada una se diagnostica distinto:

| Tipo de fallo | Síntoma | Estrategia con Claude |
|---|---|---|
| **Build error** | `docker build` falla en una capa concreta | Pegar el último bloque del error + el `Dockerfile`. Pedir hipótesis ordenadas por probabilidad, no por orden de aparición. |
| **Runtime error** | La imagen construye pero el contenedor muere al arrancar | `docker logs <container>` o `docker compose logs app`. Pegar los logs completos, no solo "no funciona". |
| **Imagen pesada** | `docker images` muestra > 1 GB para una app trivial | Pedir el análisis del `Dockerfile` capa a capa, identificar la que pesa, valorar multi-stage. |

> Regla mental: **el log es la pregunta**. Sin log pegado, cualquier diagnóstico es adivinación. El primer prompt de troubleshooting debe incluir el comando ejecutado, la línea exacta del error y, si es runtime, los últimos 50–100 logs.

### Patrones de runtime errors comunes

- **Variable de entorno mal usada** (`process.env.PORT` vs `process.env.SERVER_PORT`): la app lee una variable que el compose nunca declara y arranca con `undefined`, fallando silenciosamente o usando un default inesperado.
- **Puerto mal expuesto** (`EXPOSE 3000` pero la app escucha en `3001`): el contenedor "arranca" pero `docker run -p 3000:3000` no responde porque dentro no hay nada en `3000`.
- **Permisos** tras añadir usuario no-root: archivos copiados con `COPY --chown=node:node` o el contenedor falla al escribir en `logs/`.
- **Dependencias nativas** que requieren build tools en la imagen final (problema típico con `bcrypt`, `node-gyp`): la imagen slim no los tiene y la app falla al cargar el módulo.

### 🧪 Demo 3 — Diagnosticar un fallo runtime plantado

- **Objetivo:** reproducir un fallo de arranque plantado, leerlo con el agente, formular hipótesis ordenadas y aplicar el fix con justificación.
- **Setup:** rama `tema-23/inicio`. El `docker-compose.yml` plantado tiene un fallo intencional: declara `PORT=3000` en el env del servicio `app`, pero la app lee `SERVER_PORT` (ver `src/server.ts`). Al levantar, la app arranca en el puerto por defecto en lugar del esperado.

**Pasos:**

1. Si hay Docker disponible, levantar el entorno y reproducir:
   ```bash
   docker compose up -d
   docker compose ps
   curl -i http://localhost:3000/health   # falla
   docker compose logs app
   ```
   Si no hay Docker disponible, copiar el contenido literal del `docker-compose.yml` y de `src/server.ts` al prompt.
2. Pedir diagnóstico con la regla del log:
   ```
   Aquí tienes el docker-compose.yml, el Dockerfile y src/server.ts.
   La app arranca pero /health no responde en el puerto mapeado. Dame
   3 hipótesis ordenadas por probabilidad, con cómo verificar cada una.
   ```
3. Confirmar la hipótesis correcta (mismatch `PORT` vs `SERVER_PORT`):
   ```
   Verifica la hipótesis 1 leyendo src/server.ts y el environment del
   docker-compose. ¿Coinciden los nombres de variable?
   ```
4. Aplicar el fix de la manera más explícita posible (renombrar la variable en el compose, no en el código — la convención del código manda):
   ```
   Renombra PORT a SERVER_PORT en el docker-compose.yml. Diff antes/después.
   ```
5. Si hay Docker, `docker compose up -d --force-recreate app` y verificar con `curl`.

**Qué observar:**

- Sin el log o sin el código pegado, el agente adivina. Con ambos, encuentra el mismatch en segundos.
- El fix correcto no es siempre "cambiar el código": a veces la convención del código manda y se cambia el compose. Discutirlo.
- `docker compose logs app` muestra el `console.log` de la app — si dice `listening on :3000` cuando esperabas `:3001`, el problema es de **configuración**, no de red.
- Una vez fixed, dejar el patrón documentado para no caer dos veces: idealmente, un test que falla si `SERVER_PORT` no está definida.

### 🧩 Ejercicio 3 — Diagnóstico de un fallo plantado en build o runtime

> **Rama:** `git checkout tema-23/ejercicio-03` · **Tiempo:** 30 min · **Tipo:** En clase

Reproduce el fallo plantado (mismatch entre `PORT` declarado en el compose y `SERVER_PORT` leído por la app), captura logs, pide a Claude tres hipótesis ordenadas, verifica la correcta y aplica el fix justificando la decisión (¿cambias el compose o el código?). Entrega `TROUBLESHOOTING.md` con el comando ejecutado, los logs relevantes, las tres hipótesis, la verificación de cada una y el fix aplicado con diff.

---

## 4. Revisión de variables, secretos y configuración de contenedores

Las variables de entorno son el contrato entre el contenedor y el mundo. **Mal gestionadas, son la principal fuente de leaks y de bugs de configuración.**

| Categoría | Dónde vive | Trackeado en git |
|---|---|---|
| Defaults seguros | `Dockerfile` (`ENV NODE_ENV=production`) o `.env.example` | Sí |
| Configuración por entorno | `docker-compose.yml` o `compose.override.yml` | Sí (sin secretos) |
| Secretos (passwords, tokens, claves) | `.env` local, secret manager, Docker secrets | **No** |
| Configuración local del dev | `compose.override.yml` (no trackeado) o flags | No |

Checklist de revisión:

- [ ] ¿Hay `.env.example` con TODAS las variables que la app necesita?
- [ ] ¿`.env` está en `.gitignore` y no aparece nunca en `git status`?
- [ ] ¿El `Dockerfile` no contiene `ENV API_KEY=...` literal?
- [ ] ¿El `docker-compose.yml` usa `env_file` o `${VAR}` en vez de credenciales literales?
- [ ] ¿Los logs de la app no imprimen el contenido de `process.env` ni los headers `Authorization`?
- [ ] ¿Las variables tienen nombres consistentes entre código, Dockerfile y compose (no mezcla `PORT`/`SERVER_PORT`/`APP_PORT`)?

> Regla mental: **el contenedor confía en su entorno, no lo construye**. Toda variable que la app necesita debe estar declarada en `.env.example`. Si descubres en producción que falta una, fallaste en la documentación, no en el código.

---

## 5. Optimización de capas y tiempos de build con criterios concretos

Cada `RUN`, `COPY` y `ADD` es una capa. Las capas se cachean. Aprovechar el cache es la diferencia entre builds de 10 segundos y builds de 4 minutos.

### Reglas operativas

| Patrón | Por qué funciona |
|---|---|
| `COPY package*.json ./` **antes** de `RUN npm ci` y **antes** de `COPY . .` | El `npm ci` se cachea hasta que cambian las dependencias, no en cada cambio de código |
| Multi-stage build (`FROM ... AS build`, `FROM ... AS runtime`) | La imagen final no contiene devDependencies ni herramientas de compilación |
| `RUN npm ci --omit=dev && npm cache clean --force` en una sola capa | Evita arrastrar el cache de npm a la siguiente capa |
| Una `RUN` por intención, no por línea | Capas semánticas, fáciles de revisar; no fragmentar artificialmente |
| `.dockerignore` que excluye `node_modules/`, `.git/`, tests, docs | El build context se reduce de cientos de MB a pocos MB |

### Anatomía de un multi-stage típico para Node

```dockerfile
# Stage 1: build (devDependencies, TypeScript, tests)
FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# Stage 2: runtime (solo lo necesario para ejecutar)
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
USER node
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

> El multi-stage **no es opcional para producción**. Una imagen Node con devDependencies pesa el doble y tiene `tsc`, `eslint`, `vitest` dentro. Ninguno corre en producción; todos amplían la superficie de ataque.

---

## 6. Preparación de entornos locales consistentes para todo el equipo

Un entorno local consistente significa que cualquier dev nuevo pasa de `git clone` a `docker compose up` a app funcionando en menos de 10 minutos, **sin instalar nada en su máquina** salvo Docker.

| Pieza | Cómo se materializa |
|---|---|
| Versiones pinneadas | `image: postgres:16-alpine`, no `postgres:latest` |
| Setup en un comando | `docker compose up -d` o `make setup` que llama a compose |
| Variables documentadas | `.env.example` completo, con comentarios sobre qué pone cada variable |
| Datos de seed | Script `scripts/seed.sh` que llena la DB con datos de desarrollo |
| Reset rápido | `docker compose down -v && docker compose up -d` deja el entorno limpio |
| README accionable | Sección "Arranque" con los 3–4 comandos exactos, copiables |

> El test del entorno reproducible: **borra la carpeta del repo, vuelve a clonar, sigue el README**. Si en menos de 10 minutos tienes la app respondiendo, lo tienes. Si tropiezas, el README miente o el compose está incompleto.

---

## 7. Asistencia en logs de contenedor y análisis de fallos en runtime

Los logs de un contenedor son el equivalente a la caja negra de un avión. Con `docker compose logs` (o `docker logs`) los recuperas; con Claude los interpretas.

Patrón productivo:

```bash
docker compose logs --tail=200 app > /tmp/app-logs.txt
cat /tmp/app-logs.txt | claude -p "Resume los errores agrupados por tipo,
estima frecuencia, propón los 3 más críticos para investigar primero."
```

Casos típicos donde el agente acelera la lectura:

- **Stack traces repetidos** que enmascaran un solo error raíz (uno por petición fallida).
- **Logs entrelazados** de varios servicios cuando se hace `docker compose logs` sin filtrar.
- **Cambios de comportamiento entre versiones**: pegar logs del antes y del después, pedir el diff conceptual.
- **Errores asíncronos** sin contexto: el agente busca el `Promise` no manejado en el código y conecta con el log.

> Regla mental: **cuando los logs son ruido, el agente los convierte en señal**. No es magia: es paciencia para leer 500 líneas con vocabulario consistente, algo que un humano hace mal a las 11 de la noche.

---

## 8. Integración de pruebas dentro de contenedores de desarrollo

Lanzar los tests dentro del contenedor garantiza que pasan **en el mismo entorno donde correrá la app**. No depende de "tengo Node 24 instalado" ni "yo uso pnpm".

Patrones:

- **Test como servicio efímero** en compose:
  ```yaml
  services:
    test:
      build: .
      command: npm test
      depends_on:
        db-dummy:
          condition: service_healthy
  ```
  Se lanza con `docker compose run --rm test`.
- **Stage de test en multi-stage** que falla la build si los tests no pasan:
  ```dockerfile
  FROM build AS test
  RUN npm test
  ```
- **CI que usa el mismo `Dockerfile`** que el dev: el entorno de CI no diverge del local.

> Si los tests pasan en local pero fallan en CI, casi siempre es **divergencia de entorno**. Correrlos dentro de un contenedor elimina esa categoría de fallos.

---

## 9. Estrategias para entornos multi-servicio y dependencias locales

Cuando una app real depende de tres o cuatro servicios externos (DB, cache, cola, search), la pregunta no es "¿cómo arranco esto?" sino **"¿qué espero que sea reproducible y qué no?"**.

| Estrategia | Cuándo conviene | Coste |
|---|---|---|
| Todos los servicios en `docker-compose.yml` | Equipo pequeño, deps razonables (DB, Redis, una cola) | Onboarding fácil, RAM consumida en local |
| Servicios pesados en compose, integraciones externas mockeadas | Cuando dependes de S3, Stripe, servicios cloud | Tests rápidos pero divergencia con producción |
| Mix: compose para infra, `localstack` para AWS | Equipos con stack AWS-pesado | Complejidad alta, fidelidad alta |
| Devcontainers (`.devcontainer/`) en VS Code | Equipos que ya viven en VS Code y quieren entorno + extensiones reproducibles | Cierra el desarrollo al editor |

> Regla mental: **no metas todo el universo en compose**. La línea está donde el coste de RAM y mantenimiento supera el beneficio de fidelidad. Una cola que solo se usa en pruebas de integración no pertenece al `docker-compose.yml` del día a día.

### Antipatrones

- ❌ `docker-compose.override.yml` no documentado: cada dev tiene uno distinto, "en mi local va" vuelve.
- ❌ `image: registry.empresa.com/foo:latest` sin pinnear: el equipo entero rompe cuando alguien sube una versión nueva.
- ❌ Servicios "opcionales" que arrancan por defecto: si el 80% del equipo no los usa, deberían vivir en un profile.
- ❌ Volúmenes de bind mount con código compilado dentro (`./dist:/app/dist`): conflicto con el `npm run build` del contenedor.

---

## 10. Uso de Claude Code como copiloto de troubleshooting de plataformas reproducibles

La diferencia entre "Docker te ayuda" y "Docker te tortura" es la disciplina de troubleshooting. Heurísticas:

- **`docker compose config` antes de `docker compose up`** cuando edites el YAML. Valida y resuelve variables sin levantar nada.
- **`docker compose logs --tail=200 <servicio>`** antes de tocar nada. El log dice qué pasa antes que la intuición.
- **Reproducir en limpio:** `docker compose down -v && docker compose up -d` elimina el "estaba a medio levantar" como hipótesis.
- **Un cambio, una verificación.** Si arreglas tres cosas a la vez y funciona, no sabes cuál era. El agente puede aplicar un fix, dejarte verificar, y solo entonces el siguiente.
- **Diff antes del fix.** Pedir `git diff` y leer **lo que va a cambiar** antes de aceptar el cambio. La revisión vale más que la velocidad.
- **Documentar el fix en el commit message.** El siguiente dev (o tú dentro de 3 meses) lo busca con `git log --grep`.

| Antipatrón | Síntoma | Corrección |
|---|---|---|
| Pedir "arregla esto" sin pegar logs | El agente adivina, el problema persiste | Log + comando + Dockerfile/compose en el primer prompt |
| Aplicar 3 fixes a la vez | Funciona pero no sabes cuál era | Uno por uno, verificar entre cada |
| Reescribir el Dockerfile entero al primer error | Pierdes contexto, introduces nuevos bugs | Fix mínimo, luego refactor en otra iteración |
| Confiar en `latest` y "vuelve a probar" | Builds no reproducibles, el problema reaparece | Pinnear versiones, capturar el problema con un test si es posible |
| Ignorar `.dockerignore` porque "ya funciona" | Build context inflado, riesgo de filtrar secretos | Crearlo siempre, aunque sea minimalista |

> Una plataforma reproducible **no se nota**: arranca, hace lo que dice, vuelve a arrancar mañana igual. Cuando empiezas a pelearte con ella (builds raras, "en mi máquina sí", containers que mueren), es señal de que falta disciplina, no de que Docker sea malo.

***

## Resumen

- **Dockerfile = código**. Se audita, se versiona, se revisa. Imagen base mínima, `npm ci`, usuario no-root, `.dockerignore`, capas ordenadas para cache.
- **`docker-compose.yml` = README ejecutable** del entorno. Healthchecks reales, `depends_on` condicional, `env_file` para secretos, versiones pinneadas.
- **Troubleshooting con disciplina**: log + comando + archivo relevante en el primer prompt. Un fix, una verificación. Sin logs, no hay diagnóstico.
- **Multi-stage no es opcional** para producción: imagen final sin devDependencies, sin `tsc`, sin tests dentro.
- **Claude Code como copiloto**: prioriza olores, propone hipótesis ordenadas, aplica fixes mínimos. La decisión arquitectónica sigue siendo tuya.
