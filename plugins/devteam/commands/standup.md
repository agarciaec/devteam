---
description: Resume el estado de las tareas del equipo en este proyecto
argument-hint: Opcional, el slug de una tarea concreta
---

# Estado del equipo

Reconstruye en que punto quedo el trabajo, para poder retomarlo sin releer todo.

Tarea consultada: $ARGUMENTS

## Que hacer

1. Si no hay `.devteam/` en este proyecto, dilo y sugiere `/onboard`. Termina ahi.

2. Si el usuario indico un slug, informa solo de esa tarea. Si no, lista las tareas de `.devteam/tasks/` de mas reciente a mas antigua y detalla la ultima; menciona el resto en una linea cada una.

3. Para la tarea que detalles, lee sus documentos y reporta:

   - **Que se pedia**: de `spec.md`, con sus criterios de aceptacion.
   - **Que se decidio**: de `design.md`, la decision de arquitectura en una o dos frases.
   - **Fase alcanzada**: dedúcela de los archivos presentes. Solo `spec.md` significa que quedo en preparacion; con `design.md` y `contract.md`, que el diseno esta hecho; con informes en `findings/`, que hubo implementacion o verificacion; con `log.md`, que se cerro.
   - **Quien participo**: los especialistas con informe en `findings/`.
   - **Hallazgos abiertos**: recorre los informes y extrae lo que quedo marcado como pendiente, bloqueante o no resuelto. Esto es lo mas importante del resumen.

4. Contrasta con el estado real del codigo. Si el proyecto tiene git, mira `git status` y `git log` para ver si hay cambios sin confirmar o trabajo posterior. Si lo que dicen los documentos no cuadra con el codigo, senalalo: suele significar que la tarea avanzo fuera del flujo del equipo.

5. Mira las **lecciones del proyecto** en `.devteam/context.md`. Si la ultima tarea no anadio
   ninguna y sin embargo dejo hallazgos abiertos o defectos que se repitieron, dilo: significa que
   el cierre se hizo a medias y ese aprendizaje se perdio.

6. Cierra con lo unico que el usuario necesita decidir: **el siguiente paso concreto**, y si hay algo bloqueado, que lo desbloquea.

Se breve. Esto es un parte de situacion, no un informe.
