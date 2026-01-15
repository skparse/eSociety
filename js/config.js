/**
 * Society Maintenance Billing System
 * Configuration File
 *
 * SETUP INSTRUCTIONS:
 * 1. Deploy the Google Apps Script (see google-apps-script.js)
 * 2. Copy the Web App URL after deployment
 * 3. Open setup.html and enter the URL to initialize
 * OR
 * 4. Replace 'YOUR_APPS_SCRIPT_URL' below with your Web App URL
 */

const CONFIG = {
    // Google Apps Script Configuration
    GOOGLE_SCRIPT: {
        // Replace with your deployed Google Apps Script Web App URL
        // Example: 'https://script.google.com/macros/s/XXXXX/exec'
        WEB_APP_URL: ''
    },

    // Application Settings
    APP: {
        NAME: 'Society Maintenance',
        VERSION: '1.1.0',
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
        CURRENCY: '₹',
        CURRENCY_CODE: 'INR',
        DATE_FORMAT: 'DD/MM/YYYY',

        // Default admin credentials (change after first login)
        DEFAULT_ADMIN: {
            username: 'admin',
            password: 'admin123', // This will be hashed
            name: 'Administrator',
            email: 'admin@society.com'
        }
    },

    // Bill Settings
    BILLING: {
        BILL_PREFIX: 'BILL',
        RECEIPT_PREFIX: 'RCP',
        DUE_DAYS: 15, // Days after bill generation
        LATE_FEE_PERCENT: 2 // Late fee percentage per month
    },

    // Storage Keys (for localStorage)
    STORAGE_KEYS: {
        SESSION: 'society_session',
        USER: 'society_user',
        SCRIPT_URL: 'society_script_url',
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

// Helper to get stored Script URL
function getStoredScriptUrl() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.SCRIPT_URL);
}

// Helper to save Script URL
function saveScriptUrl(url) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SCRIPT_URL, url);
    CONFIG.GOOGLE_SCRIPT.WEB_APP_URL = url;
}

// Initialize Script URL from storage
(function initializeConfig() {
    const storedUrl = getStoredScriptUrl();
    if (storedUrl) {
        CONFIG.GOOGLE_SCRIPT.WEB_APP_URL = storedUrl;
    }
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, INITIAL_DATA, isGoogleScriptConfigured, getStoredScriptUrl, saveScriptUrl };
}
