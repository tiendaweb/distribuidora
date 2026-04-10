<?php
// Detección de página activa (ajusta según tu lógica de ruteo)
$activeAdminTab = $activeAdminTab ?? 'facturacion'; 

$adminNavItems = [
    [
        'key' => 'facturacion',
        'label' => 'Facturación',
        'href' => '/admin',
        'match' => ['facturacion'],
        'icon' => 'fa-receipt' // Icono de factura/recibo
    ],
    [
        'key' => 'pedidos',
        'label' => 'Pedidos',
        'href' => '/admin/pedidos',
        'match' => ['pedidos'],
        'icon' => 'fa-box-open' // Icono de pedido/paquete
    ],
    [
        'key' => 'stock',
        'label' => 'Stock',
        'href' => '/admin/productos',
        'match' => ['stock', 'productos'],
        'icon' => 'fa-boxes-stacked' // Icono de almacén/stock
    ],
    [
        'key' => 'clientes',
        'label' => 'Clientes',
        'href' => '/admin/clientes',
        'match' => ['clientes'],
        'icon' => 'fa-user-group' // Icono de clientes/equipo
    ],
    [
        'key' => 'ajustes',
        'label' => 'Ajustes',
        'href' => '/admin/ajustes',
        'match' => ['ajustes'],
        'icon' => 'fa-gear' // Icono de configuración estándar
    ],
];
?>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<style>
:root {
    --nav-bg: #0f172a; /* Azul muy oscuro profesional */
    --nav-text: #94a3b8;
    --nav-active-bg: #3b82f6;
    --nav-hover-bg: #1e293b;
    --width-expanded: 260px;
    --width-collapsed: 75px;
    --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Base del body para que el contenido no quede debajo del menú */
body.admin-nav-present {
    margin: 0;
    padding-bottom: 70px; /* Espacio móvil */
    transition: padding-left var(--transition);
}

@media (min-width: 1024px) {
    body.admin-nav-present {
        padding-bottom: 0;
        padding-left: var(--width-expanded);
    }
    body.admin-nav-collapsed {
        padding-left: var(--width-collapsed);
    }
}

/* SIDEBAR DESKTOP */
.admin-nav-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--width-expanded);
    background: var(--nav-bg);
    color: white;
    display: none;
    flex-direction: column;
    z-index: 1000;
    transition: width var(--transition);
    border-right: 1px solid #1e293b;
    overflow: hidden;
}

@media (min-width: 1024px) {
    .admin-nav-sidebar { display: flex; }
}

.admin-nav-collapsed .admin-nav-sidebar {
    width: var(--width-collapsed);
}

/* Header del Sidebar */
.sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #1e293b;
}

.sidebar-title {
    font-weight: 700;
    font-size: 1.1rem;
    white-space: nowrap;
    opacity: 1;
    transition: opacity 0.2s;
}

.admin-nav-collapsed .sidebar-title {
    opacity: 0;
    pointer-events: none;
}

/* Botón Toggle */
.btn-toggle-nav {
    background: #1e293b;
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s;
}

.admin-nav-collapsed .btn-toggle-nav {
    transform: rotate(180deg);
}

/* Links de Navegación */
.sidebar-menu {
    flex: 1;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.nav-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    color: var(--nav-text);
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.2s;
    white-space: nowrap;
}

.nav-item:hover {
    background: var(--nav-hover-bg);
    color: white;
}

.nav-item.active {
    background: var(--nav-active-bg);
    color: white;
}

.nav-icon {
    min-width: 24px;
    font-size: 1.25rem;
    display: flex;
    justify-content: center;
}

.nav-label {
    margin-left: 15px;
    font-size: 0.95rem;
    opacity: 1;
    transition: opacity 0.2s;
}

.admin-nav-collapsed .nav-label {
    opacity: 0;
}

/* NAVEGACIÓN MÓVIL (Barra inferior) */
.admin-nav-mobile {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 65px;
    background: var(--nav-bg);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 1001;
    border-top: 1px solid #1e293b;
}

@media (min-width: 1024px) {
    .admin-nav-mobile { display: none; }
}

.mobile-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--nav-text);
    text-decoration: none;
    font-size: 0.65rem;
    flex: 1;
}

.mobile-item.active { color: var(--nav-active-bg); }
.mobile-item i { font-size: 1.2rem; margin-bottom: 4px; }
</style>

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
        <div class="sidebar-header">
            <span class="sidebar-title">Mi Negocio</span>
            <button type="button" class="btn-toggle-nav" id="toggle-sidebar" title="Expandir/Colapsar">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        </div>

        <div class="sidebar-menu">
            <?php foreach ($adminNavItems as $item): ?>
                <?php $active = in_array($activeAdminTab, $item['match']); ?>
                <a href="<?= $item['href'] ?>" class="nav-item <?= $active ? 'active' : '' ?>" title="<?= $item['label'] ?>">
                    <div class="nav-icon"><i class="fa-solid <?= $item['icon'] ?>"></i></div>
                    <span class="nav-label"><?= $item['label'] ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </aside>

    <div class="admin-nav-mobile">
        <?php foreach ($adminNavItems as $item): ?>
            <?php $active = in_array($activeAdminTab, $item['match']); ?>
            <a href="<?= $item['href'] ?>" class="mobile-item <?= $active ? 'active' : '' ?>">
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

    // Añadir clase al body para activar los márgenes
    body.classList.add('admin-nav-present');
    
    // Aplicar estado inicial guardado en el body
    if (document.documentElement.classList.contains('admin-nav-collapsed')) {
        body.classList.add('admin-nav-collapsed');
    }

    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            const isCollapsed = body.classList.toggle('admin-nav-collapsed');
            localStorage.setItem(storageKey, isCollapsed ? '1' : '0');
        });
    }

    // Limpieza al redimensionar
    window.addEventListener('resize', () => {
        if (window.innerWidth < 1024) {
            body.classList.remove('admin-nav-collapsed');
        } else if (localStorage.getItem(storageKey) === '1') {
            body.classList.add('admin-nav-collapsed');
        }
    });
});
</script>
