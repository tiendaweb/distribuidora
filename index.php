<?php

declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$publicPath = __DIR__ . '/public' . $uri;

if ($uri !== '/' && is_file($publicPath)) {
    $mime = mime_content_type($publicPath) ?: 'application/octet-stream';
    header('Content-Type: ' . $mime);
    readfile($publicPath);
    exit;
}

if ($uri === '/install.php') {
    require __DIR__ . '/install.php';
    exit;
}

$installFlag = __DIR__ . '/storage/.installed';
if (!is_file($installFlag)) {
    header('Location: /install.php');
    exit;
}

require __DIR__ . '/public/index.php';
