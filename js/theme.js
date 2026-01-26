/**
 * eSociety - Theme Management System
 * Handles light/dark theme toggling and persistence
 */

const ThemeManager = {
    STORAGE_KEY: 'esociety_theme',
    DEFAULT_THEME: 'light',

    /**
     * Initialize theme system
     */
    init() {
        // Apply saved theme immediately to prevent flash
        this.applyTheme(this.getSavedTheme());

        // Listen for system theme changes
        this.watchSystemTheme();
    },

    /**
     * Get saved theme from localStorage
     */
    getSavedTheme() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) return saved;

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        return this.DEFAULT_THEME;
    },

    /**
     * Save theme to localStorage
     */
    saveTheme(theme) {
        localStorage.setItem(this.STORAGE_KEY, theme);
    },

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
        }
    },

    /**
     * Toggle between light and dark theme
     */
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || this.DEFAULT_THEME;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        this.applyTheme(newTheme);
        this.saveTheme(newTheme);

        // Optionally sync to server (Google Sheets)
        this.syncToServer(newTheme);

        return newTheme;
    },

    /**
     * Set specific theme
     */
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn('Invalid theme:', theme);
            return;
        }

        this.applyTheme(theme);
        this.saveTheme(theme);
        this.syncToServer(theme);
    },

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || this.DEFAULT_THEME;
    },

    /**
     * Watch for system theme changes
     */
    watchSystemTheme() {
        if (!window.matchMedia) return;

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-switch if user hasn't set a preference
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    /**
     * Sync theme preference to server (Google Sheets)
     * This allows the preference to persist across devices
     */
    async syncToServer(theme) {
        try {
            // Only sync if user is logged in
            if (typeof auth !== 'undefined' && auth.isLoggedIn()) {
                const currentUser = auth.getCurrentUser();
                if (currentUser && typeof storage !== 'undefined') {
                    await storage.apiCall('updateUserPreference', null, {
                        preference: 'theme',
                        value: theme
                    });
                }
            }
        } catch (error) {
            // Silently fail - local storage is the primary persistence
            console.debug('Theme sync failed:', error.message);
        }
    },

    /**
     * Load theme preference from server
     * Call this after user login to sync preferences
     */
    async loadFromServer() {
        try {
            if (typeof auth !== 'undefined' && auth.isLoggedIn() && typeof storage !== 'undefined') {
                const result = await storage.apiCall('getUserPreference', null, {
                    preference: 'theme'
                });

                if (result.success && result.value) {
                    this.setTheme(result.value);
                    return result.value;
                }
            }
        } catch (error) {
            console.debug('Failed to load theme from server:', error.message);
        }
        return null;
    },

    /**
     * Create theme toggle button HTML
     */
    createToggleButton() {
        return `
            <button class="theme-toggle" onclick="ThemeManager.toggle()" title="Toggle theme">
                <svg class="theme-icon-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <svg class="theme-icon-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            </button>
        `;
    }
};

// Initialize theme immediately to prevent flash of wrong theme
(function() {
    const savedTheme = localStorage.getItem('esociety_theme') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

// Full initialization on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();

    // Add touch event support for theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        let lastToggle = 0;
        const debounceTime = 300; // Prevent double toggle within 300ms

        const handleToggle = (e) => {
            const now = Date.now();
            if (now - lastToggle < debounceTime) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            lastToggle = now;
            e.preventDefault();
            e.stopPropagation();
            ThemeManager.toggle();
        };

        // Remove inline onclick to prevent double-firing
        themeToggle.removeAttribute('onclick');

        // Use touchend for more reliable mobile interaction
        themeToggle.addEventListener('touchend', handleToggle, { passive: false });

        // Also ensure click works for non-touch devices
        themeToggle.addEventListener('click', handleToggle);
    }
});
