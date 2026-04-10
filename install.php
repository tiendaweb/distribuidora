<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Domain\Users\UserRepository;
use App\Infra\Database;
use App\Infra\MigrationRunner;
use App\Infra\Seeders\DefaultDataSeeder;

session_start();

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

$installFlag = __DIR__ . '/storage/.installed';
$alreadyInstalled = is_file($installFlag);
$message = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$alreadyInstalled) {
    try {
        $pdo = Database::connection();
        MigrationRunner::migrate($pdo);
        DefaultDataSeeder::seedIfEmpty($pdo);
        $verification = DefaultDataSeeder::verifyHistoricalSeed($pdo);
        if (!$verification['ok']) {
            throw new RuntimeException(
                'La base no coincide con el histórico esperado. ' .
                'Faltantes: ' . implode(', ', $verification['missing_ids']) . '. ' .
                'URLs incorrectas: ' . json_encode($verification['wrong_image_urls'], JSON_UNESCAPED_UNICODE)
            );
        }

        $auth = new AuthController(new UserRepository($pdo));
        $auth->ensureDefaultUser();

        file_put_contents($installFlag, (new DateTimeImmutable())->format(DateTimeInterface::ATOM));
        header('Location: /');
        exit;
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}

if ($alreadyInstalled) {
    $message = 'La aplicación ya está instalada.';
}
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Instalación · La Distribuidora</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; background: #f8f9fa; color: #212529; }
        .card { max-width: 680px; margin: 3rem auto; background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
        .btn { background: #0d6efd; border: 0; color: white; padding: .75rem 1rem; border-radius: 6px; cursor: pointer; }
        .error { background: #f8d7da; color: #842029; padding: .75rem; border-radius: 6px; }
        .ok { background: #d1e7dd; color: #0f5132; padding: .75rem; border-radius: 6px; }
    </style>
</head>
<body>
<div class="card">
    <h1>Instalación inicial</h1>
    <p>Este proceso crea la base de datos, aplica migraciones y carga datos de ejemplo.</p>
    <p>También valida que queden sembrados los IDs y URLs históricas de imágenes de productos de <code>aapp.space</code>.</p>

    <?php if ($error): ?>
        <p class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
    <?php endif; ?>

    <?php if ($message): ?>
        <p class="ok"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p>
        <p><a href="/">Ir a la aplicación</a></p>
    <?php else: ?>
        <form method="post">
            <button type="submit" class="btn">Instalar ahora</button>
        </form>
    <?php endif; ?>
</div>
</body>
</html>
