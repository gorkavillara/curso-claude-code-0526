# Tema 23 — Docker, entornos reproducibles y troubleshooting

> Duración estimada: 90 min · Tipo: práctico + demos guiadas.
> Repositorio de prácticas: rama `tema-23/inicio` (Notebox con `Dockerfile` plantado con olores reales, `docker-compose.yml` con mismatch de variable, `.env.example`, `.dockerignore` ausente, `/health` ya existente en `src/server.ts`).

## 0. Objetivo del tema

Que el alumno trate Docker como **un archivo más del repo**: lo audite con criterio (simplicidad, seguridad, reproducibilidad), lo extienda para entornos multi-servicio con `docker-compose`, y diagnostique fallos reales con la disciplina del log + el comando + el archivo. Claude Code entra como revisor y copiloto de troubleshooting, no como generador ciego de Dockerfiles.

---

## 1. Flujo de sesión

Estructura **intercalada**. Cada bloque es una pieza autónoma (Dockerfile / compose / troubleshooting) y el ejercicio aplica el patrón en caliente, como en los Temas 21 y 22.

```
00:00 — Encuadre                                          (5 min)
00:05 — Demo 1: auditar Dockerfile, 3 fixes priorizados   (10 min)
00:15 — Ejercicio 1: auditoría y reescritura              (30 min, en clase)
00:45 — Demo 2: extender docker-compose multi-servicio    (10 min)
00:55 — Ejercicio 2: compose con healthcheck y env_file   (30 min, en clase)
01:25 — Demo 3: diagnóstico de fallo runtime plantado     (10 min)
01:35 — Ejercicio 3: troubleshooting de mismatch PORT     (30 min, en clase)
02:05 — Cierre y puente                                   (5 min)
```

> Nota de timing: el tema cabe en 90 min si los ejercicios bajan a 20 min cada uno. La versión completa son ~125 min y se recomienda en formato bloque de 2h. Si la sesión va corta, recortar el Ejercicio 3 (troubleshooting) a 15 min: el aprendizaje principal está en E1 (auditar) y E2 (componer).

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "Llevamos 22 temas tratando el código. Hoy bajamos al sustrato: el entorno donde corre. Docker es el archivo que más se copia de StackOverflow del repo entero — y por eso es el que más bugs sutiles tiene. Imágenes de 1 GB para apps de 10 MB, `npm install` en lugar de `npm ci`, contenedores como root, `.dockerignore` ausente. Hoy aprendemos a usar Claude Code como **revisor** de Dockerfile y como **copiloto de troubleshooting** cuando algo no arranca."

Tres ideas en pizarra:

1. **Dockerfile = código.** Se audita, se versiona, se revisa. Imagen mínima, `npm ci`, no-root, `.dockerignore`, capas ordenadas para cache.
2. **`docker-compose.yml` es el README ejecutable del entorno.** Si miente, no hay onboarding. Healthchecks reales, `depends_on` con `condition`, versiones pinneadas, `env_file` para secretos.
3. **Troubleshooting con disciplina.** El primer prompt lleva el log, el comando y el archivo relevante. Sin eso, el agente adivina.

> "Hoy vais a tocar **tres ramas**: una para auditar el Dockerfile, otra para extender el compose con un servicio dependiente, otra para diagnosticar un fallo plantado. Ninguna requiere tener Docker instalado para entregar la práctica — los ejercicios funcionan leyendo y editando los archivos. Si tenéis Docker disponible, podéis verificar con `docker build` y `docker compose up`. Si no, el aprendizaje sigue intacto: el agente lee logs igual."

---

## 3. Demo 1 + Ejercicio 1 — Auditoría del Dockerfile (≈ 40 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-23/inicio && npm install && npm test`. Verificar que existe `Dockerfile` en la raíz con los olores plantados y que **no existe `.dockerignore`**. Abrir el REPL desde la raíz.

**Prompt literal (dentro del REPL):**

```
Audita el Dockerfile de este repo. Lista los problemas en una tabla con
columnas: olor, impacto, severidad (alta/media/baja). Sin reescribir todavía.
```

(esperar diagnóstico)

```
De los problemas detectados, dame los 3 que más rentan arreglar primero
y por qué. Considera impacto en build time, tamaño de imagen y seguridad.
```

(esperar priorización)

```
Aplica el fix 1. Muéstrame el diff. Explica qué cambia en la build.
```

(repetir para fix 2 y 3)

```
Crea un .dockerignore mínimo correcto: ignorar node_modules/, .git/,
.env*, logs/, coverage/, *.md salvo README.md.
```

Lo que el alumno ve:

- La tabla de olores debe incluir, como mínimo: imagen base no slim, `npm install` en lugar de `npm ci`, sin usuario no-root, `COPY . .` antes de instalar deps, sin `.dockerignore`.
- La priorización **debe** apuntar a las tres rentables: orden de capas (cache), `npm ci` (reproducibilidad), usuario no-root (seguridad). Si el agente prioriza cosmética, redirigir con un prompt explícito.
- El diff de reordenar `COPY package*.json ./` + `RUN npm ci` antes de `COPY . .` cambia la build de ~3 min a segundos cuando solo cambia código.
- Sin `.dockerignore`, `docker build` envía `node_modules/` al daemon. Verificable con `docker build` si está disponible.

> "El Dockerfile no es una receta. Es código. Y como cualquier código, se revisa antes de pasar a producción. Hoy hacemos esa revisión con Claude. La próxima vez, en el PR del compañero."

### Ejercicio 1 (30 min)

> **Rama:** `git checkout tema-23/ejercicio-01`

Los alumnos:

1. Verifican `npm install && npm test`. Todo en verde.
2. Auditan el `Dockerfile` plantado con el primer prompt (tabla de olores).
3. Priorizan los problemas (segundo prompt). Razonan por qué cada uno está donde está.
4. Aplican **los 3 fixes más rentables**, uno a uno, viendo el diff antes de aceptar. Mínimo: reordenar capas, `npm ci`, usuario no-root.
5. Crean el `.dockerignore` mínimo correcto.
6. (Opcional, si tienen Docker) Construyen antes y después: `docker build -t notebox:before .` (capturar tamaño) y `docker build -t notebox:after .` (comparar).
7. Rellenan `DOCKERFILE-AUDIT.md`:
   - Tabla de olores detectados (mínimo 5).
   - Los 3 fixes aplicados con diff antes/después.
   - Decisión razonada sobre **multi-stage**: ¿lo introduces ahora o lo dejas para otra iteración? Justificar.
   - (Si pudieron correr Docker) Tamaño de imagen antes y después.

**Lo que el formador observa:**

- ¿Detectan los olores estructurales (orden de capas, `npm ci`, no-root) o se quedan en cosmética (comentarios, espacios)?
- ¿La priorización tiene criterio o es alfabética? Empujar a "qué renta más por minuto de trabajo".
- ¿Aceptan el primer diff sin leerlo? Pedir que **antes de cada `aplica`** ya hayan dicho qué esperan ver.
- ¿Algún alumno propone multi-stage en el ejercicio 1? Buena señal, pero recordarles que el `.md` debe **justificar** la decisión, no solo aplicarla.

> "Tres fixes hoy. Multi-stage probablemente mañana. La regla es: un cambio, una verificación. Reescribir el Dockerfile entero al primer error es la receta para introducir tres bugs nuevos."

---

## 4. Demo 2 + Ejercicio 2 — Compose multi-servicio (≈ 40 min)

### Demo 2 (10 min)

> Setup: `git checkout tema-23/inicio`. Verificar que existe `docker-compose.yml` con un único servicio `app` y un placeholder `db-dummy` comentado, y `.env.example` con las variables esperadas. El endpoint `GET /health` ya está implementado en `src/server.ts`.

**Prompt literal (dentro del REPL):**

```
Lee docker-compose.yml. Lista qué hay declarado y qué faltaría
para un entorno realista (db, healthcheck, env_file, networks).
```

(esperar)

```
Añade un healthcheck al servicio app que llame a GET /health
cada 10s con un retry de 3. Muéstrame el diff.
```

(esperar)

```
Activa el servicio db-dummy con postgres:16-alpine, healthcheck con
pg_isready, env_file .env (no environment literal). La app debe esperar
a que db-dummy esté healthy antes de arrancar.
```

(esperar)

```
Copia .env.example a .env. ¿Está .env en .gitignore?
```

Si hay Docker disponible, mostrar:

```bash
docker compose config            # validar el YAML
docker compose up -d
docker compose ps                # ver estado y health
docker compose down
```

Lo que el alumno ve:

- El healthcheck del servicio `app` apunta a `/health` (que ya devuelve `{ok: true}`). `docker compose ps` muestra `healthy` cuando responde.
- `depends_on: db-dummy: condition: service_healthy` espera al healthcheck real de Postgres (`pg_isready`), no al arranque del proceso. Diferencia visible si la app intenta conectar antes.
- `env_file: .env` separa lo trackeado de lo secreto. Si el agente sugiere meter passwords en `environment:` literal, parar.
- `docker compose config` es el `--dry-run`: valida y resuelve variables sin levantar nada.

> "El compose es el README ejecutable. Si dice que la DB es Postgres 16 y arrancas con Postgres 15 a mano, fallaste tú. Si el compose miente o falta declarar una variable, falla el compose. Esa diferencia es la que estamos atacando hoy."

### Ejercicio 2 (30 min)

> **Rama:** `git checkout tema-23/ejercicio-02`

Los alumnos:

1. Verifican `npm install && npm test`.
2. Leen el `docker-compose.yml` plantado y enumeran qué falta (mínimo: healthcheck, db real, env_file).
3. Añaden healthcheck al servicio `app` apuntando a `/health`.
4. Activan `db-dummy` con `postgres:16-alpine`, healthcheck con `pg_isready`, `env_file: .env`.
5. Configuran `depends_on: db-dummy: condition: service_healthy`.
6. Copian `.env.example` a `.env`. Verifican que `.env` está en `.gitignore`.
7. (Opcional, si tienen Docker) `docker compose config` para validar, `docker compose up -d` para levantar, `docker compose ps` para verificar healths.
8. Rellenan `COMPOSE-NOTES.md`:
   - YAML final comentado (cada bloque explica qué hace).
   - Decisión: ¿expones el puerto de Postgres al host (`5432:5432`) o lo dejas solo en la red interna? Justificar.
   - Sección "qué arrancaría distinto en producción": al menos 3 puntos (imagen, secretos, healthcheck, escala, logging).

**Lo que el formador observa:**

- ¿Usan `image: postgres:16-alpine` (pinneado) o caen en `postgres:latest`? Forzar pinneado.
- ¿`env_file` o `environment:` literal con passwords? El segundo es bug.
- ¿Exponen Postgres al host por defecto? Discutir: solo si lo necesitan; por defecto, no.
- ¿Definen un volumen nombrado para los datos de la DB o se conforman con perderlos en cada `down`? Pequeño detalle, gran diferencia.

> "Una pregunta de control: si mañana entra alguien nuevo al equipo y hace `docker compose up`, ¿le funciona todo en menos de 10 minutos? Si no, falta un fixture o sobra documentación que no es ejecutable."

---

## 5. Demo 3 + Ejercicio 3 — Troubleshooting de fallo runtime (≈ 40 min)

### Demo 3 (10 min)

> Setup: `git checkout tema-23/inicio`. El `docker-compose.yml` plantado tiene un mismatch intencional: declara `PORT=3001` en `environment` del servicio `app`, pero `src/server.ts` lee `process.env.SERVER_PORT`. La app arranca pero en el puerto por defecto (`3000`), no en el mapeado (`3001`).

**Si hay Docker disponible:**

```bash
docker compose up -d
docker compose ps
curl -i http://localhost:3001/health   # falla o timeout
docker compose logs app                # muestra "listening on :3000"
```

**Prompt literal (dentro del REPL):**

```
Aquí tienes el docker-compose.yml, el Dockerfile y src/server.ts.
La app arranca pero /health no responde en el puerto mapeado. Dame
3 hipótesis ordenadas por probabilidad, con cómo verificar cada una.
```

(esperar — la hipótesis 1 debería ser el mismatch de variable)

```
Verifica la hipótesis 1 leyendo src/server.ts y el environment del
docker-compose. ¿Coinciden los nombres de variable?
```

(esperar)

```
Renombra PORT a SERVER_PORT en el docker-compose.yml. Diff antes/después.
```

(si hay Docker)

```bash
docker compose up -d --force-recreate app
curl -i http://localhost:3001/health   # ahora responde
```

Lo que el alumno ve:

- Sin pegar logs ni código, el diagnóstico inicial sería adivinanza. Con ambos, el mismatch salta en la primera respuesta.
- La decisión no es trivial: ¿cambias el código (renombrar a `PORT`) o el compose (renombrar a `SERVER_PORT`)? La convención del código manda — el código ya estaba escrito y el compose es declarativo. Hablarlo.
- `docker compose logs app` muestra `listening on :3000` literal. El log **es** la pregunta resuelta; sin él hubiéramos perseguido la red, los puertos, el firewall.

> "La regla de oro del troubleshooting: el primer prompt lleva tres cosas — el comando que falla, el log completo, y el archivo más probable. Sin las tres, Claude adivina; con las tres, encuentra el problema en segundos. Hoy practicamos ese reflejo."

### Ejercicio 3 (30 min)

> **Rama:** `git checkout tema-23/ejercicio-03`

Los alumnos:

1. Verifican `npm install && npm test`.
2. Si tienen Docker: levantan con `docker compose up -d`, intentan `curl http://localhost:3001/health`, capturan el log con `docker compose logs app`.
3. Si no tienen Docker: leen el `docker-compose.yml` y `src/server.ts`, identifican el mismatch a ojo.
4. Pegan el contexto en Claude (compose + server.ts + log si lo tienen) y piden las **tres hipótesis ordenadas**.
5. Verifican la hipótesis 1 leyendo los archivos.
6. Aplican el fix justificando la decisión (¿compose o código?). Diff antes/después.
7. (Si tienen Docker) `docker compose up -d --force-recreate app` y verifican que `/health` responde.
8. Rellenan `TROUBLESHOOTING.md`:
   - Comando ejecutado (o "no tengo Docker, leí los archivos").
   - Logs relevantes (literal, copiados — o "no aplica").
   - Las 3 hipótesis pedidas, en orden.
   - Verificación de cada hipótesis (qué leíste, qué descartaste).
   - Fix aplicado con diff.
   - Decisión razonada: ¿por qué cambiaste el compose y no el código (o al revés)?

**Lo que el formador observa:**

- ¿Pegan logs en el primer prompt o piden ayuda "porque no funciona"? La diferencia decide el resto del ejercicio.
- ¿Aceptan la primera hipótesis sin verificarla? Forzar verificación con lectura del archivo.
- ¿Justifican la decisión (compose vs código) o la toman al azar? Discutir convenciones de equipo.
- ¿Algún alumno propone un test que captura el problema para que no vuelva? Excelente. Apúntalo y dáselo de ejemplo al resto en el cierre.

> "Un fix sin un test que lo capture es un fix que volverá. No siempre podéis añadir el test ya — a veces el alcance del ejercicio no da — pero apuntad en `TROUBLESHOOTING.md` qué test añadiríais. Esa frase, en un PR real, es la diferencia entre el dev junior y el senior."

---

## 6. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Dockerfile = código**. Se audita por simplicidad, seguridad, reproducibilidad y cache.
2. **`docker-compose.yml` = README ejecutable** del entorno. Healthchecks reales, `depends_on` condicional, `env_file`, versiones pinneadas.
3. **Troubleshooting con disciplina**: log + comando + archivo en el primer prompt. Un fix, una verificación.
4. **Claude Code como revisor de plataforma**, no como generador ciego. Tú decides; el agente prioriza y propone.

**Puente al Tema 24:**

> "Hemos hecho que un dev nuevo pueda hacer `docker compose up` y tener la app respondiendo en 10 minutos. En el Tema 24 damos el siguiente salto: cómo Claude Code os ayuda a **integrar esto en pipelines**. GitHub Actions, GitLab CI, jobs de build / test / lint / scan / deploy. Lo que hoy es vuestro entorno local, mañana es el pipeline que protege producción."

---

## 7. Notas para el formador

- **Requisito técnico:** Node 24+ para los tests. Docker es **opcional** — los tres ejercicios se pueden entregar leyendo y editando los archivos, sin levantar contenedores. Si la mayoría de la clase tiene Docker, animar a verificar con `docker build` y `docker compose up`. Si nadie lo tiene, no detener la clase: el aprendizaje principal es la lectura crítica y la disciplina de troubleshooting.

- **Pregunta típica:** *"¿No es Docker Desktop pesado para tenerlo arrancado siempre?"* → Sí. Por eso muchos equipos usan Colima (macOS), Podman, Rancher Desktop o WSL2 directo. No es responsabilidad del curso elegir runtime; sí lo es saber que la elección existe.

- **Pregunta típica:** *"¿`npm install` vs `npm ci` no es lo mismo?"* → `npm install` puede resolver versiones distintas si el lock está desactualizado, y reescribe `package-lock.json`. `npm ci` falla si no hay lock o si está fuera de sincro, y nunca toca el lock. Para builds reproducibles (CI y Docker), siempre `npm ci`.

- **Pregunta típica:** *"¿Por qué `postgres:16-alpine` y no `postgres:latest`?"* → Reproducibilidad. `latest` cambia silenciosamente y rompe el equipo entero un martes por la mañana. La diferencia entre "infra estable" e "infra que sangra" es pinnear versiones.

- **Error común en el Ejercicio 1:** confunden olores estructurales (orden de capas) con olores cosméticos (comentarios). Empujar a "qué renta más por minuto", no "qué se ve peor".

- **Error común en el Ejercicio 2:** declaran `environment:` literal con passwords en lugar de `env_file`. Detectarlo en `COMPOSE-NOTES.md` revisando el YAML final.

- **Error común en el Ejercicio 3:** pegan "no funciona" como prompt y aceptan la primera adivinanza. Forzarles a recopilar el contexto (compose + server.ts + log) **antes** de hablar con el agente.

- **Si la sesión va sobrada:** pedir al alumno más rápido que **añada multi-stage** al Dockerfile del Ejercicio 1, midiendo el tamaño antes y después con `docker images`. Práctica adicional, alta densidad pedagógica.

- **Sobre Docker no disponible:** documentado en `notas.md` del Componente 4. Los ejercicios entregan los `.md` igualmente porque el trabajo cognitivo (auditar, priorizar, diagnosticar) no depende del runtime. La verificación con `docker build` y `docker compose up` es bonus.

- **Sobre `.claude/skills/`:** sigue valiendo el patrón de temas anteriores. Las skills DEL AUTOR (`curso-tema-doc`, etc.) NO se trackean — están en `.gitignore` del repo de código. Verificar antes de pushear.

- **Sobre cargas de la imagen `postgres:16-alpine`:** en clase, si todos los alumnos hacen `docker compose up` a la vez, la primera vez puede tardar (descarga ~80 MB). Pedir que el día anterior hagan `docker pull postgres:16-alpine` si pueden, para evitar 5 minutos muertos descargando.
