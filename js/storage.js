/**
 * Society Maintenance Billing System
 * Storage Module - Google Apps Script Integration
 */

class Storage {
    constructor() {
        this.sheets = CONFIG.SHEETS;
    }

    /**
     * Get the Web App URL
     */
    get webAppUrl() {
        return CONFIG.GOOGLE_SCRIPT.WEB_APP_URL;
    }

    /**
     * Set the Web App URL
     */
    set webAppUrl(value) {
        CONFIG.GOOGLE_SCRIPT.WEB_APP_URL = value;
    }

    /**
     * Make API call to Google Apps Script
     * Google Apps Script Web Apps use redirects, so we need special handling
     */
    async apiCall(action, sheet = null, data = null) {
        if (!this.webAppUrl) {
            throw new Error('Google Apps Script URL not configured');
        }

        let url = `${this.webAppUrl}?action=${action}`;
        if (sheet) {
            url += `&sheet=${sheet}`;
        }

        const options = {
            method: data ? 'POST' : 'GET',
            redirect: 'follow'
        };

        // For POST requests, send data as text/plain to avoid CORS preflight
        // Google Apps Script can still parse JSON from the body
        if (data) {
            options.headers = {
                'Content-Type': 'text/plain;charset=utf-8'
            };
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();

            // Try to parse as JSON
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse response:', text);
                throw new Error('Invalid response from server');
            }

            if (!result.success) {
                throw new Error(result.error || 'API call failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Read data from a sheet
     */
    async readSheet(sheetName) {
        // Check cache first
        if (CONFIG.CACHE.ENABLED) {
            const cached = this.getFromCache(sheetName);
            if (cached) {
                return cached;
            }
        }

        const result = await this.apiCall('read', sheetName);
        const data = result.data;

        // Cache the data
        if (CONFIG.CACHE.ENABLED) {
            this.saveToCache(sheetName, data);
        }

        return data;
    }

    /**
     * Write data to a sheet
     */
    async writeSheet(sheetName, data) {
        const result = await this.apiCall('write', sheetName, data);

        // Invalidate cache
        this.invalidateCache(sheetName);

        return result;
    }

    /**
     * Initialize the system
     */
    async initializeSystem(adminPassword = 'admin123') {
        const result = await this.apiCall('init', null, { adminPassword });
        return result;
    }

    /**
     * Get system status
     */
    async getStatus() {
        const result = await this.apiCall('status');
        return result;
    }

    /**
     * Cache management
     */
    getFromCache(sheetName) {
        const key = CONFIG.STORAGE_KEYS.CACHE_PREFIX + sheetName;
        const timestampKey = CONFIG.STORAGE_KEYS.CACHE_TIMESTAMP + sheetName;

        const timestamp = localStorage.getItem(timestampKey);
        if (!timestamp) return null;

        const age = Date.now() - parseInt(timestamp);
        if (age > CONFIG.CACHE.TTL) {
            this.invalidateCache(sheetName);
            return null;
        }

        const cached = localStorage.getItem(key);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    saveToCache(sheetName, data) {
        const key = CONFIG.STORAGE_KEYS.CACHE_PREFIX + sheetName;
        const timestampKey = CONFIG.STORAGE_KEYS.CACHE_TIMESTAMP + sheetName;

        try {
            localStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem(timestampKey, Date.now().toString());
        } catch (e) {
            console.warn('Cache storage failed:', e);
        }
    }

    invalidateCache(sheetName) {
        const key = CONFIG.STORAGE_KEYS.CACHE_PREFIX + sheetName;
        const timestampKey = CONFIG.STORAGE_KEYS.CACHE_TIMESTAMP + sheetName;

        localStorage.removeItem(key);
        localStorage.removeItem(timestampKey);
    }

    invalidateAllCache() {
        Object.values(this.sheets).forEach(sheetName => {
            this.invalidateCache(sheetName);
        });
    }

    // ==================== Data Access Methods ====================

    /**
     * Get society settings
     */
    async getSettings() {
        try {
            const data = await this.readSheet(this.sheets.SETTINGS);
            return data || INITIAL_DATA.settings;
        } catch (error) {
            console.error('Error getting settings:', error);
            return INITIAL_DATA.settings;
        }
    }

    /**
     * Save society settings
     */
    async saveSettings(settings) {
        return await this.writeSheet(this.sheets.SETTINGS, settings);
    }

    /**
     * Get master data (buildings, flat types, charge types)
     */
    async getMasterData() {
        try {
            const data = await this.readSheet(this.sheets.MASTER_DATA);
            return data || INITIAL_DATA.masterData;
        } catch (error) {
            console.error('Error getting master data:', error);
            return INITIAL_DATA.masterData;
        }
    }

    /**
     * Save master data
     */
    async saveMasterData(masterData) {
        return await this.writeSheet(this.sheets.MASTER_DATA, masterData);
    }

    /**
     * Get all users
     */
    async getUsers() {
        try {
            const data = await this.readSheet(this.sheets.USERS);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }

    /**
     * Save users
     */
    async saveUsers(users) {
        return await this.writeSheet(this.sheets.USERS, users);
    }

    /**
     * Get all flats
     */
    async getFlats() {
        try {
            const data = await this.readSheet(this.sheets.FLATS);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error getting flats:', error);
            return [];
        }
    }

    /**
     * Save flats
     */
    async saveFlats(flats) {
        return await this.writeSheet(this.sheets.FLATS, flats);
    }

    /**
     * Get all bills
     */
    async getBills() {
        try {
            const data = await this.readSheet(this.sheets.BILLS);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error getting bills:', error);
            return [];
        }
    }

    /**
     * Save bills
     */
    async saveBills(bills) {
        return await this.writeSheet(this.sheets.BILLS, bills);
    }

    /**
     * Get all payments
     */
    async getPayments() {
        try {
            const data = await this.readSheet(this.sheets.PAYMENTS);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error getting payments:', error);
            return [];
        }
    }

    /**
     * Save payments
     */
    async savePayments(payments) {
        return await this.writeSheet(this.sheets.PAYMENTS, payments);
    }

    /**
     * Check if system is configured
     */
    isConfigured() {
        return isGoogleScriptConfigured();
    }
}

// Create global storage instance
const storage = new Storage();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Storage, storage };
}
