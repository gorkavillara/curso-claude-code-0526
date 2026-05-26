# Tema 10 — Exploración de repositorios desconocidos, comprensión de arquitectura y onboarding acelerado

> Duración estimada: 80 min · Tipo: práctico (alumnos delante del teclado).
> Repositorio de prácticas: rama `tema-10/inicio` (notebox, Node 24 + Express + TypeScript).

## 0. Objetivo del tema

Que el alumno aprenda a extraer el mapa de capas, detectar zonas frágiles y generar una guía de onboarding de un repositorio desconocido, usando prompts sistemáticos en lugar de leer 50 archivos a mano.

---

## 1. Flujo de sesión

Estructura **intercalada**: cada técnica se practica en caliente. Así el alumno asocia el prompt con el output inmediatamente.

```
00:00 — Encuadre                               (5 min)
00:05 — Demo 1: mapa de arquitectura           (10 min)
00:15 — Ejercicio 1: mapear notebox            (15 min, en clase)
00:30 — Demo 2: detectar zonas frágiles        (8 min)
00:38 — Ejercicio 2: deuda técnica             (12 min, en clase)
00:50 — Demo 3: guía de onboarding             (5 min)
00:55 — Ejercicio 3: generar la guía           (20 min, en clase)
75:00 — Cierre y puente                        (5 min)
```

> **Si vas justo de tiempo:** comprime la Demo 3 a 3 minutos (muestra el output sin ejecutarlo en directo) y reduce el ejercicio 3 a 15 minutos (solo los puntos 1 y 2 del EJERCICIO.md, omite los flujos).

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "Pensad en la última vez que tuvisteis que entrar a un repositorio que no conocíais. ¿Cuánto tardasteis en entender qué hacía? ¿Cuánto en saber qué podíais tocar sin romper nada? Con Claude Code eso pasa en 10 minutos. Pero solo si hacéis las preguntas correctas."

Dos ideas rápidas:

1. **Claude navega por densidad informativa, no en orden alfabético.** README, entry point, carpetas de primer nivel — después archivos concretos solo cuando hacen falta.
2. **Si Claude no cita un archivo, lo está inventando.** Cada afirmación sobre el repo tiene que venir respaldada por una ruta. Si no la tiene, pide que la verifique.

---

## 3. Demo 1 + Ejercicio 1 — Mapa de arquitectura (≈ 25 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-10/inicio`, `npm install`. Sin haber leído ningún archivo del repo.

Lanza este prompt desde una sesión limpia (sin contexto previo del repo):

```
Sin abrir más archivos de los necesarios, dibuja un mapa de las capas de
este repositorio: entry point, rutas disponibles, servicios, storage y
flujo completo de un POST /notes de principio a fin. Cita rutas exactas
para cada elemento. Si no estás seguro de algo, dilo explícitamente. No inventes.
```

Lo que el alumno ve:
- Claude lee `README.md`, `package.json`, `src/server.ts` y los directorios de primer nivel.
- El mapa cita rutas concretas (`src/routes/notes.ts`, `src/services/notes.ts`...).
- El flujo de `POST /notes` sigue la cadena: ruta → servicio → storage.
- Cualquier ambigüedad se marca como *"no estoy seguro"*.

Después lanza un segundo prompt para profundizar en el storage:

```
¿Cómo persiste una nota el storage? Cita las líneas exactas de src/storage/memory.ts
donde ocurre la escritura y la lectura.
```

> "El primer prompt da el mapa. El segundo profundiza donde nos interesa. Así se navega un repo desconocido: primero la superficie, después el detalle."

### Ejercicio 1 (15 min)

> **Rama:** `git checkout tema-10/ejercicio-01`

Los alumnos reciben tres preguntas de navegación en el EJERCICIO.md y deben responderlas con prompts de exploración al repo (no leyendo los archivos manualmente):

1. ¿Qué hace `src/search/index.ts` y cómo se invoca desde la ruta de búsqueda?
2. ¿Qué convenciones de error usa el repositorio? Cita al menos dos ejemplos con ruta y línea.
3. ¿Cuál es el flujo completo de `GET /notes/search?q=...` de la ruta al storage?

Documentan las respuestas y el prompt que usaron para cada una en una tabla del EJERCICIO.md.

**Lo que el formador observa:**
- ¿Los prompts incluyen la restricción "cita rutas exactas" o "no inventes"?
- ¿Las respuestas citan archivos y líneas o son descripciones genéricas?
- ¿Alguien descubrió inconsistencias entre lo que Claude describió y lo que hay en el código?

---

## 4. Demo 2 + Ejercicio 2 — Detectar zonas frágiles (≈ 20 min)

### Demo 2 (8 min)

> Setup: misma rama, misma sesión o nueva.

```
Analiza el repositorio e identifica las 3 zonas con más deuda técnica o más
frágiles. Para cada zona: archivo concreto, línea o función específica que
lo evidencia y por qué supone un riesgo real. No listes cosas genéricas.
```

Lo que el alumno ve:
- Claude cita archivos y líneas concretas.
- Las señales son verificables: puedes ir a esa línea y confirmar.
- El riesgo está contextualizado (p. ej., "esta función es el único punto de escritura al storage y no tiene tests").

Si el output es genérico, lanza un segundo prompt:

```
Lo que me acabas de decir es genérico. Para la zona 1, lee el archivo y dime
exactamente en qué línea detectas la señal.
```

> "Si Claude dice 'parece que puede haber problemas con X' sin citar código, está improvisando. Forzadlo a leer antes de opinar."

### Ejercicio 2 (12 min)

> **Rama:** `git checkout tema-10/ejercicio-02`

Los alumnos usan prompts de análisis para detectar deuda técnica en Notebox. Deben entregar una tabla con 3 zonas frágiles: archivo, función/línea, señal concreta, riesgo. No se aceptan respuestas sin cita de código.

**Lo que el formador observa:**
- ¿Todas las entradas de la tabla tienen una línea de código citada?
- ¿Los alumnos detectaron alguna zona que no detectó Claude (señalarlo como positivo)?
- ¿Alguien preguntó a Claude por qué algo es un riesgo y Claude lo justificó con evidencia?

---

## 5. Demo 3 + Ejercicio 3 — Guía de onboarding (≈ 25 min)

### Demo 3 (5 min)

> Setup: misma rama.

```
Genera una guía de onboarding para un desarrollador que se incorpora mañana
a este repositorio. Incluye:
1. Orden de archivos a leer (máximo 8).
2. Qué hace cada archivo en una línea.
3. Los 3 flujos más importantes del sistema con los archivos que atraviesan.
4. Qué no debe tocar en los primeros días.
Sé concreto. Cita rutas reales.
```

Lo que el alumno ve:
- La guía usa rutas reales, no descripciones genéricas.
- El orden de lectura empieza por `README.md`, `package.json`, entry point.
- Los flujos siguen la cadena de capas.
- La sección "no tocar" identifica los módulos más críticos.

> "Esto es lo que tardaban 2 semanas en generar por escrito. En 30 segundos tienes la base. Os tocará revisarla, pero la base está hecha."

### Ejercicio 3 (20 min)

> **Rama:** `git checkout tema-10/ejercicio-03`

Los alumnos generan una guía de onboarding para Notebox siguiendo el prompt de la demo. Después amplían la guía con un cuarto punto que Claude no puede saber sin que se lo digan: **qué decisiones de diseño son intencionales y no deben "corregirse"** (por ejemplo, usar storage en memoria en lugar de una base de datos).

Documentan la guía completa en el EJERCICIO.md y señalan qué partes generó Claude y qué añadieron ellos manualmente.

**Lo que el formador observa:**
- ¿La guía de Claude cita rutas reales o es genérica?
- ¿Los alumnos identificaron algún gap que Claude no cubrió?
- ¿La sección "no tocar" es específica (archivos y razones) o vaga?

---

## 5.bis. Ejercicio 4 — Skill `/onboarding-repo` (extra, fuera de sesión)

> **Rama:** `git checkout tema-10/ejercicio-04` · **Tiempo estimado:** 25-35 min · **Tipo:** extra, para alumnos que terminen antes o como tarea entre sesiones. Combina lo del tema 9 (skills) con lo del tema 10 (exploración).

### Idea

El ejercicio 3 deja una guía de onboarding **escrita una vez para Notebox**. El siguiente paso lógico es: empaquetar ese flujo como una skill reutilizable que cualquier persona del equipo pueda ejecutar contra cualquier repo nuevo y obtener la guía en 30 segundos.

### Lo que el alumno construye

Una skill en `.claude/skills/onboarding-repo/SKILL.md` con `description:` calibrada para auto-trigger (p. ej. cuando el usuario dice "onboarding de este repo" o "ayúdame a entrar a este proyecto"). La skill encadena los tres prompts del tema:

1. Mapa de capas (entry point, rutas, servicios, storage).
2. Zonas frágiles con evidencia citada (mínimo 3, con archivo y línea).
3. Guía de onboarding: orden de lectura, flujos principales, qué no tocar.

El output final es un fichero `ONBOARDING.md` en el directorio raíz del repo que se ataque, no una respuesta efímera en el chat.

### Lo que el formador valida

- ¿La `description:` está suficientemente acotada para no auto-disparar por accidente?
- ¿La skill obliga a citar rutas en cada sección (instrucción explícita en el cuerpo)?
- ¿La skill genera un fichero `ONBOARDING.md` o solo responde en el chat?
- ¿El alumno probó la skill contra **otro repo distinto a Notebox** para verificar que generaliza?

### Puente con temas anteriores

- Tema 9: estructura del SKILL.md, `description:` para auto-trigger.
- Tema 7 (CLAUDE.md): si el alumno va más allá, puede pedir que el último paso de la skill sea proponer un `CLAUDE.md` inicial a partir del onboarding generado.

---

## 6. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Claude navega por densidad informativa. README → entry point → carpetas → archivos.**
2. **Si no cita un archivo, está inventando. Forzadlo a citar siempre.**
3. **El mapa de capas, las zonas frágiles y la guía de onboarding: los tres outputs más valiosos.**
4. **La exploración no reemplaza entender el código. Reduce el tiempo hasta que puedes entenderlo.**

**Puente al Tema 11:**

> "Ahora sabéis orientaros en un repo nuevo y detectar dónde están las zonas frágiles. En el siguiente tema usamos eso para algo concreto: implementar una nueva funcionalidad sin romper lo que ya existe."

---

## 7. Notas para el formador

- Si alguien dice *"yo puedo leer el repo sin Claude"* → correcto. El punto no es que no puedas leerlo, es que en un sistema legacy de 200 archivos este proceso tarda horas. El ejercicio es sobre la escalabilidad de la técnica.
- El error más común en el ejercicio 1: alumnos que responden las preguntas leyendo los archivos directamente en lugar de usar prompts. Recordarles que el objetivo es practicar los prompts de exploración.
- Pregunta típica: *"¿Qué pasa si Claude cita una ruta que no existe?"* → Es una alucinación. Siempre verificar las citas. En el ejercicio 2, pedir a los alumnos que verifiquen al menos una cita manualmente.
- Pregunta trampa valiosa: *"¿Sirve esto para repos con 500.000 líneas?"* → Sí, con más iteraciones. El primer prompt da la superficie; luego se profundiza módulo a módulo. Claude no lee el repo entero de golpe, navega.
- Si hay tiempo al final del ejercicio 3: pedir que conviertan la guía de onboarding en un `CLAUDE.md` inicial para el repo.
