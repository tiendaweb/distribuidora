<?php
$activeAdminTab = $activeAdminTab ?? 'facturacion';

$adminNavItems = [
    ['key' => 'facturacion', 'label' => 'Facturación', 'href' => '/admin', 'match' => ['facturacion'], 'icon' => 'fa-receipt'],
    ['key' => 'pedidos', 'label' => 'Pedidos', 'href' => '/admin/pedidos', 'match' => ['pedidos'], 'icon' => 'fa-box-open'],
    ['key' => 'stock', 'label' => 'Stock', 'href' => '/admin/productos', 'match' => ['stock', 'productos'], 'icon' => 'fa-boxes-stacked'],
    ['key' => 'clientes', 'label' => 'Clientes', 'href' => '/admin/clientes', 'match' => ['clientes'], 'icon' => 'fa-user-group'],
    ['key' => 'ajustes', 'label' => 'Ajustes', 'href' => '/admin/ajustes', 'match' => ['ajustes'], 'icon' => 'fa-gear'],
];
?>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<script>
(function() {
    const collapsed = localStorage.getItem('admin_nav_collapsed') === '1';
    if (collapsed && window.innerWidth >= 1024) {
        document.documentElement.classList.add('admin-nav-collapsed');
    }
})();
</script>

<nav id="admin-navbar">
    <aside class="admin-nav-sidebar">
        <div class="admin-nav-sidebar-header">
            <span class="admin-nav-sidebar-title">Mi Negocio</span>
            <button type="button" class="admin-nav-toggle-btn" id="toggle-sidebar" title="Expandir/Colapsar">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        </div>

        <div class="admin-nav-sidebar-menu">
            <?php foreach ($adminNavItems as $item): ?>
                <?php $active = in_array($activeAdminTab, $item['match']); ?>
                <a href="<?= $item['href'] ?>" class="admin-nav-item <?= $active ? 'active' : '' ?>" title="<?= $item['label'] ?>">
                    <span class="admin-nav-icon"><i class="fa-solid <?= $item['icon'] ?>"></i></span>
                    <span class="admin-nav-label"><?= $item['label'] ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </aside>

    <div class="admin-nav-mobile">
        <?php foreach ($adminNavItems as $item): ?>
            <?php $active = in_array($activeAdminTab, $item['match']); ?>
            <a href="<?= $item['href'] ?>" class="admin-nav-mobile-item <?= $active ? 'active' : '' ?>">
                <i class="fa-solid <?= $item['icon'] ?>"></i>
                <span><?= $item['label'] ?></span>
            </a>
        <?php endforeach; ?>
    </div>
</nav>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const btnToggle = document.getElementById('toggle-sidebar');
    const storageKey = 'admin_nav_collapsed';

    body.classList.add('admin-nav-present');

    if (document.documentElement.classList.contains('admin-nav-collapsed')) {
        body.classList.add('admin-nav-collapsed');
    }

    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            const isCollapsed = body.classList.toggle('admin-nav-collapsed');
            localStorage.setItem(storageKey, isCollapsed ? '1' : '0');
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth < 1024) {
            body.classList.remove('admin-nav-collapsed');
        } else if (localStorage.getItem(storageKey) === '1') {
            body.classList.add('admin-nav-collapsed');
        }
    });
});
</script>
