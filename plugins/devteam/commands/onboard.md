---
description: Reconoce el stack del proyecto actual y genera su ficha para el equipo de agentes
argument-hint: Opcional, notas sobre el proyecto que el analisis no puede deducir
---

# Onboarding del proyecto

Vas a examinar el proyecto en el directorio actual y dejar por escrito lo que cualquier sesion o agente futuro necesita saber para trabajar bien en el. Es el paso previo a usar el equipo en este proyecto.

Los agentes del equipo son genericos por oficio: saben de backend, de datos o de seguridad, pero no conocen **este** proyecto. La ficha que escribas aqui es lo unico que los especializa, asi que su calidad determina la del equipo entero.

Notas adicionales del usuario: $ARGUMENTS

## Paso 0: Comprobar que hay algo que reconocer

Si el directorio esta vacio o solo tiene un repositorio recien iniciado, aqui no hay nada que
deducir: dilo y ofrece `/kickoff`, que es el comando para proyectos nuevos, donde el equipo
propone stack y estructura en lugar de reconocerlos. No sigas.

## Paso 1: Comprobar si ya existe

Mira si hay `.devteam/context.md` y `CLAUDE.md`. Si ambos existen y estan actualizados, dilo, ofrece refrescarlos y no rehagas el trabajo sin permiso.

## Paso 2: Reconocimiento

Examina el proyecto y averigua:

- **Lenguaje y framework**, con su version. Mira `requirements.txt`, `pyproject.toml`, `package.json`, `*.csproj` y similares.
- **Como se instala, se ejecuta, se construye y se prueba.** Busca los comandos reales: scripts de `package.json`, `manage.py`, `Makefile`, scripts sueltos. Si no encuentras como se ejecutan las pruebas, dilo en lugar de inventarlo.
- **Estructura**: donde vive el codigo, donde la configuracion, donde las pruebas.
- **Base de datos**: motor, como se conecta, si usa ORM o SQL crudo, si hay migraciones.
- **Convenciones**: estilo de nombres, patron de organizacion, linters configurados. Deducelas de varios archivos, no de uno.
- **Control de versiones**: si hay `.git`. Si no lo hay, es importante: los cambios no seran reversibles.
- **Dominio**: que hace el sistema y si maneja datos sensibles como historias clinicas, facturacion o contabilidad.

Para proyectos grandes, lanza varios agentes de exploracion en paralelo, en un solo mensaje, cada uno con un area distinta.

## Paso 3: Preguntar lo que no se puede deducir

Hay cosas que no estan en el codigo. Si son relevantes, preguntaselas al usuario en una sola tanda:

- Si el proyecto esta activo, en mantenimiento o congelado
- Donde se despliega
- Que partes son delicadas o no hay que tocar
- Si hay sistemas externos que dependen de este

No preguntes lo que puedas averiguar leyendo.

## Paso 4: Escribir la ficha

Crea `.devteam/context.md` con esta estructura, rellenada con datos reales del proyecto:

```markdown
# Contexto del proyecto: <nombre>

## Que es
<una o dos frases: que hace y para quien>

## Stack
- Lenguaje y version:
- Framework:
- Base de datos:
- Dependencias destacadas:

## Comandos
- Instalar:
- Ejecutar:
- Construir:
- Probar:
- Linter:

## Estructura
<las carpetas que importan y que hay en cada una>

## Convenciones
<las reglas que un agente debe seguir para que su codigo encaje>

## Trampas conocidas
<lo que sorprende al que llega: dependencias fragiles, configuracion manual, cosas que se rompen facil>

## Lecciones del proyecto
<vacio al principio. Aqui el equipo va anotando lo que aprende trabajando: decisiones que se
tomaron y por que, errores que se repitieron, cosas que parecian correctas y no lo eran. Cada
entrada con su fecha. Se actualiza al cerrar cada tarea, no antes.>

## Sistema de diseno
<solo si el proyecto tiene interfaz. Libreria de componentes, colores de marca, tipografia, donde
viven los estilos y tokens, si hay modo oscuro, y como se ve en general: coherente, o cada pantalla
con su estilo. De aqui depende ui-designer para respetar lo existente en lugar de imponer lo suyo.>

## Datos sensibles
<que informacion delicada maneja y bajo que marco regulatorio, o "ninguna". Se concreto:
datos de salud, financieros, tributarios, personales de clientes, credenciales de terceros.
De este apartado dependen el auditor de seguridad y el especialista de datos para calibrar
su nivel de exigencia, asi que un "ninguna" equivocado baja la guardia de todo el equipo.>

## Control de versiones
<si tiene git o no; si no lo tiene, advertirlo. Si lo tiene:
- Remoto y plataforma: GitHub, GitLab, otro, o ninguno
- Rama principal y como se nombran las ramas de trabajo
- Convencion de mensajes de commit, deducida del historial reciente
- Como se integra: pull request con revision, merge directo, squash o rebase
- Versionado: formato de los tags, si hay CHANGELOG
- Protecciones: CI que valida los cambios, hooks de pre-commit
- Si esta disponible gh o glab para operar con la plataforma>

<De este apartado depende git-manager para seguir las costumbres del repositorio en lugar de
imponer las suyas. Deducelo del historial, no lo supongas.>
```

Si un dato no lo pudiste averiguar, escribe "desconocido" en lugar de suponer. Un dato inventado aqui se propaga a todos los agentes.

## Paso 4b: Decisiones que ya estan tomadas

Si al explorar identificaste decisiones de arquitectura que condicionan el proyecto y siguen
vigentes —como se resuelve la autenticacion, por que hay dos bases de datos, por que ese patron
raro— anotalas en `.devteam/decisions.md` con lo que sepas.

Muchas veces el motivo original no esta escrito en ninguna parte y solo lo sabe quien lo hizo.
Escribe la decision igualmente y marca el motivo como desconocido, o preguntaselo al usuario si
parece importante: una decision sin motivo conocido es justo la que alguien deshara sin querer.

## Paso 5: CLAUDE.md

Si no existe `CLAUDE.md` en la raiz, crealo con lo esencial de la ficha: comandos, convenciones y trampas. Debe ser corto y util, no una copia del contexto completo.

Si ya existe, no lo sobrescribas. Comparalo con lo que encontraste y propon al usuario las correcciones concretas que hagan falta.

## Paso 6: Ignorar en git

Si el proyecto usa git, pregunta al usuario si quiere versionar `.devteam/`. Versionarlo conserva las decisiones de diseno y sirve si trabaja mas gente; ignorarlo mantiene el repositorio limpio. Aplica lo que elija.

## Cierre

Resume en pocas lineas: que es el proyecto, su stack, y sobre todo que no pudiste averiguar y necesita confirmacion del usuario.

Si es la primera vez que el equipo entra en este proyecto, ofrece `/audit` como siguiente paso: deja
una linea base de su estado con la que comparar despues, y suele descubrir lo que conviene arreglar
antes de construir nada nuevo encima.
