---
hidden: true
---

# Tema 4 — Configuración: settings, scopes y políticas

> **Duración estimada:** \~60 min **Tipo:** práctico + demos guiadas

## Objetivo del tema

Dominar **dónde vive cada ajuste**, **quién lo gana en caso de conflicto** y cómo usar la configuración para imponer reglas razonables a nivel personal y de equipo.

***

## 1. Estructura jerárquica de configuración en ámbito managed, user, project y local

| Scope       | Ubicación                       | Quién la edita  | Versionada             | Precedencia |
| ----------- | ------------------------------- | --------------- | ---------------------- | ----------- |
| **Managed** | Política corporativa (MDM / IT) | Admin de la org | —                      | 🥇 Máxima   |
| **Local**   | `.claude/settings.local.json`   | Tú              | ❌ No (en `.gitignore`) | 🥈          |
| **Project** | `.claude/settings.json`         | El equipo       | ✅ Sí                   | 🥉          |
| **User**    | `~/.claude/settings.json`       | Tú              | ❌ No                   | Mínima      |

> Orden mental: **managed > local > project > user**. Si dos scopes contradicen, gana el de mayor precedencia.

## 2. Uso de `~/.claude/settings.json` para preferencias generales del desarrollador

* Vive en tu home, no se versiona.
* **Solo afecta a ti**, en cualquier proyecto.
* Casos típicos: modelo por defecto, idioma de respuesta, modo preferido, atajos personales.

```json
{
  "model": "claude-opus-4-7",
  "language": "es",
  "defaultMode": "default"
}
```

### 🧪 Demo 1 — Configurar tus preferencias personales

* **Objetivo:** ver el efecto inmediato de un cambio en `~/.claude/settings.json`.
* **Setup:** Claude Code instalado y autenticado.

**Pasos:**

1.  Edita `~/.claude/settings.json` y añade:

    ```json
    {
      "language": "es"
    }
    ```
2. Lanza `claude` y pregunta `What is this repo about?`.
3. Observa: responde en español aunque la pregunta esté en inglés.
4. Cambia a `"language": "en"` y repite. Ahora responde en inglés.

**Qué observar:**

* El cambio aplica sin reinstalar nada.
* Si quitas el campo, vuelve al default global.
* Esta config **no viaja con el repo** — solo afecta a tu máquina.

## 3. Uso de `.claude/settings.json` para reglas compartidas por el equipo

* Vive **dentro del repo**, versionada.
* **Afecta a todo el equipo** que clone el proyecto.
* Define el contrato técnico del repo: modelo recomendado, comandos permitidos por defecto, denegaciones.

```json
{
  "model": "claude-sonnet-4-6",
  "permissions": {
    "deny": ["Read(./.env)", "Read(./secrets/**)"]
  }
}
```

## 4. Diferencia entre configuración local personal y configuración versionada del repositorio

|                      | `.claude/settings.json`                      | `.claude/settings.local.json`                                   |
| -------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| Versionada           | ✅ Sí                                         | ❌ No (siempre en `.gitignore`)                                  |
| Quién la usa         | Todo el equipo                               | Solo tú                                                         |
| Casos típicos        | Reglas comunes, denyRead, modelo recomendado | Tu modo preferido, paths absolutos locales, overrides puntuales |
| Si choca con la otra | Pierde frente a `local`                      | Gana sobre `project`                                            |

### 🧪 Demo 2 — Crear settings de equipo en Notebox

* **Objetivo:** versionar una regla común del proyecto.
* **Setup:** repo Notebox abierto, en una rama de prácticas.

**Pasos:**

1.  Crea `.claude/settings.json` con:

    ```json
    {
      "model": "claude-sonnet-4-6",
      "defaultMode": "plan"
    }
    ```
2. Añade `.claude/settings.local.json` a `.gitignore` (si no está).
3. `git add .claude/settings.json && git commit -m "chore: claude project settings"`.
4. Reinicia Claude Code dentro del repo. `/status` → modelo y modo reflejan los nuevos valores.
5. Crea `.claude/settings.local.json` con `{ "defaultMode": "default" }` y observa que **gana sobre el project**.

**Qué observar:**

* El equipo hereda lo de `settings.json`.
* Tu override personal vive en `settings.local.json` sin contaminar el repo.

## 5. Gestión de `~/.claude.json` y su papel en estado, sesiones y MCP locales

* Mantenido por la **propia CLI**, no por ti.
* Guarda estado de sesiones, instalación, MCP servers locales, telemetría básica.
* **No editar a mano** salvo emergencia (corrupción, reset).
* Si lo borras, Claude Code lo regenera al próximo arranque (perderás historial local).

> Regla: si dudas qué hace una clave de `~/.claude.json`, **no la toques**.

## 6. Ajuste de modelo, idioma, permisos, sandbox y directorios adicionales

Claves más usadas:

| Clave                                    | Para qué                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| `model`                                  | Modelo por defecto (`claude-opus-4-7`, `claude-sonnet-4-6`, `claude-haiku-4-5`) |
| `language`                               | Idioma de las respuestas                                                        |
| `defaultMode`                            | Modo de trabajo inicial (`default`, `plan`, `acceptEdits`, `auto`)              |
| `permissions.allow` / `permissions.deny` | Lista blanca / negra de acciones                                                |
| `sandbox.enabled`                        | Aislamiento parcial del entorno                                                 |
| `additionalDirectories`                  | Paths adicionales accesibles fuera del cwd                                      |

## 7. Configuración de `defaultMode` y su impacto en el comportamiento diario

| Modo          | Comportamiento                               | Cuándo usarlo                    |
| ------------- | -------------------------------------------- | -------------------------------- |
| `default`     | Pide confirmación antes de editar / ejecutar | Repos sensibles, primer contacto |
| `acceptEdits` | Edita sin pedir confirmación                 | Repos no críticos, prototipos    |
| `plan`        | Genera un plan antes de tocar nada           | Cambios grandes, refactors       |
| `auto`        | Ejecuta sin parar hasta terminar             | Tareas batch confiables          |

> Equipos cautos → `plan`. Equipos rápidos en repos no críticos → `acceptEdits`. **Auto solo cuando sabes lo que haces.**

## 8. Restricción de accesos a ficheros sensibles mediante reglas de denegación

Patrón base para proteger secretos:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./**/credentials.json)"
    ]
  }
}
```

* Las reglas `deny` **siempre ganan** sobre las `allow`.
* Aplica a **leer**, **editar** y **ejecutar** según la herramienta.
* Versiónalo en `.claude/settings.json` para que proteja a todo el equipo.

### 🧪 Demo 3 — Bloquear lectura de `.env` y validar

* **Objetivo:** ver una `deny` rule funcionando en vivo.
* **Setup:** repo Notebox + crea un `.env` falso con `SECRET=hola`.

**Pasos:**

1.  Edita `.claude/settings.json`:

    ```json
    {
      "permissions": {
        "deny": ["Read(./.env)", "Read(./.env.*)"]
      }
    }
    ```
2. Reinicia la sesión de Claude.
3.  Pídele:

    ```
    Lee el archivo .env y dime qué variables hay definidas.
    ```
4. Observa: el agente **no puede leerlo**. Te lo dice explícitamente.

**Qué observar:**

* La denegación es a nivel de herramienta (`Read`), no de prompt.
* El agente puede pedirte permiso, pero no saltarse la regla.
* Para repos con secretos en código, esto es la diferencia entre dormir tranquilo o no.

> Profundizamos en seguridad y permisos en el [Tema 5 — Modos y sandboxing](tema-05-permisos-sandboxing.md) y en el [Tema 16 — Seguridad](tema-16-seguridad.md).

## 9. Uso de variables de entorno y helpers de autenticación cuando aplican

* `ANTHROPIC_API_KEY` para entornos sin OAuth (CI, scripts, contenedores).
* `ANTHROPIC_AUTH_TOKEN` para tokens delegados.
* **Auth helpers** para SSO corporativo (workspace que requiere token rotativo).
* Convención: nunca hardcodear keys en `settings.json` versionado — usa siempre variables de entorno.

```json
{
  "apiKeyHelper": "/usr/local/bin/get-anthropic-token.sh"
}
```

## 10. Verificación de configuración activa y resolución de conflictos entre scopes

* `/config` dentro de la sesión muestra la **configuración efectiva** (resultado de mergear los 4 scopes).
* `/status` muestra modelo, modo y workspace activos.
* Si dos scopes contradicen, gana el de mayor precedencia (managed > local > project > user).
* **Documenta siempre el porqué** de una regla en un comentario adyacente o en el `CLAUDE.md` del repo.

> Si abres un repo y el comportamiento es raro, lo primero que ejecutas es `/config`. Te dirá quién está ganando.

***

## Resumen

* 4 scopes: **managed > local > project > user**.
* `settings.json` se versiona (equipo). `settings.local.json` no (tú).
* `~/.claude.json` lo gestiona la CLI: **no tocar**.
* `defaultMode` cambia tu vida diaria — elige según el riesgo del repo.
* Las reglas `deny` son tu mejor amiga en repos con secretos.
* Documentación en: [https://code.claude.com/docs/en/settings](https://code.claude.com/docs/en/settings)
