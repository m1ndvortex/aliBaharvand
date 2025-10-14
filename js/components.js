/**
 * Reusable UI Components for Service Provider Dashboard
 * Discord-inspired component library
 */

const Components = {
    /**
     * Create a notification component
     * @param {Object} options - Notification options
     * @returns {Element} Notification element
     */
    createNotification(options = {}) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 5000,
            closable = true
        } = options;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const notification = Utils.DOM.create('div', {
            className: `notification ${type}`
        });

        const icon = Utils.DOM.create('div', {
            className: 'notification-icon'
        }, icons[type] || icons.info);

        const content = Utils.DOM.create('div', {
            className: 'notification-content'
        });

        if (title) {
            const titleEl = Utils.DOM.create('div', {
                className: 'notification-title'
            }, title);
            content.appendChild(titleEl);
        }

        if (message) {
            const messageEl = Utils.DOM.create('p', {
                className: 'notification-message'
            }, message);
            content.appendChild(messageEl);
        }

        notification.appendChild(icon);
        notification.appendChild(content);

        if (closable) {
            const closeBtn = Utils.DOM.create('button', {
                className: 'notification-close',
                onclick: () => this.removeNotification(notification)
            }, '×');
            notification.appendChild(closeBtn);
        }

        return notification;
    },

    /**
     * Show notification
     * @param {Object} options - Notification options
     */
    showNotification(options = {}) {
        const container = Utils.DOM.select('#notificationContainer');
        const notification = this.createNotification(options);
        
        container.appendChild(notification);
        
        // Trigger show animation
        setTimeout(() => {
            Utils.DOM.addClass(notification, 'show');
        }, 10);

        // Auto-remove if duration specified
        if (options.duration && options.duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, options.duration);
        }

        return notification;
    },

    /**
     * Remove notification
     * @param {Element} notification - Notification element
     */
    removeNotification(notification) {
        Utils.DOM.removeClass(notification, 'show');
        setTimeout(() => {
            Utils.DOM.remove(notification);
        }, 300);
    },

    /**
     * Create a modal component
     * @param {Object} options - Modal options
     * @returns {Element} Modal element
     */
    createModal(options = {}) {
        const {
            title = '',
            content = '',
            size = 'medium',
            closable = true,
            footer = null
        } = options;

        const modal = Utils.DOM.create('div', {
            className: `modal-container modal-${size}`
        });

        // Header
        if (title || closable) {
            const header = Utils.DOM.create('div', {
                className: 'modal-header'
            });

            if (title) {
                const titleEl = Utils.DOM.create('h3', {
                    className: 'modal-title'
                }, title);
                header.appendChild(titleEl);
            }

            if (closable) {
                const closeBtn = Utils.DOM.create('button', {
                    className: 'modal-close',
                    onclick: () => this.closeModal()
                }, '×');
                header.appendChild(closeBtn);
            }

            modal.appendChild(header);
        }

        // Body
        const body = Utils.DOM.create('div', {
            className: 'modal-body'
        });

        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof Element) {
            body.appendChild(content);
        }

        modal.appendChild(body);

        // Footer
        if (footer) {
            const footerEl = Utils.DOM.create('div', {
                className: 'modal-footer'
            });

            if (Array.isArray(footer)) {
                footer.forEach(button => footerEl.appendChild(button));
            } else if (footer instanceof Element) {
                footerEl.appendChild(footer);
            } else if (typeof footer === 'string') {
                footerEl.innerHTML = footer;
            }

            modal.appendChild(footerEl);
        }

        return modal;
    },

    /**
     * Show modal
     * @param {Object} options - Modal options
     */
    showModal(options = {}) {
        const overlay = Utils.DOM.select('#modalOverlay');
        const container = Utils.DOM.select('#modalContainer');
        
        // Clear existing modal
        Utils.DOM.empty(container);
        
        // Create and add new modal
        const modal = this.createModal(options);
        container.appendChild(modal);
        
        // Show overlay
        Utils.DOM.addClass(overlay, 'active');
        
        // Store modal data in state
        AppState.setState('ui.modals', {
            active: options.id || 'generic',
            data: options.data || null
        });

        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && options.closable !== false) {
                this.closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        return modal;
    },

    /**
     * Close modal
     */
    closeModal() {
        const overlay = Utils.DOM.select('#modalOverlay');
        Utils.DOM.removeClass(overlay, 'active');
        
        // Clear modal state
        AppState.setState('ui.modals', {
            active: null,
            data: null
        });
    },

    /**
     * Create a card component
     * @param {Object} options - Card options
     * @returns {Element} Card element
     */
    createCard(options = {}) {
        const {
            title = '',
            content = '',
            footer = null,
            className = '',
            actions = []
        } = options;

        const card = Utils.DOM.create('div', {
            className: `card ${className}`
        });

        // Header
        if (title || actions.length > 0) {
            const header = Utils.DOM.create('div', {
                className: 'card-header'
            });

            if (title) {
                const titleEl = Utils.DOM.create('h3', {
                    className: 'card-title'
                }, title);
                header.appendChild(titleEl);
            }

            if (actions.length > 0) {
                const actionsEl = Utils.DOM.create('div', {
                    className: 'card-actions'
                });
                actions.forEach(action => actionsEl.appendChild(action));
                header.appendChild(actionsEl);
            }

            card.appendChild(header);
        }

        // Body
        const body = Utils.DOM.create('div', {
            className: 'card-body'
        });

        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof Element) {
            body.appendChild(content);
        }

        card.appendChild(body);

        // Footer
        if (footer) {
            const footerEl = Utils.DOM.create('div', {
                className: 'card-footer'
            });

            if (typeof footer === 'string') {
                footerEl.innerHTML = footer;
            } else if (footer instanceof Element) {
                footerEl.appendChild(footer);
            }

            card.appendChild(footerEl);
        }

        return card;
    },

    /**
     * Create a button component
     * @param {Object} options - Button options
     * @returns {Element} Button element
     */
    createButton(options = {}) {
        const {
            text = '',
            icon = '',
            variant = 'secondary',
            size = 'normal',
            disabled = false,
            loading = false,
            onClick = null
        } = options;

        const button = Utils.DOM.create('button', {
            className: `btn-${variant} ${size !== 'normal' ? `btn-${size}` : ''}`,
            disabled: disabled || loading,
            onclick: onClick
        });

        if (loading) {
            const spinner = Utils.DOM.create('div', {
                className: 'loading-spinner'
            });
            button.appendChild(spinner);
        } else {
            if (icon) {
                const iconEl = Utils.DOM.create('span', {
                    className: 'btn-icon'
                }, icon);
                button.appendChild(iconEl);
            }

            if (text) {
                const textEl = Utils.DOM.create('span', {
                    className: 'btn-text'
                }, text);
                button.appendChild(textEl);
            }
        }

        return button;
    },

    /**
     * Create a form group component
     * @param {Object} options - Form group options
     * @returns {Element} Form group element
     */
    createFormGroup(options = {}) {
        const {
            label = '',
            type = 'text',
            name = '',
            value = '',
            placeholder = '',
            required = false,
            error = '',
            help = '',
            options: selectOptions = []
        } = options;

        const group = Utils.DOM.create('div', {
            className: 'form-group'
        });

        // Label
        if (label) {
            const labelEl = Utils.DOM.create('label', {
                className: 'form-label',
                for: name
            }, label + (required ? ' *' : ''));
            group.appendChild(labelEl);
        }

        // Input
        let input;
        if (type === 'select') {
            input = Utils.DOM.create('select', {
                className: `form-input ${error ? 'error' : ''}`,
                name: name,
                id: name,
                required: required
            });

            selectOptions.forEach(option => {
                const optionEl = Utils.DOM.create('option', {
                    value: option.value,
                    selected: option.value === value
                }, option.label);
                input.appendChild(optionEl);
            });
        } else if (type === 'textarea') {
            input = Utils.DOM.create('textarea', {
                className: `form-input ${error ? 'error' : ''}`,
                name: name,
                id: name,
                placeholder: placeholder,
                required: required
            }, value);
        } else {
            input = Utils.DOM.create('input', {
                className: `form-input ${error ? 'error' : ''}`,
                type: type,
                name: name,
                id: name,
                value: value,
                placeholder: placeholder,
                required: required
            });
        }

        group.appendChild(input);

        // Error message
        if (error) {
            const errorEl = Utils.DOM.create('div', {
                className: 'form-error'
            }, error);
            group.appendChild(errorEl);
        }

        // Help text
        if (help) {
            const helpEl = Utils.DOM.create('div', {
                className: 'form-help'
            }, help);
            group.appendChild(helpEl);
        }

        return group;
    },

    /**
     * Create a table component
     * @param {Object} options - Table options
     * @returns {Element} Table element
     */
    createTable(options = {}) {
        const {
            columns = [],
            data = [],
            className = '',
            sortable = false,
            selectable = false
        } = options;

        const container = Utils.DOM.create('div', {
            className: `table-container ${className}`
        });

        const table = Utils.DOM.create('table', {
            className: 'table'
        });

        // Header
        const thead = Utils.DOM.create('thead');
        const headerRow = Utils.DOM.create('tr');

        if (selectable) {
            const selectAllTh = Utils.DOM.create('th');
            const selectAllCheckbox = Utils.DOM.create('input', {
                type: 'checkbox',
                onchange: (e) => this.handleSelectAll(e, table)
            });
            selectAllTh.appendChild(selectAllCheckbox);
            headerRow.appendChild(selectAllTh);
        }

        columns.forEach(column => {
            const th = Utils.DOM.create('th', {
                className: sortable ? 'sortable' : ''
            }, column.label || column.key);

            if (sortable) {
                th.addEventListener('click', () => {
                    this.handleSort(column.key, table, data);
                });
            }

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = Utils.DOM.create('tbody');
        
        data.forEach((row, index) => {
            const tr = Utils.DOM.create('tr', {
                dataset: { index: index }
            });

            if (selectable) {
                const selectTd = Utils.DOM.create('td');
                const selectCheckbox = Utils.DOM.create('input', {
                    type: 'checkbox',
                    value: row.id || index
                });
                selectTd.appendChild(selectCheckbox);
                tr.appendChild(selectTd);
            }

            columns.forEach(column => {
                const td = Utils.DOM.create('td');
                const value = row[column.key];

                if (column.render && typeof column.render === 'function') {
                    const rendered = column.render(value, row, index);
                    if (typeof rendered === 'string') {
                        td.innerHTML = rendered;
                    } else if (rendered instanceof Element) {
                        td.appendChild(rendered);
                    }
                } else {
                    td.textContent = value || '';
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        container.appendChild(table);

        return container;
    },

    /**
     * Create a status badge component
     * @param {Object} options - Badge options
     * @returns {Element} Badge element
     */
    createStatusBadge(options = {}) {
        const {
            status = '',
            text = '',
            className = ''
        } = options;

        const badge = Utils.DOM.create('span', {
            className: `status-badge ${status.toLowerCase().replace(/\s+/g, '-')} ${className}`
        }, text || status);

        return badge;
    },

    /**
     * Create a loading spinner component
     * @param {Object} options - Spinner options
     * @returns {Element} Spinner element
     */
    createLoadingSpinner(options = {}) {
        const {
            size = 'normal',
            className = ''
        } = options;

        const spinner = Utils.DOM.create('div', {
            className: `loading-spinner ${size !== 'normal' ? `spinner-${size}` : ''} ${className}`
        });

        return spinner;
    },

    /**
     * Create a tooltip component
     * @param {Element} element - Element to add tooltip to
     * @param {Object} options - Tooltip options
     */
    createTooltip(element, options = {}) {
        const {
            text = '',
            position = 'top'
        } = options;

        Utils.DOM.addClass(element, 'tooltip');

        const tooltipContent = Utils.DOM.create('div', {
            className: `tooltip-content tooltip-${position}`
        }, text);

        element.appendChild(tooltipContent);
    },

    /**
     * Handle select all checkbox
     * @param {Event} event - Change event
     * @param {Element} table - Table element
     */
    handleSelectAll(event, table) {
        const checkboxes = Utils.DOM.selectAll('tbody input[type="checkbox"]', table);
        checkboxes.forEach(checkbox => {
            checkbox.checked = event.target.checked;
        });
    },

    /**
     * Handle table sorting
     * @param {string} key - Column key to sort by
     * @param {Element} table - Table element
     * @param {Array} data - Table data
     */
    handleSort(key, table, data) {
        // This would implement sorting logic
        // For now, just add visual feedback
        const headers = Utils.DOM.selectAll('th.sortable', table);
        headers.forEach(header => {
            Utils.DOM.removeClass(header, 'sort-asc', 'sort-desc');
        });

        const clickedHeader = Utils.DOM.select(`th.sortable:contains("${key}")`, table);
        if (clickedHeader) {
            Utils.DOM.addClass(clickedHeader, 'sort-asc');
        }
    },

    /**
     * Create a grid layout
     * @param {Object} options - Grid options
     * @returns {Element} Grid element
     */
    createGrid(options = {}) {
        const {
            columns = 3,
            gap = 'md',
            className = '',
            items = []
        } = options;

        const grid = Utils.DOM.create('div', {
            className: `grid grid-cols-${columns} gap-${gap} ${className}`
        });

        items.forEach(item => {
            if (item instanceof Element) {
                grid.appendChild(item);
            } else if (typeof item === 'string') {
                const div = Utils.DOM.create('div', {}, item);
                grid.appendChild(div);
            }
        });

        return grid;
    },

    /**
     * Create a sidebar navigation item
     * @param {Object} options - Navigation item options
     * @returns {Element} Navigation item element
     */
    createSidebarItem(options = {}) {
        const {
            id = '',
            icon = '',
            label = '',
            active = false,
            disabled = false,
            badge = null,
            onClick = null
        } = options;

        const item = Utils.DOM.create('button', {
            className: `sidebar-item ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`,
            dataset: { id: id },
            onclick: onClick
        });
        
        // Only set disabled attribute if actually disabled
        if (disabled) {
            item.disabled = true;
        }

        // Icon
        if (icon) {
            const iconEl = Utils.DOM.create('span', {
                className: 'item-icon'
            }, icon);
            item.appendChild(iconEl);
        }

        // Label container
        const labelContainer = Utils.DOM.create('span', {
            className: 'item-label-container'
        });

        if (label) {
            const labelEl = Utils.DOM.create('span', {
                className: 'item-label'
            }, label);
            labelContainer.appendChild(labelEl);
        }

        // Badge
        if (badge) {
            const badgeEl = Utils.DOM.create('span', {
                className: 'item-badge'
            }, badge);
            labelContainer.appendChild(badgeEl);
        }

        item.appendChild(labelContainer);

        // Loading indicator
        if (AppState.isLoading('content') && active) {
            const loadingEl = Utils.DOM.create('span', {
                className: 'item-loading'
            });
            item.appendChild(loadingEl);
        }

        return item;
    },

    /**
     * Create service management interface
     * @param {Object} options - Service management options
     * @returns {Element} Service management element
     */
    createServiceManagement(options = {}) {
        const {
            services = [],
            onCreateService = null,
            onEditService = null,
            onDeleteService = null,
            onToggleService = null
        } = options;

        const container = Utils.DOM.create('div', {
            className: 'service-management'
        });

        // Header
        const header = this.createServiceHeader(onCreateService);
        container.appendChild(header);

        // Filters
        const filters = this.createServiceFilters();
        container.appendChild(filters);

        // Services grid
        const grid = this.createServicesGrid({
            services,
            onEditService,
            onDeleteService,
            onToggleService
        });
        container.appendChild(grid);

        return container;
    },

    /**
     * Create service header with create button
     * @param {Function} onCreateService - Create service callback
     * @returns {Element} Service header element
     */
    createServiceHeader(onCreateService) {
        const header = Utils.DOM.create('div', {
            className: 'service-header'
        });

        const title = Utils.DOM.create('h2', {
            className: 'service-title'
        }, 'My Services');

        const createBtn = this.createButton({
            text: 'Create New Service',
            icon: '➕',
            variant: 'primary',
            onClick: onCreateService
        });

        header.appendChild(title);
        header.appendChild(createBtn);

        return header;
    },

    /**
     * Create service filters
     * @returns {Element} Service filters element
     */
    createServiceFilters() {
        const filters = Utils.DOM.create('div', {
            className: 'service-filters'
        });

        // Service type filter
        const typeFilter = this.createFormGroup({
            label: 'Service Type',
            type: 'select',
            name: 'serviceType',
            options: [
                { value: 'all', label: 'All Services' },
                { value: 'mythic_plus', label: 'Mythic+' },
                { value: 'leveling', label: 'Leveling' },
                { value: 'delves', label: 'Delves' },
                { value: 'custom_boost', label: 'Custom Boost' }
            ]
        });

        // Status filter
        const statusFilter = this.createFormGroup({
            label: 'Status',
            type: 'select',
            name: 'status',
            options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
            ]
        });

        // Search input
        const searchInput = this.createFormGroup({
            label: 'Search',
            type: 'text',
            name: 'search',
            placeholder: 'Search services...'
        });

        filters.appendChild(typeFilter);
        filters.appendChild(statusFilter);
        filters.appendChild(searchInput);

        return filters;
    },

    /**
     * Create services grid
     * @param {Object} options - Grid options
     * @returns {Element} Services grid element
     */
    createServicesGrid(options = {}) {
        const {
            services = [],
            onEditService = null,
            onDeleteService = null,
            onToggleService = null
        } = options;

        const grid = Utils.DOM.create('div', {
            className: 'services-grid'
        });

        if (services.length === 0) {
            const emptyState = this.createEmptyState({
                icon: '📝',
                title: 'No Services Yet',
                message: 'Create your first service to start earning!'
            });
            grid.appendChild(emptyState);
            return grid;
        }

        services.forEach(service => {
            const serviceCard = this.createServiceCard({
                service,
                onEdit: () => onEditService && onEditService(service),
                onDelete: () => onDeleteService && onDeleteService(service),
                onToggle: () => onToggleService && onToggleService(service)
            });
            grid.appendChild(serviceCard);
        });

        return grid;
    },

    /**
     * Create service card
     * @param {Object} options - Service card options
     * @returns {Element} Service card element
     */
    createServiceCard(options = {}) {
        const {
            service = {},
            onEdit = null,
            onDelete = null,
            onToggle = null
        } = options;

        const card = Utils.DOM.create('div', {
            className: `service-card ${service.status === 'active' ? 'active' : 'inactive'}`
        });

        // Header
        const header = Utils.DOM.create('div', {
            className: 'service-card-header'
        });

        const typeIcon = this.getServiceTypeIcon(service.serviceType);
        const icon = Utils.DOM.create('span', {
            className: 'service-icon'
        }, typeIcon);

        const statusBadge = this.createStatusBadge({
            status: service.status,
            text: service.status === 'active' ? 'Active' : 'Inactive'
        });

        header.appendChild(icon);
        header.appendChild(statusBadge);
        card.appendChild(header);

        // Content
        const content = Utils.DOM.create('div', {
            className: 'service-card-content'
        });

        const title = Utils.DOM.create('h3', {
            className: 'service-card-title'
        }, service.title || 'Untitled Service');

        const description = Utils.DOM.create('p', {
            className: 'service-card-description'
        }, this.truncateText(service.description || '', 100));

        const pricing = Utils.DOM.create('div', {
            className: 'service-pricing'
        });

        const goldPrice = Utils.DOM.create('span', {
            className: 'price-item gold'
        }, `🪙 ${service.priceGold || 0}G`);

        const usdPrice = Utils.DOM.create('span', {
            className: 'price-item usd'
        }, `💵 $${(service.priceUsd || 0).toFixed(2)}`);

        const tomanPrice = Utils.DOM.create('span', {
            className: 'price-item toman'
        }, `﷼ ${(service.priceToman || 0).toLocaleString()}`);

        pricing.appendChild(goldPrice);
        pricing.appendChild(usdPrice);
        pricing.appendChild(tomanPrice);

        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(pricing);
        card.appendChild(content);

        // Actions
        const actions = Utils.DOM.create('div', {
            className: 'service-card-actions'
        });

        const toggleBtn = this.createButton({
            text: service.status === 'active' ? 'Deactivate' : 'Activate',
            variant: service.status === 'active' ? 'warning' : 'success',
            size: 'sm',
            onClick: onToggle
        });

        const editBtn = this.createButton({
            text: 'Edit',
            icon: '✏️',
            variant: 'secondary',
            size: 'sm',
            onClick: onEdit
        });

        const deleteBtn = this.createButton({
            text: 'Delete',
            icon: '🗑️',
            variant: 'error',
            size: 'sm',
            onClick: onDelete
        });

        actions.appendChild(toggleBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        card.appendChild(actions);

        return card;
    },

    /**
     * Create service form modal
     * @param {Object} options - Form options
     * @returns {Element} Service form element
     */
    createServiceForm(options = {}) {
        const {
            service = null,
            onSubmit = null,
            onCancel = null
        } = options;

        const isEdit = !!service;
        const form = Utils.DOM.create('form', {
            className: 'service-form',
            onsubmit: (e) => {
                e.preventDefault();
                if (onSubmit) {
                    const formData = new FormData(e.target);
                    const serviceData = Object.fromEntries(formData.entries());
                    onSubmit(serviceData);
                }
            }
        });

        // Service Type
        const typeGroup = this.createFormGroup({
            label: 'Service Type',
            type: 'select',
            name: 'serviceType',
            value: service?.serviceType || '',
            required: true,
            options: [
                { value: '', label: 'Select service type...' },
                { value: 'mythic_plus', label: 'Mythic+ Dungeons' },
                { value: 'leveling', label: 'Leveling' },
                { value: 'delves', label: 'Delves' },
                { value: 'custom_boost', label: 'Custom Boost' }
            ]
        });

        // Title
        const titleGroup = this.createFormGroup({
            label: 'Service Title',
            type: 'text',
            name: 'title',
            value: service?.title || '',
            placeholder: 'Enter service title...',
            required: true,
            help: 'Choose a clear, descriptive title for your service'
        });

        // Description
        const descriptionGroup = this.createFormGroup({
            label: 'Description',
            type: 'textarea',
            name: 'description',
            value: service?.description || '',
            placeholder: 'Describe your service in detail...',
            required: true,
            help: 'Provide detailed information about what you offer'
        });

        // Pricing section
        const pricingTitle = Utils.DOM.create('h4', {
            className: 'form-section-title'
        }, 'Pricing');

        const goldGroup = this.createFormGroup({
            label: 'Gold Price',
            type: 'number',
            name: 'priceGold',
            value: service?.priceGold || '',
            placeholder: '0',
            required: true,
            help: 'Price in WoW Gold'
        });

        const usdGroup = this.createFormGroup({
            label: 'USD Price',
            type: 'number',
            name: 'priceUsd',
            value: service?.priceUsd || '',
            placeholder: '0.00',
            step: '0.01',
            required: true,
            help: 'Price in US Dollars'
        });

        const tomanGroup = this.createFormGroup({
            label: 'Toman Price',
            type: 'number',
            name: 'priceToman',
            value: service?.priceToman || '',
            placeholder: '0',
            required: true,
            help: 'Price in Iranian Toman'
        });

        // Additional details
        const detailsTitle = Utils.DOM.create('h4', {
            className: 'form-section-title'
        }, 'Service Details');

        const timeGroup = this.createFormGroup({
            label: 'Estimated Time',
            type: 'text',
            name: 'estimatedTime',
            value: service?.estimatedTime || '',
            placeholder: 'e.g., 1-2 hours',
            help: 'How long does this service typically take?'
        });

        const requirementsGroup = this.createFormGroup({
            label: 'Requirements',
            type: 'textarea',
            name: 'requirements',
            value: service?.requirements || '',
            placeholder: 'List any requirements for this service...',
            help: 'What does the buyer need to provide or have?'
        });

        // Form actions
        const actions = Utils.DOM.create('div', {
            className: 'form-actions'
        });

        const cancelBtn = this.createButton({
            text: 'Cancel',
            variant: 'secondary',
            onClick: onCancel
        });

        const submitBtn = this.createButton({
            text: isEdit ? 'Update Service' : 'Create Service',
            variant: 'primary',
            type: 'submit'
        });

        actions.appendChild(cancelBtn);
        actions.appendChild(submitBtn);

        // Append all elements
        form.appendChild(typeGroup);
        form.appendChild(titleGroup);
        form.appendChild(descriptionGroup);
        form.appendChild(pricingTitle);
        form.appendChild(goldGroup);
        form.appendChild(usdGroup);
        form.appendChild(tomanGroup);
        form.appendChild(detailsTitle);
        form.appendChild(timeGroup);
        form.appendChild(requirementsGroup);
        form.appendChild(actions);

        return form;
    },

    /**
     * Create empty state component
     * @param {Object} options - Empty state options
     * @returns {Element} Empty state element
     */
    createEmptyState(options = {}) {
        const {
            icon = '📭',
            title = 'No Data',
            message = 'Nothing to show here yet.'
        } = options;

        const container = Utils.DOM.create('div', {
            className: 'empty-state'
        });

        const iconEl = Utils.DOM.create('div', {
            className: 'empty-state-icon'
        }, icon);

        const titleEl = Utils.DOM.create('h3', {
            className: 'empty-state-title'
        }, title);

        const messageEl = Utils.DOM.create('p', {
            className: 'empty-state-message'
        }, message);

        container.appendChild(iconEl);
        container.appendChild(titleEl);
        container.appendChild(messageEl);

        return container;
    },

    /**
     * Get service type icon
     * @param {string} serviceType - Service type
     * @returns {string} Icon emoji
     */
    getServiceTypeIcon(serviceType) {
        const icons = {
            'mythic_plus': '🏰',
            'leveling': '📈',
            'delves': '⛏️',
            'custom_boost': '⚡',
            'raid': '🛡️'
        };
        return icons[serviceType] || '📝';
    },

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} length - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
};

// Export components for use in other modules
window.Components = Components;