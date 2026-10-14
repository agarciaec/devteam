---
description: Ejecuta de corrido todas las tareas pendientes: una sola ronda de preguntas al principio y despues trabaja sin interrumpirte, saltando y reportando lo que no pueda avanzar
argument-hint: Opcional, slugs concretos, "criticas", "altas", "auditoria" o "max N" para acotar que tareas se ejecutan
---

# Sprint: tareas pendientes de corrido

Vas a ejecutar varias tareas pendientes seguidas **sin que el usuario tenga que estar presente**.
Todo lo que hubiera obligado a parar se pregunta **una sola vez, al principio**. Despues, nada de
preguntas: lo que no pueda avanzar se salta, se documenta y se reporta al final. El objetivo es
cerrar tantas tareas como se pueda.

Tareas a ejecutar: $ARGUMENTS

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
   `.devteam/tasks/index.md` y las carpetas `tasks/*/spec.md` con estado pendiente. Aplica el filtro
   de `$ARGUMENTS`: slugs concretos, `criticas` o `altas` (por gravedad), `auditoria` (solo las que
   vienen de un informe), `max N` (las N primeras tras ordenar).
4. **Lee solo la cabecera de cada spec**: origen, gravedad, nivel sugerido, dependencias y preguntas
   abiertas. No abras los informes de origen ni el codigo: eso es trabajo del implementador.
5. **Ordena**: primero por dependencias (una tarea que produce el contrato o los datos que otra
   necesita va antes), despues por gravedad.
6. **Estado de git.** Si el proyecto tiene git, trae el remoto (`git fetch`) y comprueba que la rama
   principal esta actualizada y el arbol limpio. Si no lo esta, no sigas por tu cuenta: lo preguntas
   en la Fase 1. **Si no tiene git**, lo avisas y exiges aceptacion explicita en la Fase 1: los
   cambios seran irreversibles, y se trabaja sin ramas ni commits.

Si no hay ninguna tarea pendiente, dilo y sugiere `/audit` o `/audit tareas`. Termina ahi.

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

**Presentalo asi:**

1. **El plan, primero.** Lista corta: orden de las tareas, nivel de cada una, agentes previstos y el
   modo de consumo. **Con el coste a la vista**: cada tarea es al menos un arranque en frio del
   implementador mas su verificacion, asi que `N` tareas son bastante mas que una. Si son muchas y el
   plan del usuario tiene limites ajustados, sugiere `max 3` y repetir.
2. **Las preguntas despues**, agrupadas en rondas seguidas de `AskUserQuestion` (hasta cuatro por
   llamada), con una opcion recomendada en cada una. Pregunta solo lo que cambia lo que se hara; si
   el spec ya lo resuelve, no lo repitas.
3. **En la misma ronda**, la confirmacion de las reglas del sprint: un commit local por tarea en su
   propia rama, y **nada se sube**.

**Que guardar.** Las respuestas de cada tarea van a su `spec.md`, bajo un encabezado **Decisiones
previas (sprint <fecha>)**; el implementador las lee y mandan sobre su criterio. El plan y una tabla
de estado van a `.devteam/runs/<fecha>/run.md` (si ya hay uno terminado de hoy, anade `-2`).

**A partir de aqui no preguntas nada mas hasta el informe final.** Si surge una duda a mitad, no la
resuelves preguntando: la clasificas como lo hace el implementador (decision menor, que asumes y
anotas; o decision que no te corresponde, que saltas y reportas).

## Fase 2: Ejecucion en serie

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
diseno, y el modo de consumo. Recuerdale que no puede preguntar. Anota su identificador, porque lo
vas a necesitar para pedirle correcciones.

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
5. **No iniciadas**, con el motivo.
6. **Siguientes pasos**: `/ship` en cada rama cerrada, **en orden** si hay ramas apiladas; y volver a
   lanzar `/sprint` cuando se hayan resuelto los bloqueos, que retomara las parciales.

No declares cerrada una tarea cuyas pruebas fallen o cuya verificacion no se haya ejecutado. Di
exactamente lo que hay, tarea por tarea.

Al final, recomienda empezar una **sesion nueva** antes de `/ship`: esta lleva todo el sprint.
