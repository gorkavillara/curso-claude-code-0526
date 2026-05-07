# Claude Code para Desarrolladores

Material del curso "Claude Code para Desarrolladores: Ingeniería de SW Asistida por IA" (27 temas, 2 semanas).

## Estructura

```
.                              ← raíz del repo
  curso/                       ← guiones y ejercicios (igual en TODAS las ramas)
    tema-01-fundamentos/
      guion.md
      ejercicios.md
    tema-07-prompting/
      guion.md
      ejercicios.md
      SOLUCION.md
  src/, test/, package.json…   ← código del tema actual (cambia con la rama)
```

## Modelo de ramas

- `main` — solo `curso/`. Sin código en raíz. Es la fuente de la documentación del curso.
- `tema-XX/inicio` — `curso/` + código de partida del tema XX en la raíz.
- `tema-XX/solucion` — `curso/` + código del tema XX con los ejercicios resueltos.

Para cambiar de tema en la sesión: `git checkout tema-XX/inicio`. La carpeta `curso/` no se modifica al cambiar de rama (todas las ramas comparten el mismo árbol de `curso/`).

## Convenciones

**Guiones** — tres bloques:
1. Encuadre (lo que digo).
2. Demos en vivo (lo que prompteo, literal).
3. Cierre y puente al siguiente tema.

**Ejercicios** — patrón **Enunciado → Pista → Solución de referencia**.
