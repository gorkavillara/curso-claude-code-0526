##### Claude Code para Desarrolladores: Ingeniería de SW Asistida por IA

## 1

##### FUNDAMENTOS DE CLAUDE CODE COMO SISTEMA
##### AGENTIC DE INGENIERÍA DE SOFTWARE SOBRE
##### REPOSITORIOS REALES

```
Qué es Claude Code y qué diferencia aporta frente a asistentes de
autocompletado tradicionales
Lectura contextual del repositorio y comprensión de varias capas del proyecto
Edición multiarchivo y ejecución de comandos dentro del flujo de desarrollo
Casos de uso donde Claude Code aporta más valor en equipos de software
Tareas donde sigue siendo mejor una intervención manual directa del
desarrollador
Riesgos de usar IA sin contexto, sin criterio o sin validación
Papel del desarrollador como responsable final de decisiones técnicas
Ventajas y límites de un sistema agentic sobre código vivo
Diferencia entre usar Claude para chatear y usar Claude Code para construir
Base metodológica del curso y nivel de exigencia técnica esperado
```

## 2

##### INTERFACES OFICIALES DE CLAUDE CODE Y CRITERIOS
##### PARA ELEGIR TERMINAL, WEB, ESCRITORIO O IDE
##### SEGÚN EL TIPO DE TAREA

```
Trabajo desde terminal CLI para flujos profundos sobre repositorio y comandos
Uso de la interfaz web para continuidad y acceso rápido en contextos ligeros
Ventajas de la aplicación de escritorio en entornos de trabajo prolongado
Integración con VS Code para desarrollo asistido sin salir del editor
Integración con IDEs de JetBrains y flujos típicos de equipos que usan esa
familia
Uso en Slack para consultas y coordinación de equipo alrededor del código
```
```
Presencia en CI/CD mediante GitHub Actions y GitLab para automatización
asistida
Ventajas comparativas de cada interfaz según debugging, refactorización o
revisión
Decisiones de uso por tipo de proyecto, tamaño de repositorio y contexto
operativo
Estrategia de adopción combinada entre interfaces dentro de un mismo equipo
```

## 3

##### PREPARACIÓN DEL ENTORNO TÉCNICO PARA TRABAJAR
##### CON CLAUDE CODE DE FORMA ESTABLE, SEGURA Y
##### REPRODUCIBLE

```
Instalación ordenada del entorno de desarrollo y terminal asociada
Preparación del sistema para múltiples repositorios y monorepos
Variables de entorno, autenticación y validación de acceso al servicio
Organización local de repositorios y carpetas de trabajo auxiliares
Preparación del editor para diffs, linting y navegación rápida
Configuración inicial de Git, ramas y reglas de trabajo antes de invocar la IA
Verificación de permisos mínimos para editar, ejecutar y validar cambios
Integración con Docker, runtimes y utilidades habituales del equipo
Checklist de salud técnica del entorno antes de sesiones intensivas con Claude
Code
Errores de arranque más frecuentes y cómo evitarlos
```
## 4

##### CONFIGURACIÓN COMPLETA MEDIANTE SETTINGS,
##### SCOPES, VARIABLES Y POLÍTICAS COMPARTIDAS DE
##### PROYECTO

```
Estructura jerárquica de configuración en ámbito managed, user, project y local
Uso de `~/.claude/settings.json` para preferencias generales del desarrollador
Uso de `.claude/settings.json` para reglas compartidas por el equipo
Diferencia entre configuración local personal y configuración versionada del
repositorio
Gestión de `~/.claude.json` y su papel en estado, sesiones y MCP locales
Ajuste de modelo, idioma, permisos, sandbox y directorios adicionales
Configuración de `defaultMode` y su impacto en el comportamiento diario
Restricción de accesos a ficheros sensibles mediante reglas de denegación
Uso de variables de entorno y helpers de autenticación cuando aplican
Verificación de configuración activa y resolución de conflictos entre scopes.
```

## 5

##### MODOS DE TRABAJO, PERMISOS, SANDBOXING Y
##### CONTROL DE RIESGO PARA EJECUTAR IA SOBRE CÓDIGO
##### CON SEGURIDAD

```
Diferencia entre modos por defecto, accept edits, plan, auto y otros modos
disponibles
Cuándo conviene trabajar en modo planificador y cuándo en modo más ejecutor
Gestión de confirmaciones antes de editar archivos o lanzar comandos
Uso de `/permissions` para permitir o restringir acciones concretas
Configuración de políticas corporativas que impiden modos inseguros
Reglas prácticas para comandos peligrosos, lectura de secretos y acceso a red
Sandboxing y aislamiento parcial del entorno para reducir superficie de riesgo
Diseño de una política de permisos razonable para equipos empresariales
Balance entre velocidad de uso y control del daño potencial
Buenas prácticas para operar Claude Code en repositorios sensibles.
```
## 6

##### INTEGRACIÓN REAL CON IDES, FLUJO DE EDICIÓN,
##### NAVEGACIÓN Y REVISIÓN DENTRO DE VISUAL STUDIO
##### CODE Y JETBRAINS

```
Instalación y uso de la extensión nativa de VS Code
Auto-instalación de integración cuando se lanza desde terminal compatible
Flujo de trabajo entre chat, diff, edición y ejecución de pruebas
Uso de drag and drop de archivos y carpetas en chats de IDE cuando aplica
Revisión de cambios grandes desde el editor con apoyo de Claude Code
Navegación contextual entre símbolos, archivos y zonas candidatas de
cambio
Integración con debugging y feedback visual del IDE
Particularidades del trabajo desde JetBrains frente a VS Code
Decisiones de productividad según tamaño y tipo de repositorio
Buenas prácticas para que la integración IDE no sustituya el criterio técnico.
```
## 7

##### CONTEXTO PERSISTENTE CON CLAUDE.MD, REGLAS DE
##### PROYECTO Y AUTO MEMORY PARA QUE LA IA APRENDA
##### SIN IMPROVISAR

```
Diferencia entre instrucciones persistentes y conversación puntual
Uso de `CLAUDE.md` para arquitectura, normas de código y workflows del
proyecto
Ubicaciones posibles de `CLAUDE.md` y precedencia entre ámbitos
Organización de reglas por proyecto, por tipo de archivo o por alcance del
equipo
Uso de `.claude/rules/` para segmentar instrucciones especializadas
Funcionamiento de auto memory y qué tipo de aprendizajes conviene permitir
Cómo corregir a Claude para que acumule patrones útiles y no ruido
Límites de memoria y riesgos de instrucciones demasiado ambiguas
Mantenimiento del contexto como activo vivo del repositorio
Estrategias para convertir CLAUDE.md en estándar interno de ingeniería.
```

## 8

##### PROMPTING PROFESIONAL PARA DESARROLLO DE
##### SOFTWARE Y DISEÑO DE CONVERSACIONES DE ALTA
##### PRECISIÓN TÉCNICA

```
Estructura de prompts eficaces para tareas de análisis, edición y validación
Uso de contexto explícito sobre arquitectura, objetivo y restricciones del cambio
Prompts para generar código nuevo sin romper estándares existentes
Prompts para pedir análisis comparativos, alternativas y trade-offs
Prompts para refactorización, debugging, testing y documentación
Técnicas para pedir cambios mínimos y evitar reescrituras innecesarias
Cómo obtener respuestas estructuradas, listados de riesgos y planes de acción
Diseño de prompts que obligan a razonar con evidencia del repositorio
Estrategias para iterar sobre una respuesta hasta volverla desplegable
Antipatrones de prompting que producen ruido, sobreedición o falsas certezas
```
## 9

##### EXPLORACIÓN DE REPOSITORIOS DESCONOCIDOS,
##### COMPRENSIÓN DE ARQUITECTURA Y ONBOARDING
##### ACELERADO CON CLAUDE CODE

```
Navegación guiada por carpetas, módulos y relaciones internas del proyecto
Petición de mapas conceptuales de arquitectura y capas del sistema
Identificación rápida de entry points, servicios, handlers y dependencias clave
Análisis de convenciones internas y patrones predominantes del repositorio
Detección de deuda técnica y zonas especialmente frágiles del código
Localización de puntos de extensión para nuevas funcionalidades
Resumen de contextos funcionales y técnicos para onboarding de nuevos
perfiles
Comparación entre servicios o módulos con responsabilidades similares
Generación de guías de lectura del repositorio para el equipo
Preparación de sesiones de trabajo profundas sobre sistemas heredados
```

## 10

##### GENERACIÓN DE NUEVAS FUNCIONALIDADES CON
##### CONTROL DE IMPACTO, ALINEACIÓN ARQUITECTÓNICA Y
##### CALIDAD DE IMPLEMENTACIÓN

```
Diseño incremental de funcionalidades antes de escribir el primer cambio
Identificación de capas afectadas por una nueva necesidad de negocio
Generación de código alineado con convenciones existentes del proyecto
Implementación guiada de endpoints, servicios, validaciones y persistencia
Creación de componentes frontend y lógica de interfaz con contexto real
Petición de cambios acotados para reducir riesgo en producción
Incorporación de feature flags, toggles o configuraciones de despliegue
Verificación de compatibilidad con patrones ya usados por el equipo
Generación de checklist técnico para cerrar una nueva funcionalidad
Estrategias para usar IA sin perder diseño intencional ni coherencia
```
## 11

##### REFACTORIZACIÓN PROFUNDA Y MODERNIZACIÓN
##### PROGRESIVA DE CÓDIGO HEREDADO SIN ROMPER EL
##### PRODUCTO

```
Identificación de olores de código y prioridades de refactorización
Separación entre deuda estructural y simples mejoras cosméticas
Extracción de funciones, módulos y capas para reducir acoplamiento
Simplificación de lógica compleja con validación de comportamiento previo
Reescritura gradual de áreas frágiles con tests como red de seguridad
Refactorización orientada a mantenibilidad, legibilidad y extensibilidad
Revisión del impacto sobre rendimiento, contratos y dependencias
Documentación del before/after para justificar el cambio
Estrategias para refactorizar en ramas seguras y lotes pequeños
Uso de Claude Code para modernizar sin reescribir ciegamente todo el
sistema
```

## 12

##### TESTING ASISTIDO POR IA PARA UNIT TESTS,
##### INTEGRACIÓN, REGRESIÓN Y ESCENARIOS BORDE
##### CON COBERTURA ÚTIL

```
Diseño de estrategia de pruebas antes de escribir tests automáticos
Generación de unit tests con foco en lógica crítica y no en puro coverage
vacío
Construcción de tests de integración alineados con flujos reales
Identificación de casos borde, inputs maliciosos y rutas de error
Uso de mocks, fakes y fixtures mantenibles
Refuerzo de suites de regresión tras bugs y hotfixes
Validación de resultados de test generados por Claude Code
Integración del testing en flujos locales y CI/CD
Detección de pruebas frágiles, redundantes o poco informativas
Estrategias para convertir Claude Code en copiloto de calidad y no solo de
velocidad
```
## 13

##### DOCUMENTACIÓN TÉCNICA, README, ADR Y
##### EXPLICACIONES DE ARQUITECTURA QUE SÍ SIRVEN AL
##### EQUIPO

```
Generación de README útiles para arranque y mantenimiento del proyecto
Documentación de módulos, servicios y puntos de extensión
Explicación de decisiones arquitectónicas mediante ADRs claros
Elaboración de guías de onboarding para nuevos desarrolladores
Documentación de flujos de despliegue, debugging y troubleshooting
Creación de ejemplos de uso para librerías internas y APIs
Refuerzo de comentarios de código donde realmente aportan
Sincronización entre documentación y comportamiento actual del sistema
Revisión crítica de texto generado para evitar documentación vacía
Conversión de Claude Code en apoyo sistemático a la memoria técnica del
equipo
```

## 14

##### REVISIÓN DE CÓDIGO, PULL REQUESTS Y ANÁLISIS DE
##### CAMBIOS CON FOCO EN CALIDAD, MANTENIBILIDAD Y
##### RIESGO

```
Lectura crítica de diffs y detección temprana de cambios peligrosos
Evaluación de consistencia con patrones y normas del repositorio
Identificación de deuda añadida en una pull request aparentemente correcta
Revisión de claridad, complejidad y mantenibilidad del cambio propuesto
Señalado de errores de validación, gestión de estados o manejo de
excepciones
Construcción de comentarios de revisión claros y accionables
Uso de Claude Code para preparar PRs mejor justificadas
Generación de resúmenes de cambio útiles para reviewers y managers
técnicos
Integración de revisión asistida en procesos colaborativos de Git
Límites de la IA en revisión y momentos donde conviene revisión humana
profunda
```
## 15

##### SEGURIDAD DEL SOFTWARE, ANÁLISIS DE
##### VULNERABILIDADES Y HARDENING DEL CÓDIGO
##### GENERADO O MODIFICADO

```
Revisión de entradas, validaciones y saneamiento de datos de usuario
Detección de prácticas inseguras en autenticación y autorización
Revisión de exposición accidental de secretos y configuraciones sensibles
Análisis de riesgos en manejo de archivos, comandos y llamadas externas
Validación de dependencias desde perspectiva de superficie de ataque
Petición de revisiones específicas orientadas a OWASP y buenas prácticas
Seguridad en APIs, sesiones, CORS, tokens y control de acceso
Revisión de errores que revelan información sensible al cliente
Integración de chequeos de seguridad en hotfixes y nuevas funcionalidades
Uso de Claude Code como apoyo a la seguridad sin delegar la decisión final
```

## 16

##### DEPENDENCIAS, PAQUETES Y MIGRACIONES DE
##### LIBRERÍAS O FRAMEWORKS CON CRITERIO TÉCNICO Y
##### PLAN DE TRANSICIÓN

```
Análisis del estado de dependencias y versiones desactualizadas
Identificación de librerías de riesgo o mantenimiento dudoso
Diseño de migraciones de framework en fases con pruebas de regresión
Refactorización por breaking changes de APIs y contratos internos
Sustitución de dependencias críticas sin detener la operación
Generación de scripts o guías de migración para el equipo
Evaluación de impacto en build, tests, pipelines y despliegue
Estrategias para migraciones de frontend, backend y tooling
Revisión de changelogs, patrones de compatibilidad y costes de cambio
Uso de Claude Code para reducir fricción en evoluciones tecnológicas
inevitables
```
## 17

##### GIT, BRANCHING, COMMITS, HOTFIXES Y RESOLUCIÓN
##### DE CONFLICTOS DE CÓDIGO CON AYUDA DE CLAUDE
##### CODE

```
Exploración de ramas y contexto antes de tocar un cambio urgente
Preparación de hotfixes seguros y acotados sobre producción
Generación de mensajes de commit útiles y con atribución configurable
Revisión previa a merge para detectar conflictos funcionales
Asistencia en resolución de conflictos de merge con criterio semántico
Recuperación de contexto en ramas antiguas o trabajos interrumpidos
Uso de `/rewind`, `/resume`, `--continue` y control de sesiones relacionadas
Preparación de pull requests mejor explicadas y más auditables
Integración con workflows de revisión y ramas protegidas
Buenas prácticas para no convertir la IA en un generador de commits sin
juicio.
```

## 18

##### SKILLS REUTILIZABLES PARA ESTANDARIZAR TAREAS
##### TÉCNICAS DEL EQUIPO Y REDUCIR PROMPTING
##### REPETITIVO

```
Qué son las Skills y cómo amplían la capacidad de Claude Code
Estructura de un `SKILL.md` útil para tareas repetibles y bien delimitadas
Diferencia entre skill automática e invocación explícita mediante `/skill-
name`
Diseño de skills para code review, testing, docs o despliegue
Reutilización de skills por proyecto, por usuario o por organización
Migración conceptual desde comandos personalizados a skills unificadas
Estrategias de nombrado, documentación y mantenimiento de skills
Versionado de skills compartidas sin romper hábitos del equipo
Ejemplos de skills corporativas de alto valor recurrente
Gobierno de skills para evitar dispersión y duplicidad.
```
## 19

##### SUBAGENTES, ESPECIALIZACIÓN DE ROLES Y
##### TRABAJO DISTRIBUIDO DENTRO DE CLAUDE CODE

```
Qué papel juegan los subagentes en flujos complejos de desarrollo
Cuándo conviene usar un subagente revisor, arquitecto o tester
especializado
Configuración de subagentes a nivel usuario o proyecto
Restricción de herramientas y alcance de cada subagente
Uso de `--agents` para añadir subagentes dinámicamente en sesión
Auto memory propio de subagentes y su utilidad práctica
Diseño de equipos de agentes para tareas largas y segmentadas
Casos de uso de subagentes en debugging, documentación o seguridad
Riesgos de sobreorquestación dentro del flujo del desarrollador
Criterios para mantener subagentes útiles, legibles y gobernables.
```

## 20

##### MCP OFICIAL, CONECTORES REMOTOS Y SERVIDORES
##### PROPIOS PARA ABRIR CLAUDE CODE A
##### HERRAMIENTAS REALES DE EMPRESA

```
Qué es MCP y por qué cambia la integración del asistente con el entorno
Diferencia entre servidores stdio, SSE y HTTP en el ecosistema MCP
Uso de conectores remotos oficiales y sus implicaciones de seguridad
Gestión de autenticación OAuth en MCP remoto cuando aplica
Mención y activación de herramientas MCP dentro de la sesión
Diseño de servidores MCP propios para sistemas internos de empresa
Exposición de recursos y herramientas con contratos claros y robustos
Gestión de timeouts, reconexión y tolerancia a fallos en MCP
Gobierno de MCP mediante allowlists y denylists administradas
Casos de alto valor: Git, documentación, ticketing, CI, datos internos y
observabilidad.
```
## 21

##### SISTEMA DE PLUGINS, MARKETPLACES, HOOKS Y
##### EXTENSIBILIDAD AVANZADA PARA EQUIPOS DE
##### DESARROLLO Y TI

```
Qué permite hoy el sistema oficial de plugins de Claude Code
Plugins que empaquetan skills, agentes, hooks y servidores MCP
Gestión mediante `/plugin install`, `/plugin enable`, `/plugin disable` y
`/plugin marketplace`
Validación de plugins con `/plugin validate` antes de distribuirlos
Uso de marketplaces adicionales con `extraKnownMarketplaces`
Configuración de plugins a nivel usuario y a nivel repositorio
Restricciones corporativas sobre marketplaces y plugins permitidos
Diseño de hooks pre y post tool para reforzar políticas técnicas
Casos de plugin interno para formato, despliegue o seguridad
Buenas prácticas para no convertir la extensibilidad en una fuente de caos
técnico.
```

## 22

##### OPCIONES AVANZADAS DE CLI, SESIONES,
##### HISTORIALES Y PRODUCTIVIDAD INTENSIVA EN
##### TERMINAL

```
Uso del REPL interactivo frente a ejecución puntual por flags
Gestión de sesiones largas, compactación y recuperación de contexto
Comandos `/config`, `/status`, `/usage`, `/mcp`, `/permissions`, `/resume` y
`/rewind`
Uso de historial, búsqueda y edición avanzada de prompts en terminal
Aprovechamiento de comandos en background para dev servers y colas
largas
Gestión de directorios adicionales con `--add-dir`
Uso de `--append-system-prompt` y estrategias de prompt de arranque
Atajos y keybindings para productividad diaria en sesiones intensivas
Organización del trabajo en tmux, screen u otros multiplexores
Estrategias para convertir la CLI en centro operativo del desarrollador.
```

## 23

##### DOCKER, ENTORNOS REPRODUCIBLES Y AYUDA DE
##### CLAUDE CODE EN EMPAQUETADO, LOCAL DEV Y
##### TROUBLESHOOTING

```
Creación y revisión de Dockerfiles con foco en simplicidad y seguridad
Generación de `docker-compose` o equivalentes para entornos locales
Diagnóstico de builds rotas, imágenes pesadas y errores de arranque
Revisión de variables, secretos y configuración de contenedores
Optimización de capas y tiempos de build con criterios concretos
Preparación de entornos locales consistentes para todo el equipo
Asistencia en logs de contenedor y análisis de fallos en runtime
Integración de pruebas dentro de contenedores de desarrollo
Estrategias para entornos multi-servicio y dependencias locales
Uso de Claude Code como copiloto de troubleshooting de plataformas
reproducibles
```
## 24

##### DEVOPS, CI/CD, PIPELINES Y AUTOMATIZACIÓN DEL
##### CICLO DE ENTREGA CON CLAUDE CODE EN ENTORNOS
##### CORPORATIVOS

```
Revisión y creación de workflows de GitHub Actions y GitLab CI
Asistencia en pipelines de build, test, lint, scan y deploy
Generación de scripts de soporte para release y rollback
Análisis de logs de pipeline y diagnóstico de fallos recurrentes
Refuerzo de convenciones de calidad antes del merge a ramas protegidas
Integración de Claude Code con estándares de release engineering
Automatización de tareas repetitivas de mantenimiento del pipeline
Soporte a hotfixes urgentes con validación técnica acelerada
Buenas prácticas para no delegar decisiones críticas de despliegue a la IA
Diseño de una colaboración sana entre desarrolladores, plataforma y
DevOps.
```

## 25

##### ARQUITECTURA, DISEÑO DE SOFTWARE, PATRONES Y
##### DECISIONES TÉCNICAS ASISTIDAS POR IA SIN PERDER
##### CRITERIO HUMANO

```
Exploración de alternativas de diseño antes de escribir implementación
Análisis de trade-offs entre simplicidad, extensibilidad y coste de cambio
Uso de Claude Code para revisar bounded contexts, capas y contratos
Identificación de patrones ya presentes en el repositorio
Propuesta de patrones adecuados sin introducir sobreingeniería gratuita
Evaluación de deuda arquitectónica antes de nuevas funcionalidades
Discusión de alternativas para módulos críticos o legacy
Preparación de ADRs y argumentos técnicos bien estructurados
Revisión de consistencia entre diseño y código final entregado
Límites de la IA en arquitectura y necesidad de juicio técnico senior
```
## 26

##### TRABAJO EN EQUIPO, ESTÁNDARES COMPARTIDOS Y
##### GOBIERNO DE USO DE CLAUDE CODE EN
##### ORGANIZACIONES DE DESARROLLO

```
Diseño de una política interna de uso aceptable y productivo
Qué instrucciones deben vivir en proyecto y cuáles en managed settings
Estándares compartidos para prompts, skills y revisión de cambios
Reparto de responsabilidades entre desarrollador, reviewer y líder técnico
Formación cruzada del equipo para no depender de un único experto en IA
Gestión de conocimiento sobre patrones que sí funcionan con Claude Code
Coordinación entre repositorios y productos con enfoques consistentes
Auditoría ligera del uso de IA y trazabilidad de decisiones críticas
Integración de Claude Code en cultura de calidad y no solo de velocidad
Construcción de una adopción empresarial que resista la rotación de
personas
```

## 27

##### PROYECTO FINAL: FLUJO COMPLETO DE INGENIERÍA
##### DE SOFTWARE ASISTIDA CON CLAUDE CODE SOBRE
##### UN REPOSITORIO REAL

```
Diagnóstico inicial del repositorio, stack y reglas técnicas del proyecto
Definición de `CLAUDE.md`, settings y políticas mínimas del equipo
Creación de skills y configuración de subagentes útiles para el caso
Integración de MCP o plugins donde aporten valor real al flujo
Desarrollo de una nueva funcionalidad con pruebas y documentación
asociada
Refactorización de una zona heredada con validación de impacto
Revisión de seguridad, dependencias y calidad del cambio completo
Preparación de commits, rama, PR y criterios de merge
Ejecución de checks de CI/CD y revisión de incidencias encontradas
Presentación final del flujo de trabajo resultante, decisiones tomadas y
roadmap de adopción en equipo
```
