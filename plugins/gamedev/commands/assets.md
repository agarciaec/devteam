---
description: Inventario de recursos de arte y audio que exige el diseno (personajes, entornos, objetos, interfaz, efectos, sonido, musica, voces), con su estado real en el proyecto y briefs listos para artistas o herramientas
argument-hint: "[inventario | brief <slug o recurso> | estado | slice]"
---

# Recursos de arte y audio

Peticion: $ARGUMENTS

Cada pieza de diseno arrastra recursos: un jefe necesita modelo, animaciones, sonidos y efectos;
una mazmorra, un kit de entorno y musica. Este comando hace visible esa deuda, la cruza con lo que
ya existe en el proyecto y prepara encargos que un artista pueda ejecutar sin una reunion.

## Que se pide

| Peticion | Que hacer |
|---|---|
| `inventario` (o vacia sin inventario previo) | Construir o actualizar `.gamedev/assets/index.md` |
| `estado` (o vacia con inventario) | Resumen: cuantos por tipo y estado, que bloquea el siguiente hito |
| `brief <slug>` | Encargo detallado de un recurso o de todos los de una entidad |
| `slice` | Lo minimo imprescindible para la vertical slice del GDD |

## inventario

1. **Reune la demanda** sin leer todo: `index.md` del lore, `bestiario/` (seccion Recursos
   necesarios), `niveles/` y las mecanicas (su seccion Respuesta al jugador lista efectos y
   sonidos). Usa Grep sobre esas secciones en lugar de abrir cada archivo entero.
2. **Reune la oferta**: lista las carpetas de recursos del proyecto segun el motor (`Assets/`,
   `res://` de Godot, `Content/` de Unreal, `public/` o `assets/` en web). Solo nombres, no
   contenido.
3. **Cruza** por nombre y marca cada recurso: `pendiente`, `provisional` (existe un sustituto),
   `en curso` o `final`. Lo que existe en el proyecto y nadie pide tambien se lista: puede ser
   sobrante o diseno no escrito.
4. Escribe `.gamedev/assets/index.md`:

   ```
   | id | tipo | para (slug) | estado | prioridad | ruta en el proyecto | notas |
   ```

   Tipos: personaje, criatura, entorno, objeto, interfaz, icono, efecto visual, animacion, sonido,
   musica, voz. Prioridad segun el alcance del GDD: slice, v1 o despues.

## brief

`.gamedev/assets/briefs/<id>.md`, todo lo que un artista necesita:

- **Que es y para que**: la entidad del lore o del diseno, en tres lineas, y donde se vera.
- **Lectura**: que tiene que comunicar al instante (peligro, valor, faccion). La silueta y el
  sonido se reconocen antes que el detalle.
- **Estilo**: el del proyecto (busca una guia de arte en el repositorio o en el GDD); paleta,
  proporciones, nivel de detalle. Referencias descritas con palabras, no copiadas de otras obras.
- **Requisitos tecnicos del motor**: resolucion o presupuesto de poligonos, pivote, escala en
  unidades del juego, formato y compresion de textura; para audio, formato, frecuencia, bucle o
  no, duracion y variaciones necesarias para que no se repita.
- **Lista de entregables**: por ejemplo, para un enemigo, el modelo y cada animacion que pide su
  ficha del bestiario (reposo, andar, cada ataque con su aviso, golpe recibido, muerte).
- **Indicaciones para herramientas generativas** si el usuario las usa: una descripcion de
  partida coherente con el estilo. Recuerda dos cosas en el brief: revisar la licencia de la
  herramienta para uso comercial, y que tiendas como Steam piden declarar el contenido generado.

## Reglas

- Escribe solo en `.gamedev/assets/`. No mueves ni renombras recursos del proyecto: si conviene
  hacerlo, propon la tarea a devteam.
- Una pieza de diseno en estado canon o validada sin sus recursos en el inventario es un hueco:
  senalalo al actualizar.
- Si el modo de consumo de `.devteam/context.md` es economico, el inventario se limita a lo de
  prioridad slice.
