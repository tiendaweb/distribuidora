<?php
$adminNavItems = [
  [
    'key' => 'facturacion',
    'label' => 'Facturación',
    'href' => '/admin',
    'match' => ['facturacion'],
    'icon' => '<path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 16l2 2 3-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  ],
  [
    'key' => 'pedidos',
    'label' => 'Pedidos',
    'href' => '/admin/pedidos',
    'match' => ['pedidos'],
    'icon' => '<path d="M4 5h16v12H4z" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  ],
  [
    'key' => 'stock',
    'label' => 'Stock',
    'href' => '/admin/productos',
    'match' => ['stock', 'productos'],
    'icon' => '<path d="M12 3l8 4-8 4-8-4 8-4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 11l8 4 8-4M4 15l8 4 8-4" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
  ],
  [
    'key' => 'clientes',
    'label' => 'Clientes',
    'href' => '/admin/clientes',
    'match' => ['clientes'],
    'icon' => '<circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="2"/><path d="M3.5 18c0-2.5 2.6-4.5 5.5-4.5s5.5 2 5.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 9h5M18.5 6.5v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
  ],
  [
    'key' => 'ajustes',
    'label' => 'Ajustes',
    'href' => '/admin/ajustes',
    'match' => ['ajustes'],
    'icon' => '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.6 1.6 0 0 1-2.3 2.3l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9v.3a1.6 1.6 0 1 1-3.2 0v-.3a1 1 0 0 0-.7-.9 1 1 0 0 0-1 .2l-.2.1a1.6 1.6 0 1 1-2.3-2.3l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6h-.3a1.6 1.6 0 1 1 0-3.2h.3a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1l-.1-.2a1.6 1.6 0 1 1 2.3-2.3l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4.6a1.6 1.6 0 1 1 3.2 0v.3a1 1 0 0 0 .7.9h.1a1 1 0 0 0 1-.2l.2-.1a1.6 1.6 0 1 1 2.3 2.3l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6h.3a1.6 1.6 0 1 1 0 3.2H20a1 1 0 0 0-.6.7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  ],
];
?>

<script>
(function() {
  if (!document.body || !window.matchMedia || !window.localStorage) return;
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  document.body.classList.add('admin-nav-present');
  if (!isDesktop) return;

  if (window.localStorage.getItem('admin-nav-collapsed') === '1') {
    document.body.classList.add('admin-nav-collapsed');
  }
})();
</script>

<nav id="nav-admin" class="admin-nav" aria-label="Navegación de administración">
  <aside class="admin-nav-desktop" id="admin-nav-desktop">
    <div class="admin-nav-desktop-header">
      <span class="admin-nav-title">Admin</span>
      <button
        type="button"
        id="admin-nav-toggle"
        class="admin-nav-toggle"
        aria-expanded="true"
        aria-controls="admin-nav-list"
        aria-label="Colapsar barra lateral"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <div class="admin-nav-links" id="admin-nav-list">
      <?php foreach ($adminNavItems as $item): ?>
        <?php $isActive = in_array($activeAdminTab, $item['match'], true); ?>
        <a
          class="admin-nav-link <?= $isActive ? 'active' : '' ?>"
          data-tab="<?= htmlspecialchars($item['key']) ?>"
          href="<?= htmlspecialchars($item['href']) ?>"
          title="<?= htmlspecialchars($item['label']) ?>"
        >
          <span class="admin-nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><?= $item['icon'] ?></svg>
          </span>
          <span class="admin-nav-label"><?= htmlspecialchars($item['label']) ?></span>
        </a>
      <?php endforeach; ?>
    </div>
  </aside>

  <div class="admin-nav-mobile" role="tablist" aria-label="Navegación rápida administración">
    <?php foreach ($adminNavItems as $item): ?>
      <?php $isActive = in_array($activeAdminTab, $item['match'], true); ?>
      <a
        class="admin-mobile-link <?= $isActive ? 'active' : '' ?>"
        data-tab="<?= htmlspecialchars($item['key']) ?>"
        href="<?= htmlspecialchars($item['href']) ?>"
        title="<?= htmlspecialchars($item['label']) ?>"
      >
        <span class="admin-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><?= $item['icon'] ?></svg>
        </span>
        <span class="admin-mobile-label"><?= htmlspecialchars($item['label']) ?></span>
      </a>
    <?php endforeach; ?>
  </div>
</nav>

<script>
(function() {
  const body = document.body;
  const desktopNav = document.getElementById('admin-nav-desktop');
  const toggleButton = document.getElementById('admin-nav-toggle');
  const desktopQuery = window.matchMedia('(min-width: 1024px)');
  const storageKey = 'admin-nav-collapsed';

  if (!body || !desktopNav || !toggleButton) return;
  body.classList.add('admin-nav-present');

  const applyCollapseState = (collapsed) => {
    body.classList.toggle('admin-nav-collapsed', collapsed);
    toggleButton.setAttribute('aria-expanded', String(!collapsed));
    toggleButton.setAttribute('aria-label', collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral');
  };

  const readInitialState = () => {
    if (!desktopQuery.matches) {
      applyCollapseState(false);
      return;
    }

    const collapsed = window.localStorage ? window.localStorage.getItem(storageKey) === '1' : false;
    applyCollapseState(collapsed);
  };

  toggleButton.addEventListener('click', () => {
    const willCollapse = !body.classList.contains('admin-nav-collapsed');
    applyCollapseState(willCollapse);

    if (window.localStorage) {
      window.localStorage.setItem(storageKey, willCollapse ? '1' : '0');
    }
  });

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', readInitialState);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(readInitialState);
  }

  readInitialState();
})();
</script>
