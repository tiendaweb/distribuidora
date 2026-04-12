<?php
$fieldTag = $fieldTag ?? 'input';
$fieldType = $fieldType ?? 'text';
$fieldId = $fieldId ?? '';
$fieldName = $fieldName ?? '';
$fieldValue = $fieldValue ?? '';
$fieldPlaceholder = $fieldPlaceholder ?? '';
$fieldClass = $fieldClass ?? 'w-full border rounded p-2 text-sm';
$fieldRequired = $fieldRequired ?? false;
$fieldOptions = $fieldOptions ?? [];
$fieldAttributes = $fieldAttributes ?? '';
?>
<?php if ($fieldTag === 'select'): ?>
  <select
    <?= $fieldId !== '' ? 'id="' . htmlspecialchars($fieldId) . '"' : '' ?>
    <?= $fieldName !== '' ? 'name="' . htmlspecialchars($fieldName) . '"' : '' ?>
    class="<?= htmlspecialchars($fieldClass) ?>"
    <?= $fieldRequired ? 'required' : '' ?>
    <?= $fieldAttributes ?>
  >
    <?php foreach ($fieldOptions as $option): ?>
      <?php
      $optionValue = $option['value'] ?? '';
      $optionLabel = $option['label'] ?? $optionValue;
      ?>
      <option value="<?= htmlspecialchars($optionValue) ?>"><?= htmlspecialchars($optionLabel) ?></option>
    <?php endforeach; ?>
  </select>
<?php else: ?>
  <input
    type="<?= htmlspecialchars($fieldType) ?>"
    <?= $fieldId !== '' ? 'id="' . htmlspecialchars($fieldId) . '"' : '' ?>
    <?= $fieldName !== '' ? 'name="' . htmlspecialchars($fieldName) . '"' : '' ?>
    value="<?= htmlspecialchars($fieldValue) ?>"
    placeholder="<?= htmlspecialchars($fieldPlaceholder) ?>"
    class="<?= htmlspecialchars($fieldClass) ?>"
    <?= $fieldRequired ? 'required' : '' ?>
    <?= $fieldAttributes ?>
  >
<?php endif; ?>
