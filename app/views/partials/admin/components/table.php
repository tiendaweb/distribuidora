<?php
$tableClass = $tableClass ?? 'w-full admin-table';
$tableHead = $tableHead ?? '';
$tableBodyId = $tableBodyId ?? '';
$tableBody = $tableBody ?? '';
$tableWrapperClass = $tableWrapperClass ?? 'overflow-x-auto';
?>
<div class="<?= htmlspecialchars($tableWrapperClass) ?>">
  <table class="<?= htmlspecialchars($tableClass) ?>">
    <?php if ($tableHead !== ''): ?>
      <thead>
        <?= $tableHead ?>
      </thead>
    <?php endif; ?>
    <tbody <?= $tableBodyId !== '' ? 'id="' . htmlspecialchars($tableBodyId) . '"' : '' ?>>
      <?= $tableBody ?>
    </tbody>
  </table>
</div>
