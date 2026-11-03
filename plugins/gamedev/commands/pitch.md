---
description: Escribe material para presentar el juego a partir del GDD y el lore: frase de venta, one-pager, pagina de tienda, guion de trailer, guion de presentacion para un publisher y kit de prensa
argument-hint: "<frase | onepager | tienda | trailer | publisher | prensa> [publico o plataforma]"
---

# Presentar el juego

Peticion: $ARGUMENTS

Presentar un juego es elegir: de todo lo que tiene, que tres cosas hacen que alguien quiera
jugarlo. El material sale del GDD y del lore, no de la imaginacion, y no promete nada que el juego
no vaya a tener.

## Antes de empezar

1. Lee `.gamedev/gdd.md`: fantasia del jugador, pilares, referencias y alcance. Sin GDD, propon
   `/gamedev:gdd` primero; un pitch sin el acaba vendiendo otro juego.
2. Lee `.gamedev/lore/biblia.md` si existe: premisa y tono.
3. Mira lo que de verdad funciona hoy en el proyecto (estado de `.devteam/tasks/index.md`). El
   material distingue lo que ya se puede ensenar de lo que esta en desarrollo.

## Piezas

Todas van a `.gamedev/pitch/<pieza>.md`. Si no se dice cual, empieza por **frase**: todo lo demas
se construye sobre ella.

- **frase**: tres versiones de una linea (gancho, fantasia del jugador y lo que lo hace distinto),
  y tres de tipo "X con Y" usando las referencias del GDD. Que el usuario elija.
- **onepager**: titulo, frase, tres pilares contados como beneficios para el jugador, publico,
  plataformas, estado y plazo, comparables, y que se busca (financiacion, publisher, testers).
- **tienda**: descripcion corta (la de Steam admite unos 300 caracteres), descripcion larga con
  apartados, lista de caracteristicas, etiquetas sugeridas y que capturas hacen falta y de que
  momento. Adapta las longitudes a la tienda que diga el usuario.
- **trailer**: guion por planos para 60-90 segundos: gancho en los cinco primeros segundos,
  bucle de juego, escalada, momento mas fuerte, titulo y llamada a la accion. Por plano: que se
  ve, duracion, texto en pantalla y sonido. Solo con momentos que el juego tiene o tendra en la
  fecha del trailer.
- **publisher**: estructura de presentacion de 10 a 12 diapositivas (el juego, la fantasia, el
  bucle, por que ahora y para quien, comparables con sus cifras publicas si se conocen, estado
  actual con pruebas, plan y presupuesto, equipo, lo que se pide) con las notas del orador. Si el
  usuario quiere las diapositivas, ofrece crearlas como presentacion.
- **prensa**: hoja de datos (estudio, fecha, plataformas, precio), descripcion, historia del
  desarrollo, caracteristicas, lista de recursos de prensa que faltan.

## Reglas

- **Nada que el juego no tenga.** Cada afirmacion se apoya en el GDD; lo que este en duda se
  marca para revisar.
- Las referencias a otros juegos sirven para explicar, nunca como reclamo de sus marcas, nombres o
  imagenes.
- Escribe en el idioma que pida el usuario; para tiendas, recuerda que la ficha se traduce con
  `/gamedev:localizar`.
- Solo escribes en `.gamedev/pitch/`.
