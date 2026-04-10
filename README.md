# La Distribuidora

Sistema de gestión para distribuidoras mayoristas. Incluye tienda web con catálogo de productos, carrito de compras, panel de administración (POS/Facturación, Stock, Clientes, Pedidos) y generación de presupuestos/facturas en PDF.

---

## Requisitos del sistema

- **PHP 8.1 o superior**
- **Extensiones PHP requeridas**: `pdo_sqlite`, `sqlite3`
- **Apache** (opcional): requiere `mod_rewrite` habilitado y `AllowOverride All`
- **Nginx** (opcional): configuración con `try_files` (ver abajo)
- **Permisos**: el directorio `storage/` debe tener permisos de escritura para el usuario del servidor web

Verificar extensiones instaladas:
```bash
php -m | grep -E "pdo_sqlite|sqlite3"
```

---

## Instalación

### Opción A — Línea de comandos (recomendado)

```bash
php setup.php
```

Esto aplica las migraciones, carga los datos de demo y crea el usuario administrador.

### Opción B — Instalador web

Visitar `/install.php` en el navegador y hacer clic en **Instalar ahora**.

---

## Levantar el servidor

### PHP built-in (desarrollo rápido)

```bash
php -S 0.0.0.0:8080 index.php
```

Luego acceder a `http://localhost:8080`.

### Apache

Apuntar el `DocumentRoot` a la **raíz del proyecto** (no a `public/`). El archivo `.htaccess` incluido se encarga de redirigir las rutas.

```apache
<VirtualHost *:80>
    ServerName ladistribuidora.local
    DocumentRoot /ruta/al/proyecto/distribuidora

    <Directory /ruta/al/proyecto/distribuidora>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Nginx

```nginx
server {
    listen 80;
    server_name ladistribuidora.local;
    root /ruta/al/proyecto/distribuidora;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

---

## Acceso

| Rol | URL | Usuario | Contraseña |
|---|---|---|---|
| Administrador | `/login` | `admin@ladistribuidora.com` | `admin@ladistribuidora.com` |
| Tienda pública | `/` | — | — |

---

## Datos de demo

La instalación carga automáticamente:

- **20 productos**: helados (Summun, Copa Caribe), pastas frescas (ravioles, ñoquis, capelettis, sorrentinos, tallarines) y congelados (milanesas de soja)
- **12 clientes**: almacenes, kioscos, supermercados y distribuidoras de Necochea, Buenos Aires
- **2 banners** para el slider de la tienda

---

## Estructura del proyecto

```
distribuidora/
├── index.php          # Punto de entrada principal (router raíz)
├── install.php        # Instalador web
├── setup.php          # Instalador por línea de comandos
├── .htaccess          # Reescritura de rutas para Apache
├── app/
│   ├── controllers/   # AuthController
│   ├── domain/        # Servicios y repositorios (Products, Clients, Orders, Invoices, Slides, Users)
│   ├── infra/         # Database, MigrationRunner, DefaultDataSeeder
│   ├── migrations/    # Archivos SQL de migraciones
│   └── views/         # Vistas PHP (layout, tienda, admin, auth)
├── public/
│   ├── index.php      # Router completo de la aplicación
│   ├── .htaccess      # Reescritura para cuando el document root apunta a public/
│   ├── css/           # Hojas de estilo
│   └── js/            # Módulos JavaScript
└── storage/
    ├── database.sqlite # Base de datos SQLite
    └── .installed      # Flag de instalación (creado por setup.php o install.php)
```

---

## Reinstalación / reset

Para borrar todos los datos y reinstalar desde cero:

```bash
rm storage/.installed storage/database.sqlite
php setup.php
```

---

## Solución de problemas

**`/login` redirige al instalador**
→ La app no está instalada. Ejecutar `php setup.php`.

**Error de permisos en `storage/`**
→ Dar permisos de escritura: `chmod -R 775 storage/`

**Rutas limpias dan 404 en Apache**
→ Verificar que `mod_rewrite` está activo (`a2enmod rewrite`) y que el VirtualHost tiene `AllowOverride All`.

**CSS/JS no cargan**
→ Con PHP built-in server, usar siempre `php -S host:puerto index.php` (el `index.php` como router es obligatorio para que sirva los assets de `public/`).
