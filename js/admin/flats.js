/**
 * Flats Management JavaScript
 */

let flatsData = [];
let masterData = {};
let filteredFlats = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!auth.requireAuth('admin')) {
        return;
    }

    // Update user info in sidebar
    const user = auth.getCurrentUser();
    if (user) {
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-avatar').textContent = Utils.getInitials(user.name);
    }

    // Display society name
    const societyName = auth.getSocietyName();
    if (societyName) {
        document.getElementById('society-name').textContent = societyName;
    }

    // Load data
    await loadData();

    // Check for action parameter
    const params = Utils.getUrlParams();
    if (params.action === 'add') {
        openFlatModal();
    }
});

async function loadData() {
    Utils.showLoading('Loading flats...');

    try {
        [flatsData, masterData] = await Promise.all([
            storage.getFlats(),
            storage.getMasterData()
        ]);

        // Populate filter dropdowns
        populateFilters();

        // Populate modal dropdowns
        populateModalDropdowns();

        // Render table
        filterFlats();

    } catch (error) {
        console.error('Error loading data:', error);
        Utils.showToast('Error loading data', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function populateFilters() {
    // Buildings filter
    const buildingFilter = document.getElementById('filter-building');
    buildingFilter.innerHTML = '<option value="">All Buildings</option>' +
        (masterData.buildings || [])
            .filter(b => b.isActive !== false)
            .map(b => `<option value="${b.id}">${Utils.escapeHtml(b.name)}</option>`)
            .join('');

    // Flat types filter
    const typeFilter = document.getElementById('filter-type');
    typeFilter.innerHTML = '<option value="">All Types</option>' +
        (masterData.flatTypes || [])
            .filter(t => t.isActive !== false)
            .map(t => `<option value="${t.id}">${Utils.escapeHtml(t.name)}</option>`)
            .join('');
}

function populateModalDropdowns() {
    // Buildings dropdown in modal
    const buildingSelect = document.getElementById('flat-building-select');
    buildingSelect.innerHTML = '<option value="">Select Building</option>' +
        (masterData.buildings || [])
            .filter(b => b.isActive !== false)
            .map(b => `<option value="${b.id}">${Utils.escapeHtml(b.name)}</option>`)
            .join('');

    // Flat types dropdown in modal
    const typeSelect = document.getElementById('flat-type-select');
    typeSelect.innerHTML = '<option value="">Select Type</option>' +
        (masterData.flatTypes || [])
            .filter(t => t.isActive !== false)
            .map(t => `<option value="${t.id}" data-area="${t.defaultArea}">${Utils.escapeHtml(t.name)}</option>`)
            .join('');
}

function filterFlats() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const buildingFilter = document.getElementById('filter-building').value;
    const typeFilter = document.getElementById('filter-type').value;

    filteredFlats = flatsData.filter(flat => {
        // Search filter
        const matchesSearch = !searchTerm ||
            flat.flatNo.toLowerCase().includes(searchTerm) ||
            (flat.ownerName && flat.ownerName.toLowerCase().includes(searchTerm)) ||
            (flat.ownerPhone && flat.ownerPhone.includes(searchTerm));

        // Building filter
        const matchesBuilding = !buildingFilter || flat.buildingId === buildingFilter;

        // Type filter
        const matchesType = !typeFilter || flat.flatTypeId === typeFilter;

        return matchesSearch && matchesBuilding && matchesType;
    });

    renderFlatsTable();
}

function renderFlatsTable() {
    const tbody = document.getElementById('flats-table-body');

    if (filteredFlats.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted" style="padding: 2rem;">
                    ${flatsData.length === 0 ? 'No flats added yet. Click "Add Flat" to get started.' : 'No flats match your search criteria.'}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredFlats.map(flat => {
        const building = (masterData.buildings || []).find(b => b.id === flat.buildingId);
        const flatType = (masterData.flatTypes || []).find(t => t.id === flat.flatTypeId);

        return `
            <tr>
                <td><strong>${Utils.escapeHtml(flat.flatNo)}</strong></td>
                <td>${building ? Utils.escapeHtml(building.name) : '-'}</td>
                <td>${flatType ? Utils.escapeHtml(flatType.name) : '-'}</td>
                <td>${Utils.formatNumber(flat.area)}</td>
                <td>${Utils.escapeHtml(flat.ownerName || '-')}</td>
                <td>${flat.ownerPhone || '-'}</td>
                <td>
                    <span class="badge ${flat.isActive !== false ? 'badge-success' : 'badge-secondary'}">
                        ${flat.isActive !== false ? (flat.isOccupied ? 'Occupied' : 'Vacant') : 'Inactive'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="editFlat('${flat.id}')">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteFlat('${flat.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateAreaFromType() {
    const typeSelect = document.getElementById('flat-type-select');
    const areaInput = document.querySelector('#flat-form [name="area"]');
    const selectedOption = typeSelect.options[typeSelect.selectedIndex];

    if (selectedOption && selectedOption.dataset.area && !areaInput.value) {
        areaInput.value = selectedOption.dataset.area;
    }
}

function openFlatModal(flat = null) {
    const form = document.getElementById('flat-form');
    form.reset();

    if (flat) {
        document.getElementById('flat-modal-title').textContent = 'Edit Flat';
        form.id.value = flat.id;
        form.flatNo.value = flat.flatNo;
        form.buildingId.value = flat.buildingId || '';
        form.flatTypeId.value = flat.flatTypeId || '';
        form.area.value = flat.area || '';
        form.ownerName.value = flat.ownerName || '';
        form.ownerPhone.value = flat.ownerPhone || '';
        form.ownerEmail.value = flat.ownerEmail || '';
        form.twoWheelerCount.value = flat.twoWheelerCount || 0;
        form.fourWheelerCount.value = flat.fourWheelerCount || 0;
        form.isOccupied.checked = flat.isOccupied !== false;
        form.isActive.checked = flat.isActive !== false;
    } else {
        document.getElementById('flat-modal-title').textContent = 'Add Flat';
        form.id.value = '';
        form.twoWheelerCount.value = 0;
        form.fourWheelerCount.value = 0;
        form.isOccupied.checked = true;
        form.isActive.checked = true;
    }

    Utils.openModal('flat-modal');
}

function editFlat(id) {
    const flat = flatsData.find(f => f.id === id);
    if (flat) {
        openFlatModal(flat);
    }
}

async function saveFlat() {
    const form = document.getElementById('flat-form');
    const id = form.id.value;

    // Validate
    if (!form.flatNo.value.trim()) {
        Utils.showToast('Please enter flat number', 'error');
        return;
    }
    if (!form.buildingId.value) {
        Utils.showToast('Please select a building', 'error');
        return;
    }
    if (!form.flatTypeId.value) {
        Utils.showToast('Please select flat type', 'error');
        return;
    }
    if (!form.area.value || form.area.value <= 0) {
        Utils.showToast('Please enter valid area', 'error');
        return;
    }
    if (!form.ownerName.value.trim()) {
        Utils.showToast('Please enter owner name', 'error');
        return;
    }

    const flat = {
        id: id || Utils.generateId(),
        flatNo: form.flatNo.value.trim(),
        buildingId: form.buildingId.value,
        flatTypeId: form.flatTypeId.value,
        area: parseInt(form.area.value),
        ownerName: form.ownerName.value.trim(),
        ownerPhone: form.ownerPhone.value.trim(),
        ownerEmail: form.ownerEmail.value.trim(),
        twoWheelerCount: parseInt(form.twoWheelerCount.value) || 0,
        fourWheelerCount: parseInt(form.fourWheelerCount.value) || 0,
        isOccupied: form.isOccupied.checked,
        isActive: form.isActive.checked,
        createdAt: id ? undefined : new Date().toISOString()
    };

    // Check for duplicate flat number in same building
    const duplicate = flatsData.find(f =>
        f.id !== flat.id &&
        f.flatNo.toLowerCase() === flat.flatNo.toLowerCase() &&
        f.buildingId === flat.buildingId
    );

    if (duplicate) {
        Utils.showToast('A flat with this number already exists in this building', 'error');
        return;
    }

    Utils.showLoading('Saving...');

    try {
        if (id) {
            // Update existing
            const index = flatsData.findIndex(f => f.id === id);
            if (index !== -1) {
                flat.createdAt = flatsData[index].createdAt;
                flatsData[index] = flat;
            }
        } else {
            // Add new
            flatsData.push(flat);
        }

        await storage.saveFlats(flatsData);
        filterFlats();
        closeModal('flat-modal');
        Utils.showToast('Flat saved successfully', 'success');
    } catch (error) {
        console.error('Error saving flat:', error);
        Utils.showToast('Error saving flat', 'error');
    } finally {
        Utils.hideLoading();
    }
}

async function deleteFlat(id) {
    const flat = flatsData.find(f => f.id === id);
    if (!flat) return;

    const confirmed = await Utils.showConfirm(
        `Are you sure you want to delete flat "${flat.flatNo}"? This action cannot be undone.`,
        'Delete Flat'
    );

    if (!confirmed) return;

    Utils.showLoading('Deleting...');

    try {
        flatsData = flatsData.filter(f => f.id !== id);
        await storage.saveFlats(flatsData);
        filterFlats();
        Utils.showToast('Flat deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting flat:', error);
        Utils.showToast('Error deleting flat', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function closeModal(modalId) {
    Utils.closeModal(modalId);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

function handleLogout() {
    auth.logout();
    window.location.href = '../index.html';
}
