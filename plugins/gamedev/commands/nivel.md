---
description: Disena un nivel jugable (flujo, ritmo, llaves y cerraduras, ensenanza sin texto, puntos de referencia y medidas) a partir de una mazmorra o un lugar del lore, o desde cero
argument-hint: "<nivel a disenar, o el slug de una mazmorra o lugar del lore> | revisar <slug>"
---

# Diseno de nivel

Peticion: $ARGUMENTS

El lore dice que paso en un lugar; el nivel decide como lo recorre el jugador. Este comando
convierte una idea o una mazmorra del lore en un plano que se puede construir: con su ruta
critica, su ritmo, lo que ensena y las medidas que impone el movimiento del personaje.

## Antes de empezar

1. Lee `.gamedev/gdd.md` (pilares y bucles).
2. Si la peticion nombra una entidad del lore, lee `.gamedev/lore/mazmorras/<slug>.md` o
   `lugares/<slug>.md`: su historia, su mapa de flujo y su jefe son el punto de partida. Si hay
   jefe o criaturas, lee sus fichas en `lore/` y `bestiario/`.
3. **Lee las medidas del personaje** en `.gamedev/mecanicas/` o en el codigo: altura y distancia
   de salto, velocidad, radio de vision o de ataque, altura de cobertura. Un nivel disenado sin
   ellas no se puede construir sin rehacerlo. Si no existen, pregunta o propon valores y
   marcalos como provisionales.
4. Mira los niveles ya disenados en `.gamedev/niveles/` (solo cabeceras) para no repetir
   estructura y para saber que ha aprendido ya el jugador al llegar aqui.

## El documento

Escribe `.gamedev/niveles/<slug>.md`:

```markdown
---
nivel: <nombre>
slug:
estado: borrador | blockout | jugable | final
origen: <slug del lore, si viene de ahi>
posicion: <acto o momento de la partida>
duracion_objetivo: <minutos>
---

# <nombre>

## Objetivo de diseno
<que aprende, siente o demuestra el jugador aqui>

## Lo que el jugador ya sabe y lo que es nuevo
<mecanicas dominadas al llegar; la que se introduce o se examina aqui>

## Flujo
<grafo de zonas con ruta critica y opcionales, llaves y cerraduras:
Entrada -> Patio -> {Torre (opcional), Puerta [llave: palanca de la torre]} -> Sala del jefe>

## Ritmo
| Zona | Funcion (introduccion, practica, variacion, examen, respiro, climax) | Tension 1-5 | Minutos |

## Blockout
<por zona: un plano en cuadricula de texto o una descripcion medida, con la leyenda de simbolos.
Medidas en las unidades del juego, coherentes con las del personaje>

## Ensenanza sin texto
<como se presenta cada elemento nuevo en un sitio seguro antes de exigirlo>

## Orientacion
<puntos de referencia visibles, lineas de vision, luz y color que guian, como se evita que el
jugador se pierda o vuelva sobre sus pasos sin querer>

## Encuentros
<enemigos por zona (slugs del bestiario), por que estan ahi y que combinan>

## Secretos, atajos y recompensas
<que se ve antes de poder alcanzarse; atajos que se abren al volver>

## Narrativa ambiental
<lo que cuenta el espacio, sacado del lore>

## Riesgos de construccion
<lo que puede salir mal al montarlo: escala, rendimiento, bloqueos sin salida>
```

## Comprobar antes de escribir

- **No hay bloqueos sin salida**: desde cualquier punto se puede terminar o volver. Recorre el
  grafo de llaves y cerraduras y comprueba que ninguna llave queda detras de su propia cerradura.
- La ruta critica se puede seguir sin conocer los secretos.
- Cada distancia que el jugador tiene que salvar es posible con las medidas del personaje, y las
  que no debe salvar son claramente imposibles.
- La curva de tension tiene respiros, y el climax llega despues de practicar lo que examina.

## revisar

Analiza un nivel escrito o implementado (si hay escena en el motor, lee su estructura) con la
misma lista, y entrega hallazgos con su arreglo sin cambiar nada.

## implementar

Escribe `.devteam/tasks/nivel-<slug>/spec.md`: origen, el blockout como alcance de la primera
iteracion (geometria gris, sin arte), los encuentros y activadores que hacen falta, criterios de
aceptacion (se completa de principio a fin, sin bloqueos, en la duracion objetivo) y **estado:
pendiente**. Fila pendiente en `.devteam/tasks/index.md` y entrega
`/devteam:feature nivel-<slug>`.

## Reglas

Escribe solo en `.gamedev/` (y en `.devteam/tasks/` al implementar). Si en `.devteam/context.md`
el modo de consumo es maximo, `game-designer` revisa el nivel antes de presentarlo.
