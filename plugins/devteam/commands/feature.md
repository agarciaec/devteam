---
description: Ciclo completo de desarrollo con el equipo de agentes, del diseno a la verificacion
argument-hint: Descripcion de lo que hay que construir o arreglar
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

1. Lee `.devteam/context.md`. Si no existe, avisa al usuario de que `/onboard` daria mejores resultados y pregunta si continuar igualmente.
2. Elige un `<slug>` corto para la tarea y crea `.devteam/tasks/<slug>/`.
3. Escribe `spec.md`: que se pide, que queda fuera, y los **criterios de aceptacion** concretos con los que se sabra si esta terminado.
4. Si el proyecto no tiene git, avisa al usuario: los cambios no seran reversibles ni revisables como diff.

## Fase 1: Exploracion en paralelo

Lanza en **un solo mensaje** los agentes que apliquen a la tarea, normalmente dos o tres:

- Un explorador para las partes del codigo afectadas y los patrones ya usados
- `db-specialist` si la tarea toca datos
- `qa-tester` para saber que pruebas existen y como se ejecutan

Cuando terminen, **lee tu mismo los archivos clave que senalaron**. Los informes te orientan; el codigo lo tienes que ver de primera mano antes de decidir nada.

## Fase 2: Diseno

Convoca a `tech-lead` con el spec y los hallazgos. Producira `design.md` y `contract.md`.

`contract.md` es la pieza que permite trabajar en paralelo despues: endpoints, esquemas, tipos e interfaces acordados antes de implementar.

**Presenta el diseno al usuario y resuelve con el las ambiguedades antes de continuar.** Este es el punto de parada del flujo.

## Fase 3: Implementacion

Convoca en paralelo a los especialistas del stack que haga falta, indicando a cada uno la ruta de `contract.md`:

- `backend` para el lado servidor
- `frontend` para la interfaz
- `db-specialist` para migraciones
- `automation-bot` si hay automatizacion

Cada uno devuelve el codigo con su ruta exacta. **Tu lo aplicas**, en un orden que deje el proyecto coherente: primero datos, luego servidor, luego interfaz.

Tras aplicar, ejecuta lo que corresponda (construccion, arranque, pruebas) y comprueba que funciona de verdad. Si algo falla, arreglalo o vuelve a consultar al especialista con SendMessage.

## Fase 4: Verificacion en paralelo

Con el codigo ya aplicado, lanza en **un solo mensaje**:

- `code-reviewer` sobre el diff
- `qa-tester` para pruebas del cambio
- `security-auditor` si la tarea toca autenticacion, datos personales o dinero; y siempre que `context.md` marque el proyecto como portador de datos sensibles o regulados

Consolida los tres informes. Si se contradicen, decide tu y explica por que. Arregla lo que bloquea antes de dar nada por terminado.

## Fase 5: Cierre

1. Convoca a `docs-writer` si el cambio afecta a como se usa o se configura el proyecto.
2. Escribe `log.md` en la carpeta de la tarea: que se hizo, que decidio el equipo y que quedo pendiente.
3. Resume al usuario: que cambio, que archivos, que se verifico **y con que resultado real**, y que queda abierto.

No declares la tarea terminada si las pruebas fallan o si no llegaste a ejecutar la verificacion. Di lo que hay.
