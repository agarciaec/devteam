---
description: Revisa toda la interfaz visual, propone cuanto cambiarla segun la necesidad y planifica la actualizacion por etapas
argument-hint: Opcional, un area de la aplicacion o el objetivo (mas productiva, mas moderna, movil, accesible)
---

# Revision y actualizacion de la interfaz

Vas a revisar la interfaz completa de la aplicacion, acordar con el usuario cuanto hay que cambiarla,
y dejar un plan que se ejecuta por etapas. Coordinas a `ui-designer` como responsable, con `frontend`
para la viabilidad.

Objetivo o area indicada por el usuario: $ARGUMENTS

**Hasta la Fase 4 nadie modifica codigo.** Primero se entiende lo que hay, despues se decide y
despues se cambia. Un rediseno que empieza cambiando pantallas sin diagnostico ni direccion acordada
termina con una aplicacion mas incoherente que la de partida.

---

## Fase 0: Preparacion

1. Lee `.devteam/context.md`, en particular el apartado de sistema de diseno, y `decisions.md`. Si no
   hay ficha, propon `/onboard` primero.
2. Crea `.devteam/redesign/<fecha>/` para este trabajo.
3. Pregunta al usuario lo que el codigo no dice, **en una sola tanda**: quien usa la aplicacion y en
   que dispositivo, que tareas hacen mas a menudo, de que se quejan, y si hay identidad de marca que
   haya que conservar. Un rediseno sin saber para quien es se convierte en una cuestion de gusto.

## Fase 1: Inventario de lo que existe

Convoca en paralelo, en un solo mensaje:

- `ui-designer`: inventario de pantallas y flujos, componentes, estilos y tokens reales, con sus
  inconsistencias.
- `frontend`: como estan construidos los estilos y componentes, que libreria se usa, cuanto cuesta
  cambiar cada cosa, y que limitaciones tecnicas pone el stack.

**Mira la interfaz real, no solo el codigo.** Si la aplicacion se puede arrancar en local y hay una
herramienta de navegador disponible, captura cada pantalla principal en movil y escritorio y guarda
las capturas en la carpeta del rediseno. El codigo no cuenta como se ve de verdad una pantalla con
datos reales. Si no se puede arrancar, dilo y trabaja con lo que haya.

## Fase 2: Diagnostico

`ui-designer` escribe `diagnosis.md`, con evidencia en cada punto (pantalla, captura o
`archivo:linea`), ordenado por impacto en el usuario:

- **Usabilidad**: flujos con pasos de sobra, acciones principales que no se distinguen, formularios
  que obligan a adivinar, estados de carga, vacio y error sin disenar.
- **Consistencia**: el mismo componente con aspectos distintos, espaciados y colores sin criterio,
  pantallas que parecen de aplicaciones diferentes.
- **Accesibilidad**: contraste insuficiente, foco invisible, cosas que no se pueden hacer con teclado.
- **Adaptacion**: como se comporta en movil y en pantallas grandes.
- **Actualidad**: patrones visuales anticuados y lo que la plataforma ofrece hoy y aqui encajaria.
- **Lo que funciona bien**: tambien se anota, porque un rediseno no deberia romperlo.

## Fase 3: Decidir el nivel de intervencion

Presenta el diagnostico al usuario y propon uno de estos niveles, con tu recomendacion y el motivo:

1. **Pulir**: corregir problemas dentro del diseno actual. Bajo riesgo, poco esfuerzo, los usuarios
   apenas notan el cambio salvo porque las cosas funcionan mejor.
2. **Evolucionar**: modernizar el sistema de diseno —tokens, componentes, movimiento— conservando la
   estructura y los flujos que los usuarios ya conocen. Suele ser lo que mas rinde.
3. **Redisenar**: direccion visual y de experiencia nueva. Solo cuando lo actual no se puede salvar o
   el objetivo del producto cambio; tiene coste real para quien ya usa la aplicacion y tiene que
   reaprender.

Para los niveles 2 y 3, `ui-designer` prepara prototipos de la direccion propuesta aplicada a **dos o
tres pantallas representativas** —la mas usada y la mas compleja— para que el usuario vea el
resultado sobre sus pantallas reales, no sobre un ejemplo generico. En el nivel 3, dos o tres
direcciones contrastadas para elegir.

**No sigas sin la decision del usuario.** Registra el nivel elegido y la direccion en
`.devteam/decisions.md`: es una decision que condiciona todo el trabajo de interfaz de aqui en
adelante.

## Fase 4: Plan por etapas

Con la direccion aprobada, `ui-designer` escribe `plan.md` y el sistema de diseno actualizado.

El orden importa:

1. **Primero el sistema, despues las pantallas.** Tokens y componentes base se actualizan antes que
   ninguna pantalla; si no, cada pantalla reinventa su parte del sistema y se vuelve a la
   incoherencia de partida.
2. **Pantalla a pantalla, nunca todo de golpe.** Cada etapa deja la aplicacion funcionando y
   publicable. Un rediseno de golpe es un cambio enorme imposible de revisar y de revertir.
3. **Por valor**: las pantallas mas usadas o con mas quejas, primero.

Convierte el plan en tareas, cada una con su alcance y su `ui.md`, y anotalas en
`.devteam/tasks/index.md` como pendientes.

## Fase 5: Ejecucion

Cada tarea del plan se hace con `/feature`, que ya integra la especificacion visual, la
implementacion, la verificacion y la publicacion. Propon al usuario empezar por la primera y **no
empieces ninguna sin su aprobacion**.

Actualiza el apartado de sistema de diseno de `.devteam/context.md` a medida que el sistema nuevo se
implante, para que el resto del equipo trabaje con el sistema vigente y no con el antiguo.

## Cierre

Resume: que se encontro, que nivel se eligio y por que, que se hara en cada etapa, y cual es la
primera tarea propuesta. Si la interfaz esta bien y solo necesita retoques menores, dilo sin
exagerar: no todo proyecto necesita un rediseno.
