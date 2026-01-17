/**
 * Society Maintenance Billing System
 * Storage Module - Google Apps Script Integration (Multi-Tenant)
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
     * Get current society ID
     */
    get societyId() {
        return getCurrentSocietyId();
    }

    /**
     * Make API call to Google Apps Script
     * Automatically includes societyId for society-specific operations
     */
    async apiCall(action, sheet = null, data = null, includeSocietyId = true) {
        if (!this.webAppUrl) {
            throw new Error('Google Apps Script URL not configured. Please check config.js');
        }

        let url = `${this.webAppUrl}?action=${action}`;

        // Include societyId for society-specific operations
        if (includeSocietyId && this.societyId) {
            url += `&societyId=${encodeURIComponent(this.societyId)}`;
        }

        if (sheet) {
            url += `&sheet=${encodeURIComponent(sheet)}`;
        }

        const options = {
            method: data ? 'POST' : 'GET',
            redirect: 'follow'
        };

        if (data) {
            options.headers = {
                'Content-Type': 'text/plain;charset=utf-8'
            };
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();

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

    // ==================== SUPERADMIN API METHODS ====================

    /**
     * Superadmin login
     */
    async superadminLogin(username, password) {
        return await this.apiCall('superadminLogin', null, { username, password }, false);
    }

    /**
     * Create a new society (superadmin only)
     */
    async createSociety(societyCode, societyName, adminPassword) {
        return await this.apiCall('createSociety', null, {
            societyCode,
            societyName,
            adminPassword
        }, false);
    }

    /**
     * List all societies (superadmin only)
     */
    async listSocieties() {
        return await this.apiCall('listSocieties', null, null, false);
    }

    /**
     * Delete a society (superadmin only)
     */
    async deleteSociety(societyId) {
        const url = `${this.webAppUrl}?action=deleteSociety&societyId=${encodeURIComponent(societyId)}`;
        const response = await fetch(url, { method: 'GET', redirect: 'follow' });
        const text = await response.text();
        return JSON.parse(text);
    }

    /**
     * Validate if a society exists
     */
    async validateSociety(societyId) {
        const url = `${this.webAppUrl}?action=validateSociety&societyId=${encodeURIComponent(societyId)}`;
        const response = await fetch(url, { method: 'GET', redirect: 'follow' });
        const text = await response.text();
        return JSON.parse(text);
    }

    /**
     * Get society info
     */
    async getSocietyInfo(societyId) {
        const url = `${this.webAppUrl}?action=getSocietyInfo&societyId=${encodeURIComponent(societyId)}`;
        const response = await fetch(url, { method: 'GET', redirect: 'follow' });
        const text = await response.text();
        return JSON.parse(text);
    }

    // ==================== SOCIETY DATA METHODS ====================

    /**
     * Read data from a sheet
     */
    async readSheet(sheetName) {
        if (!this.societyId) {
            throw new Error('No society selected');
        }

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
        if (!this.societyId) {
            throw new Error('No society selected');
        }

        const result = await this.apiCall('write', sheetName, data);

        // Invalidate cache
        this.invalidateCache(sheetName);

        return result;
    }

    /**
     * Get system status for current society
     */
    async getStatus() {
        if (!this.societyId) {
            throw new Error('No society selected');
        }
        return await this.apiCall('status');
    }

    /**
     * Initialize society data
     */
    async initializeSystem(adminPassword) {
        if (!this.societyId) {
            throw new Error('No society selected');
        }
        if (!adminPassword || adminPassword.length < 6) {
            throw new Error('Admin password is required (min 6 characters)');
        }
        return await this.apiCall('init', null, { adminPassword });
    }

    // ==================== CACHE MANAGEMENT ====================

    /**
     * Get cache key with society prefix
     */
    getCacheKey(sheetName) {
        return CONFIG.STORAGE_KEYS.CACHE_PREFIX + (this.societyId || '') + '_' + sheetName;
    }

    getFromCache(sheetName) {
        const key = this.getCacheKey(sheetName);
        const timestampKey = key + '_ts';

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
        const key = this.getCacheKey(sheetName);
        const timestampKey = key + '_ts';

        try {
            localStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem(timestampKey, Date.now().toString());
        } catch (e) {
            console.warn('Cache storage failed:', e);
        }
    }

    invalidateCache(sheetName) {
        const key = this.getCacheKey(sheetName);
        const timestampKey = key + '_ts';

        localStorage.removeItem(key);
        localStorage.removeItem(timestampKey);
    }

    invalidateAllCache() {
        Object.values(this.sheets).forEach(sheetName => {
            this.invalidateCache(sheetName);
        });
    }

    // ==================== DATA ACCESS METHODS ====================

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
