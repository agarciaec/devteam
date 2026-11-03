---
description: Disena una mecanica de juego completa (reglas, parametros, estados, respuesta al jugador, casos limite, como se ensena y como se mide) lista para prototipar
argument-hint: "<la mecanica a disenar o revisar> | revisar <slug> | implementar <slug>"
---

# Diseno de mecanica

Peticion: $ARGUMENTS

Una mecanica bien disenada se puede implementar sin preguntar nada y se puede juzgar sin
discutir gustos: tiene reglas cerradas, numeros con unidades, y una forma de saber si funciona.
Eso es lo que entrega este comando.

## Antes de empezar

1. Lee `.gamedev/gdd.md`. Si no existe, dilo y propon `/gamedev:gdd`; puedes seguir, pero sin
   pilares no hay forma de decidir si la mecanica sirve al juego.
2. Mira `.gamedev/mecanicas/` (solo los nombres y las cabeceras) para conocer las que ya existen:
   la nueva tiene que convivir con ellas.
3. Si la mecanica toca el mundo (magia, oficios, facciones), busca con Grep en `.gamedev/lore/` lo
   pertinente: la regla del mundo y la regla del juego no pueden contradecirse.
4. Si ya hay codigo de juego, localiza con Grep si algo parecido existe implementado. Disenar en
   el vacio lo que ya esta a medias en el codigo es trabajo tirado.

## Que se pide

- **Una mecanica nueva**: si la peticion es una idea vaga ("algo de sigilo"), propon dos o tres
  enfoques distintos en dos lineas cada uno, con el pilar al que sirven, y pregunta. Si es
  concreta, desarrolla.
- `revisar <slug>`: analiza una mecanica ya escrita o implementada buscando huecos, exploits y
  conflictos con las demas, sin cambiar nada.
- `implementar <slug>`: el puente con devteam, abajo.

## El documento

Escribe `.gamedev/mecanicas/<slug>.md`:

```markdown
---
mecanica: <nombre>
slug:
estado: borrador | prototipo | validada | descartada
pilares: [<los del GDD a los que sirve>]
creado: <fecha>
---

# <nombre>

## Para que existe
<que decision o sensacion le da al jugador, y que pilar sostiene>

## El verbo
<la accion del jugador, con la entrada concreta: tecla, boton, gesto>

## Reglas
<numeradas, cerradas: un programador las implementa sin interpretar>

## Parametros
| Parametro | Valor inicial | Rango razonable | Unidad | Que cambia al subirlo |

## Estados
<estados y transiciones, con lo que dispara cada una>

## Respuesta al jugador
<lo que ve, oye y siente en cada momento: animacion, efecto visual, sonido, camara, vibracion.
Una mecanica sin respuesta clara se percibe como rota aunque funcione>

## Casos limite
<lo que pasa en los bordes: entrada repetida, interrupcion, sin recursos, dos efectos a la vez,
perdida de foco, latencia en red si la hay>

## Interacciones
| Con | Que pasa | Riesgo |
<con cada mecanica existente que pueda coincidir con esta>

## Como se ensena
<presentacion segura, practica, variacion, examen. Sin texto si se puede>

## Como se mide
<que observar en una prueba con jugadores y que dato registrar para saber si funciona>

## Exploits y abusos
<como la romperia un jugador que busca el beneficio maximo, y si importa>

## Prototipo minimo
<lo menos que hay que construir para saber si es divertida, y la pregunta que responde>
```

Los parametros se nombran como se nombrarian en el codigo (`velocidad_sigilo`), porque
`/gamedev:balance` los va a usar y el codigo los va a leer.

## Comprobar antes de escribir

- Cada regla es verificable. "El enemigo reacciona de forma creible" no lo es; "el enemigo oye al
  jugador a menos de `radio_ruido` metros si corre" si.
- Cada parametro tiene unidad.
- No contradice ningun pilar ni ninguna mecanica en estado validada.
- La seccion de interacciones cubre todas las mecanicas existentes que puedan coincidir.

## Revision por un especialista

Segun el `## Modo de consumo` de `.devteam/context.md` (equilibrado si no hay): en **maximo**,
convoca a `game-designer` para revisar el documento antes de presentarlo. En los demas, revisalo
tu con la lista de arriba.

## implementar

Si hay `.devteam/`, escribe `.devteam/tasks/<slug>/spec.md` con origen (la ruta del documento), el
prototipo minimo como alcance, los parametros expuestos para ajustarlos sin recompilar, criterios
de aceptacion sacados de las reglas y los casos limite, nivel de esfuerzo sugerido y **estado:
pendiente**. Anade la fila pendiente a `.devteam/tasks/index.md` y entrega
`/devteam:feature <slug>`. Si no hay `.devteam/`, propon `/devteam:onboard` primero.

## Informe

La ruta, la mecanica en tres lineas, los riesgos principales y la pregunta que respondera el
prototipo. Escribe solo en `.gamedev/` (y en `.devteam/tasks/` al implementar).
