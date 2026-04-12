<?php
$cardClass = $cardClass ?? '';
$cardHeader = $cardHeader ?? '';
$cardContent = $cardContent ?? '';
$cardBodyClass = $cardBodyClass ?? '';
?>
<div class="overflow-hidden rounded-admin-lg border border-slate-200 bg-white shadow-admin-card <?= htmlspecialchars($cardClass) ?>">
  <?php if ($cardHeader !== ''): ?>
    <?= $cardHeader ?>
  <?php endif; ?>
  <div class="<?= htmlspecialchars($cardBodyClass) ?>">
    <?= $cardContent ?>
  </div>
</div>
