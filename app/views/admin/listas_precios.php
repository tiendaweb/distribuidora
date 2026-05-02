<div id="view-admin" class="flex-1 bg-gray-50 min-h-screen pb-10">

  <!-- Header -->
  <div class="bg-white border-b sticky top-0 z-20 shadow-sm">
    <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Listas de Precios</h1>
        <p class="text-sm text-gray-500">Administrá las listas de precios para mayoristas, minoristas y clientes especiales</p>
      </div>
      <button onclick="openPriceListForm()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2">
        <i class="fas fa-plus"></i> Nueva Lista
      </button>
    </div>
  </div>

  <div class="max-w-5xl mx-auto px-4 py-6 space-y-6">

    <!-- Tabla de listas -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-semibold text-gray-800">Listas activas</h2>
        <span class="text-xs text-gray-400">El factor multiplica el precio base de cada producto</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-6 py-3 font-semibold text-gray-600">Nombre</th>
              <th class="text-left px-6 py-3 font-semibold text-gray-600">Descripción</th>
              <th class="text-right px-6 py-3 font-semibold text-gray-600">Factor</th>
              <th class="text-center px-6 py-3 font-semibold text-gray-600">Estado</th>
              <th class="text-right px-6 py-3 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody id="price-lists-tbody">
            <tr>
              <td colspan="5" class="text-center py-10 text-gray-400">
                <i class="fas fa-spinner fa-spin mr-2"></i> Cargando listas...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Comparativa de precios por producto -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="font-semibold text-gray-800">Comparativa de precios por producto</h2>
          <p class="text-xs text-gray-500 mt-1">Precios de venta calculados para cada lista activa. Editá una celda para fijar un precio especial.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-semibold text-gray-600 whitespace-nowrap">Categoría:</label>
          <select id="price-cat-filter" onchange="renderPriceComparisonTable()" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white min-w-[140px]">
            <option value="">Todas</option>
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm" id="price-comparison-table">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr id="price-comparison-header">
              <th class="text-left px-6 py-3 font-semibold text-gray-600">Producto</th>
            </tr>
          </thead>
          <tbody id="price-comparison-body">
            <tr>
              <td class="text-center py-10 text-gray-400">
                <i class="fas fa-spinner fa-spin mr-2"></i> Cargando...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<script>
/* ============================================================
   Tabla comparativa de precios por producto con edición inline.
   Llamada desde app.js después de que STATE está cargado.
   Permite sobreescribir el precio de cada producto por lista.
   Los overrides se guardan en list.overrides[productId].
   ============================================================ */

function populatePriceCatFilter() {
  const sel = document.getElementById('price-cat-filter');
  if (!sel) return;
  const cats = [...new Set((STATE.products || []).map(p => p.cat).filter(Boolean))].sort();
  const current = sel.value;
  sel.innerHTML = '<option value="">Todas</option>' +
    cats.map(c => `<option value="${escapeHtml(c)}" ${c === current ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
}

function renderPriceComparisonTable() {
  const header = document.getElementById('price-comparison-header');
  const body = document.getElementById('price-comparison-body');
  if (!header || !body) return;

  populatePriceCatFilter();

  const activeLists = (STATE.priceLists || []).filter(pl => pl.is_active);
  if (activeLists.length === 0) {
    body.innerHTML = '<tr><td colspan="2" class="text-center py-8 text-gray-400">Sin listas activas</td></tr>';
    return;
  }

  const catFilter = (document.getElementById('price-cat-filter') || {}).value || '';
  const products = (STATE.products || []).filter(p => !catFilter || p.cat === catFilter);

  header.innerHTML =
    '<th class="text-left px-4 py-3 font-semibold text-gray-600 w-10"></th>' +
    '<th class="text-left px-2 py-3 font-semibold text-gray-600 min-w-[160px]">Producto</th>' +
    activeLists.map(l =>
      `<th class="text-right px-4 py-3 font-semibold text-gray-600 min-w-[140px]">
        ${escapeHtml(l.name)}
        <br><span class="text-xs font-normal text-gray-400">Factor ${(l.factor * 100).toFixed(1)}%</span>
       </th>`
    ).join('') + '<th class="w-8"></th>';

  const rows = products.map(p => {
    const cells = activeLists.map(l => {
      const overrides = l.overrides && typeof l.overrides === 'object' && !Array.isArray(l.overrides) ? l.overrides : {};
      const hasOverride = overrides[String(p.id)] !== undefined;
      const overrideVal = overrides[String(p.id)];
      const effectivePrice = hasOverride ? overrideVal : roundPrice(p.sale * l.factor);
      const pctFromBase = p.sale > 0 ? ((effectivePrice / p.sale - 1) * 100) : 0;
      const pctSign = pctFromBase > 0.05 ? '+' : '';
      const pctClass = pctFromBase > 0.05 ? 'text-green-500' : pctFromBase < -0.05 ? 'text-red-400' : 'text-gray-400';
      const inputClass = hasOverride
        ? 'w-28 text-right border border-indigo-400 bg-indigo-50 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400'
        : 'w-28 text-right border border-gray-200 bg-white rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400';

      const pid = String(p.id).replace(/'/g, "\\'");
      return `<td class="px-4 py-2 text-right">
        <div class="flex flex-col items-end gap-0.5">
          <input
            type="number" step="0.01" min="0"
            value="${effectivePrice.toFixed(2)}"
            class="${inputClass}"
            id="override-${l.id}-${pid}"
            oninput="updatePricePct(${l.id}, '${pid}', ${p.sale}, this.value)"
            onchange="savePriceCellOverride(${l.id}, '${pid}', ${p.sale}, ${l.factor}, this)"
          >
          <span class="text-xs ${pctClass}" id="pct-${l.id}-${pid}">${pctSign}${pctFromBase.toFixed(1)}%</span>
        </div>
      </td>`;
    }).join('');

    const imgSrc = p.img || '';
    const imgEl = imgSrc
      ? `<img src="${escapeHtml(imgSrc)}" alt="" class="w-8 h-8 object-cover rounded" onerror="this.style.display='none'">`
      : `<div class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-300"><i class="fas fa-image text-xs"></i></div>`;

    return `<tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="px-4 py-2">${imgEl}</td>
      <td class="px-2 py-2 font-medium text-gray-800 text-sm">${escapeHtml(p.name)}
        <div class="text-xs text-gray-400 font-normal">Base: ${fmt(p.sale)}</div>
      </td>
      ${cells}
    </tr>`;
  }).join('');

  body.innerHTML = rows || '<tr><td colspan="99" class="text-center py-8 text-gray-400">Sin productos en esta categoría</td></tr>';
}

/** Actualiza el badge de porcentaje mientras el usuario escribe. */
function updatePricePct(listId, productId, basePrice, newValue) {
  const pctEl = document.getElementById(`pct-${listId}-${productId}`);
  if (!pctEl) return;
  const val = parseFloat(newValue);
  if (isNaN(val) || basePrice <= 0) return;
  const pct = ((val / basePrice - 1) * 100);
  const sign = pct > 0.05 ? '+' : '';
  pctEl.textContent = `${sign}${pct.toFixed(1)}%`;
  pctEl.className = `text-xs ${pct > 0.05 ? 'text-green-500' : pct < -0.05 ? 'text-red-400' : 'text-gray-400'}`;
}

/**
 * Guarda o limpia el override al confirmar el valor.
 * Si el nuevo precio coincide con el precio de factor (±$0.01), limpia el override.
 */
async function savePriceCellOverride(listId, productId, basePrice, factor, input) {
  const val = parseFloat(input.value);
  if (isNaN(val) || val < 0) return;

  input.disabled = true;
  try {
    const factorPrice = roundPrice(basePrice * factor);
    const isFactorPrice = Math.abs(val - factorPrice) < 0.015;

    if (isFactorPrice) {
      await clearPriceOverride(listId, productId);
    } else {
      await setPriceOverride(listId, productId, val);
    }

    showToast('Precio guardado', 'success');
    // Re-renderizar para reflejar el estado guardado desde el servidor
    renderPriceComparisonTable();
  } catch (err) {
    showToast('Error al guardar precio: ' + (err.message || err), 'error');
    // Restaurar valor anterior en caso de error
    renderPriceComparisonTable();
  } finally {
    input.disabled = false;
  }
}
</script>
