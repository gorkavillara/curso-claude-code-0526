# Tema 11 — Generación de nuevas funcionalidades con control de impacto, alineación arquitectónica y calidad de implementación

> Duración estimada: 90 min · Tipo: práctico (alumnos delante del teclado).
> Repositorio de prácticas: rama `tema-11/inicio` (notebox, Node 24 + Express + TypeScript).

## 0. Objetivo del tema

Que el alumno implemente una nueva funcionalidad completa siguiendo el orden correcto: plan de impacto → implementación por capas → checklist de cierre. Si el agente empieza a implementar antes de que tú hayas tomado las decisiones de diseño, vas mal.

---

## 1. Flujo de sesión

Estructura **batch**: primero las tres demos (el ciclo completo), después los ejercicios donde los alumnos aplican cada fase. Necesitan ver el ciclo entero antes de practicarlo.

```
00:00 — Encuadre                                (10 min)
00:10 — Demo 1: plan de impacto antes del código (10 min)
00:20 — Demo 2: implementar por capas            (12 min)
00:32 — Demo 3: checklist de cierre              (8 min)
00:40 — Ejercicio 1: plan de impacto PATCH       (15 min, en clase)
00:55 — Ejercicio 2: implementar PATCH           (20 min, en clase)
75:00 — Ejercicio 3: checklist y descripción PR  (10 min, en clase)
85:00 — Cierre y puente                          (5 min)
```

> **Si vas justo de tiempo:** recorta la Demo 3 a 5 minutos (muestra el output sin ejecutarlo en directo) y reduce el ejercicio 3 a 5 minutos (solo el checklist, sin la descripción del PR).

---

## 2. Encuadre — lo que digo (≈ 10 min)

> "Cuántas veces habéis pedido 'implementa esta feature' y Claude ha tocado el doble de archivos de lo necesario. No es culpa del modelo. Es culpa del prompt. Pedisteis implementar sin decirle el scope, sin decirle las restricciones, sin decirle el diseño. Él tomó esas decisiones por vosotros."

Tres ideas en pizarra:

1. **Plan de impacto primero.** Antes del primer cambio: qué capas toca, qué archivos, qué tests. Esta lista la haces tú, Claude la genera — pero tú la validas.
2. **Implementar por capas.** Modelo → storage → servicio → ruta. Una capa a la vez, tests verdes antes de pasar a la siguiente.
3. **Checklist de cierre.** La feature no está terminada hasta que pasó el checklist. Claude lo genera; tú lo firmas.

```
Plan de impacto
  → Decisión de diseño (tuya)
  → Capa 1: modelo (diff + npm test)
  → Capa 2: servicio (diff + npm test)
  → Capa 3: ruta (diff + npm test)
  → Checklist de cierre
  → PR
```

---

## 3. Demos en vivo — el ciclo completo (≈ 30 min)

> Antes de empezar: `git checkout tema-11/inicio`, `npm install`, `npm test` verde.

### Demo 1 — Plan de impacto antes del código (≈ 10 min)

**Tarea**: añadir etiquetas (tags) a las notas.

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

Lo que el alumno ve: Claude identifica las 4 capas (modelo, storage, servicio, ruta), lista archivos concretos, propone tests y señala el riesgo de retrocompatibilidad del storage.

> "Fijaos: Claude ha hecho el plan. Pero yo tengo que decidir si ese diseño es el correcto antes de implementar. Si le digo 'adelante' sin validarlo, él toma las decisiones por mí."

### Demo 2 — Implementar por capas (≈ 12 min)

Tras validar el plan, implementa capa a capa:

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

Lo que el alumno ve: diff acotado a un archivo, tests verdes.

**Capa 2 — servicio:**

```
[OBJETIVO]
Añade soporte para filtrar notas por tag en getNotes(). Si se pasa `tag`,
devuelve solo las notas que contienen ese tag.

[RESTRICCIONES]
- Solo toca src/services/notes.ts.
- La firma acepta parámetro opcional `{ tag?: string }`.
- Añade el test correspondiente.

[FORMATO]
Diff + npm test.
```

Lo que el alumno ve: capa 2 limpia, tests de la nueva lógica, suite verde.

> "Cada diff es revisable en 2 minutos. Si algo falla, el scope del problema está acotado a esa capa. Eso es lo que queremos."

### Demo 3 — Checklist de cierre (≈ 8 min)

Con el modelo y el servicio implementados:

```
[CONTEXTO]
Hemos implementado el campo tags en el modelo y en el servicio (filtrado por tag).
Falta la ruta y los tests de integración.

[FORMATO]
Genera un checklist técnico de cierre: qué tests faltan, qué validaciones
faltan, qué documentación actualizar y qué no debería llegar a producción
sin revisar primero.
```

Lo que el alumno ve: checklist específico al estado actual de la implementación — no genérico. Identifica la ruta pendiente, los tests de integración, la validación de entrada y la actualización del README.

> "El checklist no lo genero al principio. Lo genero cuando ya sé qué he hecho y qué me falta. En ese momento, Claude puede leer el estado real del repo."

---

## 4. Ejercicios en clase (≈ 45 min)

### Ejercicio 1 — Plan de impacto para PATCH /notes/:id (15 min)

> **Rama:** `git checkout tema-11/ejercicio-01`

Los alumnos generan el plan de impacto para implementar `PATCH /notes/:id` (actualización parcial: puede venir `title`, `body` o ambos, pero nunca más de eso). Deben entregar:

- Lista de archivos afectados por capa.
- Cambios necesarios en cada archivo.
- Tests que habrá que crear.
- Al menos 2 riesgos de la implementación.

Documentan el plan en el EJERCICIO.md. No hay código todavía.

**Lo que el formador observa:**
- ¿El plan distingue correctamente las capas (modelo, servicio, ruta)?
- ¿Identificaron el riesgo de sobrescribir campos no enviados (el PATCH debe ser parcial)?
- ¿El plan incluye tests de validación (¿qué pasa si viene un campo desconocido)?

### Ejercicio 2 — Implementar PATCH en 3 capas (20 min)

> **Rama:** `git checkout tema-11/ejercicio-02`

Usando el plan del ejercicio anterior, los alumnos implementan `PATCH /notes/:id` capa a capa:
1. Servicio: método `updateNote(id, { title?, body? })` con tests.
2. Ruta: `PATCH /notes/:id` con validación de entrada (solo `title` y `body` aceptados, al menos uno presente).
3. Verifican `npm test` verde en cada capa antes de pasar a la siguiente.

**Lo que el formador observa:**
- ¿Implementaron capa a capa o pidieron todo de golpe?
- ¿La validación de la ruta rechaza campos desconocidos o solo verifica los conocidos?
- ¿Los tests cubren el caso de PATCH parcial (solo `title`, solo `body`, ambos)?

### Ejercicio 3 — Checklist y descripción de PR (10 min)

> **Rama:** `git checkout tema-11/ejercicio-03`

Los alumnos usan Claude para:
1. Generar el checklist de cierre del PATCH endpoint (qué falta, qué revisar antes del merge).
2. Redactar la descripción del PR: qué hace el cambio, por qué, qué se probó, qué riesgos quedan.

Documentan ambos en el EJERCICIO.md.

**Lo que el formador observa:**
- ¿El checklist es específico al estado de la implementación o genérico?
- ¿La descripción del PR menciona las decisiones de diseño tomadas (dónde va la validación, por qué es parcial)?
- Contrastar una descripción de PR sin usar Claude y una con Claude: ¿qué añade?

---

## 5. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Plan de impacto antes del código. Tú validas el diseño antes de implementar.**
2. **Una capa a la vez. Tests verdes antes de pasar a la siguiente.**
3. **`[RESTRICCIONES]` en el prompt limita el scope. Sin ellas, Claude decide.**
4. **El checklist de cierre es el contrato entre tú y el reviewer.**

**Puente al Tema 12:**

> "Sabéis implementar features nuevas con control. En el siguiente tema el desafío es diferente: refactorizar código heredado sin romper lo que ya funciona. Ahí la estrategia de 'una capa a la vez' se vuelve imprescindible."

---

## 6. Notas para el formador

- Si alguien pide la implementación completa de golpe y funciona → usarlo como contraejemplo. El tema no es que no pueda funcionar, es que el diff es imposible de revisar y las decisiones de diseño desaparecen.
- Pregunta trampa: *"¿Por qué no usar un ORM o una base de datos real?"* → Fuera de scope del tema. El punto es el proceso, no el stack.
- El riesgo más común en el ejercicio 2: alumnos que no validan las capas una a una porque "van rápido". Recordarles que el objetivo del ejercicio es el proceso, no terminar antes.
- Si el tiempo del ejercicio 2 es insuficiente para las 3 capas: reducir a capa 1 (servicio) + capa 2 (ruta), sin capa de modelo (que es trivial).
- Pregunta valiosa del ejercicio 3: *"¿Qué diferencia hay entre el checklist que genera Claude y una plantilla de PR?"* → La plantilla es genérica; el checklist de Claude es específico al estado actual de la implementación. Claude puede leer qué hay y qué falta.
