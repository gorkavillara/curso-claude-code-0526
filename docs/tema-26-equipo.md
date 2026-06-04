# Tema 26 — Trabajo en equipo, estándares compartidos y gobierno de uso de Claude Code en organizacion

> **Duración estimada:** \~90 min **Tipo:** conceptual + demos guiadas

## Objetivo del tema

Pasar de "yo uso Claude Code" a "este equipo usa Claude Code con reglas comunes". Al terminar, el alumno sabe **dónde vive cada regla** (managed settings, proyecto, `CLAUDE.md`), qué se delega a la IA y qué no, cómo se reparten responsabilidades entre desarrollador, reviewer y líder técnico, y cómo se deja **trazabilidad ligera** de decisiones críticas para que la adopción resista la rotación de personas. La velocidad de un individuo con IA es interesante; la consistencia de un equipo con IA es lo que sostiene una organización.

***

## 1. Diseño de una política interna de uso aceptable y productivo

Una política de uso de Claude Code no es un manifiesto: es **un documento corto que un dev nuevo lee en 10 minutos y aplica desde el primer commit**. Lo que tiene que decir, lo dice en tres bloques: qué está permitido, qué requiere revisión humana adicional, qué está prohibido.

| Bloque de la política                      | Qué responde                                                       | Ejemplo concreto                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Permitido sin fricción**                 | Tareas donde el coste de error es bajo y el agente añade velocidad | Refactor local, tests unitarios, documentación, exploración del repo, prompts en REPL                                      |
| **Permitido con revisión adicional**       | Tareas donde el agente acelera pero el blast radius es real        | Cambios en `services/`, modificaciones de `package.json`, código que toca auth/pagos, migraciones de schema                |
| **Prohibido / requiere aprobación senior** | Tareas que no se delegan ni parcialmente                           | Commits a `main` sin PR, modificaciones a secrets/variables de entorno, decisiones arquitectónicas firmadas solo por la IA |

> Regla mental: **la política está mal escrita si requiere interpretar**. Cada línea responde "¿puedo hacer X mañana sin preguntar?" con sí, sí-con-review o no.

### Antipatrones al redactar la política

* ❌ Listar herramientas en vez de tareas. "No usar Claude para X" es menos útil que "no se commitea código generado sin tests".
* ❌ Política aspiracional sin ejemplos. "Usar la IA responsablemente" no es una regla.
* ❌ Confundir política con configuración. La política dice **qué se permite**; los settings imponen **qué se puede ejecutar**. Las dos cosas se sincronizan, no se sustituyen.
* ❌ Política que sólo dice "no". Sin ejemplos de uso recomendado, el equipo asume que la IA es opcional o sospechosa.

### 🧪 Demo 1 — Auditar una política de uso plantada y proponer mejoras concretas

* **Objetivo:** convertir una política genérica plantada (`docs/governance/POLITICA-CLAUDE-CODE.md`) en una política operativa, detectando vaguedades, contradicciones con los settings reales del repo y secciones que requieren ejemplos concretos.
* **Setup:** rama `tema-26/inicio`. El repo trae `docs/governance/POLITICA-CLAUDE-CODE.md` con secciones "Qué se permite", "Qué requiere review" y "Qué está prohibido" escritas de forma deliberadamente genérica. También `CLAUDE.md` con las convenciones de equipo y `.claude/settings.json` con permisos compartidos.

**Pasos:**

1.  Pedir el diagnóstico de la política:

    ```
    Lee docs/governance/POLITICA-CLAUDE-CODE.md, .claude/settings.json y
    CLAUDE.md. Dame 5 vaguedades concretas de la política: secciones que
    un dev nuevo no sabría aplicar mañana sin preguntar. Para cada una:
    cita textual, por qué es vaga, propuesta de reformulación operativa.
    ```
2.  Buscar contradicciones entre política y settings:

    ```
    ¿Hay alguna regla de la política que el .claude/settings.json
    contradiga (permite lo que la política prohíbe, o prohíbe lo que la
    política permite)? Lista las contradicciones con archivo y línea.
    ```
3.  Detectar lo que falta:

    ```
    ¿Qué tareas habituales de un dev del Notebox NO están cubiertas en
    la política? Pensad en: tocar storage/memory.ts, modificar
    package.json, escribir tests, cambiar .env. Para cada hueco: en qué
    bloque debería ir (permitido / con review / prohibido) y por qué.
    ```
4.  Pedir el plan de mejora:

    ```
    Dame 3 cambios concretos a la política, priorizados por impacto. Cada
    cambio: sección a modificar, texto antes, texto después, qué evita.
    ```
5.  Cerrar con lo que no se cambia:

    ```
    ¿Qué partes de la política dejarías como están y por qué? Una
    política que se reescribe entera cada trimestre no se aplica.
    ```

**Qué observar:**

* Las vaguedades deben ser **citas textuales** de la política, no resúmenes. "Usar la IA responsablemente" es vago; "no commitear código sin revisar" es operativo.
* Las contradicciones se citan con archivo y línea: la política dice X, `.claude/settings.json` permite Y. Sin esa pareja, no hay contradicción accionable.
* Los huecos se piensan desde tareas reales del repo (modificar `package.json`, tocar `services/`, escribir tests) — no desde categorías abstractas.
* Si el agente propone reescribir toda la política, redirigir: "3 cambios priorizados, no rewrite".

### 🧩 Ejercicio 1 — Auditar y mejorar la política de uso plantada

> **Rama:** `git checkout tema-26/ejercicio-01` · **Tiempo:** 25 min · **Tipo:** En clase

Lee `docs/governance/POLITICA-CLAUDE-CODE.md` plantada, audítala con Claude buscando vaguedades, contradicciones con `.claude/settings.json` y huecos respecto a tareas reales del repo. Entrega `POLITICA-CLAUDE-CODE-V2.md` en la raíz con: tabla de vaguedades detectadas (cita textual, problema, reformulación), contradicciones encontradas (política dice X, settings dice Y), huecos identificados (al menos 3 tareas no cubiertas), y la política reescrita aplicando los 3 cambios más rentables. Justifica qué dejas igual.

***

## 2. Qué instrucciones deben vivir en proyecto y cuáles en managed settings

Una organización con varios repos y varios equipos no puede repetir las mismas reglas en cada `.claude/settings.json`. La distribución correcta entre **managed settings (organización)**, **project settings (repo)** y **`CLAUDE.md`** es lo que evita drift entre equipos sin asfixiar la autonomía de cada repo.

| Nivel                                                | Quién lo edita                   | Qué vive aquí                                                          | Ejemplos                                                                                           |
| ---------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Managed (`~/.claude/managed-settings.json`, MDM)** | Administrador de la organización | Reglas no negociables, transversales a toda la org                     | Modelo permitido, telemetría, deny de comandos peligrosos a nivel global, dominios MCP autorizados |
| **Project (`.claude/settings.json`, versionado)**    | Equipo del repo                  | Reglas específicas del repo, compartidas por todos los devs que clonan | Permisos `allow`/`deny` del repo, hooks de auditoría, plugins habilitados, modo por defecto        |
| **`CLAUDE.md` (versionado)**                         | Equipo del repo                  | Convenciones, lenguaje, prompts modelo, qué pedir y qué no             | "Tests en `test/`", "no añadas dependencias sin justificar", "responde en español"                 |
| **User (`~/.claude/settings.json`)**                 | Cada dev                         | Preferencias personales no compartidas                                 | Tema, idioma de respuesta, atajos                                                                  |
| **Local (`.claude/settings.local.json`, ignorado)**  | Cada dev                         | Permisos puntuales que el dev quiere para él                           | `allow` temporal de un comando que está aprendiendo                                                |

> Regla mental: **managed > project > user; settings.json restringe, `CLAUDE.md` orienta**. Lo que protege contra accidentes corporativos vive en managed; lo que es contrato de equipo vive en proyecto; lo que es estilo y convención vive en `CLAUDE.md`.

### Criterios para decidir dónde plantar una regla

| Pregunta                                                         | Si la respuesta es… | El sitio es…                              |
| ---------------------------------------------------------------- | ------------------- | ----------------------------------------- |
| ¿Aplica a todos los repos de la org?                             | Sí                  | **Managed**                               |
| ¿Aplica solo a este repo, pero a todo el equipo?                 | Sí                  | **Project (`.claude/settings.json`)**     |
| ¿Es una convención (lenguaje, dónde van los tests, qué pedir)?   | Sí                  | **`CLAUDE.md`**                           |
| ¿Es preferencia personal del dev?                                | Sí                  | **User (`~/.claude/settings.json`)**      |
| ¿Es un permiso puntual de un dev que no quiere ensuciar el repo? | Sí                  | **Local (`.claude/settings.local.json`)** |

### Antipatrones de distribución

* ❌ Repetir el `deny` de `Read(./.env)` en cada repo en vez de plantarlo en managed.
* ❌ Poner el modelo a usar en `CLAUDE.md` cuando es una restricción que vive en `settings.json`.
* ❌ Confundir "regla del equipo del repo" con "regla de toda la org": una corre el riesgo de drift, la otra de asfixia.
* ❌ Inventar reglas que sólo se pueden cumplir leyéndolas. Si una regla no puede imponerse por settings ni por hook, debe ir en `CLAUDE.md` como convención explícita — no como prohibición silenciosa.

### 🧪 Demo 2 — Distribuir reglas entre managed, project y `CLAUDE.md`

* **Objetivo:** dado un conjunto de reglas mezcladas en el `.claude/settings.json` actual del repo, decidir cuáles deben subir a managed, cuáles quedarse en proyecto, cuáles bajar a `CLAUDE.md`. El criterio gana al gusto.
* **Setup:** rama `tema-26/inicio`. El repo trae `.claude/settings.json` con reglas plantadas, `CLAUDE.md` con convenciones mezcladas y `docs/governance/POLITICA-CLAUDE-CODE.md`. La carpeta `docs/governance/` también contiene `MANAGED-SETTINGS-EJEMPLO.json` como referencia de cómo se vería el nivel managed para la organización.

**Pasos:**

1.  Inventario del estado actual:

    ```
    Lee .claude/settings.json, CLAUDE.md y
    docs/governance/MANAGED-SETTINGS-EJEMPLO.json. Lista todas las reglas
    activas con (a) qué imponen, (b) en qué archivo viven hoy, (c) a quién
    afectan (este repo, toda la org, este dev).
    ```
2.  Clasificar por destino correcto:

    ```
    Para cada regla, di si está en el sitio correcto o si debería estar
    en otro nivel. Criterios: managed para reglas no negociables de la
    org, project para contratos del repo, CLAUDE.md para convenciones,
    user para preferencias personales. Justifica cada movimiento.
    ```
3.  Buscar reglas mal expresadas:

    ```
    ¿Hay reglas que están escritas como prosa en CLAUDE.md pero podrían
    imponerse técnicamente en settings.json (allow/deny, hook)? Listarlas
    con propuesta de conversión.
    ```
4.  Buscar reglas imposibles:

    ```
    ¿Hay reglas que están en settings.json pero deberían ser convención
    (porque settings.json no las puede imponer realmente)? Por ejemplo:
    "el modelo prefiere respuestas cortas" no es una regla, es una
    convención de CLAUDE.md.
    ```
5.  Cerrar con el plan de redistribución:

    ```
    Resume el plan en una tabla: regla, sitio actual, sitio propuesto,
    motivo. Máximo 8 filas. Si la tabla tiene más, agrupa por categoría.
    ```

**Qué observar:**

* Si el agente propone "todo a managed", redirigir: managed es restricción no negociable, no contenedor universal.
* Las reglas técnicamente imponibles (permisos, hooks) deben ir en `settings.json`, no en `CLAUDE.md`. Una convención escrita que no se puede verificar es una convención que se incumple.
* Las convenciones humanas (idioma, dónde tests, estilo de respuesta) van en `CLAUDE.md`. Forzarlas en `settings.json` solo crea fricción.
* La tabla final tiene que ser **decidible**: si dos reglas podrían ir en dos sitios, el alumno tiene que elegir uno con criterio.

### 🧩 Ejercicio 2 — Distribuir reglas entre managed, project y `CLAUDE.md`

> **Rama:** `git checkout tema-26/ejercicio-02` · **Tiempo:** 25 min · **Tipo:** En clase

Audita el `.claude/settings.json` y `CLAUDE.md` del repo plantado, y la referencia `MANAGED-SETTINGS-EJEMPLO.json`. Entrega `DISTRIBUCION-REGLAS.md` en la raíz con: tabla completa de reglas (regla, sitio actual, sitio propuesto, motivo), reglas que conviene **subir a managed** (mínimo 2), reglas que conviene **bajar a `CLAUDE.md`** (mínimo 2), y reglas mal expresadas (escritas como prosa cuando se podrían imponer técnicamente, o impuestas técnicamente cuando son convenciones). Justifica cada decisión en una frase.

***

## 3. Estándares compartidos para prompts, skills y revisión de cambios

Un equipo que usa Claude Code sin estándares produce **resultados con varianza alta entre devs**: los prompts del dev senior son ricos, los del junior son anémicos, las skills se duplican, los PRs asistidos por IA se revisan con criterios distintos. El estándar no es uniformidad — es **un piso común** del que el equipo no baja.

| Estándar                                            | Qué fija                                                                     | Dónde vive                                                           |
| --------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Prompts modelo**                                  | Plantillas para tareas frecuentes (refactor, test, review, redacción de ADR) | `CLAUDE.md` o `.claude/prompts/`                                     |
| **Skills compartidas**                              | Capacidades reutilizables del equipo (no del autor)                          | `.claude/skills/` (versionado) o paquete privado de skills de la org |
| **Convenciones de revisión de PR asistidos por IA** | Qué se mira en un PR donde la IA escribió código                             | Rúbrica versionada en `docs/governance/`                             |
| **Trazabilidad de prompts críticos**                | Qué decisiones quedan registradas                                            | `.claude/auditoria/` con logs estructurados                          |

> Regla mental: **lo que se reutiliza, se versiona; lo que se versiona, se revisa**. Un prompt que un dev usa todos los días sin estar escrito en ningún sitio es conocimiento tribal — desaparece con la rotación.

### Estándares mínimos para prompts en equipo

* **Anclar contexto antes de pedir**. "Lee `X` y `Y` antes de proponer" es estándar; "hazme esto" es lotería.
* **Pedir alternativas, no soluciones únicas** para tareas con impacto. "Dame 2 opciones con trade-offs" antes de "implementa la mejor".
* **Forzar la contra-pregunta**. "¿Qué se pierde con esta elección?" o "¿qué deuda introduce esto?" como segundo turno.
* **No firmar lo no leído**. Si la respuesta toca más de 3 archivos, el dev los abre — no se hace `accept` a ciegas.

### Estándares mínimos para skills compartidas

* **Una skill por tarea repetible**, no por preferencia personal.
* **Trigger explícito y verificable**: si la descripción dice "cuando el usuario pida X", esa X debe ser distinguible de otras.
* **Documentación interna de qué falla**: una skill sin sección de "antipatrones" no se mantiene.

### Estándares mínimos para review de PR asistidos por IA

| Foco de la revisión                                   | Pregunta a responder                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **¿El código resuelve el problema?**                  | El criterio sigue siendo el de siempre — la IA no exime de revisar lógica                         |
| **¿Hay tests reales?**                                | Tests autogenerados sin assertions útiles cuentan como ausencia de tests                          |
| **¿Se introdujo deuda no documentada?**               | Función larga, abstracción sin segundo consumidor, dependencias nuevas sin justificar             |
| **¿Está sincronizado con `CLAUDE.md` y la política?** | Convenciones del equipo respetadas                                                                |
| **¿Hay rastro del prompt si la decisión es crítica?** | Para cambios críticos, el prompt que generó el código se anota en el PR o en `.claude/auditoria/` |

### Antipatrones de los estándares de equipo

* ❌ Documento de "buenas prácticas" de 30 páginas que nadie lee. Tres bullets en `CLAUDE.md` ganan a un PDF.
* ❌ Confundir estandarizar con burocratizar. El estándar reduce varianza; la burocracia ralentiza al dev senior sin ayudar al junior.
* ❌ Skills personales subidas como skills de equipo. El criterio: ¿lo usaría otro dev sin preguntar a su autor? Si no, no es skill compartida.
* ❌ Rúbricas de PR aspiracionales. Si la rúbrica no se aplica en clase, no se aplica en producción.

***

## 4. Reparto de responsabilidades entre desarrollador, reviewer y líder técnico

Claude Code redistribuye tareas, no las elimina. Si el reparto no se hace explícito, **la responsabilidad cae por defecto en quien firma el commit** — y eso desincentiva el uso responsable de la IA. Hacerlo explícito alinea los incentivos.

| Rol                                  | Qué asume con Claude Code                                                                                                              | Qué NO delega ni con Claude                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Desarrollador (autor del cambio)** | Generar borradores, refactors locales, tests, documentación. Verificar que el código funciona antes de pedir review.                   | Decisiones arquitectónicas firmadas solo por la IA. Commits que tocan auth/pagos/migraciones sin contraste humano. |
| **Reviewer (otro dev)**              | Revisar el cambio con la rúbrica del equipo. Usar la IA para detectar olores que se le escapen.                                        | Aprobar PRs sin leer el diff porque "los tests están verdes". La IA no exime del review humano.                    |
| **Líder técnico / arquitecto**       | Decidir qué reglas viven en managed, en project, en `CLAUDE.md`. Auditar el uso de la IA en decisiones críticas. Mantener la política. | Delegar la firma de un ADR a la IA. Asumir que "la IA lo revisó" sustituye a un humano senior.                     |

> Regla mental: **la IA no es un rol — es una capacidad transversal**. Cada rol gana velocidad usándola, ninguno la sustituye por ella.

### Riesgos de un reparto mal hecho

* **Reviewer pasivo:** asume que el código asistido es código revisado. La IA detecta bugs, no decide si la solución es la correcta.
* **Tech lead ausente:** la política se queda obsoleta porque nadie la mantiene. El equipo deriva en convenciones tribales contradictorias.
* **Dev sin red de seguridad:** carga toda la responsabilidad de los cambios asistidos. El uso de la IA se vuelve defensivo o se abandona.

### Cómo se materializa el reparto en el repo

* **`CLAUDE.md`** documenta el reparto en una sección corta: quién firma qué tipo de cambio, dónde se anota un prompt crítico, qué pasa cuando hay duda.
* **Rúbrica de PR** versionada (`docs/governance/RUBRICA-REVIEW.md`) que el reviewer aplica explícitamente.
* **Plantilla de decisión** (`docs/governance/PLANTILLA-DDR.md` — Decisión Documentada Rápida) para casos donde el ADR completo es excesivo pero la decisión merece quedar escrita.

***

## 5. Formación cruzada del equipo para no depender de un único experto en IA

Si el conocimiento sobre Claude Code vive en una sola persona, el equipo es frágil: vacaciones, rotación o cambio de prioridades hunden la adopción. La formación cruzada se diseña como una **red distribuida** de capacidades, no como una jerarquía de "el que sabe".

| Práctica de formación cruzada                | Cómo se ejecuta                                                                                 | Frecuencia       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------- |
| **Pair prompting**                           | Dos devs trabajan juntos en un prompt complejo; el más senior ancla contexto, el junior conduce | Semanal (1 hora) |
| **Demos cortas en daily**                    | Un dev distinto cada semana enseña un prompt o skill que le ha funcionado                       | Diaria, 5 min    |
| **Brown bag de skills**                      | Sesión informal donde el equipo revisa skills nuevas y decide si entran al repo                 | Mensual          |
| **Rotación de mantenimiento de `CLAUDE.md`** | Cada sprint un dev distinto se encarga de actualizar el archivo según lo aprendido              | Sprint           |
| **Postmortem de prompts fallidos**           | Cuando un prompt da resultado malo, se anota qué falló y se ajusta la convención                | Bajo demanda     |

> Regla mental: **el conocimiento de IA del equipo se mide por el dev menos experto**. Si el junior no sabe pedir, el equipo va al ritmo del junior — no del senior.

### Antipatrones de formación cruzada

* ❌ Designar "el experto en IA" del equipo. Crea cuello de botella y desincentiva a los demás.
* ❌ Documentar todo en Confluence y nada en el repo. El conocimiento que no vive junto al código no se aplica.
* ❌ Cursos teóricos sin práctica sobre el código real. La formación útil se mide en commits, no en horas de vídeo.
* ❌ Asumir que los devs senior no necesitan formarse. La superficie de Claude Code se renueva — todos necesitan recalibrar cada pocos meses.

***

## 6. Gestión de conocimiento sobre patrones que sí funcionan con Claude Code

Cada equipo descubre **prompts y patrones que funcionan especialmente bien** sobre su stack. Si ese descubrimiento no se documenta, se reaprende cada pocos meses. La gestión de conocimiento se hace ligera y junto al código.

| Tipo de conocimiento                            | Dónde se documenta                                          | Quién lo mantiene                            |
| ----------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| **Prompts que funcionan repetidamente**         | `CLAUDE.md` (sección "Prompts modelo") o `.claude/prompts/` | Quien lo usa primero, valida quien lo reusa  |
| **Skills del equipo**                           | `.claude/skills/` en el repo o paquete privado              | El equipo de plataforma o el dueño funcional |
| **Patrones de prompting específicos del stack** | `docs/governance/PATRONES-PROMPTING.md`                     | Tech lead + colaboraciones del equipo        |
| **Antipatrones detectados**                     | Misma ubicación, sección "Antipatrones"                     | Cualquiera que los descubra, en PR           |
| **Decisiones críticas asistidas por IA**        | `.claude/auditoria/decisiones.md` o sistema equivalente     | Tech lead, revisa el equipo                  |

> Regla mental: **un patrón que funcionó una vez no es un estándar; un patrón que funcionó tres veces en tres devs distintos sí lo es**. Sin esa validación, lo que entra al repo es preferencia, no conocimiento.

### Reglas para documentar conocimiento útil

* **Ejemplo concreto antes que teoría.** Un prompt literal pegado, con contexto del repo, vale 10 veces más que tres párrafos sobre "buen prompting".
* **Antipatrón al lado del patrón.** Lo que NO funciona se documenta igual de explícito que lo que sí.
* **Caducidad implícita.** Patrones marcados con fecha. Si Claude Code cambia features, los patrones viejos pueden quedar obsoletos.
* **Sin documentación huérfana.** Un patrón sin dueño no se mantiene. Asigna responsable explícito.

***

## 7. Coordinación entre repositorios y productos con enfoques consistentes

En una organización con varios repos, varios equipos y varios productos, **la consistencia entre repos es lo que evita que cada equipo reinvente la rueda**. La coordinación es ligera y se apoya en managed settings + plantillas compartidas, no en reuniones.

| Mecanismo de coordinación               | Qué resuelve                              | Cómo se mantiene                      |
| --------------------------------------- | ----------------------------------------- | ------------------------------------- |
| **Managed settings de la org**          | Reglas no negociables transversales       | Equipo de plataforma o seguridad      |
| **Plantillas de `CLAUDE.md`**           | Convenciones base que cada repo adapta    | Repo de plantillas, fork por equipo   |
| **Repo de skills compartidas**          | Capacidades reutilizables entre productos | Equipo de plataforma                  |
| **Guild / comunidad de práctica de IA** | Compartir aprendizajes entre equipos      | Reunión corta mensual, canal de Slack |
| **Política única de uso**               | Mismo marco mental en toda la org         | Versionado, una sola fuente de verdad |

> Regla mental: **la consistencia no se impone con reuniones, se materializa en artefactos**. Lo que no está en un archivo versionado, no se aplica.

### Antipatrones de coordinación

* ❌ Comité de gobernanza que se reúne y no produce artefactos. Sin commits, no hay coordinación.
* ❌ Plantilla de `CLAUDE.md` corporativa de 500 líneas. Si nadie la lee entera, nadie la aplica.
* ❌ Skills compartidas que solo el equipo que las creó entiende. Sin documentación accesible, son código muerto.
* ❌ Permitir drift silencioso. Si dos repos similares acaban con políticas opuestas, alguien tiene que decidir cuál gana.

***

## 8. Auditoría ligera del uso de IA y trazabilidad de decisiones críticas

Auditar no es vigilar — es **dejar rastro suficiente para responder, 6 meses después, "¿quién decidió esto y con qué prompt?"**. La auditoría útil es ligera: ni granular hasta el ruido, ni inexistente. Cubre las decisiones que tienen blast radius.

| Qué se audita                                             | Cómo se registra                                                              | Quién lo consulta      |
| --------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| **Cambios arquitectónicos asistidos por IA**              | Anotación en el ADR de qué prompts se usaron                                  | Tech lead, devs nuevos |
| **Commits a `main` con asistencia de IA significativa**   | Hook que añade tag al commit + entrada en log                                 | Reviewer, auditoría    |
| **Skills críticas del equipo**                            | Versionado git de `.claude/skills/`, changelog                                | Equipo, plataforma     |
| **Migraciones, refactors masivos, dependencias críticas** | DDR (Decisión Documentada Rápida) en `docs/governance/decisiones/`            | Tech lead, equipo      |
| **Prompts que firmaron una decisión sin humano**          | **Esto no debería ocurrir.** Si ocurre, se documenta y se revisa la política. | Tech lead              |

> Regla mental: **lo que no deja rastro, no se auditó**. Si un cambio crítico se hizo con IA y nadie puede reconstruir el razonamiento 3 meses después, la trazabilidad está rota — aunque "todo el mundo se acuerde ahora".

### Niveles de auditoría según el blast radius

| Blast radius del cambio                                     | Trazabilidad mínima                                         | Tiempo de retención |
| ----------------------------------------------------------- | ----------------------------------------------------------- | ------------------- |
| **Bajo** (refactor local, tests, docs)                      | Ninguna — basta con el commit                               | —                   |
| **Medio** (cambios en `services/`, `package.json`)          | Mensaje de commit menciona si hubo asistencia significativa | 6 meses             |
| **Alto** (auth, pagos, migración de schema)                 | DDR escrita + prompts críticos pegados en el PR             | 2 años              |
| **Crítico** (arquitectura, política, decisión cross-equipo) | ADR + sesión humana + prompts archivados                    | Indefinido          |

### 🧪 Demo 3 — Diseñar un mecanismo de trazabilidad para decisiones críticas

* **Objetivo:** convertir el ejemplo plantado en `.claude/auditoria/decisiones.md` en un mecanismo operativo: qué se registra, cuándo, cómo se consulta. Distinguir señal de ruido.
* **Setup:** rama `tema-26/inicio`. El repo trae `.claude/auditoria/decisiones.md` con 3 entradas de ejemplo (1 demasiado granular, 1 demasiado vaga, 1 razonable) y `docs/governance/PLANTILLA-DDR.md` con el formato de decisión documentada rápida.

**Pasos:**

1.  Auditar el log plantado:

    ```
    Lee .claude/auditoria/decisiones.md. Para cada una de las 3 entradas:
    ¿es ruido (demasiado granular, no aporta), está bien dimensionada, o
    es vaga (no se puede reconstruir el razonamiento)? Justifica con
    citas textuales del log.
    ```
2.  Definir qué se audita y qué no:

    ```
    Dado el repo Notebox (Express + storage in-memory + servidor MCP +
    plugin local), lista 5 tipos de cambio que SÍ se auditarían y 5 que
    NO. Criterio: blast radius real, no preferencia. Para cada tipo, una
    frase de por qué.
    ```
3.  Diseñar la entrada estándar:

    ```
    Diseña el formato canónico de una entrada de .claude/auditoria/decisiones.md
    para cambios de blast radius alto. Campos mínimos, ejemplo concreto
    sobre uno de los cambios anteriores del repo (ej. "decidir si la
    validación vive en routes o services"). Máximo 8 líneas por entrada.
    ```
4.  Pedir el ciclo de mantenimiento:

    ```
    ¿Quién escribe la entrada, cuándo, quién la revisa? Sin un dueño y un
    trigger, el log se queda obsoleto. Define el ciclo en 3 frases.
    ```
5.  Anticipar antipatrones:

    ```
    Lista 3 antipatrones que harían inservible este mecanismo (ej.
    loggear cada prompt, escribir entradas vacías para cumplir,
    abandonar el log a los 2 meses). Una contramedida concreta por
    antipatrón.
    ```

**Qué observar:**

* El alumno tiene que aceptar que **no todo se audita**. Auditar refactors locales es ruido; no auditar una migración es deuda.
* El formato canónico debe ser **ejecutable** — un dev que tiene que escribir una entrada hoy sabe qué pone. Si la plantilla tiene 15 campos, nadie la rellena.
* Si el agente propone "loggear todos los prompts automáticamente", redirigir: la auditoría útil es deliberada, no automática.
* El ciclo de mantenimiento es **tan importante como el formato**. Sin dueño y sin trigger, cualquier sistema de auditoría se abandona.

### 🧩 Ejercicio 3 — Diseñar un mecanismo de trazabilidad de decisiones críticas

> **Rama:** `git checkout tema-26/ejercicio-03` · **Tiempo:** 25 min · **Tipo:** En clase

Audita el log de ejemplo plantado en `.claude/auditoria/decisiones.md` y la `PLANTILLA-DDR.md`. Entrega `TRAZABILIDAD-DECISIONES.md` en la raíz con: diagnóstico de las 3 entradas plantadas (cuál es ruido, cuál vaga, cuál razonable, con cita), lista de qué se audita y qué no para el Notebox (5+5 tipos de cambio, justificados por blast radius), formato canónico final de entrada (máx 8 líneas, con ejemplo real sobre el repo), ciclo de mantenimiento (quién, cuándo, qué trigger) y 3 antipatrones con contramedida.

***

## 9. Integración de Claude Code en cultura de calidad y no solo de velocidad

El primer reflejo al adoptar Claude Code es medir **velocidad**: PRs por sprint, tiempo de implementación, líneas escritas. Es la métrica equivocada en solitario. La integración madura se mide en **calidad sostenida** — porque la velocidad sin calidad acumula deuda y la rotación la paga.

| Métrica que un equipo joven mira | Por qué engaña                        | Métrica que el equipo maduro mira                       |
| -------------------------------- | ------------------------------------- | ------------------------------------------------------- |
| Líneas de código generadas       | Premia volumen sobre criterio         | Tests añadidos por feature                              |
| Tiempo hasta el primer commit    | Premia velocidad superficial          | Tiempo hasta el primer PR mergeado **con tests verdes** |
| Número de prompts usados         | Métrica de actividad, no de resultado | Número de prompts reutilizados por más de un dev        |
| PRs aprobados rápido             | Premia review superficial             | PRs con cero defectos en producción a 30 días           |
| "El equipo es más productivo"    | Anécdota sin evidencia                | Cobertura de tests + tiempo medio de fix de bugs        |

> Regla mental: **velocidad sin calidad es deuda con disfraz**. Un equipo que entrega más rápido pero genera más bugs no es más productivo — es más caro a 6 meses.

### Cómo integrar Claude Code en la cultura de calidad

* **La IA no se usa para saltarse pasos del proceso, se usa para hacerlos mejor.** El refactor sigue teniendo review; el test sigue siendo necesario; el ADR sigue requiriendo firma humana.
* **Los criterios de calidad NO bajan porque la IA acelere.** Si antes pedías tests con assertions útiles, los sigues pidiendo.
* **Métricas pareadas.** Velocidad emparejada con cobertura, PRs emparejados con defectos en producción. Una métrica sola siempre miente.
* **Recompensa el patrón, no el output.** Premiar a quien comparte el prompt útil con el equipo es más rentable que premiar a quien produce más código asistido.

### Antipatrones de "cultura de IA" inmadura

* ❌ Celebrar "X% del código lo escribió Claude" como métrica. No mide calidad, mide dependencia.
* ❌ Reducir review humano "porque la IA ya lo revisó". El reviewer humano no es redundante con la IA — son capacidades distintas.
* ❌ Aceptar que el equipo escriba menos tests "porque la IA los puede generar después". Las cosas que se hacen "después" no se hacen.
* ❌ Confundir "todos usan Claude" con "todos usan Claude bien". La adopción se mide en patrones, no en logins.

***

## 10. Construcción de una adopción empresarial que resista la rotación de personas

Una adopción frágil es la que vive en la cabeza de 2–3 personas. Si rotan, el equipo vuelve a empezar. Una adopción resiliente está **codificada en artefactos** que sobreviven a la rotación: política, settings, `CLAUDE.md`, skills compartidas, prompts modelo, log de decisiones, rúbrica de PR.

| Componente                     | Qué garantiza si rota un dev senior                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| **Política versionada**        | El próximo dev sabe qué se permite y qué no sin preguntar                           |
| **`CLAUDE.md` mantenido**      | Las convenciones del equipo se aplican desde el primer commit del nuevo dev         |
| **Skills compartidas en repo** | Las capacidades del equipo no desaparecen con el autor                              |
| **Log de decisiones críticas** | El razonamiento de decisiones pasadas es reconstruible                              |
| **Rúbrica de PR**              | El reviewer nuevo aplica los mismos criterios que el reviewer viejo                 |
| **Plantillas de DDR / ADR**    | El equipo sigue escribiendo decisiones con el mismo formato                         |
| **Managed settings de la org** | Las reglas no negociables se aplican aunque el repo se quede sin tech lead temporal |

> Regla mental: **lo que no está en un artefacto versionado, desaparece con quien lo sabía**. La pregunta de resiliencia: si el dev senior con más conocimiento de IA se va mañana, ¿qué se rompe? Lo que se rompa, codifícalo.

### Test de resiliencia de la adopción

| Pregunta                                                                     | Si la respuesta es no, ¿qué codificar? |
| ---------------------------------------------------------------------------- | -------------------------------------- |
| ¿Un dev nuevo puede leer en 15 minutos cómo se usa Claude Code en este repo? | `CLAUDE.md` + política versionada      |
| ¿Las convenciones del equipo están escritas en el repo?                      | Sección de convenciones en `CLAUDE.md` |
| ¿Los permisos del repo son explícitos?                                       | `.claude/settings.json` versionado     |
| ¿Las decisiones críticas asistidas por IA son reconstruibles a 6 meses?      | Log de decisiones, DDRs, ADRs          |
| ¿Existe rúbrica de review para PRs asistidos?                                | `docs/governance/RUBRICA-REVIEW.md`    |
| ¿Si rota el dev que más sabe de IA, otros pueden hacer su trabajo?           | Formación cruzada + skills compartidas |
| ¿La política se mantiene al día?                                             | Dueño asignado + cadencia de revisión  |

### El paso del individuo al equipo, del equipo a la organización

* **Individuo:** un dev usa Claude Code bien.
* **Equipo:** los devs del equipo usan Claude Code con reglas comunes y conocimiento compartido.
* **Organización:** varios equipos coordinan sus reglas mínimas y aprenden unos de otros sin reuniones.

> "Lo que pierde una organización con la rotación no es talento — es **artefactos que estaban en cabezas en vez de en archivos**. Codificar la adopción es la diferencia entre 'éramos productivos con Claude' y 'somos productivos con Claude'."

***

## Resumen

* **Política operativa, no aspiracional.** Tres bloques: permitido, con review, prohibido. Cada línea responde "¿puedo hacer X mañana?" sin interpretar.
* **Reglas en su sitio.** Managed para lo no negociable, project para el contrato del repo, `CLAUDE.md` para convenciones, user/local para preferencias.
* **Estándares como piso común.** Prompts modelo, skills compartidas y rúbrica de PR — versionados junto al código.
* **Reparto explícito de responsabilidades.** La IA es capacidad transversal, no rol. Cada quien gana velocidad, ninguno la sustituye.
* **Formación cruzada distribuida.** El conocimiento del equipo se mide por el dev menos experto. Cero cuellos de botella.
* **Auditoría ligera, no granular.** Lo que tiene blast radius se anota; lo demás se confía al commit. Sin dueño y trigger, ningún log sobrevive.
* **Calidad antes que velocidad.** Métricas pareadas (tests + cobertura, no líneas + PRs). La velocidad sin calidad es deuda con disfraz.
* **Adopción codificada en artefactos.** Política, `CLAUDE.md`, settings, skills, log de decisiones, rúbrica. La rotación no debería empezar de cero.

***

## Cierre del bloque T19–T26

Este tema cierra el bloque de **gobernanza y producción** del curso (Temas 19 a 26): subagentes, MCP, plugins, CLI avanzada, Docker, CI/CD, arquitectura y — ahora — equipo y gobierno. Lo que en los temas iniciales eran capacidades individuales aquí se consolida como **práctica de equipo codificada**. El Tema 27 (proyecto final) integra todo lo anterior sobre un repositorio real: política, settings, `CLAUDE.md`, skills, subagentes, MCP y revisión asistida coexistiendo en una sola sesión completa.
