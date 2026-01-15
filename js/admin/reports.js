/**
 * Reports JavaScript
 */

let billsData = [];
let paymentsData = [];
let flatsData = [];
let masterData = {};

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
        [billsData, paymentsData, flatsData, masterData] = await Promise.all([
            storage.getBills(),
            storage.getPayments(),
            storage.getFlats(),
            storage.getMasterData()
        ]);

        // Populate flat dropdown for ledger
        populateFlatDropdown();

        // Generate outstanding report
        generateOutstandingReport();

    } catch (error) {
        console.error('Error loading data:', error);
        Utils.showToast('Error loading data', 'error');
    } finally {
        Utils.hideLoading();
    }
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
