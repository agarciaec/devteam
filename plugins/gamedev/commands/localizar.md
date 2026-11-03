---
description: Prepara el juego para traducirse: localiza textos sin extraer, mantiene el glosario de terminos del mundo para traductores, revisa expansion de texto, fuentes tipograficas y contexto, y genera pseudolocalizacion
argument-hint: "[auditar | glosario | contexto | pseudo | revisar <idioma>]"
---

# Localizacion

Peticion: $ARGUMENTS

Traducir un juego es barato si se preparo para ello y muy caro si no: textos incrustados en el
codigo, frases montadas por trozos que no funcionan en otro idioma, botones donde el aleman no cabe,
y nombres propios del mundo traducidos de tres formas distintas. Este comando encuentra esos
problemas antes de que lleguen los traductores.

## Antes de empezar

1. Lee `.devteam/context.md` y busca el sistema de localizacion del proyecto: el `tr()` y los CSV
   o `.po` de Godot, el paquete Localization de Unity, las String Tables de Unreal, archivos i18n
   JSON en juegos web. Si no hay ninguno, dilo: la primera tarea es elegirlo (va a devteam).
2. Lee `.gamedev/gdd.md` (idiomas y plataformas objetivo) y `.gamedev/lore/glosario.md`.

## Que se pide

| Peticion | Que hacer |
|---|---|
| `auditar` (o vacia) | Informe de preparacion para traducir |
| `glosario` | Crear o actualizar el glosario de traduccion |
| `contexto` | Notas de contexto para traductores |
| `pseudo` | Generar un idioma de pseudolocalizacion |
| `revisar <idioma>` | Revisar una traduccion existente frente al glosario |

## auditar

Busca con Grep en el codigo y los datos, y procesa con script si los resultados son muchos:

- **Textos incrustados**: cadenas visibles para el jugador fuera del sistema de localizacion.
- **Concatenaciones**: frases montadas uniendo trozos (`"Has ganado " + n + " monedas"`). Deben
  ser una sola cadena con marcadores, porque el orden cambia entre idiomas.
- **Plurales y genero** resueltos a mano con un `if`, en lugar de con el sistema de plurales.
- **Texto en imagenes** y en texturas.
- **Espacio en la interfaz**: elementos de ancho fijo donde un texto un 30-40% mas largo (aleman,
  frances) o con caracteres mas altos no cabria.
- **Fuentes tipograficas**: que cubren los caracteres de los idiomas objetivo (acentos,
  cirilico, CJK) y no solo los del idioma original.
- Formatos de fecha, numero y moneda escritos a mano.

Escribe `.gamedev/loc/auditoria-<fecha>.md` con cada hallazgo, su ruta y su arreglo. Los arreglos
son codigo: cada grupo de hallazgos va a `.devteam/tasks/<slug>/spec.md` con origen, evidencia,
criterios de aceptacion y **estado: pendiente**, con su fila en `.devteam/tasks/index.md`, previa
aprobacion del usuario.

## glosario

`.gamedev/loc/glosario.md`, a partir del glosario del lore y de los terminos de juego (nombres de
mecanicas, estadisticas, objetos):

```
| termino | tipo | se traduce | traduccion por idioma | nota para el traductor |
```

La decision clave es **que se traduce y que no**: los nombres propios con significado (un apodo,
un lugar descriptivo) suelen traducirse; los inventados por su sonido, no. Proponla termino a
termino y que el usuario la apruebe: una vez decidida, no cambia sin anotarlo.

## contexto

Para las cadenas ambiguas (una palabra suelta, un verbo sin sujeto), notas para el traductor:
quien lo dice, a quien, donde aparece, limite de caracteres y si lleva marcadores. Escribelas en
el formato que admita el sistema del proyecto (comentarios en el CSV, campo de contexto) y, si
modificar esos archivos es necesario, pide aprobacion antes.

## pseudo

Genera un idioma de prueba que alarga los textos un 35%, sustituye letras por variantes acentuadas
y los rodea de corchetes (`[Ĵûéĝö ñûéṽö~~~~]`). Al jugar con el se ven a simple vista los textos
sin extraer (salen sin corchetes), los cortados (falta el corchete final) y los caracteres que la
fuente no tiene. Crealo con un script en el formato del proyecto, mostrando antes donde se
escribira.

## Reglas

Escribe solo en `.gamedev/loc/`, salvo los archivos del sistema de localizacion que el usuario
apruebe. No traduzcas el juego entero por iniciativa propia: la traduccion final es trabajo de
traductores o una tarea aparte que el usuario pide.
