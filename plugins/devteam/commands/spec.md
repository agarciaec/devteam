---
description: Extrae de una aplicacion existente la especificacion de que hace y como se usa, sin atarla a su tecnologia, para poder recrearla desde cero
argument-hint: Opcional, el nivel (rapida, estandar, completa) y un area o modulo para acotar
---

# Especificacion funcional de una aplicacion existente

Vas a reconstruir, leyendo el codigo y usando la aplicacion, **que hace este sistema, para quien y
con que reglas**, en un documento que sirva para volver a construirlo con otra tecnologia. No es
documentacion tecnica del proyecto actual: es el enunciado del problema que ese proyecto resuelve.

Alcance indicado por el usuario: $ARGUMENTS

## La regla que define este comando

**Describe comportamiento, no implementacion.** Ni un nombre de framework, de libreria, de clase o de
archivo en el cuerpo de la especificacion. La prueba es simple: si una frase deja de ser cierta
porque el equipo cambia de framework, esta mal escrita.

- Asi **no**: "el servicio `tarificador.py` llama a `descontar_saldo` dentro de una transaccion".
- Asi **si**: "antes de enviar un mensaje se descuenta su costo del monedero del cliente; si no hay
  saldo, el mensaje no se envia y no se cobra nada".

La trazabilidad no se pierde: cada regla lleva al final, entre parentesis, el `archivo:linea` de
donde salio, para poder comprobarla. Eso es una nota al margen, no parte del enunciado.

Lo unico que se guarda en `tech-notes.md` es la tecnologia que **condiciona el comportamiento** y
que quien recree el sistema tendra que resolver de todos modos: limites de un proveedor externo,
formatos de archivo que otros sistemas envian, un motor de datos impuesto por el cliente.

## Solo lectura

Este comando no modifica el codigo de la aplicacion. Lo unico que se escribe esta en `.devteam/`.

## Lo que nunca se hace: canonizar los defectos

Una aplicacion en produccion tiene comportamientos que nadie decidio. Copiarlos a la nueva version
por haberlos encontrado en el codigo es el error mas caro de una recreacion. Clasifica cada
comportamiento dudoso:

- **Intencionado**: es una regla de negocio, aunque parezca raro. Va a la especificacion.
- **Defecto**: nadie lo quiere asi. Va a `gaps.md` como "no reproducir", con lo que deberia hacer.
- **No se sabe**: va a `open-questions.md` y **se le pregunta al usuario**, que es quien conoce el
  negocio. No lo decidas tu.

Lo mismo con lo que ya no se usa: rutas, pantallas, campos y procesos a los que nada llama se
marcan como candidatos a no recrear, en lugar de arrastrar veinte anos de historia a un proyecto nuevo.

## Fase 0: Preparacion

1. Lee `.devteam/context.md` si existe: te ahorra deducir el stack y te da las trampas conocidas. Si
   no existe, no pares: este comando funciona igual, solo le costara mas situarse.
2. Crea `.devteam/spec/<fecha>/`.
3. **Acota** si el sistema es grande. Un modulo bien especificado vale mas que el sistema entero
   descrito por encima. Si el usuario indico un area, respetala y dilo.
4. Pregunta al usuario, **en una sola tanda**, lo que el codigo no puede decirte:
   - **Quien usa esto** y para que, con nombres de roles reales.
   - **Que partes son criticas** y que partes sobran o ya no se usan.
   - **Que le duele** de la version actual: eso es lo que la nueva no debe repetir.
   - **Si la recreacion sustituye al sistema o convive con el**, y si hay que migrar los datos.

## Nivel

- **Rapida**: la haces tu sola, sin especialistas: inventario de funcionalidades, pantallas, modelo
  de dominio y las reglas principales. Sirve para decidir si merece la pena recrear.
- **Estandar**: convocas a los especialistas de las capas que el sistema tenga de verdad, sin
  recorrido en navegador salvo que la interfaz sea el corazon del sistema.
- **Completa**: todo lo de la Fase 1, incluido el recorrido de la aplicacion en marcha.

Usa el nivel que pida el usuario; si no, el del modo de consumo de la ficha; si no, estandar.
Anuncialo al empezar.

## Fase 1: Extraccion en paralelo

Lanza **en un solo mensaje** a los que apliquen, cada uno con el alcance y la ruta de su archivo
dentro de `.devteam/spec/<fecha>/`. A todos se les da la regla de arriba: **comportamiento, no
implementacion**.

- `backend` → `capabilities.md`: inventario de funcionalidades por area y, por cada una, que hace,
  quien puede hacerla, que necesita y que produce. Incluye los procesos que corren solos
  (programados, en cola, disparados por un evento) con su frecuencia y su efecto.
- `backend`, segunda invocacion → `rules.md`: **las reglas de negocio**, que es lo mas valioso y lo
  que siempre se pierde al reescribir. Calculos con sus formulas y su redondeo, validaciones, estados
  y sus transiciones permitidas, permisos, plazos, limites, que pasa en los casos limite, y que se
  considera un error y como se le comunica al usuario.
- `db-specialist` → `data.md`: el **modelo de dominio conceptual**. Entidades con el significado de
  cada atributo relevante, relaciones y cardinalidades, reglas que los datos cumplen siempre,
  identificadores con significado de negocio, datos historicos que hay que conservar, y volumenes
  reales. Sin tipos de un motor concreto, sin indices, sin nombres de tabla como enunciado.
- `frontend` → `screens.md`: inventario de pantallas y, por cada una, para que sirve, quien entra,
  que informacion muestra, que acciones ofrece y a donde lleva cada una. Los campos de formulario
  con su significado y su validacion, no con su componente.
- `ui-designer` → `flows.md`: los **recorridos completos** de cada rol para conseguir lo que viene a
  conseguir, paso a paso, incluidos los caminos de error y lo que el usuario hace mas veces al dia.
  Es lo que permite que la nueva version sea mejor y no solo distinta.
- `security-auditor` → `access.md`: roles y que puede hacer cada uno, como se autentica la gente,
  que datos son sensibles o regulados, que se audita y que se conserva. Conceptual: "el
  administrador puede anular un cobro, el operador no".
- `devops` → `environment.md`: sistemas externos con los que habla, que se intercambia con cada uno
  y que pasa si no responden; entradas y salidas de archivos; entornos; parametros de configuracion
  con su efecto de negocio; y lo que la operacion diaria necesita.
- `qa-tester` → `observed.md`, solo en nivel completo y si la aplicacion arranca en local: recorre la
  aplicacion como un usuario y documenta **lo que hace de verdad**, que no siempre es lo que dice el
  codigo. Contra un entorno local o de pruebas, nunca produccion. Con script antes que con navegador
  interactivo. Si no se puede arrancar, dilo: la especificacion queda como derivada solo del codigo.

**En modo de consumo economico**, pasa `model` sonnet a todos, y quedate en `capabilities.md`,
`rules.md`, `data.md` y `screens.md`: son las cuatro que nadie puede deducir despues.

Si una capa no existe en el sistema, no convoques a su especialista.

## Fase 2: Consolidacion

Escribe `overview.md`, que es la puerta de entrada y lo unico que alguien leera entero:

1. **Que es este sistema**, en un parrafo que entienda quien no lo ha visto.
2. **Que problema resuelve** y que pasaria si no existiera.
3. **Quien lo usa**, por roles, y cuantos son.
4. **Las funcionalidades principales**, en una lista corta y por valor.
5. **Las cinco reglas de negocio que mas importan**, las que no se pueden equivocar.
6. **El mapa del sistema**: las piezas y como se relacionan, en terminos de negocio.
7. **Indice** de los demas documentos.

Resuelve las contradicciones antes de escribir: si dos informes discrepan sobre una regla, abre el
codigo tu misma, y si el codigo tampoco es claro, va a `open-questions.md`.

## Fase 3: Paridad y lo que queda fuera

Dos documentos que convierten la especificacion en algo verificable:

- `parity.md`: la **lista de comprobacion de paridad**. Una linea por comportamiento que la nueva
  version tiene que reproducir, escrita de forma que se pueda verificar con una prueba: entrada,
  accion, resultado esperado. Ordenada por criticidad. Esto es lo que despues se convierte en los
  criterios de aceptacion de la recreacion, y en sus pruebas.
- `gaps.md`: lo que **no** hay que recrear y por que (funciones muertas, defectos, soluciones
  provisionales que el nuevo diseno resuelve de otra forma), mas lo que la version actual no hace y
  se echa en falta.

Y `open-questions.md` con lo que no se pudo determinar: cada pregunta dirigida a quien puede
responderla. Una especificacion honesta sobre sus huecos es util; una que los rellena inventando
produce un sistema nuevo con reglas falsas.

## Fase 4: Plan de recreacion

Convoca a `tech-lead` con la especificacion consolidada para que escriba `plan.md`. **No elige
tecnologia aqui**: eso lo hace `/kickoff` en el proyecto nuevo, con el usuario delante. Lo que
planifica es:

- **Etapas por funcionalidad**, cada una con algo utilizable al final. La primera etapa es el nucleo
  sin el que nada tiene sentido.
- **Orden segun las dependencias** del modelo de dominio: que entidades tienen que existir antes.
- **Migracion de datos**, si los hay: que se lleva, que se transforma, que se deja atras.
- **Convivencia y cambio**: si los dos sistemas van a funcionar a la vez, quien manda sobre cada
  dato mientras eso dure, y como se hace el cambio final.
- **Riesgos**: las partes donde perder una regla de negocio duele mas.

En nivel rapido, este plan lo escribes tu en media pagina.

## Cierre

Resume al usuario que se especifico, que quedo fuera del alcance, las preguntas abiertas que
necesitan su respuesta, y el plan de etapas.

Para arrancar la nueva version, indicale que copie la carpeta `.devteam/spec/<fecha>/` al directorio
del proyecto nuevo y ejecute `/kickoff` senalandola: el equipo propondra la tecnologia a partir de
esta especificacion en lugar de preguntarlo todo otra vez.
