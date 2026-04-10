<?php

declare(strict_types=1);

/**
 * Script de instalación por línea de comandos.
 * Uso: php setup.php
 *
 * Ejecuta las migraciones, carga los datos de demo y crea el usuario admin.
 * Para reinstalar: eliminar storage/.installed y storage/database.sqlite, luego volver a ejecutar.
 */

if (PHP_SAPI !== 'cli') {
    header('Location: /install.php');
    exit;
}

spl_autoload_register(static function (string $class): void {
    $prefix = 'App\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $segments = explode('\\', $relative);
    $path = __DIR__ . '/app';

    foreach ($segments as $segment) {
        $exact = $path . '/' . $segment;
        if (is_dir($exact) || is_file($exact . '.php')) {
            $path = $exact;
            continue;
        }

        $lower = $path . '/' . strtolower($segment);
        if (is_dir($lower) || is_file($lower . '.php')) {
            $path = $lower;
            continue;
        }

        return;
    }

    $file = $path . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

use App\Controllers\AuthController;
use App\Domain\Users\UserRepository;
use App\Infra\Database;
use App\Infra\MigrationRunner;
use App\Infra\Seeders\DefaultDataSeeder;

$installFlag = __DIR__ . '/storage/.installed';

if (is_file($installFlag)) {
    echo "La aplicación ya está instalada. Para reinstalar, elimine storage/.installed y storage/database.sqlite.\n";
    exit(0);
}

try {
    echo "Conectando a la base de datos...\n";
    $pdo = Database::connection();

    echo "Aplicando migraciones...\n";
    MigrationRunner::migrate($pdo);

    echo "Cargando datos de demo (productos, clientes, slides)...\n";
    DefaultDataSeeder::seedIfEmpty($pdo);

    echo "Creando usuario administrador...\n";
    $auth = new AuthController(new UserRepository($pdo));
    $auth->ensureDefaultUser();

    file_put_contents($installFlag, (new DateTimeImmutable())->format(DateTimeInterface::ATOM));

    echo "\nInstalación completada exitosamente.\n";
    echo "--------------------------------------------\n";
    echo "Usuario:    admin@ladistribuidora.com\n";
    echo "Contraseña: admin@ladistribuidora.com\n";
    echo "--------------------------------------------\n";
    echo "Acceda a /login para ingresar al panel de administración.\n";
} catch (Throwable $e) {
    echo "Error durante la instalación: " . $e->getMessage() . "\n";
    exit(1);
}
