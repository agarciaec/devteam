# devteam

Equipo de agentes especializados para desarrollo fullstack, disponible en todos los proyectos de `D:\Desarrollo`.

Este repositorio es a la vez el marketplace (`devteam-local`) y el plugin (`devteam`).

## Instalacion en una maquina nueva

El repositorio es privado, asi que primero hay que tener sesion de GitHub:

```bash
gh auth login --hostname github.com --git-protocol https --web
claude plugin marketplace add agarciaec/devteam
claude plugin install devteam@devteam-local
```

Los agentes y comandos aparecen al abrir una sesion nueva de Claude Code.

Para traer cambios posteriores:

```bash
claude plugin marketplace update devteam-local
claude plugin update devteam
```

## Donde se edita el equipo

La maquina donde vive el repositorio (`D:\Desarrollo\_devteam`) tiene el marketplace
registrado como directorio local, asi que los cambios se ven al abrir sesion nueva, sin
pasar por GitHub. Es la maquina de desarrollo del plugin.

Las demas maquinas consumen la version publicada. El ciclo es: editar aqui, `git push`,
y en las otras `claude plugin marketplace update devteam-local && claude plugin update devteam`.

Si algun dia hay que editar desde otra maquina, clona el repositorio ahi y registra esa
ruta como directorio local, igual que en esta.

## Comandos

| Comando | Para que |
|---|---|
| `/onboard` | Reconoce el stack del proyecto y genera `.devteam/context.md` y `CLAUDE.md`. Primer paso en cualquier proyecto. |
| `/feature <descripcion>` | Ciclo completo: exploracion, diseno, implementacion y verificacion, con los especialistas en paralelo. |
| `/standup` | En que punto quedo el trabajo y que falta. |

## Agentes

| Agente | Modelo | Para que |
|---|---|---|
| `tech-lead` | opus | Arquitectura y contrato de API |
| `backend-python` | sonnet | FastAPI, Flask, Django + DRF, SQLAlchemy |
| `frontend-angular` | sonnet | Angular, Material, NgRx, RxJS |
| `frontend-react` | sonnet | React, Vite, Tailwind |
| `db-specialist` | sonnet | Oracle, SQL Server, AS400/DB2, PostgreSQL |
| `qa-tester` | sonnet | pytest, Karma/Jasmine, Playwright |
| `code-reviewer` | sonnet | Defectos de correctitud sobre el diff |
| `security-auditor` | opus | OWASP, secretos, datos sensibles |
| `devops` | sonnet | Construccion, despliegue, contenedores, entorno |
| `automation-bot` | sonnet | Selenium, selenium-wire, Playwright |
| `docs-writer` | haiku | README, CHANGELOG, CLAUDE.md |

## Principio de diseno: generico por oficio, especializado por proyecto

Los agentes saben de su oficio, no de tus proyectos. `backend-python` domina FastAPI, Flask y
Django; `db-specialist` conoce los dialectos de Oracle, SQL Server, DB2 y PostgreSQL. Pero
ninguno trae incrustado un stack concreto, un dominio de negocio ni un inventario de repositorios.

Lo que los especializa es `.devteam/context.md`, la ficha que `/onboard` genera en cada proyecto
y que todos leen al arrancar. De ahi sale el framework que se usa aqui, los comandos reales, las
convenciones y, muy en particular, **que datos sensibles maneja el proyecto**: de ese apartado
dependen el auditor de seguridad y el especialista de datos para calibrar su exigencia.

La consecuencia practica es que el equipo sirve igual en un proyecto que no existe todavia, y que
mejorar la ficha de un proyecto mejora a los once agentes en el a la vez.

## Como funciona

Los subagentes de Claude Code no se comunican entre si: cada uno arranca en frio y reporta a la sesion principal. El equipo se construye sobre tres mecanismos reales:

- La sesion principal actua de tech lead y es **la unica que escribe codigo fuente**, asi que dos agentes nunca colisionan sobre el mismo archivo.
- El paralelismo es real cuando varios agentes se lanzan **en un mismo mensaje**.
- El handoff se hace por archivos, en la carpeta `.devteam/` de cada proyecto.

La pieza central es `contract.md`: el contrato de API y tipos que el `tech-lead` acuerda **antes** de implementar. Con el, backend y frontend pueden trabajar a la vez sin esperarse.

El detalle esta en la skill `devteam-protocol`.

## Estructura de `.devteam/` en cada proyecto

```
.devteam/
├── context.md              # ficha del proyecto (la genera /onboard)
└── tasks/<slug>/
    ├── spec.md             # que se pide y criterios de aceptacion
    ├── design.md           # decision de arquitectura
    ├── contract.md         # endpoints, esquemas, tipos
    ├── findings/           # un informe por especialista
    └── log.md              # bitacora de cierre
```

## Modificar el equipo

Edita los archivos de `plugins/devteam/` y confirma el cambio. Los agentes se recargan al abrir una sesion nueva.

Lo que mas conviene ajustar con el uso son los `description` de los agentes: son lo unico que la sesion principal lee para decidir a quien convocar. Si un especialista no se convoca cuando deberia, el problema casi siempre esta ahi.
