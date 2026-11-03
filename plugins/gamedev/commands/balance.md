---
description: Equilibra numeros del juego con simulacion por script en lugar de intuicion: curvas de experiencia, economia, botin, dano y tiempo para matar, dificultad y probabilidades
argument-hint: "<que equilibrar: progresion, economia, botin, combate, dificultad...> | revisar <tema>"
---

# Equilibrio y numeros

Peticion: $ARGUMENTS

El equilibrio a ojo falla siempre en el mismo sitio: lo que parece razonable en una tabla se
rompe a las veinte horas de juego, o cuando un jugador combina dos cosas. Por eso aqui los numeros
no se opinan: se modelan, se simulan con un script que cualquiera puede volver a ejecutar, y se
entregan con la grafica o la tabla que demuestra que hacen lo que se pretende.

## Antes de empezar

1. Lee `.gamedev/gdd.md`: los bucles y la progresion dicen que experiencia se busca (cuantas horas,
   que ritmo, cuanta frustracion es aceptable). Sin eso, pregunta el objetivo antes de calcular.
2. Lee las mecanicas implicadas en `.gamedev/mecanicas/` y sus tablas de parametros.
3. Busca los numeros reales en el proyecto: archivos de datos (JSON, CSV, YAML, recursos del
   motor) o constantes en el codigo. **Se equilibra lo que hay**, no una copia que el juego no lee.
4. Si existe `.gamedev/balance/<tema>/`, es una revision: parte del modelo anterior.

## Que se pide

Identifica el tema y su objetivo medible antes de tocar un numero:

| Tema | Objetivo tipico |
|---|---|
| Progresion | horas por nivel, nivel al terminar cada acto, cuando se desbloquea cada cosa |
| Economia | fuentes y sumideros de cada moneda, inflacion a lo largo de la partida, precio en horas de juego de cada objeto |
| Botin | probabilidad real de conseguir cada objeto, intentos esperados y en el peor 10% de jugadores |
| Combate | dano por segundo, tiempo para matar y para morir por nivel, cuantos golpes aguanta cada uno |
| Dificultad | curva de tension por nivel o acto, picos y respiros |

Si el objetivo no esta claro, propon uno con numeros ("nivel 20 al final del acto 2, unas 12
horas") y que el usuario lo confirme.

## El modelo

En `.gamedev/balance/<tema>/`:

1. **`parametros.csv` o `.json`**: los numeros, con los mismos nombres que en el juego. Si el
   proyecto ya tiene un archivo de datos, este es una vista de el o directamente el mismo.
2. **`sim.py`** (o `sim.js` si el proyecto es JavaScript y no hay Python): un script sin
   dependencias raras que lee los parametros y simula. Para lo determinista basta una tabla
   calculada; para el azar (botin, criticos, encuentros), **Monte Carlo** con semilla fija y
   suficientes iteraciones para que el resultado no cambie al repetir.
3. **Ejecuta el script** y guarda la salida en `resultados.md`, con tablas y, si ayuda, una grafica
   en PNG generada por el propio script cuando haya matplotlib o equivalente. Si no lo hay, tablas.

El script se ejecuta de verdad. Un resultado de balance que no salio de ejecutar el modelo es una
opinion.

## Que buscar en los resultados

- **Paredes**: puntos donde el progreso se frena de golpe (un nivel que cuesta el triple que el
  anterior).
- **Estrategias dominantes**: una opcion que gana siempre y vuelve inutiles a las demas.
- **Mala suerte extrema**: el peor 5-10% de jugadores. Un botin con media de 10 intentos puede
  exigir 45 al jugador desafortunado; si eso es inaceptable, propon proteccion contra la mala racha.
- **Inflacion**: monedas que se acumulan sin uso a mitad de partida.
- **Saltos de potencia** que trivializan el contenido siguiente.

## Propuesta

En `resultados.md`, despues de los datos: el diagnostico en pocas lineas, los cambios propuestos
(parametro, valor actual, valor nuevo, motivo) y **la simulacion repetida con los valores nuevos**,
para demostrar que el cambio arregla lo que dice sin romper otra cosa.

**No cambies los datos del juego sin aprobacion.** Muestra la tabla de cambios; al aprobarla,
actualiza el archivo de datos real si solo son valores. Si hace falta tocar codigo (una formula, un
sistema de proteccion contra la mala racha), deja la tarea a devteam:

## implementar

Escribe `.devteam/tasks/balance-<tema>/spec.md` con origen (la carpeta del modelo), los cambios,
los criterios de aceptacion (el resultado esperado de la simulacion) y **estado: pendiente**;
anade la fila pendiente a `.devteam/tasks/index.md` y entrega `/devteam:feature balance-<tema>`.

## Reglas

- Escribe solo en `.gamedev/balance/` salvo los valores aprobados.
- Cada numero cambiado tiene un motivo escrito.
- Recuerda en el informe que la simulacion valida la aritmetica, no la diversion: lo que salga
  necesita una prueba con jugadores (`/gamedev:playtest`).
