/* ============================================================
   BULK PRODUCTS EDIT
   ============================================================ */

function toggleProductSelection(productId) {
  if (STATE.selectedProductsForBulkEdit.has(productId)) {
    removeSelectedProduct(productId);
  } else {
    addSelectedProduct(productId);
  }
  renderStockTable();
  updateBulkEditPanel();
}

function selectAllProducts() {
  STATE.products.forEach(p => addSelectedProduct(p.id));
  renderStockTable();
  updateBulkEditPanel();
}

function deselectAllProducts() {
  clearSelectedProducts();
  renderStockTable();
  updateBulkEditPanel();
}

function updateBulkEditPanel() {
  const panel = document.getElementById('bulk-edit-panel');
  if (!panel) return;

  if (!hasSelectedProducts()) {
    panel.style.display = 'none';
    return;
  }

  const count = getSelectedProducts().length;
  panel.style.display = 'block';

  const countEl = document.getElementById('bulk-edit-count');
  if (countEl) countEl.textContent = count;
}

function applyBulkEdit() {
  const costChangeInput = document.getElementById('bulk-edit-cost-change');
  const saleChangeInput = document.getElementById('bulk-edit-sale-change');

  const costChange = parseFloat(costChangeInput?.value) || 0;
  const saleChange = parseFloat(saleChangeInput?.value) || 0;

  if (costChange === 0 && saleChange === 0) {
    showToast('Ingresa un cambio de porcentaje', 'warning');
    return;
  }

  const selectedIds = getSelectedProducts();
  const affectedProducts = STATE.products.filter(p => selectedIds.includes(p.id));

  if (!affectedProducts.length) {
    showToast('Selecciona al menos un producto', 'warning');
    return;
  }

  // Show preview
  const previewHtml = `
    <p style="margin-bottom: 12px;"><strong>Se afectarán ${affectedProducts.length} producto(s):</strong></p>
    <div style="max-height: 300px; overflow-y: auto; margin-bottom: 12px;">
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <thead>
          <tr style="background: #f3f4f6; border-bottom: 2px solid #ddd;">
            <th style="padding: 6px; text-align: left;">Producto</th>
            <th style="padding: 6px; text-align: right;">Costo Actual</th>
            <th style="padding: 6px; text-align: right;">Nuevo Costo</th>
            <th style="padding: 6px; text-align: right;">Venta Actual</th>
            <th style="padding: 6px; text-align: right;">Nueva Venta</th>
          </tr>
        </thead>
        <tbody>
          ${affectedProducts.map(p => {
            const newCost = costChange !== 0 ? Math.round(p.cost * (1 + costChange / 100)) : p.cost;
            const newSale = saleChange !== 0 ? Math.round(p.sale * (1 + saleChange / 100)) : calculateSalePrice(newCost, p.margin);
            return `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 6px; font-weight: 600;">${escapeHtml(p.name.substring(0, 30))}</td>
                <td style="padding: 6px; text-align: right;">${fmt(p.cost)}</td>
                <td style="padding: 6px; text-align: right; color: ${newCost !== p.cost ? '#10b981' : '#666'};"><strong>${fmt(newCost)}</strong></td>
                <td style="padding: 6px; text-align: right;">${fmt(p.sale)}</td>
                <td style="padding: 6px; text-align: right; color: ${newSale !== p.sale ? '#10b981' : '#666'};"><strong>${fmt(newSale)}</strong></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  const backdrop = document.createElement('div');
  backdrop.className = 'overlay open';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const dialog = document.createElement('div');
  dialog.className = 'card';
  dialog.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 800px;
    width: 90%;
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
    z-index: 10001;
    max-height: 80vh;
    overflow-y: auto;
  `;

  dialog.innerHTML = `
    <h3 style="margin: 0 0 12px; color: var(--color-ink);">Revisar cambios</h3>
    ${previewHtml}
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button class="btn btn-secondary" id="bulk-preview-cancel">Cancelar</button>
      <button class="btn btn-success" id="bulk-preview-confirm" style="background: var(--color-success); color: white;">Aplicar cambios</button>
    </div>
  `;

  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);

  document.getElementById('bulk-preview-cancel').onclick = () => {
    backdrop.remove();
  };

  document.getElementById('bulk-preview-confirm').onclick = () => {
    // Apply changes
    affectedProducts.forEach(p => {
      if (costChange !== 0) {
        p.cost = Math.round(p.cost * (1 + costChange / 100));
      }
      if (saleChange !== 0) {
        p.sale = Math.round(p.sale * (1 + saleChange / 100));
      } else if (costChange !== 0) {
        p.sale = calculateSalePrice(p.cost, p.margin);
      }
    });

    persistData();
    renderStockTable();
    clearSelectedProducts();
    updateBulkEditPanel();

    backdrop.remove();
    showToast(`Se actualizaron ${affectedProducts.length} producto(s)`, 'success');

    // Clear inputs
    if (costChangeInput) costChangeInput.value = '';
    if (saleChangeInput) saleChangeInput.value = '';
  };

  backdrop.onclick = (e) => {
    if (e.target === backdrop) {
      backdrop.remove();
    }
  };
}

function cancelBulkEdit() {
  clearSelectedProducts();
  renderStockTable();
  updateBulkEditPanel();

  const costChangeInput = document.getElementById('bulk-edit-cost-change');
  const saleChangeInput = document.getElementById('bulk-edit-sale-change');
  if (costChangeInput) costChangeInput.value = '';
  if (saleChangeInput) saleChangeInput.value = '';
}
