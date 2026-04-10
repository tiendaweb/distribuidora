<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Domain\Clients\ClientRepository;
use App\Domain\Clients\ClientService;
use App\Domain\Invoices\InvoiceRepository;
use App\Domain\Invoices\InvoiceService;
use App\Domain\Orders\OrderRepository;
use App\Domain\Orders\OrderService;
use App\Domain\Products\ProductRepository;
use App\Domain\Products\ProductService;
use App\Domain\Slides\SlideRepository;
use App\Domain\Slides\SlideService;
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
    $path = dirname(__DIR__) . '/app';

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


$installFlag = dirname(__DIR__) . '/storage/.installed';
if (!is_file($installFlag)) {
    header('Location: /install.php');
    exit;
}

$pdo = Database::connection();
MigrationRunner::migrate($pdo);
DefaultDataSeeder::seedIfEmpty($pdo);

$productService = new ProductService(new ProductRepository($pdo));
$clientService = new ClientService(new ClientRepository($pdo));
$orderService = new OrderService(new OrderRepository($pdo));
$invoiceService = new InvoiceService(new InvoiceRepository($pdo));
$slideService = new SlideService(new SlideRepository($pdo));
$auth = new AuthController(new UserRepository($pdo));
$auth->ensureDefaultUser();

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$uri = rtrim($uri, '/');
$currentRoute = $uri === '' ? '/' : $uri;
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$json = static function (mixed $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
};

$body = static function (): array {
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
};

$requireAdmin = static function () use ($auth, $json): void {
    if (!$auth->isAuthenticated()) {
        $json(['error' => 'No autorizado'], 401);
    }
};

if (str_starts_with($currentRoute, '/api/')) {
    if ($currentRoute === '/api/bootstrap' && $method === 'GET') {
        $json([
            'products' => $productService->list(),
            'clients' => $clientService->list(),
            'orders' => $orderService->list(),
            'invoices' => $invoiceService->list(),
            'slides' => $slideService->list(),
        ]);
    }

    if ($currentRoute === '/api/state' && $method === 'PUT') {
        $payload = $body();
        $productService->replace($payload['products'] ?? []);
        $clientService->replace($payload['clients'] ?? []);
        $orderService->replace($payload['orders'] ?? []);
        $invoiceService->replace($payload['invoices'] ?? []);
        $slideService->replace($payload['slides'] ?? []);
        $json(['ok' => true]);
    }


    if ($currentRoute === '/api/slides' && $method === 'DELETE') {
        $payload = $body();
        $id = (int)($payload['id'] ?? 0);
        if ($id <= 0) {
            $json(['error' => 'ID inválido'], 422);
        }
        $slideService->delete($id);
        $json(['ok' => true]);
    }

    $entityMap = [
        'products' => $productService,
        'clients' => $clientService,
        'orders' => $orderService,
        'invoices' => $invoiceService,
        'slides' => $slideService,
    ];

    if (preg_match('#^/api/(products|clients|orders|invoices|slides)(?:/([^/]+))?$#', $currentRoute, $m)) {
        $entity = $m[1];
        $id = $m[2] ?? null;
        $service = $entityMap[$entity];

        if ($method === 'GET' && $id === null) {
            $json($service->list());
        }

        if ($method === 'PUT' && $id === null) {
            $payload = $body();
            if (array_is_list($payload)) {
                $service->replace($payload);
                $json(['ok' => true]);
            }
            $saved = $service->save($payload);
            $json($saved);
        }

        if ($method === 'POST' && $id === null) {
            $saved = $service->save($body());
            $json($saved, 201);
        }

        if (in_array($method, ['PUT', 'PATCH'], true) && $id !== null) {
            $payload = $body();
            $payload['id'] = $id;
            $saved = $service->save($payload);
            $json($saved);
        }

        if ($method === 'DELETE' && $id !== null) {
            if ($entity === 'slides') {
                $service->delete((int)$id);
            } else {
                $service->delete($id);
            }
            $json(['ok' => true]);
        }
    }

    $json(['error' => 'Endpoint no encontrado'], 404);
}

if ($currentRoute === '/logout') {
    $auth->logout();
    header('Location: /login');
    exit;
}

$loginError = null;
if ($currentRoute === '/login' && $method === 'POST') {
    $email = trim((string)($_POST['email'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if ($auth->login($email, $password)) {
        header('Location: /admin');
        exit;
    }

    $loginError = 'Credenciales inválidas';
}

if (str_starts_with($currentRoute, '/admin') && !$auth->isAuthenticated()) {
    header('Location: /login');
    exit;
}

$routes = [
  '/' => ['title' => 'Tienda', 'view' => 'store/catalogo.php', 'storeTab' => 'catalogo', 'adminTab' => null, 'admin' => false],
  '/categorias' => ['title' => 'Categorías', 'view' => 'store/categorias.php', 'storeTab' => 'categorias', 'adminTab' => null, 'admin' => false],
  '/login' => ['title' => 'Login', 'view' => 'auth/login.php', 'storeTab' => null, 'adminTab' => null, 'admin' => false],
  '/admin' => ['title' => 'Admin · Facturación', 'view' => 'admin/facturacion.php', 'storeTab' => null, 'adminTab' => 'facturacion', 'admin' => true],
  '/admin/productos' => ['title' => 'Admin · Stock', 'view' => 'admin/stock.php', 'storeTab' => null, 'adminTab' => 'stock', 'admin' => true],
  '/admin/stock' => ['title' => 'Admin · Stock', 'view' => 'admin/stock.php', 'storeTab' => null, 'adminTab' => 'stock', 'admin' => true],
  '/admin/pedidos' => ['title' => 'Admin · Pedidos', 'view' => 'admin/pedidos.php', 'storeTab' => null, 'adminTab' => 'pedidos', 'admin' => true],
  '/admin/clientes' => ['title' => 'Admin · Clientes', 'view' => 'admin/clientes.php', 'storeTab' => null, 'adminTab' => 'clientes', 'admin' => true],
  '/admin/ajustes' => ['title' => 'Admin · Ajustes', 'view' => 'admin/ajustes.php', 'storeTab' => null, 'adminTab' => 'ajustes', 'admin' => true],
];

$route = $routes[$currentRoute] ?? null;
if (!$route) {
  http_response_code(404);
  $route = ['title' => '404', 'view' => 'auth/login.php', 'storeTab' => null, 'adminTab' => null, 'admin' => false];
}

$pageTitle = 'La Distribuidora · ' . $route['title'];
$contentView = $route['view'];
$activeStoreTab = $route['storeTab'];
$activeAdminTab = $route['adminTab'];
$isAdminRoute = $route['admin'];
$showStoreNav = !$isAdminRoute && in_array($currentRoute, ['/', '/categorias'], true);
$showAdminNav = $isAdminRoute;
$isAuthenticated = $auth->isAuthenticated();

require dirname(__DIR__) . '/app/views/layout.php';
