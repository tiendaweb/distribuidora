<?php
$buttonLabel = $buttonLabel ?? '';
$buttonType = $buttonType ?? 'button';
$buttonVariant = $buttonVariant ?? 'primary';
$buttonId = $buttonId ?? '';
$buttonOnclick = $buttonOnclick ?? '';
$buttonClass = $buttonClass ?? '';
$buttonAttributes = $buttonAttributes ?? '';

$buttonVariantClass = [
    'primary' => 'bg-brand text-ink hover:bg-brand-dark',
    'secondary' => 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    'ghost' => 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
][$buttonVariant] ?? 'bg-brand text-ink hover:bg-brand-dark';
?>
<button
  type="<?= htmlspecialchars($buttonType) ?>"
  <?= $buttonId !== '' ? 'id="' . htmlspecialchars($buttonId) . '"' : '' ?>
  <?= $buttonOnclick !== '' ? 'onclick="' . htmlspecialchars($buttonOnclick) . '"' : '' ?>
  class="inline-flex items-center justify-center gap-2 rounded-admin-md px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark <?= $buttonVariantClass ?> <?= htmlspecialchars($buttonClass) ?>"
  <?= $buttonAttributes ?>
>
  <?= htmlspecialchars($buttonLabel) ?>
</button>
