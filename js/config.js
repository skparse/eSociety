/**
 * Society Maintenance Billing System
 * Configuration File - Multi-Tenant Version
 *
 * SETUP INSTRUCTIONS:
 * 1. Deploy the Google Apps Script (see google-apps-script.js)
 * 2. Copy the Web App URL after deployment
 * 3. Paste the URL below in WEB_APP_URL
 * 4. That's it! No more per-browser setup needed.
 */

const CONFIG = {
    // Google Apps Script Configuration
    GOOGLE_SCRIPT: {
        // IMPORTANT: Paste your deployed Google Apps Script Web App URL here
        // Example: 'https://script.google.com/macros/s/AKfycbx.../exec'
        WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbysAzQEfpPtdh-gtkSfWvbR7m2NmL2ji54yYC0YCrXXM3Qtiwx0PZumNZ8doSj6AiSh/exec'
    },

    // Application Settings
    APP: {
        NAME: 'Society Maintenance',
        VERSION: '2.0.0',  // Multi-tenant version
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
        CURRENCY: '₹',
        CURRENCY_CODE: 'INR',
        DATE_FORMAT: 'DD/MM/YYYY'
    },

    // Superadmin Settings
    SUPERADMIN: {
        USERNAME: 'superadmin',
        // Default password: 'password' - CHANGE THIS in google-apps-script.js!
    },

    // Bill Settings
    BILLING: {
        BILL_PREFIX: 'BILL',
        RECEIPT_PREFIX: 'RCP',
        DUE_DAYS: 15,
        LATE_FEE_PERCENT: 2
    },

    // Storage Keys (for localStorage)
    STORAGE_KEYS: {
        SESSION: 'society_session',
        USER: 'society_user',
        SOCIETY_ID: 'society_id',
        SOCIETY_NAME: 'society_name',
        CACHE_PREFIX: 'society_cache_',
        CACHE_TIMESTAMP: 'society_cache_ts_'
    },

    // Cache Settings
    CACHE: {
        ENABLED: true,
        TTL: 5 * 60 * 1000 // 5 minutes cache TTL
    },

    // Sheet Names (must match Apps Script)
    SHEETS: {
        SETTINGS: 'Settings',
        MASTER_DATA: 'MasterData',
        USERS: 'Users',
        FLATS: 'Flats',
        BILLS: 'Bills',
        PAYMENTS: 'Payments'
    }
};

// Initial Data Templates
const INITIAL_DATA = {
    settings: {
        societyName: 'My Society',
        address: '',
        registrationNo: '',
        phone: '',
        email: '',
        billingDay: 1,
        dueDays: 15,
        lateFeePercent: 2,
        logo: ''
    },

    masterData: {
        buildings: [],
        flatTypes: [
            { id: 'ft-1', name: '1 BHK', defaultArea: 450, isActive: true },
            { id: 'ft-2', name: '2 BHK', defaultArea: 750, isActive: true },
            { id: 'ft-3', name: '3 BHK', defaultArea: 1100, isActive: true },
            { id: 'ft-4', name: 'Shop', defaultArea: 200, isActive: true }
        ],
        chargeTypes: [
            { id: 'ct-1', name: 'Maintenance', calculationType: 'per_sqft', defaultAmount: 3, isMonthly: true, isActive: true },
            { id: 'ct-2', name: 'Sinking Fund', calculationType: 'per_sqft', defaultAmount: 0.5, isMonthly: true, isActive: true },
            { id: 'ct-3', name: 'Water Charges', calculationType: 'fixed', defaultAmount: 200, isMonthly: true, isActive: true },
            { id: 'ct-4', name: 'Parking - 2 Wheeler', calculationType: 'per_vehicle', defaultAmount: 100, isMonthly: true, isActive: true, vehicleType: '2wheeler' },
            { id: 'ct-5', name: 'Parking - 4 Wheeler', calculationType: 'per_vehicle', defaultAmount: 500, isMonthly: true, isActive: true, vehicleType: '4wheeler' }
        ]
    },

    users: [],
    flats: [],
    bills: [],
    payments: []
};

// Helper to check if Google Script is configured
function isGoogleScriptConfigured() {
    const url = CONFIG.GOOGLE_SCRIPT.WEB_APP_URL;
    return url && url.length > 0 && url.includes('script.google.com');
}

// Helper to get current society ID from session
function getCurrentSocietyId() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.SOCIETY_ID);
}

// Helper to get current society name
function getCurrentSocietyName() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.SOCIETY_NAME);
}

// Helper to set current society
function setCurrentSociety(societyId, societyName) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SOCIETY_ID, societyId);
    if (societyName) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.SOCIETY_NAME, societyName);
    }
}

// Helper to clear current society
function clearCurrentSociety() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SOCIETY_ID);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SOCIETY_NAME);
}

// Check if user is superadmin
function isSuperadminSession() {
    const session = localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION);
    if (!session) return false;
    try {
        const parsed = JSON.parse(session);
        return parsed.role === 'superadmin';
    } catch (e) {
        return false;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        INITIAL_DATA,
        isGoogleScriptConfigured,
        getCurrentSocietyId,
        getCurrentSocietyName,
        setCurrentSociety,
        clearCurrentSociety,
        isSuperadminSession
    };
}
