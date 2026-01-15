/**
 * Billing Management JavaScript
 */

let billsData = [];
let flatsData = [];
let masterData = {};
let paymentsData = [];
let settings = {};
let filteredBills = [];
let currentViewBill = null;

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

    // Setup year dropdowns
    setupYearDropdowns();

    // Set current month/year for generation
    const now = new Date();
    document.getElementById('generate-month').value = now.getMonth() + 1;
    document.getElementById('generate-year').value = now.getFullYear();

    // Load data
    await loadData();

    // Check for action parameter
    const params = Utils.getUrlParams();
    if (params.action === 'generate') {
        // Scroll to generate section
        document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
    }
});

function setupYearDropdowns() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
        years.push(y);
    }

    const generateYearSelect = document.getElementById('generate-year');
    const filterYearSelect = document.getElementById('filter-year');

    generateYearSelect.innerHTML = years.map(y =>
        `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`
    ).join('');

    filterYearSelect.innerHTML = '<option value="">All Years</option>' +
        years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join('');

    // Setup month filter
    const filterMonthSelect = document.getElementById('filter-month');
    filterMonthSelect.innerHTML = '<option value="">All Months</option>' +
        Array.from({ length: 12 }, (_, i) =>
            `<option value="${i + 1}">${Utils.getMonthName(i + 1)}</option>`
        ).join('');
}

async function loadData() {
    Utils.showLoading('Loading billing data...');

    try {
        [billsData, flatsData, masterData, paymentsData, settings] = await Promise.all([
            storage.getBills(),
            storage.getFlats(),
            storage.getMasterData(),
            storage.getPayments(),
            storage.getSettings()
        ]);

        // Populate flat dropdowns
        populateFlatDropdowns();

        // Render table
        filterBills();

    } catch (error) {
        console.error('Error loading data:', error);
        Utils.showToast('Error loading data', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function populateFlatDropdowns() {
    const generateFlatSelect = document.getElementById('generate-flat');
    const filterFlatSelect = document.getElementById('filter-flat');

    const flatOptions = '<option value="">All Flats</option>' +
        flatsData
            .filter(f => f.isActive !== false)
            .map(f => `<option value="${f.id}">${Utils.escapeHtml(f.flatNo)}</option>`)
            .join('');

    generateFlatSelect.innerHTML = flatOptions;
    filterFlatSelect.innerHTML = flatOptions;
}

function filterBills() {
    const monthFilter = document.getElementById('filter-month').value;
    const yearFilter = document.getElementById('filter-year').value;
    const flatFilter = document.getElementById('filter-flat').value;
    const statusFilter = document.getElementById('filter-status').value;

    filteredBills = billsData.filter(bill => {
        const matchesMonth = !monthFilter || bill.month === parseInt(monthFilter);
        const matchesYear = !yearFilter || bill.year === parseInt(yearFilter);
        const matchesFlat = !flatFilter || bill.flatId === flatFilter;
        const matchesStatus = !statusFilter || bill.status === statusFilter;

        return matchesMonth && matchesYear && matchesFlat && matchesStatus;
    });

    // Sort by date descending
    filteredBills.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        if (a.month !== b.month) return b.month - a.month;
        return new Date(b.generatedAt) - new Date(a.generatedAt);
    });

    renderBillsTable();
}

function renderBillsTable() {
    const tbody = document.getElementById('bills-table-body');

    if (filteredBills.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted" style="padding: 2rem;">
                    ${billsData.length === 0 ? 'No bills generated yet. Use the form above to generate bills.' : 'No bills match your filter criteria.'}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredBills.map(bill => {
        const flat = flatsData.find(f => f.id === bill.flatId);
        const balance = bill.grandTotal - (bill.paidAmount || 0);
        const isOverdue = bill.status !== 'paid' && Utils.isOverdue(bill.dueDate);

        return `
            <tr>
                <td><strong>${bill.billNo}</strong></td>
                <td>${flat ? Utils.escapeHtml(flat.flatNo) : '-'}</td>
                <td>${Utils.getMonthName(bill.month, true)} ${bill.year}</td>
                <td class="amount">${Utils.formatCurrency(bill.grandTotal)}</td>
                <td class="amount text-success">${Utils.formatCurrency(bill.paidAmount || 0)}</td>
                <td class="amount ${balance > 0 ? 'text-danger' : ''}">${Utils.formatCurrency(balance)}</td>
                <td>
                    ${Utils.formatDate(bill.dueDate)}
                    ${isOverdue ? '<span class="badge badge-danger ml-1">Overdue</span>' : ''}
                </td>
                <td>
                    <span class="badge ${Utils.getBillStatusClass(bill.status)}">
                        ${bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewBill('${bill.id}')">View</button>
                    ${bill.status !== 'paid' ? `<button class="btn btn-sm btn-outline-success" onclick="recordPayment('${bill.id}')">Pay</button>` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteBill('${bill.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function generateBills() {
    const month = parseInt(document.getElementById('generate-month').value);
    const year = parseInt(document.getElementById('generate-year').value);
    const flatId = document.getElementById('generate-flat').value;

    // Get flats to generate bills for
    let flatsToProcess = flatsData.filter(f => f.isActive !== false);
    if (flatId) {
        flatsToProcess = flatsToProcess.filter(f => f.id === flatId);
    }

    if (flatsToProcess.length === 0) {
        Utils.showToast('No active flats to generate bills for', 'warning');
        return;
    }

    // Check for existing bills
    const existingBills = billsData.filter(b =>
        b.month === month &&
        b.year === year &&
        flatsToProcess.some(f => f.id === b.flatId)
    );

    if (existingBills.length > 0) {
        const confirmed = await Utils.showConfirm(
            `${existingBills.length} bill(s) already exist for this period. Do you want to skip these and generate for remaining flats?`,
            'Bills Already Exist'
        );
        if (!confirmed) return;

        // Remove flats that already have bills
        const existingFlatIds = existingBills.map(b => b.flatId);
        flatsToProcess = flatsToProcess.filter(f => !existingFlatIds.includes(f.id));
    }

    if (flatsToProcess.length === 0) {
        Utils.showToast('All selected flats already have bills for this period', 'info');
        return;
    }

    Utils.showLoading(`Generating ${flatsToProcess.length} bill(s)...`);

    try {
        const chargeTypes = (masterData.chargeTypes || []).filter(c => c.isActive !== false && c.isMonthly !== false);
        const billDate = new Date(year, month - 1, settings.billingDay || 1);
        const dueDate = Utils.calculateDueDate(billDate, settings.dueDays || 15);

        // Get current bill count for numbering
        let billCount = billsData.filter(b => b.year === year && b.month === month).length;

        const newBills = [];

        for (const flat of flatsToProcess) {
            billCount++;
            const lineItems = [];
            let totalAmount = 0;

            // Calculate charges
            for (const chargeType of chargeTypes) {
                let amount = 0;
                let description = chargeType.name;

                if (chargeType.calculationType === 'per_sqft') {
                    // Per square foot charges
                    amount = (flat.area || 0) * chargeType.defaultAmount;
                } else if (chargeType.calculationType === 'per_vehicle') {
                    // Per vehicle charges (only for vehicles parked inside)
                    let vehicleCount = 0;
                    if (chargeType.vehicleType === '2wheeler') {
                        vehicleCount = flat.twoWheelerCount || 0;
                        if (vehicleCount > 0) {
                            description = `${chargeType.name} (${vehicleCount} vehicle${vehicleCount > 1 ? 's' : ''})`;
                        }
                    } else if (chargeType.vehicleType === '4wheeler') {
                        vehicleCount = flat.fourWheelerCount || 0;
                        if (vehicleCount > 0) {
                            description = `${chargeType.name} (${vehicleCount} vehicle${vehicleCount > 1 ? 's' : ''})`;
                        }
                    }
                    amount = vehicleCount * chargeType.defaultAmount;
                } else {
                    // Fixed charges
                    amount = chargeType.defaultAmount;
                }

                if (amount > 0) {
                    lineItems.push({
                        chargeTypeId: chargeType.id,
                        description: description,
                        amount: amount
                    });
                    totalAmount += amount;
                }
            }

            // Calculate previous due
            const flatBills = billsData.filter(b => b.flatId === flat.id && b.status !== 'paid');
            const previousDue = flatBills.reduce((sum, b) => sum + (b.grandTotal - (b.paidAmount || 0)), 0);

            const bill = {
                id: Utils.generateId(),
                billNo: Utils.generateBillNumber(year, month, billCount),
                flatId: flat.id,
                month: month,
                year: year,
                lineItems: lineItems,
                totalAmount: totalAmount,
                previousDue: previousDue,
                grandTotal: totalAmount + previousDue,
                status: 'pending',
                paidAmount: 0,
                dueDate: dueDate,
                generatedAt: new Date().toISOString()
            };

            newBills.push(bill);
        }

        // Add new bills to data
        billsData = [...billsData, ...newBills];
        await storage.saveBills(billsData);

        filterBills();
        Utils.showToast(`Successfully generated ${newBills.length} bill(s)`, 'success');

    } catch (error) {
        console.error('Error generating bills:', error);
        Utils.showToast('Error generating bills', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function viewBill(billId) {
    const bill = billsData.find(b => b.id === billId);
    if (!bill) return;

    currentViewBill = bill;
    const flat = flatsData.find(f => f.id === bill.flatId);
    const building = flat ? (masterData.buildings || []).find(b => b.id === flat.buildingId) : null;

    const content = document.getElementById('bill-detail-content');
    content.innerHTML = `
        <div class="bill-preview" id="printable-bill">
            <div class="bill-preview-header">
                <div class="bill-preview-society">${Utils.escapeHtml(settings.societyName || 'Society Name')}</div>
                <div class="bill-preview-address">${Utils.escapeHtml(settings.address || '')}</div>
                <div class="mt-2"><strong>MAINTENANCE BILL</strong></div>
            </div>

            <div class="bill-details mt-4">
                <div>
                    <div class="bill-detail-item">
                        <span class="bill-detail-label">Bill No:</span>
                        <span class="bill-detail-value">${bill.billNo}</span>
                    </div>
                    <div class="bill-detail-item">
                        <span class="bill-detail-label">Bill Date:</span>
                        <span class="bill-detail-value">${Utils.formatDate(bill.generatedAt)}</span>
                    </div>
                    <div class="bill-detail-item">
                        <span class="bill-detail-label">Due Date:</span>
                        <span class="bill-detail-value">${Utils.formatDate(bill.dueDate)}</span>
                    </div>
                </div>
                <div>
                    <div class="bill-detail-item">
                        <span class="bill-detail-label">Flat No:</span>
                        <span class="bill-detail-value">${flat ? Utils.escapeHtml(flat.flatNo) : '-'}</span>
                    </div>
                    <div class="bill-detail-item">
                        <span class="bill-detail-label">Building:</span>
                        <span class="bill-detail-value">${building ? Utils.escapeHtml(building.name) : '-'}</span>
                    </div>
                    <div class="bill-detail-item">
                        <span class="bill-detail-label">Owner:</span>
                        <span class="bill-detail-value">${flat ? Utils.escapeHtml(flat.ownerName) : '-'}</span>
                    </div>
                </div>
            </div>

            <table class="table mt-4">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${bill.lineItems.map(item => `
                        <tr>
                            <td>${Utils.escapeHtml(item.description)}</td>
                            <td class="text-right amount">${Utils.formatCurrency(item.amount)}</td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td><strong>Current Month Total</strong></td>
                        <td class="text-right amount"><strong>${Utils.formatCurrency(bill.totalAmount)}</strong></td>
                    </tr>
                    ${bill.previousDue > 0 ? `
                        <tr>
                            <td>Previous Due</td>
                            <td class="text-right amount text-danger">${Utils.formatCurrency(bill.previousDue)}</td>
                        </tr>
                    ` : ''}
                    <tr style="background: var(--primary); color: white;">
                        <td><strong>Grand Total</strong></td>
                        <td class="text-right amount"><strong>${Utils.formatCurrency(bill.grandTotal)}</strong></td>
                    </tr>
                    ${bill.paidAmount > 0 ? `
                        <tr>
                            <td>Amount Paid</td>
                            <td class="text-right amount text-success">${Utils.formatCurrency(bill.paidAmount)}</td>
                        </tr>
                        <tr>
                            <td><strong>Balance Due</strong></td>
                            <td class="text-right amount text-danger"><strong>${Utils.formatCurrency(bill.grandTotal - bill.paidAmount)}</strong></td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>

            <div class="mt-3 text-muted" style="font-size: 0.8125rem;">
                <p>Please pay before the due date to avoid late fee charges.</p>
                ${settings.phone ? `<p>For queries contact: ${settings.phone}</p>` : ''}
            </div>
        </div>
    `;

    Utils.openModal('view-bill-modal');
}

function printCurrentBill() {
    if (!currentViewBill) return;
    Utils.printElement('printable-bill');
}

function recordPayment(billId) {
    window.location.href = `payments.html?action=add&billId=${billId}`;
}

async function deleteBill(billId) {
    const bill = billsData.find(b => b.id === billId);
    if (!bill) return;

    // Check if bill has payments
    const billPayments = paymentsData.filter(p => p.billId === billId);
    if (billPayments.length > 0) {
        Utils.showToast('Cannot delete bill with payments. Delete payments first.', 'error');
        return;
    }

    const confirmed = await Utils.showConfirm(
        `Are you sure you want to delete bill "${bill.billNo}"? This action cannot be undone.`,
        'Delete Bill'
    );

    if (!confirmed) return;

    Utils.showLoading('Deleting...');

    try {
        billsData = billsData.filter(b => b.id !== billId);
        await storage.saveBills(billsData);
        filterBills();
        Utils.showToast('Bill deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting bill:', error);
        Utils.showToast('Error deleting bill', 'error');
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
