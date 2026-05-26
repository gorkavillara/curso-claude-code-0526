# Tema 5 — Modos de trabajo, permisos y sandboxing

> **Duración estimada:** \~60 min **Tipo:** práctico + demos guiadas

## Objetivo del tema

Saber **qué puede hacer el agente sin tu permiso, qué requiere confirmación y qué no debería poder hacer nunca**. Diseñar una política de permisos razonable para tu repo y tu equipo.

***

## 1. Diferencia entre modos por defecto, accept edits, plan, auto y otros modos disponibles

| Modo          | Edita archivos       | Ejecuta comandos     | Pide confirmación                | Cuándo usarlo                   |
| ------------- | -------------------- | -------------------- | -------------------------------- | ------------------------------- |
| `default`     | Sí, con confirmación | Sí, con confirmación | Antes de cada acción riesgosa    | Cualquier repo en sesión normal |
| `acceptEdits` | Sí, sin confirmación | Sí, con confirmación | Solo comandos                    | Repos no críticos, prototipos   |
| `plan`        | No edita             | No ejecuta           | Te pide aprobar el plan completo | Cambios grandes, refactors      |
| `auto`        | Sí, sin confirmación | Sí, sin confirmación | Casi nunca                       | Tareas batch confiables         |

> Cambiar de modo en sesión: `/mode` o tecla configurada (ej.: `Shift+Tab` en muchas instalaciones).

## 2. Cuándo conviene trabajar en modo planificador y cuándo en modo más ejecutor

**Plan** (`plan`):

* Cambios que tocan ≥3 archivos.
* Áreas críticas: pagos, auth, migraciones.
* Trabajos donde el coste de "des-hacer" es alto.

**Ejecutor** (`acceptEdits` / `auto`):

* Repos de prototipo o sandbox.
* Tareas repetitivas y bien acotadas (renombrados, formateo, regenerar mocks).
* Sesiones donde tú revisas el diff completo al final, no acción a acción.

> Regla: **plan por defecto, acelera cuando el coste de error es bajo.**

### 🧪 Demo 1 — Mismo prompt en `default` vs `plan`

* **Objetivo:** ver el cambio de UX al alternar entre modos.
* **Setup:** Notebox limpio.

**Pasos:**

1.  Sesión nueva con `claude` en modo `default`. Pide:

    ```
    Añade un endpoint GET /notes/:id que devuelva una nota por ID o 404 si no existe.
    ```

    Observa: te pide confirmación antes de cada edición y antes de ejecutar tests.
2. `/exit`. Cambia a `plan` (en `~/.claude/settings.json` o con `/mode plan`).
3. Repite el mismo prompt. Observa: presenta un **plan** (lista de archivos a tocar y orden) y espera tu OK antes de tocar nada.
4. Aprueba y deja que ejecute.

**Qué observar:**

* En `default` decides acción a acción.
* En `plan` decides una vez sobre el conjunto.
* La cantidad de tokens y el ritmo cambian sustancialmente.

### 🧩 Ejercicio 1 — Clasificar tareas por modo

> **Rama:** `git checkout tema-05/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Recibe una tabla de 12 tareas y decide el modo correcto (`default` / `acceptEdits` / `plan` / `auto`) **antes** de ejecutar ninguna. Después lanza 3 de ellas en el modo elegido y compara el resultado con tu decisión inicial.

## 3. Gestión de confirmaciones antes de editar archivos o lanzar comandos

* En `default`, cada edición se muestra como diff aplicable: `y` aceptar, `n` rechazar, `e` editar el prompt.
* En comandos: te muestra el comando antes de ejecutarlo.
* Para no romper la productividad: una vez confirmas un comando una vez en una sesión, puedes **promoverlo a allow** con `/permissions`.

## 4. Uso de `/permissions` para permitir o restringir acciones concretas

* `/permissions` abre el panel de permisos de la sesión.
* Listas:
  * `allow`: acciones permitidas sin confirmación.
  * `deny`: acciones bloqueadas siempre.
  * `ask`: acciones que requieren confirmación.
* Granularidad típica:
  * `Bash(npm test)` → permitir tests sin confirmar.
  * `Read(./.env)` → denegar.
  * `Bash(git push *)` → denegar push automático.

```json
{
  "permissions": {
    "allow": ["Bash(npm test)", "Bash(npm run typecheck)", "Read(src/**)"],
    "deny": ["Read(./.env)", "Bash(git push *)", "Bash(rm -rf *)"]
  }
}
```

### 🧪 Demo 2 — Añadir y quitar permisos en sesión

* **Objetivo:** ver cómo `/permissions` cambia el comportamiento sin reiniciar.
* **Setup:** sesión `claude` activa en Notebox, modo `default`.

**Pasos:**

1.  Pídele:

    ```
    Ejecuta los tests para asegurarte de que todo pasa.
    ```

    Observa: te pide confirmación para `npm test`.
2. Confirma una vez y elige _"siempre permitir este comando"_ (o usa `/permissions add Bash(npm test)`).
3. Vuelve a pedirlo. Ahora **no pide confirmación**.
4.  Bloquea explícitamente:

    ```
    /permissions deny Bash(rm -rf *)
    ```
5.  Pide algo absurdo:

    ```
    Limpia node_modules con rm -rf y reinstala.
    ```

    Observa: el agente busca alternativa o te avisa que `rm -rf` está denegado.

**Qué observar:**

* `/permissions` opera **en caliente**.
* Las reglas `deny` siempre ganan, incluso si el prompt insiste.
* Lo que apruebes en sesión puede persistirse a `settings.local.json`.

### 🧩 Ejercicio 2 — Política de permisos para un equipo fintech

> **Rama:** `git checkout tema-05/ejercicio-02` · **Tiempo:** 15 min · **Tipo:** En clase

Recibe un `.claude/settings.ejercicio.json` intencionalmente malo (permite casi todo) y córrigelo para un escenario fintech con datos sensibles. Verifica con 5 prompts concretos que las reglas hacen lo que esperas.

## 5. Configuración de políticas corporativas que impiden modos inseguros

* Las **managed settings** (políticas corporativas) viven fuera de tu control.
* Pueden imponer cosas como:
  * Forzar `defaultMode: plan` en repos sensibles.
  * Prohibir `auto` mode.
  * Mantener una `denyList` global (lectura de `.env`, push directo a `main`, etc.).
* Si estás en una organización gobernada, **acéptalo**: la política está ahí por una razón.

## 6. Reglas prácticas para comandos peligrosos, lectura de secretos y acceso a red

| Categoría                                            | Recomendación                            |
| ---------------------------------------------------- | ---------------------------------------- |
| `rm -rf`, `git reset --hard`, `git push --force`     | `deny` por defecto                       |
| Lectura de `.env*`, `secrets/**`, `credentials.json` | `deny` siempre                           |
| `npm install <paquete>` desde un prompt              | `ask` (no `allow`) — riesgo supply chain |
| `curl` / `wget` a URLs externas                      | `ask` o `deny` según política            |
| Tests, typecheck, format, lint                       | `allow` — son seguros y rápidos          |
| Despliegues (`kubectl apply`, `terraform apply`)     | `deny` salvo entornos de prueba          |

## 7. Sandboxing y aislamiento parcial del entorno para reducir superficie de riesgo

* El sandbox limita las acciones del agente al directorio del proyecto y a comandos explícitamente permitidos.
* No es una jaula completa (no es Docker), pero sí una **primera barrera**.
*   Activable en settings:

    ```json
    { "sandbox": { "enabled": true } }
    ```
* Para aislamiento real (zonas críticas, código no auditado): correr Claude Code dentro de un **Docker dedicado** (Tema 23).

### 🧪 Demo 3 — Probar el sandbox contra una acción "peligrosa"

* **Objetivo:** ver una denegación efectiva en vivo.
*   **Setup:** Notebox con `.claude/settings.json` ampliado:

    ```json
    {
      "sandbox": { "enabled": true },
      "permissions": {
        "deny": ["Read(./.env)", "Bash(rm -rf *)", "Bash(git push *)"]
      }
    }
    ```

    Crea un `.env` falso con `SECRET=demo`.

**Pasos:**

1.  Pide:

    ```
    Lee el archivo .env y dime qué variables tiene.
    ```

    → Bloqueado.
2.  Pide:

    ```
    Borra node_modules y reinstala.
    ```

    → Si usa `rm -rf`, bloqueado. Sugiere alternativa (`npm ci`).
3.  Pide:

    ```
    Haz un commit y push a main.
    ```

    → Bloqueado en el push.

**Qué observar:**

* El agente **no se salta** la regla, ni reformulando.
* Te explica claramente qué está denegado.
* Puedes registrar estos intentos para auditar el uso de la IA.

### 🧩 Ejercicio 3 — Autopsia de un incidente

> **Rama:** `git checkout tema-05/ejercicio-03` · **Tiempo:** 20 min · **Tipo:** En clase

Lee el `INCIDENTE.md` (sesión real de Claude que causó 4 daños sobre el repo). Analiza qué falló, reescribe el prompt para que sea seguro, pruébalo en modo `plan` y añade la regla preventiva al `settings.json`.

## 8. Diseño de una política de permisos razonable para equipos empresariales

Plantilla para `.claude/settings.json` versionado en repos de equipo:

```json
{
  "defaultMode": "plan",
  "permissions": {
    "allow": [
      "Read(src/**)", "Read(test/**)", "Read(docs/**)",
      "Bash(npm test)", "Bash(npm run typecheck)", "Bash(npm run lint)"
    ],
    "deny": [
      "Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)",
      "Bash(git push *)", "Bash(rm -rf *)",
      "Bash(curl *)", "Bash(wget *)"
    ]
  }
}
```

* **Mínimo permiso necesario** para operar.
* Lo que se permite, se permite **explícitamente**.
* Lo crítico se deniega aunque parezca paranoico.

## 9. Balance entre velocidad de uso y control del daño potencial

| Velocidad                      | Control | Cuándo                                 |
| ------------------------------ | ------- | -------------------------------------- |
| Alto `auto`                    | Bajo    | Sandboxes, prototipos efímeros         |
| `acceptEdits` + tests verdes   | Medio   | Repos no críticos, refactors mecánicos |
| `default` con `allow` ajustado | Alto    | Día a día profesional                  |
| `plan` puro                    | Máximo  | Repos sensibles, cambios grandes       |

> No optimices por velocidad. Optimiza por **velocidad útil** = velocidad − tiempo de fix de errores que la IA introdujo.

## 10. Buenas prácticas para operar Claude Code en repositorios sensibles

* **Todo en `plan` por defecto**, sin excepciones.
* **Lista blanca explícita** de comandos permitidos.
* **Lista negra exhaustiva** de lectura de secretos y comandos destructivos.
* Sesiones siempre con humano supervisando — nada de `auto` desatendido.
* Auditoría: registrar prompts y diffs aceptados (Tema 26).
* Si el repo es muy crítico (pagos, auth, datos personales), considera **ejecutar Claude Code dentro de un contenedor aislado** (Tema 23).

***

## Resumen

* 4 modos: `default`, `acceptEdits`, `plan`, `auto`. Cada uno tiene su sitio.
* `/permissions` opera **en caliente**: aprende a usarlo en sesión.
* Reglas `deny` ganan siempre. Úsalas para `.env`, push y `rm -rf`.
* Política de equipo razonable = mínimo permiso necesario + denegación exhaustiva de lo crítico.
* En repos sensibles: `plan` + sandbox + supervisión humana. **Sin atajos.**
