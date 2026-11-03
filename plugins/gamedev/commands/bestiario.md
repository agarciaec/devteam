---
description: Disena enemigos jugables (rol en combate, estadisticas, comportamiento de IA, ataques con aviso, counters y variantes) coherentes con las criaturas del lore y el equilibrio del juego
argument-hint: "<enemigo o grupo a disenar, o el slug de una criatura del lore> | matriz | revisar <slug>"
---

# Bestiario

Peticion: $ARGUMENTS

En el lore, una criatura tiene historia y ecologia. En el bestiario tiene lo que necesita el
combate: un papel, unos numeros, un comportamiento que se pueda programar y una forma justa de
vencerla. Las dos fichas se enlazan, no se duplican.

## Antes de empezar

1. Lee `.gamedev/gdd.md` (pilares: un juego de sigilo y uno de accion necesitan enemigos muy
   distintos).
2. Si existe la criatura en `.gamedev/lore/criaturas/` o el jefe en `lore/jefes/`, leela: el
   comportamiento debe salir de su naturaleza.
3. Lee `.gamedev/bestiario/matriz.md` si existe: el reparto de roles actual.
4. Busca curvas de combate en `.gamedev/balance/combate/` y las mecanicas del jugador en
   `mecanicas/`: los counters solo valen si el jugador tiene con que aplicarlos.

## Que se pide

- **Un enemigo o un grupo**: si es abierto ("enemigos para el pantano"), propon primero el reparto
  de roles del grupo y luego desarrolla cada uno.
- `matriz`: crear o actualizar la matriz de roles y senalar huecos y redundancias.
- `revisar <slug>`: analizar un enemigo escrito o implementado sin cambiarlo.

## La ficha

`.gamedev/bestiario/<slug>.md`:

```markdown
---
enemigo: <nombre>
slug:
lore: <slug de la criatura o del jefe, si existe>
rol: carne de canon | tanque | distancia | apoyo | emboscada | elite | jefe
estado: borrador
---

# <nombre>

## Papel en el combate
<que le pide al jugador: moverse, priorizar, esperar el momento, romper una defensa>

## Estadisticas por nivel
| Nivel | Vida | Dano | Velocidad | Resistencias | Experiencia y botin |
<si existe el modelo de combate, salen de ahi; si no, marcadas como provisionales>

## Comportamiento
<maquina de estados: estados (patrulla, alerta, persecucion, ataque, huida...), que percibe
(vision, oido, distancias) y que dispara cada transicion. Lo bastante preciso para programarlo>

## Ataques
| Ataque | Aviso (que ve u oye el jugador y cuanto antes) | Dano | Alcance | Recuperacion |
<sin aviso legible, un ataque es injusto aunque los numeros cuadren>

## Counters
<como lo vence un jugador habil, y que mecanica del jugador lo permite>

## Variantes
<versiones de mas nivel o de otra region, con lo que cambia de verdad, no solo los numeros>

## En grupo
<con que otros enemigos combina bien y por que>

## Recursos necesarios
<animaciones, sonidos y efectos que exige el diseno, para /gamedev:assets>
```

## La matriz

`.gamedev/bestiario/matriz.md`: tabla de enemigos por rol y zona o acto. Sirve para ver de un
vistazo si una zona solo tiene enemigos que se resuelven igual, o si un rol nunca aparece.
Actualizala cada vez que se anade un enemigo.

## Comprobar antes de escribir

- Cada ataque tiene aviso y recuperacion: el jugador puede reaccionar y castigar.
- El comportamiento es coherente con el lore (una bestia carronera no carga de frente).
- No es otro enemigo con distinta piel: si se resuelve igual que uno existente, dilo y propon
  diferenciarlo o fusionarlos.
- Los counters dependen de mecanicas que el jugador ya tiene al encontrarlo.

## implementar

`.devteam/tasks/enemigo-<slug>/spec.md` con origen, la maquina de estados y los ataques como
alcance, los parametros en datos (no constantes en el codigo), criterios de aceptacion
verificables y **estado: pendiente**. Fila pendiente en `.devteam/tasks/index.md` y entrega
`/devteam:feature enemigo-<slug>`.

Escribe solo en `.gamedev/` (y en `.devteam/tasks/` al implementar).
