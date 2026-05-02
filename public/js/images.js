/* ============================================================
   IMAGE UPLOAD & PICKER MANAGEMENT
   ============================================================ */

let _imagePickerTargetFieldId = null;

// ===== UPLOAD & FILE HANDLING =====

async function uploadImageFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Por favor selecciona un archivo de imagen', 'error');
    return null;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const saved = await response.json();
    STATE.uploadedImages.unshift(saved);
    persistData();
    return saved;
  } catch (err) {
    showToast('Error al subir imagen: ' + err.message, 'error');
    return null;
  }
}

async function handleImageUploadAndPick(file, targetFieldId) {
  const uploaded = await uploadImageFile(file);
  if (uploaded) {
    openImagePickerFor(targetFieldId, uploaded.id);
  }
}

// ===== IMAGE FIELD WIDGET =====

function updateImagePreview(fieldId) {
  const field = document.getElementById(fieldId);
  const preview = document.getElementById(fieldId + '-preview');
  if (!field || !preview) return;

  const url = field.value.trim();
  if (url) {
    preview.src = url;
    preview.classList.remove('hidden');
  } else {
    preview.classList.add('hidden');
  }
}

function handleImageFieldDrop(event, fieldId) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    handleImageUploadAndPick(files[0], fieldId);
  }
}

function handleImageFieldFileInput(event, fieldId) {
  const files = event.target.files;
  if (files.length > 0) {
    handleImageUploadAndPick(files[0], fieldId);
  }
}

// ===== GLOBAL PASTE HANDLER =====

function setupPasteHandler() {
  document.addEventListener('paste', async (event) => {
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) return;

    let imageFile = null;
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        imageFile = item.getAsFile();
        break;
      }
    }

    if (!imageFile) return;

    const adminModalOverlay = document.getElementById('admin-modal-overlay');
    const isAdminModalOpen = adminModalOverlay && !adminModalOverlay.classList.contains('hidden');

    const slidesForm = document.getElementById('slides-form');
    const isSlideFormVisible = slidesForm && slidesForm.closest('.hidden') === null;

    if (isAdminModalOpen) {
      event.preventDefault();
      handleImageUploadAndPick(imageFile, 'edit-p-img');
    } else if (isSlideFormVisible) {
      event.preventDefault();
      handleImageUploadAndPick(imageFile, 'slide-image-url');
    }
  });
}

// ===== IMAGE PICKER MODAL =====

function openImagePickerFor(fieldId, highlightId = null) {
  _imagePickerTargetFieldId = fieldId;
  renderImagePickerGrid(highlightId);
  openModal('image-picker-modal');
}

function closeImagePicker() {
  _imagePickerTargetFieldId = null;
  closeModal('image-picker-modal');
}

function selectImageFromPicker(url) {
  if (!_imagePickerTargetFieldId) return;

  const field = document.getElementById(_imagePickerTargetFieldId);
  if (field) {
    field.value = url;
    updateImagePreview(_imagePickerTargetFieldId);
  }

  closeImagePicker();
}

function renderImagePickerGrid(highlightId = null) {
  const grid = document.getElementById('image-picker-grid');
  const emptyMsg = document.getElementById('image-picker-empty');

  if (!grid || !emptyMsg) return;

  if (!STATE.uploadedImages.length) {
    grid.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    return;
  }

  emptyMsg.classList.add('hidden');

  grid.innerHTML = STATE.uploadedImages.map(img => {
    const isHighlighted = highlightId && img.id === highlightId;
    return `
      <div class="cursor-pointer group relative overflow-hidden rounded-lg border-2 ${isHighlighted ? 'border-brand bg-brand-pale' : 'border-gray-200 hover:border-brand'} transition"
           onclick="selectImageFromPicker('${escapeHtml(img.url)}')">
        <img src="${escapeHtml(img.url)}" alt="" class="w-full aspect-square object-cover group-hover:scale-110 transition-transform">
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <span class="text-white font-semibold text-sm">Seleccionar</span>
        </div>
      </div>
    `;
  }).join('');
}

async function handlePickerDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const uploaded = await uploadImageFile(files[0]);
    if (uploaded) {
      renderImagePickerGrid(uploaded.id);
    }
  }
}

function handlePickerFileInput(event) {
  const files = event.target.files;
  if (files.length > 0) {
    uploadImageFile(files[0]).then(uploaded => {
      if (uploaded) {
        renderImagePickerGrid(uploaded.id);
        event.target.value = '';
      }
    });
  }
}

// ===== IMAGES SECTION IN SETTINGS =====

function renderImagesSection() {
  const grid = document.getElementById('images-grid');
  const emptyMsg = document.getElementById('images-empty');

  if (!grid || !emptyMsg) return;

  if (!STATE.uploadedImages.length) {
    grid.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    return;
  }

  emptyMsg.classList.add('hidden');

  grid.innerHTML = STATE.uploadedImages.map(img => `
    <div class="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 group">
      <img src="${escapeHtml(img.url)}" alt="" class="w-full aspect-square object-cover group-hover:opacity-80 transition">
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <button onclick="deleteImage(${img.id})" class="bg-red-500 hover:bg-red-600 text-white font-semibold text-xs px-2 py-1 rounded transition">
          Eliminar
        </button>
      </div>
    </div>
  `).join('');
}

async function deleteImage(id) {
  const img = STATE.uploadedImages.find(i => i.id === id);
  if (!img) return;

  showConfirmDialog(`¿Eliminar la imagen "${img.original_name}"?`, async () => {
    try {
      await apiFetch(`/api/images/${id}`, { method: 'DELETE' });
      STATE.uploadedImages = STATE.uploadedImages.filter(i => i.id !== id);
      persistData();
      renderImagesSection();
      showToast('Imagen eliminada', 'success');
    } catch (err) {
      showToast('Error al eliminar la imagen: ' + err.message, 'error');
    }
  });
}

function handleImagesDropzoneDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    uploadImageFile(files[0]).then(uploaded => {
      if (uploaded) {
        renderImagesSection();
      }
    });
  }
}

function initImagesSection() {
  const dropzone = document.getElementById('images-dropzone');
  const fileInput = document.getElementById('images-file-input');

  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput?.click());
  }

  if (fileInput) {
    fileInput.addEventListener('change', (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        uploadImageFile(files[0]).then(uploaded => {
          if (uploaded) {
            renderImagesSection();
            fileInput.value = '';
          }
        });
      }
    });
  }

  renderImagesSection();
}
