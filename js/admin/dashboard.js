/**
 * Admin Dashboard JavaScript
 */

// Global data holders
let flatsData = [];
let usersData = [];
let billsData = [];
let paymentsData = [];
let masterData = {};
let settings = {};

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!auth.requireAuth('admin')) {
        return;
    }

    // Set current date
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

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

    // Load dashboard data
    await loadDashboardData();
});

async function loadDashboardData() {
    Utils.showLoading('Loading dashboard...');

    try {
        // Load all data in parallel
        [flatsData, usersData, billsData, paymentsData, masterData, settings] = await Promise.all([
            storage.getFlats(),
            storage.getUsers(),
            storage.getBills(),
            storage.getPayments(),
            storage.getMasterData(),
            storage.getSettings()
        ]);

        // Update stats
        updateStats();

        // Update outstanding summary
        updateOutstandingSummary();

        // Update recent activities
        updateRecentPayments();
        updateRecentBills();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        Utils.showToast('Error loading dashboard data', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function updateStats() {
    // Total flats
    const activeFlats = flatsData.filter(f => f.isActive !== false);
    document.getElementById('stat-flats').textContent = activeFlats.length;

    // Active members
    const activeMembers = usersData.filter(u => u.role === 'member' && u.isActive);
    document.getElementById('stat-members').textContent = activeMembers.length;

    // Pending bills
    const pendingBills = billsData.filter(b => b.status !== 'paid');
    document.getElementById('stat-pending-bills').textContent = pendingBills.length;

    // Total outstanding
    const totalOutstanding = calculateTotalOutstanding();
    document.getElementById('stat-outstanding').textContent = Utils.formatCurrency(totalOutstanding);
}

function calculateTotalOutstanding() {
    let total = 0;

    billsData.forEach(bill => {
        if (bill.status !== 'paid') {
            total += (bill.grandTotal - (bill.paidAmount || 0));
        }
    });

    return total;
}

function updateOutstandingSummary() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let totalOutstanding = 0;
    let currentMonthOutstanding = 0;
    let overdueAmount = 0;

    billsData.forEach(bill => {
        if (bill.status !== 'paid') {
            const remaining = bill.grandTotal - (bill.paidAmount || 0);
            totalOutstanding += remaining;

            if (bill.month === currentMonth && bill.year === currentYear) {
                currentMonthOutstanding += remaining;
            }

            if (Utils.isOverdue(bill.dueDate)) {
                overdueAmount += remaining;
            }
        }
    });

    document.getElementById('summary-total').textContent = Utils.formatCurrency(totalOutstanding);
    document.getElementById('summary-current').textContent = Utils.formatCurrency(currentMonthOutstanding);
    document.getElementById('summary-overdue').textContent = Utils.formatCurrency(overdueAmount);
}

function updateRecentPayments() {
    const container = document.getElementById('recent-payments');

    // Sort by date descending and get last 5
    const recentPayments = Utils.sortBy(paymentsData, 'paymentDate', 'desc').slice(0, 5);

    if (recentPayments.length === 0) {
        container.innerHTML = `
            <li class="empty-state" style="padding: 1rem;">
                <p class="text-muted text-center">No payments recorded yet</p>
            </li>
        `;
        return;
    }

    container.innerHTML = recentPayments.map(payment => {
        const flat = flatsData.find(f => f.id === payment.flatId);
        const flatNo = flat ? flat.flatNo : 'Unknown';

        return `
            <li class="activity-item">
                <div class="activity-icon payment">💰</div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${flatNo}</strong> paid <strong>${Utils.formatCurrency(payment.amount)}</strong>
                    </div>
                    <div class="activity-time">${Utils.formatDate(payment.paymentDate)} via ${payment.paymentMode}</div>
                </div>
            </li>
        `;
    }).join('');
}

function updateRecentBills() {
    const container = document.getElementById('recent-bills');

    // Sort by generated date descending and get last 5
    const recentBills = Utils.sortBy(billsData, 'generatedAt', 'desc').slice(0, 5);

    if (recentBills.length === 0) {
        container.innerHTML = `
            <li class="empty-state" style="padding: 1rem;">
                <p class="text-muted text-center">No bills generated yet</p>
            </li>
        `;
        return;
    }

    container.innerHTML = recentBills.map(bill => {
        const flat = flatsData.find(f => f.id === bill.flatId);
        const flatNo = flat ? flat.flatNo : 'Unknown';
        const statusClass = Utils.getBillStatusClass(bill.status);

        return `
            <li class="activity-item">
                <div class="activity-icon bill">📄</div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${flatNo}</strong> - ${Utils.getMonthName(bill.month)} ${bill.year}
                        <span class="badge ${statusClass} ml-2">${bill.status}</span>
                    </div>
                    <div class="activity-time">${Utils.formatCurrency(bill.grandTotal)}</div>
                </div>
            </li>
        `;
    }).join('');
}

// Sidebar toggle for mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

// Logout handler
function handleLogout() {
    auth.logout();
    window.location.href = '../index.html';
}

// Close sidebar on window resize if open
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('show');
    }
});
