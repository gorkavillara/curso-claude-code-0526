# Solución — Tema 23

Soluciones de referencia para el instructor. No compartir con alumnos antes de la sesión.

---

## Ejercicio 1 — `DOCKERFILE-AUDIT.md` esperado

### Tabla de olores esperable (mínimo 5)

| Olor | Impacto | Severidad |
|---|---|---|
| `FROM node:24` (sin `-slim`/`-alpine`) | Imagen ~1 GB, push/pull lentos, superficie ataque grande | Alta |
| `COPY . .` antes de `RUN npm install` | Cualquier cambio de código invalida el cache de `npm install`. Build de 3 min para cambiar una línea | Alta |
| `npm install` en lugar de `npm ci` | Resoluciones distintas entre máquinas, builds no reproducibles | Alta |
| Sin usuario no-root (sin `USER node`) | Contenedor corre como root: CVE de la app = root dentro del contenedor | Alta |
| Sin `.dockerignore` | `node_modules/`, `.git/`, `.env`, logs entran al contexto del build. Riesgo de secretos y build context inflado | Alta |
| `EXPOSE` no documentado o ausente | Onboarding confuso; nadie sabe qué puerto mapear | Media |
| Sin pinneado del `engines.node` o ausencia de `FROM node:24.x.y` específico | Reproducibilidad parcial | Baja |

### Los 3 fixes priorizados

1. **Reordenar capas (cache):** `COPY package*.json ./` + `RUN npm ci` antes de `COPY . .`. Diff conceptual:
   ```diff
   -COPY . .
   -RUN npm install
   +COPY package*.json ./
   +RUN npm ci
   +COPY . .
   ```
   Renta porque cada `docker build` posterior, mientras no cambien las dependencias, reusa el cache del `npm ci`.

2. **`npm install` → `npm ci`:** ya incluido en el fix 1. Renta por reproducibilidad: el `package-lock.json` manda; si está desactualizado, la build falla — que es lo correcto.

3. **Usuario no-root:** añadir `USER node` antes del `CMD`. Si la app escribe en `logs/` o algún directorio, ajustar permisos con `COPY --chown=node:node` o `RUN chown -R node:node /app/logs`.

### `.dockerignore` mínimo correcto

```
node_modules
.git
.gitignore
.env
.env.*
!.env.example
logs
coverage
*.md
!README.md
.dockerignore
Dockerfile
docker-compose*.yml
.vscode
.idea
.DS_Store
Thumbs.db
```

### Decisión razonada sobre multi-stage

Respuesta modelo:

> "En este ejercicio dejo multi-stage para una iteración posterior. Los 3 fixes aplicados ya reducen tamaño (slim), aceleran builds (cache) y mejoran seguridad (no-root). Multi-stage tiene sentido cuando hay un paso de build real (TypeScript a JS, bundler) y la imagen final no debería contener devDependencies ni herramientas de compilación. En Notebox actual, el `node src/server.ts` corre TS directo con Node 24 — no hay `dist/`. Cuando se introduzca `npm run build` con salida a `dist/`, ahí entra multi-stage. Aplicarlo ahora sería complicar el Dockerfile sin beneficio inmediato."

Aceptable también la respuesta opuesta ("lo introduzco ya") siempre que justifique cómo separa stages (`build` con devDeps + tsc, `runtime` con solo `node_modules` de prod + `dist/`).

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| Priorizan "añadir comentarios" arriba | Criterio cosmético. Empujar a impacto en build time / tamaño / seguridad. |
| Aplican los 3 fixes en un solo prompt sin ver diffs | Pierden la trazabilidad. Forzar uno a uno. |
| Crean `.dockerignore` ignorando solo `node_modules` | Falta `.git`, `.env*`, logs. Riesgo de secretos en build context. |
| Cambian a `node:alpine` sin avisar de potenciales fallos con módulos nativos | Aceptable, pero deben mencionar el riesgo en el `.md`. |

---

## Ejercicio 2 — `COMPOSE-NOTES.md` esperado

### YAML final esperable (versión mínima válida)

```yaml
services:
  app:
    build: .
    ports:
      - "3001:3001"
    env_file: .env
    environment:
      SERVER_PORT: 3001
      NODE_ENV: development
    depends_on:
      db-dummy:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 10s
    networks:
      - notebox-net

  db-dummy:
    image: postgres:16-alpine
    env_file: .env
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - notebox-net

volumes:
  db-data:

networks:
  notebox-net:
```

Criterios de validez:

- `app` tiene healthcheck a `/health`.
- `db-dummy` tiene `pg_isready` como healthcheck.
- `depends_on` usa `condition: service_healthy`, no la forma corta.
- `env_file: .env` para credenciales, no `environment:` literal con passwords.
- `image: postgres:16-alpine` (pinneado).
- Volumen nombrado para persistir DB entre reinicios.

### Decisión: exponer Postgres al host

Respuesta modelo:

> "No expongo el puerto 5432 al host por defecto. La app accede a Postgres por la red interna de Docker (`db-dummy:5432` resoluble dentro de la red `notebox-net`). Exponerlo solo es útil si conecto con un cliente externo (psql, DataGrip) y, aun así, prefiero hacerlo en un `compose.override.yml` no trackeado para no obligar al resto del equipo."

Aceptable la versión contraria si justifica el caso de uso (debug local con cliente externo) y propone overrides para producción.

### "Qué arrancaría distinto en producción"

Mínimo 3 puntos. Ejemplos válidos:

- **Imagen:** en prod, build optimizada con multi-stage; en local, basta `build: .` directo.
- **Secretos:** en prod, Docker secrets o secret manager (Vault, AWS Secrets Manager); en local, `.env` no trackeado.
- **Healthcheck más estricto:** intervalos más largos en prod, `start_period` más generoso si el arranque es lento.
- **Réplicas/escala:** `deploy.replicas` para escalar la app; no en compose local.
- **Logging:** driver de logs centralizado (`json-file` con rotación, o un driver remoto); en local, default.
- **Volúmenes:** en prod, volúmenes gestionados (EBS, NFS), no bind mounts.
- **Networks:** en prod, separación entre red pública y privada; en local, una sola.

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| `image: postgres:latest` | Versión flotante. Pinnear a `16-alpine` (o la que sea). |
| `environment:` literal con `POSTGRES_PASSWORD: secret123` | Hardcode de credenciales. Mover a `env_file`. |
| `depends_on: [db-dummy]` (forma corta) | Solo espera al arranque, no al healthcheck. Cambiar a forma larga con `condition`. |
| Healthcheck del `app` usando `curl` cuando la imagen slim no tiene curl | Usar `wget` (sí está en slim) o instalar curl explícitamente. |
| Sin volumen nombrado para Postgres | Pierdes datos en cada `docker compose down`. Añadir `db-data`. |
| Exponen `5432:5432` al host "por si acaso" | Innecesario para la app. Solo si lo justifican. |

---

## Ejercicio 3 — `TROUBLESHOOTING.md` esperado

### Las 3 hipótesis esperables (en este orden)

1. **Variable de entorno con nombre distinto entre compose y código.** El compose declara `PORT`, el código lee `SERVER_PORT`. Verificación: leer `src/server.ts` línea del `process.env.SERVER_PORT` y comparar con el bloque `environment:` del compose.
2. **Mapping de puertos incorrecto.** El `ports:` del compose mapea `3001:3001` pero la app escucha en otro puerto interno. Verificación: leer el `EXPOSE` del Dockerfile y comparar con `ports:`.
3. **Healthcheck mal configurado** que reporta `unhealthy` aunque la app responda. Verificación: ejecutar manualmente `docker exec app wget -qO- http://localhost:3001/health`.

Lo crítico es que la 1 esté arriba. Si el alumno la pone abajo, discutir por qué (suele ser que no leyó el código).

### Verificación de la hipótesis 1

Lectura esperada:

- `src/server.ts` contiene `const port = process.env.SERVER_PORT ?? 3000;`
- `docker-compose.yml` declara `PORT: 3001` en `environment:` del servicio `app`.
- **Conclusión:** la app nunca recibe `SERVER_PORT`, cae al default (`3000`). Por eso `curl http://localhost:3001/health` falla.

### Fix aplicado

Diff esperable:

```diff
   app:
     build: .
     ports:
       - "3001:3001"
     environment:
-      PORT: 3001
+      SERVER_PORT: 3001
       NODE_ENV: development
```

### Decisión razonada: ¿compose o código?

Respuesta modelo:

> "Cambio el compose, no el código. Razones:
> 1. La convención del proyecto ya está escrita: `src/server.ts` lee `SERVER_PORT`. Cambiarlo a `PORT` impactaría posibles tests, scripts (`.env.example`), documentación.
> 2. `PORT` es un nombre demasiado genérico (chocando con otras herramientas). `SERVER_PORT` es explícito y específico de esta app.
> 3. El compose es declarativo y nuevo: tocarlo es de bajo riesgo. El código es la fuente de verdad y tiene cobertura."

Aceptable la decisión contraria si argumentan: "el equipo usa `PORT` en todos los servicios para consistencia, prefiero renombrar la variable en el código y actualizar `.env.example`". Lo importante es la **justificación**, no la respuesta concreta.

### Test que captura el problema (bonus)

Respuesta modelo:

```ts
// test/env-config.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('configuración de entorno', () => {
  it('SERVER_PORT está documentado en .env.example', async () => {
    const fs = await import('node:fs');
    const example = fs.readFileSync('.env.example', 'utf8');
    assert.match(example, /SERVER_PORT/, '.env.example debe declarar SERVER_PORT');
  });
});
```

Test sencillo que falla si alguien renombra la variable en el código pero olvida `.env.example`. No captura el caso exacto (un compose con `PORT` literal sigue pasando), pero es el patrón que el alumno **podría** proponer. Bonus si alguien escribe un test que valida que `docker-compose.yml` declara `SERVER_PORT` (parsing YAML).

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| Pegan "no funciona, ayuda" como primer prompt | Adivinanza garantizada. Forzar log + comando + archivo. |
| Aceptan la primera hipótesis sin verificarla en el código | Pueden coger la incorrecta. Forzar "verifica leyendo el archivo X". |
| Cambian compose y código a la vez | Si funciona, no saben cuál era. Uno a uno. |
| No justifican la decisión (compose vs código) | El "qué" sin el "por qué" no es aprendizaje. |
| Reportan "lo arreglé" sin diff | Diff antes/después es obligatorio. |

---

## Coherencia con docs/ y guion

- Las tres demos del guion (auditoría de Dockerfile, extensión de compose multi-servicio, diagnóstico de mismatch `PORT`/`SERVER_PORT`) coinciden 1:1 con las del `docs/tema-23-docker.md`. Mismos prompts literales.
- Los tres ejercicios entregan tres documentos distintos: `DOCKERFILE-AUDIT.md`, `COMPOSE-NOTES.md`, `TROUBLESHOOTING.md`. No se confunden entre ramas.
- Las previews 🧩 en docs/ repiten literalmente la rama, el tiempo (30 min) y el tipo (En clase).
- El endpoint `/health` ya existe en `src/server.ts` desde el Tema 22; el Tema 23 lo usa para el healthcheck del compose.
- El mismatch `PORT`/`SERVER_PORT` está plantado en el `docker-compose.yml` de `tema-23/inicio`. El alumno no necesita crear nada.
