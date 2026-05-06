# Tema 1 — Ejercicios

> Tema conceptual. Los ejercicios son de **observación y criterio**, no de implementación.
> El alumno trabaja sobre **cualquier repositorio que ya conozca** (uno propio, mejor).

---

## Ejercicio 1 — "Cuéntame este repo en 5 líneas" (15 min)

### Enunciado

Abre Claude Code apuntando a un repositorio que **ya conoces bien** (uno propio, no de prueba). Pídele un resumen del repo con esta restricción: **5 líneas, sin inventar, citando archivos**.

Después responde por escrito (un párrafo corto):
1. ¿Acertó en lo importante?
2. ¿Se inventó algo? ¿Cómo lo detectaste?
3. Si tuvieras que enseñarle el repo a un compañero nuevo, ¿usarías esa descripción tal cual o no? ¿Por qué?

### Pista

Empieza con un prompt restrictivo. Algo como:

```
Resume este repositorio en 5 líneas. Cita archivos concretos por su ruta.
Si no estás seguro de algo, no lo escribas.
```

El truco está en que **tú ya sabes la respuesta correcta**: estás auditando al modelo, no aprendiendo del repo.

### Solución de referencia (qué espero leer del alumno)

- Identifica que Claude lee `README.md`, `package.json` / `pyproject.toml`, y un par de archivos de entrada antes de contestar.
- Detecta al menos **una imprecisión** o **una omisión** (suele faltar contexto de dominio, no técnico).
- Concluye que el resumen sirve como **borrador para onboarding**, no como verdad.

---

## Ejercicio 2 — Mismo trabajo, dos herramientas (20 min)

### Enunciado

Elige **una tarea real pequeña** que tengas pendiente o que puedas reproducir (ej. "renombrar una función y propagarlo" o "escribir un test para X").

Hazla **dos veces**:
- **A)** Solo con autocompletado de tu IDE (Copilot, IntelliSense, lo que uses).
- **B)** Solo con Claude Code, prompteando la tarea entera.

Cronometra cada una. Anota:
- Tiempo total.
- Número de errores que tuviste que corregir tú.
- Si el resultado final fue equivalente.

### Pista

La tarea tiene que ser lo bastante grande para que Claude tenga algo que hacer (3-5 archivos como mínimo) pero lo bastante pequeña para terminarla en 15 min con cualquiera de las dos vías.

### Solución de referencia (lo que el ejercicio debería revelar)

No hay un "ganador" predeterminado. Lo importante es que el alumno **identifique para qué tipo de tarea le compensó cada herramienta**. Patrones esperables:

- En tareas "de un archivo, lógica que ya tengo en la cabeza" → autocompletado va igual o más rápido.
- En tareas "varios archivos, propagar un cambio" → Claude Code gana cuando el alumno sabe prompter; pierde cuando va a ciegas.
- Si pierde mucho tiempo "explicando el contexto" a Claude, es que la tarea no era para Claude o el prompt era pobre.

---

## Ejercicio 3 — La lista negra del equipo (15 min, en grupo o individual)

### Enunciado

Escribe **dos listas cortas** referidas a tu trabajo real (proyecto actual o último proyecto serio):

- **Sí-Claude**: 5 tareas concretas que delegarías a Claude Code mañana.
- **No-Claude**: 5 tareas que **NO** delegarías ni con buenos prompts. Para cada una, una frase de por qué.

### Pista

No vale "lo que sea sencillo / complicado". Pide categorías como:

- ¿Es tarea con **resultado verificable** rápido?
- ¿Tiene **consecuencia silenciosa** si falla? (pagos, permisos, migraciones, criptografía, parsing de datos críticos)
- ¿Hay **convenciones implícitas** del equipo que no están escritas en ningún sitio?

### Solución de referencia (criterios que espero ver en la lista "No-Claude")

- Lógica de **negocio sutil** que sólo está clara hablando con producto.
- Cambios sobre **infra de pagos / autenticación / autorización** sin revisión humana posterior.
- **Migraciones de datos destructivas** (drop, alter sin reversible).
- Código en lenguajes / frameworks **muy poco representados** en el entrenamiento (DSLs internos, COBOL, etc.).
- Cambios donde **no hay test** ni manera fácil de comprobar que sigue funcionando.

Si un alumno mete "todo lo de seguridad" en No-Claude, matízalo: Claude **ayuda** en seguridad (lo veremos en Tema 14), pero la decisión final es humana.

---

## Cierre del bloque de ejercicios

Tres preguntas para pasar de tema (responder oralmente o en chat del curso):

1. ¿Qué tarea de tu próxima sprint le pasarías a Claude Code el primer día?
2. ¿Qué tarea **no** le pasarías ni aunque te insistan?
3. ¿Cuál crees que es el mayor riesgo si tu equipo entero adopta esto sin método?

Estas tres preguntas vuelven a salir en el Tema 26 (gobierno y estándares de equipo). Es la primera siembra.
