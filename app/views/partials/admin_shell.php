<?php
$adminShellTitle = $adminShellTitle ?? 'Panel de administración';
$adminShellSubtitle = $adminShellSubtitle ?? '';
$adminShellActions = $adminShellActions ?? '';
$adminShellContent = $adminShellContent ?? '';
$adminShellContainerClass = $adminShellContainerClass ?? 'max-w-7xl';
?>

<div class="admin-shell min-h-screen bg-slate-100">
  <div class="px-4 py-5 sm:px-6 lg:px-8">
    <div class="mx-auto w-full <?= htmlspecialchars($adminShellContainerClass) ?> space-y-4">
      <header class="rounded-admin-lg border border-slate-200 bg-white px-4 py-4 shadow-admin-card sm:px-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-xl font-semibold text-slate-900 sm:text-2xl"><?= htmlspecialchars($adminShellTitle) ?></h1>
            <?php if (!empty($adminShellSubtitle)): ?>
              <p class="mt-1 text-sm text-slate-500"><?= htmlspecialchars($adminShellSubtitle) ?></p>
            <?php endif; ?>
          </div>
          <?php if (!empty($adminShellActions)): ?>
            <div class="flex flex-wrap items-center gap-2"><?= $adminShellActions ?></div>
          <?php endif; ?>
        </div>
      </header>

      <section class="admin-shell-content"><?= $adminShellContent ?></section>
    </div>
  </div>
</div>
