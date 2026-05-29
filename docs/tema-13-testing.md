# Tema 13 — Testing asistido por IA con cobertura útil

> **Duración estimada:** \~60 min **Tipo:** práctico — alumnos delante del teclado

## Objetivo del tema

Diseñar tests que verifican comportamiento real, no cobertura cosmética. Usar Claude Code para acelerar el qué cubrir y el cómo, pero conservando el criterio de qué merece la pena testear.

***

## 1. Diseño de estrategia de pruebas antes de escribir tests automáticos

Antes del primer `test()`, contesta:

* ¿Qué **comportamientos críticos** existen en esta capa?
* ¿Qué **bugs reales** ya hemos sufrido aquí?
* ¿Qué **caminos no-felices** tiene esta función?

Estrategia mínima por capa:

| Capa     | Qué se testea                         | Qué no                                   |
| -------- | ------------------------------------- | ---------------------------------------- |
| Modelo   | Validaciones e invariantes            | Estructura de campos sin lógica          |
| Servicio | Lógica de negocio, errores semánticos | Detalles del storage                     |
| Ruta     | Validación de entrada, códigos HTTP   | Lógica del servicio (ya testeada arriba) |
| Storage  | Persistencia y recuperación           | Las queries que no usas                  |

> Cobertura del 90% no significa nada si los tests verifican el resultado en vez del comportamiento.

### 🧪 Demo 1 — Estrategia de tests antes de codear

* **Objetivo:** generar la estrategia de tests para una feature **antes** de escribir tests.
* **Setup:** `git checkout tema-13/inicio`, `npm test` verde.

**Prompt literal:**

```
[CONTEXTO]
Vamos a añadir un endpoint POST /notes/:id/tags que añade tags a una nota
existente. Las capas afectadas son routes, services y models.

[OBJETIVO]
Diseña la estrategia de tests **antes** de implementar nada. Para cada capa:
- Qué comportamientos testar.
- Qué casos borde cubrir.
- Qué no testar aquí (porque ya está cubierto en otra capa).

[FORMATO]
Tabla con columnas: capa, comportamiento, caso borde, qué no testar.
Sin código de tests todavía.
```

**Qué observar:**

* Claude separa qué se testea en cada capa.
* Identifica casos borde reales (tag vacío, duplicado, nota inexistente).
* La columna "qué no testar" evita el solapamiento de tests redundantes.

### 🧩 Ejercicio 1 — Estrategia antes de tests

> **Rama:** `git checkout tema-13/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Diseña la estrategia de tests para `DELETE /notes/:id` antes de escribir ninguno. Entrega una tabla por capa con comportamientos, casos borde y qué no testar (porque otra capa ya lo cubre).

## 2. Generación de unit tests con foco en lógica crítica y no en puro coverage vacío

Un test es útil si:

* Falla cuando **rompes el comportamiento que dice testear**.
* No falla cuando **cambias la implementación** preservando el comportamiento.

Si los tests fallan en cada refactor inocuo, son frágiles. Si no fallan cuando rompes algo, son ornamentales.

> Tests que verifican estructura interna (líneas, llamadas a mocks irrelevantes) son lastre. Apunta al comportamiento observable.

## 3. Construcción de tests de integración alineados con flujos reales

Patrón: **un flujo real de usuario, una request HTTP, una verificación al final**.

```ts
test('POST /notes seguido de GET /notes devuelve la nota creada', async () => {
  const created = await request(app).post('/notes').send({ title: 't', body: 'b' });
  const list = await request(app).get('/notes');
  assert.equal(list.body.find(n => n.id === created.body.id).title, 't');
});
```

Tres reglas para tests de integración:

* **Sin mocks** del storage si es in-memory. Si tu storage es DB, usa una DB de test real, no mocks.
* **Verifica el efecto observable**, no los intermedios.
* **Un escenario, un test.** Si el test cubre 3 cosas, es 3 tests disfrazados.

## 4. Identificación de casos borde, inputs maliciosos y rutas de error

Tres categorías que **siempre** hay que cubrir:

| Categoría                 | Ejemplos para Notebox                                      |
| ------------------------- | ---------------------------------------------------------- |
| **Casos borde naturales** | Array vacío, string vacío, número límite                   |
| **Inputs maliciosos**     | XSS en `body`, payloads enormes, caracteres unicode raros  |
| **Rutas de error**        | Recurso inexistente, formato inválido, conflicto de estado |

> Si tu test suite no rompe ante inputs maliciosos, alguien lo descubrirá en producción.

### 🧪 Demo 2 — Convertir un bug en test de regresión

* **Objetivo:** ante un bug reportado, escribir primero el test que lo reproduce y luego arreglarlo.
* **Setup:** misma rama. Bug conocido: la búsqueda no encuentra "MAÑANA" cuando el título es "Mañana".

**Prompt literal:**

```
[CONTEXTO]
Bug: searchNotes("MAÑANA") devuelve [] aunque existe una nota con title "Mañana".
El test test/notes.search.test.ts no lo cubre.

[OBJETIVO]
1. Escribe primero el test que reproduce el bug (debe fallar al lanzarlo).
2. Después propón el fix mínimo.
3. Verifica que el test ahora pasa.

[RESTRICCIONES]
- El test va en test/notes.search.test.ts.
- El fix solo toca src/search/index.ts.
- Mantén verde el resto del suite.
```

**Qué observar:**

* El test fallaría **antes** del fix (rojo → verde).
* El fix es mínimo: solo lo que reproduce el bug.
* El nombre del test describe el comportamiento, no la implementación.

### 🧩 Ejercicio 2 — Bug → test de regresión

> **Rama:** `git checkout tema-13/ejercicio-02` · **Tiempo:** 15 min · **Tipo:** En clase

Recibe un bug documentado en el `EJERCICIO.md`. Escribe primero el test que lo reproduce (debe fallar), después aplica el fix mínimo. Verifica que el test pasa y el resto del suite sigue verde.

## 5. Uso de mocks, fakes y fixtures mantenibles

| Herramienta | Cuándo                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------- |
| **Mock**    | Aislar una dependencia externa lenta o no determinista (red, reloj). Tests unitarios solo.      |
| **Fake**    | Sustituir un componente con uno funcional pero simplificado (memory store en lugar de DB real). |
| **Fixture** | Estado inicial reusable entre tests (notas precargadas, usuarios de prueba).                    |

Antipatrones:

* **Mockear lo que estás testeando.** Si mockeas la función que testeas, no testeas nada.
* **Fixtures de 500 líneas.** Si la fixture es más larga que el test, refactoriza.
* **Mocks que conocen la implementación.** Un mock que verifica "se llamó a `save()` 3 veces con estos argumentos" rompe en cada refactor inocuo.

## 6. Refuerzo de suites de regresión tras bugs y hotfixes

Cada bug que llega a producción es una pregunta:

> "¿Qué test hubiera evitado esto?"

Reglas:

1. **Antes del fix, el test.** Si arreglas sin testear, el bug puede volver.
2. **El test va donde está el bug.** Si el bug es del servicio, el test es de servicio. No del endpoint.
3. **Etiqueta los tests de regresión** (p. ej. `test('regresión #123: ...')`). Te dice por qué existen.

## 7. Validación de resultados de test generados por Claude Code

Los tests generados por IA pueden mentir de cuatro formas:

| Mentira                                                   | Cómo detectarla                                              |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| Test que pasa siempre (no testea nada)                    | Cámbialo a `assert.equal(1, 2)`: si pasa, el assert es vacío |
| Test que verifica la implementación, no el comportamiento | Refactoriza inocuamente; si rompe, era frágil                |
| Test con datos de fixture irreales                        | Compara con tus inputs reales                                |
| Test que cubre el camino feliz solo                       | Pregunta a Claude por casos borde explícitamente             |

> Nunca aceptes un test generado sin lanzarlo. "Pasa" no es suficiente: hay que ver si **falla cuando debería**.

## 8. Integración del testing en flujos locales y CI/CD

Pirámide local → CI:

| Nivel          | Cuándo               | Qué cubre                                          |
| -------------- | -------------------- | -------------------------------------------------- |
| **Pre-commit** | Antes de cada commit | Lint + typecheck + tests rápidos del módulo tocado |
| **Pre-push**   | Antes de push        | Suite completa local                               |
| **CI on PR**   | Cada PR              | Todo lo anterior + integración + e2e mínimos       |
| **CI on main** | Tras merge           | Pirámide completa + benchmark + smoke              |

Profundizamos en CI/CD en el [Tema 24](tema-24-devops-cicd.md).

## 9. Detección de pruebas frágiles, redundantes o poco informativas

Señales de tests para borrar:

* **Frágil:** rompe cuando refactorizas sin cambiar comportamiento.
* **Redundante:** dos tests verifican el mismo caso con distinta sintaxis.
* **Tautológico:** test que pasa siempre por construcción (`assert.ok(true)`).
* **Acoplado:** test que solo pasa si los otros tests se ejecutan en cierto orden.

### 🧪 Demo 3 — Detectar tests frágiles y limpiar la suite

* **Objetivo:** identificar 3 tests problemáticos y proponer qué hacer con cada uno.
* **Setup:** misma rama. Suite con tests heredados.

**Prompt literal:**

```
Revisa test/ del proyecto. Identifica los 3 tests más problemáticos
por una de estas razones: frágiles (rompen en refactors inocuos),
redundantes (cubren lo mismo que otro), tautológicos (no verifican
nada) o acoplados (dependen del orden de ejecución).

Por cada uno: archivo y nombre del test, problema concreto,
qué hacer con él (borrar, reescribir, fusionar).
```

**Qué observar:**

* Cada diagnóstico cita el test concreto.
* La acción propuesta no es siempre "borrar": a veces es reescribir.
* Claude justifica con criterio de comportamiento, no de estilo.

### 🧩 Ejercicio 3 — Limpiar tests problemáticos

> **Rama:** `git checkout tema-13/ejercicio-03` · **Tiempo:** 15 min · **Tipo:** En clase

Revisa la suite del repo y entrega una tabla con 3 tests problemáticos: archivo+nombre, tipo de problema (frágil / redundante / tautológico / acoplado) y acción propuesta. Aplica al menos una de las acciones y verifica que la suite sigue verde.

## 10. Estrategias para convertir Claude Code en copiloto de calidad y no solo de velocidad

Usa Claude para:

* **Diseñar la estrategia** de tests (lo que se testea, no el código).
* **Generar casos borde** que se te escapan.
* **Refactorizar tests frágiles** sin perder cobertura.
* **Convertir bugs en regresión** automatizable.

No uses Claude para:

* **Subir el porcentaje de coverage** con tests cosméticos.
* **Mockear todo** para que pasen rápido.
* **Generar tests sin revisarlos** asumiendo que son útiles.

> Cobertura sin criterio = ruido con color verde.

***

## Resumen

* Diseña la estrategia antes del primer test. Qué se testea por capa, qué no.
* Tests útiles fallan al romper comportamiento, no al refactorizar inocuamente.
* Cada bug en producción ⇒ un test de regresión antes del fix.
* Tests generados por IA: lánzalos invertidos para verificar que fallan cuando deben.
* Cobertura del 90% sin criterio vale menos que el 60% con tests que cazan bugs reales.
