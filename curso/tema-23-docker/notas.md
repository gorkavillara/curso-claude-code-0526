# Notas internas — Tema 23

Notas operativas del autor sobre decisiones de diseño y limitaciones que no caben en el guion.

---

## Sobre la verificación con Docker durante la preparación del tema

Durante la generación del tema, el cliente `docker` estaba instalado en la máquina de preparación (`Docker version 25.0.3`) pero el **daemon no estaba arrancado** (Docker Desktop apagado / WSL2 sin Docker activo). Por tanto:

- **No se ejecutó `docker build .`** sobre el `Dockerfile` plantado en `tema-23/inicio` ni sobre los de los ejercicios.
- **No se ejecutó `docker compose config` / `docker compose up`** sobre el `docker-compose.yml` plantado.
- La validación del fixture se hizo por **lectura cruzada** y por los smoke tests de Node (`test/docker-fixtures.test.ts`), que verifican estructura y contenido sin levantar el runtime de Docker.

**Implicación para clase:** el día de la sesión, el instructor **debe verificar al menos una vez** que `docker build .` produce los warnings esperados (o falla, según el caso) y que `docker compose config` valida el YAML. Si en clase aparece un error de sintaxis Docker que no detectaron los smoke tests, anotarlo y arreglar el fixture entre cohortes.

Los tres ejercicios siguen siendo entregables sin Docker: el trabajo cognitivo (auditar, priorizar, diagnosticar) no depende del runtime. Está documentado así en el guion y en el README de `tema-23/inicio`.

---

## Por qué los olores del Dockerfile están plantados, no pedidos al alumno que los introduzca

El **principio inviolable** de la skill `curso-tema-doc` (Componente 3) exige que el escenario esté en el repo. Por eso `tema-23/inicio` tiene un `Dockerfile` **con olores reales**:

- `FROM node:24` (sin slim/alpine).
- `COPY . .` antes de `RUN npm install`.
- `npm install` en lugar de `npm ci`.
- Sin `USER node`.
- `.dockerignore` ausente.

El alumno hace `git checkout tema-23/ejercicio-01 && npm install && npm test` y todo está listo para auditar. **No** se le pide "haz un Dockerfile malo a propósito" ni "imagina que tienes un Dockerfile con X".

Riesgo: un alumno avanzado puede mirar el Dockerfile y arreglar todo de cabeza sin usar el agente. Buena señal — el agente está para acelerar la revisión, no para sustituir el criterio. El ejercicio entrega `DOCKERFILE-AUDIT.md`; ahí se ve si la priorización fue propia o regurgitada del agente.

---

## Por qué el mismatch del Ejercicio 3 es `PORT` ↔ `SERVER_PORT`

Hay varios fallos plantables (puerto mal expuesto, healthcheck roto, dependencia nativa rota, etc.). El elegido es **mismatch de variable de entorno entre compose y código** porque:

- Es **comunísimo en el mundo real** — pasa cada vez que un dev nuevo lee un README y declara `PORT=...` siguiendo intuición.
- Se diagnostica leyendo **dos archivos pequeños** (`docker-compose.yml` y `src/server.ts`). El ejercicio cabe en 30 min.
- Enseña la **regla de oro del troubleshooting**: log + comando + archivo en el primer prompt.
- Tiene **decisión arquitectónica genuina**: ¿cambio compose o cambio código? No hay respuesta única.
- Es **independiente de Docker estar arrancado**: el alumno puede entregar el ejercicio leyendo los archivos, sin levantar nada.

Alternativas valoradas y descartadas:

- **Puerto mal expuesto en Dockerfile** (`EXPOSE 3000` vs app en `3001`): demasiado obvio si hay `EXPOSE` declarado, y requiere Docker para reproducir el fallo de red.
- **Dependencia nativa rota en alpine** (`bcrypt` sin `python3` ni `build-base`): muy realista pero requiere Docker para reproducir el error de build.
- **Healthcheck con `curl` en imagen slim sin curl**: bueno pero requiere ejecutar compose para verlo.

Mantengo el mismatch como problema central. Los otros aparecen mencionados en docs/ como categorías pero no se plantan.

---

## Por qué `db-dummy` es Postgres y no MongoDB / Redis / etc.

Postgres es la opción más neutra:

- Imagen oficial bien mantenida (`postgres:16-alpine`, ~80 MB).
- `pg_isready` viene preinstalado y funciona como healthcheck out-of-the-box.
- `env_file` con `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` es el patrón canónico de toda doc de Docker.
- La app **no** se conecta realmente a Postgres en el Tema 23 — es un "servicio dependiente" para practicar `depends_on: condition: service_healthy`. Para eso, cualquier DB sirve; Postgres es la que más alumnos van a encontrarse en producción.

Alternativas valoradas:

- **MongoDB:** healthcheck más complejo (requiere `mongosh --eval`).
- **Redis:** muy ligero pero no enseña el patrón "espera a que la DB esté lista".
- **MySQL/MariaDB:** equivalente a Postgres, pero más cuota de mercado en stacks Java/PHP que en Node.

---

## Por qué `.env.example` y no `.env` plantado

`.env` está en `.gitignore` global de Notebox desde el Tema 5 (seguridad). Plantarlo trackeado rompería la convención del repo.

`.env.example` sí va trackeado, con todas las variables que la app y el compose esperan, con **valores ficticios**:

```
# Server
SERVER_PORT=3001
NODE_ENV=development

# Database (db-dummy)
POSTGRES_USER=notebox
POSTGRES_PASSWORD=notebox_dev_password
POSTGRES_DB=notebox_dev
DATABASE_URL=postgres://notebox:notebox_dev_password@db-dummy:5432/notebox_dev
```

El alumno copia `.env.example` a `.env` como parte del Ejercicio 2. Es un paso intencionalmente explícito: practica el reflejo "entorno nuevo = copio el example, lleno valores reales, no commiteo".

---

## Por qué no se trabaja con devcontainers en este tema

Los devcontainers (`.devcontainer/` para VS Code) son una variante interesante de "entorno reproducible", pero:

- Acoplan al editor (VS Code / Cursor). Cualquiera que use JetBrains, vim, neovim, etc., queda fuera.
- Solapan parcialmente con `docker-compose`: muchos `.devcontainer/devcontainer.json` apuntan a un `docker-compose.yml`.
- El Tema 3 ya menciona devcontainers como opción del IDE.

**Decisión:** se mencionan brevemente en el punto 9 ("Estrategias para entornos multi-servicio") como **una estrategia más**, sin plantar fixture. Si un alumno los usa en su día a día, puede proponer un `.devcontainer/` en sus notas — pero no es parte del recorrido obligatorio.

---

## Sobre el README de `tema-23/inicio`

El README de la rama documenta:

- Los fixtures plantados (`Dockerfile`, `docker-compose.yml`, `.env.example`).
- Cómo arrancar (`npm install && npm test`) sin Docker.
- Cómo verificar con Docker si está disponible (`docker build`, `docker compose config`, `docker compose up`).
- Que Docker es **opcional** para entregar los ejercicios.

Es importante que el README **no** mienta: si dice "ejecuta `docker compose up` y verás X", X tiene que pasar. Por eso el README es prudente — describe qué hay, no qué pasa al ejecutar (porque depende del runtime del alumno).
