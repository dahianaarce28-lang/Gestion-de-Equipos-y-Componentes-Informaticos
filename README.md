# Inventario de Laboratorio Informático

**Estudiante:** _(completar)_
**Curso:** 2do Año — Bachillerato Técnico en Informática
**Materias:** Software y Laboratorio Informático
**Colegio:** Colegio Nacional E.M.D. Asunción Escalada — 2026

## Descripción del sistema

Aplicación web para administrar los equipos y componentes de un
laboratorio informático (Arduino, sensores, computadoras, monitores,
periféricos, componentes electrónicos, herramientas, redes, etc.).
Permite dar de alta, listar, modificar, eliminar, buscar y filtrar
componentes, con los datos almacenados en la nube.

## Plataforma seleccionada

**Supabase** (PostgreSQL como servicio).

## Funcionalidades implementadas

- Alta de componentes con validación de campos obligatorios y cantidad numérica.
- Listado completo de los registros en una tabla.
- Modificación de registros existentes.
- Eliminación de registros con confirmación previa.
- Búsqueda por código, nombre o marca.
- Filtro por categoría y por estado.
- Persistencia en la nube (los datos se mantienen al recargar la página).
- Mensajes de éxito y de error.
- Interfaz tipo panel administrativo, adaptable a distintos tamaños de pantalla.

## Tecnologías utilizadas

- HTML5 / CSS3
- JavaScript (vanilla, sin frameworks)
- Supabase (base de datos PostgreSQL + API autogenerada)
- Librería `@supabase/supabase-js`

## Estructura de la base de datos

Tabla `componentes` (ver `schema.sql`):

| Campo           | Tipo        | Notas                              |
|-----------------|-------------|-------------------------------------|
| id              | uuid        | clave primaria, autogenerada        |
| codigo          | text        | obligatorio, único                  |
| nombre          | text        | obligatorio                         |
| categoria       | text        | obligatorio                         |
| marca           | text        | opcional                            |
| cantidad        | integer     | obligatorio, ≥ 0                    |
| estado          | text        | Disponible / En uso / Reparación / Baja |
| descripcion     | text        | opcional                            |
| fecha_registro  | timestamptz | automática (default now())          |

## Instrucciones para ejecutar el proyecto

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Ejecutar el contenido de `schema.sql` en el **SQL Editor** de Supabase.
3. Copiar la **URL** y la clave **anon/public** del proyecto (Project Settings → API).
4. Pegarlas en `config.js`.
5. Abrir `index.html` en el navegador (o publicarlo, ver abajo).

## Publicación

- Repositorio: `<pegar enlace de GitHub>`
- Sistema publicado: `<pegar enlace de GitHub Pages / Render>`

## Seguridad

- Se utiliza únicamente la clave **anon/public** de Supabase en el
  cliente. La clave `service_role` nunca se incluye en el código ni
  se sube al repositorio.
- La tabla tiene **Row Level Security (RLS)** habilitado con
  políticas explícitas de lectura/escritura (ver `schema.sql`). En un
  sistema con usuarios reales, estas políticas deberían además exigir
  autenticación.
