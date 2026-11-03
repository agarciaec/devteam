---
description: Escribe dialogos ramificados con condiciones y consecuencias usando la voz de cada personaje del canon, los valida y los exporta al formato del proyecto (Ink, Yarn, JSON o el del motor)
argument-hint: "<escena o conversacion: quien, donde, para que> | revisar <slug> | exportar <slug>"
---

# Dialogos

Peticion: $ARGUMENTS

Un dialogo de juego no es una escena de novela: el jugador elige, las elecciones cambian cosas, y
cada rama tiene que llegar a algun sitio. Este comando escribe con la voz que el lore ya fijo para
cada personaje y valida la estructura antes de exportarla.

## Antes de empezar

1. Lee `.gamedev/lore/biblia.md` (tono y limites) y la ficha de cada personaje que habla en
   `.gamedev/lore/personajes/`: su seccion **Voz** manda. Si un personaje no existe en el lore,
   dilo y propon crearlo con `/gamedev:loremaster` o, si es menor, describe su voz en el propio
   dialogo.
2. Si el dialogo pertenece a una mision, lee `lore/misiones/<slug>.md`: sus banderas de estado
   son las que el dialogo consulta y cambia.
3. **Busca el formato del proyecto**: archivos `.ink`, `.yarn`, JSON de dialogos, recursos de un
   plugin de dialogos del motor, o el sistema que use el codigo. Si no hay ninguno, el documento
   en Markdown es el entregable y se exporta a JSON simple.

## La escena

Si la peticion no lo dice, fija antes de escribir: quien habla, donde y cuando, **que tiene que
conseguir la escena** (informar, presentar a alguien, ofrecer una decision, revelar algo) y que
puede cambiar segun lo que elija el jugador.

## El documento

`.gamedev/dialogos/<slug>.md`:

```markdown
---
dialogo: <titulo>
slug:
mision: <slug, si pertenece a una>
personajes: [<slugs>]
estado: borrador
lee: [<banderas que consulta>]
escribe: [<banderas que cambia>]
---

# <titulo>

## Proposito
## Grafo
<nodos y saltos en una linea cada uno: inicio -> saludo -> {preguntar_pozo, amenazar, irse}>

## Nodos

### inicio
[si abad_vivo]
**Abad**: <linea>
- <opcion del jugador> -> saludo
- <opcion> [si reputacion_orden >= 2] -> confianza  {escribe: confia_abad = true}
```

Reglas de escritura:

- **Lineas cortas**: una linea de dialogo cabe en dos lineas de subtitulo (unos 80 caracteres en
  total). Si no cabe, se parte en dos.
- Las opciones del jugador dicen lo que el jugador va a decir o hacer, sin sorpresas: si la opcion
  pone "Preguntar por el pozo", el personaje del jugador no insulta a nadie.
- Las consecuencias importantes se notan en el momento (una reaccion, un cambio de tono), no solo
  en una bandera invisible.
- Las respuestas de relleno ("Hola de nuevo") estan previstas para cuando el jugador vuelve a
  hablar.

## Validar antes de entregar

Comprueba la estructura, a mano si es pequena o con un script si tiene mas de veinte nodos:

- Todos los nodos son alcanzables desde el inicio.
- Ninguna rama se queda sin salida: todas terminan o vuelven.
- Cada bandera que se consulta se escribe en algun sitio (aqui o en la mision), y cada una que se
  escribe se usa.
- Ninguna condicion deja al jugador sin ninguna opcion disponible.
- La voz de cada personaje cuadra con su ficha y el contenido con los limites de la biblia.

Si el proyecto usa Ink y esta instalado `inklecate`, compila el archivo exportado como
comprobacion final.

## exportar

Convierte el documento al formato del proyecto respetando sus convenciones (nombres de variables,
etiquetas de personaje, claves de localizacion si las hay). **Escribir fuera de `.gamedev/`
requiere aprobacion**: muestra antes la ruta destino. Si integrarlo exige codigo (un sistema de
dialogos nuevo, eventos), deja la tarea en `.devteam/tasks/dialogo-<slug>/spec.md` con **estado:
pendiente**, su fila en `.devteam/tasks/index.md`, y entrega `/devteam:feature dialogo-<slug>`.

## revisar

Pasa la validacion sobre un dialogo existente (del documento o del archivo del juego) y entrega
los hallazgos sin cambiar nada.
