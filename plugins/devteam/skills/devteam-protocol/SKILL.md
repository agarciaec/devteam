---
name: devteam-protocol
description: Referencia del protocolo del equipo de agentes: estructura de la carpeta .devteam, estado actual frente a historia, a quien convocar y como resolver informes que se contradicen. Los comandos del plugin (feature, audit, onboard y demas) ya incluyen lo que necesitan, asi que no hace falta cargarla al usarlos. Cargala solo para coordinar agentes a mano fuera de los comandos, o cuando el usuario pregunte como funciona el equipo.
---

# Protocolo del equipo

## El modelo real de coordinacion

Conviene tenerlo claro porque condiciona todo lo demas: **los subagentes no se comunican entre si**. Cada uno arranca sin contexto previo, trabaja aislado y devuelve un informe. No existe un canal entre pares.

Lo que si existe, y es con lo que se construye el equipo:

1. **La sesion principal es el tech lead.** Reparte, consolida y decide. Es la unica que escribe codigo fuente.
2. **El paralelismo es real** cuando varias llamadas a la herramienta Agent salen en **un mismo mensaje**. En mensajes separados se ejecutan en serie y se pierde la ventaja.
3. **El handoff es por archivos.** `.devteam/` es la memoria compartida del equipo, y lo unico que un agente puede heredar de otro.

## De donde sale `context.md`

En un proyecto que ya existe lo genera `/onboard`, deduciendo el stack del codigo y preguntando lo
que no se puede deducir. En un proyecto nuevo lo genera `/kickoff` a partir de las decisiones de
stack que el equipo propone y el usuario aprueba, porque ahi no hay nada que deducir todavia.

En ambos casos es la unica fuente de especializacion de los agentes: ninguno sabe nada de este
proyecto hasta que lo lee.

## Como mejora el equipo con el uso

Conviene ser preciso con esto, porque la palabra "aprender" promete algo que no ocurre: **el
modelo no se reentrena con tu uso, y ningun agente recuerda nada de ayer**. Cada uno arranca en
frio, siempre.

Lo que si ocurre es que el equipo **escribe lo que descubre** en un sitio que todos leen antes de
trabajar. El aprendizaje es un archivo, no una intuicion. Y como es un archivo, funciona: no se
degrada, se puede leer, corregir y borrar.

El ciclo tiene tres momentos:

1. **Al empezar una tarea**, todos leen `context.md`. Ahi estan el stack, las trampas conocidas y
   las lecciones que dejaron las tareas anteriores.
2. **Durante la tarea**, cualquier discrepancia entre la ficha y la realidad se corrige en el
   momento. Una ficha que miente es peor que una incompleta, porque los agentes la creen sin
   comprobarla.
3. **Al cerrar**, se anota lo aprendido: lo que resulto falso, las trampas nuevas, los defectos que
   se repitieron y las decisiones con su motivo.

**Lo que hace que esto funcione es la disciplina de no anotarlo todo.** La seccion de lecciones la
leen todos los agentes en cada arranque: cada entrada inutil cuesta atencion en todas las tareas
futuras. Entra solo lo que es especifico de este proyecto, volvera a ser relevante, y no esta ya
escrito. El conocimiento general no entra: los agentes ya lo traen. Y se poda al escribir, no
algun dia.

**La otra mitad es la correccion dentro de la tarea.** Aplicar un arreglo no lo da por bueno: hay
que volver a ejecutar lo que fallaba, porque el arreglo puede estar mal o romper otra cosa. Y
tras dos intentos fallidos se para y se cuenta, en lugar de probar variaciones a ciegas.

## Estado actual frente a historia

Es la distincion que evita el error mas caro de todos: **leer un documento viejo creyendo que
describe el sistema de hoy.**

**Estado actual**, se mantiene al dia y se puede creer:

- El **codigo**, que es la unica verdad completa
- `context.md`: stack, comandos, convenciones, trampas y lecciones
- `decisions.md`: las decisiones de arquitectura vigentes y por que

**Historia**, es una foto del momento y no se actualiza nunca:

- Todo lo que hay en `tasks/<slug>/`: el spec, el diseno, el contrato y los informes

Un `contract.md` de hace ocho meses describe una API que puede haber cambiado tres veces desde
entonces, y no lleva ningun aviso de estar obsoleto. Sirve para responder "que se decidio entonces
y por que", jamas para responder "como funciona esto ahora". Si necesitas lo segundo, mira el
codigo.

Por eso las decisiones que siguen vigentes se copian a `decisions.md` en lugar de quedarse solo en
la carpeta de su tarea: una decision viva tiene que estar donde se busca lo vivo. Y cuando una
decision nueva sustituye a otra, la anterior se marca como superada en vez de borrarse, porque
saber que algo se intento y se abandono evita que alguien lo reintente dentro de un ano.

## Que el historial no se vuelva ilegible

Las carpetas de tareas no se cargan nunca en contexto, asi que no encarecen las sesiones por muchas
que haya. El riesgo no es el peso, es que con veinte tareas los nombres de carpeta dejan de decir
nada y la informacion se vuelve inencontrable.

Lo resuelve `tasks/index.md`: una linea por tarea con fecha, nombre, que hizo y en que estado quedo.
Se escribe al cerrar cada tarea y es por donde se empieza a buscar, en lugar de abrir carpetas a
ciegas. Las tareas que quedaron a medias se marcan como parciales y no se borran: una fila que dice
que algo quedo sin terminar vale mas que el silencio.

## Estructura de `.devteam/`

```
.devteam/
├── context.md                 # estado actual: la lee todo agente al arrancar
├── decisions.md               # decisiones de arquitectura vigentes (la lee tech-lead)
├── audits/<fecha>/            # historia: cada /audit, con su linea base, informes y report.md
├── redesign/<fecha>/          # historia: capturas, diagnosis.md, prototipos y plan.md de cada /redesign
├── uitest/<fecha>/            # historia: cobertura, fallos con reproduccion y report.md de cada /uitest
└── tasks/
    ├── index.md               # una linea por tarea: fecha, nombre, que hizo, estado
    └── <slug>/                # historia: foto del momento, no se actualiza
        ├── spec.md            # que se pide y criterios de aceptacion
        ├── design.md          # decision de arquitectura
        ├── contract.md        # endpoints, esquemas, tipos e interfaces
        ├── ui.md              # especificacion visual, si la tarea toca pantallas
        ├── mockup.html        # prototipo navegable de ui-designer
        ├── findings/          # un informe por especialista
        │   ├── backend.md
        │   ├── frontend.md
        │   ├── db.md
        │   ├── qa.md
        │   ├── review.md
        │   ├── git.md
        │   └── security.md
        └── log.md             # bitacora de cierre
```

## Por que el contrato va antes que el codigo

`contract.md` es lo que permite que backend y frontend trabajen a la vez. Sin el, el frontend tiene que esperar a que el backend exista para saber que forma tienen los datos, y el equipo deja de ser paralelo.

Un contrato util es preciso en lo que suele fallar: que campos pueden faltar, que formato tienen las fechas, que se devuelve en caso de error, y que codigos de estado se usan. Un contrato vago produce dos implementaciones que no encajan y una sesion entera de arreglos.

Si durante la implementacion un especialista ve que el contrato esta mal, **no lo cambia por su cuenta**: lo reporta, el tech lead decide, y el contrato se actualiza en un solo sitio.

## A quien convocar

| Situacion | Agentes |
|---|---|
| Entender el codigo antes de decidir | exploradores, `db-specialist`, `qa-tester` en paralelo |
| Disenar la solucion | `tech-lead` |
| Lado servidor, cualquier lenguaje | `backend` |
| Como debe verse y sentirse una interfaz: flujo, diseno visual, animacion | `ui-designer` |
| Revisar y actualizar la interfaz completa | `/redesign`, que diagnostica, acuerda el nivel de cambio y planifica por etapas |
| Comprobar que la interfaz funciona al usarla | `/uitest`, o `qa-tester` directamente para una pantalla concreta |

**Un navegador, un agente.** Un servidor MCP de navegador maneja un unico navegador. Nunca lances
varios agentes a usarlo a la vez: se pisan las pestanas y los resultados no valen. Con navegador
compartido se recorre en serie; solo se reparte en paralelo si cada agente lanza su propio proceso de
Playwright mediante scripts.
| Interfaz, con framework o sin el | `frontend` |
| Esquema, migraciones, consultas lentas | `db-specialist` |
| Verificar que funciona | `qa-tester` |
| Revisar el cambio antes de cerrarlo | `code-reviewer` |
| Autenticacion, datos personales, pagos, facturacion | `security-auditor` |
| Construccion, despliegue, contenedores, entorno | `devops` |
| Bots y scraping | `automation-bot` |
| Documentacion y CLAUDE.md | `docs-writer` |
| Ramas, commits, sincronizacion, PR, versiones, conflictos | `git-manager` |
| Salud y consistencia del proyecto entero | `/audit`, que convoca a todos por capas y cruza |

**Tarea frente a auditoria.** `/feature` revisa lo que acaba de cambiar; `/audit` revisa el
proyecto entero y, sobre todo, donde se tocan sus capas. Cada parte puede estar bien por separado y
el conjunto fallar en las costuras: un endpoint que el frontend llama y ya no existe, un modelo que
no coincide con su migracion, una variable de entorno que nadie documento. Una auditoria no modifica
codigo: produce evidencias y tareas, y cada tarea se hace despues con su propio `/feature`.

`git-manager` sigue la misma regla que los demas: analiza y prepara, y la sesion principal ejecuta.
Con una diferencia: todo lo que publica —push, pull request, merge, tag, release— requiere la
confirmacion explicita del usuario, porque sale de su maquina y otros lo ven.

## Cuando lanzar de nuevo y cuando retomar

- **Agent nuevo**: cuando el especialista no ha visto esta tarea todavia.
- **SendMessage a uno ya lanzado**: cuando ya trabajo en ella y necesitas una correccion o una ampliacion. Conserva su contexto y evita que repita toda la lectura.

## Que se puede paralelizar y que no

Paralelizable:

- Toda la exploracion
- Los especialistas de implementacion, **una vez existe el contrato**
- Toda la verificacion: revision, pruebas y seguridad a la vez

No paralelizable:

- El diseno, que es lo que produce el contrato del que dependen los demas
- La aplicacion del codigo, que hace solo el tech lead
- Migracion de datos antes del codigo que la usa

## Informes que se contradicen

Ocurre, sobre todo entre `code-reviewer` y los implementadores. Reglas para resolver:

1. **Gana quien aporta el escenario concreto de fallo.** Una objecion sin un caso que la demuestre pesa menos que una con entrada y resultado erroneo.
2. **Seguridad tiene prioridad** cuando el desacuerdo es sobre riesgo, salvo que el auditor no sepa explicar como se explota.
3. **Verifica tu mismo** si la contradiccion es sobre un hecho del codigo: abre el archivo.
4. **Decide y deja constancia** en `log.md` de por que. No traslades el empate al usuario salvo que sea una decision de producto.

## Errores que arruinan el flujo

- Lanzar los agentes en mensajes separados: se pierde el paralelismo.
- Convocar a un especialista antes de que exista el contrato: trabaja sobre suposiciones.
- Aceptar el informe de un agente sin mirar el codigo que cita.
- Dar por verificado algo que no se ejecuto. Si las pruebas no se corrieron, eso es lo que hay que decir.
- Dejar que dos agentes escriban codigo a la vez. Escribe solo el tech lead.
