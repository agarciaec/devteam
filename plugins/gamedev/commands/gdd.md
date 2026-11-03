---
description: Crea y mantiene el documento de diseno vivo del juego (pilares, fantasia del jugador, bucles, alcance y lo que el juego no es) y presenta el equipo de gamedev a devteam
argument-hint: "[iniciar | actualizar <que cambio> | consultar <pregunta> | recortar]"
---

# Documento de diseno del juego

Peticion: $ARGUMENTS

El GDD es al diseno lo que `.devteam/context.md` es al codigo: la referencia que todos los
comandos de gamedev leen antes de trabajar. Por eso tiene que ser **corto y verdadero**. Un GDD de
cien paginas no lo lee nadie y se queda viejo en una semana; este cabe en una lectura y se corrige
cada vez que algo cambia. El detalle vive en los documentos de cada area (`mecanicas/`,
`niveles/`, `lore/`...), y el GDD los enlaza.

## Que se pide

| Peticion | Que hacer |
|---|---|
| (vacia) | Si no hay `.gamedev/gdd.md`, `iniciar`. Si lo hay, resumelo en diez lineas y senala lo que parece desfasado frente al proyecto (mecanicas enlazadas que no existen, alcance que ya no cuadra). |
| `iniciar` | Crear el GDD. |
| `actualizar <que cambio>` | Cambiar las secciones afectadas y anotar la decision. |
| `consultar <pregunta>` | Responder desde el GDD y sus documentos enlazados, citando la ruta. Lo que no esta definido se dice, no se inventa. |
| `recortar` | Revisar el alcance frente al tiempo y el equipo disponibles. |

## iniciar

1. **Lee lo que ya existe** antes de preguntar: `README`, documentos de diseno sueltos (`docs/`,
   `design/`, cualquier `*gdd*`), `.gamedev/lore/biblia.md` y `.devteam/context.md`.
2. **Reconoce el motor** si no lo dice la ficha de devteam: `project.godot` es Godot,
   `ProjectSettings/` con `Assets/` es Unity, un `.uproject` es Unreal, y un `package.json` con
   Phaser, PixiJS, Three.js o Babylon es un juego web. Anota version si se puede leer.
3. **Pregunta en una sola tanda** lo que falte, con opciones concretas:
   - **Fantasia del jugador**: que se siente al jugar, en una frase ("ser un contrabandista que
     sobrevive en una ciudad sitiada").
   - **Genero, perspectiva y plataformas.**
   - **Equipo y plazo**: cuantas personas, cuanto tiempo y si hay un hito (demo, festival, jam).
   - **Referencias**: dos o tres juegos comparables y que se toma de cada uno.
4. **Propon los pilares** (de 3 a 5): frases que sirvan para decidir. "Divertido" no es un pilar
   porque no descarta nada; "cada combate se puede evitar con sigilo" si, porque obliga a disenar
   niveles, enemigos y progresion de una forma concreta. Que el usuario los apruebe.
5. Escribe `.gamedev/gdd.md`, **como mucho 200 lineas**:

   ```markdown
   # <titulo del juego>
   Actualizado: <fecha>

   ## En una frase
   ## Fantasia del jugador
   ## Pilares
   <cada uno con lo que obliga y lo que descarta>

   ## Bucles
   - Segundos: <la accion basica>
   - Minutos: <el ciclo de un encuentro o una partida>
   - Horas: <la progresion>

   ## Mecanicas nucleo
   <una linea cada una, enlazando a mecanicas/<slug>.md cuando exista>

   ## Progresion
   ## Publico, plataformas y motor
   ## Referencias
   <juego - que se toma - que no>

   ## Alcance
   - Vertical slice: <lo minimo que demuestra el juego>
   - Version 1:
   - Lista de recortes: <lo primero que se cae si falta tiempo, en orden>

   ## Lo que este juego no es
   ## Riesgos
   <de diseno y de produccion, con como se comprobaran pronto>

   ## Decisiones
   <fecha - decision - motivo>
   ```

6. **Presenta el equipo a devteam.** Si existe `.devteam/context.md`, anade (o actualiza) esta
   seccion, para que `/devteam:feature` convoque a los especialistas de juego:

   ```markdown
   ## Especialistas adicionales
   - `gamedev:gameplay-programmer`: codigo de juego (bucle, entrada, fisica, camaras, estados, IA,
     combate). Sustituye a `frontend` y `backend` en todo lo que corre dentro del juego.
   - `gamedev:engine-specialist`: estructura del proyecto en el motor, escenas, recursos,
     exportacion por plataforma y rendimiento.
   - `gamedev:game-designer`: revisa lo implementado frente a `.gamedev/gdd.md` y los documentos
     de diseno antes de dar una tarea por cerrada.
   ```

   Si no hay `.devteam/`, propon `/devteam:onboard` para tener la ficha tecnica.

7. Propon el siguiente paso: normalmente `/gamedev:loremaster iniciar` si el juego tiene mundo, o
   `/gamedev:mecanica` con la mecanica nucleo de mas riesgo.

## actualizar

Cambia solo las secciones afectadas y anade la linea en **Decisiones**. Si el cambio contradice un
pilar, no lo resuelvas por tu cuenta: o cambia el pilar (y se anota por que) o cambia la peticion.
Busca con Grep en `.gamedev/` los documentos que dependen de lo cambiado y lista los que quedan
desfasados, sin editarlos sin aprobacion.

## recortar

Compara el alcance con el plazo y el equipo, y con lo que ya esta hecho si hay `.devteam/tasks/`.
Propone que pasa a la lista de recortes y en que orden, justificando cada recorte por el pilar al
que menos sirve. Lo que sostiene un pilar es lo ultimo en caer. Aplica solo lo que el usuario
apruebe.

## Reglas

- Escribe en el idioma del proyecto. Solo escribes en `.gamedev/` y en la seccion de especialistas
  de `.devteam/context.md`.
- El GDD describe el juego que se esta haciendo, no el sonado. Si el codigo ya contradice algo,
  dilo: o se corrige el GDD o se abre una tarea.
- Si `.devteam/context.md` tiene `## Modo de consumo`, respetalo; este comando no convoca agentes.
