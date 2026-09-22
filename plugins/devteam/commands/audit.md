---
description: Revision global de salud y consistencia del proyecto: ejecuta, revisa cada capa en paralelo y comprueba que encajan entre si
argument-hint: Opcional, el nivel (rapida, estandar, completa) y un area o modulo para acotar
---

# Auditoria del proyecto

Vas a comprobar que el proyecto funciona como un todo, no solo cada parte por separado. Coordinas al
equipo; **en esta auditoria nadie modifica codigo**, tampoco tu. El resultado es un informe con
evidencias y una lista de tareas para arreglar lo encontrado.

Alcance indicado por el usuario: $ARGUMENTS

## Reglas de esta auditoria

**Solo lectura.** Diagnosticar y arreglar a la vez contamina las dos cosas: al final no se sabe que
estaba roto y que se rompio al arreglarlo. Lo unico que se escribe esta en `.devteam/`.

**Evidencia o no cuenta.** Cada hallazgo lleva `archivo:linea` o la salida real de un comando. Una
sospecha sin evidencia se reporta como sospecha, en una seccion aparte, o no se reporta.

**Nada contra sistemas reales.** No ejecutes nada contra bases de datos de produccion, servicios de
terceros ni cuentas reales. Si una comprobacion lo requiere, anotala como no verificada y di por que.

---

## Fase 0: Preparacion

1. Lee `.devteam/context.md` y `.devteam/decisions.md`. Si no existe la ficha, para y propone
   `/onboard` primero: auditar sin saber como se construye y se prueba el proyecto produce ruido.
2. Crea `.devteam/audits/<fecha>/` para esta auditoria.
3. **Acota si el proyecto es grande.** Si tiene varios modulos o servicios, o si el usuario indico un
   area, define el alcance por modulos y dilo. Un agente que intenta leer un proyecto enorme de una
   vez revisa en superficie todo y a fondo nada; es mejor una auditoria por modulo, bien hecha.
4. Si hay auditorias anteriores en `.devteam/audits/`, localiza la ultima: al final compararas.

## Fase 1: Linea base, ejecutando

Antes de leer una sola linea, **ejecuta** lo que la ficha dice que se puede ejecutar y guarda la
salida real en `baseline.md`:

- Instalacion de dependencias
- Construccion o compilacion
- Pruebas, con su resultado y su cobertura si esta disponible
- Linter y comprobacion de tipos
- Arranque de la aplicacion, si es posible hacerlo en local sin sistemas reales

**Redirige cada salida a un archivo** dentro de la carpeta de la auditoria y trae a tu contexto solo
el final y las lineas de error o aviso. La instalacion, la compilacion y las pruebas producen miles de
lineas que no aportan nada leidas enteras; el archivo queda como evidencia por si hace falta.

Anota lo que falla, lo que avisa y **lo que no se pudo ejecutar**, que tambien es un hallazgo: un
proyecto cuyas pruebas no se sabe como lanzar tiene un problema aunque todas pasen.

Esta linea base se entrega a todos los agentes de la siguiente fase. Parten de hechos, no de
suposiciones.

## Nivel de la auditoria

Es el comando mas caro del equipo, asi que su profundidad se ajusta. Usa el nivel que pida el
usuario ("rapida", "completa"); si no, el que marque el modo de consumo de la ficha; si no, estandar.
Anuncialo al empezar.

- **Rapida**: la linea base de la Fase 1 y la revision cruzada de la Fase 3 las haces tu, **sin
  convocar especialistas**. Detecta lo roto y lo que no encaja entre capas, que es lo mas valioso, a
  una fraccion del coste. Es el nivel del modo economico.
- **Estandar**: ademas convocas especialistas, pero **solo para las capas donde la linea base o una
  primera mirada senalen problemas**, y siempre `security-auditor` si la ficha marca datos sensibles.
  `docs-writer`, `git-manager` y `devops` solo si hay indicios en su terreno. El recorrido funcional,
  con script de prueba y no con navegador interactivo.
- **Completa**: todos los especialistas de la Fase 2, como se describe abajo.

En cualquier nivel, en un proyecto grande **acota por modulos** en lugar de ampliar el nivel.

## Fase 2: Revision por capas, en paralelo

Lanza **en un solo mensaje** a los especialistas que apliquen al stack y al nivel, cada uno con la linea base,
el alcance y la ruta donde escribir su informe, `.devteam/audits/<fecha>/<rol>.md`. Diles que es una
auditoria global: revisan el estado del proyecto, no un diff.

- `backend`: manejo de errores, transacciones, validacion, consultas en bucle, configuracion
- `frontend`: fugas, estados de carga y error, accesibilidad, tipado de respuestas
- `ui-designer`: consistencia visual entre pantallas, componentes que hacen lo mismo con aspecto
  distinto, contraste, flujos con pasos de mas, estados vacios y de error sin disenar
- `db-specialist`: modelos frente a migraciones, integridad, indices para las consultas reales
- `qa-tester`: que partes no tienen pruebas, pruebas que no prueban nada, caminos de error sin cubrir
- `qa-tester`, en una segunda invocacion dentro del mismo mensaje, para el **recorrido funcional**
  si el proyecto tiene interfaz: ver mas abajo
- `security-auditor`: el sistema completo, no solo lo reciente
- `devops`: dependencias desactualizadas o vulnerables, configuracion por entorno, arranque
- `git-manager`: salud del repositorio, archivos que no deberian estar versionados, secretos en el
  historial
- `docs-writer`: documentacion que contradice al codigo, incluida la propia ficha de `.devteam/`

### Recorrido funcional de la interfaz

Es la parte que la lectura de codigo no puede cubrir. Un boton que lanza un error al pulsarlo, un
formulario que rechaza datos validos, una tabla que ordena o pagina mal o una ventana que no se
cierra no se ven leyendo: se ven usando la aplicacion.

`qa-tester` arranca la aplicacion en local y la recorre en un navegador como un usuario, pantalla por
pantalla del alcance: acciones, formularios con datos validos, invalidos y limite, tablas con su
ordenacion, filtros y paginacion, ventanas, navegacion, y tamanos de movil y escritorio. Vigila la
consola del navegador y las peticiones fallidas, y documenta cada fallo con pasos para reproducirlo y
su evidencia en `.devteam/audits/<fecha>/functional.md`.

Condiciones:

- **Solo contra un entorno local o de pruebas** con datos de prueba. Nunca produccion.
- **Prioriza** en proyectos grandes: primero los flujos principales y las pantallas mas usadas. Es
  mejor recorrer a fondo diez pantallas que tocar por encima cien.
- **Declara la cobertura**: que pantallas se recorrieron y cuales no. Una pantalla no recorrida no esta
  verificada, y el informe tiene que decirlo.
- Si la aplicacion no se puede arrancar o no hay forma de manejar un navegador, el recorrido no se
  hace y la interfaz queda marcada como **no verificada en ejecucion**, no como correcta.

Cada fallo encontrado se acompana de la prueba de extremo a extremo que lo detectaria: la siguiente
auditoria lo encontrara ejecutando pruebas, sin tener que recorrer la pantalla a mano.

## Fase 3: Revision cruzada

Esta es la parte que convierte la revision en global, y la que ningun especialista cubre solo.
Convoca a `code-reviewer` con todos los informes de la fase anterior, o hazla tu. Comprueba donde
se tocan las capas:

- **Interfaz y servidor**: cada llamada del frontend apunta a un endpoint que existe, con el metodo,
  los parametros y la forma de respuesta que ese endpoint tiene de verdad.
- **Servidor y datos**: los modelos coinciden con el esquema real y con sus migraciones; no hay
  migraciones pendientes ni columnas que el codigo usa y el esquema no tiene.
- **Configuracion**: cada variable de entorno que el codigo lee esta documentada y en el archivo de
  ejemplo; y al reves, no hay variables documentadas que ya nadie usa.
- **Dependencias**: lo que se importa esta declarado, y lo declarado se usa.
- **Codigo muerto**: rutas, componentes, funciones y tablas a las que nada llama.
- **Convenciones**: los modulos siguen las mismas reglas, o cada uno invento las suyas.
- **Ficha frente a realidad**: lo que dicen `context.md` y `decisions.md` sigue siendo cierto.

## Fase 4: Consolidacion

Escribe `.devteam/audits/<fecha>/report.md`:

1. **Resumen**: tres o cuatro lineas sobre el estado general, sin adornos.
2. **Linea base**: que se pudo ejecutar y con que resultado.
3. **Hallazgos**, deduplicados, porque varios agentes veran lo mismo desde angulos distintos, y
   ordenados por gravedad:
   - **Critico**: roto hoy o explotable hoy
   - **Alto**: fallara en cuanto se den condiciones normales de uso
   - **Medio**: deuda que encarece cada cambio futuro
   - **Bajo**: mejoras
   Cada uno con su evidencia y el agente que lo encontro.
4. **No verificado**: lo que no se pudo comprobar y por que.
5. **Comparacion** con la auditoria anterior si la hay: que se arreglo, que sigue, que es nuevo.

Si dos informes se contradicen, verifica tu mismo contra el codigo antes de decidir.

## Fase 5: De hallazgos a trabajo

Un informe que nadie convierte en trabajo no sirve de nada. Agrupa los hallazgos en tareas con
sentido propio, siguiendo el mismo criterio que usa `/feature`: lo que comparte area y contrato va
junto, lo inconexo va separado. Ordenalas por gravedad y por dependencia.

**Deja cada tarea escrita**, porque se hara en otra sesion que no habra visto esta auditoria y solo
recibira el slug. Para cada una crea `.devteam/tasks/<slug>/spec.md` con:

- **Origen**: la ruta de `report.md` de esta auditoria.
- **Problema**: los hallazgos que agrupa, con su gravedad y su evidencia (`archivo:linea` o salida).
- **Que se pide**: el arreglo concreto, no el area. "Envolver el cobro y el envio en una transaccion
  para que un fallo no deje saldo descontado sin mensaje" y no "transacciones en mensajeria".
- **Que queda fuera** y **criterios de aceptacion** verificables.
- **Nivel de esfuerzo sugerido** (ligero, estandar o completo) y las tareas de las que depende.
- **Estado: pendiente**, sin empezar.

Si algo del arreglo es una decision de producto que no puedes tomar tu, escribelo como pregunta
abierta en el spec en lugar de inventar la respuesta.

Presenta al usuario la lista y propon empezar por los criticos, cada uno con `/feature <slug>`.
**No empieces ninguno sin que lo apruebe.**

Actualiza tambien:

- `.devteam/context.md`: corrige lo que la auditoria demostro falso y anade a trampas lo descubierto.
- `.devteam/tasks/index.md`: una fila para la auditoria con el enlace al informe, y una fila por cada
  tarea propuesta con estado **pendiente (auditoria <fecha>)**.

## Cierre

Resume al usuario el estado general, los hallazgos criticos y altos, lo que no se pudo verificar, y
la lista de tareas propuestas. Si el proyecto esta sano, dilo en una linea: no infles hallazgos para
justificar la auditoria.
