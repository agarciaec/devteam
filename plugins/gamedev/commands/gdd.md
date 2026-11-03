---
description: Crea y mantiene el documento de diseno vivo del juego (pilares, fantasia del jugador, bucles, alcance y lo que el juego no es) y presenta el equipo de gamedev a devteam
argument-hint: "[iniciar | inventario [area] | actualizar <que cambio> | consultar <pregunta> | recortar]"
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
| `inventario [area]` | En un proyecto ya empezado: listar las piezas que ya estan construidas y dejarles fichas iniciales. |
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

7. Propon el siguiente paso. Si el proyecto ya tiene codigo de juego, `/gamedev:gdd inventario`:
   sin el, los comandos de diseno no saben que hay construido. Si esta empezando, normalmente
   `/gamedev:loremaster iniciar` si el juego tiene mundo, o `/gamedev:mecanica` con la mecanica
   nucleo de mas riesgo.

## inventario

Para un proyecto que ya avanzo sin `.gamedev/`: recorre lo construido, lo clasifica y deja una
ficha inicial de cada pieza, para que los demas comandos partan de lo que existe y no disenen de
nuevo lo que ya funciona. No sustituye a documentar: anota lo que el codigo demuestra y marca el
resto como pendiente, que se completa cuando cada pieza se vuelva a tocar.

Si no hay `gdd.md`, haz antes `iniciar`: el inventario se cruza con el alcance. Con un `area`
("enemigos", "nivel 3"), limitate a ella.

### 1. Recorrer barato

Lo caro es leer codigo. Trabaja con nombres, declaraciones y datos, no con archivos enteros:

- **Acciones de entrada**: la mejor lista de verbos del jugador. La seccion `[input]` de
  `project.godot`, los `.inputactions` de Unity, `DefaultInput.ini` de Unreal, o el mapeo de
  teclas del codigo en un juego web.
- **Personaje del jugador**: sus estados y habilidades (busca la maquina de estados o los metodos
  de cada accion) y sus variables exportadas o serializadas, que son los parametros.
- **Niveles**: escenas, mapas o archivos de nivel, descartando los de prueba.
- **Enemigos y PNJ**: escenas, prefabs o clases que heredan de una base de enemigo o tienen IA.
- **Sistemas**: inventario, guardado, misiones, dialogos, economia, progresion.
- **Datos**: JSON, CSV o recursos del motor con estadisticas, objetos, tablas de botin.
- **Narrativa**: archivos de dialogo (`.ink`, `.yarn`, JSON), textos y documentos de historia.

Segun el `## Modo de consumo` de `.devteam/context.md`: en **economico**, hazlo tu y quedate en
nombres y declaraciones. En **equilibrado** o **maximo**, puedes encargar el barrido a un solo
agente `Explore` de solo lectura con esta lista, para no cargar esta sesion con el arbol del
proyecto; pidele rutas y evidencias, no contenidos.

### 2. Presentar antes de escribir

Muestra una tabla por tipo (mecanicas, niveles, enemigos, sistemas, narrativa) con la pieza, su
ruta en el proyecto y el estado aparente (completa, a medias, prototipo, abandonada). Pregunta que
se excluye: prototipos descartados, escenas de prueba, codigo que ya no se usa. **No escribas
nada hasta que el usuario lo apruebe.**

### 3. Fichas iniciales

Cada pieza aprobada recibe su ficha con la plantilla del comando que le corresponde
(`/gamedev:mecanica`, `/gamedev:nivel`, `/gamedev:bestiario`), con estas diferencias en la
cabecera:

```markdown
estado: implementada
documentacion: inventario <fecha>
codigo: [<rutas donde vive>]
```

- Rellena **solo lo que el codigo demuestra**: el verbo con su accion de entrada, las reglas que
  se leen en el codigo con su `archivo:linea`, los parametros con sus valores actuales, los
  estados de la maquina, las escenas.
- Lo que el codigo no dice (para que existe, como se ensena, como se mide, el papel de un enemigo
  en el diseno) queda como `<sin documentar>`. **No lo inventes**: una ficha que parece completa y
  es suposicion es peor que una que admite sus huecos.
- La narrativa no se convierte en fichas aqui: lista sus archivos y propon
  `/gamedev:loremaster fuente <ruta>` como tipo `propia`.

### 4. Cruzar con el GDD y dejar el informe

Escribe `.gamedev/inventario.md`:

```
| pieza | tipo | ruta en el codigo | ficha | estado | en el GDD |
```

seguido de los **huecos**: lo que el GDD promete y no esta construido, y lo construido que el GDD
no menciona (o falta en el GDD, o sobra en el juego). Enlaza las mecanicas inventariadas en la
seccion "Mecanicas nucleo" del GDD.

### 5. Repetirlo

El inventario se puede volver a ejecutar. Compara con `inventario.md` y trata solo lo nuevo o lo
cambiado. **Nunca sobrescribas una ficha que ya no tiene `documentacion: inventario`**: alguien la
completo, y vale mas que lo que se deduce del codigo; si el codigo la contradice, senalalo.

Cierra proponiendo por donde seguir: completar primero las fichas de la mecanica nucleo y de lo
que se vaya a tocar en la proxima tarea, no todas.

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
- Si `.devteam/context.md` tiene `## Modo de consumo`, respetalo. Solo `inventario` puede convocar
  un agente, y como mucho uno.
