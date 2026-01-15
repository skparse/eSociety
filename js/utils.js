/**
 * Society Maintenance Billing System
 * Utility Functions
 */

const Utils = {
    /**
     * Generate unique ID
     */
    generateId() {
        return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Hash password using SHA-256
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Format currency
     */
    formatCurrency(amount, showSymbol = true) {
        const formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);

        return showSymbol ? CONFIG.APP.CURRENCY + ' ' + formatted : formatted;
    },

    /**
     * Format date
     */
    formatDate(dateString, format = 'short') {
        if (!dateString) return '-';

        const date = new Date(dateString);

        if (format === 'short') {
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } else if (format === 'long') {
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } else if (format === 'month-year') {
            return date.toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric'
            });
        }

        return date.toLocaleDateString('en-IN');
    },

    /**
     * Format month name from number
     */
    getMonthName(monthNumber, short = false) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const shortMonths = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        return short ? shortMonths[monthNumber - 1] : months[monthNumber - 1];
    },

    /**
     * Generate bill number
     */
    generateBillNumber(year, month, sequence) {
        const prefix = CONFIG.BILLING.BILL_PREFIX;
        const monthStr = month.toString().padStart(2, '0');
        const seqStr = sequence.toString().padStart(4, '0');
        return `${prefix}-${year}-${monthStr}-${seqStr}`;
    },

    /**
     * Generate receipt number
     */
    generateReceiptNumber(year, month, sequence) {
        const prefix = CONFIG.BILLING.RECEIPT_PREFIX;
        const monthStr = month.toString().padStart(2, '0');
        const seqStr = sequence.toString().padStart(4, '0');
        return `${prefix}-${year}-${monthStr}-${seqStr}`;
    },

    /**
     * Calculate due date
     */
    calculateDueDate(billDate, dueDays = CONFIG.BILLING.DUE_DAYS) {
        const date = new Date(billDate);
        date.setDate(date.getDate() + dueDays);
        return date.toISOString();
    },

    /**
     * Check if bill is overdue
     */
    isOverdue(dueDate) {
        return new Date(dueDate) < new Date();
    },

    /**
     * Get bill status class
     */
    getBillStatusClass(status) {
        switch (status) {
            case 'paid': return 'badge-success';
            case 'partial': return 'badge-warning';
            case 'pending': return 'badge-danger';
            default: return 'badge-secondary';
        }
    },

    /**
     * Show loading overlay
     */
    showLoading(message = 'Loading...') {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="spinner spinner-lg"></div>
                <div class="loading-message">${message}</div>
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.querySelector('.loading-message').textContent = message;
        }
        overlay.classList.add('show');
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', title = null) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    },

    /**
     * Show confirmation dialog
     */
    async showConfirm(message, title = 'Confirm', confirmText = 'Yes', cancelText = 'No') {
        return new Promise((resolve) => {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop show';
            backdrop.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h5>${title}</h5>
                        <button class="modal-close" data-action="cancel">×</button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                        <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(backdrop);

            backdrop.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'confirm') {
                    backdrop.remove();
                    resolve(true);
                } else if (action === 'cancel' || e.target === backdrop) {
                    backdrop.remove();
                    resolve(false);
                }
            });
        });
    },

    /**
     * Open modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    },

    /**
     * Close modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Parse URL parameters
     */
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate phone number
     */
    isValidPhone(phone) {
        const re = /^[0-9]{10}$/;
        return re.test(phone.replace(/\D/g, ''));
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return '?';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    /**
     * Sort array of objects by key
     */
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            let valA = a[key];
            let valB = b[key];

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (order === 'asc') {
                return valA < valB ? -1 : valA > valB ? 1 : 0;
            } else {
                return valA > valB ? -1 : valA < valB ? 1 : 0;
            }
        });
    },

    /**
     * Filter array of objects
     */
    filterBy(array, filters) {
        return array.filter(item => {
            return Object.keys(filters).every(key => {
                if (filters[key] === '' || filters[key] === null || filters[key] === undefined) {
                    return true;
                }
                return String(item[key]).toLowerCase().includes(String(filters[key]).toLowerCase());
            });
        });
    },

    /**
     * Export data to CSV
     */
    exportToCSV(data, filename, headers) {
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header] || '';
                    // Escape quotes and wrap in quotes if contains comma
                    const escaped = String(value).replace(/"/g, '""');
                    return escaped.includes(',') ? `"${escaped}"` : escaped;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    },

    /**
     * Print element
     */
    printElement(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print</title>
                <link rel="stylesheet" href="../css/style.css">
                <link rel="stylesheet" href="../css/print.css">
            </head>
            <body>
                ${element.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    /**
     * Calculate outstanding for a flat
     */
    calculateOutstanding(bills, payments, flatId) {
        const flatBills = bills.filter(b => b.flatId === flatId);
        const flatPayments = payments.filter(p => p.flatId === flatId);

        const totalBilled = flatBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
        const totalPaid = flatPayments.reduce((sum, payment) => sum + payment.amount, 0);

        return totalBilled - totalPaid;
    },

    /**
     * Get query selector helper
     */
    $(selector) {
        return document.querySelector(selector);
    },

    /**
     * Get all query selector helper
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * Add event listener helper
     */
    on(element, event, handler) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.addEventListener(event, handler);
        }
    },

    /**
     * Format number with commas (Indian format)
     */
    formatNumber(num) {
        return new Intl.NumberFormat('en-IN').format(num || 0);
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils };
}
