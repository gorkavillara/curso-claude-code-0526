# Tema 11 — Generación de nuevas funcionalidades

> **Duración estimada:** \~60 min **Tipo:** práctico — alumnos delante del teclado

## Objetivo del tema

Implementar funcionalidades nuevas con Claude Code siguiendo el orden correcto: primero entender el impacto, después implementar por capas, y cerrar con un checklist técnico. Si saltas al código sin el plan, el agente toca más de lo necesario.

***

## 1. Diseño incremental de funcionalidades antes de escribir el primer cambio

El error más común es pedir la implementación completa desde el primer prompt. El resultado: Claude toca 12 archivos cuando tendría que tocar 4, introduce decisiones de diseño que deberían ser tuyas y hace difícil el review.

El flujo correcto:

```
1. Prompt de impacto → lista de archivos y decisiones de diseño
2. Decisión humana sobre el diseño
3. Implementación por capas (modelo → servicio → ruta)
4. Tests
5. Checklist de cierre
```

> El modelo de IA ejecuta bien. Diseña mal. Las decisiones de arquitectura las tomas tú antes del primer prompt de implementación.

## 2. Identificación de capas afectadas por una nueva necesidad de negocio

Antes de escribir código, la pregunta correcta es: **¿qué capas toca esta funcionalidad?**

Para un backend con arquitectura de capas (ruta → servicio → storage → modelo):

| Capa         | Cuándo se toca                           |
| ------------ | ---------------------------------------- |
| **Modelo**   | Cambio en la estructura de datos         |
| **Storage**  | Cambio en cómo se persiste o recupera    |
| **Servicio** | Nueva lógica de negocio o validación     |
| **Ruta**     | Nuevo endpoint o cambio de contrato HTTP |

Identificar las capas afectadas antes de implementar determina el scope del cambio.

### 🧪 Demo 1 — Plan de impacto antes del código

* **Objetivo:** extraer el plan completo de una nueva funcionalidad sin escribir ni una línea de código todavía.
* **Setup:** `git checkout tema-11/inicio`, `npm test` verde.

**Prompt literal:**

```
[CONTEXTO]
Repositorio Notebox: src/routes/, src/services/, src/storage/, src/models/.

[OBJETIVO]
Quiero añadir etiquetas (tags) a las notas: cada nota puede tener 0 a N tags
(array de strings), y quiero poder filtrar GET /notes por tag exacto.

[FORMATO]
Antes de escribir código: lista los archivos que afecta, los cambios
necesarios en cada capa, los tests que habrá que crear y los 3 mayores
riesgos de la implementación. No escribas código todavía.
```

**Qué observar:**

* Claude identifica las 4 capas afectadas: modelo, storage, servicio, ruta.
* Lista los archivos concretos con los cambios necesarios.
* Propone tests antes de que los pidas.
* Señala riesgos (p. ej., retrocompatibilidad del storage al añadir un campo nuevo).

### 🧩 Ejercicio 1 — Plan de impacto para `PATCH /notes/:id`

> **Rama:** `git checkout tema-11/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Genera el plan de impacto para implementar `PATCH /notes/:id` (actualización parcial: pueden venir `title`, `body` o ambos, nunca más). Entrega capas afectadas, archivos a tocar, tests necesarios y 3 riesgos principales. Sin código todavía.

## 3. Generación de código alineado con convenciones existentes del proyecto

Claude Lee el código existente antes de generar nuevo código. Eso significa que si el repo tiene:

* Errores semánticos → el nuevo código usará errores semánticos.
* Tests con `node --test` → los nuevos tests usarán `node --test`.
* Validación en el servicio → la nueva validación irá al servicio.

Pero solo si el `CLAUDE.md` lo especifica o si las convenciones son visibles en el código. Un repo inconsistente produce código inconsistente.

> Antes de implementar algo nuevo, verifica que las convenciones del repo están en `CLAUDE.md`. Si no, Claude las infiere del código existente — y puede inferir el patrón equivocado. Ver [Tema 7](tema-07-claude-md-memoria.md).

## 4. Implementación guiada de endpoints, servicios, validaciones y persistencia

La regla de oro: **implementa una capa a la vez y valida antes de pasar a la siguiente.**

### 🧪 Demo 2 — Implementar la feature de tags por capas

* **Objetivo:** implementar los tags del plan anterior capa a capa, validando con tests en cada paso.
* **Setup:** misma rama `tema-11/inicio`. El plan de la Demo 1 está visible en la sesión.

**Capa 1 — modelo:**

```
[OBJETIVO]
Añade el campo `tags: string[]` al modelo Note con valor por defecto [].
Actualiza el factory de Note.

[RESTRICCIONES]
- Solo toca src/models/note.ts.
- Tests existentes deben seguir pasando.

[FORMATO]
Diff mínimo + ejecuta npm test.
```

**Capa 2 — servicio y filtrado:**

```
[OBJETIVO]
Añade soporte para filtrar notas por tag en getNotes(). Si se pasa `tag`,
devuelve solo las notas que contienen ese tag en su array.

[RESTRICCIONES]
- Solo toca src/services/notes.ts.
- La firma de getNotes() acepta un parámetro opcional `{ tag?: string }`.
- Añade el test correspondiente.

[FORMATO]
Diff + npm test.
```

**Qué observar:**

* Cada capa es un diff revisable en menos de 2 minutos.
* Los tests validan cada capa antes de pasar a la siguiente.
* Si un test falla, el scope del problema está acotado a esa capa.

### 🧩 Ejercicio 2 — Implementar PATCH por capas

> **Rama:** `git checkout tema-11/ejercicio-02` · **Tiempo:** 20 min · **Tipo:** En clase

Implementa `PATCH /notes/:id` siguiendo el plan del ejercicio anterior: una capa a la vez (servicio → ruta), con `[RESTRICCIONES]` para acotar el scope y `npm test` verde antes de pasar a la siguiente capa.

## 5. Creación de componentes frontend y lógica de interfaz con contexto real

En un stack frontend (React, Vue, etc.), el mismo patrón aplica:

1. Primero el tipo o contrato de datos.
2. Luego el hook o servicio que llama a la API.
3. Finalmente el componente que muestra los datos.

El `CLAUDE.md` del proyecto debe incluir el framework de UI, el sistema de estilos y las convenciones de naming de componentes. Sin eso, Claude elige por su cuenta.

## 6. Petición de cambios acotados para reducir riesgo en producción

La instrucción `[RESTRICCIONES]` en el prompt es tu línea de defensa:

* `Solo toca src/services/notes.ts` → Claude no toca la ruta aunque crea que debería.
* `Tests existentes sin cambios` → no hay regresiones inesperadas en el suite.
* `Sin librerías nuevas` → no aparece una dependencia nueva en el `package.json`.

> Cuanto más específico el scope, más fácil es el review y más predecible el resultado.

## 7. Incorporación de feature flags, toggles o configuraciones de despliegue

Para features con riesgo en producción, pide explícitamente un toggle:

```
[RESTRICCIONES]
La feature de tags debe estar detrás de una variable de entorno ENABLE_TAGS.
Si no está definida, el comportamiento es idéntico al actual.
```

Claude añadirá la guarda de entorno y no romperá el comportamiento existente. Sin esta instrucción, implementará la feature directamente.

## 8. Verificación de compatibilidad con patrones ya usados por el equipo

Antes de hacer merge, pregunta a Claude:

```
¿Este cambio es compatible con los patrones existentes en el repo?
Compara cómo maneja los errores la función getNotes() con el resto
de funciones del servicio. ¿Hay alguna inconsistencia?
```

Esta verificación de coherencia es la diferencia entre una implementación que parece correcta y una que es correcta.

## 9. Generación de checklist técnico para cerrar una nueva funcionalidad

### 🧪 Demo 3 — Checklist de cierre de feature

* **Objetivo:** generar el checklist técnico que garantiza que la feature está lista para producción.
* **Setup:** tags implementados en modelo y servicio.

**Prompt literal:**

```
[CONTEXTO]
Hemos implementado el campo tags en el modelo y en el servicio (filtrado por tag).
Falta la ruta y los tests de integración.

[FORMATO]
Genera un checklist técnico de cierre: qué tests faltan, qué validaciones
faltan, qué documentación actualizar y qué no debería llegar a producción
sin revisar primero.
```

**Qué observar:**

* El checklist es específico al estado actual de la implementación, no genérico.
* Identifica los gaps: tests de integración, validación de entrada en la ruta, docs.
* La sección "no llegar a producción sin revisar" hace explícitos los riesgos conocidos.

> Ver [Tema 15](tema-15-code-review.md) para usar este checklist como base de la revisión de PR.

### 🧩 Ejercicio 3 — Checklist y descripción de PR

> **Rama:** `git checkout tema-11/ejercicio-03` · **Tiempo:** 10 min · **Tipo:** En clase

Genera el checklist técnico de cierre del cambio (qué tests, qué validaciones, qué docs faltan) y redacta la descripción del PR resaltando scope, riesgos conocidos y puntos de revisión.

## 10. Estrategias para usar IA sin perder diseño intencional ni coherencia

Los riesgos reales de dejar que Claude tome decisiones de diseño:

* **Overengineering**: introduce abstracciones que no necesitas porque "es buena práctica".
* **Divergencia de patrones**: cada feature nueva usa el patrón que Claude prefiere, no el del equipo.
* **Pérdida de intención**: el código hace lo correcto pero por las razones equivocadas.

Las salvaguardas:

* El plan de impacto es tuyo. Claude lo ejecuta.
* Pide siempre `[EVIDENCIA]`: que explique por qué el diseño es consistente con lo existente.
* Si el diff toca algo que no esperabas, pregunta antes de aceptar.

***

## Resumen

* El orden es siempre: plan de impacto → decisión de diseño → implementación por capas → tests → checklist.
* Una capa a la vez con validación. Si falla algo, el scope está acotado.
* `[RESTRICCIONES]` en el prompt es la línea de defensa contra la sobreedición.
* El `CLAUDE.md` determina si el código generado sigue las convenciones del equipo.
* Las decisiones de arquitectura son tuyas. Claude las ejecuta, no las toma.
