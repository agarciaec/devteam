---
description: Convierte un proyecto con el formato anterior de .devteam (indice en texto libre, specs sin cabecera) al formato estructurado que leen la herramienta y los hooks, con simulacro previo
argument-hint: Sin argumentos
---

# Migrar .devteam al formato estructurado

Desde la version 0.14 el estado de cada tarea vive en una **cabecera** al principio de su `spec.md`
(estado, nivel, dependencias, verificacion, que falta) y `tasks/index.md` **se genera** a partir de
ellas. Asi la herramienta `devteam` y los hooks pueden comprobar cosas que antes solo estaban escritas.
Este comando convierte un proyecto que tiene el formato anterior.

**Nada se pierde.** Los cuerpos de los specs no se tocan, el indice anterior se guarda entero como
`tasks/index-anterior.md`, y lo que no se puede interpretar se lista para que lo revises.

## Pasos

1. **Herramienta.** La ruta te la da el inicio de sesion ("Herramienta: node ..."). Si no la tienes:
   `ls -d ~/.claude/plugins/cache/devteam-local/devteam/*/scripts/devteam.mjs | sort -V | tail -1`.
   En lo que sigue, `devteam` significa `node <esa ruta>`.

2. **Simulacro**, que no cambia nada:

   ```
   devteam migrate
   ```

3. **Presentalo al usuario en pocas lineas**: cuantos specs reciben cabecera, cuantas tareas del
   indice sin carpeta se crearan, la tabla de traduccion de estados y la lista de dudas. Explica el
   criterio, que es conservador:
   - "cerrada" con algo **sin verificar o sin probar** (navegador, telefono, "sin prueba visual") pasa
     a **parcial**, con lo que falta copiado.
   - "cerrada" que solo espera **commit, push o despliegue** sigue **cerrada**, con la nota en
     `falta`: son acciones del usuario, no trabajo sin hacer.
   - Lo que no se entiende queda **pendiente** o **parcial** y aparece en la lista de dudas.
   - Las carpetas que solo guardan salidas de pruebas, sin spec ni `log.md`, se dejan como estan.

4. **Pregunta** si aplicar (`AskUserQuestion`: aplicar, revisar antes alguna duda, cancelar). Si hay
   git y cambios sin confirmar dentro de `.devteam/`, dilo antes.

5. **Aplica**:

   ```
   devteam migrate --apply
   ```

6. **Completa la cabecera de la ficha**, que la migracion deja a medias. Pregunta al usuario en una
   sola tanda lo que no se puede deducir, con una opcion recomendada en cada pregunta:
   - `datos_prueba`: `copia-produccion` (por defecto si hay dumps locales del proyecto) o
     `sinteticos`.
   - `prefijo_contenedores`: el prefijo de los contenedores de este proyecto (deducelo de la
     composicion o de `docker ps -a`, p. ej. `sti-`), para no tocar los de otros proyectos de la
     maquina.
   - `hosts_produccion`: los servidores y bases de datos de produccion, que la guardia bloqueara.
     Sacalos de la ficha, de los archivos de despliegue o de la configuracion de entorno, y
     confirmalos con el usuario; nunca los inventes.

   Escribelos en la cabecera de `.devteam/context.md`.

7. **Comprueba** con `devteam lint` y `devteam status`, y resume el resultado.

8. Si hay git, propon un commit local **solo con `.devteam/`** (`chore(devteam): migrar al formato
   estructurado`). No hagas push.

Cierra diciendo cuantas tareas quedaron en cada estado y cuales conviene revisar a mano.
