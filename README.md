# 📸 FOTAZA 2

Plataforma web para compartir, explorar y vender fotografías en comunidad. Trabajo Integrador Final — Programación Web II.

🔗 **Deploy en producción:** https://fotaza.onrender.com

---

## 🚀 Inicio rápido (obligatorio para evaluar)

```bash
# 1. Clonar el repositorio
git clone https://github.com/EsTeBaN22001/fotaza.git
cd fotaza

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL local

# 4. Inicializar la base de datos con datos de prueba
npm run db:init

# 5. Iniciar la aplicación
npm start
```

La aplicación estará disponible en: **http://localhost:3000**

---

## 👤 Usuarios de prueba

| Rol                       | Email                       | Contraseña     |
| ------------------------- | --------------------------- | -------------- |
| **Validador** (moderador) | `esteban1.redon2@gmail.com` | `esteban22001` |
| **Usuario**               | `lucia@example.com`         | `password123`  |
| **Usuario**               | `marcos@example.com`        | `password123`  |
| **Usuario**               | `ana@example.com`           | `password123`  |

> El rol **Validador** tiene acceso al panel de moderación (`/moderator/reports`) donde puede revisar publicaciones reportadas, darlas de baja o desestimar denuncias.

---

## ⚙️ Configuración del entorno

Para que la aplicación funcione localmente, debés configurar las variables de entorno siguiendo estos pasos:

1. **Copiar el archivo de plantilla**:
   Creá una copia del archivo `.env.example` y renombralo a `.env`:
   ```bash
   cp .env.example .env
   ```

2. **Configurar la base de datos (MySQL)**:
   Abre el archivo `.env` recién creado y edita los valores correspondientes a tu base de datos local:
   * `DB_HOST`: Cambialo si tu servidor MySQL no está en `localhost`.
   * `DB_PORT`: Puerto de tu base de datos. Por defecto es `3306` (o `3307` si decidís levantar el entorno con Docker).
   * `DB_NAME`: El nombre de la base de datos que querés usar (por defecto `fotaza2`).
   * `DB_USER` y `DB_PASS`: Tu usuario y contraseña de MySQL local.

3. **Configurar seguridad (JWT)**:
   * Generá una clave secreta segura para firmar los tokens JWT y asignala a `JWT_SECRET`. Podés usar el siguiente comando en tu terminal para generar una clave aleatoria:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   * Modificá `JWT_EXPIRES_IN` si deseás cambiar la duración de la sesión (ej. `7d` para 7 días).

4. **Variables de servidor**:
   * Por defecto, el puerto es el `3000` y la URL `http://localhost:3000`. Podés ajustarlo según tus necesidades.

Ver el archivo [.env.example](file:///c:/laragon/www/fotaza/.env.example) para ver todas las variables disponibles.

---

## 🐳 Levantar con Docker (alternativa)

Si tenés Docker instalado, podés levantar toda la aplicación con un solo comando:

```bash
docker-compose up --build
```

Esto levanta automáticamente:

- La aplicación Node.js en `http://localhost:3000`
- MySQL en el puerto `3307`
- phpMyAdmin en `http://localhost:8080`

Luego, en otra terminal, ejecutá el seed:

```bash
npm run db:init
```

---

## 🛣️ Endpoints

### Públicos (sin autenticación)

| Método | Ruta                   | Descripción                                       |
| ------ | ---------------------- | ------------------------------------------------- |
| `GET`  | `/`                    | Página principal — muestra imágenes sin copyright |
| `GET`  | `/auth/login`          | Formulario de inicio de sesión                    |
| `POST` | `/auth/login`          | Procesar inicio de sesión                         |
| `GET`  | `/auth/register`       | Formulario de registro                            |
| `POST` | `/auth/register`       | Crear nueva cuenta                                |
| `GET`  | `/auth/logout`         | Cerrar sesión                                     |
| `GET`  | `/search`              | Motor de búsqueda de publicaciones                |
| `GET`  | `/search/explore`      | Explorar publicaciones                            |
| `GET`  | `/search/autocomplete` | Autocompletado de búsqueda (JSON)                 |
| `GET`  | `/images/:id`          | Servir binario de imagen desde DB                 |

### Autenticado — Home y Feed

| Método | Ruta    | Descripción                       |
| ------ | ------- | --------------------------------- |
| `GET`  | `/home` | Home con publicaciones destacadas |
| `GET`  | `/feed` | Feed de usuarios seguidos         |

### Autenticado — Publicaciones

| Método | Ruta                                    | Descripción                     |
| ------ | --------------------------------------- | ------------------------------- |
| `GET`  | `/posts/create`                         | Formulario de nueva publicación |
| `POST` | `/posts`                                | Crear publicación con imágenes  |
| `GET`  | `/posts/:id`                            | Ver publicación                 |
| `GET`  | `/posts/:id/edit`                       | Formulario de edición           |
| `POST` | `/posts/:id/edit`                       | Actualizar publicación          |
| `POST` | `/posts/:id/delete`                     | Eliminar publicación            |
| `POST` | `/posts/:id/comments`                   | Agregar comentario              |
| `POST` | `/posts/:id/comments/:commentId/delete` | Eliminar comentario             |
| `POST` | `/posts/:id/like`                       | Dar/quitar like                 |
| `POST` | `/posts/:id/rate`                       | Valorar publicación (1-5)       |
| `POST` | `/posts/:id/save`                       | Guardar/quitar de favoritos     |
| `POST` | `/posts/:id/interest`                   | Marcar/desmarcar "Me interesa"  |
| `GET`  | `/posts/:id/interest/status`            | Estado de interés (JSON)        |

### Autenticado — Perfil y Seguimiento

| Método | Ruta                                | Descripción                |
| ------ | ----------------------------------- | -------------------------- |
| `GET`  | `/profile/me`                       | Redirige al perfil propio  |
| `GET`  | `/profile/my-posts`                 | Mis publicaciones          |
| `GET`  | `/profile/saved`                    | Publicaciones guardadas    |
| `GET`  | `/profile/:username`                | Ver perfil de usuario      |
| `GET`  | `/profile/:username/followers`      | Lista de seguidores        |
| `GET`  | `/profile/:username/following`      | Lista de seguidos          |
| `POST` | `/profile/:username/follow`         | Seguir/dejar de seguir     |
| `PUT`  | `/profile/saved/:postId/collection` | Mover favorito a colección |

### Autenticado — Denuncias

| Método | Ruta       | Descripción                                   |
| ------ | ---------- | --------------------------------------------- |
| `POST` | `/reports` | Crear denuncia sobre publicación o comentario |

### Autenticado — Notificaciones

| Método | Ruta                        | Descripción              |
| ------ | --------------------------- | ------------------------ |
| `GET`  | `/notifications`            | Ver notificaciones       |
| `POST` | `/notifications/read-all`   | Marcar todas como leídas |
| `POST` | `/notifications/:id/read`   | Marcar una como leída    |
| `POST` | `/notifications/:id/delete` | Eliminar notificación    |

### Autenticado — Mensajes

| Método | Ruta                | Descripción                 |
| ------ | ------------------- | --------------------------- |
| `GET`  | `/messages`         | Bandeja de entrada          |
| `GET`  | `/messages/:userId` | Conversación con un usuario |
| `POST` | `/messages/:userId` | Enviar mensaje              |

### Autenticado — Colecciones

| Método   | Ruta               | Descripción         |
| -------- | ------------------ | ------------------- |
| `GET`    | `/collections`     | Ver mis colecciones |
| `POST`   | `/collections`     | Crear colección     |
| `PUT`    | `/collections/:id` | Renombrar colección |
| `DELETE` | `/collections/:id` | Eliminar colección  |

### Solo Validador — Moderación

| Método | Ruta                                       | Descripción                  |
| ------ | ------------------------------------------ | ---------------------------- |
| `GET`  | `/moderator/reports`                       | Panel de reportes pendientes |
| `GET`  | `/moderator/reports/:targetType/:targetId` | Detalle de reporte           |
| `POST` | `/moderator/reports/:id/resolve`           | Dar de baja la publicación   |
| `POST` | `/moderator/reports/:id/dismiss`           | Desestimar denuncia          |
| `POST` | `/moderator/reports/:id/delete`            | Eliminar reporte             |

---

## 📦 Librerías utilizadas

### Backend

| Librería            | Versión | Uso                       |
| ------------------- | ------- | ------------------------- |
| `express`           | ^5.2.1  | Framework web             |
| `sequelize`         | ^6.37.8 | ORM para MySQL            |
| `mysql2`            | ^3.22.3 | Driver MySQL              |
| `pug`               | ^3.0.4  | Motor de plantillas (SSR) |
| `bcrypt`            | ^6.0.0  | Hash de contraseñas       |
| `jsonwebtoken`      | ^9.0.3  | Autenticación JWT         |
| `cookie-parser`     | ^1.4.7  | Lectura de cookies        |
| `multer`            | ^2.1.1  | Carga de archivos         |
| `sharp`             | ^0.34.5 | Optimización de imágenes  |
| `dotenv`            | ^17.4.2 | Variables de entorno      |
| `express-validator` | ^7.3.2  | Validación y sanitización |
| `sanitize-html`     | ^2.17.3 | Sanitización de HTML      |
| `sequelize-cli`     | ^6.6.5  | CLI para migraciones      |

### Dev

| Librería  | Uso                              |
| --------- | -------------------------------- |
| `nodemon` | Recarga automática en desarrollo |

---

## 🗄️ Base de datos

La base de datos utiliza **MySQL 8** con Sequelize. Las tablas se crean automáticamente al iniciar la app (`sequelize.sync()`).

### Modelo de datos

```
users         — Usuarios (roles: user, validator)
posts         — Publicaciones
post_images   — Imágenes en BLOB (LONGBLOB, con marca de agua opcional)
tags          — Etiquetas
post_tags     — Relación publicación ↔ etiqueta (N:M)
comments      — Comentarios
likes         — Likes de publicaciones
ratings       — Valoraciones (1-5) por usuario por publicación
follows       — Relaciones de seguimiento entre usuarios
reports       — Denuncias (sobre posts o comentarios)
notifications — Notificaciones del sistema
collections   — Colecciones personales de favoritos
bookmarks     — Relación usuario ↔ publicación ↔ colección
messages      — Mensajes privados entre usuarios
interests     — Registro de "Me interesa" por publicación
```

> Las imágenes se almacenan como **LONGBLOB en la base de datos** (no en disco), lo que elimina la necesidad de almacenamiento externo en producción.

### Inicializar con datos de prueba

```bash
npm run db:init
```

Crea 4 usuarios, 9 publicaciones con imágenes reales, 26 comentarios, 9 tags, valoraciones, likes, notificaciones, colecciones y reportes de ejemplo.

> ⚠️ En desarrollo: borra y recrea las tablas. En producción: solo se ejecuta si la base de datos está vacía.

---

## 🏗️ Arquitectura del proyecto

```
fotaza/
├── src/
│   ├── app.js              # Punto de entrada
│   ├── config/
│   │   └── db.js           # Configuración Sequelize
│   ├── models/             # Modelos Sequelize (User, Post, Comment...)
│   ├── controllers/        # Lógica de negocio por módulo
│   ├── routes/             # Definición de rutas Express
│   ├── middlewares/        # Auth, validación, upload
│   ├── services/           # Lógica de procesamiento (imágenes, mensajes)
│   ├── utils/              # Watermark, optimizador de imágenes
│   ├── views/              # Plantillas Pug
│   └── public/             # CSS, JS del cliente, seed images
├── database/
│   ├── seed.js             # Script de inicialización de datos
│   └── init.sql            # Backup SQL de referencia
├── Dockerfile              # Multi-stage: development + production
├── docker-compose.yml      # Stack local (app + MySQL + phpMyAdmin)
└── .env.example            # Plantilla de variables de entorno
```

---

## 🧩 Problemas encontrados y soluciones

### 1. Almacenamiento de imágenes en producción

**Problema:** En un hosting como Render con contenedores efímeros, guardar imágenes en disco significa perderlas cada vez que el servidor se reinicia.

**Solución:** Las imágenes se almacenan directamente como `LONGBLOB` en la base de datos MySQL. Se procesan en memoria con `sharp` (optimización a WebP) y `canvas` (marca de agua), nunca se escriben a disco.

---

### 2. Marcas de agua con `canvas` en Alpine Linux

**Problema:** La librería `canvas` para aplicar marcas de agua requería dependencias nativas (`cairo`, `pango`) que no están disponibles por defecto en `node:alpine`.

**Solución:** Se migró la implementación de marca de agua a `sharp` usando imágenes SVG generadas dinámicamente, que sí es compatible con Alpine sin dependencias adicionales del sistema.

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (salt rounds: 10)
- Autenticación mediante **JWT** almacenado en cookie `httpOnly`
- Validación y sanitización de inputs con `express-validator` y `sanitize-html`
- Variables de entorno para todos los secretos (nunca hardcodeados)
- Protección contra SQL Injection a través del ORM Sequelize (queries parametrizadas)
- Middleware de autenticación en todas las rutas privadas

---

## 🌐 Deploy en producción

| Servicio            | Plataforma                                            |
| ------------------- | ----------------------------------------------------- |
| Aplicación Node.js  | [Render](https://render.com) — Web Service con Docker |
| Base de datos MySQL | [Aiven](https://aiven.io) — MySQL managed             |

La rama `master` del repositorio está conectada a Render para despliegue automático en cada push.
