# devteam

Equipo de agentes especializados para desarrollo fullstack, disponible en cualquier proyecto.

Este repositorio es a la vez el marketplace (`devteam-local`) y el plugin (`devteam`).

## Uso rapido

El ciclo completo, de instalar a trabajar.

| Paso | Cuando | Comando |
|---|---|---|
| 1. Instalar | Una vez por maquina | `claude plugin marketplace add agarciaec/devteam` |
| 2. Presentar el proyecto | Una vez por proyecto | `/kickoff` si es nuevo, `/onboard` si ya existe |
| 3. Trabajar | Cada funcionalidad o arreglo | `/feature <que quieres>` |
| 4. Retomar | Al volver dias despues | `/standup` |

**1. Instalar.** Una sola vez en cada maquina. Los agentes aparecen al abrir una sesion nueva de
Claude Code.

```bash
claude plugin marketplace add agarciaec/devteam
claude plugin install devteam@devteam-local
```

**2. Presentar el proyecto al equipo.** Los agentes no saben nada de tu proyecto hasta que existe
su ficha, asi que este paso va primero. Se hace una vez y sirve para siempre.

En un proyecto que **ya existe**, el equipo lo reconoce solo: lee el codigo y las dependencias,
deduce lenguaje, framework, base de datos y comandos, te pregunta lo que no puede deducir, y
escribe `.devteam/context.md` y `CLAUDE.md`.

```
/onboard
```

En un proyecto **nuevo**, el flujo se invierte: le cuentas que quieres construir, el equipo propone
stack y estructura justificando que descarta, tu decides, y solo entonces crea el esqueleto y
comprueba que arranca.

```
/kickoff una API para gestionar reservas de canchas deportivas
```

**3. Trabajar.** Es el comando del dia a dia. Una orden, y el equipo recorre el ciclo entero:
explora el codigo en paralelo, disena y acuerda contigo el contrato de API, implementa, y verifica
con revision, pruebas y seguridad a la vez.

```
/feature permitir cancelar una reserva hasta 2 horas antes
```

Se para en dos sitios a esperarte: tras el diseno, para resolver ambiguedades antes de escribir
codigo, y al final, para contarte que se verifico y con que resultado real.

**4. Retomar.** Cuando vuelves a un proyecto y no recuerdas donde lo dejaste.

```
/standup
```

Tambien puedes llamar a un especialista directamente, sin pasar por `/feature`, cuando ya sabes lo
que necesitas: *"usa el security-auditor sobre el login"* o *"que el db-specialist revise por que
esta consulta va lenta"*.

Y con el uso, el equipo mejora: cada `/feature` deja escrito en la ficha lo que aprendio del
proyecto, asi que la siguiente tarea empieza sabiendo mas que la anterior.

## Actualizar el plugin

Para traer los cambios publicados desde la ultima vez:

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

## Como mejora con el uso

La palabra "aprender" promete algo que no ocurre: el modelo no se reentrena con tu uso, y ningun
agente recuerda nada de la sesion anterior. Lo que si hace el equipo es **escribir lo que descubre**
en la ficha del proyecto, que todos leen antes de trabajar. El aprendizaje es un archivo, y por eso
funciona: se puede leer, corregir y borrar.

Al cerrar cada tarea, `/feature` actualiza `context.md`: corrige lo que resulto ser falso, anade las
trampas que costo descubrir, y anota en **Lecciones del proyecto** lo que cambiara lo que alguien
haga la proxima vez — el defecto que aparecio dos veces, la decision tomada y su motivo, el supuesto
que resulto equivocado.

Lo que hace que esto sirva es la disciplina de **no anotarlo todo**. Esa seccion la leen los diez
agentes en cada arranque, asi que cada entrada inutil cuesta atencion en todas las tareas futuras.
Entra solo lo especifico de este proyecto, que vaya a ser relevante otra vez y que no este ya
escrito; el conocimiento general no entra, porque los agentes ya lo traen. Y se poda al escribir.

La otra mitad es la correccion dentro de la tarea: aplicar un arreglo no lo da por bueno, hay que
volver a ejecutar lo que fallaba. Y tras dos intentos fallidos el equipo para y lo cuenta con la
salida real, en lugar de probar variaciones a ciegas.

`/standup` avisa si una tarea se cerro dejando hallazgos abiertos sin anotar ninguna leccion:
significa que ese aprendizaje se perdio.

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
├── context.md              # ficha del proyecto, viva: la actualiza cada /feature al cerrar
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
