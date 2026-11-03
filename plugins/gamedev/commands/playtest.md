---
description: Prepara sesiones de prueba con jugadores (objetivos, guion, que observar, encuesta, telemetria) y analiza los resultados separando lo que el jugador dice de lo que hace, para convertirlos en tareas
argument-hint: "plan <que se quiere aprender> | analizar <ruta de notas, encuestas o telemetria>"
---

# Pruebas con jugadores

Peticion: $ARGUMENTS

Una prueba con jugadores sirve para responder preguntas concretas. Sin preguntas, se vuelve una
sesion de opiniones que confirma lo que el equipo ya pensaba. Este comando prepara la sesion
alrededor de esas preguntas y, despues, convierte lo observado en decisiones.

## plan

1. Lee `.gamedev/gdd.md` (pilares y riesgos) y las mecanicas o niveles implicados. Pregunta que
   version se va a probar y con quien, si no se dice.
2. **Preguntas de la prueba**: de tres a cinco, cada una ligada a un pilar, una mecanica o un
   riesgo. "Entienden sin ayuda que la luz delata al jugador?" es una pregunta; "les gusta?" no.
3. Escribe `.gamedev/playtest/<fecha>-<slug>/plan.md` con:
   - Preguntas y, para cada una, **que se observa** para responderla (comportamiento visible, no
     opinion) y que dato de telemetria la responderia.
   - **Perfil de jugadores**: cuantos (cinco bastan para encontrar la mayoria de los problemas de
     comprension), experiencia con el genero, y si conocen el juego.
   - **Guion de sesion**: que se dice al empezar (nada que ensene a jugar), que tareas se piden,
     cuanto dura, y que hace el observador: **no ayudar**, anotar donde se atascan, lo que dicen
     en voz alta y el tiempo.
   - **Hoja de observacion** con columnas: minuto, zona, que hizo, que dijo, pregunta relacionada.
   - **Encuesta final**: corta, con escalas para lo comparable entre sesiones y dos o tres
     preguntas abiertas. Nunca preguntas que sugieran la respuesta.
4. **Telemetria**: si el juego registra eventos, lista los que faltan para responder las
   preguntas (muertes por zona, tiempo por nivel, abandonos). Anadirlos al juego es una tarea de
   devteam: ofrecela.

## analizar

1. Lee lo que se te indique: notas, hojas de observacion, respuestas de encuesta (CSV), registros
   de telemetria. Para volumenes grandes, procesa con un script y no leas fila a fila.
2. **Separa lo que hacen de lo que dicen.** Un jugador que dice que el nivel es facil y muere ocho
   veces en el mismo salto esta dando dos datos distintos: el comportamiento manda para la
   usabilidad, la opinion importa para la sensacion.
3. Agrupa los hallazgos por problema, con:
   - **Frecuencia**: cuantos jugadores de cuantos.
   - **Gravedad**: bloquea, frustra, confunde o es menor.
   - **Evidencia**: las observaciones concretas.
   - **Pregunta del plan** que responde, si responde a alguna.
4. Escribe `resultados.md` en la carpeta de la prueba: respuesta a cada pregunta del plan, los
   hallazgos ordenados por gravedad y frecuencia, y lo que **no** se puede concluir con esta
   muestra.
5. **Propone acciones**, y sigue la regla de devteam: cada tarea propuesta se deja escrita. Los
   cambios de diseno se senalan para el comando de gamedev que corresponda (`/gamedev:nivel
   revisar`, `/gamedev:balance`...); los de codigo van a `.devteam/tasks/<slug>/spec.md` con
   origen (la ruta de resultados), evidencia, que cambiar, criterios de aceptacion y **estado:
   pendiente**, con su fila en `.devteam/tasks/index.md`. No empieces ninguna sin aprobacion.

## Reglas

- Escribe solo en `.gamedev/playtest/` (y en `.devteam/tasks/` al proponer tareas aprobadas).
- No cites a jugadores por su nombre real en los informes: usa J1, J2...
- Un hallazgo de un solo jugador se reporta, pero se marca como tal.
