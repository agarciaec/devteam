# gamedev

Equipo de diseno de videojuegos construido sobre la base de `devteam`. Donde `devteam` cubre el
codigo (arquitectura, backend, frontend, pruebas, publicacion), `gamedev` cubre lo que hace que un
juego sea un juego: mundo, narrativa y, en las siguientes versiones, mecanicas, niveles y
equilibrio.

Se instala junto a `devteam` desde el mismo marketplace, y funciona tambien sin el.

## Instalar

```bash
claude plugin install gamedev@devteam-local
```

Abre una sesion nueva de Claude Code para que aparezcan el comando y el agente.

## Principios heredados de devteam

- **La memoria es un archivo.** Todo lo que el equipo descubre o crea queda en `.gamedev/` dentro
  del proyecto. Ningun agente recuerda nada entre sesiones; lo que si ocurre es que todos leen lo
  escrito antes de trabajar.
- **Genericos por oficio, especializados por proyecto.** Ni el comando ni el agente saben nada de
  tu juego: la biblia del mundo se lo dice.
- **Consumo contenido.** Respeta el `## Modo de consumo` de `.devteam/context.md` si existe. La
  sesion principal crea; los agentes solo entran para leer fuentes largas, que es donde aislar la
  lectura ahorra.
- **Solo la sesion principal escribe fuera de `.gamedev/`**, y siempre con aprobacion.

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

Tipos que sabe crear: personaje, biografia, nombres, jefe, mazmorra, mision, faccion, lugar,
criatura, objeto y evento.

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

### Estructura de `.gamedev/` en cada proyecto

```
.gamedev/
  lore/
    biblia.md          premisa, tono, reglas del mundo y estilo de nombres
    index.md           registro de entidades con sus datos clave
    glosario.md        nombres en uso
    cronologia.md      eventos del mundo
    fuentes/           index.md y una ficha por fuente
    nombres/           bancos de nombres por cultura
    personajes/ jefes/ mazmorras/ misiones/ facciones/ lugares/ criaturas/ objetos/ eventos/
    revisiones/        informes de continuidad
  export/              datos exportados cuando el proyecto no tiene formato propio
```

Conviene versionarla con el proyecto: es el documento de diseno narrativo del juego.

## Agentes

| Agente | Oficio |
|---|---|
| `lore-researcher` | Lee una fuente larga (PDF, EPUB, web, carpeta o tema) y la reduce a una ficha util para el juego, respetando sus derechos |

## Hoja de ruta

Comandos recomendados para las siguientes versiones, en orden de valor. Todos siguen el mismo
patron: leen `.gamedev/` y la ficha de devteam, crean en la sesion principal, dejan lo creado por
escrito y ofrecen el puente a `/devteam:feature` para implementarlo.

**Diseno** (siguientes en prioridad):

| Comando | Para que |
|---|---|
| `/gdd` | Documento de diseno vivo: pilares, bucle principal, publico, alcance y lo que el juego no es. Es la referencia que todos los demas comandos leen, como la biblia lo es para el lore |
| `/dialogo` | Arboles de dialogo con ramas y condiciones a partir de la voz de cada personaje del canon; exporta a Ink, Yarn o JSON |
| `/mecanica` | Disena una mecanica: reglas, parametros, casos limite, como se ensena al jugador y como interactua con las demas |
| `/balance` | Curvas de experiencia, economia, tablas de botin, dano y tiempo para matar, con simulacion por script en lugar de intuicion |
| `/nivel` | Diseno de niveles: grafo de flujo, ritmo, llaves y cerraduras, ensenanza sin texto; convierte una mazmorra del lore en un blockout |
| `/bestiario` | Enemigos con estadisticas, comportamiento de IA y counters, coherentes con las criaturas del lore |

**Produccion**:

| Comando | Para que |
|---|---|
| `/assets` | Lista de recursos de arte y audio por entidad del lore, con su estado y briefs para artistas |
| `/playtest` | Plan de sesion de prueba, encuesta y analisis de las respuestas convertido en tareas |
| `/localizar` | Extrae los textos, mantiene un glosario de terminos del mundo para traductores y vigila longitudes en la interfaz |
| `/pitch` | One-pager, texto de tienda, guion de trailer o presentacion para un publisher, a partir del GDD |
| `/jam` | Recorta una idea al alcance de una game jam de 48 o 72 horas |

**Tecnico**, que conviene resolver como agentes de `gamedev` usados desde los comandos de
`devteam` y no como comandos nuevos:

| Agente | Oficio |
|---|---|
| `gameplay-programmer` | Bucle de juego, entradas, fisica, camaras, maquinas de estado, IA de enemigos, en cualquier motor |
| `engine-specialist` | Estructura del proyecto en el motor, escenas, recursos, exportacion por plataforma y rendimiento (tiempo de fotograma, llamadas de dibujo, memoria) |
| `game-designer` | Revisa mecanicas, ritmo y curva de dificultad de lo implementado frente al GDD |

Siguiendo la regla de devteam, ninguno es por motor: `gameplay-programmer` cubre Godot, Unity,
Unreal o un framework web, y el motor concreto sale de la ficha del proyecto.
