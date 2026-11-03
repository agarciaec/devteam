---
description: Recorta una idea al alcance de una game jam (24 a 72 horas o el plazo que sea): conceptos para el tema, alcance minimo, plan por bloques de horas, lista de recortes y entrega
argument-hint: "<tema de la jam> [horas, personas, motor, reglas] | estado"
---

# Game jam

Peticion: $ARGUMENTS

En una jam no gana la mejor idea, gana la idea que se termina. Este comando parte del tema y del
tiempo disponible y entrega un plan que deja un juego jugable a mitad de plazo, con todo lo demas
como mejoras que se pueden cortar sin romper nada.

## Datos de partida

Si no vienen en la peticion, pregunta en una sola tanda: tema (o temas), **horas reales**
disponibles (no las de la jam: se duerme), personas y que sabe hacer cada una, motor, y las reglas
de la jam (si se permiten recursos hechos antes, plantillas o herramientas generativas, y que hay
que entregar).

## Conceptos

Propon tres conceptos de dos lineas, distintos en su lectura del tema (la literal suele ser la que
elige todo el mundo), cada uno con:

- El verbo principal y el bucle de 30 segundos.
- **Riesgo tecnico** para este equipo y este motor: bajo, medio o alto, y por que.
- Lo que lo hace memorable en una partida de cinco minutos, que es lo que juega un jurado.

Recomienda uno y que el usuario elija.

## El plan

Escribe `.gamedev/jam/<fecha>-<slug>.md`:

1. **Una frase y el bucle**, nada mas de diseno.
2. **Alcance minimo jugable**: lo que tiene que existir para que sea un juego (empezar, jugar,
   ganar o perder, volver a empezar). Debe estar terminado al **40% del tiempo**.
3. **Lista de mejoras en orden**: cada una independiente, para poder parar en cualquier punto con
   algo entregable. El sonido y la respuesta al jugador (sacudidas, particulas, efectos) van
   pronto: rinden mas por hora que el contenido.
4. **Bloques por horas y por persona**, con un punto de control en cada bloque: que tiene que
   funcionar en ese momento, y que se corta si no.
5. **Riesgos y su salida**: para cada riesgo tecnico, la version sencilla a la que se cae si falla
   (sin fisica, sin red, sin generacion procedural).
6. **Entrega**: reservar al menos el 10% final para exportar, probar el ejecutable en otra
   maquina, capturas, pagina de la jam e instrucciones de control. Exportar por primera vez en
   la ultima hora es la causa mas comun de no entregar.

## Durante la jam

Si el usuario vuelve con `/gamedev:jam estado` o contando por donde va, compara con el plan y dile
en una linea que cortar ahora. Si hay `.devteam/`, cada bloque puede ir como tarea a
`.devteam/tasks/` para `/devteam:sprint`, pero en una jam suele ser mas rapido trabajar directo:
ofrecelo solo si el usuario lo pide.

## Reglas

Escribe solo en `.gamedev/jam/`. Respeta las reglas de la jam: si no permiten recursos previos,
el plan no cuenta con ellos.
