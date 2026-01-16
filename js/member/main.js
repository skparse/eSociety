/**
 * Member Portal JavaScript
 */

let memberFlat = null;
let memberBills = [];
let memberPayments = [];
let masterData = {};
let settings = {};

async function initMemberPortal() {
    // Check authentication
    if (!auth.requireAuth('member')) {
        return false;
    }

    const user = auth.getCurrentUser();
    if (!user) {
        window.location.href = '../index.html';
        return false;
    }

    // Update user info in header
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-avatar').textContent = Utils.getInitials(user.name);

    // Display society name
    const societyName = auth.getSocietyName();
    const societyNameEl = document.getElementById('society-name');
    if (societyName && societyNameEl) {
        societyNameEl.textContent = societyName;
    }

    Utils.showLoading('Loading...');

    try {
        // Load all data
        const [flatsData, billsData, paymentsData, masterDataRes, settingsRes] = await Promise.all([
            storage.getFlats(),
            storage.getBills(),
            storage.getPayments(),
            storage.getMasterData(),
            storage.getSettings()
        ]);

        masterData = masterDataRes;
        settings = settingsRes;

        // Find member's flat
        if (user.flatId) {
            memberFlat = flatsData.find(f => f.id === user.flatId);

            if (memberFlat) {
                document.getElementById('user-flat').textContent = `Flat ${memberFlat.flatNo}`;

                // Filter bills and payments for this flat
                memberBills = billsData.filter(b => b.flatId === memberFlat.id);
                memberPayments = paymentsData.filter(p => p.flatId === memberFlat.id);
            }
        }

        if (!memberFlat) {
            document.getElementById('user-flat').textContent = 'No flat linked';
        }

        return true;
    } catch (error) {
        console.error('Error initializing member portal:', error);
        Utils.showToast('Error loading data', 'error');
        return false;
    } finally {
        Utils.hideLoading();
    }
}

function toggleMobileNav() {
    const nav = document.querySelector('.member-mobile-nav');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
}

function handleLogout() {
    auth.logout();
    window.location.href = '../index.html';
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initMemberPortal, memberFlat, memberBills, memberPayments, masterData, settings };
}
