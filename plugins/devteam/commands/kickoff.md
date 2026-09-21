---
description: Arranca un proyecto nuevo: el equipo propone stack y estructura, lo acuerda contigo y lo crea
argument-hint: Que quieres construir
---

# Arranque de proyecto nuevo

Vas a llevar un proyecto desde la idea hasta un esqueleto que funciona. El equipo propone, tu
decides con el usuario, y solo entonces se crea algo.

Lo que se quiere construir: $ARGUMENTS

**Este comando es para proyectos que no existen todavia.** Si el directorio ya tiene codigo,
para y usa `/onboard`: ese reconoce lo que hay en lugar de proponer algo nuevo.

---

## Fase 1: Entender que se va a construir

No propongas tecnologia todavia. Primero hay que saber que es esto. Pregunta al usuario **en una
sola tanda** lo que no se deduzca de su descripcion:

- **Que hace y para quien.** Una aplicacion interna para cinco personas y un producto publico con
  miles de usuarios no se parecen en nada, aunque la descripcion inicial suene igual.
- **Forma**: aplicacion web, API sin interfaz, aplicacion de escritorio, herramienta de linea de
  comandos, proceso automatizado, sitio estatico.
- **Datos**: hay que guardar informacion, de que tipo y cuanta. Hay datos personales o regulados.
- **Usuarios y accesos**: hace falta autenticacion, hay roles distintos.
- **Donde va a vivir**: servidor propio, nube, equipo del cliente, ejecucion local.
- **Restricciones reales**: tecnologia que el usuario ya conoce o quiere usar, sistemas existentes
  con los que hay que integrarse, plazos, presupuesto de infraestructura.
- **Alcance de la primera version**: que tiene que funcionar para considerarlo util.

Pregunta lo que cambie la decision, no todo lo imaginable. Si el usuario no sabe algo, ofrece una
opcion por defecto razonable y sigue.

## Fase 2: Propuesta del equipo

Convoca a `tech-lead` con todo lo recogido. Su encargo es proponer:

- **Stack**: lenguaje y framework de servidor, tecnologia de interfaz, motor de datos, y por que
  cada uno para **este** problema concreto.
- **Estructura de carpetas** y por donde crecera.
- **Piezas minimas de la primera version**, en orden de construccion.
- **Que descarto y por que**: las alternativas serias que considero y el motivo de no elegirlas.

Convoca en paralelo, en el mismo mensaje, a `db-specialist` si hay datos que modelar y a `devops`
si el despliegue condiciona la eleccion; a menudo la restriccion de despliegue decide el stack mas
que ninguna otra cosa.

El criterio de eleccion es el del equipo: **tecnologia actual y mantenida, proporcionada al tamano
real del problema**. Nada de una arquitectura distribuida para algo que usan diez personas, ni de
una dependencia para lo que la plataforma ya resuelve. Y si el usuario ya domina una tecnologia
que encaja razonablemente, eso pesa: un stack que el mantiene vale mas que uno teoricamente mejor
que no va a poder sostener.

## Fase 3: Acuerdo

**Presenta la propuesta al usuario y espera su decision. No crees nada antes.**

Esta es una eleccion que condiciona el proyecto durante anos y es cara de deshacer, asi que
merece una parada explicita. Presenta:

- La recomendacion, en pocas lineas y sin jerga innecesaria
- Que gana y que pierde con ella
- Las alternativas descartadas, en una linea cada una
- Las decisiones que siguen abiertas y que el usuario deberia zanjar ahora

Si el usuario prefiere otra cosa, es su proyecto: ajusta la propuesta y sigue. Si su eleccion
tiene un inconveniente serio, dilo una vez, con claridad, y luego acompanala.

## Fase 4: Crear el esqueleto

Ya con el acuerdo, crea el proyecto. **Escribe tu, la sesion principal**; los especialistas te
pasan el contenido, como en cualquier otra tarea del equipo.

1. **Control de versiones primero**: `git init` y un `.gitignore` adecuado al stack, antes de
   escribir codigo. Asi todo lo demas es reversible desde el primer momento.
2. **Estructura minima que arranca**: no un andamiaje enorme, sino lo suficiente para ejecutar
   algo y ver que responde.
3. **Configuracion por entorno** desde el principio, con su archivo de ejemplo. Anadirla despues
   siempre implica sacar valores que ya se colaron en el codigo.
4. **Una prueba que pasa**, por minima que sea: deja el camino abierto para las siguientes.
5. **`.devteam/context.md`**: aqui se escribe a partir de las decisiones tomadas, no de la
   deteccion. Misma estructura que genera `/onboard`, incluido el apartado de datos sensibles.
6. **`CLAUDE.md`** con los comandos reales y las convenciones acordadas.

## Fase 5: Comprobar que arranca de verdad

Ejecuta la instalacion de dependencias, el arranque y las pruebas. **Pega la salida real.**

Un esqueleto que no compila es peor que no tener nada, porque el proximo que llegue no sabra si
esta roto por su culpa. Si algo falla, arreglalo antes de dar el arranque por terminado.

## Cierre

Resume: que se decidio y por que, que se creo, que comandos usar para trabajar, y cual es el
siguiente paso concreto, que normalmente sera `/feature` con la primera funcionalidad.
