/**
 * Expenses Management JavaScript
 */

let expensesData = [];
let settings = {};
let filteredExpenses = [];
let expenseToDelete = null;
let currentReceiptFile = null; // Store the selected receipt file

// Current Financial Year bounds
let currentFY = {
    start: null,
    end: null,
    startYear: null
};

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

    // Calculate current financial year
    calculateCurrentFY();

    // Set default date filter (current financial year - April to March)
    setDefaultDateFilter();

    // Populate category dropdowns
    populateCategoryDropdowns();

    // Load data
    await loadData();
});

function calculateCurrentFY() {
    const now = new Date();
    // Financial year starts in April (month index 3)
    if (now.getMonth() >= 3) { // April (3) or later
        currentFY.start = new Date(now.getFullYear(), 3, 1); // April 1st current year
        currentFY.end = new Date(now.getFullYear() + 1, 2, 31); // March 31st next year
        currentFY.startYear = now.getFullYear();
    } else {
        currentFY.start = new Date(now.getFullYear() - 1, 3, 1); // April 1st previous year
        currentFY.end = new Date(now.getFullYear(), 2, 31); // March 31st current year
        currentFY.startYear = now.getFullYear() - 1;
    }
}

function setDefaultDateFilter() {
    document.getElementById('filter-from-date').value = currentFY.start.toISOString().split('T')[0];
    document.getElementById('filter-to-date').value = currentFY.end.toISOString().split('T')[0];
}

function populateCategoryDropdowns() {
    const categories = CONFIG.EXPENSE_CATEGORIES || [];
    const categoryOptions = categories.map(c =>
        `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`
    ).join('');

    // Filter dropdown
    document.getElementById('filter-category').innerHTML =
        '<option value="">All Categories</option>' + categoryOptions;

    // Modal dropdown
    document.getElementById('expense-category').innerHTML =
        '<option value="">Select Category</option>' + categoryOptions;
}

async function loadData() {
    Utils.showLoading('Loading expenses...');

    try {
        [expensesData, settings] = await Promise.all([
            storage.getExpenses(),
            storage.getSettings()
        ]);

        // Render table
        filterExpenses();

    } catch (error) {
        console.error('Error loading data:', error);
        Utils.showToast('Error loading data', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function filterExpenses() {
    const fromDate = document.getElementById('filter-from-date').value;
    const toDate = document.getElementById('filter-to-date').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const searchFilter = document.getElementById('filter-search').value.toLowerCase();

    filteredExpenses = expensesData.filter(expense => {
        const expenseDate = expense.date.split('T')[0];

        const matchesFrom = !fromDate || expenseDate >= fromDate;
        const matchesTo = !toDate || expenseDate <= toDate;
        const matchesCategory = !categoryFilter || expense.category === categoryFilter;
        const matchesSearch = !searchFilter ||
            (expense.description && expense.description.toLowerCase().includes(searchFilter)) ||
            (expense.paidTo && expense.paidTo.toLowerCase().includes(searchFilter));

        return matchesFrom && matchesTo && matchesCategory && matchesSearch;
    });

    // Sort by date descending
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update summary
    updateSummary();

    // Render table
    renderExpensesTable();
}

function updateSummary() {
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    document.getElementById('stat-total-expenses').textContent = Utils.formatCurrency(totalExpenses);
    document.getElementById('stat-expense-count').textContent = filteredExpenses.length;
}

function getCategoryName(categoryId) {
    const categories = CONFIG.EXPENSE_CATEGORIES || [];
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
}

function renderExpensesTable() {
    const tbody = document.getElementById('expenses-table-body');

    if (filteredExpenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted" style="padding: 2rem;">
                    ${expensesData.length === 0 ? 'No expenses recorded yet.' : 'No expenses match your filter criteria.'}
                </td>
            </tr>
        `;
        return;
    }

    const modeLabels = {
        cash: 'Cash',
        cheque: 'Cheque',
        upi: 'UPI',
        bank_transfer: 'Bank Transfer'
    };

    tbody.innerHTML = filteredExpenses.map(expense => {
        const hasReceipt = expense.receiptImageUrl || expense.receiptImageId;
        return `
            <tr>
                <td>${Utils.formatDate(expense.date)}</td>
                <td><span class="badge badge-outline">${Utils.escapeHtml(getCategoryName(expense.category))}</span></td>
                <td>${Utils.escapeHtml(expense.description || '-')}</td>
                <td>${Utils.escapeHtml(expense.paidTo || '-')}</td>
                <td class="amount text-danger">${Utils.formatCurrency(expense.amount)}</td>
                <td>
                    ${Utils.escapeHtml(expense.receiptNumber || '-')}
                    ${hasReceipt ? '<br><a href="' + expense.receiptImageUrl + '" target="_blank" class="text-primary" style="font-size:0.75rem;">📎 View</a>' : ''}
                </td>
                <td>${modeLabels[expense.paymentMode] || expense.paymentMode}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="editExpense('${expense.id}')">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense('${expense.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function openExpenseModal(expenseId = null) {
    const form = document.getElementById('expense-form');
    form.reset();
    currentReceiptFile = null;

    // Reset receipt preview
    document.getElementById('receipt-preview').style.display = 'none';
    document.getElementById('receipt-preview-img').src = '';
    document.getElementById('existing-receipt').style.display = 'none';
    document.getElementById('expense-receipt-image').value = '';

    // Set date constraints to current FY (April 1 - March 31)
    const dateInput = document.getElementById('expense-date');
    dateInput.min = currentFY.start.toISOString().split('T')[0];
    dateInput.max = currentFY.end.toISOString().split('T')[0];

    // Update FY hint
    const fyHint = document.getElementById('fy-date-hint');
    fyHint.textContent = `Date must be within FY ${currentFY.startYear}-${currentFY.startYear + 1}: 1 Apr ${currentFY.startYear} - 31 Mar ${currentFY.startYear + 1}`;

    const modalTitle = document.getElementById('expense-modal-title');

    if (expenseId) {
        // Edit mode
        const expense = expensesData.find(e => e.id === expenseId);
        if (!expense) return;

        modalTitle.textContent = 'Edit Expense';
        document.getElementById('expense-id').value = expense.id;
        document.getElementById('expense-date').value = expense.date.split('T')[0];
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-description').value = expense.description || '';
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-paid-to').value = expense.paidTo || '';
        document.getElementById('expense-payment-mode').value = expense.paymentMode || 'cash';
        document.getElementById('expense-receipt-number').value = expense.receiptNumber || '';
        document.getElementById('expense-notes').value = expense.notes || '';

        // Show existing receipt if available
        if (expense.receiptImageUrl) {
            document.getElementById('existing-receipt').style.display = 'block';
            document.getElementById('existing-receipt-link').href = expense.receiptImageUrl;
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add Expense';
        document.getElementById('expense-id').value = '';

        // Set today's date (if within FY, else set to FY start)
        const now = new Date();
        let defaultDate = now;
        if (now < currentFY.start) {
            defaultDate = currentFY.start;
        } else if (now > currentFY.end) {
            defaultDate = currentFY.end;
        }
        document.getElementById('expense-date').value = defaultDate.toISOString().split('T')[0];
    }

    Utils.openModal('expense-modal');
}

function editExpense(expenseId) {
    openExpenseModal(expenseId);
}

// Handle receipt image file selection
function handleReceiptImageChange(input) {
    const file = input.files[0];
    if (!file) {
        currentReceiptFile = null;
        document.getElementById('receipt-preview').style.display = 'none';
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        Utils.showToast('Please select an image file (JPG, PNG)', 'error');
        input.value = '';
        currentReceiptFile = null;
        return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        Utils.showToast('Image size must be less than 5MB', 'error');
        input.value = '';
        currentReceiptFile = null;
        return;
    }

    currentReceiptFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('receipt-preview-img').src = e.target.result;
        document.getElementById('receipt-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removeReceiptImage() {
    currentReceiptFile = null;
    document.getElementById('expense-receipt-image').value = '';
    document.getElementById('receipt-preview').style.display = 'none';
    document.getElementById('receipt-preview-img').src = '';
}

// Validate date is within FY (April 1 - March 31)
function isDateWithinFY(dateStr) {
    const date = new Date(dateStr);
    return date >= currentFY.start && date <= currentFY.end;
}

// Get FY folder name for a given date
function getFYFolderName(dateStr) {
    const date = new Date(dateStr);
    let fyStartYear;
    if (date.getMonth() >= 3) { // April or later
        fyStartYear = date.getFullYear();
    } else {
        fyStartYear = date.getFullYear() - 1;
    }
    return `FY${fyStartYear}-${fyStartYear + 1}`;
}

async function saveExpense() {
    const form = document.getElementById('expense-form');

    // Validate required fields
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const paymentMode = document.getElementById('expense-payment-mode').value;

    if (!date) {
        Utils.showToast('Please select a date', 'error');
        return;
    }

    // Validate date is within FY
    if (!isDateWithinFY(date)) {
        Utils.showToast(`Date must be within FY ${currentFY.startYear}-${currentFY.startYear + 1} (1 Apr - 31 Mar)`, 'error');
        return;
    }

    if (!category) {
        Utils.showToast('Please select a category', 'error');
        return;
    }
    if (!description) {
        Utils.showToast('Please enter a description', 'error');
        return;
    }
    if (!amount || amount <= 0) {
        Utils.showToast('Please enter a valid amount', 'error');
        return;
    }

    const currentUser = auth.getCurrentUser();
    const expenseId = document.getElementById('expense-id').value;
    const isEdit = !!expenseId;

    const expenseData = {
        id: isEdit ? expenseId : Utils.generateId('exp'),
        date: new Date(date).toISOString(),
        category: category,
        description: description,
        amount: amount,
        paidTo: document.getElementById('expense-paid-to').value.trim(),
        receiptNumber: document.getElementById('expense-receipt-number').value.trim(),
        paymentMode: paymentMode,
        notes: document.getElementById('expense-notes').value.trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser ? currentUser.id : null
    };

    if (!isEdit) {
        expenseData.createdAt = new Date().toISOString();
        expenseData.createdBy = currentUser ? currentUser.id : null;
    }

    Utils.showLoading(isEdit ? 'Updating expense...' : 'Saving expense...');

    try {
        // Upload receipt image if selected
        if (currentReceiptFile) {
            Utils.showLoading('Uploading receipt image...');

            const fyFolder = getFYFolderName(date);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `receipt_${timestamp}_${currentReceiptFile.name}`;

            try {
                const uploadResult = await storage.uploadExpenseReceipt(
                    currentReceiptFile,
                    fyFolder,
                    fileName
                );

                if (uploadResult.success) {
                    expenseData.receiptImageUrl = uploadResult.fileUrl;
                    expenseData.receiptImageId = uploadResult.fileId;
                    expenseData.receiptFileName = fileName;
                } else {
                    console.warn('Receipt upload failed:', uploadResult.error);
                    Utils.showToast('Receipt upload failed, saving expense without image', 'warning');
                }
            } catch (uploadError) {
                console.warn('Receipt upload error:', uploadError);
                Utils.showToast('Receipt upload failed, saving expense without image', 'warning');
            }
        }

        Utils.showLoading(isEdit ? 'Updating expense...' : 'Saving expense...');

        if (isEdit) {
            // Update existing expense
            const index = expensesData.findIndex(e => e.id === expenseId);
            if (index !== -1) {
                // Preserve original created info and existing receipt if not replaced
                expenseData.createdAt = expensesData[index].createdAt;
                expenseData.createdBy = expensesData[index].createdBy;

                // Keep existing receipt if no new one uploaded
                if (!currentReceiptFile && expensesData[index].receiptImageUrl) {
                    expenseData.receiptImageUrl = expensesData[index].receiptImageUrl;
                    expenseData.receiptImageId = expensesData[index].receiptImageId;
                    expenseData.receiptFileName = expensesData[index].receiptFileName;
                }

                expensesData[index] = expenseData;
            }
        } else {
            // Add new expense
            expensesData.push(expenseData);
        }

        await storage.saveExpenses(expensesData);

        filterExpenses();
        closeModal('expense-modal');
        Utils.showToast(isEdit ? 'Expense updated successfully' : 'Expense added successfully', 'success');

    } catch (error) {
        console.error('Error saving expense:', error);
        Utils.showToast('Error saving expense', 'error');
    } finally {
        Utils.hideLoading();
        currentReceiptFile = null;
    }
}

function deleteExpense(expenseId) {
    const expense = expensesData.find(e => e.id === expenseId);
    if (!expense) return;

    expenseToDelete = expense;
    document.getElementById('delete-expense-info').textContent =
        `${Utils.formatDate(expense.date)} - ${Utils.escapeHtml(expense.description)} - ${Utils.formatCurrency(expense.amount)}`;

    Utils.openModal('delete-modal');
}

async function confirmDeleteExpense() {
    if (!expenseToDelete) return;

    Utils.showLoading('Deleting...');

    try {
        expensesData = expensesData.filter(e => e.id !== expenseToDelete.id);
        await storage.saveExpenses(expensesData);

        filterExpenses();
        closeModal('delete-modal');
        Utils.showToast('Expense deleted successfully', 'success');

    } catch (error) {
        console.error('Error deleting expense:', error);
        Utils.showToast('Error deleting expense', 'error');
    } finally {
        Utils.hideLoading();
        expenseToDelete = null;
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
