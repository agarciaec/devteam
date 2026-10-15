---
description: Para cuando hay muchas tareas pendientes y no puedes estar delante: el equipo organiza y recomienda todo el plan, tu lo apruebas de una vez y despues trabaja solo, saltando y reportando lo que no pueda avanzar
argument-hint: Normalmente vacio, el equipo decide que tareas, en que orden y cuantas. Opcional, para forzarlo, slugs concretos, "criticas", "altas", "auditoria" o "max N"
---

# Sprint: tareas pendientes de corrido

Este comando es para cuando hay **muchas tareas por completar y el usuario no puede estar pendiente
todo el rato**. Tu trabajo empieza antes de ejecutar nada: **organizar, dimensionar y recomendar el
plan entero** con tu mejor criterio, para que el usuario solo tenga que aprobarlo, no disenarlo.
Despues lo ejecutas sin interrumpirle. Lo que no pueda avanzar se salta, se documenta y se reporta
al final. El objetivo es cerrar tantas tareas como se pueda.

**Sin argumentos es el uso normal**, y significa "decide tu": que tareas entran, en que orden, con
que nivel de esfuerzo, cuantas caben en esta tanda y cuales conviene dejar fuera. Los argumentos solo
sirven para forzar una eleccion concreta; el usuario no tiene que saber que existen.

Argumentos recibidos (puede estar vacio): $ARGUMENTS

## Como se reparte el trabajo

**Tu orquestas y no lees codigo.** Si implementaras todas las tareas tu, tu contexto creceria con
cada una y la decima pagaria el historial de las nueve anteriores. En su lugar:

- Cada tarea la implementa un subagente **`implementer`** nuevo, que arranca limpio y te devuelve un
  informe corto. Tu contexto solo crece con esos informes.
- **Un solo implementador a la vez, en serie.** Es la excepcion a la regla de que solo la sesion
  principal escribe codigo, y es segura por la misma razon que la regla: nunca hay dos escritores.
  Las tareas no se paralelizan.
- Los especialistas de analisis (`tech-lead`, `ui-designer`, `code-reviewer`, `security-auditor`)
  entran por tarea segun su nivel y el modo de consumo, como en `/feature`. Dentro de una tarea,
  los de analisis si pueden ir en paralelo entre si.

**Nada de lo que hagas publica.** Solo commits locales. No hay `push`, `merge` ni PR; eso lo decide
el usuario despues con `/ship`.

---

## Fase 0: Inventario

1. Lee `.devteam/context.md`: modo de consumo, convenciones de commits y ramas, y si hay datos
   sensibles. Si no existe, para y propon `/onboard` primero.
2. **Si hay un `.devteam/runs/<fecha>/run.md` sin terminar**, ofrece reanudarlo desde la primera
   tarea no cerrada en lugar de empezar otro sprint. Es lo que permite continuar si se agotaron los
   limites a mitad.
3. **Reune las tareas candidatas**: las filas **pendiente** o **parcial** de
   `.devteam/tasks/index.md` y las carpetas `tasks/*/spec.md` con estado pendiente. Si el usuario
   paso argumentos, aplicalos como filtro: slugs concretos, `criticas` o `altas` (por gravedad),
   `auditoria` (solo las que vienen de un informe), `max N` (las N primeras tras ordenar). Sin
   argumentos, todas son candidatas y **decides tu** cuales entran.
4. **Lee solo la cabecera de cada spec**: origen, gravedad, nivel sugerido, dependencias y preguntas
   abiertas. No abras los informes de origen ni el codigo: eso es trabajo del implementador.
5. **Clasifica cada candidata** en uno de estos grupos. Es la parte donde se nota si organizas bien:

   - **Entra en el sprint**: es trabajo de codigo, esta bien especificado y es ejecutable sin
     personas. Es el caso normal.
   - **Entra, con una decision previa**: tiene preguntas abiertas o riesgo, pero el usuario puede
     resolverlas en la ronda de preguntas de la Fase 1.
   - **Fuera, con motivo y con el comando que si sirve**. Dejala fuera, y di que hacer con ella:
     - *No es trabajo de codigo*: publicar, subir un respaldo remoto, desplegar, abrir una cuenta,
       un tramite manual. Eso es `/ship`, `/release` o algo que solo puede hacer el usuario.
     - *Necesita lo que el sprint no puede dar*: credenciales reales, acceso a produccion, una
       decision de negocio que no esta escrita en ningun sitio. Entrara cuando la desbloquee.
     - *Depende de otra que queda fuera*: no se puede ejecutar antes.
     - *Alto riesgo e irreversible* (migracion que borra datos, cambio de autenticacion o de dinero
       sin contrato): proponla aparte, con el ciclo completo y el usuario delante.
   - **Probablemente ya resuelta**: otra tarea o un commit posterior la arreglo. Entra, pero el
     implementador la cerrara sin cambios si comprueba que ya no aplica; es barato y evita duplicar.
   - **Duplicada o solapada con otra**: unifica las dos en una sola propuesta, y dilo.

6. **Ordena** las que entran: primero por dependencias (una tarea que produce el contrato o los
   datos que otra necesita va antes), despues por gravedad, y a igualdad, **las pequenas primero**:
   dan resultados antes y dejan menos trabajo a medias si se agotan los limites.
7. **Dimensiona la tanda.** Sin `max N` del usuario, tu decides cuantas caben, segun el modo de
   consumo de la ficha, y **dices por que**:

   - **Economico o equilibrado**: tandas de **3 o 4 tareas**, o de unas 2 si alguna es de nivel
     completo. Es lo que cabe sin agotar el limite semanal de un plan con limites ajustados. Las
     demas quedan **para la tanda siguiente**, ya ordenadas, listas para otro `/sprint`.
   - **Maximo**: todas las que entran, salvo que sean tantas que el sprint no se pueda reanudar con
     comodidad; en ese caso, tandas de unas 8.

   Una tanda corta que se cierra entera vale mas que una larga que se queda a medias.
8. **Estado de git.** Si el proyecto tiene git, trae el remoto (`git fetch`) y comprueba que la rama
   principal esta actualizada y el arbol limpio. Si no lo esta, no sigas por tu cuenta: lo preguntas
   en la Fase 1. **Si no tiene git**, lo avisas y exiges aceptacion explicita en la Fase 1: los
   cambios seran irreversibles, y se trabaja sin ramas ni commits.

Si no hay ninguna tarea pendiente, dilo y sugiere `/audit` o `/audit tareas`. Termina ahi. Si hay
tareas pero **ninguna entra** en el sprint, di por que cada una queda fuera y que hacer con ella:
tambien es un resultado util.

## Fase 1: La ronda unica de preguntas

Esta es la **unica interaccion** del sprint. Recoge de todas las tareas, de una vez, todo lo que un
`/feature` habria preguntado por el camino:

- las preguntas abiertas de cada spec
- ambiguedades en sus criterios de aceptacion
- tareas de **pantalla**: seguir el sistema visual existente sin prototipo previo, o saltar la parte
  visual. En el sprint no hay punto de parada para aprobar un prototipo
- migraciones que alteran o borran datos, y cambios de contrato incompatibles
- dependencias nuevas que habria que anadir
- datos de prueba o entornos que falten. **Nunca pidas secretos ni credenciales reales**: lo que los
  necesite queda bloqueado, y asi se anota
- tareas que parezcan de **alto riesgo** (autenticacion, dinero, datos regulados): si se ejecutan con
  el ciclo completo o se dejan fuera del sprint
- si el arbol de git no esta limpio, que hacer con los cambios ajenos: guardarlos en un `git stash`
  con nombre (reversible), o parar para que los confirme el usuario. Nunca los descartes ni los
  mezcles con una tarea

**Tu decides primero y el usuario aprueba despues.** Para cada una de esas cuestiones, antes de
preguntar, **elige tu la respuesta recomendada** con tu mejor criterio: la que sigue el sistema
visual existente, la mas conservadora, la que se puede revertir. El usuario no tiene que elaborar
nada: solo corregir lo que no le convenza.

Una respuesta recomendada **nunca puede autorizar algo irreversible ni inventar una regla**. Si una
cuestion es de producto, de dinero, de datos o necesita una credencial, y no hay una respuesta segura,
tu recomendacion es **saltar esa parte y reportarla**, no una apuesta.

**Presentalo asi:**

1. **El plan recomendado, primero y en pocas lineas:**
   - **Entran**, en orden, cada una con su nivel y **en una frase por que va ahi**.
   - **Quedan fuera**, cada una con su motivo y el comando que si sirve (`/ship`, `/release`, lo que
     solo puede hacer el usuario).
   - **Quedan para la tanda siguiente**, si las hay, y por que esta tanda acaba donde acaba.
   - **Las respuestas que has elegido** para las cuestiones de arriba, una linea por cada una.
   - **El coste a la vista**: cada tarea es al menos un arranque en frio del implementador mas su
     verificacion, asi que `N` tareas son bastante mas que una.
   - **Las reglas del sprint**: un commit local por tarea en su propia rama, y **nada se sube**.
2. **Una primera pregunta de aprobacion** (`AskUserQuestion`), con tres opciones y la primera como
   recomendada:
   - **Aprobar el plan tal cual** y empezar. Es lo normal: **cero preguntas mas**.
   - **Revisar las decisiones una por una**: solo entonces haces las preguntas concretas de abajo.
   - **Ajustar el plan**: el usuario indica que tareas anadir, quitar o reordenar, o cambia el tamano
     de la tanda. Rehaz el plan con eso y vuelve a presentarlo.
3. **Solo si pide revisar**, las preguntas, agrupadas en rondas seguidas de `AskUserQuestion` (hasta
   cuatro por llamada), cada una con tu respuesta recomendada como primera opcion. Pregunta solo lo
   que cambia lo que se hara; si el spec ya lo resuelve, no lo repitas.

Si hay **una unica cosa** que el plan no puede decidir por su cuenta (una decision de producto sin
respuesta segura, por ejemplo), pregunta solo esa, junto con la aprobacion, en lugar de pedir al
usuario que revise todo.

**Que guardar.** Las decisiones de cada tarea van a su `spec.md`, bajo un encabezado **Decisiones
previas (sprint <fecha>)**, tanto las que el usuario eligio como las recomendadas que aprobo sin
tocar (marcadas como "recomendada y aprobada"); el implementador las lee y mandan sobre su criterio.
El plan aprobado, lo que quedo fuera y la tanda siguiente, mas una tabla de estado, van a
`.devteam/runs/<fecha>/run.md` (si ya hay uno terminado de hoy, anade `-2`).

**A partir de aqui no preguntas nada mas hasta el informe final.** Si surge una duda a mitad, no la
resuelves preguntando: la clasificas como lo hace el implementador (decision menor, que asumes y
anotas; o decision que no te corresponde, que saltas y reportas).

## Fase 2: Ejecucion en serie

### Antes de la primera tarea: el entorno de pruebas

Con nadie delante, nadie va a levantar Docker ni el servidor por ti, y cada implementador descubriria
por su cuenta que "no habia nada arriba" y se saltaria las pruebas. Lo evitas levantandolo **una vez,
al principio**, y los implementadores lo reutilizan:

1. Levanta lo que las pruebas necesitan siguiendo `## Entorno de pruebas` de la ficha: el servicio
   de contenedores si esta parado (Docker Desktop; en Linux, sin `sudo`), solo los servicios que las
   pruebas usan, y la aplicacion y su frontend en segundo plano, esperando a su comprobacion de salud
   con un tiempo maximo. Si la ficha no lo describe, dice "sin verificar" o no sabes que base o dump
   usar, **recuperalo de las tareas anteriores** antes de rendirte: sus `log.md`, `findings/qa.md` y
   el final de su `run.log` (con `grep`, sin leerlos enteros), `docker ps -a`, `docker volume ls`,
   la composicion y el `git log` reciente. Compruebalo y **escribelo en la ficha**. Aqui no puedes
   preguntar: si sigue sin estar claro que base es de pruebas, no la adivines; salta las pruebas que
   la necesitan y reportalo.
2. **Comprueba que son solo servicios locales o de pruebas**, sin bases de datos remotas ni cuentas
   reales. Si no puedes levantar algo, busca el sustituto (base de datos en memoria, doble de pruebas)
   antes de rendirte.
3. Ejecuta la **bateria completa sobre la rama principal**, con la salida a archivo, y guarda en
   `run.md` la **linea base**: los fallos que ya existian. Es lo que permite despues distinguir una
   regresion de un fallo antiguo.
4. Anota en `run.md` **que levantaste tu**, para bajarlo al final aunque el sprint se corte, y no
   tocar lo que ya estaba corriendo.
5. **Deja la receta escrita en `## Entorno de pruebas` de la ficha ahora, no al final**: contenedores
   y servicios, base de datos de pruebas, dump y comando de restauracion, datos de prueba, como saber
   que esta sano y como bajarlo. Si el sprint se corta, la proxima sesion la encuentra.

Si tras intentarlo algo no se puede levantar, el sprint **sigue**, pero ese limite se reporta en el
informe como "no verificado" en todas las tareas que dependen de ello.

### Cada tarea

Para cada tarea, en orden, hasta el final de la lista:

### Preparar la rama

- Parte de la rama principal actualizada, con el arbol limpio, y crea la rama de la tarea con el
  nombre que use el repositorio segun `context.md`.
- Si la tarea **depende de otra ya cerrada**, parte de la rama de esa otra (ramas apiladas) y anotalo
  en `run.md`: el usuario tendra que publicarlas en ese orden.
- Si **depende de una que quedo bloqueada o parcial**, no la inicies: pasa a **no iniciada**, con
  el motivo, y sigue con la siguiente.
- Sin git, sin ramas: trabajas en el directorio tal cual.

### Diseno, solo si el nivel lo pide

Segun el nivel que sugiere el spec y el modo de consumo, como en `/feature`:

- `tech-lead` solo si hay un **contrato que acordar entre capas** (en nivel completo, siempre). Ya
  corre en `sonnet`; solo en nivel completo o modo maximo, `opus`.
- `ui-designer` solo si la tarea **crea una pantalla nueva** y el usuario eligio disenarla. Sin
  punto de parada: deja `ui.md` y el implementador lo sigue. Si no, sigue el sistema visual
  existente.
- Si ambos intervienen, en este orden: primero `tech-lead` y su contrato, despues `ui-designer`.

### Implementar

Lanza **un** `implementer` con: el slug, la rama, la ruta de su `spec.md` y de los documentos de
diseno, el modo de consumo, **como esta levantado el entorno de pruebas y la linea base de fallos**.
Recuerdale que no puede preguntar. Anota su identificador, porque lo vas a necesitar para pedirle
correcciones.

### Verificar

Aplica el **presupuesto de verificacion** de `/feature` segun nivel y modo de consumo, sin
inventar uno propio. Si autoriza agentes, convoca `code-reviewer` y/o `security-auditor` sobre el
commit de la tarea, en un solo mensaje. **La seguridad sobre datos sensibles no se recorta nunca, en
ningun modo.**

Si traen hallazgos **con un escenario concreto de fallo**, pasaselos al mismo implementador con
`SendMessage` (conserva su contexto), maximo **dos rondas**. Lo que siga sin resolverse tras dos
rondas, o lo que no traiga un escenario concreto, **no se arregla: se reporta** como hallazgo abierto.

### Registrar, antes de pasar a la siguiente

Sin leer codigo, solo con su informe:

- Actualiza la tabla de `run.md` con el estado, la rama y el commit de esa tarea. Esto es lo que
  permite reanudar el sprint.
- Actualiza su fila de `tasks/index.md` con el estado real: `cerrada`, `parcial` o `bloqueada`.
  Nunca borres una fila.
- Si el informe trae decisiones que siguen vigentes, anotalas en `decisions.md`; si trae lecciones
  que cumplen las **tres condiciones** de `/feature` (especifica del proyecto, volvera a importar,
  no esta ya escrita), anadelas a `context.md` y poda mientras escribes.
- Si el implementador no pudo commitear porque un **hook falla por algo ajeno a la tarea**:
  `git stash push -m "sprint <slug>"`, marca la tarea como **parcial** y documentalo. No saltes el
  hook.
- Vuelve a la rama principal con el arbol limpio y pasa a la siguiente.

**Si una tarea falla del todo**, no pares el sprint: registrala como bloqueada con la causa y sigue
con las demas. Solo paras si el error afecta a todas (el proyecto no compila ni en la rama
principal, no hay forma de ejecutar nada), y en ese caso se dice claramente en el informe.

## Fase 3: Informe final

Escribe `.devteam/runs/<fecha>/report.md` y resume al usuario, **de mas urgente a menos**:

1. **Resultado**: una tabla con una fila por tarea: estado, rama, commit, pruebas y verificacion.
2. **Necesita tu intervencion**: la lista consolidada de todo lo que se **salto**, cada punto con lo
   que hace falta exactamente para desbloquearlo (que decision, que dato, que accion, de quien) y a
   que tarea afecta. Es lo mas importante del informe: el sprint pudo cerrar mucho, pero esto es lo
   que lo deja a medias.
3. **Decisiones asumidas para revisar**: lo que el implementador decidio por su cuenta. Es poco
   probable que sea un error, pero el usuario no estaba delante, y conviene que lo sepa.
4. **Hallazgos de verificacion abiertos**: lo que los revisores vieron y no se resolvio en dos rondas.
5. **No iniciadas y fuera del sprint**, cada una con su motivo y con el comando que si sirve para
   ella, tal como quedo en el plan.
6. **Siguientes pasos**, en este orden: `/ship` en cada rama cerrada, **en orden** si hay ramas
   apiladas; resolver lo de "Necesita tu intervencion"; y **otro `/sprint` sin argumentos** para la
   tanda siguiente y para las parciales ya desbloqueadas. Dile cuantas tareas quedan pendientes en
   total, para que el usuario sepa cuanto camino falta.

**Antes de terminar, baja lo que levantaste tu** (lo anotado en `run.md`) y nada mas: ni lo que ya
estaba corriendo, ni volumenes o datos que no sean de pruebas.

No declares cerrada una tarea cuyas pruebas fallen o cuya verificacion no se haya ejecutado. Di
exactamente lo que hay, tarea por tarea.

Al final, recomienda empezar una **sesion nueva** antes de `/ship`: esta lleva todo el sprint.
