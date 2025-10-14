/**
 * Utility Functions for Service Provider Dashboard
 * Provides DOM manipulation, event handling, and common utilities
 */

// DOM Manipulation Utilities
const DOM = {
    /**
     * Select a single element
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {Element|null}
     */
    select(selector, parent = document) {
        return parent.querySelector(selector);
    },

    /**
     * Select multiple elements
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {NodeList}
     */
    selectAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },

    /**
     * Create an element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string|Element|Array} content - Element content
     * @returns {Element}
     */
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key === 'disabled') {
                // Handle disabled attribute properly - only set if true
                if (value === true) {
                    element.setAttribute('disabled', '');
                }
                // If value is false, don't set the attribute at all
            } else if (key === 'checked') {
                // Handle checked attribute properly - only set if true
                if (value === true) {
                    element.setAttribute('checked', '');
                }
                // If value is false, don't set the attribute at all
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Set content
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Element) {
            element.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Element) {
                    element.appendChild(child);
                }
            });
        }
        
        return element;
    },

    /**
     * Add class(es) to element
     * @param {Element} element - Target element
     * @param {string|Array} classes - Class name(s) to add
     */
    addClass(element, classes) {
        if (typeof classes === 'string') {
            element.classList.add(classes);
        } else if (Array.isArray(classes)) {
            element.classList.add(...classes);
        }
    },

    /**
     * Remove class(es) from element
     * @param {Element} element - Target element
     * @param {string|Array} classes - Class name(s) to remove
     */
    removeClass(element, classes) {
        if (typeof classes === 'string') {
            element.classList.remove(classes);
        } else if (Array.isArray(classes)) {
            element.classList.remove(...classes);
        }
    },

    /**
     * Toggle class on element
     * @param {Element} element - Target element
     * @param {string} className - Class name to toggle
     * @returns {boolean} - Whether class is now present
     */
    toggleClass(element, className) {
        return element.classList.toggle(className);
    },

    /**
     * Check if element has class
     * @param {Element} element - Target element
     * @param {string} className - Class name to check
     * @returns {boolean}
     */
    hasClass(element, className) {
        return element.classList.contains(className);
    },

    /**
     * Set element attributes
     * @param {Element} element - Target element
     * @param {Object} attributes - Attributes to set
     */
    setAttributes(element, attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    },

    /**
     * Remove element from DOM
     * @param {Element} element - Element to remove
     */
    remove(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },

    /**
     * Clear all children from element
     * @param {Element} element - Parent element
     */
    empty(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    /**
     * Show element
     * @param {Element} element - Element to show
     */
    show(element) {
        element.style.display = '';
        element.classList.remove('hidden');
    },

    /**
     * Hide element
     * @param {Element} element - Element to hide
     */
    hide(element) {
        element.classList.add('hidden');
    },

    /**
     * Get element's offset position
     * @param {Element} element - Target element
     * @returns {Object} - {top, left, width, height}
     */
    getOffset(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset,
            width: rect.width,
            height: rect.height
        };
    }
};

// Event Handling Utilities
const Events = {
    /**
     * Add event listener with optional delegation
     * @param {Element|string} target - Target element or selector for delegation
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Element} parent - Parent for delegation (optional)
     */
    on(target, event, handler, parent = document) {
        if (typeof target === 'string') {
            // Event delegation
            parent.addEventListener(event, (e) => {
                if (e.target.matches(target) || e.target.closest(target)) {
                    handler.call(e.target.closest(target) || e.target, e);
                }
            });
        } else {
            // Direct event binding
            target.addEventListener(event, handler);
        }
    },

    /**
     * Remove event listener
     * @param {Element} target - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    off(target, event, handler) {
        target.removeEventListener(event, handler);
    },

    /**
     * Trigger custom event
     * @param {Element} target - Target element
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail data
     */
    trigger(target, eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        target.dispatchEvent(event);
    },

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
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
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} - Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Animation Utilities
const Animation = {
    /**
     * Fade in element
     * @param {Element} element - Target element
     * @param {number} duration - Animation duration in ms
     */
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    /**
     * Fade out element
     * @param {Element} element - Target element
     * @param {number} duration - Animation duration in ms
     */
    fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    },

    /**
     * Slide down element
     * @param {Element} element - Target element
     * @param {number} duration - Animation duration in ms
     */
    slideDown(element, duration = 300) {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight;
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.height = (targetHeight * progress) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        };
        
        requestAnimationFrame(animate);
    },

    /**
     * Slide up element
     * @param {Element} element - Target element
     * @param {number} duration - Animation duration in ms
     */
    slideUp(element, duration = 300) {
        const startHeight = element.offsetHeight;
        const start = performance.now();
        
        element.style.overflow = 'hidden';
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.height = (startHeight * (1 - progress)) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// Storage Utilities
const Storage = {
    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} - Stored value or default
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    /**
     * Clear all localStorage
     */
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

// Validation Utilities
const Validation = {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    isEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate required field
     * @param {*} value - Value to validate
     * @returns {boolean}
     */
    isRequired(value) {
        return value !== null && value !== undefined && value !== '';
    },

    /**
     * Validate minimum length
     * @param {string} value - Value to validate
     * @param {number} minLength - Minimum length
     * @returns {boolean}
     */
    minLength(value, minLength) {
        return value && value.length >= minLength;
    },

    /**
     * Validate maximum length
     * @param {string} value - Value to validate
     * @param {number} maxLength - Maximum length
     * @returns {boolean}
     */
    maxLength(value, maxLength) {
        return !value || value.length <= maxLength;
    },

    /**
     * Validate number range
     * @param {number} value - Value to validate
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {boolean}
     */
    inRange(value, min, max) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    /**
     * Validate positive number
     * @param {*} value - Value to validate
     * @returns {boolean}
     */
    isPositiveNumber(value) {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0;
    }
};

// Format Utilities
const Format = {
    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency type
     * @returns {string}
     */
    currency(amount, currency = 'USD') {
        const formatters = {
            'USD': (amt) => `$${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            'GOLD': (amt) => `${amt.toLocaleString('en-US')} G`,
            'TOMAN': (amt) => `${amt.toLocaleString('fa-IR')} ﷼`
        };
        
        const formatter = formatters[currency.toUpperCase()];
        return formatter ? formatter(amount) : `${amount} ${currency}`;
    },

    /**
     * Format date
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type ('short', 'long', 'time')
     * @returns {string}
     */
    date(date, format = 'short') {
        const d = new Date(date);
        
        const formats = {
            'short': { month: 'short', day: 'numeric', year: 'numeric' },
            'long': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            'time': { hour: '2-digit', minute: '2-digit' },
            'datetime': { 
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }
        };
        
        return d.toLocaleDateString('en-US', formats[format] || formats.short);
    },

    /**
     * Format relative time
     * @param {Date|string} date - Date to format
     * @returns {string}
     */
    timeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];
        
        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'just now';
    },

    /**
     * Truncate text
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add
     * @returns {string}
     */
    truncate(text, maxLength = 100, suffix = '...') {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    },

    /**
     * Capitalize first letter
     * @param {string} text - Text to capitalize
     * @returns {string}
     */
    capitalize(text) {
        if (!text) return text;
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    /**
     * Convert to title case
     * @param {string} text - Text to convert
     * @returns {string}
     */
    titleCase(text) {
        if (!text) return text;
        return text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
};

// HTTP Utilities (for future API integration)
const HTTP = {
    /**
     * Make HTTP request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise}
     */
    async request(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const config = { ...defaultOptions, ...options };
        
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('HTTP request failed:', error);
            throw error;
        }
    },

    /**
     * GET request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise}
     */
    get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    },

    /**
     * POST request
     * @param {string} url - Request URL
     * @param {*} data - Request data
     * @param {Object} options - Request options
     * @returns {Promise}
     */
    post(url, data, options = {}) {
        return this.request(url, { ...options, method: 'POST', body: data });
    },

    /**
     * PUT request
     * @param {string} url - Request URL
     * @param {*} data - Request data
     * @param {Object} options - Request options
     * @returns {Promise}
     */
    put(url, data, options = {}) {
        return this.request(url, { ...options, method: 'PUT', body: data });
    },

    /**
     * DELETE request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise}
     */
    delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
};

// Export utilities for use in other modules
window.Utils = {
    DOM,
    Events,
    Animation,
    Storage,
    Validation,
    Format,
    HTTP
};