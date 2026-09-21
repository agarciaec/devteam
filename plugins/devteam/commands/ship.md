---
description: Confirma y publica el trabajo actual: sincroniza, hace commit, sube la rama y abre el pull request
argument-hint: Opcional, el slug de la tarea o una nota para el commit
---

# Publicar el cambio

Vas a llevar el trabajo terminado desde la copia local hasta un pull request listo para revisar.
Convoca a `git-manager` para el analisis y los textos; **tu ejecutas los comandos**.

Contexto adicional: $ARGUMENTS

## Paso 1: Situacion

Convoca a `git-manager` para que revise el estado: rama actual, cambios sin confirmar, distancia con
el remoto, y las costumbres del repositorio. Si hay una tarea de `/feature` recien cerrada, indicale
su slug para que redacte a partir de su `spec.md` y su `log.md`.

Detente y avisa si:

- **No hay git** en el proyecto. Ofrece iniciarlo, pero no lo hagas sin permiso.
- **Estas en la rama principal** con cambios sin confirmar. Propon crear una rama de trabajo antes de
  seguir; confirmar directamente en la principal casi nunca es lo que el repositorio espera.
- **Hay secretos o archivos que no deben subir** en el diff. No se continua hasta resolverlo.
- **La verificacion no se hizo o fallo.** Publicar algo que no se probo traslada el problema a quien
  lo revise.

## Paso 2: Sincronizar

Trae los cambios del remoto e integra la rama principal actualizada en la tuya, con la estrategia que
use el repositorio, rebase o merge. Si aparecen conflictos, `git-manager` propone como resolverlos
conservando las dos intenciones; tu los aplicas y **vuelves a ejecutar las pruebas**. Un conflicto
resuelto sin probar es un fallo aplazado.

## Paso 3: Commit

Muestra al usuario el mensaje propuesto y la lista de archivos incluidos. Si el diff mezcla cambios
sin relacion, propon varios commits en lugar de uno.

Con la aprobacion, confirma. Si un hook falla, arregla lo que el hook detecto y vuelve a intentarlo;
nunca lo saltes.

## Paso 4: Publicar

Esto sale de la maquina del usuario, asi que **pide confirmacion explicita** antes de cada paso:

1. Subir la rama al remoto.
2. Abrir el pull request con el titulo y la descripcion de `git-manager`. Si esta disponible `gh` o
   `glab`, usalo; si no, deja el enlace y el texto listos para pegar.

No hagas merge del PR ni actives el merge automatico salvo que el usuario lo pida. La revision
existe para que alguien mas mire el cambio.

## Cierre

Resume: rama, commits, enlace del PR, y el estado de las comprobaciones del CI si ya empezaron. Si
el proyecto tiene `.devteam/tasks/index.md`, anota el enlace del PR en la fila de la tarea.
