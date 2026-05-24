# Tema 5 — Modos de trabajo, permisos y sandboxing

> Duración estimada: 70 min · Tipo: conceptual + práctico.
> Repositorio de prácticas: rama `tema-05/inicio` (notebox, Node 24 + Express + TypeScript).

## 0. Objetivo del tema

Que el alumno desarrolle **criterio antes de ejecutar**: elegir el modo correcto, diseñar permisos que protejan sin bloquear, y entender que los permisos son la última línea de defensa — el prompt es la primera.

---

## 1. Flujo de sesión

Estructura **batch**: primero todas las demos, después los ejercicios en clase. Los ejercicios 1 y 2 necesitan haber visto las tres demos para tener el cuadro completo. El ejercicio 3 es asíncrono.

```
00:00 — Encuadre                        (10 min)
00:10 — Demo 1: modos en el mismo repo  (10 min)
00:20 — Demo 2: política de permisos    (10 min)
00:30 — Demo 3: modo plan como net      (10 min)
00:40 — Ejercicio 1: clasificar modos   (15 min, en clase)
00:55 — Ejercicio 2: política fintech   (15 min, en clase)
70:00 — Cierre y puente                 (5 min)
——————
Ejercicio 3: autopsia incidente          (asíncrono — lo hacen solos)
```

> **Si vas justo de tiempo:** recorta el encuadre a 5 min y deja el ejercicio 2 como inicio de asíncrono.

---

## 2. Encuadre — lo que digo (≈ 10 min)

> "Antes de ver los modos, quiero que penséis en esto: ¿cuántas veces habéis revertido un cambio porque la IA tocó algo que no debía? Eso no es un fallo de la IA — es un fallo de configuración. Hoy vemos cómo evitarlo."

Tres ideas que pongo en pizarra:

1. **El modo controla cuánto confías sin verificar.** `auto` = confío en todo, `plan` = confío en nada hasta verlo.
2. **Los permisos son la red de seguridad, no el flujo normal.** Si tu workflow depende de los permisos para no romperse, el workflow está mal diseñado.
3. **El equipo toma decisiones una vez; el settings.json las aplica siempre.** Una política corporativa es mejor que 10 desarrolladores tomando la misma decisión cada día.

---

## 3. Demos en vivo — lo que prompteo (≈ 30 min)

> Setup: `git checkout tema-05/inicio`, `npm install`, `npm test` verde.

### Demo 1 — El mismo repo, tres modos distintos (≈ 10 min)

**Objetivo**: ver cómo cambia el comportamiento de Claude con el modo, no con el prompt.

Abre Claude Code. **Sin cambiar el prompt**, lanza esto en tres modos diferentes:

```
Añade un campo `priority` (número, 1-3) al modelo Note.
```

- **Modo `auto`**: ejecuta solo. Toca models, routes, tests, quizás storage. Sin preguntar.
- **Modo `default`**: edita archivos pero pide OK antes de ejecutar comandos.
- **Modo `plan`**: propone el plan completo. Tú lees, ajustas, apruebas antes de que toque una línea.

Lo que el alumno ve:
- El mismo prompt produce tres experiencias de control completamente distintas.
- En `plan` puedes rechazar el paso 3 de 5 sin cancelar todo.
- En `auto` no puedes rechazar nada que ya se ejecutó.

> "El modo no cambia lo que Claude sabe hacer. Cambia cuánto de eso decides tú."

### Demo 2 — Escribir una política de permisos real (≈ 10 min)

**Objetivo**: ver `.claude/settings.json` como herramienta de equipo, no como configuración personal.

Escenario: este repo tiene (o imaginemos que tiene) un `.env` con credenciales reales y un `scripts/deploy.sh`. Quiero que Claude pueda editar `src/` libremente pero no pueda leer `.env` ni ejecutar el deploy.

Escribo el settings en directo:

```json
{
  "permissions": {
    "allow": [
      "Edit(src/**)",
      "Edit(test/**)",
      "Bash(npm test)",
      "Bash(npm run *)"
    ],
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Bash(scripts/deploy.sh*)",
      "Bash(rm -rf*)",
      "Bash(git push*)"
    ]
  }
}
```

Después lanzo un prompt que debería bloquearse:

```
Muéstrame el contenido de .env para verificar la configuración.
```

Lo que el alumno ve:
- Bloqueado. No llega a leer el archivo.
- El bloqueo es inmediato, sin esperar a que Claude decida.

> "Esto no es que Claude sea bueno. Es que el settings hace imposible el error."

### Demo 3 — Modo plan como red de seguridad (≈ 10 min)

**Objetivo**: demostrar que el modo plan no es lento — es el paso de revisión que cualquier ingeniero haría mentalmente.

Lanza este prompt deliberadamente vago en modo `plan`:

```
Refactoriza src/services/notes.ts, está un poco desordenado.
```

Lo que el alumno ve:
- Claude propone un plan de N pasos.
- Algunos pasos son correctos (refactorizar archive/unarchive).
- Otros se pasan de scope (actualizar dependencias, limpiar logs, leer .env).
- **Yo rechazo los pasos que no pedí** antes de aprobar.

Pido en sesión que ajuste el plan:

```
Limita el plan a src/services/notes.ts únicamente.
No toques dependencias ni ejecutes comandos shell más allá de npm test.
```

Lo que el alumno ve:
- El plan se ajusta sin volver a empezar.
- Solo se ejecuta lo que aprobamos.

> "El modo plan no te hace más lento. Te hace consciente de lo que vas a firmar."

---

## 4. Ejercicios en clase (≈ 30 min)

> **Rama:** `git checkout tema-05/ejercicio-01` para el ejercicio 1, `tema-05/ejercicio-02` para el 2.
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
- ¿Lograron que el prompt 4 (editar src/) siguiera funcionando?

---

## 5. Ejercicio asíncrono

### Ejercicio 3 — Autopsia de un incidente (35 min, fuera de clase)

> **Rama:** `tema-05/ejercicio-03`

Los alumnos leen el `INCIDENTE.md` (sesión de Claude que causó 4 daños reales), analizan qué falló, reescriben el prompt, prueban en modo plan y escriben la regla preventiva para el settings.

**Revisión en la siguiente sesión:** pedir a 2-3 alumnos que lean su regla preventiva. Contrastarlas entre sí.

---

## 6. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **El modo define cuánto decides tú antes de que se ejecute algo.**
2. **Los permisos protegen contra el peor prompt posible, no contra el prompt normal.**
3. **Un settings.json de equipo es una decisión tomada una vez para siempre.**
4. **Modo plan: no es lento, es el diff antes de aceptar.**

**Puente al Tema 6:**

> "Ahora que sabéis configurar el entorno para que sea seguro, vemos cómo trabajar cómodamente dentro del IDE sin salir al terminal cada vez."

---

## 7. Notas para el formador

- Si algún alumno pregunta *"¿y si alguien hace rm -rf dentro de un .ts permitido?"* → ese es el límite de los permisos. Los permisos protegen acciones directas de Claude, no el código que Claude escribe que luego ejecutas tú. Siembra el tema: lo abordaremos en revisión de código (Tema 15).
- La demo 2 puede tardar más si hay preguntas sobre la sintaxis del settings. Prepara el JSON de antemano para pegarlo rápido.
- Pregunta típica: *"¿Esto funciona igual en JetBrains?"* → Sí, el settings.json es agnóstico del IDE.
- Si el ejercicio 2 se atasca, el error más común es usar `Write(db/migrations/*)` en lugar de `Write(db/migrations/**)` (un asterisco vs dos). Señálalo antes de que empiecen.
