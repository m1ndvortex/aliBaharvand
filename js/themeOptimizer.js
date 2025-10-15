/**
 * Theme Optimizer - Enhanced Discord-inspired theme system
 * Task 9.2: Optimize Discord-inspired theme for all devices
 */

class ThemeOptimizer {
    constructor() {
        this.currentTheme = 'default';
        this.customSettings = {
            hue: 235,
            saturation: 86,
            lightness: 64,
            contrast: 'normal',
            reducedMotion: false,
            highContrast: false
        };
        
        this.themePresets = {
            default: { hue: 235, saturation: 86, lightness: 64, name: 'Discord Blue' },
            green: { hue: 139, saturation: 84, lightness: 71, name: 'Forest Green' },
            purple: { hue: 283, saturation: 39, lightness: 55, name: 'Royal Purple' },
            red: { hue: 359, saturation: 82, lightness: 59, name: 'Crimson Red' },
            orange: { hue: 35, saturation: 100, lightness: 50, name: 'Sunset Orange' }
        };
        
        this.loadingStates = new Map();
        this.animationQueue = [];
        this.isInitialized = false;
        
        this.init();
    }
    
    /**
     * Initialize the theme optimizer
     */
    init() {
        if (this.isInitialized) return;
        
        this.detectSystemPreferences();
        this.loadSavedSettings();
        this.createThemeCustomizer();
        this.setupEventListeners();
        this.applyTheme();
        this.optimizeForDevice();
        
        this.isInitialized = true;
        console.log('ThemeOptimizer initialized successfully');
    }
    
    /**
     * Detect system preferences for accessibility
     */
    detectSystemPreferences() {
        // Detect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.customSettings.reducedMotion = true;
            document.documentElement.classList.add('reduced-motion');
        }
        
        // Detect high contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.customSettings.highContrast = true;
            document.documentElement.classList.add('high-contrast-mode');
        }
        
        // Listen for changes in system preferences
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.customSettings.reducedMotion = e.matches;
            this.toggleReducedMotion(e.matches);
        });
        
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            this.customSettings.highContrast = e.matches;
            this.toggleHighContrast(e.matches);
        });
    }
    
    /**
     * Load saved theme settings from localStorage
     */
    loadSavedSettings() {
        try {
            const saved = localStorage.getItem('themeSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.customSettings = { ...this.customSettings, ...settings };
                this.currentTheme = settings.preset || 'default';
            }
        } catch (error) {
            console.warn('Failed to load saved theme settings:', error);
        }
    }
    
    /**
     * Save current theme settings to localStorage
     */
    saveSettings() {
        try {
            const settings = {
                ...this.customSettings,
                preset: this.currentTheme
            };
            localStorage.setItem('themeSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save theme settings:', error);
        }
    }
    
    /**
     * Create the theme customizer UI
     */
    createThemeCustomizer() {
        const customizer = document.createElement('div');
        customizer.className = 'theme-customizer';
        customizer.id = 'themeCustomizer';
        
        customizer.innerHTML = `
            <div class="theme-customizer-header">
                <h3 class="theme-customizer-title">🎨 Theme Settings</h3>
            </div>
            <div class="theme-customizer-content">
                <div class="theme-option">
                    <label class="theme-option-label">Theme Presets</label>
                    <div class="theme-preset-buttons" id="themePresets">
                        ${Object.entries(this.themePresets).map(([key, preset]) => `
                            <button class="theme-preset-btn ${key === this.currentTheme ? 'active' : ''}" 
                                    data-preset="${key}">
                                ${preset.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="theme-option">
                    <label class="theme-option-label">Hue: <span id="hueValue">${this.customSettings.hue}</span></label>
                    <input type="range" class="theme-slider" id="hueSlider" 
                           min="0" max="360" value="${this.customSettings.hue}">
                </div>
                
                <div class="theme-option">
                    <label class="theme-option-label">Saturation: <span id="saturationValue">${this.customSettings.saturation}%</span></label>
                    <input type="range" class="theme-slider" id="saturationSlider" 
                           min="0" max="100" value="${this.customSettings.saturation}">
                </div>
                
                <div class="theme-option">
                    <label class="theme-option-label">Lightness: <span id="lightnessValue">${this.customSettings.lightness}%</span></label>
                    <input type="range" class="theme-slider" id="lightnessSlider" 
                           min="30" max="80" value="${this.customSettings.lightness}">
                </div>
                
                <div class="theme-option">
                    <label class="theme-option-label">
                        <input type="checkbox" id="reducedMotionToggle" ${this.customSettings.reducedMotion ? 'checked' : ''}>
                        Reduce Motion
                    </label>
                </div>
                
                <div class="theme-option">
                    <label class="theme-option-label">
                        <input type="checkbox" id="highContrastToggle" ${this.customSettings.highContrast ? 'checked' : ''}>
                        High Contrast
                    </label>
                </div>
                
                <div class="theme-option">
                    <button class="btn-primary" id="resetTheme">Reset to Default</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(customizer);
        
        // Create toggle button
        const toggle = document.createElement('button');
        toggle.className = 'theme-customizer-toggle';
        toggle.id = 'themeCustomizerToggle';
        toggle.innerHTML = '🎨';
        toggle.setAttribute('aria-label', 'Open theme customizer');
        
        document.body.appendChild(toggle);
    }
    
    /**
     * Setup event listeners for theme customization
     */
    setupEventListeners() {
        const customizer = document.getElementById('themeCustomizer');
        const toggle = document.getElementById('themeCustomizerToggle');
        
        // Toggle customizer
        toggle?.addEventListener('click', () => {
            customizer?.classList.toggle('open');
        });
        
        // Close customizer when clicking outside
        document.addEventListener('click', (e) => {
            if (!customizer?.contains(e.target) && !toggle?.contains(e.target)) {
                customizer?.classList.remove('open');
            }
        });
        
        // Preset buttons
        document.getElementById('themePresets')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-preset-btn')) {
                this.applyPreset(e.target.dataset.preset);
            }
        });
        
        // Sliders
        const hueSlider = document.getElementById('hueSlider');
        const saturationSlider = document.getElementById('saturationSlider');
        const lightnessSlider = document.getElementById('lightnessSlider');
        
        hueSlider?.addEventListener('input', (e) => {
            this.customSettings.hue = parseInt(e.target.value);
            document.getElementById('hueValue').textContent = e.target.value;
            this.applyCustomTheme();
        });
        
        saturationSlider?.addEventListener('input', (e) => {
            this.customSettings.saturation = parseInt(e.target.value);
            document.getElementById('saturationValue').textContent = e.target.value + '%';
            this.applyCustomTheme();
        });
        
        lightnessSlider?.addEventListener('input', (e) => {
            this.customSettings.lightness = parseInt(e.target.value);
            document.getElementById('lightnessValue').textContent = e.target.value + '%';
            this.applyCustomTheme();
        });
        
        // Checkboxes
        document.getElementById('reducedMotionToggle')?.addEventListener('change', (e) => {
            this.toggleReducedMotion(e.target.checked);
        });
        
        document.getElementById('highContrastToggle')?.addEventListener('change', (e) => {
            this.toggleHighContrast(e.target.checked);
        });
        
        // Reset button
        document.getElementById('resetTheme')?.addEventListener('click', () => {
            this.resetToDefault();
        });
    }
    
    /**
     * Apply a theme preset
     */
    applyPreset(presetName) {
        if (!this.themePresets[presetName]) return;
        
        const preset = this.themePresets[presetName];
        this.currentTheme = presetName;
        
        this.customSettings.hue = preset.hue;
        this.customSettings.saturation = preset.saturation;
        this.customSettings.lightness = preset.lightness;
        
        this.updateUI();
        this.applyTheme();
        this.saveSettings();
        
        // Update active preset button
        document.querySelectorAll('.theme-preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === presetName);
        });
        
        this.showNotification(`Applied ${preset.name} theme`, 'success');
    }
    
    /**
     * Apply custom theme settings
     */
    applyCustomTheme() {
        this.currentTheme = 'custom';
        this.applyTheme();
        this.saveSettings();
        
        // Deactivate preset buttons
        document.querySelectorAll('.theme-preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    /**
     * Apply the current theme to the document
     */
    applyTheme() {
        const root = document.documentElement;
        
        // Apply HSL values
        root.style.setProperty('--theme-hue', this.customSettings.hue);
        root.style.setProperty('--theme-saturation', this.customSettings.saturation + '%');
        root.style.setProperty('--theme-lightness-primary', this.customSettings.lightness + '%');
        root.style.setProperty('--theme-lightness-secondary', (this.customSettings.lightness + 7) + '%');
        root.style.setProperty('--theme-lightness-tertiary', (this.customSettings.lightness + 14) + '%');
        
        // Generate theme colors
        const primaryColor = `hsl(${this.customSettings.hue}, ${this.customSettings.saturation}%, ${this.customSettings.lightness}%)`;
        root.style.setProperty('--discord-blurple', primaryColor);
        
        // Apply theme variant class
        root.className = root.className.replace(/theme-variant-\w+/g, '');
        if (this.currentTheme !== 'default' && this.currentTheme !== 'custom') {
            root.classList.add(`theme-variant-${this.currentTheme}`);
        }
        
        // Trigger theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme, settings: this.customSettings }
        }));
    }
    
    /**
     * Toggle reduced motion
     */
    toggleReducedMotion(enabled) {
        this.customSettings.reducedMotion = enabled;
        document.documentElement.classList.toggle('reduced-motion', enabled);
        
        const toggle = document.getElementById('reducedMotionToggle');
        if (toggle) toggle.checked = enabled;
        
        this.saveSettings();
    }
    
    /**
     * Toggle high contrast mode
     */
    toggleHighContrast(enabled) {
        this.customSettings.highContrast = enabled;
        document.documentElement.classList.toggle('high-contrast-mode', enabled);
        
        const toggle = document.getElementById('highContrastToggle');
        if (toggle) toggle.checked = enabled;
        
        this.saveSettings();
    }
    
    /**
     * Reset theme to default
     */
    resetToDefault() {
        this.customSettings = {
            hue: 235,
            saturation: 86,
            lightness: 64,
            contrast: 'normal',
            reducedMotion: false,
            highContrast: false
        };
        
        this.currentTheme = 'default';
        this.updateUI();
        this.applyTheme();
        this.saveSettings();
        
        this.showNotification('Theme reset to default', 'info');
    }
    
    /**
     * Update UI elements with current settings
     */
    updateUI() {
        const hueSlider = document.getElementById('hueSlider');
        const saturationSlider = document.getElementById('saturationSlider');
        const lightnessSlider = document.getElementById('lightnessSlider');
        const hueValue = document.getElementById('hueValue');
        const saturationValue = document.getElementById('saturationValue');
        const lightnessValue = document.getElementById('lightnessValue');
        
        if (hueSlider) hueSlider.value = this.customSettings.hue;
        if (saturationSlider) saturationSlider.value = this.customSettings.saturation;
        if (lightnessSlider) lightnessSlider.value = this.customSettings.lightness;
        if (hueValue) hueValue.textContent = this.customSettings.hue;
        if (saturationValue) saturationValue.textContent = this.customSettings.saturation + '%';
        if (lightnessValue) lightnessValue.textContent = this.customSettings.lightness + '%';
    }
    
    /**
     * Optimize theme for current device
     */
    optimizeForDevice() {
        const isMobile = window.innerWidth <= 767;
        const isTablet = window.innerWidth > 767 && window.innerWidth <= 1023;
        const isHighDPI = window.devicePixelRatio > 1;
        
        const root = document.documentElement;
        
        // Device-specific optimizations
        if (isMobile) {
            root.style.setProperty('--animation-duration-fast', '0.1s');
            root.style.setProperty('--animation-duration-normal', '0.2s');
            root.style.setProperty('--animation-duration-slow', '0.3s');
        }
        
        if (isHighDPI) {
            root.style.setProperty('--border-width-normal', '0.5px');
            root.style.setProperty('--shadow-blur-normal', '2px');
        }
        
        // Performance optimizations
        if (isMobile || this.customSettings.reducedMotion) {
            root.classList.add('optimize-performance');
        }
    }
    
    /**
     * Show loading state for an element
     */
    showLoading(elementId, type = 'spinner') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        this.loadingStates.set(elementId, { element, originalContent: element.innerHTML });
        
        element.classList.add('loading-container');
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay active';
        
        let loadingContent = '';
        switch (type) {
            case 'spinner':
                loadingContent = '<div class="loading-spinner-enhanced"></div>';
                break;
            case 'dots':
                loadingContent = `
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                `;
                break;
            case 'pulse':
                element.classList.add('loading-pulse');
                return;
            default:
                loadingContent = '<div class="loading-spinner-enhanced"></div>';
        }
        
        overlay.innerHTML = loadingContent;
        element.appendChild(overlay);
    }
    
    /**
     * Hide loading state for an element
     */
    hideLoading(elementId) {
        const loadingState = this.loadingStates.get(elementId);
        if (!loadingState) return;
        
        const { element } = loadingState;
        const overlay = element.querySelector('.loading-overlay');
        
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                element.classList.remove('loading-container', 'loading-pulse');
            }, 250);
        }
        
        this.loadingStates.delete(elementId);
    }
    
    /**
     * Create skeleton loading for content
     */
    createSkeleton(container, config = {}) {
        const {
            lines = 3,
            avatar = false,
            button = false,
            card = true
        } = config;
        
        const skeleton = document.createElement('div');
        skeleton.className = card ? 'skeleton-card' : '';
        
        let content = '';
        
        if (avatar) {
            content += '<div class="skeleton skeleton-avatar"></div>';
        }
        
        for (let i = 0; i < lines; i++) {
            const width = i === lines - 1 ? 'short' : (i % 2 === 0 ? 'long' : 'medium');
            content += `<div class="skeleton skeleton-text ${width}"></div>`;
        }
        
        if (button) {
            content += '<div class="skeleton skeleton-button"></div>';
        }
        
        skeleton.innerHTML = content;
        container.appendChild(skeleton);
        
        return skeleton;
    }
    
    /**
     * Remove skeleton loading
     */
    removeSkeleton(skeleton) {
        if (skeleton && skeleton.parentNode) {
            skeleton.style.opacity = '0';
            setTimeout(() => {
                skeleton.remove();
            }, 250);
        }
    }
    
    /**
     * Add smooth animation to element
     */
    animateElement(element, animation, duration = 300) {
        if (this.customSettings.reducedMotion) return;
        
        return new Promise((resolve) => {
            element.style.animation = `${animation} ${duration}ms ease-in-out`;
            
            const handleAnimationEnd = () => {
                element.style.animation = '';
                element.removeEventListener('animationend', handleAnimationEnd);
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
        });
    }
    
    /**
     * Show notification with theme-appropriate styling
     */
    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.NotificationManager) {
            window.NotificationManager.show(message, type);
            return;
        }
        
        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `notification ${type} notification-slide-in`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 250);
        }, 3000);
    }
    
    /**
     * Get current theme information
     */
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            settings: { ...this.customSettings },
            preset: this.themePresets[this.currentTheme] || null
        };
    }
    
    /**
     * Export theme settings
     */
    exportTheme() {
        const themeData = {
            version: '1.0',
            theme: this.currentTheme,
            settings: this.customSettings,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(themeData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-${this.currentTheme}-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Import theme settings
     */
    async importTheme(file) {
        try {
            const text = await file.text();
            const themeData = JSON.parse(text);
            
            if (themeData.version && themeData.settings) {
                this.customSettings = { ...this.customSettings, ...themeData.settings };
                this.currentTheme = themeData.theme || 'custom';
                
                this.updateUI();
                this.applyTheme();
                this.saveSettings();
                
                this.showNotification('Theme imported successfully', 'success');
            } else {
                throw new Error('Invalid theme file format');
            }
        } catch (error) {
            console.error('Failed to import theme:', error);
            this.showNotification('Failed to import theme', 'error');
        }
    }
}

// Initialize theme optimizer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeOptimizer = new ThemeOptimizer();
    });
} else {
    window.themeOptimizer = new ThemeOptimizer();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeOptimizer;
}