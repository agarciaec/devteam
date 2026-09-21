# devteam

Equipo de agentes especializados para desarrollo fullstack, disponible en cualquier proyecto.

Este repositorio es a la vez el marketplace (`devteam-local`) y el plugin (`devteam`).

## Instalacion

```bash
claude plugin marketplace add agarciaec/devteam
claude plugin install devteam@devteam-local
```

Los agentes y comandos aparecen al abrir una sesion nueva de Claude Code.

Para traer cambios posteriores:

```bash
claude plugin marketplace update devteam-local
claude plugin update devteam
```

En un servidor sin navegador, donde el registro no pueda resolver credenciales, clona el
repositorio a mano y apunta el marketplace a esa ruta:

```bash
git clone https://github.com/agarciaec/devteam.git /opt/devteam
claude plugin marketplace add /opt/devteam
```

## Comandos

| Comando | Para que |
|---|---|
| `/kickoff <idea>` | **Proyecto nuevo.** El equipo propone stack y estructura, lo acuerda contigo y crea el esqueleto. |
| `/onboard` | **Proyecto existente.** Reconoce el stack y genera `.devteam/context.md` y `CLAUDE.md`. |
| `/feature <descripcion>` | Ciclo completo: exploracion, diseno, implementacion y verificacion, con los especialistas en paralelo. |
| `/standup` | En que punto quedo el trabajo y que falta. |

## Agentes

| Agente | Modelo | Para que |
|---|---|---|
| `tech-lead` | opus | Arquitectura, eleccion de stack y contrato de API |
| `backend` | sonnet | Lado servidor en cualquier lenguaje y framework |
| `frontend` | sonnet | Interfaz en cualquier framework, o sin ninguno |
| `db-specialist` | sonnet | Modelado, migraciones, consultas e indices |
| `qa-tester` | sonnet | Pruebas unitarias, de integracion y de extremo a extremo |
| `code-reviewer` | sonnet | Defectos de correctitud sobre el diff |
| `security-auditor` | opus | OWASP, secretos, datos sensibles |
| `devops` | sonnet | Construccion, despliegue, contenedores, entorno |
| `automation-bot` | sonnet | Automatizacion de navegador y procesos desatendidos |
| `docs-writer` | haiku | README, CHANGELOG, CLAUDE.md |

## Principio de diseno: generico por oficio, especializado por proyecto

Los agentes saben de su oficio, no de una tecnologia concreta ni de un proyecto concreto.
`backend` sabe de transacciones, validacion y errores, lo mismo en Python que en Node o .NET;
`frontend` sabe de estado, accesibilidad y ciclo de vida, lo mismo en Angular que en React o en
HTML sin framework alguno. Ninguno trae incrustado un stack, un dominio de negocio ni un
inventario de repositorios.

Por eso no hay un agente por framework: lo que un especialista aporta es criterio, y el criterio
es lo que se transfiere entre tecnologias. Lo que cambia es como se escribe, y eso lo averigua
leyendo el proyecto.

**Lo que los especializa es `.devteam/context.md`**, la ficha de cada proyecto, que todos leen al
arrancar. La consecuencia practica es que mejorar esa ficha mejora a los diez agentes a la vez.

## De donde sale el contexto de cada proyecto

**En un proyecto que ya existe**, `/onboard` lo deduce leyendo el codigo: manifiestos de
dependencias, archivos de configuracion, estructura de carpetas y el propio codigo. De ahi salen
el lenguaje y framework del servidor, la tecnologia de interfaz, el motor de base de datos, los
comandos reales de construccion, ejecucion y prueba, y las convenciones que sigue el proyecto.
Lo que no se puede deducir —si el proyecto esta activo, donde se despliega, que partes son
delicadas— te lo pregunta. Cuando un dato no se averigua, se escribe "desconocido": un dato
inventado en la ficha se propaga a todos los agentes.

**En un proyecto nuevo** no hay nada que leer, asi que el flujo se invierte: `/kickoff` te pregunta
que vas a construir y para quien, el equipo **propone** stack y estructura justificando cada
eleccion y diciendo que descarto, tu decides, y solo entonces se crea el esqueleto. La ficha se
escribe a partir de esas decisiones en lugar de la deteccion.

El criterio de eleccion es el mismo en todo el equipo: en un proyecto que ya existe manda la
consistencia con lo que hay; cuando de verdad hay que elegir algo nuevo, lo actual y mantenido,
proporcionado al tamano real del problema, y nada de dependencias para lo que la plataforma ya
resuelve.

El apartado de la ficha que mas conviene cuidar es **que datos sensibles maneja el proyecto**: de
el dependen el auditor de seguridad y el especialista de datos para calibrar su exigencia, asi que
un "ninguna" equivocado le baja la guardia a todo el equipo.

## Como funciona

Los subagentes de Claude Code no se comunican entre si: cada uno arranca en frio y reporta a la
sesion principal. El equipo se construye sobre tres mecanismos reales:

- La sesion principal actua de tech lead y es **la unica que escribe codigo fuente**, asi que dos
  agentes nunca colisionan sobre el mismo archivo.
- El paralelismo es real cuando varios agentes se lanzan **en un mismo mensaje**.
- El handoff se hace por archivos, en la carpeta `.devteam/` de cada proyecto.

La pieza central es `contract.md`: el contrato de API y tipos que el `tech-lead` acuerda **antes**
de implementar. Con el, backend y frontend pueden trabajar a la vez sin esperarse.

El detalle esta en la skill `devteam-protocol`.

## Estructura de `.devteam/` en cada proyecto

```
.devteam/
├── context.md              # ficha del proyecto (/onboard o /kickoff)
└── tasks/<slug>/
    ├── spec.md             # que se pide y criterios de aceptacion
    ├── design.md           # decision de arquitectura
    ├── contract.md         # endpoints, esquemas, tipos
    ├── findings/           # un informe por especialista
    └── log.md              # bitacora de cierre
```

## Modificar el equipo

Edita los archivos de `plugins/devteam/` y confirma el cambio. Los agentes se recargan al abrir
una sesion nueva. La maquina donde vive el repositorio tiene el marketplace registrado como
directorio local, asi que ahi los cambios se ven sin pasar por GitHub; las demas consumen la
version publicada y la traen con `marketplace update` y `plugin update`.

Dos cosas que conviene respetar al modificarlo:

- **No incrustes contexto de un proyecto concreto en un agente.** Si hace falta que sepa algo del
  proyecto, va en su `context.md`, no en el prompt.
- **No crees agentes por tecnologia.** Un agente por framework reintroduce el problema que la
  fusion de `frontend` y `backend` vino a resolver.

Lo que mas conviene ajustar con el uso son los `description` de los agentes: son lo unico que la
sesion principal lee para decidir a quien convocar. Si un especialista no se convoca cuando
deberia, el problema casi siempre esta ahi.
