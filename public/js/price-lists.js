/* ============================================================
   PRICE LISTS MANAGEMENT
   Gestiona las listas de precios (mayorista, especial, etc.).
   Cada lista tiene un factor multiplicador sobre el precio base.
   Opcionalmente puede tener overrides por producto (precio fijo).
   Depende de: STATE.priceLists, apiFetch(), persistData().
   Página dedicada: /admin/listas-precios
   ============================================================ */

function getPriceForList(product, priceListId) {
  if (!priceListId || !product) return product && product.sale;
  const list = STATE.priceLists.find(pl => pl.id === priceListId);
  if (!list) return product.sale;

  const overrides = list.overrides && typeof list.overrides === 'object' ? list.overrides : {};
  if (overrides[product.id] !== undefined) {
    return overrides[product.id];
  }

  return roundPrice(product.sale * list.factor);
}

async function setPriceOverride(priceListId, productId, price) {
  const listIdx = STATE.priceLists.findIndex(pl => pl.id === priceListId);
  if (listIdx === -1) return;
  if (!STATE.priceLists[listIdx].overrides) STATE.priceLists[listIdx].overrides = {};
  STATE.priceLists[listIdx].overrides[String(productId)] = parseFloat(price);
  await savePriceListToApi(listIdx);
}

async function clearPriceOverride(priceListId, productId) {
  const listIdx = STATE.priceLists.findIndex(pl => pl.id === priceListId);
  if (listIdx === -1) return;
  if (STATE.priceLists[listIdx].overrides) {
    delete STATE.priceLists[listIdx].overrides[String(productId)];
  }
  await savePriceListToApi(listIdx);
}

/** Persiste una lista de precios individual (nombre + factor + overrides) via API. */
async function savePriceListToApi(listIdx) {
  const list = STATE.priceLists[listIdx];
  if (!list) return;
  const saved = await apiFetch(`/api/price-lists/${list.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: list.name,
      description: list.description || '',
      factor: list.factor,
      is_active: list.is_active ? 1 : 0,
      is_default: list.is_default ? 1 : 0,
      overrides: list.overrides || {},
    })
  });
  STATE.priceLists[listIdx] = saved;
}

function getActivePriceListFactor() {
  if (!STATE.activePriceListId) return 1.0;
  const list = STATE.priceLists.find(pl => pl.id === STATE.activePriceListId);
  return (list && list.factor) || 1.0;
}

function applyPriceListFactor(basePrice) {
  const factor = getActivePriceListFactor();
  return roundPrice(basePrice * factor);
}

function renderPriceListsSection() {
  const tbody = document.getElementById('price-lists-tbody');
  if (!tbody) return;

  if (!STATE.priceLists.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 32px; color: #999;">No hay listas de precios</td></tr>';
    return;
  }

  tbody.innerHTML = STATE.priceLists.map(list => `
    <tr>
      <td style="font-weight: bold; color: var(--color-ink);">${escapeHtml(list.name)}${list.is_default ? ' <span style="font-size:11px; background:#d1fae5; color:#065f46; padding:2px 6px; border-radius:3px;">PRINCIPAL</span>' : ''}</td>
      <td>${escapeHtml(list.description || '—')}</td>
      <td style="text-align: right;"><strong>${(list.factor * 100).toFixed(1)}%</strong></td>
      <td style="text-align: center;">${list.is_active ? '<span style="color:#10b981;">✓ Activa</span>' : '<span style="color:#999;">Inactiva</span>'}</td>
      <td style="text-align: right;">
        <button onclick="openPriceListForm(${list.id})" class="btn btn-secondary btn-sm">Editar</button>
        ${!list.is_default ? `<button onclick="deletePriceList(${list.id})" class="btn btn-danger btn-sm">Eliminar</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function openPriceListForm(id = null) {
  const modal = document.getElementById('price-list-modal');
  if (!modal) return;

  const nameInput = document.getElementById('pl-name');
  const descInput = document.getElementById('pl-description');
  const factorInput = document.getElementById('pl-factor');
  const isActiveCheckbox = document.getElementById('pl-is-active');
  const idInput = document.getElementById('pl-id');
  const titleEl = document.getElementById('pl-modal-title');

  if (!id) {
    idInput.value = '';
    nameInput.value = '';
    descInput.value = '';
    factorInput.value = '100';
    isActiveCheckbox.checked = true;
    titleEl.textContent = 'Nueva Lista de Precios';
  } else {
    const list = STATE.priceLists.find(pl => pl.id === id);
    if (!list) return;
    idInput.value = id;
    nameInput.value = list.name || '';
    descInput.value = list.description || '';
    factorInput.value = (list.factor * 100).toFixed(1);
    isActiveCheckbox.checked = list.is_active;
    titleEl.textContent = 'Editar Lista de Precios';
  }

  openModal('price-list-modal');
}

async function savePriceList() {
  const nameInput = document.getElementById('pl-name');
  const descInput = document.getElementById('pl-description');
  const factorInput = document.getElementById('pl-factor');
  const isActiveCheckbox = document.getElementById('pl-is-active');
  const idInput = document.getElementById('pl-id');

  const name = nameInput && nameInput.value.trim();
  if (!name) {
    showToast('Ingresa el nombre de la lista', 'warning');
    return;
  }

  const rawFactor = parseFloat(factorInput && factorInput.value);
  if (isNaN(rawFactor) || rawFactor <= 0 || rawFactor > 500) {
    showToast('El factor debe ser un porcentaje entre 1 y 500', 'warning');
    return;
  }
  const factor = rawFactor / 100;
  const id = idInput && idInput.value ? parseInt(idInput.value) : null;

  const saveBtn = document.querySelector('#price-list-modal .btn-primary, #listas-precios-form button[type="submit"]');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Guardando...'; }

  try {
    let url = '/api/price-lists';
    let method = 'POST';

    if (id) {
      url = `/api/price-lists/${id}`;
      method = 'PUT';
    }

    // Preservar overrides existentes — el backend los borra si no se incluyen
    const existingList = id ? STATE.priceLists.find(pl => pl.id === id) : null;
    const payload = {
      name,
      description: (descInput && descInput.value.trim()) || '',
      factor,
      is_active: (isActiveCheckbox && isActiveCheckbox.checked) ? 1 : 0,
      is_default: id === 1 ? 1 : 0,
      overrides: existingList ? (existingList.overrides || {}) : {},
    };

    const saved = await apiFetch(url, {
      method,
      body: JSON.stringify(payload)
    });

    if (id) {
      const idx = STATE.priceLists.findIndex(pl => pl.id === id);
      if (idx > -1) {
        STATE.priceLists[idx] = saved;
      }
    } else {
      STATE.priceLists.push(saved);
    }

    if (saved.is_default) {
      STATE.activePriceListId = saved.id;
    }

    persistData();
    renderPriceListsSection();
    renderPosListSelector();
    closeModal('price-list-modal');
    showToast(id ? 'Lista actualizada' : 'Lista creada', 'success');
  } catch (err) {
    showToast('Error al guardar la lista: ' + err.message, 'error');
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar'; }
  }
}

function deletePriceList(id) {
  const list = STATE.priceLists.find(pl => pl.id === id);
  if (!list || list.is_default) {
    showToast('No se puede eliminar la lista principal', 'warning');
    return;
  }

  showConfirmDialog(`¿Eliminar la lista "${list.name}"?`, async () => {
    try {
      await apiFetch(`/api/price-lists/${id}`, { method: 'DELETE' });
      STATE.priceLists = STATE.priceLists.filter(pl => pl.id !== id);
      persistData();
      renderPriceListsSection();
      renderPosListSelector();
      showToast('Lista eliminada', 'success');
    } catch (err) {
      showToast('Error al eliminar la lista: ' + err.message, 'error');
    }
  });
}

function renderPosListSelector() {
  const select = document.getElementById('pos-price-list');
  if (!select) return;

  if (!STATE.priceLists || !STATE.priceLists.length) {
    console.warn('No hay listas de precios para mostrar');
    select.innerHTML = '<option value="">Sin listas de precios</option>';
    return;
  }

  select.innerHTML = STATE.priceLists.map(list => `
    <option value="${list.id}" ${list.id === STATE.activePriceListId ? 'selected' : ''}>
      ${escapeHtml(list.name)} (${(list.factor * 100).toFixed(1)}%)
    </option>
  `).join('');
}

function populatePriceListSelector(selectElement) {
  if (!selectElement) return;
  const options = ['<option value="">Sin asignar</option>'];
  options.push(...STATE.priceLists.map(list => `<option value="${list.id}">${escapeHtml(list.name)}</option>`));
  selectElement.innerHTML = options.join('');
}

function getPriceListName(priceListId) {
  if (!priceListId) return '—';
  const list = STATE.priceLists.find(pl => pl.id === priceListId);
  return list ? list.name : '—';
}

function initPriceListsSection() {
  const form = document.getElementById('price-list-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await savePriceList();
    });
  }

  renderPriceListsSection();
  renderPosListSelector();
}
