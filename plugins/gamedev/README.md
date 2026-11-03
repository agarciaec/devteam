# gamedev

Equipo de diseno de videojuegos construido sobre la base de `devteam`. Donde `devteam` cubre el
codigo (arquitectura, backend, frontend, pruebas, publicacion), `gamedev` cubre lo que hace que un
juego sea un juego: el diseno, el mundo, los niveles, los numeros y las pruebas con jugadores. Y
aporta a devteam los especialistas que el codigo de un juego necesita.

Se instala junto a `devteam` desde el mismo marketplace, y funciona tambien sin el.

## Instalar

```bash
claude plugin install gamedev@devteam-local
```

Abre una sesion nueva de Claude Code para que aparezcan los comandos y los agentes.

## Uso rapido

| Paso | Cuando | Comando |
|---|---|---|
| 1. Ficha tecnica | Una vez por proyecto | `/devteam:onboard` o `/devteam:kickoff` |
| 2. Documento de diseno | Al empezar, y cuando algo cambia | `/gamedev:gdd` |
| 3. Mundo | Si el juego tiene historia | `/gamedev:loremaster iniciar`, luego `fuente` y crear |
| 4. Disenar | Cada pieza del juego | `/gamedev:mecanica`, `nivel`, `bestiario`, `dialogo`, `balance` |
| 5. Construir | Cada pieza disenada | `implementar <slug>` en el comando de diseno, luego `/devteam:feature <slug>` |
| 6. Probar con jugadores | Cada hito jugable | `/gamedev:playtest plan`, luego `analizar` |
| 7. Producir | En paralelo al desarrollo | `/gamedev:assets`, `/gamedev:localizar` |
| 8. Presentar | Antes de buscar publisher, tienda o prensa | `/gamedev:pitch` |

Para una game jam, todo lo anterior se sustituye por `/gamedev:jam <tema>`.

### Proyecto ya empezado con devteam

No se repite el onboarding: la ficha tecnica ya existe.

1. Sesion nueva en el proyecto, y `/devteam:standup` si hace tiempo que no se toca.
2. `/gamedev:gdd`: lee lo que ya hay, pregunta solo lo que falta y presenta los agentes de juego a
   devteam.
3. `/gamedev:gdd inventario`: recorre lo construido (acciones de entrada, personaje, niveles,
   enemigos, sistemas, datos, narrativa), te lo ensena para que excluyas prototipos y pruebas, y
   deja una ficha inicial de cada pieza con lo que el codigo demuestra y el resto marcado como
   `<sin documentar>`. Cruza todo con el GDD en `.gamedev/inventario.md`.
4. Completa solo las fichas de lo que vayas a tocar: `/gamedev:mecanica <slug>` completa una ficha
   de inventario en lugar de rehacerla.
5. Si hay historia escrita, `/gamedev:loremaster iniciar` y `fuente <ruta>` como tipo `propia`.
6. Sigue con el ciclo normal: disenar, `implementar`, `/devteam:feature`.

## Principios heredados de devteam

- **La memoria es un archivo.** Todo lo que el equipo descubre o crea queda en `.gamedev/` dentro
  del proyecto. Ningun agente recuerda nada entre sesiones; lo que si ocurre es que todos leen lo
  escrito antes de trabajar. El GDD es para el diseno lo que `context.md` para el codigo.
- **Genericos por oficio, especializados por proyecto.** Ningun comando ni agente es de un motor:
  Godot, Unity, Unreal o un framework web salen de la ficha del proyecto.
- **Consumo contenido.** Respeta el `## Modo de consumo` de `.devteam/context.md`. La sesion
  principal disena; los agentes solo entran para leer fuentes largas, revisar en modo maximo, o
  implementar desde `/devteam:feature`.
- **Lo que se disena se deja escrito como tarea.** Todos los comandos de diseno tienen
  `implementar <slug>`, que deja `.devteam/tasks/<slug>/spec.md` pendiente para `/devteam:feature`
  o `/devteam:sprint`.
- **Solo la sesion principal escribe fuera de `.gamedev/`**, y siempre con aprobacion.

## Comandos

| Comando | Que hace |
|---|---|
| `/gdd [iniciar \| inventario \| actualizar \| consultar \| recortar]` | Documento de diseno vivo y corto: fantasia del jugador, pilares que deciden, bucles, alcance con lista de recortes y lo que el juego no es. Presenta los agentes de gamedev a devteam. `inventario` deja fichas iniciales de lo ya construido en un proyecto empezado. |
| `/loremaster` | Mundo y narrativa alimentados por fuentes: personajes, biografias, nombres, jefes, mazmorras, misiones, facciones, lugares, criaturas, objetos y eventos, con canon trazable. Detalle abajo. |
| `/mecanica <idea>` | Mecanica implementable: reglas cerradas, parametros con unidad, estados, respuesta al jugador, casos limite, interacciones, como se ensena, como se mide y prototipo minimo. |
| `/balance <tema>` | Numeros por simulacion: progresion, economia, botin, combate y dificultad, con un script que se puede volver a ejecutar. Busca paredes, estrategias dominantes, mala suerte extrema e inflacion. |
| `/nivel <idea o slug del lore>` | Nivel construible: flujo con llaves y cerraduras, ritmo, blockout medido con las metricas del personaje, ensenanza sin texto y orientacion. Comprueba que no hay bloqueos sin salida. |
| `/bestiario <enemigo \| matriz>` | Enemigos jugables: rol, estadisticas por nivel, maquina de estados, ataques con aviso, counters, variantes, y la matriz de roles por zona. |
| `/dialogo <escena>` | Dialogos ramificados con la voz de cada personaje del canon y las banderas de las misiones, validados (sin ramas muertas ni banderas huerfanas) y exportados a Ink, Yarn, JSON o el formato del motor. |
| `/assets [inventario \| brief \| estado \| slice]` | Cruza lo que el diseno pide con lo que hay en el proyecto y prepara encargos con requisitos tecnicos del motor. |
| `/playtest [plan \| analizar]` | Pruebas con jugadores alrededor de preguntas concretas; el analisis separa lo que hacen de lo que dicen y deja tareas escritas. |
| `/localizar [auditar \| glosario \| contexto \| pseudo]` | Prepara la traduccion: textos incrustados, concatenaciones, espacio en la interfaz, fuentes tipograficas, glosario de terminos del mundo y pseudolocalizacion. |
| `/pitch <pieza>` | Frase de venta, one-pager, pagina de tienda, guion de trailer, presentacion para publisher y kit de prensa, sin prometer nada que el juego no tenga. |
| `/jam <tema>` | Plan de game jam: conceptos para el tema, alcance minimo jugable al 40% del tiempo, mejoras cortables en orden, bloques por horas y entrega. |

## /loremaster

El maestro del lore. Se alimenta de fuentes (historia, novelas, mitos, documentos del equipo) y
crea contenido coherente con el canon y trazable hasta su inspiracion.

| Uso | Que hace |
|---|---|
| `/loremaster` | Estado del mundo: fuentes, entidades y borradores pendientes |
| `/loremaster iniciar` | Crea la biblia: juego, tono, ambientacion, reglas, estilo de nombres |
| `/loremaster fuente ./docs/cronica.pdf` | Ingiere una fuente y deja su ficha |
| `/loremaster fuente la peste negra en Florencia` | Investiga un tema en la web y deja su ficha |
| `/loremaster jefe para el acto 2` | Propone tres conceptos y desarrolla el elegido |
| `/loremaster mazmorra en unas minas de sal medievales` | Crea la mazmorra con su mapa de flujo |
| `/loremaster nombres nordicos 20` | Banco de nombres con etimologia y regla fonetica |
| `/loremaster mision secundaria en el puerto` | Mision con ramas, banderas de estado y recompensas |
| `/loremaster biografia del abad` | Biografia extensa de un personaje |
| `/loremaster consultar quien fundo la orden` | Responde desde el canon, distinguiendo lo no definido |
| `/loremaster revisar` | Informe de continuidad: fechas, muertos, nombres, referencias rotas |
| `/loremaster canonizar lo de hoy` | Aprueba borradores como canon |
| `/loremaster exportar` | Canon a datos para el motor (JSON, recursos de Godot, ScriptableObjects...) |
| `/loremaster implementar jefe-abad` | Deja la tarea en `.devteam/tasks/` para `/devteam:feature` |

### Derechos de las fuentes

Cada fuente se clasifica al ingerirla, y la clasificacion decide que se puede tomar de ella:

| Tipo | Que se toma |
|---|---|
| `historica` | Todo: los hechos no tienen dueno |
| `dominio-publico` | Personajes, tramas y nombres, citados |
| `protegida` | Solo temas, estructuras, arquetipos, tono y contexto historico. Nunca nombres inventados, lugares ficticios, tramas reconocibles ni texto |
| `propia` | Todo |

La ficha de una fuente protegida incluye una seccion **No usar** con sus elementos reconocibles,
y todo lo creado se comprueba contra ella antes de escribirse.

### Canon y borradores

Lo que crea `/loremaster` nace en `borrador` y no obliga a nada. Al canonizarlo pasa a ser canon,
y desde entonces ninguna pieza nueva puede contradecirlo sin una decision explicita que queda
anotada en la biblia. Lo descartado se conserva y libera sus nombres.

## Agentes

| Agente | Oficio | Quien lo convoca |
|---|---|---|
| `lore-researcher` | Lee una fuente larga (PDF, EPUB, web, carpeta o tema) y la reduce a una ficha util para el juego, respetando sus derechos | `/loremaster fuente` |
| `game-designer` | Revisa mecanicas, niveles, enemigos y ritmo frente a los pilares, en documentos o en lo implementado. No escribe codigo | `/mecanica` y `/nivel` en modo maximo; `/devteam:feature` al verificar |
| `gameplay-programmer` | Codigo de juego en cualquier motor: bucle, entrada, fisica, camaras, estados, IA, combate, guardado | `/devteam:feature`, en lugar de `frontend` y `backend` |
| `engine-specialist` | Estructura del proyecto en el motor, exportacion por plataforma, tiendas y rendimiento medido | `/devteam:feature` |

### Como entran en devteam

`/gamedev:gdd` anade a `.devteam/context.md` una seccion `## Especialistas adicionales` que
nombra a los tres agentes de juego y para que sirve cada uno. Desde devteam 0.13.2, `/feature` lee
esa seccion y los convoca en lugar de los especialistas web, o ademas de ellos, respetando el
presupuesto del modo de consumo. Asi devteam no necesita saber nada de juegos.

## Estructura de `.gamedev/` en cada proyecto

```
.gamedev/
  gdd.md               documento de diseno: lo leen todos los comandos
  inventario.md        piezas ya construidas, sus fichas y los huecos frente al GDD
  lore/                biblia, indice, glosario, cronologia, fuentes y entidades (/loremaster)
  mecanicas/           una por archivo (/mecanica)
  balance/<tema>/      parametros, sim.py y resultados (/balance)
  niveles/             (/nivel)
  bestiario/           enemigos y matriz.md (/bestiario)
  dialogos/            (/dialogo)
  assets/              index.md y briefs/ (/assets)
  playtest/<fecha>-<slug>/  plan.md y resultados.md (/playtest)
  loc/                 auditorias y glosario de traduccion (/localizar)
  pitch/               (/pitch)
  jam/                 (/jam)
  revisiones/          informes de game-designer sobre documentos
  export/              datos exportados cuando el proyecto no tiene formato propio
```

Conviene versionarla con el proyecto: es la documentacion de diseno del juego.
