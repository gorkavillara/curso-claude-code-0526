# Checklist de requisitos — Curso de Claude Code

> Marca cada casilla **antes** de empezar. Si alguna no la puedes marcar, escríbelo en la incidencia del curso para resolverlo antes de la primera sesión.

## 1. Equipo y sistema operativo

- [ ] Ordenador con uno de estos sistemas, **actualizado**:
  - Windows 11
  - macOS 13 (Ventura) o superior
  - Linux con kernel reciente (Ubuntu 22.04+, Fedora 39+, etc.)
- [ ] Mínimo **16 GB de RAM** (8 GB funciona pero va justo con Docker + IDE).
- [ ] CPU de **4 núcleos** o más.
- [ ] Al menos **20 GB libres** en disco (repos, contenedores, dependencias).
- [ ] Conexión a internet estable (Claude Code necesita salida HTTPS).

## 2. Cuenta y plan de acceso a Claude ⚠️

- [ ] Tienes **acceso confirmado** a Claude Code en uno de estos planes:
  - Claude Team (asiento Standard o Premium asignado por tu organización)
  - Claude Enterprise (acceso a Claude Code se factura aparte por consumo a tarifas API)
  - Plan individual aprobado por tu organización
- [ ] Sabes **a qué workspace** vas a iniciar sesión (puede haber varios; pregunta a IT si dudas).
- [ ] Has hecho login al menos una vez desde tu equipo y no te lo bloquea ningún SSO/MFA corporativo.
- [ ] Conoces los **límites de uso** y consumo aplicables a tu plan (importante en Enterprise: cada token cuenta).

> ⚠️ Si tu organización gobierna el acceso vía Okta/Entra/Google Workspace, valida con IT que el inicio de sesión funciona **desde el equipo del curso**, no solo desde el portátil corporativo de oficina.

## 3. IDE y herramientas de edición

- [ ] Instalado uno de estos IDEs:
  - Visual Studio Code (con extensión oficial de Claude Code)
  - Cualquier IDE de JetBrains (IntelliJ, WebStorm, PyCharm, GoLand, etc.) con plugin oficial de Claude Code
- [ ] Permisos para **instalar extensiones/plugins** sin pedírselo a IT cada vez.
- [ ] Sabes cómo abrir la **terminal integrada** del IDE.

## 4. Git y acceso a repositorios ⚠️

- [ ] `git --version` devuelve algo (Git instalado).
- [ ] Tu identidad está configurada:
  ```
  git config --global user.name
  git config --global user.email
  ```
- [ ] Acceso a los repos corporativos del curso con permisos de:
  - [ ] Lectura
  - [ ] Escritura
  - [ ] **Crear ramas**
  - [ ] **Abrir Pull Requests / Merge Requests**

> ⚠️ Si el repo está en GitHub Enterprise o GitLab self-hosted, verifica que tu **VPN / red corporativa** está activa cuando estés en el curso.

## 5. Terminal y entorno local

- [ ] Tienes una terminal moderna disponible:
  - Windows: Windows Terminal + PowerShell 7 (o WSL2 con Ubuntu)
  - macOS / Linux: terminal del sistema o iTerm2
- [ ] **Docker Desktop** (o Podman, Rancher Desktop, etc.) instalado y arrancando sin errores.
  - [ ] `docker run hello-world` funciona.
- [ ] **Node.js 24+** instalado (`node --version`) — el código de prácticas usa type-stripping nativo de Node 24.
- [ ] `npm --version` funciona.

## 6. CI/CD (solo si tu organización lo usa en el curso)

- [ ] Acceso a GitHub Actions o GitLab CI con permisos para:
  - [ ] Ver ejecuciones de pipelines.
  - [ ] Lanzar pipelines manualmente si la práctica lo requiere.
- [ ] Sabes dónde se gestionan los **secrets** de CI (no para tocarlos, para entender el flujo).

## 7. Permisos sobre la carpeta de configuración de Claude ⚠️ (clave)

> Claude Code guarda su configuración global, agentes, skills y memoria en `~/.claude/` (en Windows: `C:\Users\<tu-usuario>\.claude\`). Necesitas **lectura y escritura** sobre esa carpeta y su contenido.

- [ ] Tu usuario tiene permisos de **lectura y escritura** sobre `~/.claude/`.
- [ ] Ningún antivirus / EDR corporativo bloquea la creación o modificación de archivos dentro de esa carpeta.

**Cómo verificarlo:**

- macOS / Linux:
  ```bash
  mkdir -p ~/.claude && touch ~/.claude/.test-write && rm ~/.claude/.test-write && echo OK
  ```
- Windows (PowerShell):
  ```powershell
  New-Item -ItemType Directory -Force -Path "$HOME\.claude" | Out-Null
  Set-Content "$HOME\.claude\.test-write" "ok"; Remove-Item "$HOME\.claude\.test-write"; "OK"
  ```

Si alguno falla con error de permisos → habla con IT antes del curso.

## 8. Conocimientos previos

> El curso asume que ya programas. No es un curso de iniciación.

- [ ] Programación en al menos un lenguaje moderno a nivel profesional.
- [ ] Git: ramas, merge, rebase, resolución de conflictos, pull requests.
- [ ] Terminal: navegación, variables de entorno, ejecución de scripts.
- [ ] Testing: has escrito tests al menos en un proyecto real.
- [ ] Arquitectura básica: entiendes qué es una API REST, una base de datos relacional, un frontend/backend.

## 9. Verificación final (haz esto el día antes del curso)

Ejecuta estos comandos en la terminal en una carpeta de pruebas. Todos deben funcionar:

```bash
node --version          # >= 24
npm --version
git --version
docker --version
docker run hello-world
claude
```

Y abre Claude Code desde tu IDE:

- [ ] Inicia sesión correctamente.
- [ ] Hace una pregunta sencilla y responde sin error de red.
- [ ] Puede leer un archivo del repo (`Read`).
- [ ] Puede ejecutar un comando de shell (`Bash` / `PowerShell`) sin que IT lo bloquee.

Si algo falla → escríbelo en la incidencia del curso **antes** de la primera sesión, no el mismo día.
