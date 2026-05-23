# Tema 7 — Ejercicios: CLAUDE.md y memoria persistente

> Cada ejercicio tiene su propia rama en el repo de código.
> **Antes de empezar:** `git checkout tema-07/ejercicio-0N`, `npm install`.  
> Ninguna de las ramas tiene `CLAUDE.md` — lo escribes tú.

---

## Ejercicio 1 — Crear un CLAUDE.md desde cero

**Rama:** `tema-07/ejercicio-01` · **Tiempo:** 35 min

Primero lanzas un prompt sin `CLAUDE.md` y observas el comportamiento por defecto del agente. Luego escribes un `CLAUDE.md` con reglas concretas, reinicias la sesión y repites el mismo prompt. Compruebas que las reglas cambian el output real.

---

## Ejercicio 2 — Segmentar con .claude/rules/ y detectar reglas ambiguas

**Rama:** `tema-07/ejercicio-02` · **Tiempo:** 30 min

Partes de un `CLAUDE.md` intencionalmente desordenado (mezcla de reglas buenas y vagas). Identificas cuáles son ambiguas, las eliminas, y mueves las reglas especializadas a `.claude/rules/testing.md` y `.claude/rules/error-handling.md`. Verificas que el agente sigue las reglas segmentadas.
