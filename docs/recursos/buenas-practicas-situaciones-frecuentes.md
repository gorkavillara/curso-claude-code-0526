# Buenas prácticas — situaciones frecuentes

> **Esto es una guía genérica.** No es *el* método correcto: es un esqueleto probado que tú adaptas a tu forma de trabajar, a tu equipo y a tus herramientas. Donde aquí pone "Obsidian", lee "Confluence, Notion, Jira, un `.md` en el repo o un papel". Lo que **no** cambia entre situaciones es el orden: **documentas → das contexto → planificas → ejecutas por fases → cierras con checklist**.

Los temas del curso enseñan *la técnica* de cada caso. Este recurso es la **chuleta de bolsillo**: lo que abres el lunes cuando te sientas a trabajar y no sabes por dónde empezar.

---

## Por qué documentar primero (el paso que todos se saltan)

El error más caro no es un mal prompt: es **lanzar Claude sin haber decidido tú qué quieres**. Cuando documentas antes:

- Te obligas a pensar el *qué* y el *por qué* antes que el *cómo*. Las decisiones de diseño las tomas tú, no el modelo.
- Conviertes ese documento en **contexto reutilizable**: lo pegas en el prompt, lo guardas como `CLAUDE.md`, lo referencias con `@archivo`.
- Tienes con qué **verificar** al final: ¿hace el código lo que el documento decía?

> La herramienta da igual. El hábito es el que importa: **una nota antes de cada tarea no trivial.**

### Cómo ese documento llega a Claude

| Vía | Cuándo usarla |
| --- | --- |
| **Pegar en el prompt** | Documento corto y de un solo uso (un plan de impacto, un brief). |
| **`@ruta/archivo.md`** | El doc vive en el repo y quieres que Claude lo lea entero. |
| **`CLAUDE.md`** | Contexto permanente del proyecto (convenciones, stack, decisiones). Ver Tema 7. |
| **Skill** | El flujo se repite igual cada vez → lo encapsulas. Ver Tema 9. |

---

## La plantilla común

Cada situación de abajo sigue **siempre** estos seis pasos. Memoriza el esqueleto, no las situaciones:

```
① Cuándo aplica          → reconoces que estás en este caso
② Paso 0 — Documentar     → qué capturas y dónde (genérico, adáptalo)
③ Cómo dárselo a Claude   → CLAUDE.md / pegar / @archivo / plan mode
④ Flujo de prompts        → plan → ejecución por fases → verificación
⑤ Checklist de cierre     → cómo sabes que has terminado
⑥ Errores comunes         → lo que sale mal cuando saltas un paso
```

---

## Situación 1 — Proyecto nuevo (greenfield)

**Temas relacionados:** Tema 7 (CLAUDE.md) · Tema 8 (Prompting) · Tema 25 (Arquitectura)

### ① Cuándo aplica
Empiezas algo desde cero: un repo vacío, un servicio nuevo, un prototipo. No hay convenciones todavía, así que **las defines tú al principio** o Claude las inventará por ti.

### ② Paso 0 — Documentar
Antes de la primera línea de código, una nota con:

- **Objetivo en una frase.** Qué resuelve y para quién.
- **Stack y restricciones.** Lenguaje, framework, base de datos, límites (sin Docker, debe correr en Node 18, etc.).
- **Estructura prevista.** Carpetas principales y qué va en cada una.
- **Lo que NO entra en la v1.** Tan importante como lo que sí.

### ③ Cómo dárselo a Claude
Esta nota es candidata directa a **`CLAUDE.md`** desde el día uno: es contexto permanente que aplicará a todos los prompts siguientes.

### ④ Flujo de prompts
1. **Scaffold mínimo, no el proyecto entero.** Pídele la estructura y un "hola mundo" que arranque, no las 12 features.
2. **Una capa o feature por iteración.** Confirmas que arranca antes de seguir.
3. **Convenciones explícitas desde el principio** (naming, manejo de errores, tests) — quedan grabadas en `CLAUDE.md`.

### ⑤ Checklist de cierre
- [ ] El proyecto arranca con un comando documentado en el README.
- [ ] `CLAUDE.md` refleja stack, estructura y convenciones reales.
- [ ] Hay al menos un test que pasa.
- [ ] El README explica cómo instalar y arrancar.

### ⑥ Errores comunes
- Pedir "créame la app completa" en un solo prompt → toca 30 archivos, ninguno revisable.
- No fijar convenciones → cada feature usa un estilo distinto.
- Saltarse el `CLAUDE.md` → repites el mismo contexto en cada prompt.

### 🧪 Mini-demo — Arrancar con scaffold y CLAUDE.md
- **Objetivo:** ver cómo una nota de 10 líneas se convierte en el `CLAUDE.md` que guía todo el proyecto.

**Prompt literal:**
```
[CONTEXTO]
Empiezo un proyecto nuevo. Te paso el brief:
- Objetivo: API REST de notas personales (CRUD).
- Stack: Node + Express + almacenamiento en JSON en disco (sin BD).
- Restricción: debe arrancar con `npm start`, Node 18, sin Docker.
- Estructura prevista: src/routes, src/services, src/storage, src/models.
- Fuera de v1: autenticación, tags, búsqueda.

[OBJETIVO]
1. Propón el contenido de un CLAUDE.md para este proyecto.
2. Genera SOLO el scaffold mínimo que arranque (estructura + un endpoint
   GET /health que responda 200). Nada más.

[FORMATO]
Primero el CLAUDE.md, luego la lista de archivos que vas a crear. Espera mi OK
antes de escribir código.
```

**Qué observar:**
- Claude separa contexto permanente (CLAUDE.md) de la tarea concreta (scaffold).
- No implementa el CRUD entero: respeta el "solo el scaffold mínimo".
- El CLAUDE.md propuesto ya incluye las convenciones del brief.

---

## Situación 2 — Documentar un proyecto existente

**Temas relacionados:** Tema 10 (Exploración de repos) · Tema 14 (Documentación, README y ADR)

### ① Cuándo aplica
Heredas o retomas un proyecto sin documentación, o la que hay está desactualizada. Necesitas un README, una guía de arquitectura o documentar una decisión.

### ② Paso 0 — Documentar
Aquí el documento es **el producto**, no el preparativo. Pero sigue habiendo un paso previo: decidir **qué tipo de doc** necesitas y **quién lo va a leer**.

- ¿README de "cómo arranco esto"? ¿Guía de arquitectura? ¿ADR de una decisión? ¿Onboarding?
- ¿Lo lee un dev nuevo, un cliente, tu yo de dentro de seis meses?

El lector define el nivel de detalle. No es lo mismo un README para un junior que para un arquitecto.

### ③ Cómo dárselo a Claude
Claude **lee el repo** para documentarlo — no se lo inventa. Trabaja sobre el código real (`@carpeta`, o dejándole explorar). Tu aportación es **el encuadre**: tipo de doc y audiencia.

### ④ Flujo de prompts
1. **Exploración primero.** Pídele que entienda y te resuma la arquitectura *antes* de redactar. Verificas que lo ha entendido bien.
2. **Redacción por secciones**, no el documento entero de golpe.
3. **Tú corriges los matices** que solo conoces tú (decisiones históricas, "esto está así por X").

### ⑤ Checklist de cierre
- [ ] Alguien que no conoce el proyecto podría arrancarlo siguiendo el doc.
- [ ] No hay afirmaciones inventadas: todo lo técnico está contrastado con el código.
- [ ] Las decisiones importantes ("por qué así") quedan registradas, no solo el "qué".
- [ ] El doc vive en el repo y se actualizará con él.

### ⑥ Errores comunes
- Pedir el README sin que Claude haya explorado → describe un proyecto genérico, no el tuyo.
- Aceptar afirmaciones plausibles pero falsas (alucinaciones sobre cómo funciona algo).
- Documentar el *qué* y olvidar el *por qué* (ahí entran los ADR).

### 🧪 Mini-demo — README contrastado con el código
- **Objetivo:** generar un README real, no uno genérico, forzando exploración antes de redacción.

**Prompt literal:**
```
[CONTEXTO]
Este repo no tiene README útil. Audiencia: un desarrollador nuevo que tiene que
arrancarlo en local mañana.

[OBJETIVO]
PASO 1 — Explora el repo y dime en 10 líneas: qué hace, stack, cómo arranca y
cuáles son los 3 puntos que más confundirían a alguien nuevo. NO escribas el
README todavía.

[FORMATO]
Espera mi confirmación. Si algo del código te resulta ambiguo, pregúntame en
lugar de asumir.
```
*(Tras validar el resumen, segundo prompt: "Ahora redacta el README con secciones Instalación, Arranque, Estructura y Gotchas.")*

**Qué observar:**
- Claude explora antes de afirmar; si algo es ambiguo, pregunta.
- El resumen revela si ha entendido el proyecto *antes* de invertir en la redacción.
- El README final cita rutas y comandos reales del repo.

---

## Situación 3 — Refactorizar

**Temas relacionados:** Tema 12 (Refactorización) · Tema 13 (Testing) · Tema 15 (Code review)

### ① Cuándo aplica
El código funciona pero es difícil de mantener: duplicación, una función de 300 líneas, acoplamiento, nombres confusos. **Refactorizar = cambiar la forma sin cambiar el comportamiento.**

### ② Paso 0 — Documentar
La nota más importante de todas, porque el riesgo aquí es **romper algo que funcionaba**:

- **Qué huele mal y por qué.** El problema concreto, no "está feo".
- **Qué comportamiento NO debe cambiar.** El contrato que tienes que preservar.
- **Red de seguridad.** ¿Hay tests? Si no, **ese es el paso 0 real**: tests antes de tocar nada.
- **Alcance.** Qué entra en este refactor y qué se queda para otro día.

### ③ Cómo dárselo a Claude
Pega la nota en el prompt y, sobre todo, **señala los archivos exactos** (`@ruta`). Un refactor sin límites de alcance se expande solo.

### ④ Flujo de prompts
1. **Tests primero** si no los hay. Capturan el comportamiento actual (la red de seguridad).
2. **Plan de refactor antes de tocar** — qué pasos, en qué orden, qué riesgos. **Plan mode** es ideal aquí.
3. **Refactor por pasos pequeños y verificables.** Tras cada paso: los tests siguen verdes.
4. **Diff pequeño y revisable.** Si Claude toca 20 archivos, has perdido el control.

### ⑤ Checklist de cierre
- [ ] El comportamiento es idéntico: los tests que pasaban antes pasan igual.
- [ ] El diff es legible y revisable (no un cambio masivo).
- [ ] No se ha colado lógica nueva disfrazada de refactor.
- [ ] El "olor" original ha desaparecido de verdad.

### ⑥ Errores comunes
- Refactorizar sin tests → no tienes forma de saber si rompiste algo.
- Mezclar refactor con features nuevas en el mismo commit → review imposible.
- Dejar que el alcance crezca ("ya que estoy, toco esto otro").
- Aceptar un diff enorme sin leerlo.

### 🧪 Mini-demo — Red de seguridad antes del refactor
- **Objetivo:** interiorizar que el primer prompt de un refactor casi nunca es el refactor.

**Prompt literal:**
```
[CONTEXTO]
La función `procesarPedido()` en @src/services/pedidos.js tiene 200 líneas y
mezcla validación, cálculo de precio y persistencia. Quiero separarla, pero NO
puede cambiar el comportamiento observable.

[OBJETIVO]
Antes de refactorizar nada:
1. ¿Hay tests que cubran esta función? Si no, propón los tests mínimos que
   capturen su comportamiento actual.
2. Luego dame un plan de refactor en pasos pequeños, cada uno verificable con
   esos tests, y los riesgos de cada paso.

[FORMATO]
No toques `procesarPedido` todavía. Primero tests, luego plan.
```

**Qué observar:**
- Claude prioriza la red de seguridad antes de mover código.
- El plan está troceado en pasos que dejan los tests verdes en cada punto.
- Se nombran riesgos concretos (orden de validaciones, efectos secundarios).

---

## Situación 4 — Rediseño UI / UX

**Temas relacionados:** Tema 8 (Prompting) · Tema 11 (Nuevas funcionalidades) · Tema 12 (Refactorización)

### ① Cuándo aplica
Cambiar cómo se ve o se usa una interfaz: rediseñar una pantalla, unificar estilos, mejorar un flujo. Es el caso **más subjetivo** — y por eso el que más se beneficia de documentar antes.

### ② Paso 0 — Documentar
Lo visual es ambiguo: "hazlo más moderno" no significa nada para el modelo. Captura:

- **Referencia visual.** Captura de pantalla del estado actual y, si tienes, del objetivo o un ejemplo que te guste.
- **Qué cambia y qué NO.** ¿Solo estética o también comportamiento/datos?
- **Restricciones del sistema de diseño.** Componentes existentes, tokens, librería (Tailwind, MUI...). No reinventar lo que ya hay.
- **Criterios de "terminado".** Responsive, accesibilidad, estados (carga, error, vacío).

### ③ Cómo dárselo a Claude
Aprovecha que Claude Code es **multimodal**: pégale capturas de pantalla directamente. Una imagen del diseño objetivo vale más que tres párrafos describiéndolo. Combínalo con `@` a los componentes actuales.

### ④ Flujo de prompts
1. **Un componente o pantalla por iteración.** El rediseño total de golpe es inrevisable.
2. **Reutiliza el sistema de diseño existente** — díselo explícitamente o creará estilos nuevos.
3. **Itera sobre lo visual con feedback concreto:** "el espaciado entre tarjetas es excesivo", no "no me gusta".
4. **Verifica estados, no solo el caso feliz:** carga, error, lista vacía, responsive.

### ⑤ Checklist de cierre
- [ ] Usa los componentes/tokens existentes, no estilos sueltos nuevos.
- [ ] Estados cubiertos: carga, error, vacío.
- [ ] Responsive en los breakpoints que importan.
- [ ] Accesibilidad básica (contraste, foco, etiquetas).
- [ ] El comportamiento/datos no ha cambiado si solo era estética.

### ⑥ Errores comunes
- Briefs vagos ("más moderno", "más limpio") → resultado aleatorio.
- Rediseñar 5 pantallas en un prompt → ninguna queda bien.
- Ignorar el sistema de diseño → fragmentación visual.
- Probar solo el caso feliz y descubrir el error de "lista vacía" en producción.

### 🧪 Mini-demo — Rediseño con captura y sistema de diseño
- **Objetivo:** ver cómo una captura + restricciones concretas vencen a la ambigüedad de lo visual.

**Prompt literal:**
```
[CONTEXTO]
Te adjunto una captura de la pantalla actual de listado de productos
(@src/components/ProductList.jsx). Usamos Tailwind y ya tenemos un componente
<Card> en @src/components/ui/Card.jsx.

[OBJETIVO]
Rediseña SOLO esta pantalla para que use <Card> en grid responsive (1 col móvil,
3 cols escritorio). No cambies los datos ni la lógica de carga. Incluye los
estados de carga, error y lista vacía.

[FORMATO]
Antes de tocar código, descríbeme en 5 puntos qué vas a cambiar y confírmame
que reutilizas <Card> y los tokens de Tailwind existentes.
```
*(Adjunta la captura de pantalla en el mismo mensaje.)*

**Qué observar:**
- Claude usa la imagen como referencia, no una interpretación inventada de "moderno".
- Reutiliza `<Card>` en lugar de crear estilos nuevos.
- Cubre los tres estados sin que se lo recuerdes en cada iteración.

---

## Resumen — la regla que se repite

Las cuatro situaciones son la misma receta con distinto relleno:

| Situación | Qué documentas en el Paso 0 | El error de saltárselo |
| --- | --- | --- |
| **Proyecto nuevo** | Objetivo, stack, estructura, qué NO entra | App genérica de 30 archivos sin convenciones |
| **Documentar** | Tipo de doc y audiencia | README inventado que no describe tu repo |
| **Refactorizar** | Qué NO debe cambiar + red de tests | Rompes algo y no te enteras |
| **Rediseño UI/UX** | Referencia visual + restricciones | "Más moderno" → resultado aleatorio |

> Si solo te llevas una idea de este recurso: **escribe la nota antes de escribir el prompt.** Da igual si es Obsidian, Notion, Confluence, Jira o un post-it. El hábito es lo que cambia el resultado.
