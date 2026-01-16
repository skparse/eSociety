/**
 * Society Maintenance Billing System
 * Authentication Module (Multi-Tenant)
 */

class Auth {
    constructor() {
        this.sessionKey = CONFIG.STORAGE_KEYS.SESSION;
        this.userKey = CONFIG.STORAGE_KEYS.USER;
        this.sessionTimeout = CONFIG.APP.SESSION_TIMEOUT;
    }

    /**
     * Login user with society code, username and password
     * @param {string} societyId - Society code
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {string} [knownSocietyName] - Optional pre-validated society name
     */
    async login(societyId, username, password, knownSocietyName = null) {
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

            // Create session
            const session = {
                userId: user.id,
                role: user.role,
                societyId: societyId.toUpperCase(),
                societyName: societyName,
                loginTime: Date.now(),
                expiresAt: Date.now() + this.sessionTimeout
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
            session.expiresAt = Date.now() + this.sessionTimeout;
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
     * Require authentication - redirect if not logged in
     */
    requireAuth(requiredRole = null) {
        if (!this.isLoggedIn()) {
            window.location.href = '/index.html?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }

        // Superadmin has access to superadmin panel only
        if (this.isSuperadmin() && requiredRole !== 'superadmin') {
            window.location.href = '/superadmin/dashboard.html';
            return false;
        }

        // Non-superadmin trying to access superadmin panel
        if (requiredRole === 'superadmin' && !this.isSuperadmin()) {
            window.location.href = '/index.html';
            return false;
        }

        if (requiredRole && this.getSession().role !== requiredRole) {
            // Redirect to appropriate dashboard
            if (this.isAdmin()) {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/member/dashboard.html';
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
