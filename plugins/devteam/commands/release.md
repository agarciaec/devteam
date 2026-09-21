---
description: Prepara y publica una version: calcula el numero, actualiza el CHANGELOG, crea el tag y la release
argument-hint: Opcional, el numero de version si ya lo tienes decidido
---

# Publicar una version

Vas a cerrar una version del proyecto. Convoca a `git-manager` para el analisis y los textos; **tu
ejecutas los comandos**, y todo lo que publica requiere la confirmacion del usuario.

Version indicada por el usuario, si la hay: $ARGUMENTS

## Paso 1: Que entra en esta version

Convoca a `git-manager` para que reuna lo cambiado desde la ultima version publicada: los commits
desde el ultimo tag, los PR integrados y las tareas cerradas en `.devteam/tasks/index.md` en ese
periodo.

Detente y avisa si:

- No estas en la rama principal, o esta no coincide con la del remoto.
- Hay cambios sin confirmar.
- El CI de la rama principal esta fallando. Una version sobre una rama rota es una version rota.

## Paso 2: Numero de version

Si el usuario no lo dio, `git-manager` lo propone a partir del contenido y justifica el nivel.
Presta atencion a los cambios de contrato: si alguna tarea cambio un `contract.md` de forma
incompatible, es una version mayor aunque el cambio parezca pequeno.

Si el proyecto no ha versionado nunca, pregunta al usuario si quiere empezar y con que numero; no
lo decidas tu.

## Paso 3: Preparar

Muestra al usuario, antes de tocar nada:

- El numero de version y por que
- La entrada del CHANGELOG, escrita para quien usa el software, no para quien lo programa: que puede
  hacer ahora que antes no, que se arreglo, que cambia y exige accion por su parte
- Los archivos donde hay que actualizar el numero: manifiestos de paquete, constantes de version

Con la aprobacion, aplica los cambios y confirmalos en un commit de version.

## Paso 4: Publicar

Pide confirmacion explicita antes de cada paso, porque todos son visibles para otros y un tag
publicado no se deberia mover:

1. Subir el commit de version.
2. Crear y subir el tag con el formato que ya use el repositorio.
3. Crear la release en GitHub o GitLab con la entrada del CHANGELOG como descripcion, si el proyecto
   las usa.

No publiques en registros de paquetes ni despliegues salvo que el usuario lo pida expresamente: eso
es otro paso con otras consecuencias.

## Cierre

Resume la version publicada, el enlace a la release y cualquier accion que los usuarios del
software deban tomar por los cambios incompatibles. Si la version fijo una decision duradera sobre
como se versiona el proyecto, anotala en `.devteam/decisions.md`.
