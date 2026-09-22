# devteam

Equipo de agentes especializados para desarrollo fullstack, disponible en cualquier proyecto.

Este repositorio es a la vez el marketplace (`devteam-local`) y el plugin (`devteam`).

## Uso rapido

El ciclo completo, de instalar a trabajar.

| Paso | Cuando | Comando |
|---|---|---|
| 1. Instalar | Una vez por maquina | `claude plugin marketplace add agarciaec/devteam` |
| 2. Presentar el proyecto | Una vez por proyecto | `/kickoff` si es nuevo, `/onboard` si ya existe |
| 2b. Revisar su salud | Tras el onboarding y cada cierto tiempo | `/audit` |
| 2c. Revisar la interfaz | Cuando la interfaz se queda vieja o incomoda | `/redesign` |
| 2d. Probar la interaccion | Antes de una version, tras un rediseno, o si algo no responde | `/uitest` |
| 3. Trabajar | Cada funcionalidad o arreglo | `/feature <que quieres>` |
| 4. Publicar | Al terminar cada cambio | `/ship` |
| 5. Versionar | Al cerrar una version | `/release` |
| 6. Retomar | Al volver dias despues | `/standup` |

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

**2b. Revisar la salud del proyecto entero.** En un proyecto existente, `/audit` es el paso natural
despues de `/onboard`, y conviene repetirlo cada cierto tiempo o antes de una version importante.
Primero ejecuta build, pruebas, linter y arranque para tener una linea base real; despues cada
especialista revisa su capa en paralelo; y al final se hace una revision cruzada de donde se tocan
las capas, que es donde suele estar el problema: el frontend llama a un endpoint que ya no existe, un
modelo no coincide con su migracion, el codigo lee una variable de entorno que nadie documento.

```
/audit
```
```
/audit modulo de facturacion
```

Cada tarea propuesta queda escrita en `.devteam/tasks/<slug>/spec.md`, asi que en otra sesion basta
con `/feature <slug>`. Si la auditoria se hizo con una version anterior del plugin y solo te dejo los
nombres, `/audit tareas` convierte el ultimo informe en specs sin volver a auditar.

Si el proyecto tiene interfaz, ademas **la usa**: `qa-tester` arranca la aplicacion en local y la
recorre en un navegador como un usuario —pulsa botones, rellena formularios con datos validos e
invalidos, ordena, filtra y pagina tablas, abre y cierra ventanas— vigilando errores de consola y
peticiones fallidas. Es lo que encuentra un boton que falla al pulsarlo o una tabla que ordena mal,
que leyendo codigo no se ve. Cada fallo sale con los pasos para reproducirlo y la prueba automatica
que lo detectaria la proxima vez. Necesita poder arrancar la aplicacion en local y una herramienta de
navegador, como Playwright; sin eso, la interfaz queda marcada como no verificada, nunca como
correcta.

No modifica codigo. Entrega un informe con evidencias ordenado por gravedad, lo compara con la
auditoria anterior si la hay, y convierte los hallazgos en tareas que te propone hacer una a una con
`/feature`. En proyectos grandes acota por modulos: una auditoria que intenta abarcarlo todo de una
vez revisa en superficie todo y a fondo nada.

**2c. Revisar y actualizar la interfaz completa.** `/redesign` revisa todas las pantallas —con
capturas de la aplicacion real si se puede arrancar en local—, diagnostica usabilidad, consistencia,
accesibilidad, adaptacion a movil y actualidad, y te pide elegir cuanto cambiar:

- **Pulir**: corregir dentro del diseno actual
- **Evolucionar**: modernizar el sistema de diseno conservando la estructura que los usuarios conocen
- **Redisenar**: direccion visual nueva, con prototipos sobre tus pantallas reales para elegir

```
/redesign
```
```
/redesign hacerla mas productiva para quien la usa todo el dia
```

No toca codigo hasta que decides. Despues lo planifica primero el sistema de diseno y luego pantalla a
pantalla, por orden de valor, y cada etapa se ejecuta con su propio `/feature`: la aplicacion queda
funcionando y publicable en cada paso, nunca un cambio enorme de golpe.

**2d. Probar que la interfaz funciona al usarla.** `/uitest` es la parte de `/audit` dedicada a la
interaccion, sin convocar al resto del equipo: mas rapida y mas barata cuando la duda es solo si los
botones, formularios, tablas y ventanas hacen lo que deben.

```
/uitest
```
```
/uitest flujo de facturacion y pantalla de clientes
```

Comprueba primero que puede hacerse —que la aplicacion arranca en local, que hay navegador y que el
entorno es de pruebas— y si falta algo te dice como resolverlo. Despues toma las pantallas del
enrutador, acuerda contigo cuales recorrer, y `qa-tester` las usa como un usuario. El informe trae una
tabla de cobertura por pantalla, cada fallo con sus pasos para reproducirlo, los errores silenciosos
de consola y red, y lo que no se ejercito. Cada fallo sale con la prueba automatica que lo detectaria,
para que al arreglarlo no pueda volver sin que las pruebas avisen.

"Sin fallos" solo vale para lo que se recorrio: el informe siempre dice que quedo fuera.

**3. Trabajar.** Es el comando del dia a dia. Una orden, y el equipo explora, disena, implementa y
verifica, con el esfuerzo ajustado al tamano de la tarea: un cambio pequeno lo resuelve la sesion sin
convocar a nadie, y el equipo completo se reserva para lo grande o arriesgado. Ver
[Controlar el consumo](#controlar-el-consumo).

```
/feature permitir cancelar una reserva hasta 2 horas antes
```

Se para en dos sitios a esperarte: tras el diseno, para resolver ambiguedades antes de escribir
codigo, y al final, para contarte que se verifico y con que resultado real.

**Si la tarea toca pantallas**, en esa primera parada no solo lees un diseno: `ui-designer` te deja
un prototipo `mockup.html` que abres en el navegador, con datos realistas, sus estados de carga,
vacio y error, y las animaciones reales. Lo apruebas o lo corriges *antes* de que se escriba codigo,
y `frontend` implementa exactamente eso. En un proyecto que ya tiene diseno, respeta su sistema
visual; en uno nuevo o en un rediseno, te propone dos o tres direcciones contrastadas para elegir.

**Es una tarea por invocacion**, pero una tarea puede abarcar varias cosas si comparten contrato:
listar, crear y cancelar reservas es una sola funcionalidad. Si le pides cosas inconexas, las
desglosa, te propone el orden y las hace una a una en lugar de mezclarlas en un unico contrato.

**4. Publicar.** Con la tarea verificada, `/ship` la lleva a GitHub: sincroniza con el remoto,
resuelve conflictos volviendo a probar, redacta el commit con la convencion del repositorio, sube
la rama y abre el pull request. Te pide confirmacion antes de cada paso que sale de tu maquina, y
se detiene si encuentra secretos en el diff o si la verificacion no paso.

```
/ship
```

`/feature` ya crea una rama propia para cada tarea al empezar, desde la principal actualizada, asi
que al llegar aqui el trabajo esta aislado. Nunca confirma ni sube nada por su cuenta.

**5. Versionar.** Cuando quieres cerrar una version: `/release` reune lo cambiado desde el ultimo
tag, propone el numero segun lo que cambio —un contrato de API incompatible es version mayor aunque
el cambio parezca pequeno—, escribe el CHANGELOG para quien usa el software, y crea tag y release
con tu confirmacion.

```
/release
```

**6. Retomar y consultar.** Cuando vuelves a un proyecto y no recuerdas donde lo dejaste, o cuando
necesitas buscar algo en el historial.

```
/standup
```
```
/standup por que elegimos esta autenticacion
```

Tambien puedes llamar a un especialista directamente, sin pasar por `/feature`, cuando ya sabes lo
que necesitas: *"usa el security-auditor sobre el login"* o *"que el db-specialist revise por que
esta consulta va lenta"*.

Y con el uso, el equipo mejora: cada `/feature` deja escrito en la ficha lo que aprendio del
proyecto, asi que la siguiente tarea empieza sabiendo mas que la anterior.

## Controlar el consumo

El texto del plugin cuesta poco: unos 3.000 tokens fijos por sesion y entre 1.000 y 2.500 por cada
agente que se invoca. Lo que agota los limites es el trabajo: cada agente arranca en frio y vuelve a
leer el proyecto, los roles de criterio usan Opus, y manejar el navegador cuesta miles de tokens por
pantalla. Por eso `/feature` ajusta el esfuerzo a la tarea en lugar de usar siempre el equipo entero.

**Niveles de `/feature`.** Los elige solo segun el tamano y el riesgo, y te dice cual uso:

| Nivel | Para | Que hace |
|---|---|---|
| Ligero | Cambios acotados en una capa: la mayoria | Sin subagentes: explora e implementa la sesion directamente; pruebas y, si el diff lo merece, una revision |
| Estandar | Funcionalidades que cruzan capas | Un explorador como mucho, `tech-lead` solo si hay contrato, implementa la sesion; revision y pruebas en paralelo |
| Completo | Autenticacion, pagos, datos sensibles, cambios grandes | El equipo entero, como describe el ciclo |

Puedes forzarlo en la propia peticion:

```
/feature ligero: cambiar el texto del boton de guardar
```
```
/feature completo: nuevo flujo de pagos con tarjeta
```

**Modo de consumo del proyecto.** En `.devteam/context.md`, el apartado `## Modo de consumo` fija el
comportamiento por defecto: `economico`, `equilibrado` o `maximo`. En economico, `/feature` usa
siempre el nivel mas bajo posible y ademas rebaja los modelos al convocar agentes —Sonnet en lugar de
Opus, Haiku para explorar y documentar—, salvo la auditoria de seguridad de datos sensibles, donde
ahorrar no compensa. `/onboard` te lo pregunta; en fichas creadas antes de esta version, anade el
apartado a mano:

```markdown
## Modo de consumo
economico
```

**Habitos que ahorran mas que cualquier ajuste del plugin:**

- **Una tarea por sesion.** Al terminar un `/feature`, empieza una sesion nueva o limpia el contexto.
  Cada mensaje de una sesion larga vuelve a cargar todo lo anterior: la decima tarea de una misma
  sesion cuesta mucho mas que la primera. Lo que el equipo aprendio ya esta escrito en la ficha, asi
  que no pierdes nada al empezar de cero.
- **Peticiones concretas.** "Arregla el filtro de fecha de la tabla de facturas" cuesta una fraccion
  de "revisa la pantalla de facturas", porque no obliga a explorar.
- **`/audit`, `/redesign` y `/uitest` son caros por naturaleza**: recorren todo. Tienen sentido de vez
  en cuando, no a diario; acotalos a un modulo cuando puedas.
- **Todos los comandos siguen las mismas reglas de ahorro:**

  | Comando | Como ahorra |
  |---|---|
  | `/feature` | Niveles ligero, estandar y completo; en los dos primeros implementa la sesion sin subagentes |
  | `/audit` | Niveles rapida (sin especialistas), estandar (solo capas con indicios) y completa; las salidas largas van a archivo |
  | `/onboard` | Deduce de manifiestos, configuracion y muestras, no leyendo todo el codigo |
  | `/kickoff` | Dos direcciones visuales sobre una pantalla, y solo los agentes que condicionan la decision |
  | `/redesign` | Capturas por script a disco, prototipos acotados, sin prototipos en el nivel pulir |
  | `/uitest` | Recorrido escrito como pruebas y ejecutado, navegador interactivo solo para lo que falte |
  | `/ship`, `/release` | La sesion hace el trabajo de git; `git-manager` solo para conflictos o casos enredados |
  | `/standup` | Se apoya en el indice y en `log.md`, sin abrir informes enteros |

  En modo economico, todos ademas rebajan los modelos al convocar agentes.

- **Pruebas con script antes que navegador interactivo.** `qa-tester` ya prefiere escribir el
  recorrido como prueba de Playwright y ejecutarlo: le vuelve solo el resultado, y la prueba queda.

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
| `/kickoff <idea>` | **Proyecto nuevo.** El equipo propone stack y estructura, lo acuerda contigo, crea el esqueleto y registra las decisiones. |
| `/onboard` | **Proyecto existente.** Reconoce el stack y genera `context.md`, `decisions.md` y `CLAUDE.md`. |
| `/audit [area]` | Revision global de salud y consistencia: ejecuta, revisa cada capa en paralelo y cruza donde se tocan. No modifica codigo; devuelve informe y tareas. |
| `/redesign [objetivo]` | Revisa toda la interfaz, te hace elegir el nivel de cambio (pulir, evolucionar, redisenar) y lo planifica por etapas. |
| `/uitest [pantallas]` | Recorre la interfaz en un navegador como un usuario y comprueba que botones, formularios, tablas y ventanas funcionan. No modifica codigo. |
| `/feature <descripcion>` | Ciclo completo: exploracion, diseno, implementacion y verificacion en paralelo. Desglosa en tareas si le pides cosas inconexas. |
| `/ship` | Sincroniza, hace commit, sube la rama y abre el pull request, con tu confirmacion en cada paso que publica. |
| `/release [version]` | Calcula el numero de version, actualiza el CHANGELOG, y crea tag y release. |
| `/standup` | Donde quedo el trabajo y que falta. Con un tema, busca en el historial: `/standup por que elegimos esta autenticacion`. |

## Agentes

| Agente | Modelo | Para que |
|---|---|---|
| `tech-lead` | opus | Arquitectura, eleccion de stack y contrato de API |
| `backend` | sonnet | Lado servidor en cualquier lenguaje y framework |
| `ui-designer` | opus | Experiencia y diseno visual: flujos, sistema de diseno, animacion, prototipo navegable |
| `frontend` | sonnet | Interfaz en cualquier framework, o sin ninguno |
| `db-specialist` | sonnet | Modelado, migraciones, consultas e indices |
| `qa-tester` | sonnet | Pruebas automaticas, y recorrido de la aplicacion en marcha en un navegador como un usuario |
| `code-reviewer` | sonnet | Defectos de correctitud sobre el diff |
| `security-auditor` | opus | OWASP, secretos, datos sensibles |
| `devops` | sonnet | Construccion, despliegue, contenedores, entorno |
| `automation-bot` | sonnet | Automatizacion de navegador y procesos desatendidos |
| `docs-writer` | haiku | README, CHANGELOG, CLAUDE.md |
| `git-manager` | sonnet | Ramas, commits, sincronizacion, pull requests, versiones y conflictos |

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
arrancar; y `decisions.md`, que lee el `tech-lead` antes de disenar. La consecuencia practica es
que mejorar esa ficha mejora a todos los agentes a la vez.

## De donde sale el contexto de cada proyecto

**En un proyecto que ya existe**, `/onboard` lo deduce leyendo el codigo: manifiestos de
dependencias, archivos de configuracion, estructura de carpetas y el propio codigo. De ahi salen
el lenguaje y framework del servidor, la tecnologia de interfaz, el motor de base de datos, los
comandos reales de construccion, ejecucion y prueba, y las convenciones que sigue el proyecto.
Lo que no se puede deducir —si el proyecto esta activo, donde se despliega, que partes son
delicadas— te lo pregunta. Cuando un dato no se averigua, se escribe "desconocido": un dato
inventado en la ficha se propaga a todos los agentes.

`/onboard` anota ademas en `decisions.md` las decisiones de arquitectura que ya estan tomadas y
condicionan el proyecto. Muchas veces su motivo no esta escrito en ninguna parte y solo lo sabe
quien lo hizo: en ese caso se anota la decision y se marca el motivo como desconocido, porque una
decision sin motivo conocido es justo la que alguien deshace sin querer.

**En un proyecto nuevo** no hay nada que leer, asi que el flujo se invierte: `/kickoff` te pregunta
que vas a construir y para quien, el equipo **propone** stack y estructura justificando cada
eleccion y diciendo que descarto, tu decides, y solo entonces se crea el esqueleto. Tanto la ficha
como las decisiones se escriben a partir de lo acordado, que es el unico momento en que el motivo
de cada eleccion esta fresco.

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
haga la proxima vez — el defecto que aparecio dos veces, el supuesto que resulto equivocado. Si la
tarea fijo una decision de arquitectura que seguira vigente, va a `decisions.md`; y en cualquier
caso deja su fila en `tasks/index.md`.

Lo que hace que esto sirva es la disciplina de **no anotarlo todo**. Esa seccion la leen todos los
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
├── context.md              # estado actual: stack, comandos, trampas, lecciones
├── decisions.md            # decisiones de arquitectura vigentes y su motivo
├── audits/<fecha>/         # historia: linea base, informes por capa y report.md de cada /audit
├── redesign/<fecha>/       # historia: capturas, diagnostico, prototipos y plan de cada /redesign
├── uitest/<fecha>/         # historia: cobertura, fallos con reproduccion y report.md de cada /uitest
└── tasks/
    ├── index.md            # una linea por tarea: fecha, nombre, que hizo, estado
    └── <slug>/             # historia: foto del momento, no se actualiza
        ├── spec.md         # que se pide y criterios de aceptacion
        ├── design.md       # decision de arquitectura
        ├── contract.md     # endpoints, esquemas, tipos
        ├── ui.md           # especificacion visual, si la tarea toca pantallas
        ├── mockup.html     # prototipo navegable para aprobar antes de implementar
        ├── findings/       # un informe por especialista
        └── log.md          # bitacora de cierre
```

**Lo que esta vivo y lo que es historia.** El codigo, `context.md` y `decisions.md` describen el
proyecto de hoy y se mantienen al dia. Todo lo que hay dentro de `tasks/<slug>/` es una foto del
momento y no se actualiza nunca: sirve para saber que se decidio entonces y por que, jamas para
saber como funciona algo ahora. Un contrato de hace ocho meses no lleva ningun aviso de estar
obsoleto, y esa es la trampa.

**El historial no encarece las sesiones.** Las carpetas de tareas no se cargan en contexto: los
agentes leen `context.md` y la tarea en curso, nada mas. Puedes acumular doscientas tareas sin que
el coste por sesion cambie. El riesgo no es el peso, sino que con veinte tareas los nombres de
carpeta dejen de decir nada; para eso esta `tasks/index.md`, que `/standup` usa para buscar en
lugar de abrir carpetas a ciegas.

## Modificar el equipo

Edita los archivos de `plugins/devteam/` y confirma el cambio. Los agentes se recargan al abrir
una sesion nueva. La maquina donde vive el repositorio tiene el marketplace registrado como
directorio local, asi que ahi los cambios se ven sin pasar por GitHub; las demas consumen la
version publicada y la traen con `marketplace update` y `plugin update`.

**Sube la version en cada publicacion, o los cambios no llegaran a las demas maquinas.** Claude Code
guarda una copia del plugin en una carpeta con su numero de version, y `plugin update` solo la
renueva cuando ese numero cambia. Si publicas cambios sin tocar `version` en
`plugins/devteam/.claude-plugin/plugin.json`, las otras maquinas creen que ya estan al dia y se
quedan con la copia vieja. Despues de subir la version, etiqueta y publica:

```bash
claude plugin tag plugins/devteam --push
```

Dos cosas que conviene respetar al modificarlo:

- **No incrustes contexto de un proyecto concreto en un agente.** Si hace falta que sepa algo del
  proyecto, va en su `context.md`, no en el prompt.
- **No crees agentes por tecnologia.** Un agente por framework reintroduce el problema que la
  fusion de `frontend` y `backend` vino a resolver.

Lo que mas conviene ajustar con el uso son los `description` de los agentes: son lo unico que la
sesion principal lee para decidir a quien convocar. Si un especialista no se convoca cuando
deberia, el problema casi siempre esta ahi.
