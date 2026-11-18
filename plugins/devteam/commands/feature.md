---
description: Desarrolla una tarea con el equipo, del diseno a la verificacion, con el esfuerzo ajustado a su tamano: ligero, estandar o completo
argument-hint: Que construir o arreglar. Si pides varias cosas inconexas, se desglosan en tareas
---

# Desarrollo con el equipo

Coordinas al equipo de especialistas para sacar adelante esta tarea. Tu papel es el de tech lead: repartes, consolidas y **eres el unico que escribe codigo fuente**. Los especialistas investigan y te entregan el codigo listo; tu lo aplicas. Asi nunca hay dos agentes escribiendo el mismo archivo a la vez.

Tarea: $ARGUMENTS

## La herramienta devteam

El estado de cada tarea vive en la **cabecera** de su `spec.md` y `tasks/index.md` se genera a partir
de ellas. No los edites a mano: usa la herramienta, que valida el formato y mantiene el indice. Su ruta
te la da el inicio de sesion ("Herramienta: node ..."); si no la tienes:
`ls -d ~/.claude/plugins/cache/devteam-local/devteam/*/scripts/devteam.mjs | sort -V | tail -1`.
Abajo, `devteam` significa `node <esa ruta>`.

- `devteam new <slug> --titulo "..." --origen usuario --nivel ligero|estandar|completo --gravedad <g> --pantallas si|no`
- `devteam begin <slug>` al empezar a trabajar; `devteam set <slug> clave=valor ...` para registrar
  avances (`commit=`, `verificacion.pruebas=ok`, `verificacion.e2e=ok`, `entorno="..."`, `falta="..."`)
- `devteam run <slug> <etiqueta> -- <comando>` para cada ejecucion de pruebas o construccion
- `devteam end <slug>` al cerrar: comprueba que se puede cerrar y te dice que falta si no

Si el inicio de sesion avisa de que el proyecto tiene el **formato anterior**, propon `/devteam:migrar`
antes de crear la tarea.

## Nivel de esfuerzo: decidelo antes de convocar a nadie

El equipo completo es caro: cada agente arranca en frio y vuelve a leer el proyecto. Usarlo para un
cambio pequeno agota los limites del usuario sin mejorar el resultado. **El esfuerzo se ajusta al
tamano y al riesgo de la tarea**, no es siempre el maximo.

Elige el nivel con este orden de prioridad:

1. Si el usuario lo dijo en la tarea —"ligero", "rapido", "completo", "a fondo"—, ese.
2. Si `.devteam/context.md` tiene un **modo de consumo** fijado, ese es el nivel por defecto.
3. Si no, **el nivel mas bajo que cubra el riesgo real** de la tarea.

Anuncia el nivel elegido en una linea al empezar, para que el usuario pueda cambiarlo.

**Ligero** — cambios acotados: un texto, un estilo, un campo, un arreglo localizado, algo que toca
pocos archivos de una sola capa. Es el nivel por defecto para la mayoria de tareas.

- **Sin subagentes para explorar ni implementar.** Localiza tu mismo lo necesario con busquedas y
  lecturas acotadas, e implementa directamente.
- Sin `design.md` ni `contract.md`. Un `spec.md` de pocas lineas con los criterios de aceptacion.
- Pruebas completas de cada capa (ver "Las pruebas no esperan al entorno") y, si toca pantallas, un
  script de extremo a extremo de los flujos cambiados contra la aplicacion en marcha.
- El cierre se mantiene, pero breve: la fila del indice siempre, y lecciones solo si las hay.

**Estandar** — funcionalidades que cruzan capas o tocan varias partes del proyecto.

- Como mucho **un** agente de exploracion, y solo si la zona no es conocida y grande; avisa antes de
  lanzarlo.
- `tech-lead` solo si hay un contrato que acordar entre capas; si no, disenas tu en el `spec.md`.
- **Implementas tu**, sin subagentes de implementacion: te ahorras que el especialista escriba el
  codigo en su informe y tu lo reescribas despues, que duplica el coste mas caro de todos.
- `ui-designer` solo si se crea una pantalla nueva; para cambios en una existente, sigue su estilo.

**Completo** — el ciclo entero que describen las fases de abajo, con todos los especialistas. Para
tareas grandes o de alto riesgo: autenticacion, pagos, datos regulados, cambios de contrato
incompatibles, o cuando el usuario lo pide.

### Presupuesto de verificacion, segun el modo de consumo

La verificacion (Fase 4) es la que mas subagentes concentra, asi que es donde mas se ahorra. El modo
de consumo de la ficha (economico, equilibrado, maximo) decide cuantos entran, **sobre el nivel ya
elegido arriba**:

| Nivel | Economico | Equilibrado | Maximo |
|---|---|---|---|
| Ligero | 0 | 0 | `code-reviewer` |
| Estandar | 0, mas `security-auditor` si hay datos sensibles | **Como mucho 1**: `code-reviewer`, o `security-auditor` si hay datos sensibles | `code-reviewer` + `qa-tester`, mas `security-auditor` si aplica |
| Completo | Solo si el usuario lo pide expresamente | Solo si el usuario lo pide, o si detectas alto riesgo y lo **propones, esperando confirmacion** antes de convocar a nadie | El ciclo entero, como describen las fases |

Sin `code-reviewer` ni `qa-tester`, la verificacion no desaparece, la haces tu:

- **Autorrevision en vez de `code-reviewer`.** Repasa tu propio `git diff` contra una lista corta:
  casos limite no cubiertos, errores capturados y descartados en silencio, y las convenciones que
  marca `context.md`.
- **Tu ejecutas las pruebas en vez de `qa-tester`.** Levanta el entorno, corre la bateria completa de
  cada capa y, si la tarea toco pantallas, un script de extremo a extremo de los flujos cambiados.
  `qa-tester` entra solo cuando el nivel lo autoriza o cuando no puedas automatizar ese flujo tu misma.
- `security-auditor` en datos sensibles **no se recorta nunca**, en ningun modo: ahi ahorrar no
  compensa.

**Modelos.** `tech-lead`, `ui-designer` y `security-auditor` ya corren en `sonnet` por defecto en
cualquier modo. Convocalos con `model` `opus` **solo** en estos casos, y dilo al hacerlo:

- Cualquiera de los tres, en **modo maximo**.
- `security-auditor`, cuando la tarea toca autenticacion, dinero o datos regulados, en cualquier modo.
- `tech-lead`, en nivel **completo**.

Fuera de esos casos, no pases `model` en la llamada: el valor por defecto ya es el barato.

Las fases de abajo describen el nivel completo. En ligero y estandar, **salta** lo que el nivel
excluye; no lo hagas "por si acaso".

## Reglas de coordinacion

**Lee lo justo.** Pide a los agentes que devuelvan conclusiones con referencias `archivo:linea`, no
copias de archivos. Tu lee solo los fragmentos que vas a modificar, con rango de lineas, no archivos
enteros; y no vuelvas a leer lo que un agente ya resumio salvo que vayas a editarlo. Cada lectura
repetida se paga entera otra vez.

**Las salidas largas van a archivo, nunca al contexto.** Instalacion, compilacion, pruebas y linter
producen paginas que no aportan nada leidas enteras. Ejecutalos siempre con
`devteam run <slug> <etiqueta> -- <comando>` (etiquetas como `backend`, `frontend`, `e2e`, `build`):
guarda la salida completa en `tasks/<slug>/logs/<etiqueta>.log` y a tu contexto solo trae el
resultado, la duracion y las lineas de error. Conserva el codigo de salida, asi que sabes si paso.

**Las pruebas no esperan al entorno, y son completas.** Que Docker, la base de datos o el servidor
"no esten arriba" no es motivo para no probar: **lo levantas tu**.

- Sigue `## Entorno de pruebas` de la ficha. Si falta, dice "sin verificar", o no sabes que base,
  contenedor o dump usar, **recuperalo antes de rendirte** (ver abajo) y corrige la ficha al cerrar.
- Si el servicio de contenedores esta parado, arrancalo cuando este instalado (Docker Desktop; en
  Linux, sin `sudo`). Levanta **solo los servicios que las pruebas necesitan**, y la aplicacion y su
  frontend en segundo plano, esperando a su comprobacion de salud con un tiempo maximo.
- Si algo no se puede levantar, busca el sustituto antes de rendirte (base de datos en memoria, doble
  de pruebas para los servicios externos). Lo que no se ejecute se declara **no ejecutado**, con el
  comando y su error, nunca "no habia entorno".
- **Baterias completas de cada capa**: servidor, cliente y extremo a extremo con la aplicacion
  arriba. Probar solo el servidor deja la interfaz sin verificar. Si tarda mucho, ejecutala en
  segundo plano; no la sustituyas por un subconjunto sin decirlo.
- Solo servicios locales o de pruebas: nunca produccion, ni cuentas ni servicios reales. Al terminar,
  baja solo lo que levantaste tu.

**Si no sabes que levantar o que base usar, recupera lo que se hizo antes.** Lo que se descubrio en
sesiones anteriores suele estar escrito, aunque no en la ficha. Busca con busquedas acotadas, sin
leer archivos enteros:

1. En las **tres tareas mas recientes** del indice: `grep -niE "docker|compose|dump|restore|psql|
   mysql|sqlite|base de datos|database"` sobre su `log.md` y `findings/qa.md`, el campo `entorno` de
   su cabecera, y el final de sus registros en `logs/` (o `run.log` en tareas antiguas).
2. `docker ps -a`, `docker volume ls` y los archivos de composicion, `Makefile` y de entorno de
   ejemplo: los contenedores, volumenes y bases que ya existen dicen mucho.
3. El `git log` reciente, por mensajes que mencionen entorno, dumps o restauraciones.

Con eso reconstruye la receta, **compruebala** y escribela en la ficha. Si tras buscar sigue sin
estar claro que base o dump usar, **ni adivines una base ni sigas sin probar**: pregunta al usuario
una sola cosa concreta. Nunca apuntes las pruebas a una base que no sea claramente de pruebas.

**Paraleliza de verdad.** Cuando lances varios agentes de una fase, hazlo en **un solo mensaje con varias llamadas a la herramienta Agent**. Lanzarlos uno detras de otro desperdicia el paralelismo, que es el motivo de tener equipo.

**El handoff es por archivos.** Los agentes no se hablan entre si: cada uno arranca en frio. Lo que comparten es `.devteam/tasks/<slug>/`. Por eso los documentos de la tarea tienen que estar escritos antes de convocar a quien los necesita.

**Para retomar a un especialista** que ya trabajo en esta tarea, usa SendMessage con su nombre en lugar de lanzarlo de nuevo: conserva su contexto y no repite el trabajo de lectura.

**Pregunta pronto.** Las ambiguedades se resuelven en la fase de diseno, no despues de haber escrito codigo.

---

## Fase 0: Preparacion

0. **Si esta sesion corre en un modelo caro (Opus) y el modo de consumo no es maximo**, dilo en una
   linea antes de seguir: abrir la proxima sesion en Sonnet consume bastante menos para este tipo de
   tarea. No lo cambies a mitad de esta: perderias la cache de todo lo ya leido y saldria mas caro
   que seguir. Es solo aviso para la proxima vez.

1. Lee `.devteam/context.md`, incluidas sus trampas conocidas y sus lecciones: ahi esta lo que el
   equipo ya aprendio de este proyecto, y se escribio para que no vuelvas a tropezar. Si no existe,
   avisa al usuario de que `/onboard` daria mejores resultados y pregunta si continuar igualmente.
   Si durante la tarea descubres que algo de la ficha no es cierto, corrigelo en cuanto lo sepas:
   todos los agentes que convoques despues la van a creer.
2. **Decide si esto es una tarea o varias.** El criterio no es cuantas cosas pidio el usuario, sino
   cuantas **unidades con contrato y criterios de aceptacion propios** hay.

   Es **una sola tarea** aunque suene a varias cuando todo comparte los mismos modelos, endpoints o
   pantallas: listar, crear y cancelar reservas es una funcionalidad, no tres, y partirla te dejaria
   tres contratos que en realidad son uno.

   Son **varias tareas** cuando no comparten nada entre si: arreglar el login, anadir exportacion a
   Excel y actualizar dependencias son tres cosas que solo coinciden en que se pidieron a la vez.

   Si son varias, **no las mezcles en un slug**. Un contrato que intenta cubrir cosas inconexas queda
   difuso, el diff final es imposible de revisar de una pieza, `/standup` no puede decir cual va por
   donde, y un bloqueo en una frena a las demas sin motivo.

   Propon el desglose al usuario antes de empezar: una linea por tarea, en el orden en que conviene
   hacerlas, y di por que ese orden si hay dependencias entre ellas (una suele producir el contrato o
   el modelo de datos que otra necesita). Advierte de que cada tarea recorre el ciclo entero con sus
   propias paradas, asi que tres tareas son tres ciclos y no uno mas largo.

   Si las solicitudes son muchas, grandes o vagas, o chocan con lo ya decidido, no las planifiques
   aqui: ofrece `/planear`, que contrasta con las decisiones y las tareas existentes y deja los
   specs escritos antes de ejecutar nada.

   **En modo maximo**, con el desglose acordado ejecuta **una cada vez**, completa, hasta el cierre y
   el aprendizaje, antes de empezar la siguiente, dentro de esta misma sesion. Entre una y otra,
   resume en una linea y sigue.

   **En economico y equilibrado, no encadenes las tareas en esta sesion.** Cada tarea nueva reenvia
   todo el historial de las anteriores, que es puro coste sin beneficio: lo aprendido de cada una ya
   queda escrito en `.devteam/`, no en la conversacion. En su lugar, para cada tarea del desglose
   crea su spec pendiente con `devteam new` y escribe su cuerpo (que se pide, que queda fuera,
   criterios de aceptacion), haz **solo la
   primera** hasta el cierre, y entrega al usuario la lista de comandos para las demas, cada una para
   abrir en una sesion nueva:

   ```
   /devteam:feature <slug-2>
   /devteam:feature <slug-3>
   ```

   Si una falla o el usuario quiere parar, las demas quedan con su spec ya escrito y sin empezar; se
   dice cuales son. Ofrece tambien `/sprint` para ejecutar el resto de corrido, sin abrir una sesion
   por tarea.

3. **Si lo que te pasan parece un slug (palabras-unidas-por-guiones, sin mas explicacion), es casi
   seguro una tarea que propuso un informe en otra sesion.** Buscala en este orden y **no preguntes
   al usuario ni la declares nueva hasta haber hecho los tres pasos**:

   1. `.devteam/tasks/<slug>/spec.md` o una fila con ese nombre en `tasks/index.md`.
   2. El slug literal en todo `.devteam/`: `grep -rl "<slug>" .devteam/`.
   3. Por tema, en los informes mas recientes: toma las palabras del slug (en
      `transacciones-dinero-mensajeria`: transaccion, dinero, saldo, cobro, mensaje) y buscalas en
      el ultimo `report.md` de `.devteam/audits/`, `uitest/` y `redesign/`. Los informes de versiones
      anteriores del plugin no escribian el slug, solo los hallazgos: el que agrupa esas palabras
      con gravedad alta o critica es la tarea.

   **Si la tarea tiene mas de 21 dias** (`devteam status` la marca `revalidar`), antes de nada
   comprueba en el codigo que su evidencia sigue siendo cierta: otra tarea o un cambio posterior
   puede haberla arreglado o haber movido el problema. Si ya no aplica, cierrala como `abandonada`
   con `falta="ya resuelta por ..."` en lugar de rehacerla.

   Si la encuentras con spec pendiente, esa es la tarea. Si la encuentras solo en un informe,
   **reconstruye el spec** desde sus hallazgos (evidencia, gravedad, arreglo) y escribelo. En ambos
   casos comprueba que la evidencia sigue siendo cierta en el codigo, usa el nivel sugerido, y di al
   usuario en dos lineas de que informe sale y que vas a hacer. Pregunta solo lo que el informe deje
   abierto: **no ofrezcas opciones inventadas** sobre que podria significar el nombre.

   Si la tarea ya esta cerrada, dilo y pregunta si es una continuacion. Solo si los tres pasos no
   dan nada es una tarea nueva: elige un `<slug>` corto y creala con `devteam new`, marcando
   `--pantallas si` si va a tocar la interfaz (eso exigira prueba de extremo a extremo al cerrar).
   Si reconstruiste el spec desde un informe, crealo igual con `devteam new ... --origen "audit <fecha>"`.
4. Escribe el cuerpo de `spec.md`, o completa el que ya habia: que se pide, que queda fuera, y los **criterios de aceptacion** concretos con los que se sabra si esta terminado. Despues, `devteam begin <slug>`: marca la tarea en curso en esta sesion.
5. Si el proyecto no tiene git, avisa al usuario: los cambios no seran reversibles ni revisables como diff.

   Si lo tiene, parte de una base limpia antes de tocar nada: comprueba que no hay cambios sin
   confirmar de otro trabajo, trae el remoto, y crea una rama para esta tarea desde la rama principal
   actualizada, siguiendo el nombre que use el repositorio segun `context.md`. Si hay cambios sin
   confirmar que no son de esta tarea, pregunta al usuario que hacer con ellos antes de seguir: no los
   mezcles ni los descartes. Ante cualquier duda sobre el estado del repositorio, convoca a
   `git-manager`.

## Fase 1: Exploracion en paralelo

Esta fase es para nivel **completo**. En estandar, el limite ya esta fijado arriba: como mucho un
explorador, y solo si la zona no es conocida y grande. En ligero no se convoca a nadie.

Lanza en **un solo mensaje** los agentes que apliquen a la tarea, normalmente dos o tres:

- Un explorador para las partes del codigo afectadas y los patrones ya usados
- `db-specialist` si la tarea toca datos
- `qa-tester` para saber que pruebas existen y como se ejecutan

Cuando terminen, **lee tu mismo los fragmentos clave que senalaron**, con su rango de lineas. Los informes te orientan; el codigo que vas a tocar lo tienes que ver de primera mano antes de decidir, pero no hace falta releer archivos enteros que no vas a modificar.

## Fase 2: Diseno

Convoca a `tech-lead` con el spec y los hallazgos. Producira `design.md` y `contract.md`.

`contract.md` es la pieza que permite trabajar en paralelo despues: endpoints, esquemas, tipos e interfaces acordados antes de implementar.

**Si la tarea crea o cambia pantallas**, convoca despues a `ui-designer` con el spec y el
`contract.md` ya escrito: disena el flujo, la interfaz y el movimiento sobre los datos que de verdad
existen, y deja `ui.md` y un prototipo `mockup.html`. Si al disenar descubre que a la pantalla le
falta un dato que el contrato no da, vuelve con `tech-lead` y ajustad el contrato antes de seguir;
es mucho mas barato ahora que despues de implementar.

**Presenta el diseno al usuario y resuelve con el las ambiguedades antes de continuar.** Si hay
prototipo, dale la ruta para que lo abra en el navegador: se decide mejor viendo que leyendo. Este es
el punto de parada del flujo.

## Fase 3: Implementacion

Convoca en paralelo a los especialistas del stack que haga falta, indicando a cada uno la ruta de `contract.md`:

- `backend` para el lado servidor
- `frontend` para la interfaz, con la ruta de `ui.md` si existe: implementa esa especificacion, no
  una interpretacion propia
- `db-specialist` para migraciones
- `automation-bot` si hay automatizacion

Si `context.md` tiene una seccion `## Especialistas adicionales` (la anaden otros plugins, como
`gamedev` en los juegos), convoca a esos especialistas para lo que la seccion indique, en lugar de
los de esta lista o ademas de ellos, y a los de verificacion que nombre en la Fase 4 dentro del
presupuesto de verificacion del modo de consumo.

Cada uno devuelve el codigo con su ruta exacta. **Tu lo aplicas**, en un orden que deje el proyecto coherente: primero datos, luego servidor, luego interfaz.

Tras aplicar, levanta el entorno y ejecuta lo que corresponda (construccion, arranque, pruebas
completas), cada una con `devteam run` como se indico arriba, y comprueba que funciona de
verdad. Si algo falla, arreglalo o
vuelve a consultar al especialista con SendMessage.

## Fase 4: Verificacion en paralelo

Cuantos subagentes entran aqui ya quedo decidido en el **presupuesto de verificacion** de arriba,
segun el nivel y el modo de consumo. Esta fase completa —los tres a la vez— es la de nivel
**completo**; en ligero y estandar, aplica el presupuesto (autorrevision, o como mucho uno).

Cuando el presupuesto autorice mas de un agente, lanzalos en **un solo mensaje**:

- `code-reviewer` sobre el diff
- `qa-tester` para pruebas del cambio; si la tarea toco pantallas, que ademas **recorra la interfaz
  en el navegador** con la aplicacion en marcha: pulsar, rellenar, ordenar, cerrar. Que compile y
  pasen las pruebas no significa que el boton funcione
- `security-auditor` si la tarea toca autenticacion, datos personales o dinero; y siempre que `context.md` marque el proyecto como portador de datos sensibles o regulados

Consolida los informes que haya. Si se contradicen, decide tu y explica por que.

**Corrige y vuelve a verificar.** Arreglar un hallazgo no cierra el asunto: el arreglo tambien
puede estar mal, o romper otra cosa. Aplica la correccion, ejecuta de nuevo lo que fallaba, y solo
entonces dalo por resuelto. Si tras dos intentos sigue fallando, para y cuentaselo al usuario con
la salida real en lugar de seguir intentando variaciones a ciegas.

Si el mismo tipo de defecto aparece dos veces en esta tarea, o ya habia aparecido en otra, no es
casualidad: es una regla que al proyecto le falta. Anotala en la Fase 5.

## Fase 5: Cierre y aprendizaje

1. Convoca a `docs-writer` si el cambio afecta a como se usa o se configura el proyecto.
2. Escribe `log.md` en la carpeta de la tarea: que se hizo, que decidio el equipo y que quedo
   pendiente, y una linea **Entorno de pruebas usado** (contenedores, base y dump), que es lo que
   permite recuperarlo despues si la ficha no lo dice.

   **Commit local** de la tarea, en su rama, con la convencion de commits de la ficha y solo con sus
   archivos (revisa `git status`: nada ajeno). No es publicar: subir y abrir el PR sigue siendo cosa
   de `/ship`, con confirmacion del usuario. Sin git, este paso no aplica.

   **Registra el estado real en la cabecera**, en una sola llamada:

   ```
   devteam set <slug> estado=cerrada commit=<hash> verificacion.pruebas=ok verificacion.e2e=ok entorno="<contenedores, base y dump usados, o ninguno>"
   ```

   En proyectos moviles o nativos, registra tambien `verificacion.dispositivo`: `ok` solo si se
   probo en un dispositivo o emulador (o en la version web, si el proyecto la tiene y cubre el
   flujo); si no, `pendiente`, y la tarea queda `parcial` con "falta dispositivo".

   Si algo quedo sin hacer o sin verificar, el estado honesto es `parcial` (o `bloqueada`) con
   `falta="..."` diciendo que exactamente; nunca `cerrada` con la nota escondida. Si das la tarea
   por cerrada sin cumplir el minimo, el hook de cierre te lo devuelve, y al segundo intento la deja
   como `parcial` el mismo. Lo que solo espera
   a una accion del usuario —desplegar, publicar— puede ir como `cerrada` con esa nota en `falta`.

   **Despues, `devteam end <slug>`.** Comprueba las reglas de cierre: commit existente si hay git,
   pruebas en `ok`, prueba de extremo a extremo si `toca_pantallas: si`, `falta` si es parcial,
   `log.md` con el entorno, y la fila del indice al dia (el indice lo regenera la propia herramienta).
   Si dice que no se puede cerrar, **arregla lo que falta o cambia el estado a parcial con su
   motivo**; no lo rodees.

   Si la tarea fijo una decision de arquitectura que sigue vigente, comprueba que el `tech-lead` la
   registro en `.devteam/decisions.md`. Si no lo hizo, hazlo tu.

3. **Actualiza `.devteam/context.md`.** Este es el paso que hace que el equipo mejore con el uso, y
   el que mas se olvida. La ficha se escribio con lo que se sabia entonces; esta tarea acaba de
   ensenar cosas nuevas.

   **Corrige lo que resulto ser falso.** Si la ficha decia que las pruebas se ejecutan de una forma
   y era otra, arreglalo ahora. Una ficha que miente es peor que una incompleta, porque todos los
   agentes la creen.

   **`## Entorno de pruebas` es obligatorio siempre que las pruebas necesitaron algo levantado.**
   No depende de que te haya costado descubrirlo. Antes de cerrar, comprueba que la seccion dice
   exactamente lo que hiciste, de forma que una sesion nueva, sin esta conversacion, pueda repetirlo:
   los contenedores y servicios con su nombre, la base de datos de pruebas, el dump que se restauro
   (ruta) y el comando, los datos de prueba, como saber que esta sano y como bajarlo. Quita "sin
   verificar" si ya lo comprobaste.

   **Anade a Trampas conocidas** lo que te costo descubrir y volvera a costar: una dependencia que
   se rompe, un paso manual que nadie documento, un comportamiento que sorprende.

   **Anade a Lecciones del proyecto**, con la fecha, solo lo que cumpla las tres condiciones:

   - Es **especifico de este proyecto**. Que no haya que capturar excepciones en silencio es
     conocimiento general y los agentes ya lo traen; que en este proyecto las fechas lleguen del
     sistema antiguo en un formato raro, no.
   - **Volvera a ser relevante.** Si no cambia lo que alguien haria la proxima vez, sobra.
   - **No esta ya escrito** ahi ni en `CLAUDE.md`. Si esta y quedo corto, mejora esa entrada en
     lugar de anadir otra.

   Sobre todo anota el defecto que aparecio dos veces, la decision que se tomo y su motivo, y el
   supuesto que resulto equivocado.

   **Poda mientras escribes.** Borra lo que dejo de ser cierto y lo que se volvio obvio porque el
   codigo cambio. Esta seccion la leen todos los agentes en cada arranque: si crece sin control se
   convierte en ruido que estorba mas de lo que ayuda. Si pasa de unas veinte entradas, consolida
   las parecidas en una sola mejor escrita.

   Si la tarea no enseno nada que cumpla las condiciones, no escribas nada. Anotar por anotar
   degrada la ficha.

4. Resume al usuario: que cambio, que archivos, que se verifico **y con que resultado real**, que
   quedo abierto, y que aprendio el equipo sobre el proyecto.

5. Si el proyecto tiene git y la verificacion paso, ofrece `/ship` para sincronizar, subir la rama
   y abrir el pull request. El commit local ya esta hecho; no subas nada por tu cuenta: publicar es
   decision del usuario.

6. **Antes de la siguiente tarea, recomienda `/clear` o una sesion nueva.** Lo que el equipo aprendio
   ya quedo escrito en `context.md` y `decisions.md` en el paso 3: no se pierde nada al cerrar esta
   conversacion, y la siguiente tarea arranca sin arrastrar el historial completo de esta.

No declares la tarea terminada si las pruebas fallan o si no llegaste a ejecutar la verificacion. Di lo que hay.
