---
description: Ciclo completo de desarrollo con el equipo de agentes, del diseno a la verificacion
argument-hint: Que construir o arreglar. Si pides varias cosas inconexas, se desglosan en tareas
---

# Desarrollo con el equipo

Coordinas al equipo de especialistas para sacar adelante esta tarea. Tu papel es el de tech lead: repartes, consolidas y **eres el unico que escribe codigo fuente**. Los especialistas investigan y te entregan el codigo listo; tu lo aplicas. Asi nunca hay dos agentes escribiendo el mismo archivo a la vez.

Tarea: $ARGUMENTS

## Reglas de coordinacion

**Paraleliza de verdad.** Cuando lances varios agentes de una fase, hazlo en **un solo mensaje con varias llamadas a la herramienta Agent**. Lanzarlos uno detras de otro desperdicia el paralelismo, que es el motivo de tener equipo.

**El handoff es por archivos.** Los agentes no se hablan entre si: cada uno arranca en frio. Lo que comparten es `.devteam/tasks/<slug>/`. Por eso los documentos de la tarea tienen que estar escritos antes de convocar a quien los necesita.

**Para retomar a un especialista** que ya trabajo en esta tarea, usa SendMessage con su nombre en lugar de lanzarlo de nuevo: conserva su contexto y no repite el trabajo de lectura.

**Pregunta pronto.** Las ambiguedades se resuelven en la fase de diseno, no despues de haber escrito codigo.

---

## Fase 0: Preparacion

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

   Con el desglose acordado, ejecuta **una cada vez**, completa, hasta el cierre y el aprendizaje,
   antes de empezar la siguiente. Entre una y otra, resume en una linea y sigue. Si una falla o el
   usuario quiere parar, las demas quedan sin empezar y se dice cuales son.

3. Elige un `<slug>` corto para la tarea y crea `.devteam/tasks/<slug>/`.
4. Escribe `spec.md`: que se pide, que queda fuera, y los **criterios de aceptacion** concretos con los que se sabra si esta terminado.
5. Si el proyecto no tiene git, avisa al usuario: los cambios no seran reversibles ni revisables como diff.

   Si lo tiene, parte de una base limpia antes de tocar nada: comprueba que no hay cambios sin
   confirmar de otro trabajo, trae el remoto, y crea una rama para esta tarea desde la rama principal
   actualizada, siguiendo el nombre que use el repositorio segun `context.md`. Si hay cambios sin
   confirmar que no son de esta tarea, pregunta al usuario que hacer con ellos antes de seguir: no los
   mezcles ni los descartes. Ante cualquier duda sobre el estado del repositorio, convoca a
   `git-manager`.

## Fase 1: Exploracion en paralelo

Lanza en **un solo mensaje** los agentes que apliquen a la tarea, normalmente dos o tres:

- Un explorador para las partes del codigo afectadas y los patrones ya usados
- `db-specialist` si la tarea toca datos
- `qa-tester` para saber que pruebas existen y como se ejecutan

Cuando terminen, **lee tu mismo los archivos clave que senalaron**. Los informes te orientan; el codigo lo tienes que ver de primera mano antes de decidir nada.

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

Cada uno devuelve el codigo con su ruta exacta. **Tu lo aplicas**, en un orden que deje el proyecto coherente: primero datos, luego servidor, luego interfaz.

Tras aplicar, ejecuta lo que corresponda (construccion, arranque, pruebas) y comprueba que funciona de verdad. Si algo falla, arreglalo o vuelve a consultar al especialista con SendMessage.

## Fase 4: Verificacion en paralelo

Con el codigo ya aplicado, lanza en **un solo mensaje**:

- `code-reviewer` sobre el diff
- `qa-tester` para pruebas del cambio; si la tarea toco pantallas, que ademas **recorra la interfaz
  en el navegador** con la aplicacion en marcha: pulsar, rellenar, ordenar, cerrar. Que compile y
  pasen las pruebas no significa que el boton funcione
- `security-auditor` si la tarea toca autenticacion, datos personales o dinero; y siempre que `context.md` marque el proyecto como portador de datos sensibles o regulados

Consolida los tres informes. Si se contradicen, decide tu y explica por que.

**Corrige y vuelve a verificar.** Arreglar un hallazgo no cierra el asunto: el arreglo tambien
puede estar mal, o romper otra cosa. Aplica la correccion, ejecuta de nuevo lo que fallaba, y solo
entonces dalo por resuelto. Si tras dos intentos sigue fallando, para y cuentaselo al usuario con
la salida real en lugar de seguir intentando variaciones a ciegas.

Si el mismo tipo de defecto aparece dos veces en esta tarea, o ya habia aparecido en otra, no es
casualidad: es una regla que al proyecto le falta. Anotala en la Fase 5.

## Fase 5: Cierre y aprendizaje

1. Convoca a `docs-writer` si el cambio afecta a como se usa o se configura el proyecto.
2. Escribe `log.md` en la carpeta de la tarea: que se hizo, que decidio el equipo y que quedo pendiente.

   Anade tambien una linea a `.devteam/tasks/index.md`, creandolo si no existe, con este formato:

   ```
   | 2026-09-21 | reserva-cancelacion | Cancelar reservas hasta 2h antes | cerrada |
   ```

   Es el indice del proyecto: con veinte tareas, los nombres de carpeta ya no dicen nada y esta es
   la unica forma de encontrar cuando se toco algo y donde quedo escrito. Una linea por tarea, la
   mas reciente arriba, y el estado real: cerrada, parcial o abandonada. Una tarea que se dejo a
   medias se marca como parcial y se dice que falto, nunca se borra la fila.

   Si la tarea fijo una decision de arquitectura que sigue vigente, comprueba que el `tech-lead` la
   registro en `.devteam/decisions.md`. Si no lo hizo, hazlo tu.

3. **Actualiza `.devteam/context.md`.** Este es el paso que hace que el equipo mejore con el uso, y
   el que mas se olvida. La ficha se escribio con lo que se sabia entonces; esta tarea acaba de
   ensenar cosas nuevas.

   **Corrige lo que resulto ser falso.** Si la ficha decia que las pruebas se ejecutan de una forma
   y era otra, arreglalo ahora. Una ficha que miente es peor que una incompleta, porque todos los
   agentes la creen.

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

5. Si el proyecto tiene git y la verificacion paso, ofrece `/ship` para confirmar y publicar el
   cambio. No confirmes ni subas nada por tu cuenta: publicar es decision del usuario.

No declares la tarea terminada si las pruebas fallan o si no llegaste a ejecutar la verificacion. Di lo que hay.
