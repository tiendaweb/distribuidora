<?php
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$uri = rtrim($uri, '/');
$currentRoute = $uri === '' ? '/' : $uri;

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

require dirname(__DIR__) . '/app/views/layout.php';
