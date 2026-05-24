---
name: curso-forms
description: >
  Genera un Google Form interactivo (quiz/encuesta) a partir del contenido de un tema del curso de Claude Code.
  Extrae escenarios de decisión, preguntas conceptuales y ejercicios de configuración de los archivos docs/tema-XX-*.md
  y crea el formulario vía Google Forms API, devolviendo el link para proyectar en clase o compartir con alumnos.
  Trigger cuando el usuario pida "haz un form del tema X", "crea un quiz/formulario para el tema X",
  "genera preguntas de clase del tema X", "crea ejercicios interactivos del tema X", o equivalente.
allowed-tools: Bash, Read
---

# Skill: curso-forms

Genera un Google Form con 6–10 preguntas interactivas a partir del contenido de un tema del curso.
Ideal para sesiones en vivo: proyectas el link / QR, los alumnos responden desde el móvil y ves resultados en tiempo real.

---

## Setup (solo primera vez)

1. Habilitar **Google Forms API** en Google Cloud Console → APIs & Services → Enable APIs.
2. El script reutiliza automáticamente `credentials.json` del gmail-skill.
3. Primera ejecución abre el navegador para autorizar el nuevo scope.
4. Instalar dependencias si faltan:
   ```bash
   pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
   ```

---

## Inputs

- **Número o nombre del tema** (ej.: "tema 5", "tema-05-permisos-sandboxing"). Si no se especifica, pregunta.
- (Opcional) Instrucciones específicas: "pon más preguntas sobre el modo plan", "añade una pregunta de configuración JSON".

## Fuentes obligatorias antes de generar preguntas

1. `docs/tema-XX-<slug>.md` → contenido del tema: secciones, tablas, demos, reglas.
2. `docs/SUMMARY.md` → confirmar el filename exacto del tema.
3. (Opcional) `anexo.md` → título y puntos canónicos del tema.

---

## Workflow

1. **Leer** el archivo `.md` del tema solicitado.
2. **Extraer** 6–10 preguntas siguiendo las reglas de extracción (ver abajo).
3. **Mostrar** el listado de preguntas al usuario y pedir confirmación:
   > "Aquí están las X preguntas que voy a crear en el formulario. ¿Confirmas o quieres ajustar algo?"
4. Una vez confirmado, **construir** el JSON de preguntas y llamar al script:
   ```bash
   python .claude/skills/curso-forms/scripts/forms_skill.py create --json '<JSON>'
   ```
5. **Reportar** al usuario: título del form, número de preguntas, `viewUrl` (para compartir con alumnos) y `editUrl` (para editar).

---

## Reglas de extracción de preguntas

### Por tipo de contenido

| Fuente en el .md | Tipo de pregunta | Formato Google Forms |
|---|---|---|
| Sección demo / escenario | "¿Qué harías en esta situación?" | `RADIO` — 4 opciones |
| Tabla comparativa (modos, listas) | "¿Cuál de estas afirmaciones es correcta?" | `RADIO` — 4 opciones |
| Tabla de recomendaciones por categoría | "Asigna la regla correcta" | `RADIO` — allow / deny / ask |
| Reglas en blockquote (`>`) | "¿Verdadero o falso?" o "¿Cuál es la regla?" | `RADIO` — 2–4 opciones |
| Bloque JSON de configuración | "¿Qué lista usarías para este comando?" | `RADIO` |
| Concepto clave de sección | Pregunta de comprensión directa | `RADIO` — 4 opciones |
| Reflexión abierta ("¿Cuándo usar X?") | Pregunta de texto libre | `TEXT` |

### Distribución recomendada (para 8 preguntas)

- 3 preguntas de escenario (extraídas de demos)
- 3 preguntas conceptuales (de tablas o secciones)
- 1 pregunta de configuración (bloque JSON / permisos concretos)
- 1 pregunta de texto libre ("¿En qué situación de tu trabajo usarías el modo plan?")

### Reglas de calidad

- Cada pregunta debe ser **autocontenida** (no asumir que el alumno tiene el doc delante).
- Las opciones incorrectas deben ser **plausibles**, no obviamente erróneas.
- Máximo 4 opciones por pregunta RADIO.
- No preguntar por detalles de implementación que no se vieron en el tema.
- Para preguntas RADIO con respuesta correcta: incluir `"correct"` en el JSON (se usará si se activa el modo quiz).

---

## Formato JSON para el script

```json
{
  "title": "Quiz — Tema 5: Modos, permisos y sandboxing",
  "description": "Comprueba lo que has aprendido sobre modos de trabajo y políticas de permisos en Claude Code.",
  "questions": [
    {
      "title": "Estás en un repo de prototipo haciendo renombrados masivos. ¿Qué modo elegirías?",
      "type": "radio",
      "options": [
        "default — confirmo cada edición",
        "acceptEdits — edita sin pedir, confirma comandos",
        "plan — primero el plan completo",
        "auto — sin confirmaciones"
      ],
      "correct": "acceptEdits — edita sin pedir, confirma comandos"
    },
    {
      "title": "¿En qué lista de permisos pondrías `Bash(npm test)`?",
      "type": "radio",
      "options": ["allow", "deny", "ask", "Ninguna, no hace falta configurarlo"],
      "correct": "allow"
    },
    {
      "title": "¿Qué tipo de operaciones deberían estar siempre en la lista `deny`?",
      "type": "radio",
      "options": [
        "Tests y typechecks",
        "Lectura de .env y comandos rm -rf",
        "Comandos de formato (prettier, eslint)",
        "Comandos de build"
      ],
      "correct": "Lectura de .env y comandos rm -rf"
    },
    {
      "title": "¿En qué situación real de tu trabajo usarías el modo `plan`?",
      "type": "text"
    }
  ]
}
```

---

## Comandos del script

```bash
# Crear formulario completo desde JSON inline
python .claude/skills/curso-forms/scripts/forms_skill.py create --json '{"title":"...","questions":[...]}'

# Crear formulario desde archivo JSON
python .claude/skills/curso-forms/scripts/forms_skill.py create --file questions.json

# Listar formularios existentes (últimos 10)
python .claude/skills/curso-forms/scripts/forms_skill.py list

# Ver detalles de un formulario
python .claude/skills/curso-forms/scripts/forms_skill.py get FORM_ID

# Eliminar un formulario
python .claude/skills/curso-forms/scripts/forms_skill.py delete FORM_ID

# Login / logout
python .claude/skills/curso-forms/scripts/forms_skill.py login [--account EMAIL]
python .claude/skills/curso-forms/scripts/forms_skill.py logout
```

---

## Output esperado

Después de crear el formulario, reportar al usuario:

```
✅ Formulario creado: "Quiz — Tema 5: Modos, permisos y sandboxing"
   Preguntas: 8
   Ver/responder: https://forms.gle/xxxx   ← proyectar en clase / compartir QR
   Editar:       https://docs.google.com/forms/d/FORM_ID/edit

💡 Para ver respuestas en tiempo real durante la clase:
   Formulario → pestaña "Respuestas" → ícono de gráfico
```

---

## Antipatrones

- ❌ Crear el formulario sin mostrar primero las preguntas al usuario.
- ❌ Preguntar por detalles técnicos que no aparecen en el tema (ej.: parámetros internos de la API).
- ❌ Más de 4 opciones por pregunta radio (difícil de leer en móvil).
- ❌ Preguntas ambiguas con dos respuestas "correctas".
- ❌ Olvidar incluir al menos una pregunta de texto libre.
- ❌ Llamar al script con JSON mal formado (validar la estructura antes de llamar).
