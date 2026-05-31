[Documentar en faq-alumnos -> Dudas surgidas en las sesiones]

- Pregunta recurrente: diferencia entre el servidor MCP `notebox` (proceso aparte por stdio) y el HTTP del Notebox (`src/server.ts`). Insistir en que son dos servicios distintos. El MCP **podría** llamar al HTTP por dentro, pero en el ejemplo no lo hace para no requerir arrancar dos cosas.

- Pregunta recurrente: "¿Y cómo conecto el MCP de Jira de mi empresa?" — recordar que cada empresa tiene su tenant y su OAuth, y que se hace fuera de clase. Dejar enlace a los conectores oficiales que sí están publicados (GitHub, Linear, Notion).

- Pregunta recurrente: "¿Las allowlists viajan con el repo?" — `.claude/settings.json` está pensado para no commitearse (acaba en `.gitignore` típicamente). `.claude/settings.json` sí se commitea. Aclarar la diferencia en la próxima edición del tema. Revisar qué hace Notebox por defecto.

[Modificación de la documentación de temas generados en la carpeta docs]

- Confirmar nomenclatura exacta del namespace de permisos MCP. Hemos usado `mcp__<servidor>__<tool>`. Verificar contra docs oficiales actualizados antes de la sesión por si la convención cambia.

- Verificar si `claude --mcp-config <path>` permite inyectar un MCP ad-hoc sin tocar `.mcp.json`. Mencionarlo en el bloque conceptual como atajo equivalente a `--agents` del tema 19.

- En el ejercicio 3, revisar si la API de `@modelcontextprotocol/sdk` ha cambiado entre versiones. La versión publicada en el lockfile debe quedar fijada para evitar drift entre clases.

[Decisiones de diseño del tema]

- **OAuth real no se planta en el repo.** Es imposible plantar credenciales sin que sean falsas y sin guiar al alumno por un proveedor concreto. Por eso el punto 4 del docs es conceptual y la demo correspondiente se ha movido al servidor `notebox` propio que sí se puede plantar.

- **Conector remoto oficial real no se planta en el repo.** Cada empresa tiene su Jira/Linear/GitHub Enterprise. Se cubren en el punto 3 del docs como mapa, no como demo ejecutable. Si se quiere demostrar en clase, hacerlo con un repo personal en cuenta GitHub privada del instructor antes de la sesión.

- **El servidor `filesystem` apunta a `./` para no obligar al alumno a entender restricciones de scope antes del Ejercicio 1.** En la conclusión del Ejercicio 1 se introduce la idea de apuntar a `./src` como mejora.

- **`@modelcontextprotocol/sdk` se incluye como devDependency en `package.json`** para que `npm install` lo resuelva. El servidor `mcp-servers/notebox/server.js` lo requiere para arrancar. No usar globals.

- **No usar SSE en ninguna demo del tema.** Es el transporte menos extendido y meter un servidor SSE de prueba complica más de lo que enseña. Se cubre conceptualmente en el punto 2 y punto.

[Reflexión post-sesión]

- Si en la sesión real el `npx -y @modelcontextprotocol/server-filesystem` tarda demasiado (>20 s), considerar pre-instalarlo o cambiarlo por una versión cacheada. Bloquear con tiempos de espera es un mal sabor de boca para la primera demo.

- Si los alumnos se traen un MCP propio que ya usan en su trabajo, dejar tiempo al final para que lo enseñen (5 min). Es la mejor validación del aprendizaje.
