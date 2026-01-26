/**
 * Society Maintenance Billing System
 * Storage Module - Google Apps Script Integration (Multi-Tenant)
 * Supports both API mode (Google Apps Script) and Local mode (localStorage)
 */

class Storage {
    constructor() {
        this.sheets = CONFIG.SHEETS;
        this.LOCAL_STORAGE_PREFIX = 'esociety_data_';
    }

    /**
     * Check if using local storage mode
     * Returns true if:
     * - CONFIG.STORAGE_MODE is 'local', OR
     * - Society ID is 'DEMO' (demo mode only applies to DEMO society)
     */
    get isLocalMode() {
        // Config explicitly set to local mode
        if (CONFIG.STORAGE_MODE === 'local') {
            return true;
        }

        // Check if this is the DEMO society
        const currentSociety = this.societyId || localStorage.getItem('society_id');
        const isDemoSociety = currentSociety === 'DEMO';

        // Only use local mode for DEMO society when demo flag is set
        if (isDemoSociety) {
            const demoModeFlag = localStorage.getItem('esociety_demo_mode') === 'true';
            return demoModeFlag;
        }

        // For all other societies, use API mode
        return false;
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
        return getCurrentSocietyId() || 'demo';
    }

    /**
     * Get localStorage key for a sheet
     */
    getLocalKey(sheetName) {
        return this.LOCAL_STORAGE_PREFIX + (this.societyId || 'demo') + '_' + sheetName;
    }

    /**
     * Read from localStorage
     */
    readLocal(sheetName) {
        const key = this.getLocalKey(sheetName);
        const data = localStorage.getItem(key);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Error parsing local data:', e);
                return null;
            }
        }
        return null;
    }

    /**
     * Write to localStorage
     */
    writeLocal(sheetName, data) {
        const key = this.getLocalKey(sheetName);
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return { success: true };
        } catch (e) {
            console.error('Error writing local data:', e);
            throw new Error('Failed to save data: ' + e.message);
        }
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
     * Reset all data for a society (superadmin only)
     * Clears all sheets: flats, bills, payments, users (except admin), master data (except defaults)
     */
    async resetSocietyData(societyId) {
        const url = `${this.webAppUrl}?action=resetSocietyData&societyId=${encodeURIComponent(societyId)}`;
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
        // Use localStorage in local mode
        if (this.isLocalMode) {
            return this.readLocal(sheetName);
        }

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
        // Use localStorage in local mode
        if (this.isLocalMode) {
            return this.writeLocal(sheetName, data);
        }

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
        if (this.isLocalMode) {
            const settings = this.readLocal(this.sheets.SETTINGS);
            return {
                success: true,
                initialized: !!settings,
                mode: 'local'
            };
        }

        if (!this.societyId) {
            throw new Error('No society selected');
        }
        return await this.apiCall('status');
    }

    /**
     * Initialize society data
     */
    async initializeSystem(adminPassword) {
        if (this.isLocalMode) {
            // Initialize with default data in local mode
            await this.saveSettings(INITIAL_DATA.settings);
            await this.saveMasterData(INITIAL_DATA.masterData);
            await this.saveUsers([{
                id: 'user-admin',
                username: 'admin',
                password: await Utils.hashPassword(adminPassword),
                role: 'admin',
                flatId: null,
                name: 'Administrator',
                email: 'admin@society.com',
                phone: '',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }]);
            await this.saveFlats([]);
            await this.saveBills([]);
            await this.savePayments([]);
            return { success: true, message: 'System initialized in local mode' };
        }

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
            if (!data || Object.keys(data).length === 0) {
                return { ...INITIAL_DATA.settings };
            }
            return data;
        } catch (error) {
            console.error('Error getting settings:', error);
            return { ...INITIAL_DATA.settings };
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
            if (!data || Object.keys(data).length === 0) {
                return { ...INITIAL_DATA.masterData };
            }
            return data;
        } catch (error) {
            console.error('Error getting master data:', error);
            return { ...INITIAL_DATA.masterData };
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
            if (!data) return [];
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
     * Get all tenants
     */
    async getTenants() {
        try {
            const data = await this.readSheet(this.sheets.TENANTS);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error getting tenants:', error);
            return [];
        }
    }

    /**
     * Save tenants
     */
    async saveTenants(tenants) {
        return await this.writeSheet(this.sheets.TENANTS, tenants);
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
     * Get all expenses
     */
    async getExpenses() {
        try {
            const data = await this.readSheet(this.sheets.EXPENSES);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error getting expenses:', error);
            return [];
        }
    }

    /**
     * Save expenses
     */
    async saveExpenses(expenses) {
        return await this.writeSheet(this.sheets.EXPENSES, expenses);
    }

    /**
     * Upload expense receipt image to Google Drive
     * @param {File} file - The image file to upload
     * @param {string} fyFolder - Financial year folder name (e.g., "FY2024-2025")
     * @param {string} fileName - The filename to use for storage
     * @returns {Object} - { success: boolean, fileUrl?: string, fileId?: string, error?: string }
     */
    async uploadExpenseReceipt(file, fyFolder, fileName) {
        // In local/demo mode, store as base64 data URL
        if (this.isLocalMode) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve({
                        success: true,
                        fileUrl: e.target.result, // Data URL
                        fileId: 'local_' + Date.now()
                    });
                };
                reader.onerror = function() {
                    resolve({
                        success: false,
                        error: 'Failed to read file'
                    });
                };
                reader.readAsDataURL(file);
            });
        }

        // API mode - upload to Google Drive
        if (!this.societyId) {
            return { success: false, error: 'No society selected' };
        }

        try {
            // Convert file to base64
            const base64Data = await this.fileToBase64(file);

            // Make API call to upload
            const result = await this.apiCall('uploadExpenseReceipt', null, {
                fyFolder: fyFolder,
                fileName: fileName,
                mimeType: file.type,
                base64Data: base64Data
            });

            return {
                success: true,
                fileUrl: result.fileUrl,
                fileId: result.fileId
            };
        } catch (error) {
            console.error('Error uploading receipt:', error);
            return {
                success: false,
                error: error.message || 'Upload failed'
            };
        }
    }

    /**
     * Convert a File object to base64 string
     * @param {File} file - The file to convert
     * @returns {Promise<string>} - Base64 encoded string (without data URL prefix)
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64 = e.target.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = function(error) {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Check if system is configured
     */
    isConfigured() {
        // Always configured in local mode
        if (this.isLocalMode) {
            return true;
        }
        return isGoogleScriptConfigured();
    }

    /**
     * Validate society (for local mode, always valid)
     */
    async validateSocietyLocal(societyId) {
        if (this.isLocalMode) {
            return { success: true, valid: true, societyName: 'Demo Society' };
        }
        return await this.validateSociety(societyId);
    }
}

// Create global storage instance
const storage = new Storage();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Storage, storage };
}
