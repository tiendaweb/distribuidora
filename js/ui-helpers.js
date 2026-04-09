/* ============================================================
   UI HELPER FUNCTIONS
   ============================================================ */

// TOAST NOTIFICATIONS
function showToast(message, type = 'info', duration = CONFIG.TOAST_TIMEOUT) {
  let toast = document.getElementById('app-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-ink);
      color: white;
      padding: 12px 24px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      z-index: 9999;
      transition: opacity 0.3s ease;
      white-space: nowrap;
      border: 2px solid var(--color-brand);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    document.body.appendChild(toast);
  }

  // Icon mapping
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ⓘ'
  };

  // Color mapping
  const colors = {
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  };

  const icon = icons[type] || icons.info;
  const bgColor = colors[type] || colors.info;

  toast.style.background = bgColor;
  toast.textContent = icon + ' ' + message;
  toast.style.opacity = '1';

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
  }, duration);
}

// MODAL CONTROLS
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.add('open');
  }, 10);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('open');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 250);
}

function isModalOpen(modalId) {
  const modal = document.getElementById(modalId);
  return modal && modal.classList.contains('open');
}

// DRAWER CONTROLS
function openDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);
  const overlay = document.getElementById(drawerId + '-overlay');

  if (!drawer) return;

  drawer.classList.remove('hidden');
  if (overlay) overlay.classList.remove('hidden');

  setTimeout(() => {
    drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
  }, 10);
}

function closeDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);
  const overlay = document.getElementById(drawerId + '-overlay');

  if (!drawer) return;

  drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');

  setTimeout(() => {
    drawer.classList.add('hidden');
    if (overlay) overlay.classList.add('hidden');
  }, 250);
}

function toggleDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);
  if (!drawer) return;

  if (drawer.classList.contains('open')) {
    closeDrawer(drawerId);
  } else {
    openDrawer(drawerId);
  }
}

// TAB CONTROLS
function switchTab(tabName, containerSelector = '.tab-section') {
  const sections = document.querySelectorAll(containerSelector);
  sections.forEach(section => {
    section.classList.add('hidden');
  });

  const activeSection = document.getElementById('tab-' + tabName);
  if (activeSection) {
    activeSection.classList.remove('hidden');
  }

  // Update button states
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    }
  });
}

function switchAdminTab(tabName) {
  const sections = document.querySelectorAll('.admin-section');
  sections.forEach(section => {
    section.classList.add('hidden');
  });

  const sectionMap = {
    pos: 'facturacion',
    facturacion: 'facturacion',
    pedidos: 'pedidos',
    stock: 'stock',
    clientes: 'clientes'
  };
  const normalizedTab = sectionMap[tabName] || tabName;
  const activeSection = document.getElementById('admin-' + normalizedTab);
  if (activeSection) {
    activeSection.classList.remove('hidden');
  }

  // Update button states
  const adminTabs = document.querySelectorAll('.admin-tab');
  adminTabs.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    }
  });
}

// Legacy compatibility for inline handlers in index.html
function showAdminTab(tabName, btn = null) {
  switchAdminTab(tabName);

  if (btn) {
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
  }
}

// CONFIRM DIALOG
function showConfirmDialog(message, onConfirm, onCancel) {
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
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
    z-index: 10001;
  `;

  dialog.innerHTML = `
    <p style="margin: 0 0 24px; color: var(--color-ink); font-size: 16px; font-weight: 600;">
      ${escapeHtml(message)}
    </p>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button class="btn btn-secondary" id="confirm-cancel">Cancelar</button>
      <button class="btn btn-danger" id="confirm-ok">Confirmar</button>
    </div>
  `;

  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);

  document.getElementById('confirm-ok').onclick = () => {
    backdrop.remove();
    if (onConfirm) onConfirm();
  };

  document.getElementById('confirm-cancel').onclick = () => {
    backdrop.remove();
    if (onCancel) onCancel();
  };

  backdrop.onclick = (e) => {
    if (e.target === backdrop) {
      backdrop.remove();
      if (onCancel) onCancel();
    }
  };
}

// FORM VALIDATION
function validateFormGroup(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return true;

  const value = element.value.trim();
  const type = element.getAttribute('type') || element.tagName.toLowerCase();
  const required = element.hasAttribute('required');

  if (required && !value) {
    showFormError(elementId, 'Este campo es requerido');
    return false;
  }

  if (type === 'email' && value && !validateEmail(value)) {
    showFormError(elementId, 'Email inválido');
    return false;
  }

  if (type === 'tel' && value && !validatePhone(value)) {
    showFormError(elementId, 'Teléfono inválido');
    return false;
  }

  clearFormError(elementId);
  return true;
}

function showFormError(elementId, message) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.classList.add('is-invalid');
  element.style.borderColor = 'var(--color-error)';

  let errorDiv = element.nextElementSibling;
  if (!errorDiv || !errorDiv.classList.contains('error-text')) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-text';
    element.parentNode.insertBefore(errorDiv, element.nextSibling);
  }
  errorDiv.textContent = message;
}

function clearFormError(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.classList.remove('is-invalid');
  element.style.borderColor = '';

  const errorDiv = element.nextElementSibling;
  if (errorDiv && errorDiv.classList.contains('error-text')) {
    errorDiv.remove();
  }
}

// LOADING STATE
function setLoading(elementId, isLoading) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (isLoading) {
    element.disabled = true;
    element.classList.add('opacity-50', 'cursor-not-allowed');
    element.dataset.originalText = element.textContent;
    element.innerHTML = '<span class="spin">⟳</span> Cargando...';
  } else {
    element.disabled = false;
    element.classList.remove('opacity-50', 'cursor-not-allowed');
    element.textContent = element.dataset.originalText || 'Guardar';
  }
}

// VISIBILITY TOGGLE
function toggleVisibility(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.classList.toggle('hidden');
}

function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.classList.remove('hidden');
}

function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.classList.add('hidden');
}

function isElementVisible(elementId) {
  const element = document.getElementById(elementId);
  return element && !element.classList.contains('hidden');
}

// CLASS MANAGEMENT
function addClass(elementId, className) {
  const element = document.getElementById(elementId);
  if (element) element.classList.add(className);
}

function removeClass(elementId, className) {
  const element = document.getElementById(elementId);
  if (element) element.classList.remove(className);
}

function toggleClass(elementId, className) {
  const element = document.getElementById(elementId);
  if (element) element.classList.toggle(className);
}

// TEXT CONTENT
function setText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = escapeHtml(text);
}

function getText(elementId) {
  const element = document.getElementById(elementId);
  return element ? element.textContent : '';
}

function setHTML(elementId, html) {
  const element = document.getElementById(elementId);
  if (element) element.innerHTML = html;
}

// EVENTS
function onElementChange(elementId, callback) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('change', callback);
  }
}

function onElementInput(elementId, callback) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('input', callback);
  }
}

function onElementClick(elementId, callback) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('click', callback);
  }
}

// SCROLL
function scrollToElement(elementId, smooth = true) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }
}

function scrollToTop(smooth = true) {
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
}
