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

    // Display society name
    const societyName = auth.getSocietyName();
    if (societyName) {
        document.getElementById('society-name').textContent = societyName;
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

            // Check if flat is tenant-occupied
            const isTenantOccupied = flat.occupancyType === 'tenant';
            const parkingMultiplier = isTenantOccupied ? (settings.tenantParkingMultiplier || 1) : 1;

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
                    // Apply tenant parking multiplier
                    amount = vehicleCount * chargeType.defaultAmount * parkingMultiplier;

                    // Update description if multiplier applied
                    if (parkingMultiplier > 1 && vehicleCount > 0) {
                        description += ` [${parkingMultiplier}x tenant rate]`;
                    }
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

            // Add Non-Occupancy Charges (NOC) for tenant-occupied flats
            if (isTenantOccupied && settings.nocEnabled && settings.nocAmount > 0) {
                lineItems.push({
                    chargeTypeId: 'noc',
                    description: 'Non-Occupancy Charges (NOC)',
                    amount: settings.nocAmount
                });
                totalAmount += settings.nocAmount;
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
    const chargeTypes = (masterData.chargeTypes || []).filter(c => c.isActive !== false);

    // Build numbered line items (Gulmohar style)
    let lineItemsHtml = '';
    let srNo = 0;

    // Map charge types to their amounts from bill line items
    chargeTypes.forEach(chargeType => {
        srNo++;
        const lineItem = bill.lineItems.find(item => item.chargeTypeId === chargeType.id);
        const amount = lineItem ? lineItem.amount : 0;

        lineItemsHtml += `
            <tr>
                <td class="text-center">${srNo}.</td>
                <td>${Utils.escapeHtml(chargeType.name)}</td>
                <td class="text-right amount">${amount > 0 ? Utils.formatCurrency(amount) : '-'}</td>
            </tr>
        `;
    });

    // Add any line items that don't match known charge types
    bill.lineItems.forEach(item => {
        const hasChargeType = chargeTypes.some(c => c.id === item.chargeTypeId);
        if (!hasChargeType) {
            srNo++;
            lineItemsHtml += `
                <tr>
                    <td class="text-center">${srNo}.</td>
                    <td>${Utils.escapeHtml(item.description)}</td>
                    <td class="text-right amount">${Utils.formatCurrency(item.amount)}</td>
                </tr>
            `;
        }
    });

    const content = document.getElementById('bill-detail-content');
    content.innerHTML = `
        <div class="bill-preview gulmohar-bill" id="printable-bill">
            <!-- Society Header -->
            <div class="bill-preview-header" style="border: 2px solid #1e40af; padding: 15px; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);">
                <div class="bill-preview-society" style="font-size: 1.25rem; font-weight: bold; color: #1e40af;">${Utils.escapeHtml(settings.societyName || 'Society Name')}</div>
                ${settings.registrationNo ? `<div style="font-size: 0.75rem; color: #64748b;">Reg. No.: ${Utils.escapeHtml(settings.registrationNo)}</div>` : ''}
                <div style="font-size: 0.8rem; color: #475569;">${Utils.escapeHtml(settings.address || '')}</div>
            </div>

            <!-- Bill Info Row -->
            <div style="display: flex; justify-content: space-between; border: 1px solid #e2e8f0; border-top: none; padding: 10px; background: #f8fafc;">
                <div>
                    <span style="font-size: 0.75rem; color: #64748b;">Bill No.</span>
                    <strong style="display: block;">${bill.billNo}</strong>
                </div>
                <div style="text-align: center;">
                    <span style="font-size: 0.75rem; color: #64748b;">Date</span>
                    <strong style="display: block;">${Utils.formatDate(bill.generatedAt)}</strong>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; color: #64748b;">Due Date</span>
                    <strong style="display: block;">${Utils.formatDate(bill.dueDate)}</strong>
                </div>
            </div>

            <!-- Member Info -->
            <div style="border: 1px solid #e2e8f0; border-top: none; padding: 10px;">
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div>
                        <span style="font-size: 0.75rem; color: #64748b;">Flat No.</span>
                        <strong style="display: block;">${flat ? Utils.escapeHtml(flat.flatNo) : '-'}</strong>
                    </div>
                    <div>
                        <span style="font-size: 0.75rem; color: #64748b;">Building</span>
                        <strong style="display: block;">${building ? Utils.escapeHtml(building.name) : '-'}</strong>
                    </div>
                    <div style="flex: 1;">
                        <span style="font-size: 0.75rem; color: #64748b;">Shri/Smt.</span>
                        <strong style="display: block;">${flat ? Utils.escapeHtml(flat.ownerName) : '-'}</strong>
                    </div>
                    <div>
                        <span style="font-size: 0.75rem; color: #64748b;">For the Month</span>
                        <strong style="display: block;">${Utils.getMonthName(bill.month)} ${bill.year}</strong>
                    </div>
                </div>
            </div>

            <!-- Bill Items Table -->
            <table class="table mt-3" style="border: 1px solid #e2e8f0;">
                <thead>
                    <tr style="background: #1e40af; color: white;">
                        <th style="width: 50px; text-align: center;">Sr. No.</th>
                        <th>PARTICULARS</th>
                        <th style="width: 120px; text-align: right;">Amount (Rs.)</th>
                    </tr>
                </thead>
                <tbody>
                    ${lineItemsHtml}
                    <!-- Sub-Total -->
                    <tr style="background: #f1f5f9; font-weight: bold;">
                        <td></td>
                        <td>Sub-Total</td>
                        <td class="text-right amount">${Utils.formatCurrency(bill.totalAmount)}</td>
                    </tr>
                    <!-- Arrears Section -->
                    ${bill.previousDue > 0 ? `
                        <tr>
                            <td></td>
                            <td>Add: Arrears, if any</td>
                            <td class="text-right amount text-danger">${Utils.formatCurrency(bill.previousDue)}</td>
                        </tr>
                    ` : ''}
                    ${bill.interest > 0 ? `
                        <tr>
                            <td></td>
                            <td style="padding-left: 30px;">Interest on Arrears</td>
                            <td class="text-right amount">${Utils.formatCurrency(bill.interest)}</td>
                        </tr>
                    ` : ''}
                    ${bill.penalty > 0 ? `
                        <tr>
                            <td></td>
                            <td style="padding-left: 30px;">Penalty</td>
                            <td class="text-right amount">${Utils.formatCurrency(bill.penalty)}</td>
                        </tr>
                    ` : ''}
                    <!-- Grand Total -->
                    <tr style="background: #1e40af; color: white; font-weight: bold;">
                        <td></td>
                        <td>Grand Total</td>
                        <td class="text-right amount" style="font-size: 1.1rem;">${Utils.formatCurrency(bill.grandTotal)}</td>
                    </tr>
                    ${bill.paidAmount > 0 ? `
                        <tr style="background: #dcfce7;">
                            <td></td>
                            <td>Amount Paid</td>
                            <td class="text-right amount text-success">${Utils.formatCurrency(bill.paidAmount)}</td>
                        </tr>
                        <tr style="background: #fee2e2; font-weight: bold;">
                            <td></td>
                            <td>Balance Due</td>
                            <td class="text-right amount text-danger">${Utils.formatCurrency(bill.grandTotal - bill.paidAmount)}</td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>

            <!-- Footer Notes -->
            <div style="margin-top: 15px; padding: 10px; border: 1px solid #e2e8f0; background: #fffbeb; font-size: 0.75rem;">
                <p style="margin: 0 0 5px 0;"><strong>Note:</strong></p>
                <ol style="margin: 0; padding-left: 20px; color: #475569;">
                    <li>Interest of 2% per annum is applicable for late payments.</li>
                    <li>Payments after due date should be intimated immediately.</li>
                    <li>Any objection about this bill should be entertained within one month.</li>
                    <li>Please issue Crossed Cheque in favour of the Society.</li>
                </ol>
            </div>

            <!-- Signature Section -->
            <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px;">
                <div style="text-align: center;">
                    <div style="border-top: 1px solid #000; width: 150px; padding-top: 5px; font-size: 0.75rem;">
                        Member Signature
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="border-top: 1px solid #000; width: 200px; padding-top: 5px; font-size: 0.75rem;">
                        For ${Utils.escapeHtml(settings.societyName || 'Society')}<br>
                        <span style="font-size: 0.7rem; color: #64748b;">Chairman/Secretary/Treasurer</span>
                    </div>
                </div>
            </div>

            ${settings.phone ? `
                <div style="text-align: center; margin-top: 15px; font-size: 0.75rem; color: #64748b;">
                    For queries contact: ${Utils.escapeHtml(settings.phone)}
                </div>
            ` : ''}
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
