/**
 * Mobile Enhancements for Society Maintenance Billing
 * - Swipe gestures for sidebar
 * - Pull to refresh
 * - Touch improvements
 * - Install prompt handling
 */

(function() {
    'use strict';

    // ==================== Swipe Gesture Handler ====================
    const SwipeHandler = {
        touchStartX: 0,
        touchStartY: 0,
        touchEndX: 0,
        touchEndY: 0,
        minSwipeDistance: 50,
        maxVerticalDistance: 100,

        init() {
            document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        },

        handleTouchStart(e) {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        },

        handleTouchEnd(e) {
            this.touchEndX = e.changedTouches[0].screenX;
            this.touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        },

        handleSwipe() {
            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = Math.abs(this.touchEndY - this.touchStartY);

            // Only handle horizontal swipes (not vertical scrolling)
            if (deltaY > this.maxVerticalDistance) return;

            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');

            if (!sidebar) return;

            // Swipe right to open sidebar (from left edge)
            if (deltaX > this.minSwipeDistance && this.touchStartX < 30) {
                sidebar.classList.add('open');
                if (overlay) overlay.classList.add('show');
            }

            // Swipe left to close sidebar
            if (deltaX < -this.minSwipeDistance && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
            }
        }
    };

    // ==================== Pull to Refresh ====================
    const PullToRefresh = {
        startY: 0,
        currentY: 0,
        pulling: false,
        threshold: 80,
        refreshIndicator: null,

        init() {
            this.createIndicator();
            document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        },

        createIndicator() {
            if (document.getElementById('pull-refresh-indicator')) return;

            const indicator = document.createElement('div');
            indicator.id = 'pull-refresh-indicator';
            indicator.innerHTML = `
                <div class="pull-refresh-content">
                    <div class="pull-refresh-spinner"></div>
                    <span class="pull-refresh-text">Pull to refresh</span>
                </div>
            `;
            document.body.insertBefore(indicator, document.body.firstChild);
            this.refreshIndicator = indicator;
        },

        handleTouchStart(e) {
            if (window.scrollY === 0) {
                this.startY = e.touches[0].pageY;
                this.pulling = true;
            }
        },

        handleTouchMove(e) {
            if (!this.pulling || window.scrollY > 0) {
                this.pulling = false;
                return;
            }

            this.currentY = e.touches[0].pageY;
            const pullDistance = this.currentY - this.startY;

            if (pullDistance > 0 && pullDistance < 150) {
                e.preventDefault();
                const progress = Math.min(pullDistance / this.threshold, 1);
                this.refreshIndicator.style.transform = `translateY(${pullDistance * 0.5}px)`;
                this.refreshIndicator.style.opacity = progress;

                const text = this.refreshIndicator.querySelector('.pull-refresh-text');
                if (pullDistance > this.threshold) {
                    text.textContent = 'Release to refresh';
                    this.refreshIndicator.classList.add('ready');
                } else {
                    text.textContent = 'Pull to refresh';
                    this.refreshIndicator.classList.remove('ready');
                }
            }
        },

        handleTouchEnd(e) {
            if (!this.pulling) return;

            const pullDistance = this.currentY - this.startY;

            if (pullDistance > this.threshold) {
                this.doRefresh();
            } else {
                this.reset();
            }

            this.pulling = false;
        },

        doRefresh() {
            const text = this.refreshIndicator.querySelector('.pull-refresh-text');
            text.textContent = 'Refreshing...';
            this.refreshIndicator.classList.add('refreshing');

            // Trigger page reload after animation
            setTimeout(() => {
                window.location.reload();
            }, 500);
        },

        reset() {
            this.refreshIndicator.style.transform = 'translateY(0)';
            this.refreshIndicator.style.opacity = '0';
            this.refreshIndicator.classList.remove('ready', 'refreshing');
        }
    };

    // ==================== Install Prompt Handler ====================
    const InstallPrompt = {
        deferredPrompt: null,
        installButton: null,

        init() {
            window.addEventListener('beforeinstallprompt', this.handleBeforeInstall.bind(this));
            window.addEventListener('appinstalled', this.handleAppInstalled.bind(this));
            this.createInstallButton();
        },

        createInstallButton() {
            // Check if already installed
            if (window.matchMedia('(display-mode: standalone)').matches) {
                return;
            }

            const button = document.createElement('button');
            button.id = 'install-app-btn';
            button.className = 'install-app-button';
            button.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Install App</span>
            `;
            button.style.display = 'none';
            button.addEventListener('click', this.handleInstallClick.bind(this));
            document.body.appendChild(button);
            this.installButton = button;
        },

        handleBeforeInstall(e) {
            e.preventDefault();
            this.deferredPrompt = e;
            if (this.installButton) {
                this.installButton.style.display = 'flex';
            }
        },

        async handleInstallClick() {
            if (!this.deferredPrompt) return;

            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;

            console.log('Install prompt outcome:', outcome);
            this.deferredPrompt = null;

            if (this.installButton) {
                this.installButton.style.display = 'none';
            }
        },

        handleAppInstalled() {
            console.log('App installed successfully');
            this.deferredPrompt = null;
            if (this.installButton) {
                this.installButton.style.display = 'none';
            }
        }
    };

    // ==================== Touch Improvements ====================
    const TouchImprovements = {
        init() {
            // Add touch feedback to buttons
            this.addTouchFeedback();

            // Prevent double-tap zoom on buttons
            this.preventDoubleTapZoom();

            // Add active states for touch
            this.addTouchActiveStates();
        },

        addTouchFeedback() {
            document.addEventListener('touchstart', (e) => {
                const target = e.target.closest('button, .btn, a.nav-link, .card');
                if (target) {
                    target.classList.add('touch-active');
                }
            }, { passive: true });

            document.addEventListener('touchend', () => {
                document.querySelectorAll('.touch-active').forEach(el => {
                    el.classList.remove('touch-active');
                });
            }, { passive: true });
        },

        preventDoubleTapZoom() {
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    if (e.target.closest('button, .btn, input, a')) {
                        e.preventDefault();
                    }
                }
                lastTouchEnd = now;
            }, false);
        },

        addTouchActiveStates() {
            // Add CSS for touch active states
            const style = document.createElement('style');
            style.textContent = `
                .touch-active {
                    opacity: 0.7 !important;
                    transform: scale(0.98) !important;
                    transition: all 0.1s ease !important;
                }
            `;
            document.head.appendChild(style);
        }
    };

    // ==================== Initialize on DOM Ready ====================
    function initMobileEnhancements() {
        // Only initialize on touch devices
        if (!('ontouchstart' in window)) return;

        SwipeHandler.init();
        PullToRefresh.init();
        InstallPrompt.init();
        TouchImprovements.init();

        console.log('Mobile enhancements initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileEnhancements);
    } else {
        initMobileEnhancements();
    }

})();
