<?php
$badgeLabel = $badgeLabel ?? '';
$badgeStatus = $badgeStatus ?? 'default';
$badgeClass = $badgeClass ?? '';

$badgePalette = [
    'success' => 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'warning' => 'bg-amber-100 text-amber-700 border-amber-200',
    'danger' => 'bg-rose-100 text-rose-700 border-rose-200',
    'info' => 'bg-sky-100 text-sky-700 border-sky-200',
    'neutral' => 'bg-slate-100 text-slate-700 border-slate-200',
    'default' => 'bg-slate-100 text-slate-700 border-slate-200',
];

$badgeToneClass = $badgePalette[$badgeStatus] ?? $badgePalette['default'];
?>
<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold <?= $badgeToneClass ?> <?= htmlspecialchars($badgeClass) ?>">
  <?= htmlspecialchars($badgeLabel) ?>
</span>
