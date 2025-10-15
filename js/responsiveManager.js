/**
 * Responsive Manager - Handles mobile-specific functionality and responsive behavior
 */
class ResponsiveManager {
    constructor() {
        this.isMobile = window.innerWidth <= 767;
        this.isTablet = window.innerWidth > 767 && window.innerWidth <= 991;
        this.isDesktop = window.innerWidth > 991;
        this.sidebarOpen = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.swipeThreshold = 50;
        this.pullToRefreshThreshold = 60;
        this.isPulling = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMobileNavigation();
        this.setupTouchGestures();
        this.setupResizeHandler();
        this.setupAccessibility();
        this.updateViewport();
    }
    
    setupEventListeners() {
        // Mobile navigation toggle
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileNavToggle) {
            mobileNavToggle.addEventListener('click', () => this.toggleMobileNavigation());
            mobileNavToggle.addEventListener('touchstart', (e) => e.preventDefault());
        }
        
        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', () => this.closeMobileNavigation());
        }
        
        // Close sidebar when clicking on main content on mobile
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.addEventListener('click', () => {
                if (this.isMobile && this.sidebarOpen) {
                    this.closeMobileNavigation();
                }
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }
    
    setupMobileNavigation() {
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        
        if (!mobileNavToggle) return;
        
        // Show/hide mobile nav toggle based on screen size
        this.updateMobileNavToggleVisibility();
        
        // Add ARIA attributes
        mobileNavToggle.setAttribute('aria-expanded', 'false');
        mobileNavToggle.setAttribute('aria-controls', 'sidebar');
    }
    
    setupTouchGestures() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (!sidebar || !mainContent) return;
        
        // Swipe gestures for sidebar
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Pull-to-refresh functionality
        mainContent.addEventListener('touchstart', (e) => this.handlePullStart(e), { passive: true });
        mainContent.addEventListener('touchmove', (e) => this.handlePullMove(e), { passive: false });
        mainContent.addEventListener('touchend', (e) => this.handlePullEnd(e), { passive: true });
    }
    
    setupResizeHandler() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }
    
    setupAccessibility() {
        // Enhanced focus management for mobile
        document.addEventListener('focusin', (e) => {
            if (this.isMobile) {
                this.ensureElementVisible(e.target);
            }
        });
        
        // Trap focus in sidebar when open on mobile
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.addEventListener('keydown', (e) => {
                if (this.isMobile && this.sidebarOpen) {
                    this.trapFocus(e, sidebar);
                }
            });
        }
    }
    
    handleTouchStart(e) {
        if (!this.isMobile) return;
        
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchMove(e) {
        if (!this.isMobile) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - this.touchStartX;
        const deltaY = touchY - this.touchStartY;
        
        // Prevent default if horizontal swipe is detected
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            e.preventDefault();
        }
    }
    
    handleTouchEnd(e) {
        if (!this.isMobile) return;
        
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        
        this.handleSwipeGesture();
    }
    
    handleSwipeGesture() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
            if (deltaX > 0 && this.touchStartX < 50) {
                // Swipe right from left edge - open sidebar
                this.openMobileNavigation();
            } else if (deltaX < 0 && this.sidebarOpen) {
                // Swipe left - close sidebar
                this.closeMobileNavigation();
            }
        }
    }
    
    handlePullStart(e) {
        if (!this.isMobile) return;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent && mainContent.scrollTop === 0) {
            this.touchStartY = e.touches[0].clientY;
            this.isPulling = true;
        }
    }
    
    handlePullMove(e) {
        if (!this.isMobile || !this.isPulling) return;
        
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - this.touchStartY;
        
        if (deltaY > 0 && deltaY < this.pullToRefreshThreshold * 2) {
            e.preventDefault();
            this.updatePullToRefreshIndicator(deltaY);
        }
    }
    
    handlePullEnd(e) {
        if (!this.isMobile || !this.isPulling) return;
        
        const touchY = e.changedTouches[0].clientY;
        const deltaY = touchY - this.touchStartY;
        
        if (deltaY > this.pullToRefreshThreshold) {
            this.triggerRefresh();
        }
        
        this.isPulling = false;
        this.hidePullToRefreshIndicator();
    }
    
    updatePullToRefreshIndicator(deltaY) {
        let indicator = document.querySelector('.pull-to-refresh');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'pull-to-refresh';
            indicator.innerHTML = '↻';
            document.querySelector('.main-content').appendChild(indicator);
        }
        
        const progress = Math.min(deltaY / this.pullToRefreshThreshold, 1);
        indicator.style.opacity = progress;
        indicator.style.transform = `translateX(-50%) rotate(${progress * 360}deg)`;
        
        if (progress >= 1) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }
    
    hidePullToRefreshIndicator() {
        const indicator = document.querySelector('.pull-to-refresh');
        if (indicator) {
            indicator.remove();
        }
    }
    
    triggerRefresh() {
        // Dispatch custom refresh event
        const refreshEvent = new CustomEvent('pullToRefresh', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(refreshEvent);
        
        // Show notification
        if (window.NotificationManager) {
            window.NotificationManager.show('Refreshing content...', 'info');
        }
    }
    
    handleResize() {
        const oldIsMobile = this.isMobile;
        const oldIsTablet = this.isTablet;
        const oldIsDesktop = this.isDesktop;
        
        this.isMobile = window.innerWidth <= 767;
        this.isTablet = window.innerWidth > 767 && window.innerWidth <= 991;
        this.isDesktop = window.innerWidth > 991;
        
        // Close mobile navigation if switching to desktop
        if (oldIsMobile && !this.isMobile && this.sidebarOpen) {
            this.closeMobileNavigation();
        }
        
        // Update mobile nav toggle visibility
        this.updateMobileNavToggleVisibility();
        
        // Update viewport meta tag
        this.updateViewport();
        
        // Dispatch resize event with device type
        const resizeEvent = new CustomEvent('responsiveResize', {
            detail: {
                isMobile: this.isMobile,
                isTablet: this.isTablet,
                isDesktop: this.isDesktop,
                changed: {
                    mobile: oldIsMobile !== this.isMobile,
                    tablet: oldIsTablet !== this.isTablet,
                    desktop: oldIsDesktop !== this.isDesktop
                }
            }
        });
        document.dispatchEvent(resizeEvent);
    }
    
    updateMobileNavToggleVisibility() {
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        if (mobileNavToggle) {
            mobileNavToggle.style.display = this.isMobile ? 'flex' : 'none';
        }
    }
    
    updateViewport() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        // Enhanced viewport settings for better mobile experience
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
    }
    
    toggleMobileNavigation() {
        if (this.sidebarOpen) {
            this.closeMobileNavigation();
        } else {
            this.openMobileNavigation();
        }
    }
    
    openMobileNavigation() {
        if (!this.isMobile) return;
        
        const sidebar = document.getElementById('sidebar');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        
        if (sidebar) {
            sidebar.classList.add('mobile-open');
            sidebar.setAttribute('aria-hidden', 'false');
        }
        
        if (sidebarBackdrop) {
            sidebarBackdrop.classList.add('active');
        }
        
        if (mobileNavToggle) {
            mobileNavToggle.classList.add('active');
            mobileNavToggle.setAttribute('aria-expanded', 'true');
            mobileNavToggle.querySelector('.nav-toggle-icon').textContent = '✕';
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus first sidebar item
        setTimeout(() => {
            const firstSidebarItem = sidebar?.querySelector('.sidebar-item');
            if (firstSidebarItem) {
                firstSidebarItem.focus();
            }
        }, 300);
        
        this.sidebarOpen = true;
    }
    
    closeMobileNavigation() {
        if (!this.isMobile) return;
        
        const sidebar = document.getElementById('sidebar');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
            sidebar.setAttribute('aria-hidden', 'true');
        }
        
        if (sidebarBackdrop) {
            sidebarBackdrop.classList.remove('active');
        }
        
        if (mobileNavToggle) {
            mobileNavToggle.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            mobileNavToggle.querySelector('.nav-toggle-icon').textContent = '☰';
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        this.sidebarOpen = false;
    }
    
    handleKeyboardNavigation(e) {
        // Escape key closes mobile navigation
        if (e.key === 'Escape' && this.isMobile && this.sidebarOpen) {
            this.closeMobileNavigation();
            document.getElementById('mobileNavToggle')?.focus();
        }
        
        // Tab navigation enhancement for mobile
        if (e.key === 'Tab' && this.isMobile && this.sidebarOpen) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                this.trapFocus(e, sidebar);
            }
        }
    }
    
    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    ensureElementVisible(element) {
        if (!element || !this.isMobile) return;
        
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.bottom > viewportHeight || rect.top < 0) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    // Utility methods for responsive behavior
    convertTableToMobileView(tableContainer) {
        if (!this.isMobile || !tableContainer) return;
        
        const table = tableContainer.querySelector('.table');
        if (!table) return;
        
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        
        const mobileView = document.createElement('div');
        mobileView.className = 'table-mobile-view';
        
        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const mobileRow = document.createElement('div');
            mobileRow.className = 'table-row';
            
            cells.forEach((cell, index) => {
                const mobileCell = document.createElement('div');
                mobileCell.className = 'table-cell';
                
                const label = document.createElement('span');
                label.className = 'cell-label';
                label.textContent = headers[index] || `Column ${index + 1}`;
                
                const value = document.createElement('span');
                value.className = 'cell-value';
                value.innerHTML = cell.innerHTML;
                
                mobileCell.appendChild(label);
                mobileCell.appendChild(value);
                mobileRow.appendChild(mobileCell);
            });
            
            mobileView.appendChild(mobileRow);
        });
        
        // Replace table with mobile view
        table.style.display = 'none';
        tableContainer.appendChild(mobileView);
    }
    
    optimizeModalForMobile(modal) {
        if (!this.isMobile || !modal) return;
        
        const modalContainer = modal.querySelector('.modal-container');
        if (modalContainer) {
            modalContainer.classList.add('mobile-optimized');
        }
        
        // Add swipe-to-close functionality
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        modalContainer.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });
        
        modalContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 0) {
                modalContainer.style.transform = `translateY(${deltaY}px)`;
            }
        }, { passive: true });
        
        modalContainer.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const deltaY = currentY - startY;
            
            if (deltaY > 100) {
                // Close modal if swiped down significantly
                modal.classList.remove('active');
            } else {
                // Snap back to position
                modalContainer.style.transform = 'translateY(0)';
            }
            
            isDragging = false;
        }, { passive: true });
    }
    
    // Public API methods
    getDeviceType() {
        return {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isDesktop: this.isDesktop
        };
    }
    
    isSidebarOpen() {
        return this.sidebarOpen;
    }
    
    forceCloseSidebar() {
        if (this.sidebarOpen) {
            this.closeMobileNavigation();
        }
    }
}

// Initialize responsive manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ResponsiveManager = new ResponsiveManager();
    
    // Make it globally available
    window.responsiveManager = window.ResponsiveManager;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveManager;
}