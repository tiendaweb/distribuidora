/* ============================================================
   CLIENTS MANAGEMENT WITH MAP
   ============================================================ */

let map = null;
let clientMarkers = {};
let missingGeocodeClients = [];
let geocodeToastShown = false;

function initClientsTab() {
  initMap();
  renderClientsTable();
  resetClientForm();

  if (map) {
    setTimeout(() => map.invalidateSize(), 120);
  }
}

function initMap() {
  if (map) return;

  const mapContainer = document.getElementById('clients-map');
  if (!mapContainer) return;

  // Initialize map
  map = L.map('clients-map').setView(
    [CONFIG.MAP.DEFAULT_LAT, CONFIG.MAP.DEFAULT_LNG],
    CONFIG.MAP.DEFAULT_ZOOM
  );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Load client markers
  loadClientMarkers();
}

async function loadClientMarkers() {
  if (!map) return;

  // Clear existing markers
  Object.values(clientMarkers).forEach(marker => marker.remove());
  clientMarkers = {};
  missingGeocodeClients = [];

  // Add markers for all clients
  for (const client of STATE.clients) {
    if (!client.address || client.id === 'c1') continue;

    const coords = await geocodeAddress(client.address);
    if (!coords) {
      missingGeocodeClients.push(client);
      continue;
    }

    const marker = L.marker([coords.lat, coords.lng]).addTo(map)
      .bindPopup(`
        <div style="font-size: 12px;">
          <p style="margin: 0; font-weight: bold;">${escapeHtml(client.name)}</p>
          <p style="margin: 4px 0 0; color: #666; font-size: 11px;">${escapeHtml(client.address)}</p>
          <p style="margin: 4px 0 0; color: #666; font-size: 11px;">${client.phone || '—'}</p>
          <button onclick="editClientForm('${client.id}')" style="margin-top: 6px; padding: 4px 8px; font-size: 11px; background: var(--color-brand); border: none; border-radius: 3px; cursor: pointer;">Editar</button>
        </div>
      `, { maxWidth: 250 });

    clientMarkers[client.id] = marker;
  }

  renderPendingGeocodeList();

  if (missingGeocodeClients.length > 0 && !geocodeToastShown) {
    showToast(
      `${missingGeocodeClients.length} dirección(es) no se pudieron ubicar en el mapa`,
      'warning'
    );
    geocodeToastShown = true;
  }

  if (missingGeocodeClients.length === 0) {
    geocodeToastShown = false;
  }
}

function renderPendingGeocodeList() {
  const panel = document.getElementById('clients-geocode-pending');
  const list = document.getElementById('clients-geocode-pending-list');
  if (!panel || !list) return;

  if (!missingGeocodeClients.length) {
    panel.classList.add('hidden');
    list.innerHTML = '';
    return;
  }

  panel.classList.remove('hidden');
  list.innerHTML = missingGeocodeClients.map(client => `
    <li>
      <strong>${escapeHtml(client.name)}</strong>:
      <span>${escapeHtml(client.address || 'Sin dirección')}</span>
    </li>
  `).join('');
}

function centerMapToClient(clientId) {
  const client = STATE.clients.find(c => c.id === clientId);
  if (!client || !map) return;

  const marker = clientMarkers[clientId];
  if (marker) {
    map.setView(marker.getLatLng(), 15);
    marker.openPopup();
  } else if (client.address) {
    geocodeAddress(client.address).then(coords => {
      if (coords) {
        map.setView([coords.lat, coords.lng], 15);
      }
    });
  }
}

function selectClientOnMap(clientId) {
  document.querySelectorAll('#admin-clients-tbody tr').forEach(tr => {
    tr.classList.remove('selected');
  });

  const row = document.querySelector(`tr[data-client-id="${clientId}"]`);
  if (row) row.classList.add('selected');

  centerMapToClient(clientId);
  editClientForm(clientId);
}

function openNewClientForm() {
  resetClientForm();
  switchAdminTab('clientes');
}

function deleteClientWithConfirm(clientId) {
  if (clientId === 'c1') {
    showToast('No se puede eliminar el cliente por defecto', 'error');
    return;
  }

  const client = STATE.clients.find(c => c.id === clientId);
  showConfirmDialog(
    `¿Eliminar el cliente "${client?.name}"?`,
    () => deleteClient(clientId)
  );
}
