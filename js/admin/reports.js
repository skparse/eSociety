/**
 * Reports JavaScript
 */

let billsData = [];
let paymentsData = [];
let expensesData = [];
let flatsData = [];
let masterData = {};
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

    // Setup tabs
    setupTabs();

    // Set default dates for collection report
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    document.getElementById('collection-from-date').value = firstDay.toISOString().split('T')[0];
    document.getElementById('collection-to-date').value = now.toISOString().split('T')[0];

    // Load data
    await loadData();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.master-data-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById('tab-' + this.dataset.tab).classList.add('active');
        });
    });
}

async function loadData() {
    Utils.showLoading('Loading report data...');

    try {
        [billsData, paymentsData, expensesData, flatsData, masterData, settings] = await Promise.all([
            storage.getBills(),
            storage.getPayments(),
            storage.getExpenses(),
            storage.getFlats(),
            storage.getMasterData(),
            storage.getSettings()
        ]);

        // Populate flat dropdown for ledger
        populateFlatDropdown();

        // Populate building dropdown for fee position report
        populateBuildingDropdown();

        // Populate financial year dropdown for income/expense report
        populateFinancialYearDropdown();

        // Set default date for fee position report
        document.getElementById('fee-position-date').value = new Date().toISOString().split('T')[0];

        // Generate outstanding report
        generateOutstandingReport();

    } catch (error) {
        console.error('Error loading data:', error);
        Utils.showToast('Error loading data', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function populateBuildingDropdown() {
    const select = document.getElementById('fee-position-building');
    const buildings = (masterData.buildings || []).filter(b => b.isActive !== false);
    select.innerHTML = '<option value="">All Buildings</option>' +
        buildings.map(b => `<option value="${b.id}">${Utils.escapeHtml(b.name)}</option>`).join('');
}

function populateFlatDropdown() {
    const select = document.getElementById('ledger-flat');
    select.innerHTML = '<option value="">Select a flat</option>' +
        flatsData
            .filter(f => f.isActive !== false)
            .map(f => `<option value="${f.id}">${Utils.escapeHtml(f.flatNo)} - ${Utils.escapeHtml(f.ownerName || 'N/A')}</option>`)
            .join('');
}

// ==================== Outstanding Report ====================

function generateOutstandingReport() {
    const tbody = document.getElementById('outstanding-table-body');
    const summaryDiv = document.getElementById('outstanding-summary');

    // Calculate outstanding for each flat
    const outstandingData = flatsData
        .filter(f => f.isActive !== false)
        .map(flat => {
            const flatBills = billsData.filter(b => b.flatId === flat.id);
            const flatPayments = paymentsData.filter(p => p.flatId === flat.id);

            const totalBilled = flatBills.reduce((sum, b) => sum + b.grandTotal, 0);
            const totalPaid = flatPayments.reduce((sum, p) => sum + p.amount, 0);
            const outstanding = totalBilled - totalPaid;

            // Calculate overdue amount
            const overdueAmount = flatBills
                .filter(b => b.status !== 'paid' && Utils.isOverdue(b.dueDate))
                .reduce((sum, b) => sum + (b.grandTotal - (b.paidAmount || 0)), 0);

            return {
                flat: flat,
                totalBilled: totalBilled,
                totalPaid: totalPaid,
                outstanding: outstanding,
                overdue: overdueAmount
            };
        })
        .filter(d => d.outstanding > 0 || d.totalBilled > 0)
        .sort((a, b) => b.outstanding - a.outstanding);

    // Calculate totals
    const totalOutstanding = outstandingData.reduce((sum, d) => sum + d.outstanding, 0);
    const totalOverdue = outstandingData.reduce((sum, d) => sum + d.overdue, 0);
    const flatsWithOutstanding = outstandingData.filter(d => d.outstanding > 0).length;

    // Render summary
    summaryDiv.innerHTML = `
        <div class="report-summary-item">
            <div class="report-summary-value text-danger">${Utils.formatCurrency(totalOutstanding)}</div>
            <div class="report-summary-label">Total Outstanding</div>
        </div>
        <div class="report-summary-item">
            <div class="report-summary-value text-warning">${Utils.formatCurrency(totalOverdue)}</div>
            <div class="report-summary-label">Overdue Amount</div>
        </div>
        <div class="report-summary-item">
            <div class="report-summary-value">${flatsWithOutstanding}</div>
            <div class="report-summary-label">Flats with Dues</div>
        </div>
        <div class="report-summary-item">
            <div class="report-summary-value">${flatsData.length}</div>
            <div class="report-summary-label">Total Flats</div>
        </div>
    `;

    // Render table
    if (outstandingData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No data available</td></tr>';
        return;
    }

    tbody.innerHTML = outstandingData.map(d => `
        <tr>
            <td><strong>${Utils.escapeHtml(d.flat.flatNo)}</strong></td>
            <td>${Utils.escapeHtml(d.flat.ownerName || '-')}</td>
            <td class="amount">${Utils.formatCurrency(d.totalBilled)}</td>
            <td class="amount text-success">${Utils.formatCurrency(d.totalPaid)}</td>
            <td class="amount ${d.outstanding > 0 ? 'text-danger' : ''}">${Utils.formatCurrency(d.outstanding)}</td>
            <td class="amount ${d.overdue > 0 ? 'text-warning' : ''}">${Utils.formatCurrency(d.overdue)}</td>
        </tr>
    `).join('');
}

function exportOutstandingReport() {
    const data = flatsData
        .filter(f => f.isActive !== false)
        .map(flat => {
            const flatBills = billsData.filter(b => b.flatId === flat.id);
            const flatPayments = paymentsData.filter(p => p.flatId === flat.id);

            return {
                'Flat No': flat.flatNo,
                'Owner': flat.ownerName || '',
                'Total Billed': flatBills.reduce((sum, b) => sum + b.grandTotal, 0),
                'Total Paid': flatPayments.reduce((sum, p) => sum + p.amount, 0),
                'Outstanding': flatBills.reduce((sum, b) => sum + b.grandTotal, 0) - flatPayments.reduce((sum, p) => sum + p.amount, 0)
            };
        });

    Utils.exportToCSV(data, 'outstanding_report.csv', ['Flat No', 'Owner', 'Total Billed', 'Total Paid', 'Outstanding']);
    Utils.showToast('Report exported successfully', 'success');
}

// ==================== Collection Report ====================

function generateCollectionReport() {
    const fromDate = document.getElementById('collection-from-date').value;
    const toDate = document.getElementById('collection-to-date').value;
    const tbody = document.getElementById('collection-table-body');
    const summaryDiv = document.getElementById('collection-summary');

    if (!fromDate || !toDate) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Select date range to view report</td></tr>';
        summaryDiv.innerHTML = '';
        return;
    }

    // Filter payments by date range
    const filteredPayments = paymentsData.filter(p => {
        const paymentDate = p.paymentDate.split('T')[0];
        return paymentDate >= fromDate && paymentDate <= toDate;
    }).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    // Calculate totals by mode
    const totalsByMode = {
        cash: 0,
        cheque: 0,
        upi: 0,
        bank_transfer: 0
    };

    filteredPayments.forEach(p => {
        totalsByMode[p.paymentMode] = (totalsByMode[p.paymentMode] || 0) + p.amount;
    });

    const grandTotal = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    // Render summary
    summaryDiv.innerHTML = `
        <div class="report-summary-item">
            <div class="report-summary-value text-success">${Utils.formatCurrency(grandTotal)}</div>
            <div class="report-summary-label">Total Collection</div>
        </div>
        <div class="report-summary-item">
            <div class="report-summary-value">${Utils.formatCurrency(totalsByMode.cash)}</div>
            <div class="report-summary-label">Cash</div>
        </div>
        <div class="report-summary-item">
            <div class="report-summary-value">${Utils.formatCurrency(totalsByMode.cheque)}</div>
            <div class="report-summary-label">Cheque</div>
        </div>
        <div class="report-summary-item">
            <div class="report-summary-value">${Utils.formatCurrency(totalsByMode.upi + totalsByMode.bank_transfer)}</div>
            <div class="report-summary-label">Online</div>
        </div>
    `;

    // Render table
    if (filteredPayments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No payments in selected date range</td></tr>';
        return;
    }

    const modeLabels = {
        cash: 'Cash',
        cheque: 'Cheque',
        upi: 'UPI',
        bank_transfer: 'Bank Transfer'
    };

    tbody.innerHTML = filteredPayments.map(p => {
        const flat = flatsData.find(f => f.id === p.flatId);
        return `
            <tr>
                <td>${Utils.formatDate(p.paymentDate)}</td>
                <td>${p.receiptNo}</td>
                <td>${flat ? Utils.escapeHtml(flat.flatNo) : '-'}</td>
                <td>${modeLabels[p.paymentMode] || p.paymentMode}</td>
                <td class="amount text-success">${Utils.formatCurrency(p.amount)}</td>
            </tr>
        `;
    }).join('');
}

function exportCollectionReport() {
    const fromDate = document.getElementById('collection-from-date').value;
    const toDate = document.getElementById('collection-to-date').value;

    if (!fromDate || !toDate) {
        Utils.showToast('Please select date range', 'warning');
        return;
    }

    const modeLabels = {
        cash: 'Cash',
        cheque: 'Cheque',
        upi: 'UPI',
        bank_transfer: 'Bank Transfer'
    };

    const data = paymentsData
        .filter(p => {
            const paymentDate = p.paymentDate.split('T')[0];
            return paymentDate >= fromDate && paymentDate <= toDate;
        })
        .map(p => {
            const flat = flatsData.find(f => f.id === p.flatId);
            return {
                'Date': Utils.formatDate(p.paymentDate),
                'Receipt No': p.receiptNo,
                'Flat': flat ? flat.flatNo : '',
                'Mode': modeLabels[p.paymentMode] || p.paymentMode,
                'Amount': p.amount
            };
        });

    Utils.exportToCSV(data, 'collection_report.csv', ['Date', 'Receipt No', 'Flat', 'Mode', 'Amount']);
    Utils.showToast('Report exported successfully', 'success');
}

// ==================== Flat Ledger Report ====================

function generateLedgerReport() {
    const flatId = document.getElementById('ledger-flat').value;
    const tbody = document.getElementById('ledger-table-body');
    const infoDiv = document.getElementById('ledger-flat-info');

    if (!flatId) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Select a flat to view ledger</td></tr>';
        infoDiv.classList.add('d-none');
        return;
    }

    const flat = flatsData.find(f => f.id === flatId);
    if (!flat) return;

    // Get flat's bills and payments
    const flatBills = billsData.filter(b => b.flatId === flatId);
    const flatPayments = paymentsData.filter(p => p.flatId === flatId);

    // Create ledger entries
    const entries = [];

    flatBills.forEach(b => {
        entries.push({
            date: b.generatedAt,
            description: `Bill - ${Utils.getMonthName(b.month)} ${b.year} (${b.billNo})`,
            debit: b.grandTotal,
            credit: 0,
            type: 'bill'
        });
    });

    flatPayments.forEach(p => {
        entries.push({
            date: p.paymentDate,
            description: `Payment - ${p.receiptNo} (${p.paymentMode})`,
            debit: 0,
            credit: p.amount,
            type: 'payment'
        });
    });

    // Sort by date
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let balance = 0;
    entries.forEach(e => {
        balance = balance + e.debit - e.credit;
        e.balance = balance;
    });

    // Calculate totals
    const totalBilled = flatBills.reduce((sum, b) => sum + b.grandTotal, 0);
    const totalPaid = flatPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = totalBilled - totalPaid;

    // Update flat info
    document.getElementById('ledger-owner').textContent = flat.ownerName || '-';
    document.getElementById('ledger-area').textContent = flat.area ? `${Utils.formatNumber(flat.area)} sq.ft` : '-';
    document.getElementById('ledger-outstanding').textContent = Utils.formatCurrency(outstanding);
    infoDiv.classList.remove('d-none');

    // Render table
    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No transactions for this flat</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(e => `
        <tr>
            <td>${Utils.formatDate(e.date)}</td>
            <td>${e.description}</td>
            <td class="amount ${e.debit > 0 ? 'text-danger' : ''}">${e.debit > 0 ? Utils.formatCurrency(e.debit) : '-'}</td>
            <td class="amount ${e.credit > 0 ? 'text-success' : ''}">${e.credit > 0 ? Utils.formatCurrency(e.credit) : '-'}</td>
            <td class="amount ${e.balance > 0 ? 'text-danger' : 'text-success'}">${Utils.formatCurrency(e.balance)}</td>
        </tr>
    `).join('') + `
        <tr style="font-weight: bold; background: var(--gray-100);">
            <td colspan="2"><strong>Total</strong></td>
            <td class="amount text-danger">${Utils.formatCurrency(totalBilled)}</td>
            <td class="amount text-success">${Utils.formatCurrency(totalPaid)}</td>
            <td class="amount ${outstanding > 0 ? 'text-danger' : 'text-success'}">${Utils.formatCurrency(outstanding)}</td>
        </tr>
    `;
}

function exportLedgerReport() {
    const flatId = document.getElementById('ledger-flat').value;

    if (!flatId) {
        Utils.showToast('Please select a flat', 'warning');
        return;
    }

    const flat = flatsData.find(f => f.id === flatId);
    const flatBills = billsData.filter(b => b.flatId === flatId);
    const flatPayments = paymentsData.filter(p => p.flatId === flatId);

    const entries = [];

    flatBills.forEach(b => {
        entries.push({
            date: b.generatedAt,
            description: `Bill - ${Utils.getMonthName(b.month)} ${b.year}`,
            debit: b.grandTotal,
            credit: 0
        });
    });

    flatPayments.forEach(p => {
        entries.push({
            date: p.paymentDate,
            description: `Payment - ${p.receiptNo}`,
            debit: 0,
            credit: p.amount
        });
    });

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;
    const data = entries.map(e => {
        balance = balance + e.debit - e.credit;
        return {
            'Date': Utils.formatDate(e.date),
            'Description': e.description,
            'Debit': e.debit || '',
            'Credit': e.credit || '',
            'Balance': balance
        };
    });

    Utils.exportToCSV(data, `ledger_${flat.flatNo}.csv`, ['Date', 'Description', 'Debit', 'Credit', 'Balance']);
    Utils.showToast('Report exported successfully', 'success');
}

// ==================== Fee Position Report (Gulmohar Style) ====================

function generateFeePositionReport() {
    const asOnDate = document.getElementById('fee-position-date').value;
    const buildingFilter = document.getElementById('fee-position-building').value;
    const thead = document.getElementById('fee-position-table-head');
    const tbody = document.getElementById('fee-position-table-body');
    const tfoot = document.getElementById('fee-position-table-foot');

    if (!asOnDate) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Select a date to view report</td></tr>';
        return;
    }

    // Update report header
    document.getElementById('fee-position-society-name').textContent = settings.societyName || 'Society Name';
    document.getElementById('fee-position-society-address').textContent = settings.address || '';
    document.getElementById('fee-position-as-on-date').textContent = Utils.formatDate(asOnDate, 'long');

    // Get all charge types
    const chargeTypes = (masterData.chargeTypes || []).filter(c => c.isActive !== false);

    // Build dynamic header with charge type columns
    let headerHtml = `
        <tr>
            <th rowspan="2" style="vertical-align: middle;">SR No</th>
            <th rowspan="2" style="vertical-align: middle;">Flat No</th>
            <th rowspan="2" style="vertical-align: middle;">Owner Name</th>
            ${chargeTypes.map(c => `<th style="font-size: 0.7rem; text-align: center;">${Utils.escapeHtml(c.name)}</th>`).join('')}
            <th rowspan="2" style="vertical-align: middle;">Total</th>
            <th rowspan="2" style="vertical-align: middle;">Interest</th>
            <th rowspan="2" style="vertical-align: middle;">Penalty</th>
            <th rowspan="2" style="vertical-align: middle;">Previous Balance</th>
            <th rowspan="2" style="vertical-align: middle;">Balance</th>
        </tr>
    `;
    thead.innerHTML = headerHtml;

    // Filter flats by building
    let filteredFlats = flatsData.filter(f => f.isActive !== false);
    if (buildingFilter) {
        filteredFlats = filteredFlats.filter(f => f.buildingId === buildingFilter);
    }

    // Group flats by building
    const buildings = (masterData.buildings || []).filter(b => b.isActive !== false);
    const flatsByBuilding = {};

    filteredFlats.forEach(flat => {
        const buildingId = flat.buildingId || 'unassigned';
        if (!flatsByBuilding[buildingId]) {
            flatsByBuilding[buildingId] = [];
        }
        flatsByBuilding[buildingId].push(flat);
    });

    // Sort flats within each building
    Object.keys(flatsByBuilding).forEach(buildingId => {
        flatsByBuilding[buildingId].sort((a, b) => {
            // Extract numeric part for proper sorting
            const numA = parseInt(a.flatNo.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.flatNo.replace(/\D/g, '')) || 0;
            return numA - numB;
        });
    });

    // Calculate fee position for each flat
    const asOnDateObj = new Date(asOnDate);
    asOnDateObj.setHours(23, 59, 59, 999);

    let tableHtml = '';
    let srNo = 0;
    const columnTotals = {
        charges: new Array(chargeTypes.length).fill(0),
        total: 0,
        interest: 0,
        penalty: 0,
        previousBalance: 0,
        balance: 0
    };

    // Process each building
    const buildingIds = buildingFilter ? [buildingFilter] : Object.keys(flatsByBuilding);

    buildingIds.forEach(buildingId => {
        const flats = flatsByBuilding[buildingId] || [];
        if (flats.length === 0) return;

        const building = buildings.find(b => b.id === buildingId);
        const buildingName = building ? building.name : 'Unassigned';

        // Building header row
        const totalCols = chargeTypes.length + 8; // SR, Flat, Owner, charges..., Total, Interest, Penalty, Prev, Balance
        tableHtml += `
            <tr style="background: #e2e8f0; font-weight: bold;">
                <td colspan="${totalCols}">${Utils.escapeHtml(buildingName)}</td>
            </tr>
        `;

        let buildingTotals = {
            charges: new Array(chargeTypes.length).fill(0),
            total: 0,
            interest: 0,
            penalty: 0,
            previousBalance: 0,
            balance: 0
        };

        flats.forEach(flat => {
            srNo++;

            // Get bills for this flat up to the as-on date
            const flatBills = billsData.filter(b =>
                b.flatId === flat.id &&
                new Date(b.generatedAt) <= asOnDateObj
            );

            // Get payments for this flat up to the as-on date
            const flatPayments = paymentsData.filter(p =>
                p.flatId === flat.id &&
                new Date(p.paymentDate) <= asOnDateObj
            );

            // Calculate charge-wise totals from line items
            const chargeAmounts = new Array(chargeTypes.length).fill(0);
            let totalCharges = 0;
            let interest = 0;
            let penalty = 0;

            flatBills.forEach(bill => {
                (bill.lineItems || []).forEach(item => {
                    const chargeIndex = chargeTypes.findIndex(c => c.id === item.chargeTypeId);
                    if (chargeIndex !== -1) {
                        chargeAmounts[chargeIndex] += item.amount;
                    }
                    totalCharges += item.amount;
                });

                // Add interest and penalty if present
                interest += bill.interest || 0;
                penalty += bill.penalty || 0;
            });

            // Calculate totals
            const totalBilled = flatBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
            const totalPaid = flatPayments.reduce((sum, p) => sum + p.amount, 0);

            // Previous balance is from older bills
            const previousBalance = flatBills
                .filter(b => b.previousDue && b.previousDue > 0)
                .reduce((sum, b) => sum + b.previousDue, 0);

            const balance = totalBilled - totalPaid;

            // Update building totals
            chargeAmounts.forEach((amt, i) => {
                buildingTotals.charges[i] += amt;
                columnTotals.charges[i] += amt;
            });
            buildingTotals.total += totalCharges;
            buildingTotals.interest += interest;
            buildingTotals.penalty += penalty;
            buildingTotals.previousBalance += previousBalance;
            buildingTotals.balance += balance;

            columnTotals.total += totalCharges;
            columnTotals.interest += interest;
            columnTotals.penalty += penalty;
            columnTotals.previousBalance += previousBalance;
            columnTotals.balance += balance;

            // Build row
            tableHtml += `
                <tr>
                    <td>${srNo}</td>
                    <td><strong>${Utils.escapeHtml(flat.flatNo)}</strong></td>
                    <td>${Utils.escapeHtml(flat.ownerName || '-')}</td>
                    ${chargeAmounts.map(amt => `<td class="amount text-right">${amt > 0 ? Utils.formatNumber(amt) : ''}</td>`).join('')}
                    <td class="amount text-right">${Utils.formatNumber(totalCharges)}</td>
                    <td class="amount text-right">${interest > 0 ? Utils.formatNumber(interest) : ''}</td>
                    <td class="amount text-right">${penalty > 0 ? Utils.formatNumber(penalty) : ''}</td>
                    <td class="amount text-right">${previousBalance > 0 ? Utils.formatNumber(previousBalance) : ''}</td>
                    <td class="amount text-right ${balance > 0 ? 'text-danger' : 'text-success'}"><strong>${Utils.formatNumber(balance)}</strong></td>
                </tr>
            `;
        });

        // Building subtotal row
        tableHtml += `
            <tr style="background: #f1f5f9; font-weight: bold;">
                <td colspan="3" class="text-right">${Utils.escapeHtml(buildingName)} Total:</td>
                ${buildingTotals.charges.map(amt => `<td class="amount text-right">${Utils.formatNumber(amt)}</td>`).join('')}
                <td class="amount text-right">${Utils.formatNumber(buildingTotals.total)}</td>
                <td class="amount text-right">${Utils.formatNumber(buildingTotals.interest)}</td>
                <td class="amount text-right">${Utils.formatNumber(buildingTotals.penalty)}</td>
                <td class="amount text-right">${Utils.formatNumber(buildingTotals.previousBalance)}</td>
                <td class="amount text-right">${Utils.formatNumber(buildingTotals.balance)}</td>
            </tr>
        `;
    });

    tbody.innerHTML = tableHtml || '<tr><td colspan="8" class="text-center text-muted">No data available</td></tr>';

    // Grand total footer
    tfoot.innerHTML = `
        <tr style="background: #1e40af; color: white; font-weight: bold;">
            <td colspan="3" class="text-right">Grand Total:</td>
            ${columnTotals.charges.map(amt => `<td class="amount text-right">${Utils.formatNumber(amt)}</td>`).join('')}
            <td class="amount text-right">${Utils.formatNumber(columnTotals.total)}</td>
            <td class="amount text-right">${Utils.formatNumber(columnTotals.interest)}</td>
            <td class="amount text-right">${Utils.formatNumber(columnTotals.penalty)}</td>
            <td class="amount text-right">${Utils.formatNumber(columnTotals.previousBalance)}</td>
            <td class="amount text-right">${Utils.formatNumber(columnTotals.balance)}</td>
        </tr>
    `;
}

function exportFeePositionReport() {
    const asOnDate = document.getElementById('fee-position-date').value;
    const buildingFilter = document.getElementById('fee-position-building').value;

    if (!asOnDate) {
        Utils.showToast('Please select a date', 'warning');
        return;
    }

    const chargeTypes = (masterData.chargeTypes || []).filter(c => c.isActive !== false);
    const asOnDateObj = new Date(asOnDate);
    asOnDateObj.setHours(23, 59, 59, 999);

    // Filter and process flats
    let filteredFlats = flatsData.filter(f => f.isActive !== false);
    if (buildingFilter) {
        filteredFlats = filteredFlats.filter(f => f.buildingId === buildingFilter);
    }

    const buildings = (masterData.buildings || []).filter(b => b.isActive !== false);

    const data = filteredFlats.map(flat => {
        const building = buildings.find(b => b.id === flat.buildingId);

        const flatBills = billsData.filter(b =>
            b.flatId === flat.id &&
            new Date(b.generatedAt) <= asOnDateObj
        );

        const flatPayments = paymentsData.filter(p =>
            p.flatId === flat.id &&
            new Date(p.paymentDate) <= asOnDateObj
        );

        const chargeAmounts = {};
        let totalCharges = 0;
        let interest = 0;
        let penalty = 0;

        chargeTypes.forEach(c => {
            chargeAmounts[c.name] = 0;
        });

        flatBills.forEach(bill => {
            (bill.lineItems || []).forEach(item => {
                const chargeType = chargeTypes.find(c => c.id === item.chargeTypeId);
                if (chargeType) {
                    chargeAmounts[chargeType.name] += item.amount;
                }
                totalCharges += item.amount;
            });
            interest += bill.interest || 0;
            penalty += bill.penalty || 0;
        });

        const totalBilled = flatBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
        const totalPaid = flatPayments.reduce((sum, p) => sum + p.amount, 0);
        const previousBalance = flatBills.filter(b => b.previousDue > 0).reduce((sum, b) => sum + b.previousDue, 0);
        const balance = totalBilled - totalPaid;

        return {
            'Building': building ? building.name : '',
            'Flat No': flat.flatNo,
            'Owner Name': flat.ownerName || '',
            ...chargeAmounts,
            'Total': totalCharges,
            'Interest': interest,
            'Penalty': penalty,
            'Previous Balance': previousBalance,
            'Balance': balance
        };
    });

    const headers = ['Building', 'Flat No', 'Owner Name', ...chargeTypes.map(c => c.name), 'Total', 'Interest', 'Penalty', 'Previous Balance', 'Balance'];
    Utils.exportToCSV(data, `fee_position_report_${asOnDate}.csv`, headers);
    Utils.showToast('Report exported successfully', 'success');
}

function printFeePositionReport() {
    const container = document.getElementById('fee-position-report-container');
    if (!container) return;

    // Show print header
    document.getElementById('fee-position-header').style.display = 'block';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fee Position Report</title>
            <style>
                @page {
                    size: A4 landscape;
                    margin: 5mm;
                }
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                body {
                    font-family: Arial, sans-serif;
                    font-size: 7pt;
                    padding: 2mm;
                }
                #fee-position-header {
                    text-align: center;
                    margin-bottom: 3mm;
                    padding-bottom: 2mm;
                    border-bottom: 0.5pt solid #000;
                }
                #fee-position-header h2 {
                    font-size: 11pt;
                    margin: 0 0 1mm 0;
                }
                #fee-position-header p {
                    font-size: 8pt;
                    margin: 0.5mm 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 5.5pt;
                    table-layout: fixed;
                }
                th, td {
                    border: 0.3pt solid #444;
                    padding: 0.5mm 1mm;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    vertical-align: middle;
                }
                th {
                    background: #d8d8d8 !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    font-weight: bold;
                    font-size: 5pt;
                }
                /* First 3 columns - Flat info */
                td:nth-child(1), td:nth-child(2), td:nth-child(3),
                th:nth-child(1), th:nth-child(2), th:nth-child(3) {
                    text-align: left;
                }
                .amount, .text-right {
                    text-align: right !important;
                    font-family: 'Courier New', monospace;
                    font-size: 5.5pt;
                }
                .text-danger { color: #b00; }
                .text-success { color: #060; }
                tfoot tr {
                    background: #c0c0c0 !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                tfoot td {
                    font-weight: bold;
                    font-size: 5.5pt;
                }
                /* Make Sr column narrow */
                th:first-child, td:first-child {
                    width: 15px;
                }
            </style>
        </head>
        <body>
            ${container.innerHTML}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 100);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();

    // Hide print header again
    document.getElementById('fee-position-header').style.display = 'none';
}

// ==================== Income & Expense Report ====================

function populateFinancialYearDropdown() {
    const select = document.getElementById('income-expense-fy');
    if (!select) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Determine current financial year (April to March)
    let currentFYStart = currentMonth >= 3 ? currentYear : currentYear - 1;

    // Generate last 5 financial years
    const options = [];
    for (let i = 0; i < 5; i++) {
        const fyStart = currentFYStart - i;
        const fyEnd = fyStart + 1;
        options.push(`<option value="${fyStart}">${fyStart}-${fyEnd} (Apr ${fyStart} - Mar ${fyEnd})</option>`);
    }

    select.innerHTML = options.join('');

    // Auto-generate report for current FY
    generateIncomeExpenseReport();
}

function getFinancialYearDates(fyStartYear) {
    return {
        start: new Date(fyStartYear, 3, 1), // April 1st
        end: new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999) // March 31st
    };
}

function generateIncomeExpenseReport() {
    const fySelect = document.getElementById('income-expense-fy');
    if (!fySelect || !fySelect.value) return;

    const fyStartYear = parseInt(fySelect.value);
    const { start: fyStart, end: fyEnd } = getFinancialYearDates(fyStartYear);

    // Update header
    document.getElementById('ie-society-name').textContent = settings.societyName || 'Society Name';
    document.getElementById('ie-society-address').textContent = settings.address || '';
    document.getElementById('ie-period').textContent = `Financial Year: April ${fyStartYear} - March ${fyStartYear + 1}`;

    // Filter payments (income) within FY
    const fyPayments = paymentsData.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate >= fyStart && paymentDate <= fyEnd;
    }).sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

    // Filter expenses within FY
    const fyExpenses = (expensesData || []).filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= fyStart && expenseDate <= fyEnd;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate totals
    const totalIncome = fyPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpense = fyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // Income by payment mode
    const incomeByMode = { cash: 0, cheque: 0, upi: 0, bank_transfer: 0 };
    fyPayments.forEach(p => {
        incomeByMode[p.paymentMode] = (incomeByMode[p.paymentMode] || 0) + p.amount;
    });

    // Expenses by category
    const expensesByCategory = {};
    const categories = CONFIG.EXPENSE_CATEGORIES || [];
    categories.forEach(c => { expensesByCategory[c.id] = { name: c.name, amount: 0 }; });
    fyExpenses.forEach(e => {
        if (expensesByCategory[e.category]) {
            expensesByCategory[e.category].amount += e.amount;
        }
    });

    // Render ledger body (side by side)
    const maxRows = Math.max(fyPayments.length, fyExpenses.length);
    let ledgerHtml = '';

    for (let i = 0; i < maxRows; i++) {
        const payment = fyPayments[i];
        const expense = fyExpenses[i];

        const flat = payment ? flatsData.find(f => f.id === payment.flatId) : null;

        ledgerHtml += `
            <div class="ledger-row">
                <div class="ledger-col income-col">
                    <div class="ledger-cell cell-date">${payment ? Utils.formatDate(payment.paymentDate) : ''}</div>
                    <div class="ledger-cell cell-desc">${payment ? `${payment.receiptNo} - ${flat ? Utils.escapeHtml(flat.flatNo) : 'N/A'}` : ''}</div>
                    <div class="ledger-cell cell-amount">${payment ? Utils.formatCurrency(payment.amount) : ''}</div>
                </div>
                <div class="ledger-col expense-col">
                    <div class="ledger-cell cell-date">${expense ? Utils.formatDate(expense.date) : ''}</div>
                    <div class="ledger-cell cell-desc">${expense ? Utils.escapeHtml(expense.description) : ''}</div>
                    <div class="ledger-cell cell-amount">${expense ? Utils.formatCurrency(expense.amount) : ''}</div>
                </div>
            </div>
        `;
    }

    if (maxRows === 0) {
        ledgerHtml = `
            <div class="ledger-row">
                <div class="ledger-col income-col">
                    <div class="ledger-cell text-center text-muted" style="flex: 1;">No income recorded</div>
                </div>
                <div class="ledger-col expense-col">
                    <div class="ledger-cell text-center text-muted" style="flex: 1;">No expenses recorded</div>
                </div>
            </div>
        `;
    }

    document.getElementById('income-expense-body').innerHTML = ledgerHtml;

    // Update totals
    document.getElementById('ie-total-income').textContent = Utils.formatCurrency(totalIncome);
    document.getElementById('ie-total-expense').textContent = Utils.formatCurrency(totalExpense);

    // Update summary
    document.getElementById('ie-summary-income').textContent = Utils.formatCurrency(totalIncome);
    document.getElementById('ie-summary-expense').textContent = Utils.formatCurrency(totalExpense);

    const netBalanceEl = document.getElementById('ie-net-balance');
    const netBalanceRow = document.getElementById('ie-net-balance-row');
    const isSurplus = netBalance >= 0;

    netBalanceEl.textContent = Utils.formatCurrency(Math.abs(netBalance)) + (isSurplus ? ' (Surplus)' : ' (Deficit)');
    netBalanceRow.className = 'summary-row summary-net ' + (isSurplus ? 'surplus' : 'deficit');

    // Render income by mode
    const modeLabels = { cash: 'Cash', cheque: 'Cheque', upi: 'UPI', bank_transfer: 'Bank Transfer' };
    document.getElementById('ie-income-by-mode').innerHTML = Object.entries(incomeByMode)
        .filter(([_, amt]) => amt > 0)
        .map(([mode, amt]) => `
            <tr>
                <td>${modeLabels[mode] || mode}</td>
                <td class="text-right amount">${Utils.formatCurrency(amt)}</td>
            </tr>
        `).join('') || '<tr><td colspan="2" class="text-center text-muted">No income</td></tr>';

    // Render expenses by category
    document.getElementById('ie-expenses-by-category').innerHTML = Object.values(expensesByCategory)
        .filter(c => c.amount > 0)
        .sort((a, b) => b.amount - a.amount)
        .map(c => `
            <tr>
                <td>${Utils.escapeHtml(c.name)}</td>
                <td class="text-right amount">${Utils.formatCurrency(c.amount)}</td>
            </tr>
        `).join('') || '<tr><td colspan="2" class="text-center text-muted">No expenses</td></tr>';
}

function exportIncomeExpenseReport() {
    const fySelect = document.getElementById('income-expense-fy');
    if (!fySelect || !fySelect.value) {
        Utils.showToast('Please select a financial year', 'warning');
        return;
    }

    const fyStartYear = parseInt(fySelect.value);
    const { start: fyStart, end: fyEnd } = getFinancialYearDates(fyStartYear);

    // Combine income and expenses into single list
    const entries = [];

    // Add payments (income)
    paymentsData.filter(p => {
        const date = new Date(p.paymentDate);
        return date >= fyStart && date <= fyEnd;
    }).forEach(p => {
        const flat = flatsData.find(f => f.id === p.flatId);
        entries.push({
            'Date': Utils.formatDate(p.paymentDate),
            'Type': 'Income',
            'Description': `${p.receiptNo} - ${flat ? flat.flatNo : 'N/A'}`,
            'Category': p.paymentMode,
            'Income': p.amount,
            'Expense': ''
        });
    });

    // Add expenses
    (expensesData || []).filter(e => {
        const date = new Date(e.date);
        return date >= fyStart && date <= fyEnd;
    }).forEach(e => {
        const categories = CONFIG.EXPENSE_CATEGORIES || [];
        const category = categories.find(c => c.id === e.category);
        entries.push({
            'Date': Utils.formatDate(e.date),
            'Type': 'Expense',
            'Description': e.description,
            'Category': category ? category.name : e.category,
            'Income': '',
            'Expense': e.amount
        });
    });

    // Sort by date
    entries.sort((a, b) => {
        const dateA = new Date(a.Date.split('/').reverse().join('-'));
        const dateB = new Date(b.Date.split('/').reverse().join('-'));
        return dateA - dateB;
    });

    // Add totals row
    const totalIncome = entries.reduce((sum, e) => sum + (e.Income || 0), 0);
    const totalExpense = entries.reduce((sum, e) => sum + (e.Expense || 0), 0);
    entries.push({
        'Date': '',
        'Type': 'TOTAL',
        'Description': '',
        'Category': '',
        'Income': totalIncome,
        'Expense': totalExpense
    });
    entries.push({
        'Date': '',
        'Type': 'NET BALANCE',
        'Description': totalIncome >= totalExpense ? 'Surplus' : 'Deficit',
        'Category': '',
        'Income': '',
        'Expense': totalIncome - totalExpense
    });

    Utils.exportToCSV(entries, `income_expense_FY${fyStartYear}-${fyStartYear + 1}.csv`,
        ['Date', 'Type', 'Description', 'Category', 'Income', 'Expense']);
    Utils.showToast('Report exported successfully', 'success');
}

function printIncomeExpenseReport() {
    const container = document.getElementById('income-expense-report-container');
    if (!container) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Income & Expense Statement</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 10mm;
                }
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                body {
                    font-family: Arial, sans-serif;
                    font-size: 10pt;
                    padding: 5mm;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 5mm;
                    padding-bottom: 3mm;
                    border-bottom: 1pt solid #000;
                }
                .report-header h3 {
                    font-size: 14pt;
                    margin-bottom: 2mm;
                }
                .report-header h4 {
                    font-size: 12pt;
                    margin: 2mm 0;
                }
                .report-header p {
                    font-size: 9pt;
                    color: #666;
                }
                .income-expense-ledger {
                    border: 1pt solid #000;
                    margin-bottom: 5mm;
                }
                .ledger-row {
                    display: flex;
                }
                .ledger-col {
                    flex: 1;
                    display: flex;
                    border-right: 1pt solid #000;
                }
                .ledger-col:last-child {
                    border-right: none;
                }
                .ledger-cell {
                    padding: 2mm;
                    border-bottom: 0.5pt solid #ccc;
                    font-size: 8pt;
                }
                .cell-date { width: 22mm; flex-shrink: 0; }
                .cell-desc { flex: 1; }
                .cell-amount { width: 25mm; flex-shrink: 0; text-align: right; font-family: monospace; }
                .ledger-header {
                    font-weight: bold;
                    background: #eee !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .ledger-header .income-col {
                    background: rgba(22, 163, 74, 0.2) !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .ledger-header .expense-col {
                    background: rgba(220, 38, 38, 0.2) !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .ledger-footer .income-total {
                    background: #16a34a !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .ledger-footer .expense-total {
                    background: #dc2626 !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .ledger-footer .ledger-cell {
                    border-bottom: none;
                    font-weight: bold;
                }
                .ledger-body {
                    max-height: none !important;
                    overflow: visible !important;
                }
                .financial-summary {
                    max-width: 300px;
                    margin: 5mm auto;
                }
                .summary-box {
                    border: 1pt solid #000;
                    padding: 3mm;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 1.5mm 0;
                    border-bottom: 0.5pt solid #ccc;
                }
                .summary-row:last-child { border-bottom: none; }
                .summary-net {
                    font-weight: bold;
                    font-size: 11pt;
                    margin-top: 2mm;
                    padding-top: 2mm;
                    border-top: 1pt solid #000;
                }
                .surplus { background: rgba(22, 163, 74, 0.2) !important; padding: 2mm !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .deficit { background: rgba(220, 38, 38, 0.2) !important; padding: 2mm !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .text-success { color: #16a34a; }
                .text-danger { color: #dc2626; }
                .category-summary { margin-top: 5mm; page-break-inside: avoid; }
                .category-summary h5 { font-size: 10pt; margin-bottom: 2mm; }
                .row { display: flex; gap: 5mm; }
                .col-md-6 { flex: 1; }
                table { width: 100%; border-collapse: collapse; font-size: 8pt; }
                table th, table td { border: 0.5pt solid #ccc; padding: 1.5mm 2mm; }
                table th { background: #eee; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .text-right { text-align: right; }
                .amount { font-family: monospace; }
            </style>
        </head>
        <body>
            ${container.innerHTML}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 100);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
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
