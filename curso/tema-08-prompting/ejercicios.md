# Tema 8 — Ejercicios: Prompting profesional

> Cada ejercicio tiene su propia rama en el repo de código. El repo base (`tema-08/inicio`) tiene **4 defectos plantados** para practicar sobre ellos.
> **Antes de empezar:** `git checkout tema-08/ejercicio-0N`, `npm install && npm test` (7 tests verdes).

---

## Ejercicio 1 — Refactor acotado con restricciones explícitas

**Rama:** `tema-08/ejercicio-01` · **Tiempo:** 25 min

Lanzas el mismo objetivo con un prompt vago y con uno estructurado. Observas la diferencia de scope, comportamiento y confianza en el resultado. El problema: `archive` y `unarchive` en `src/services/notes.ts` tienen duplicación y if anidados.

---

## Ejercicio 2 — Diagnóstico antes de implementar

**Rama:** `tema-08/ejercicio-02` · **Tiempo:** 35 min

Un usuario reporta que la búsqueda no encuentra notas con mayúsculas ni sin acentos. Antes de pedir código, pides 3 alternativas con trade-offs. Tú decides cuál implementar. Luego un segundo prompt acotado implementa la opción elegida con tests.

---

## Ejercicio 3 — Validación en la frontera correcta

**Rama:** `tema-08/ejercicio-03` · **Tiempo:** 30 min

`POST /notes` acepta cualquier cosa. Antes de escribir el prompt, decides conscientemente dónde debe ir la validación (routes vs services) y por qué. El prompt refleja esa decisión en las restricciones.
