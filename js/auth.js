/**
 * Society Maintenance Billing System
 * Authentication Module (Multi-Tenant)
 */

class Auth {
    constructor() {
        this.sessionKey = CONFIG.STORAGE_KEYS.SESSION;
        this.userKey = CONFIG.STORAGE_KEYS.USER;
        this.sessionTimeout = CONFIG.APP.SESSION_TIMEOUT;
        this.extendedSessionTimeout = 30 * 24 * 60 * 60 * 1000; // 30 days for "Remember Me"
    }

    /**
     * Get base URL for the application (works with GitHub Pages subdirectories)
     */
    getBaseUrl() {
        const path = window.location.pathname;
        // Find the app root by looking for known directories
        const adminMatch = path.match(/(.*)\/admin\//);
        const memberMatch = path.match(/(.*)\/member\//);
        const superadminMatch = path.match(/(.*)\/superadmin\//);
        const docsMatch = path.match(/(.*)\/docs\//);

        if (adminMatch) return adminMatch[1] || '.';
        if (memberMatch) return memberMatch[1] || '.';
        if (superadminMatch) return superadminMatch[1] || '.';
        if (docsMatch) return docsMatch[1] || '.';

        // If we're at root level, get directory of current file
        const lastSlash = path.lastIndexOf('/');
        if (lastSlash > 0) {
            return path.substring(0, lastSlash);
        }
        return '.';
    }

    /**
     * Login user with society code, username and password
     * @param {string} societyId - Society code
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {string} [knownSocietyName] - Optional pre-validated society name
     * @param {boolean} [rememberMe] - Whether to use extended session (30 days)
     */
    async login(societyId, username, password, knownSocietyName = null, rememberMe = false) {
        try {
            // Set society context first
            setCurrentSociety(societyId.toUpperCase());

            // Get users from storage (will use societyId)
            const users = await storage.getUsers();

            // Find user by username
            const user = users.find(u =>
                u.username.toLowerCase() === username.toLowerCase() && u.isActive
            );

            if (!user) {
                clearCurrentSociety();
                return { success: false, message: 'Invalid username or password' };
            }

            // Verify password
            const hashedPassword = await Utils.hashPassword(password);

            if (user.password !== hashedPassword) {
                clearCurrentSociety();
                return { success: false, message: 'Invalid username or password' };
            }

            // Use known society name or fetch it
            let societyName = knownSocietyName;
            if (!societyName) {
                try {
                    const societyInfo = await storage.getSocietyInfo(societyId);
                    societyName = societyInfo.success ? societyInfo.society.name : societyId;
                } catch (e) {
                    societyName = societyId;
                }
            }

            // Update society with name
            setCurrentSociety(societyId.toUpperCase(), societyName);

            // Determine session timeout based on rememberMe
            const timeout = rememberMe ? this.extendedSessionTimeout : this.sessionTimeout;

            // Create session
            const session = {
                userId: user.id,
                role: user.role,
                societyId: societyId.toUpperCase(),
                societyName: societyName,
                loginTime: Date.now(),
                expiresAt: Date.now() + timeout,
                rememberMe: rememberMe
            };

            // Save session and user info
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            localStorage.setItem(this.userKey, JSON.stringify({
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                flatId: user.flatId,
                societyId: societyId.toUpperCase(),
                societyName: societyName
            }));

            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    flatId: user.flatId,
                    societyId: societyId.toUpperCase(),
                    societyName: societyName
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            clearCurrentSociety();
            return { success: false, message: error.message || 'An error occurred during login' };
        }
    }

    /**
     * Superadmin login
     */
    async superadminLogin(username, password) {
        try {
            const result = await storage.superadminLogin(username, password);

            if (result.success) {
                // Create superadmin session
                const session = {
                    userId: 'superadmin',
                    role: 'superadmin',
                    loginTime: Date.now(),
                    expiresAt: Date.now() + this.sessionTimeout
                };

                localStorage.setItem(this.sessionKey, JSON.stringify(session));
                localStorage.setItem(this.userKey, JSON.stringify({
                    id: 'superadmin',
                    username: username,
                    name: 'Super Administrator',
                    role: 'superadmin'
                }));

                return { success: true, role: 'superadmin' };
            }

            return { success: false, message: result.error || 'Invalid credentials' };
        } catch (error) {
            console.error('Superadmin login error:', error);
            return { success: false, message: error.message || 'An error occurred' };
        }
    }

    /**
     * Logout current user
     */
    logout() {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.userKey);
        // Clear demo mode flag so user can switch to live mode
        localStorage.removeItem('esociety_demo_mode');
        clearCurrentSociety();
        storage.invalidateAllCache();
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        const session = this.getSession();
        if (!session) return false;

        // Check if session has expired
        if (Date.now() > session.expiresAt) {
            this.logout();
            return false;
        }

        return true;
    }

    /**
     * Get current session
     */
    getSession() {
        const sessionStr = localStorage.getItem(this.sessionKey);
        if (!sessionStr) return null;

        try {
            return JSON.parse(sessionStr);
        } catch (e) {
            return null;
        }
    }

    /**
     * Get current user info
     */
    getCurrentUser() {
        const userStr = localStorage.getItem(this.userKey);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }

    /**
     * Refresh session (extend expiry)
     */
    refreshSession() {
        const session = this.getSession();
        if (session) {
            // Use extended timeout if rememberMe was set
            const timeout = session.rememberMe ? this.extendedSessionTimeout : this.sessionTimeout;
            session.expiresAt = Date.now() + timeout;
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
        }
    }

    /**
     * Check if current user is superadmin
     */
    isSuperadmin() {
        const session = this.getSession();
        return session && session.role === 'superadmin';
    }

    /**
     * Check if current user is admin
     */
    isAdmin() {
        const session = this.getSession();
        return session && session.role === 'admin';
    }

    /**
     * Check if current user is member
     */
    isMember() {
        const session = this.getSession();
        return session && session.role === 'member';
    }

    /**
     * Get current society ID
     */
    getSocietyId() {
        const session = this.getSession();
        return session ? session.societyId : null;
    }

    /**
     * Get current society name
     */
    getSocietyName() {
        const session = this.getSession();
        return session ? session.societyName : null;
    }

    /**
     * Encode society code for URL (simple obfuscation)
     */
    encodeSocietyCode(code) {
        const reversed = code.split('').reverse().join('');
        return btoa(reversed);
    }

    /**
     * Require authentication - redirect if not logged in
     */
    requireAuth(requiredRole = null) {
        const baseUrl = this.getBaseUrl();

        if (!this.isLoggedIn()) {
            // Superadmin pages redirect to superadmin login
            if (requiredRole === 'superadmin') {
                window.location.href = baseUrl + '/superadmin/login.html';
            } else {
                // Try to get society code from localStorage for redirect
                const societyCode = localStorage.getItem(CONFIG.STORAGE_KEYS.SOCIETY_ID) ||
                                    localStorage.getItem('last_society_code');
                let redirectUrl = baseUrl + '/login.html?redirect=' + encodeURIComponent(window.location.pathname);

                // Include society code in redirect URL if available
                if (societyCode) {
                    const encoded = this.encodeSocietyCode(societyCode);
                    redirectUrl += '&s=' + encodeURIComponent(encoded);
                }

                window.location.href = redirectUrl;
            }
            return false;
        }

        // Superadmin has access to superadmin panel only
        if (this.isSuperadmin() && requiredRole !== 'superadmin') {
            window.location.href = baseUrl + '/superadmin/dashboard.html';
            return false;
        }

        // Non-superadmin trying to access superadmin panel
        if (requiredRole === 'superadmin' && !this.isSuperadmin()) {
            window.location.href = baseUrl + '/superadmin/login.html';
            return false;
        }

        if (requiredRole && this.getSession().role !== requiredRole) {
            // Redirect to appropriate dashboard
            if (this.isAdmin()) {
                window.location.href = baseUrl + '/admin/dashboard.html';
            } else {
                window.location.href = baseUrl + '/member/dashboard.html';
            }
            return false;
        }

        // Refresh session on activity
        this.refreshSession();
        return true;
    }

    /**
     * Change password for current user
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, message: 'Not logged in' };
            }

            const users = await storage.getUsers();
            const userIndex = users.findIndex(u => u.id === currentUser.id);

            if (userIndex === -1) {
                return { success: false, message: 'User not found' };
            }

            // Verify current password
            const hashedCurrent = await Utils.hashPassword(currentPassword);
            if (users[userIndex].password !== hashedCurrent) {
                return { success: false, message: 'Current password is incorrect' };
            }

            // Update password
            users[userIndex].password = await Utils.hashPassword(newPassword);
            users[userIndex].updatedAt = new Date().toISOString();

            await storage.saveUsers(users);

            return { success: true, message: 'Password changed successfully' };
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: 'An error occurred' };
        }
    }

    /**
     * Reset password for a user (admin only)
     */
    async resetPassword(userId, newPassword) {
        try {
            if (!this.isAdmin()) {
                return { success: false, message: 'Unauthorized' };
            }

            const users = await storage.getUsers();
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                return { success: false, message: 'User not found' };
            }

            users[userIndex].password = await Utils.hashPassword(newPassword);
            users[userIndex].updatedAt = new Date().toISOString();

            await storage.saveUsers(users);

            return { success: true, message: 'Password reset successfully' };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, message: 'An error occurred' };
        }
    }

    /**
     * Create new user
     */
    async createUser(userData) {
        try {
            if (!this.isAdmin()) {
                return { success: false, message: 'Unauthorized' };
            }

            const users = await storage.getUsers();

            // Check if username already exists
            if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
                return { success: false, message: 'Username already exists' };
            }

            const newUser = {
                id: Utils.generateId(),
                username: userData.username,
                password: await Utils.hashPassword(userData.password),
                role: userData.role || 'member',
                flatId: userData.flatId || null,
                name: userData.name,
                email: userData.email || '',
                phone: userData.phone || '',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            users.push(newUser);
            await storage.saveUsers(users);

            return { success: true, user: { ...newUser, password: undefined } };
        } catch (error) {
            console.error('Create user error:', error);
            return { success: false, message: 'An error occurred' };
        }
    }

    /**
     * Update user
     */
    async updateUser(userId, userData) {
        try {
            if (!this.isAdmin()) {
                return { success: false, message: 'Unauthorized' };
            }

            const users = await storage.getUsers();
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                return { success: false, message: 'User not found' };
            }

            // Check if username is being changed and already exists
            if (userData.username &&
                userData.username.toLowerCase() !== users[userIndex].username.toLowerCase() &&
                users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
                return { success: false, message: 'Username already exists' };
            }

            // Update fields
            Object.keys(userData).forEach(key => {
                if (key !== 'id' && key !== 'password' && key !== 'createdAt') {
                    users[userIndex][key] = userData[key];
                }
            });
            users[userIndex].updatedAt = new Date().toISOString();

            await storage.saveUsers(users);

            return { success: true, user: { ...users[userIndex], password: undefined } };
        } catch (error) {
            console.error('Update user error:', error);
            return { success: false, message: 'An error occurred' };
        }
    }

    /**
     * Delete user (soft delete - deactivate)
     */
    async deleteUser(userId) {
        try {
            if (!this.isAdmin()) {
                return { success: false, message: 'Unauthorized' };
            }

            const currentUser = this.getCurrentUser();
            if (currentUser.id === userId) {
                return { success: false, message: 'Cannot delete your own account' };
            }

            const users = await storage.getUsers();
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                return { success: false, message: 'User not found' };
            }

            users[userIndex].isActive = false;
            users[userIndex].updatedAt = new Date().toISOString();

            await storage.saveUsers(users);

            return { success: true, message: 'User deactivated successfully' };
        } catch (error) {
            console.error('Delete user error:', error);
            return { success: false, message: 'An error occurred' };
        }
    }
}

// Create global auth instance
const auth = new Auth();

// Auto-refresh session on user activity
document.addEventListener('click', () => {
    if (auth.isLoggedIn()) {
        auth.refreshSession();
    }
});

document.addEventListener('keypress', () => {
    if (auth.isLoggedIn()) {
        auth.refreshSession();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Auth, auth };
}
