# Tema 10 — Exploración de repositorios desconocidos

> **Duración estimada:** \~60 min **Tipo:** práctico — alumnos delante del teclado

## Objetivo del tema

Usar Claude Code como lector sistemático de un repo desconocido: obtener en minutos el mapa de capas, detectar zonas frágiles y generar una guía de onboarding que normalmente tardaría horas en documentar.

***

## 1. Navegación guiada por carpetas, módulos y relaciones internas del proyecto

Claude Code no lee el repo entero de golpe. Navega en orden de densidad informativa:

1. `README.md`, `package.json` (o `go.mod`, `pyproject.toml`) → qué es y cómo arranca.
2. Entry point del servidor o aplicación → flujo de arranque.
3. Carpetas de primer nivel → separación de responsabilidades.
4. Archivos concretos solo cuando son necesarios para responder.

> Patrón: **preguntar → leer lo mínimo → citar la fuente**. Si Claude no cita un archivo, está inventando.

## 2. Petición de mapas conceptuales de arquitectura y capas del sistema

Un mapa de arquitectura no es un diagrama UML. Es la respuesta a:

* ¿Qué capas hay y qué hace cada una?
* ¿Cómo fluye una petición de entrada a salida?
* ¿Qué módulos son autónomos y cuáles están acoplados?

El formato más útil es una tabla de capas + descripción + archivos representativos. Más que un diagrama de flechas, necesitas saber _dónde vive cada responsabilidad_.

## 3. Identificación rápida de entry points, servicios, handlers y dependencias clave

Los tres nodos más importantes de cualquier backend:

| Nodo                 | Qué buscar                       | Ejemplo en Notebox      |
| -------------------- | -------------------------------- | ----------------------- |
| **Entry point**      | Archivo que arranca el servidor  | `src/server.ts`         |
| **Handlers / rutas** | Dónde entran las peticiones HTTP | `src/routes/notes.ts`   |
| **Servicios**        | Dónde vive la lógica de negocio  | `src/services/notes.ts` |

Cuando Claude identifica estos tres nodos desde el primer prompt, tienes el 80% del mapa.

### 🧪 Demo 1 — Mapa de arquitectura desde cero

* **Objetivo:** extraer el mapa completo de capas de Notebox con un único prompt.
* **Setup:** `git checkout tema-10/inicio`, sin haber leído ningún archivo del repo.

**Prompt literal:**

```
Sin abrir más archivos de los necesarios, dibuja un mapa de las capas de
este repositorio: entry point, rutas disponibles, servicios, storage y flujo
completo de un POST /notes de principio a fin. Cita rutas exactas para cada
elemento. Si no estás seguro de algo, dilo explícitamente. No inventes.
```

**Qué observar:**

* Claude lee `README.md`, `package.json`, `src/server.ts` y los directorios de primer nivel.
* El mapa cita rutas concretas (`src/routes/notes.ts:42`).
* El flujo de `POST /notes` sigue la cadena: ruta → servicio → storage.
* Si hay ambigüedad, la marca como _"no estoy seguro"_ en lugar de inventar.

### 🧩 Ejercicio 1 — Navegar el repo con prompts

> **Rama:** `git checkout tema-10/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Responde 3 preguntas de navegación del `EJERCICIO.md` usando solo prompts de exploración (no leyendo los archivos manualmente). Documenta cada respuesta con el prompt exacto que utilizaste.

## 4. Análisis de convenciones internas y patrones predominantes del repositorio

Las convenciones de un repo no están siempre en el `CLAUDE.md`. Se leen en el código:

* **Naming**: ¿camelCase, snake\_case, kebab-case? ¿Verbos o sustantivos en funciones?
* **Estructura de errores**: ¿clases semánticas o `Error` genérico?
* **Testing**: ¿mocks o integración real? ¿Qué runner?
* **Flujo de datos**: ¿validación en ruta o en servicio?

> Prompt útil: `"¿Cuáles son las 5 convenciones más consistentes en este repo? Cita ejemplos."` Este análisis tarda 30 segundos con Claude y horas leyendo manualmente.

## 5. Detección de deuda técnica y zonas especialmente frágiles del código

La deuda técnica deja señales en el código:

* Funciones largas con lógica anidada profunda.
* Comentarios del tipo `// TODO`, `// FIXME`, `// HACK`.
* Módulos que todos los demás importan (alta dependencia central).
* Falta de tests en un módulo concreto.
* Inconsistencias de convención entre archivos similares.

### 🧪 Demo 2 — Detectar las zonas más frágiles

* **Objetivo:** identificar deuda técnica con evidencia de código, no intuición.
* **Setup:** misma rama `tema-10/inicio`.

**Prompt literal:**

```
Analiza el repositorio e identifica las 3 zonas con más deuda técnica o más
frágiles. Para cada zona: archivo concreto, línea o función específica que
lo evidencia, y por qué supone un riesgo real. No listes cosas genéricas.
```

**Qué observar:**

* Claude cita archivos y líneas concretas, no categorías abstractas.
* La señal de fragilidad es verificable: puedes ir a esa línea y confirmarla.
* El riesgo está contextualizado (p. ej., "esta función no tiene tests y es el único punto de escritura al storage").
* Si Claude dice "parece" sin citar código, pide que lo verifique con una lectura.

### 🧩 Ejercicio 2 — Detectar zonas frágiles con evidencia

> **Rama:** `git checkout tema-10/ejercicio-02` · **Tiempo:** 12 min · **Tipo:** En clase

Identifica 3 zonas frágiles del repo y entrega una tabla con archivo, función o línea concreta, señal observable y riesgo real. **No se aceptan respuestas sin cita de código.**

## 6. Localización de puntos de extensión para nuevas funcionalidades

Antes de implementar una nueva funcionalidad, Claude puede decirte:

* Dónde añadir la ruta nueva (patrón de las rutas existentes).
* Qué métodos del servicio hay que añadir o modificar.
* Qué tipos hay que actualizar en el modelo.
* Qué tests hay que crear para seguir el patrón del repo.

> Prompt: `"Quiero añadir X. ¿Qué archivos tendría que tocar y dónde exactamente? No escribas código todavía."` Profundizamos en el [Tema 11](tema-11-nuevas-funcionalidades.md).

## 7. Resumen de contextos funcionales y técnicos para onboarding de nuevos perfiles

El onboarding de un desarrollador nuevo cuesta entre 2 y 4 semanas en repos sin documentación. Con Claude Code, el primer día puede tener:

* Mapa de capas con archivos representativos.
* Lista de los 5 flujos más importantes del sistema.
* Convenciones del repo y cómo verificarlas.
* Qué no tocar en los primeros días.

El output no es un documento de 50 páginas. Es una guía de lectura estructurada de 1-2 páginas.

### 🧪 Demo 3 — Generar guía de onboarding

* **Objetivo:** producir una guía de lectura lista para compartir con un nuevo desarrollador.
* **Setup:** misma rama `tema-10/inicio`.

**Prompt literal:**

```
Genera una guía de onboarding para un desarrollador que se incorpora mañana
a este repositorio. Incluye:
1. Orden de archivos a leer (máximo 8).
2. Qué hace cada archivo en una línea.
3. Los 3 flujos más importantes del sistema con los archivos que atraviesan.
4. Qué no debe tocar sin entender primero.
Sé concreto. Cita rutas reales.
```

**Qué observar:**

* La guía usa rutas reales del repo, no descripciones genéricas.
* El orden de lectura empieza por los archivos de mayor densidad informativa.
* Los flujos siguen la cadena de capas (entrada → lógica → persistencia).
* La sección "no tocar" identifica los módulos más críticos o frágiles.

### 🧩 Ejercicio 3 — Generar guía de onboarding

> **Rama:** `git checkout tema-10/ejercicio-03` · **Tiempo:** 20 min · **Tipo:** En clase

Genera la guía de onboarding completa para Notebox siguiendo el prompt de la demo. Después amplía la guía con un cuarto punto que Claude no puede saber sin que se lo digan: las decisiones de diseño intencionales que no deben "corregirse".

### 🧩 Ejercicio 4 — Skill `/onboarding-repo` (extra)

> **Rama:** `git checkout tema-10/ejercicio-04` · **Tiempo:** 25-35 min · **Tipo:** Extra (fuera de sesión)

Empaqueta el flujo completo del tema (mapa de capas → zonas frágiles → guía de onboarding) en una skill `/onboarding-repo` que genere un `ONBOARDING.md` en cualquier repo nuevo. Combina lo del [Tema 9](tema-09-skills.md) con lo de este tema.

## 8. Comparación entre servicios o módulos con responsabilidades similares

En repos con módulos paralelos (varios servicios, varios handlers con estructura similar), Claude puede comparar:

```
Compara src/services/notes.ts y src/services/users.ts.
¿Siguen el mismo patrón? ¿Dónde divergen y por qué podría ser un problema?
```

Esta comparación detecta inconsistencias que se introducen cuando distintos desarrolladores implementan el mismo patrón de forma diferente.

## 9. Generación de guías de lectura del repositorio para el equipo

Una guía de lectura es diferente a un onboarding: está orientada a desarrolladores que ya conocen el sistema pero necesitan orientarse en un módulo nuevo o legacy.

* **Para un módulo concreto**: `"Explica qué hace src/search/ y cómo se integra con el resto del sistema. Cita archivos y líneas."`
* **Para un sistema heredado**: `"Describe cómo funciona el módulo de autenticación sin modernizarlo. Solo entiéndelo primero."`

> Ver [Tema 14](tema-14-documentacion.md) para convertir estas guías en documentación formal del equipo.

## 10. Preparación de sesiones de trabajo profundas sobre sistemas heredados

Antes de tocar código legacy, invierte 10 minutos en entenderlo:

1. Mapa de dependencias del módulo: qué lo llama y qué llama.
2. Tests existentes (o ausencia de tests).
3. Puntos de entrada y salida de datos.
4. Convenciones rotas o inconsistencias locales.

> Regla: **nunca editar código que no entiendes**. Claude puede reducir drásticamente el tiempo de entendimiento; la decisión de tocar sigue siendo tuya.

***

## Resumen

* Claude navega el repo por densidad informativa: README, entry point, carpetas, archivos concretos.
* Siempre pide que cite rutas. Si no cita, está inventando.
* El mapa de arquitectura, las zonas frágiles y la guía de onboarding son los tres outputs más valiosos.
* Antes de implementar algo nuevo, usa Claude para localizar los puntos de extensión.
* Estas técnicas funcionan igual en repos desconocidos que en legacy que nadie quiere tocar.
