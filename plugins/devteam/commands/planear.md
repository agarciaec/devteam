---
description: Planifica solicitudes antes de ejecutarlas: las desglosa en tareas con lo que el equipo ya sabe del proyecto, detecta duplicados y choques con decisiones vigentes, y deja el plan y los specs listos para /feature o /sprint sin tocar codigo
argument-hint: Las solicitudes, una o varias, en tus palabras. Opcional, "ligero" o "completo" para forzar cuanto se investiga
---

# Planear

Vas a convertir una o varias solicitudes del usuario en un **plan de trabajo aprobado**, antes de
ejecutar nada. Es el modo plan del equipo: como el de Claude, no se toca el codigo hasta que el
usuario decide, pero **parte de lo que el equipo ya sabe de este proyecto** en lugar de explorarlo de
cero. Para eso existe la ficha, las decisiones, el indice de tareas y los informes anteriores.

Solicitudes: $ARGUMENTS

Si no hay ninguna escrita, pide al usuario que las cuente, con sus palabras y aunque esten a medio
pensar, y termina ahi.

## Reglas

**Solo lectura sobre el codigo.** Lo unico que escribes esta en `.devteam/`. No implementas, no
creas ramas y no haces commits: planear no cambia nada del proyecto.

**Lo que el equipo ya escribio va primero.** Antes de leer una linea de codigo, lee lo documentado:
es mas barato y mas fiable que redescubrirlo, y evita proponer algo que ya se hizo o que contradice
una decision.

**Planear es barato por diseno.** Lo haces tu leyendo y buscando. Convocas agentes solo si la zona
es desconocida y grande, o si el enfoque es una decision de arquitectura de verdad (Fase 2).

**El plan no inventa.** Lo que no se sabe se pregunta, o se lista como pregunta abierta. Un plan con
una regla de negocio supuesta produce una tarea que se implementa mal con total seguridad.

---

## Fase 0: Lo que el equipo ya sabe

Lee, en este orden y solo lo que exista:

1. `.devteam/context.md`: stack, convenciones, trampas, lecciones, modo de consumo, datos sensibles y
   entorno de pruebas. Si no existe, avisa de que `/onboard` daria un plan mejor y sigue con menos
   precision, diciendolo.
2. `.devteam/decisions.md`: las decisiones de arquitectura vigentes. Una solicitud puede chocar con
   ellas.
3. `.devteam/tasks/index.md`: lo hecho, lo parcial y lo pendiente. Lo que pide el usuario puede estar
   ya hecho, a medias o ya planificado.
4. **Historia relacionada.** Busca las palabras clave de cada solicitud en `.devteam/`: el indice,
   `audits/*/report.md`, `uitest/*/report.md`, `redesign/*/plan.md` y `spec/*/`. Abre solo lo que
   encaje. Es historia: cuenta que se decidio entonces y por que, no como es el sistema hoy.
5. **Estado de git**: la rama actual y si hay cambios sin confirmar, para avisar si el plan se hace
   sobre un arbol con trabajo ajeno.

## Fase 1: Entender cada solicitud

Para cada una:

- **Desglosala en unidades** con el criterio de `/feature`: una unidad es lo que tiene contrato y
  criterios de aceptacion propios. Lo que comparte modelos, endpoints o pantallas es una sola tarea;
  lo inconexo, varias.
- **Contrastala** con lo leido y clasificala:
  - **Nueva.**
  - **Ya existe, pendiente o parcial**: refina esa, no crees una duplicada.
  - **Ya esta hecha**: cita su fila del indice y comprueba en el codigo, con una busqueda, que sigue
    siendo cierto.
  - **Choca con una decision vigente**: dilo con la decision y su motivo. Es el usuario quien elige si
    se respeta o se cambia.
  - **Solapa con otra solicitud de este mismo lote**: unificalas.
  - **No es trabajo de codigo** (publicar, desplegar, un tramite): dilo y da el comando que si
    sirve, como `/ship` o `/release`.
- **Marca lo vago.** Si falta algo que cambie el diseno —quien puede hacerlo, que pasa en el caso
  limite, de donde salen los datos—, es una pregunta, no una suposicion.

## Fase 2: Investigar lo justo

Para las tareas nuevas, averigua donde se tocaria. Cuanto investigas sigue el modo de consumo de la
ficha, salvo que el usuario fuerce otro: **economico, ligero; equilibrado, estandar; maximo,
completo.** Anuncialo en una linea.

- **Ligero**: tu sola, con busquedas acotadas y lecturas por rango de lineas. Sin agentes.
- **Estandar**: igual, y como mucho **un** agente de exploracion si hay una zona desconocida y
  grande.
- **Completo**: ademas, `tech-lead` para el enfoque cuando haya varias formas razonables de hacerlo
  o un contrato entre capas, y `security-auditor` solo si toca autenticacion, dinero o datos
  sensibles. En un solo mensaje, en paralelo. `tech-lead` corre en `sonnet`; `opus` solo aqui.

Lo que buscas por tarea: **las zonas y archivos probables** (con `archivo:linea`), **el patron que ya
existe y se puede reutilizar**, **que pruebas la cubren hoy**, y **los riesgos**: las trampas de la
ficha que aplican, migraciones, contratos que cambian.

## Fase 3: El plan

Escribe `.devteam/plans/<fecha>/plan.md` (si ya hay uno de hoy, anade `-2`) con:

1. **Resumen**: que se pidio, una linea por solicitud, y como se desglosa.
2. **Tareas propuestas, en orden.** Cada una con su slug, que se pide, nivel de esfuerzo sugerido,
   zonas probables, enfoque en una o dos frases, criterios de aceptacion, dependencias, riesgos y
   preguntas abiertas.
3. **El orden y por que**: primero lo que produce el contrato o los datos que otras necesitan; luego
   valor y riesgo; y, a igualdad, las pequenas primero.
4. **El coste**: cuantas tareas, a que nivel y con cuantos agentes, segun el modo de consumo. Que
   conviene hacer con `/feature`, por ser grande o delicado y querer al usuario delante, y que puede
   ir en una tanda de `/sprint`.
5. **Lo que no entra**, cada cosa con su motivo: ya hecho, duplicado, no es codigo, choca con una
   decision.
6. **Decisiones que se tocan**: cuales de `decisions.md` afecta, y si el plan las respeta o propone
   cambiarlas.
7. **Lo que no se sabe**: las preguntas abiertas.

## Fase 4: Aprobacion

Es el punto de parada. Presenta el plan **en pocas lineas**, no el archivo entero: las tareas en
orden con su nivel, lo que queda fuera con su motivo, y el coste. Despues, las preguntas abiertas,
agrupadas en llamadas de `AskUserQuestion` (hasta cuatro cada una), con una opcion recomendada en
cada una. Pregunta solo lo que cambie lo que se hara.

Ajusta el plan con las respuestas y, si cambio algo importante, vuelve a mostrar el resumen.
Termina con una pregunta de aprobacion: **aprobar**, **ajustar** o **descartar**.

**No pases a ejecutar sin aprobacion.** Que el usuario haya pedido algo no es haber aprobado el plan.

## Fase 5: Dejarlo listo

Con el plan aprobado:

- Para cada tarea, crea `.devteam/tasks/<slug>/spec.md` con estado **pendiente**: origen (la ruta del
  plan y la solicitud original), que se pide, que queda fuera, criterios de aceptacion, nivel
  sugerido, dependencias, zonas probables y enfoque, riesgos, y las respuestas de la ronda anterior
  bajo **Decisiones previas**. Es lo que leeran `/feature` y `/sprint` en otra sesion, sin haber
  visto esta conversacion.
- Anade a `.devteam/tasks/index.md` una fila **pendiente (plan <fecha>)** por tarea.
- Si descubriste algo falso en la ficha, corrigelo. Si el plan fija una decision de arquitectura que
  sigue vigente, o cambia una, anotala en `.devteam/decisions.md`, marcando la anterior como superada
  en vez de borrarla.

Cierra con el siguiente paso concreto, **sin empezar ninguna tarea**:

- `/feature <primer-slug>` para ir una a una con el equipo y el usuario presente, o
- `/sprint` para ejecutarlas todas sin que este pendiente.

Recomienda abrir una sesion nueva para ejecutarlas: el plan ya esta escrito, y esta conversacion no
hace falta para nada.
