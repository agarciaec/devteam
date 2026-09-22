---
description: Comprueba que la interfaz funciona al usarla: recorre las pantallas en un navegador pulsando, rellenando y navegando como un usuario
argument-hint: Opcional, las pantallas o el flujo a recorrer; sin argumento, las pantallas principales
---

# Prueba de interaccion de la interfaz

Vas a comprobar que la interfaz **funciona al usarla**, no solo que compila. Es la parte de `/audit`
dedicada a la interaccion, sin convocar al resto del equipo: mas rapida y mas barata cuando la duda
es solo si los botones, formularios, tablas y ventanas hacen lo que deben.

Alcance indicado por el usuario: $ARGUMENTS

**Nadie modifica codigo en esta prueba.** Se encuentra, se documenta y se convierte en tareas.

---

## Fase 0: Comprobar que se puede hacer

Antes de nada, verifica las tres condiciones. Si falla alguna, para, di cual y como resolverla:

1. **La aplicacion arranca en local** con el comando de `.devteam/context.md`. Si no hay ficha,
   propon `/onboard` primero.
2. **Hay una herramienta de navegador**: un servidor MCP de Playwright o de las herramientas de
   desarrollo del navegador, o Playwright o Cypress instalados en el proyecto. Si no hay ninguna,
   indica al usuario como anadir la de Playwright:

   ```
   claude mcp add playwright -s user -- npx -y @playwright/mcp@latest
   ```

   y que abra una sesion nueva despues.
3. **Hay un entorno seguro**: base de datos local o de pruebas y datos de prueba. **Nunca contra
   produccion.** Si la aplicacion local apunta a servicios o datos reales, para y pregunta.

## Fase 1: Inventario y alcance

Obten la lista de pantallas del enrutador de la aplicacion, no de memoria. Si el usuario indico un
alcance, limitate a el. Si no, y hay muchas pantallas, pregunta cuales son las mas usadas o las que
mas preocupan, y propon un orden. Es mejor recorrer a fondo las diez pantallas que importan que tocar
por encima cien.

Crea `.devteam/uitest/<fecha>/` y anota ahi el alcance acordado.

## Fase 2: Recorrido

Convoca a `qa-tester` para el recorrido funcional, con el alcance, el comando de arranque y la ruta
del informe. En cada pantalla ejercita acciones, formularios con datos validos, invalidos y limite,
tablas con su ordenacion, filtros y paginacion, ventanas y menus, navegacion y recargas, y los tamanos
de movil y escritorio, vigilando la consola y las peticiones de red.

**Primero con script, el navegador interactivo solo para lo que falte.** Pide a `qa-tester` que
escriba el recorrido como pruebas de Playwright —o del marco que use el proyecto— y las ejecute: a tu
contexto solo vuelve el resultado, y las pruebas quedan para la proxima vez, que costara casi nada.
Manejar el navegador paso a paso con herramientas MCP devuelve miles de tokens por cada instantanea
de la pagina; reservalo para explorar lo que el script no sabe como probar y para confirmar un fallo
concreto. Si ya existen pruebas de extremo a extremo de una pantalla, ejecutalas en lugar de
recorrerla de nuevo.

**Sobre el paralelismo.** Un servidor MCP de navegador maneja un unico navegador: varios agentes
usandolo a la vez se pisan las pestanas y los resultados no valen. Con el navegador compartido,
recorre **un grupo de pantallas cada vez**, retomando al mismo `qa-tester` con SendMessage para el
siguiente grupo. Solo si cada agente lanza su propio proceso de Playwright mediante scripts puedes
repartir grupos de pantallas entre varios agentes en paralelo.

## Fase 3: Informe

Escribe `.devteam/uitest/<fecha>/report.md`:

1. **Resumen**: cuantas pantallas se recorrieron, cuantas fallan, y el estado general en una linea.
2. **Cobertura**: una tabla por pantalla con lo que se ejercito —acciones, formularios, tablas,
   ventanas, navegacion, movil— marcado como correcto, con fallo, o no ejercitado. Lo no ejercitado se
   dice, no se omite.
3. **Fallos**, ordenados por gravedad, cada uno con los pasos exactos para reproducirlo, lo esperado,
   lo ocurrido, y la evidencia: captura, error de consola o peticion fallida.
4. **Errores silenciosos**: errores de consola o peticiones fallidas que no rompen nada visible pero
   que estan ahi.
5. **No ejercitado y por que**: acciones con efectos externos sin simular, pantallas fuera de alcance,
   flujos que requieren permisos o datos que no habia.
6. **Comparacion** con la prueba anterior si la hay: que se arreglo, que sigue, que es nuevo.

## Fase 4: De fallos a trabajo

Agrupa los fallos en tareas con el criterio de `/feature` y ordenalas por gravedad. Por cada fallo,
`qa-tester` deja propuesta la prueba de extremo a extremo que lo detectaria: al arreglarlo con
`/feature`, esa prueba se anade y el fallo ya no puede volver sin que las pruebas lo digan.

Anota la prueba en `.devteam/tasks/index.md` con el enlace al informe, y anade a trampas de
`.devteam/context.md` lo que se haya descubierto sobre como arrancar o probar la aplicacion.

Presenta al usuario el resultado y propon empezar por los fallos mas graves. **No empieces ninguno
sin su aprobacion.**

## Cierre

Resume: que se recorrio, que fallo, que quedo sin ejercitar, y la lista de tareas propuestas. Si todo
funciona, dilo en una linea y declara la cobertura: "sin fallos" solo vale para lo que se recorrio.
