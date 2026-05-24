# Tema 5 — Modos de trabajo, permisos y sandboxing

> Duración estimada: 90 min · Tipo: conceptual + práctico.
> Repositorio de prácticas: rama `tema-05/inicio` (notebox, Node 24 + Express + TypeScript).

## 0. Objetivo del tema

Que el alumno desarrolle **criterio antes de ejecutar**: elegir el modo correcto, gestionar permisos en sesión y entender que los permisos son la última línea de defensa — el prompt es la primera.

---

## 1. Flujo de sesión

Estructura **batch**: primero todas las demos, después los tres ejercicios en clase. El ejercicio 3 es la pieza que integra todo lo visto.

```
00:00 — Encuadre                        (10 min)
00:10 — Demo 1: default vs plan         (10 min)
00:20 — Demo 2: /permissions en sesión  (10 min)
00:30 — Demo 3: sandbox en acción       (10 min)
00:40 — Ejercicio 1: clasificar modos   (15 min, en clase)
00:55 — Ejercicio 2: política fintech   (15 min, en clase)
70:00 — Ejercicio 3: autopsia incidente (20 min, en clase)
90:00 — Cierre y puente                 (5 min)
```

> **Si vas justo de tiempo:** recorta el encuadre a 5 min y acorta el ejercicio 3 a 15 min (deja solo los pasos 1-3, omite el 4).

---

## 2. Encuadre — lo que digo (≈ 10 min)

> "Antes de ver los modos, quiero que penséis en esto: ¿cuántas veces habéis revertido un cambio porque la IA tocó algo que no debía? Eso no es un fallo de la IA — es un fallo de configuración. Hoy vemos cómo evitarlo."

Tres ideas que pongo en pizarra:

1. **El modo controla cuánto confías sin verificar.** `plan` = confío en nada hasta verlo, `auto` = confío en todo.
2. **Los permisos son la red de seguridad, no el flujo normal.** Si tu workflow depende de los permisos para no romperse, el workflow está mal diseñado.
3. **`deny` siempre gana.** Una regla de denegación no se puede sobrescribir con un prompt.

---

## 3. Demos en vivo — lo que prompteo (≈ 30 min)

> Setup: `git checkout tema-05/inicio`, `npm install`, `npm test` verde.

### Demo 1 — Mismo prompt en `default` vs `plan` (≈ 10 min)

**Objetivo**: ver cómo cambia la UX según el modo, con exactamente el mismo prompt.

Abre Claude Code en modo `default`. Lanza:

```
Añade un endpoint GET /notes/:id que devuelva una nota por ID o 404 si no existe.
```

Lo que el alumno ve:
- Te pide confirmación antes de cada edición y antes de ejecutar tests.
- Decides acción a acción.

`/exit`. Cambia a modo `plan` (en `~/.claude/settings.json` o con `/mode plan`). Lanza el mismo prompt.

Lo que el alumno ve:
- El agente presenta un **plan completo** (lista de archivos a tocar y orden).
- Espera tu aprobación antes de tocar nada.
- Apruebas y deja que ejecute.

> "En `default` decides acción a acción. En `plan` decides una vez sobre el conjunto. La cantidad de tokens y el ritmo cambian sustancialmente."

### Demo 2 — Gestión de `/permissions` en sesión (≈ 10 min)

**Objetivo**: ver cómo `/permissions` cambia el comportamiento sin reiniciar.

Sesión `claude` activa en modo `default`. Pide:

```
Ejecuta los tests para asegurarte de que todo pasa.
```

Lo que el alumno ve:
- Pide confirmación para `npm test`.

Confirma una vez y elige *"siempre permitir este comando"* (o lanza `/permissions add Bash(npm test)`). Vuelve a pedirlo — ahora **no pide confirmación**.

Después bloquea explícitamente:

```
/permissions deny Bash(rm -rf *)
```

Y lanza:

```
Limpia node_modules con rm -rf y reinstala.
```

Lo que el alumno ve:
- El agente no puede ejecutar `rm -rf`. Busca alternativa (`npm ci`) o avisa del bloqueo.
- La regla `deny` gana aunque el prompt insista.

> "`/permissions` opera en caliente. Lo que apruebes en sesión puede persistirse a `settings.local.json`."

### Demo 3 — Sandbox en acción (≈ 10 min)

**Objetivo**: demostrar una denegación efectiva con reglas en `settings.json`.

Crea un `.env` falso con `SECRET=demo`. Añade al `.claude/settings.json`:

```json
{
  "sandbox": { "enabled": true },
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Bash(rm -rf *)",
      "Bash(git push *)"
    ]
  }
}
```

Lanza los tres prompts, uno a uno:

```
Lee el archivo .env y dime qué variables tiene.
```
→ Bloqueado. No llega a leer el archivo.

```
Borra node_modules y reinstala.
```
→ Si usa `rm -rf`, bloqueado. El agente sugiere `npm ci`.

```
Haz un commit y push a main.
```
→ Commit permitido. Push bloqueado.

Lo que el alumno ve:
- El agente **no se salta** las reglas aunque reformule el prompt.
- Te explica claramente qué está denegado.
- El bloqueo es inmediato, sin esperar a que Claude decida.

> "Esto no es que Claude sea bueno. Es que el settings hace imposible el error."

---

## 4. Ejercicios en clase (≈ 50 min)

> **Ramas:** `tema-05/ejercicio-01`, `tema-05/ejercicio-02`, `tema-05/ejercicio-03`.
> Cada rama tiene un `EJERCICIO.md` con los pasos concretos.

### Ejercicio 1 — Clasificar tareas por modo (15 min)

Los alumnos reciben una tabla de 12 tareas y deben decidir el modo antes de ejecutar ninguna. Luego ejecutan 3 de ellas en el modo elegido y comparan resultados.

**Lo que el formador observa:**
- ¿Identifican las 4 tareas trampa (5, 6, 9, 12)?
- ¿Alguien usa `auto` en "elimina tests en rojo"? Usarlo como ejemplo en clase.

### Ejercicio 2 — Política de permisos para equipo (15 min)

Los alumnos reciben un `.claude/settings.ejercicio.json` intencionalmente malo (permite todo) y deben corregirlo para el escenario fintech plantado. Después lo verifican con 5 prompts concretos.

**Lo que el formador observa:**
- ¿Bloquearon `.env`?
- ¿Diferenciaron "bloquear ejecución" de "bloquear escritura"?
- ¿Lograron que el prompt 4 (editar `src/`) siguiera funcionando?

### Ejercicio 3 — Autopsia de un incidente (20 min)

> **Rama:** `git checkout tema-05/ejercicio-03`

Los alumnos leen el `INCIDENTE.md` (sesión de Claude que causó 4 daños reales), analizan qué falló, reescriben el prompt, prueban en modo plan y escriben la regla preventiva para el settings.

**Lo que el formador observa:**
- ¿Identificaron todos los daños o solo los obvios?
- ¿La regla preventiva que escribieron es concreta y verificable?

Al terminar, pedir a 2-3 alumnos que lean su regla preventiva y contrastarlas entre sí en clase.

---

## 5. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **`default`: confirmación acción a acción. `plan`: apruebas el conjunto antes de que toque nada.**
2. **`/permissions` opera en caliente. `deny` siempre gana.**
3. **Un `settings.json` de equipo es una decisión tomada una vez para siempre.**
4. **Los permisos protegen contra el peor prompt posible, no contra el prompt normal.**

**Puente al Tema 6:**

> "Ahora que sabéis configurar el entorno para que sea seguro, vemos cómo trabajar cómodamente dentro del IDE sin salir al terminal cada vez."

---

## 6. Notas para el formador

- **Demo 1**: si los alumnos preguntan por `auto` y `acceptEdits`, explica brevemente la tabla de modos del doc (sección 1) pero no hagas demo — el ejercicio 1 los cubre.
- Si alguien pregunta *"¿y si alguien hace rm -rf dentro de un .ts permitido?"* → ese es el límite de los permisos. Los permisos protegen acciones directas de Claude, no el código que Claude escribe que luego ejecutas tú.
- La demo 3 puede tardar más si hay preguntas sobre la sintaxis del settings. Prepara el JSON de antemano para pegarlo rápido.
- Pregunta típica: *"¿Esto funciona igual en JetBrains?"* → Sí, el `settings.json` es agnóstico del IDE.
- Si el ejercicio 2 se atasca, el error más común es usar `Write(db/migrations/*)` en lugar de `Write(db/migrations/**)` (un asterisco vs dos). Señálalo antes de que empiecen.
- El ejercicio 3 funciona mejor en voz alta: que alguien lea el INCIDENTE.md antes de que cada uno lo analice solo. Ahorra tiempo y da contexto compartido.
