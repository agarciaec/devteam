---
name: devteam-protocol
description: Protocolo de coordinacion del equipo de agentes de desarrollo: como se reparte el trabajo, como se paraleliza sin colisiones, como se pasan informacion los especialistas a traves de la carpeta .devteam, y como se resuelven informes que se contradicen. Cargalo cuando vayas a coordinar a varios agentes especialistas en una misma tarea, cuando trabajes con una carpeta .devteam, o cuando tengas que decidir a quien convocar y en que orden.
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
leen los diez agentes en cada arranque: cada entrada inutil cuesta atencion en todas las tareas
futuras. Entra solo lo que es especifico de este proyecto, volvera a ser relevante, y no esta ya
escrito. El conocimiento general no entra: los agentes ya lo traen. Y se poda al escribir, no
algun dia.

**La otra mitad es la correccion dentro de la tarea.** Aplicar un arreglo no lo da por bueno: hay
que volver a ejecutar lo que fallaba, porque el arreglo puede estar mal o romper otra cosa. Y
tras dos intentos fallidos se para y se cuenta, en lugar de probar variaciones a ciegas.

## Estructura de `.devteam/`

```
.devteam/
├── context.md                 # ficha del proyecto, la lee todo agente al arrancar
└── tasks/<slug>/
    ├── spec.md                # que se pide y criterios de aceptacion
    ├── design.md              # decision de arquitectura
    ├── contract.md            # endpoints, esquemas, tipos e interfaces
    ├── findings/              # un informe por especialista
    │   ├── backend.md
    │   ├── frontend.md
    │   ├── db.md
    │   ├── qa.md
    │   ├── review.md
    │   └── security.md
    └── log.md                 # bitacora de cierre
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
| Interfaz, con framework o sin el | `frontend` |
| Esquema, migraciones, consultas lentas | `db-specialist` |
| Verificar que funciona | `qa-tester` |
| Revisar el cambio antes de cerrarlo | `code-reviewer` |
| Autenticacion, datos personales, pagos, facturacion | `security-auditor` |
| Construccion, despliegue, contenedores, entorno | `devops` |
| Bots y scraping | `automation-bot` |
| Documentacion y CLAUDE.md | `docs-writer` |

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
