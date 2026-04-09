# La Distribuidora

## Enrutamiento

### Apache
Se incluye `public/.htaccess` para redirigir todas las rutas limpias a `public/index.php`.

### Nginx
Usar esta regla en el bloque `server`:

```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```
