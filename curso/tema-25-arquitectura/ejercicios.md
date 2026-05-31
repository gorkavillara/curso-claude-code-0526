# Ejercicios — Tema 25

| Ejercicio | Rama | Tiempo | Tipo | Descripción breve |
|---|---|---|---|---|
| Ejercicio 1 | `tema-25/ejercicio-01` | 30 min | En clase | Explora 3 alternativas de persistencia para sustituir `storage/memory.ts` con trade-offs en ejes acordados. Entrega `OPCIONES-PERSISTENCIA.md` con tabla, recomendación razonada (con lo que se pierde), alternativa descartada y "qué información me falta para decidir". |
| Ejercicio 2 | `tema-25/ejercicio-02` | 30 min | En clase | Redacta `docs/architecture/ADR-003-validacion-de-input.md` siguiendo el formato exacto de los ADR-001 y ADR-002 plantados. Decisión en presente imperativo, Consecuencias con qué se gana, qué se pierde y qué queda por verificar. Actualiza el `README.md` del índice de ADRs. |
| Ejercicio 3 | `tema-25/ejercicio-03` | 30 min | En clase | Audita la deuda arquitectónica real del repo (anidamiento, search case-sensitive, validación inconsistente, acoplamiento de storage). Entrega `DEUDA-ARQUITECTONICA.md` con tabla priorizada, conexión con la feature de paginación, plan incremental para los 3 más rentables y "qué dejo sin tocar y por qué". |

## Fixtures plantados en `tema-25/inicio`

- `docs/architecture/README.md` — índice de ADRs vigentes.
- `docs/architecture/ADR-001-storage-en-memoria.md` — decisión ya aceptada, modelo de formato.
- `docs/architecture/ADR-002-express-framework.md` — decisión ya aceptada, modelo de formato.
- `docs/architecture/PENDING-001-persistencia.md` — decisión pendiente: contexto + ejes + restricciones.
- `docs/architecture/PENDING-002-validacion-en-routes-o-services.md` — decisión pendiente.
- `docs/architecture/DEUDA-CONOCIDA.md` — lista de olores observados + próxima feature planificada (paginación).
- `test/architecture-fixtures.test.ts` — smoke test que valida que los archivos existen y tienen forma esperada.
- Deuda arquitectónica real en `src/`:
  - `src/services/notes.ts` — anidamiento profundo (5 niveles) en `archive`/`unarchive`.
  - `src/search/index.ts` — búsqueda `case-sensitive` por `String.includes()`.
  - `src/routes/notes.ts` — validación inconsistente entre POST `/notes` y `archive`/`unarchive`.
  - Acoplamiento: `src/services/notes.ts` importa directo de `storage/memory.ts`, no por interfaz.
