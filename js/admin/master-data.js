/**
 * Master Data Management JavaScript
 */

let masterData = {
    buildings: [],
    flatTypes: [],
    chargeTypes: []
};
let settings = {};

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

    // Setup tab navigation
    setupTabs();

    // Load data
    await loadMasterData();

    // Setup form handlers
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
});

function setupTabs() {
    const tabs = document.querySelectorAll('.master-data-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked tab
            this.classList.add('active');

            // Hide all content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            // Show selected content
            document.getElementById('tab-' + this.dataset.tab).classList.add('active');
        });
    });
}

async function loadMasterData() {
    Utils.showLoading('Loading master data...');

    try {
        [masterData, settings] = await Promise.all([
            storage.getMasterData(),
            storage.getSettings()
        ]);

        // Populate settings form
        populateSettingsForm();

        // Render tables
        renderBuildingsTable();
        renderFlatTypesTable();
        renderChargeTypesTable();

    } catch (error) {
        console.error('Error loading master data:', error);
        Utils.showToast('Error loading data', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function populateSettingsForm() {
    const form = document.getElementById('settings-form');
    form.societyName.value = settings.societyName || '';
    form.registrationNo.value = settings.registrationNo || '';
    form.address.value = settings.address || '';
    form.phone.value = settings.phone || '';
    form.email.value = settings.email || '';
    form.billingDay.value = settings.billingDay || 1;
    form.dueDays.value = settings.dueDays || 15;
    form.lateFeePercent.value = settings.lateFeePercent || 2;
}

async function saveSettings(e) {
    e.preventDefault();

    const form = e.target;
    const newSettings = {
        ...settings,
        societyName: form.societyName.value.trim(),
        registrationNo: form.registrationNo.value.trim(),
        address: form.address.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        billingDay: parseInt(form.billingDay.value) || 1,
        dueDays: parseInt(form.dueDays.value) || 15,
        lateFeePercent: parseFloat(form.lateFeePercent.value) || 0
    };

    Utils.showLoading('Saving settings...');

    try {
        await storage.saveSettings(newSettings);
        settings = newSettings;
        Utils.showToast('Settings saved successfully', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        Utils.showToast('Error saving settings', 'error');
    } finally {
        Utils.hideLoading();
    }
}

// ==================== Buildings ====================

function renderBuildingsTable() {
    const tbody = document.getElementById('buildings-table-body');

    if (!masterData.buildings || masterData.buildings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No buildings added yet</td></tr>';
        return;
    }

    tbody.innerHTML = masterData.buildings.map(building => `
        <tr>
            <td><strong>${Utils.escapeHtml(building.name)}</strong></td>
            <td>${building.totalFloors || '-'}</td>
            <td>${Utils.escapeHtml(building.address || '-')}</td>
            <td>
                <span class="badge ${building.isActive !== false ? 'badge-success' : 'badge-secondary'}">
                    ${building.isActive !== false ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary" onclick="editBuilding('${building.id}')">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteBuilding('${building.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openBuildingModal(building = null) {
    const form = document.getElementById('building-form');
    form.reset();

    if (building) {
        document.getElementById('building-modal-title').textContent = 'Edit Building';
        form.id.value = building.id;
        form.name.value = building.name;
        form.totalFloors.value = building.totalFloors || '';
        form.address.value = building.address || '';
        form.isActive.checked = building.isActive !== false;
    } else {
        document.getElementById('building-modal-title').textContent = 'Add Building';
        form.id.value = '';
        form.isActive.checked = true;
    }

    Utils.openModal('building-modal');
}

function editBuilding(id) {
    const building = masterData.buildings.find(b => b.id === id);
    if (building) {
        openBuildingModal(building);
    }
}

async function saveBuilding() {
    const form = document.getElementById('building-form');
    const id = form.id.value;

    const building = {
        id: id || Utils.generateId(),
        name: form.name.value.trim(),
        totalFloors: parseInt(form.totalFloors.value) || 1,
        address: form.address.value.trim(),
        isActive: form.isActive.checked
    };

    if (!building.name) {
        Utils.showToast('Please enter building name', 'error');
        return;
    }

    Utils.showLoading('Saving...');

    try {
        if (id) {
            // Update existing
            const index = masterData.buildings.findIndex(b => b.id === id);
            if (index !== -1) {
                masterData.buildings[index] = building;
            }
        } else {
            // Add new
            masterData.buildings.push(building);
        }

        await storage.saveMasterData(masterData);
        renderBuildingsTable();
        closeModal('building-modal');
        Utils.showToast('Building saved successfully', 'success');
    } catch (error) {
        console.error('Error saving building:', error);
        Utils.showToast('Error saving building', 'error');
    } finally {
        Utils.hideLoading();
    }
}

async function deleteBuilding(id) {
    const confirmed = await Utils.showConfirm('Are you sure you want to delete this building?', 'Delete Building');
    if (!confirmed) return;

    Utils.showLoading('Deleting...');

    try {
        masterData.buildings = masterData.buildings.filter(b => b.id !== id);
        await storage.saveMasterData(masterData);
        renderBuildingsTable();
        Utils.showToast('Building deleted', 'success');
    } catch (error) {
        console.error('Error deleting building:', error);
        Utils.showToast('Error deleting building', 'error');
    } finally {
        Utils.hideLoading();
    }
}

// ==================== Flat Types ====================

function renderFlatTypesTable() {
    const tbody = document.getElementById('flatTypes-table-body');

    if (!masterData.flatTypes || masterData.flatTypes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No flat types added yet</td></tr>';
        return;
    }

    tbody.innerHTML = masterData.flatTypes.map(flatType => `
        <tr>
            <td><strong>${Utils.escapeHtml(flatType.name)}</strong></td>
            <td>${Utils.formatNumber(flatType.defaultArea || 0)}</td>
            <td>
                <span class="badge ${flatType.isActive !== false ? 'badge-success' : 'badge-secondary'}">
                    ${flatType.isActive !== false ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary" onclick="editFlatType('${flatType.id}')">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteFlatType('${flatType.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openFlatTypeModal(flatType = null) {
    const form = document.getElementById('flatType-form');
    form.reset();

    if (flatType) {
        document.getElementById('flatType-modal-title').textContent = 'Edit Flat Type';
        form.id.value = flatType.id;
        form.name.value = flatType.name;
        form.defaultArea.value = flatType.defaultArea || '';
        form.isActive.checked = flatType.isActive !== false;
    } else {
        document.getElementById('flatType-modal-title').textContent = 'Add Flat Type';
        form.id.value = '';
        form.isActive.checked = true;
    }

    Utils.openModal('flatType-modal');
}

function editFlatType(id) {
    const flatType = masterData.flatTypes.find(f => f.id === id);
    if (flatType) {
        openFlatTypeModal(flatType);
    }
}

async function saveFlatType() {
    const form = document.getElementById('flatType-form');
    const id = form.id.value;

    const flatType = {
        id: id || Utils.generateId(),
        name: form.name.value.trim(),
        defaultArea: parseInt(form.defaultArea.value) || 500,
        isActive: form.isActive.checked
    };

    if (!flatType.name) {
        Utils.showToast('Please enter flat type name', 'error');
        return;
    }

    Utils.showLoading('Saving...');

    try {
        if (id) {
            const index = masterData.flatTypes.findIndex(f => f.id === id);
            if (index !== -1) {
                masterData.flatTypes[index] = flatType;
            }
        } else {
            masterData.flatTypes.push(flatType);
        }

        await storage.saveMasterData(masterData);
        renderFlatTypesTable();
        closeModal('flatType-modal');
        Utils.showToast('Flat type saved successfully', 'success');
    } catch (error) {
        console.error('Error saving flat type:', error);
        Utils.showToast('Error saving flat type', 'error');
    } finally {
        Utils.hideLoading();
    }
}

async function deleteFlatType(id) {
    const confirmed = await Utils.showConfirm('Are you sure you want to delete this flat type?', 'Delete Flat Type');
    if (!confirmed) return;

    Utils.showLoading('Deleting...');

    try {
        masterData.flatTypes = masterData.flatTypes.filter(f => f.id !== id);
        await storage.saveMasterData(masterData);
        renderFlatTypesTable();
        Utils.showToast('Flat type deleted', 'success');
    } catch (error) {
        console.error('Error deleting flat type:', error);
        Utils.showToast('Error deleting flat type', 'error');
    } finally {
        Utils.hideLoading();
    }
}

// ==================== Charge Types ====================

function renderChargeTypesTable() {
    const tbody = document.getElementById('chargeTypes-table-body');

    if (!masterData.chargeTypes || masterData.chargeTypes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No charge types added yet</td></tr>';
        return;
    }

    tbody.innerHTML = masterData.chargeTypes.map(chargeType => {
        let calcTypeDisplay = 'Fixed Amount';
        let amountDisplay = Utils.formatCurrency(chargeType.defaultAmount);

        if (chargeType.calculationType === 'per_sqft') {
            calcTypeDisplay = 'Per Sq.Ft';
            amountDisplay = Utils.formatCurrency(chargeType.defaultAmount) + '/sq.ft';
        } else if (chargeType.calculationType === 'per_vehicle') {
            calcTypeDisplay = `Per Vehicle (${chargeType.vehicleType === '2wheeler' ? '2W' : '4W'})`;
            amountDisplay = Utils.formatCurrency(chargeType.defaultAmount) + '/vehicle';
        }

        return `
            <tr>
                <td><strong>${Utils.escapeHtml(chargeType.name)}</strong></td>
                <td>${calcTypeDisplay}</td>
                <td>${amountDisplay}</td>
                <td>${chargeType.isMonthly !== false ? 'Yes' : 'No'}</td>
                <td>
                    <span class="badge ${chargeType.isActive !== false ? 'badge-success' : 'badge-secondary'}">
                        ${chargeType.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="editChargeType('${chargeType.id}')">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteChargeType('${chargeType.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateCalculationType(calculationType) {
    const label = document.getElementById('amount-label');
    const vehicleTypeGroup = document.getElementById('vehicle-type-group');

    if (calculationType === 'per_sqft') {
        label.textContent = 'Rate per sq.ft (₹)';
        vehicleTypeGroup.style.display = 'none';
    } else if (calculationType === 'per_vehicle') {
        label.textContent = 'Rate per vehicle (₹)';
        vehicleTypeGroup.style.display = 'block';
    } else {
        label.textContent = 'Fixed Amount (₹)';
        vehicleTypeGroup.style.display = 'none';
    }
}

// Keep old function name for backward compatibility
function updateAmountLabel(calculationType) {
    updateCalculationType(calculationType);
}

function openChargeTypeModal(chargeType = null) {
    const form = document.getElementById('chargeType-form');
    form.reset();

    if (chargeType) {
        document.getElementById('chargeType-modal-title').textContent = 'Edit Charge Type';
        form.id.value = chargeType.id;
        form.name.value = chargeType.name;
        form.calculationType.value = chargeType.calculationType || 'fixed';
        form.defaultAmount.value = chargeType.defaultAmount || 0;
        form.isMonthly.checked = chargeType.isMonthly !== false;
        form.isActive.checked = chargeType.isActive !== false;
        if (chargeType.vehicleType) {
            form.vehicleType.value = chargeType.vehicleType;
        }
        updateCalculationType(chargeType.calculationType);
    } else {
        document.getElementById('chargeType-modal-title').textContent = 'Add Charge Type';
        form.id.value = '';
        form.isMonthly.checked = true;
        form.isActive.checked = true;
        updateCalculationType('per_sqft');
    }

    Utils.openModal('chargeType-modal');
}

function editChargeType(id) {
    const chargeType = masterData.chargeTypes.find(c => c.id === id);
    if (chargeType) {
        openChargeTypeModal(chargeType);
    }
}

async function saveChargeType() {
    const form = document.getElementById('chargeType-form');
    const id = form.id.value;

    const chargeType = {
        id: id || Utils.generateId(),
        name: form.name.value.trim(),
        calculationType: form.calculationType.value,
        defaultAmount: parseFloat(form.defaultAmount.value) || 0,
        isMonthly: form.isMonthly.checked,
        isActive: form.isActive.checked
    };

    // Add vehicleType if calculation type is per_vehicle
    if (chargeType.calculationType === 'per_vehicle') {
        chargeType.vehicleType = form.vehicleType.value;
    }

    if (!chargeType.name) {
        Utils.showToast('Please enter charge type name', 'error');
        return;
    }

    Utils.showLoading('Saving...');

    try {
        if (id) {
            const index = masterData.chargeTypes.findIndex(c => c.id === id);
            if (index !== -1) {
                masterData.chargeTypes[index] = chargeType;
            }
        } else {
            masterData.chargeTypes.push(chargeType);
        }

        await storage.saveMasterData(masterData);
        renderChargeTypesTable();
        closeModal('chargeType-modal');
        Utils.showToast('Charge type saved successfully', 'success');
    } catch (error) {
        console.error('Error saving charge type:', error);
        Utils.showToast('Error saving charge type', 'error');
    } finally {
        Utils.hideLoading();
    }
}

async function deleteChargeType(id) {
    const confirmed = await Utils.showConfirm('Are you sure you want to delete this charge type?', 'Delete Charge Type');
    if (!confirmed) return;

    Utils.showLoading('Deleting...');

    try {
        masterData.chargeTypes = masterData.chargeTypes.filter(c => c.id !== id);
        await storage.saveMasterData(masterData);
        renderChargeTypesTable();
        Utils.showToast('Charge type deleted', 'success');
    } catch (error) {
        console.error('Error deleting charge type:', error);
        Utils.showToast('Error deleting charge type', 'error');
    } finally {
        Utils.hideLoading();
    }
}

// ==================== Utility Functions ====================

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

// ==================== Export & Reset Functions ====================

/**
 * Export all master data to CSV files
 */
function exportAllToCSV() {
    try {
        // Export Buildings
        if (masterData.buildings && masterData.buildings.length > 0) {
            const buildingsCSV = convertToCSV(masterData.buildings, ['id', 'name', 'totalFloors', 'address', 'isActive']);
            downloadCSV(buildingsCSV, 'buildings.csv');
        }

        // Export Flat Types
        if (masterData.flatTypes && masterData.flatTypes.length > 0) {
            const flatTypesCSV = convertToCSV(masterData.flatTypes, ['id', 'name', 'defaultArea', 'isActive']);
            downloadCSV(flatTypesCSV, 'flat_types.csv');
        }

        // Export Charge Types
        if (masterData.chargeTypes && masterData.chargeTypes.length > 0) {
            const chargeTypesCSV = convertToCSV(masterData.chargeTypes, ['id', 'name', 'calculationType', 'vehicleType', 'defaultAmount', 'isMonthly', 'isActive']);
            downloadCSV(chargeTypesCSV, 'charge_types.csv');
        }

        // Export Settings
        const settingsData = [{
            societyName: settings.societyName,
            registrationNo: settings.registrationNo,
            address: settings.address,
            phone: settings.phone,
            email: settings.email,
            billingDay: settings.billingDay,
            dueDays: settings.dueDays,
            lateFeePercent: settings.lateFeePercent
        }];
        const settingsCSV = convertToCSV(settingsData, ['societyName', 'registrationNo', 'address', 'phone', 'email', 'billingDay', 'dueDays', 'lateFeePercent']);
        downloadCSV(settingsCSV, 'society_settings.csv');

        Utils.showToast('Master data exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        Utils.showToast('Error exporting data', 'error');
    }
}

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data, columns) {
    if (!data || data.length === 0) return '';

    // Header row
    const header = columns.join(',');

    // Data rows
    const rows = data.map(item => {
        return columns.map(col => {
            let value = item[col];
            if (value === undefined || value === null) {
                value = '';
            }
            // Escape quotes and wrap in quotes if contains comma or quotes
            value = String(value);
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        }).join(',');
    });

    return header + '\n' + rows.join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Reset master data to defaults (keeps society settings)
 */
async function resetToDefaults() {
    const confirmed = await Utils.showConfirm(
        'This will reset all master data (Buildings, Flat Types, Charge Types) to default values. Society settings will be preserved. This action cannot be undone. Continue?',
        'Reset to Defaults'
    );

    if (!confirmed) return;

    Utils.showLoading('Resetting to defaults...');

    try {
        // Reset to default master data from INITIAL_DATA
        masterData = {
            buildings: [],
            flatTypes: JSON.parse(JSON.stringify(INITIAL_DATA.masterData.flatTypes)),
            chargeTypes: JSON.parse(JSON.stringify(INITIAL_DATA.masterData.chargeTypes))
        };

        await storage.saveMasterData(masterData);

        // Re-render tables
        renderBuildingsTable();
        renderFlatTypesTable();
        renderChargeTypesTable();

        Utils.showToast('Master data reset to defaults successfully', 'success');
    } catch (error) {
        console.error('Error resetting data:', error);
        Utils.showToast('Error resetting data', 'error');
    } finally {
        Utils.hideLoading();
    }
}

// ==================== CSV Import Functions ====================

// Store parsed data for import
let importData = {
    flats: { rows: [], validRows: [], errors: [] },
    members: { rows: [], validRows: [], errors: [] },
    buildings: { rows: [], validRows: [], errors: [] }
};

// CSV Templates
const CSV_TEMPLATES = {
    flats: {
        headers: ['FlatNo', 'Building', 'FlatType', 'Area', 'OwnerName', 'OwnerPhone', 'OwnerEmail', 'TwoWheelers', 'FourWheelers', 'IsOccupied'],
        sample: ['A-101', 'Building A', '2 BHK', '750', 'John Doe', '9876543210', 'john@email.com', '1', '1', 'Yes'],
        required: ['FlatNo', 'Building', 'FlatType', 'OwnerName']
    },
    members: {
        headers: ['Username', 'Password', 'Name', 'Email', 'Phone', 'Role', 'LinkedFlat'],
        sample: ['john.doe', 'password123', 'John Doe', 'john@email.com', '9876543210', 'member', 'A-101'],
        required: ['Username', 'Password', 'Name']
    },
    buildings: {
        headers: ['Name', 'TotalFloors', 'Address'],
        sample: ['Building A', '10', 'Near Main Gate'],
        required: ['Name']
    }
};

/**
 * Download CSV template for import
 */
function downloadTemplate(type) {
    const template = CSV_TEMPLATES[type];
    if (!template) {
        Utils.showToast('Invalid template type', 'error');
        return;
    }

    // Create CSV content with headers and sample row
    let csvContent = template.headers.join(',') + '\n';
    csvContent += template.sample.join(',') + '\n';

    // Add a few more sample rows for flats template
    if (type === 'flats') {
        csvContent += 'A-102,Building A,1 BHK,450,Jane Smith,9876543211,jane@email.com,0,1,Yes\n';
        csvContent += 'B-101,Building B,3 BHK,1100,Bob Wilson,9876543212,bob@email.com,2,2,Yes\n';
    } else if (type === 'members') {
        csvContent += 'jane.smith,pass456,Jane Smith,jane@email.com,9876543211,member,A-102\n';
        csvContent += 'bob.wilson,pass789,Bob Wilson,bob@email.com,9876543212,member,B-101\n';
    } else if (type === 'buildings') {
        csvContent += 'Building B,12,East Wing\n';
        csvContent += 'Building C,8,West Wing\n';
    }

    downloadCSV(csvContent, `${type}_template.csv`);
    Utils.showToast('Template downloaded! Fill in your data and upload.', 'success');
}

/**
 * Handle CSV file upload
 */
function handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
        Utils.showToast('Please upload a CSV file', 'error');
        event.target.value = '';
        return;
    }

    Utils.showLoading('Parsing CSV file...');

    // Parse CSV using Papa Parse
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            Utils.hideLoading();
            processCSVData(results, type);
            event.target.value = ''; // Reset file input
        },
        error: function(error) {
            Utils.hideLoading();
            Utils.showToast('Error parsing CSV: ' + error.message, 'error');
            event.target.value = '';
        }
    });
}

/**
 * Process parsed CSV data
 */
function processCSVData(results, type) {
    const template = CSV_TEMPLATES[type];
    const rows = results.data;

    if (rows.length === 0) {
        Utils.showToast('No data found in the CSV file', 'error');
        return;
    }

    // Validate and process rows
    const validRows = [];
    const errors = [];

    rows.forEach((row, index) => {
        const validation = validateRow(row, type, index + 2); // +2 for header row and 1-based index

        if (validation.isValid) {
            validRows.push(validation.processedRow);
        } else {
            errors.push({
                row: index + 2,
                data: row,
                errors: validation.errors
            });
        }
    });

    // Store for import
    importData[type] = { rows, validRows, errors };

    // Show preview
    showImportPreview(type, rows, validRows, errors);
}

/**
 * Validate a row based on type
 */
function validateRow(row, type, rowNum) {
    const template = CSV_TEMPLATES[type];
    const errors = [];
    let processedRow = {};

    // Check required fields
    template.required.forEach(field => {
        const value = row[field];
        if (!value || value.trim() === '') {
            errors.push(`${field} is required`);
        }
    });

    // Type-specific validation
    if (type === 'flats') {
        processedRow = {
            flatNo: (row.FlatNo || '').trim(),
            buildingName: (row.Building || '').trim(),
            flatTypeName: (row.FlatType || '').trim(),
            area: parseInt(row.Area) || 500,
            ownerName: (row.OwnerName || '').trim(),
            ownerPhone: (row.OwnerPhone || '').trim(),
            ownerEmail: (row.OwnerEmail || '').trim(),
            twoWheelerCount: parseInt(row.TwoWheelers) || 0,
            fourWheelerCount: parseInt(row.FourWheelers) || 0,
            isOccupied: (row.IsOccupied || 'Yes').toLowerCase() !== 'no'
        };

        // Validate building exists
        if (processedRow.buildingName) {
            const building = masterData.buildings.find(b =>
                b.name.toLowerCase() === processedRow.buildingName.toLowerCase()
            );
            if (building) {
                processedRow.buildingId = building.id;
            } else {
                errors.push(`Building "${processedRow.buildingName}" not found. Please add it first.`);
            }
        }

        // Validate flat type exists
        if (processedRow.flatTypeName) {
            const flatType = masterData.flatTypes.find(f =>
                f.name.toLowerCase() === processedRow.flatTypeName.toLowerCase()
            );
            if (flatType) {
                processedRow.flatTypeId = flatType.id;
            } else {
                errors.push(`Flat type "${processedRow.flatTypeName}" not found. Please add it first.`);
            }
        }

        // Validate phone format
        if (processedRow.ownerPhone && !/^\d{10}$/.test(processedRow.ownerPhone.replace(/\D/g, ''))) {
            // Warning but not error - just clean it
            processedRow.ownerPhone = processedRow.ownerPhone.replace(/\D/g, '');
        }

    } else if (type === 'members') {
        processedRow = {
            username: (row.Username || '').trim().toLowerCase(),
            password: (row.Password || '').trim(),
            name: (row.Name || '').trim(),
            email: (row.Email || '').trim(),
            phone: (row.Phone || '').trim(),
            role: (row.Role || 'member').trim().toLowerCase(),
            flatNo: (row.LinkedFlat || '').trim()
        };

        // Validate username
        if (processedRow.username && processedRow.username.length < 3) {
            errors.push('Username must be at least 3 characters');
        }

        // Validate password
        if (processedRow.password && processedRow.password.length < 4) {
            errors.push('Password must be at least 4 characters');
        }

        // Validate role
        if (!['admin', 'member'].includes(processedRow.role)) {
            processedRow.role = 'member';
        }

    } else if (type === 'buildings') {
        processedRow = {
            name: (row.Name || '').trim(),
            totalFloors: parseInt(row.TotalFloors) || 1,
            address: (row.Address || '').trim()
        };

        // Check for duplicate building name
        const existing = masterData.buildings.find(b =>
            b.name.toLowerCase() === processedRow.name.toLowerCase()
        );
        if (existing) {
            errors.push(`Building "${processedRow.name}" already exists`);
        }
    }

    return {
        isValid: errors.length === 0,
        processedRow,
        errors
    };
}

/**
 * Show import preview
 */
function showImportPreview(type, rows, validRows, errors) {
    const previewContainer = document.getElementById(`${type}-preview`);
    const headerRow = document.getElementById(`${type}-preview-header`);
    const bodyRows = document.getElementById(`${type}-preview-body`);
    const validCount = document.getElementById(`${type}-valid-count`);
    const errorCount = document.getElementById(`${type}-error-count`);

    // Update counts
    validCount.textContent = `${validRows.length} valid`;
    errorCount.textContent = `${errors.length} errors`;

    // Get headers from template
    const headers = CSV_TEMPLATES[type].headers;

    // Render header
    headerRow.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '<th>Status</th></tr>';

    // Render body rows
    let bodyHtml = '';
    rows.forEach((row, index) => {
        const error = errors.find(e => e.row === index + 2);
        const isError = !!error;

        bodyHtml += `<tr class="${isError ? 'row-error' : ''}">`;
        headers.forEach(h => {
            bodyHtml += `<td>${Utils.escapeHtml(row[h] || '')}</td>`;
        });
        bodyHtml += `<td>${isError ? '<span title="' + Utils.escapeHtml(error.errors.join(', ')) + '">Error</span>' : 'OK'}</td>`;
        bodyHtml += '</tr>';
    });

    bodyRows.innerHTML = bodyHtml;

    // Show preview
    previewContainer.classList.add('show');

    // Disable import button if no valid rows
    const importBtn = document.getElementById(`${type}-import-btn`);
    importBtn.disabled = validRows.length === 0;
}

/**
 * Cancel import
 */
function cancelImport(type) {
    const previewContainer = document.getElementById(`${type}-preview`);
    previewContainer.classList.remove('show');
    importData[type] = { rows: [], validRows: [], errors: [] };
}

/**
 * Confirm and execute import
 */
async function confirmImport(type) {
    const data = importData[type];
    if (!data || data.validRows.length === 0) {
        Utils.showToast('No valid rows to import', 'error');
        return;
    }

    const confirmed = await Utils.showConfirm(
        `This will import ${data.validRows.length} ${type}. Continue?`,
        'Confirm Import'
    );

    if (!confirmed) return;

    Utils.showLoading(`Importing ${data.validRows.length} ${type}...`);

    try {
        if (type === 'flats') {
            await importFlats(data.validRows);
        } else if (type === 'members') {
            await importMembers(data.validRows);
        } else if (type === 'buildings') {
            await importBuildings(data.validRows);
        }

        Utils.showToast(`Successfully imported ${data.validRows.length} ${type}!`, 'success');
        cancelImport(type);

    } catch (error) {
        console.error('Import error:', error);
        Utils.showToast('Error during import: ' + error.message, 'error');
    } finally {
        Utils.hideLoading();
    }
}

/**
 * Import flats
 */
async function importFlats(rows) {
    // Get existing flats
    let flats = await storage.getFlats() || [];

    // Add new flats
    rows.forEach(row => {
        // Check if flat already exists
        const existingIndex = flats.findIndex(f =>
            f.flatNo.toLowerCase() === row.flatNo.toLowerCase() &&
            f.buildingId === row.buildingId
        );

        const flatData = {
            id: existingIndex !== -1 ? flats[existingIndex].id : Utils.generateId(),
            flatNo: row.flatNo,
            buildingId: row.buildingId,
            flatTypeId: row.flatTypeId,
            area: row.area,
            ownerName: row.ownerName,
            ownerPhone: row.ownerPhone,
            ownerEmail: row.ownerEmail,
            twoWheelerCount: row.twoWheelerCount,
            fourWheelerCount: row.fourWheelerCount,
            isOccupied: row.isOccupied,
            isActive: true,
            createdAt: existingIndex !== -1 ? flats[existingIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingIndex !== -1) {
            flats[existingIndex] = flatData;
        } else {
            flats.push(flatData);
        }
    });

    // Save all flats
    await storage.saveFlats(flats);
}

/**
 * Import members
 */
async function importMembers(rows) {
    // Get existing users and flats
    let users = await storage.getUsers() || [];
    const flats = await storage.getFlats() || [];

    // Add new members
    for (const row of rows) {
        // Check if username already exists
        const existingIndex = users.findIndex(u =>
            u.username.toLowerCase() === row.username.toLowerCase()
        );

        // Find linked flat
        let flatId = null;
        if (row.flatNo) {
            const flat = flats.find(f => f.flatNo.toLowerCase() === row.flatNo.toLowerCase());
            if (flat) {
                flatId = flat.id;
            }
        }

        const userData = {
            id: existingIndex !== -1 ? users[existingIndex].id : Utils.generateId(),
            username: row.username,
            password: existingIndex !== -1 && !row.password ? users[existingIndex].password : row.password, // Keep existing password if not provided
            name: row.name,
            email: row.email,
            phone: row.phone,
            role: row.role,
            flatId: flatId,
            isActive: true,
            createdAt: existingIndex !== -1 ? users[existingIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingIndex !== -1) {
            users[existingIndex] = userData;
        } else {
            users.push(userData);
        }
    }

    // Save all users
    await storage.saveUsers(users);
}

/**
 * Import buildings
 */
async function importBuildings(rows) {
    // Add new buildings to master data
    rows.forEach(row => {
        masterData.buildings.push({
            id: Utils.generateId(),
            name: row.name,
            totalFloors: row.totalFloors,
            address: row.address,
            isActive: true
        });
    });

    // Save master data
    await storage.saveMasterData(masterData);

    // Re-render buildings table
    renderBuildingsTable();
}
