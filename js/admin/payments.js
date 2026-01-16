/**
 * Payments Management JavaScript
 */

let paymentsData = [];
let billsData = [];
let flatsData = [];
let settings = {};
let filteredPayments = [];
let currentViewReceipt = null;

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

    // Set default date filter (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    document.getElementById('filter-from-date').value = firstDay.toISOString().split('T')[0];
    document.getElementById('filter-to-date').value = now.toISOString().split('T')[0];

    // Set default payment date
    document.querySelector('#payment-form [name="paymentDate"]').value = now.toISOString().split('T')[0];

    // Load data
    await loadData();

    // Check for action parameter
    const params = Utils.getUrlParams();
    if (params.action === 'add') {
        openPaymentModal();
        if (params.billId) {
            // Pre-select bill if provided
            setTimeout(() => {
                const bill = billsData.find(b => b.id === params.billId);
                if (bill) {
                    document.getElementById('payment-flat-select').value = bill.flatId;
                    loadFlatBills();
                    setTimeout(() => {
                        document.getElementById('payment-bill-select').value = bill.id;
                        updateBillInfo();
                    }, 100);
                }
            }, 100);
        }
    }
});

async function loadData() {
    Utils.showLoading('Loading payments...');

    try {
        [paymentsData, billsData, flatsData, settings] = await Promise.all([
            storage.getPayments(),
            storage.getBills(),
            storage.getFlats(),
            storage.getSettings()
        ]);

        // Populate flat dropdowns
        populateFlatDropdowns();

        // Render table
        filterPayments();

    } catch (error) {
        console.error('Error loading data:', error);
        Utils.showToast('Error loading data', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function populateFlatDropdowns() {
    const filterFlatSelect = document.getElementById('filter-flat');
    const paymentFlatSelect = document.getElementById('payment-flat-select');

    const flatOptions = flatsData
        .filter(f => f.isActive !== false)
        .map(f => `<option value="${f.id}">${Utils.escapeHtml(f.flatNo)} - ${Utils.escapeHtml(f.ownerName || 'N/A')}</option>`)
        .join('');

    filterFlatSelect.innerHTML = '<option value="">All Flats</option>' + flatOptions;
    paymentFlatSelect.innerHTML = '<option value="">Select Flat</option>' + flatOptions;
}

function filterPayments() {
    const fromDate = document.getElementById('filter-from-date').value;
    const toDate = document.getElementById('filter-to-date').value;
    const flatFilter = document.getElementById('filter-flat').value;
    const modeFilter = document.getElementById('filter-mode').value;

    filteredPayments = paymentsData.filter(payment => {
        const paymentDate = payment.paymentDate.split('T')[0];

        const matchesFrom = !fromDate || paymentDate >= fromDate;
        const matchesTo = !toDate || paymentDate <= toDate;
        const matchesFlat = !flatFilter || payment.flatId === flatFilter;
        const matchesMode = !modeFilter || payment.paymentMode === modeFilter;

        return matchesFrom && matchesTo && matchesFlat && matchesMode;
    });

    // Sort by date descending
    filteredPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    // Update summary
    updateSummary();

    // Render table
    renderPaymentsTable();
}

function updateSummary() {
    const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    document.getElementById('stat-total-collected').textContent = Utils.formatCurrency(totalCollected);
    document.getElementById('stat-total-payments').textContent = filteredPayments.length;
}

function renderPaymentsTable() {
    const tbody = document.getElementById('payments-table-body');

    if (filteredPayments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted" style="padding: 2rem;">
                    ${paymentsData.length === 0 ? 'No payments recorded yet.' : 'No payments match your filter criteria.'}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredPayments.map(payment => {
        const flat = flatsData.find(f => f.id === payment.flatId);
        const bill = payment.billId ? billsData.find(b => b.id === payment.billId) : null;

        const modeLabels = {
            cash: 'Cash',
            cheque: 'Cheque',
            upi: 'UPI',
            bank_transfer: 'Bank Transfer'
        };

        return `
            <tr>
                <td><strong>${payment.receiptNo}</strong></td>
                <td>${Utils.formatDate(payment.paymentDate)}</td>
                <td>${flat ? Utils.escapeHtml(flat.flatNo) : '-'}</td>
                <td>${bill ? bill.billNo : 'Advance'}</td>
                <td class="amount text-success">${Utils.formatCurrency(payment.amount)}</td>
                <td>${modeLabels[payment.paymentMode] || payment.paymentMode}</td>
                <td>${payment.referenceNo || '-'}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewReceipt('${payment.id}')">Receipt</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePayment('${payment.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadFlatBills() {
    const flatId = document.getElementById('payment-flat-select').value;
    const billSelect = document.getElementById('payment-bill-select');

    if (!flatId) {
        billSelect.innerHTML = '<option value="">Advance Payment / No Bill</option>';
        document.getElementById('bill-info').classList.add('d-none');
        return;
    }

    // Get pending bills for this flat
    const pendingBills = billsData.filter(b =>
        b.flatId === flatId && b.status !== 'paid'
    ).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    billSelect.innerHTML = '<option value="">Advance Payment / No Bill</option>' +
        pendingBills.map(b => {
            const balance = b.grandTotal - (b.paidAmount || 0);
            return `<option value="${b.id}">
                ${b.billNo} - ${Utils.getMonthName(b.month, true)} ${b.year} (Due: ${Utils.formatCurrency(balance)})
            </option>`;
        }).join('');

    document.getElementById('bill-info').classList.add('d-none');
}

function updateBillInfo() {
    const billId = document.getElementById('payment-bill-select').value;
    const billInfoDiv = document.getElementById('bill-info');
    const amountInput = document.querySelector('#payment-form [name="amount"]');

    if (!billId) {
        billInfoDiv.classList.add('d-none');
        return;
    }

    const bill = billsData.find(b => b.id === billId);
    if (!bill) {
        billInfoDiv.classList.add('d-none');
        return;
    }

    const balance = bill.grandTotal - (bill.paidAmount || 0);

    document.getElementById('info-bill-amount').textContent = Utils.formatCurrency(bill.grandTotal);
    document.getElementById('info-paid-amount').textContent = Utils.formatCurrency(bill.paidAmount || 0);
    document.getElementById('info-balance').textContent = Utils.formatCurrency(balance);

    // Pre-fill amount with balance
    amountInput.value = balance.toFixed(2);

    billInfoDiv.classList.remove('d-none');
}

function openPaymentModal() {
    const form = document.getElementById('payment-form');
    form.reset();

    // Set today's date
    const now = new Date();
    form.paymentDate.value = now.toISOString().split('T')[0];

    document.getElementById('bill-info').classList.add('d-none');

    Utils.openModal('payment-modal');
}

async function savePayment() {
    const form = document.getElementById('payment-form');

    // Validate
    if (!form.flatId.value) {
        Utils.showToast('Please select a flat', 'error');
        return;
    }
    if (!form.amount.value || parseFloat(form.amount.value) <= 0) {
        Utils.showToast('Please enter a valid amount', 'error');
        return;
    }
    if (!form.paymentDate.value) {
        Utils.showToast('Please select payment date', 'error');
        return;
    }

    const currentUser = auth.getCurrentUser();
    const amount = parseFloat(form.amount.value);

    // Generate receipt number
    const now = new Date(form.paymentDate.value);
    const receiptCount = paymentsData.filter(p => {
        const d = new Date(p.paymentDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length + 1;

    const payment = {
        id: Utils.generateId(),
        receiptNo: Utils.generateReceiptNumber(now.getFullYear(), now.getMonth() + 1, receiptCount),
        flatId: form.flatId.value,
        billId: form.billId.value || null,
        amount: amount,
        paymentMode: form.paymentMode.value,
        referenceNo: form.referenceNo.value.trim(),
        paymentDate: new Date(form.paymentDate.value).toISOString(),
        receivedBy: currentUser ? currentUser.id : null,
        remarks: form.remarks.value.trim(),
        createdAt: new Date().toISOString()
    };

    Utils.showLoading('Saving payment...');

    try {
        // Add payment
        paymentsData.push(payment);
        await storage.savePayments(paymentsData);

        // Update bill if linked
        if (payment.billId) {
            const billIndex = billsData.findIndex(b => b.id === payment.billId);
            if (billIndex !== -1) {
                billsData[billIndex].paidAmount = (billsData[billIndex].paidAmount || 0) + amount;

                // Update status
                if (billsData[billIndex].paidAmount >= billsData[billIndex].grandTotal) {
                    billsData[billIndex].status = 'paid';
                } else {
                    billsData[billIndex].status = 'partial';
                }

                await storage.saveBills(billsData);
            }
        }

        filterPayments();
        closeModal('payment-modal');
        Utils.showToast('Payment recorded successfully', 'success');

        // Show receipt
        viewReceipt(payment.id);

    } catch (error) {
        console.error('Error saving payment:', error);
        Utils.showToast('Error saving payment', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function viewReceipt(paymentId) {
    const payment = paymentsData.find(p => p.id === paymentId);
    if (!payment) return;

    currentViewReceipt = payment;
    const flat = flatsData.find(f => f.id === payment.flatId);
    const bill = payment.billId ? billsData.find(b => b.id === payment.billId) : null;

    const modeLabels = {
        cash: 'Cash',
        cheque: 'Cheque',
        upi: 'UPI',
        bank_transfer: 'Bank Transfer'
    };

    const content = document.getElementById('receipt-content');
    content.innerHTML = `
        <div class="receipt-document" id="printable-receipt" style="padding: 1.5rem; border: 1px solid var(--gray-200); border-radius: var(--radius);">
            <div class="receipt-header text-center mb-4" style="border-bottom: 2px solid var(--gray-200); padding-bottom: 1rem;">
                <h4 style="color: var(--primary); margin-bottom: 0.25rem;">${Utils.escapeHtml(settings.societyName || 'Society Name')}</h4>
                <p class="text-muted mb-2" style="font-size: 0.8125rem;">${Utils.escapeHtml(settings.address || '')}</p>
                <h5>PAYMENT RECEIPT</h5>
            </div>

            <div class="receipt-body">
                <div class="d-flex justify-content-between mb-3">
                    <div>
                        <strong>Receipt No:</strong> ${payment.receiptNo}
                    </div>
                    <div>
                        <strong>Date:</strong> ${Utils.formatDate(payment.paymentDate)}
                    </div>
                </div>

                <div class="mb-3 p-3" style="background: var(--gray-50); border-radius: var(--radius);">
                    <div class="mb-2"><strong>Received From:</strong></div>
                    <div>Flat: ${flat ? Utils.escapeHtml(flat.flatNo) : '-'}</div>
                    <div>Owner: ${flat ? Utils.escapeHtml(flat.ownerName) : '-'}</div>
                </div>

                <div class="text-center p-4 mb-3" style="background: var(--success); color: white; border-radius: var(--radius);">
                    <div style="font-size: 0.875rem;">Amount Received</div>
                    <div style="font-size: 1.75rem; font-weight: 700; font-family: var(--font-mono);">${Utils.formatCurrency(payment.amount)}</div>
                </div>

                <table class="table" style="font-size: 0.875rem;">
                    <tr>
                        <td>Payment Mode</td>
                        <td class="text-right"><strong>${modeLabels[payment.paymentMode]}</strong></td>
                    </tr>
                    ${payment.referenceNo ? `
                        <tr>
                            <td>Reference No.</td>
                            <td class="text-right"><strong>${Utils.escapeHtml(payment.referenceNo)}</strong></td>
                        </tr>
                    ` : ''}
                    ${bill ? `
                        <tr>
                            <td>Against Bill</td>
                            <td class="text-right"><strong>${bill.billNo}</strong></td>
                        </tr>
                    ` : ''}
                    ${payment.remarks ? `
                        <tr>
                            <td>Remarks</td>
                            <td class="text-right">${Utils.escapeHtml(payment.remarks)}</td>
                        </tr>
                    ` : ''}
                </table>
            </div>

            <div class="receipt-footer text-center mt-4 pt-3" style="border-top: 1px dashed var(--gray-300);">
                <p class="text-muted mb-0" style="font-size: 0.75rem;">Thank you for your payment!</p>
                <p class="text-muted mb-0" style="font-size: 0.75rem;">This is a computer generated receipt.</p>
            </div>
        </div>
    `;

    Utils.openModal('receipt-modal');
}

function printCurrentReceipt() {
    if (!currentViewReceipt) return;
    Utils.printElement('printable-receipt');
}

async function deletePayment(paymentId) {
    const payment = paymentsData.find(p => p.id === paymentId);
    if (!payment) return;

    const confirmed = await Utils.showConfirm(
        `Are you sure you want to delete receipt "${payment.receiptNo}"? This will also update the linked bill.`,
        'Delete Payment'
    );

    if (!confirmed) return;

    Utils.showLoading('Deleting...');

    try {
        // Update bill if linked
        if (payment.billId) {
            const billIndex = billsData.findIndex(b => b.id === payment.billId);
            if (billIndex !== -1) {
                billsData[billIndex].paidAmount = Math.max(0, (billsData[billIndex].paidAmount || 0) - payment.amount);

                // Update status
                if (billsData[billIndex].paidAmount <= 0) {
                    billsData[billIndex].status = 'pending';
                } else if (billsData[billIndex].paidAmount < billsData[billIndex].grandTotal) {
                    billsData[billIndex].status = 'partial';
                }

                await storage.saveBills(billsData);
            }
        }

        // Delete payment
        paymentsData = paymentsData.filter(p => p.id !== paymentId);
        await storage.savePayments(paymentsData);

        filterPayments();
        Utils.showToast('Payment deleted successfully', 'success');

    } catch (error) {
        console.error('Error deleting payment:', error);
        Utils.showToast('Error deleting payment', 'error');
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
