/**
 * Service Management Module
 * Handles all service-related operations for the Service Provider Dashboard
 */

class ServiceManager {
    constructor() {
        this.services = new Map();
        this.filteredServices = [];
        this.currentFilters = {
            serviceType: 'all',
            status: 'all',
            search: ''
        };
        
        // Initialize with mock data
        this.initializeMockData();
        
        // Bind methods
        this.handleCreateService = this.handleCreateService.bind(this);
        this.handleEditService = this.handleEditService.bind(this);
        this.handleDeleteService = this.handleDeleteService.bind(this);
        this.handleToggleService = this.handleToggleService.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
    }

    /**
     * Initialize with mock data
     */
    initializeMockData() {
        if (typeof MockData !== 'undefined' && MockData.services) {
            MockData.services.forEach(service => {
                this.services.set(service.id, { ...service });
            });
        }
        this.applyFilters();
    }

    /**
     * Get services for current workspace
     * @returns {Array} Filtered services
     */
    getServicesForWorkspace() {
        const workspaceContext = AppState.getWorkspaceContext();
        const userId = AppState.getState('user.id');
        
        return Array.from(this.services.values()).filter(service => {
            if (workspaceContext.type === 'personal') {
                return service.workspaceType === 'personal' && service.workspaceOwnerId === userId;
            } else if (workspaceContext.type === 'team') {
                return service.workspaceType === 'team' && service.workspaceOwnerId === workspaceContext.id;
            }
            return false;
        });
    }

    /**
     * Apply current filters to services
     */
    applyFilters() {
        let services = this.getServicesForWorkspace();

        // Apply service type filter
        if (this.currentFilters.serviceType !== 'all') {
            services = services.filter(service => 
                service.serviceType === this.currentFilters.serviceType
            );
        }

        // Apply status filter
        if (this.currentFilters.status !== 'all') {
            services = services.filter(service => 
                service.status === this.currentFilters.status
            );
        }

        // Apply search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            services = services.filter(service => 
                service.title.toLowerCase().includes(searchTerm) ||
                service.description.toLowerCase().includes(searchTerm)
            );
        }

        this.filteredServices = services;
    }

    /**
     * Handle filter changes
     * @param {string} filterType - Type of filter
     * @param {string} value - Filter value
     */
    handleFilterChange(filterType, value) {
        this.currentFilters[filterType] = value;
        this.applyFilters();
        this.renderServices();
    }

    /**
     * Handle create service
     */
    handleCreateService() {
        const form = Components.createServiceForm({
            onSubmit: (serviceData) => this.createService(serviceData),
            onCancel: () => Components.closeModal()
        });

        Components.showModal({
            title: 'Create New Service',
            content: form,
            size: 'large',
            closable: true
        });
    }

    /**
     * Handle edit service
     * @param {Object} service - Service to edit
     */
    handleEditService(service) {
        const form = Components.createServiceForm({
            service: service,
            onSubmit: (serviceData) => this.updateService(service.id, serviceData),
            onCancel: () => Components.closeModal()
        });

        Components.showModal({
            title: 'Edit Service',
            content: form,
            size: 'large',
            closable: true
        });
    }

    /**
     * Handle delete service
     * @param {Object} service - Service to delete
     */
    handleDeleteService(service) {
        const confirmDialog = Utils.DOM.create('div', {
            className: 'confirmation-dialog'
        });

        const icon = Utils.DOM.create('div', {
            className: 'confirmation-icon'
        }, '⚠️');

        const title = Utils.DOM.create('h3', {
            className: 'confirmation-title'
        }, 'Delete Service');

        const message = Utils.DOM.create('p', {
            className: 'confirmation-message'
        }, `Are you sure you want to delete "${service.title}"? This action cannot be undone.`);

        const actions = Utils.DOM.create('div', {
            className: 'confirmation-actions'
        });

        const cancelBtn = Components.createButton({
            text: 'Cancel',
            variant: 'secondary',
            onClick: () => Components.closeModal()
        });

        const deleteBtn = Components.createButton({
            text: 'Delete Service',
            variant: 'error',
            onClick: () => {
                this.deleteService(service.id);
                Components.closeModal();
            }
        });

        actions.appendChild(cancelBtn);
        actions.appendChild(deleteBtn);

        confirmDialog.appendChild(icon);
        confirmDialog.appendChild(title);
        confirmDialog.appendChild(message);
        confirmDialog.appendChild(actions);

        Components.showModal({
            title: '',
            content: confirmDialog,
            size: 'small',
            closable: true
        });
    }

    /**
     * Handle toggle service status
     * @param {Object} service - Service to toggle
     */
    handleToggleService(service) {
        const newStatus = service.status === 'active' ? 'inactive' : 'active';
        this.updateServiceStatus(service.id, newStatus);
    }

    /**
     * Create new service
     * @param {Object} serviceData - Service data
     */
    createService(serviceData) {
        try {
            // Validate service data
            const validation = this.validateServiceData(serviceData);
            if (!validation.isValid) {
                Components.showNotification({
                    type: 'error',
                    title: 'Validation Error',
                    message: validation.errors.join(', '),
                    duration: 5000
                });
                return;
            }

            // Generate new service ID
            const serviceId = 'service_' + Date.now();
            const workspaceContext = AppState.getWorkspaceContext();
            const userId = AppState.getState('user.id');

            // Create service object
            const newService = {
                id: serviceId,
                title: serviceData.title,
                description: serviceData.description,
                gameId: 'wow',
                serviceType: serviceData.serviceType,
                workspaceType: workspaceContext.type,
                workspaceOwnerId: workspaceContext.type === 'personal' ? userId : workspaceContext.id,
                createdBy: userId,
                priceGold: parseInt(serviceData.priceGold) || 0,
                priceUsd: parseFloat(serviceData.priceUsd) || 0,
                priceToman: parseInt(serviceData.priceToman) || 0,
                estimatedTime: serviceData.estimatedTime || '',
                requirements: serviceData.requirements || '',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tags: this.generateServiceTags(serviceData)
            };

            // Add to services map
            this.services.set(serviceId, newService);

            // Update filters and render
            this.applyFilters();
            this.renderServices();

            // Close modal and show success
            Components.closeModal();
            Components.showNotification({
                type: 'success',
                title: 'Service Created',
                message: `"${newService.title}" has been created successfully!`,
                duration: 3000
            });

            // Log activity for team workspace
            if (workspaceContext.type === 'team') {
                this.logTeamActivity('service_created', {
                    serviceId: serviceId,
                    serviceName: newService.title
                });
            }

        } catch (error) {
            console.error('Error creating service:', error);
            Components.showNotification({
                type: 'error',
                title: 'Creation Failed',
                message: 'Failed to create service. Please try again.',
                duration: 5000
            });
        }
    }

    /**
     * Update existing service
     * @param {string} serviceId - Service ID
     * @param {Object} serviceData - Updated service data
     */
    updateService(serviceId, serviceData) {
        try {
            // Validate service data
            const validation = this.validateServiceData(serviceData);
            if (!validation.isValid) {
                Components.showNotification({
                    type: 'error',
                    title: 'Validation Error',
                    message: validation.errors.join(', '),
                    duration: 5000
                });
                return;
            }

            const existingService = this.services.get(serviceId);
            if (!existingService) {
                throw new Error('Service not found');
            }

            // Update service object
            const updatedService = {
                ...existingService,
                title: serviceData.title,
                description: serviceData.description,
                serviceType: serviceData.serviceType,
                priceGold: parseInt(serviceData.priceGold) || 0,
                priceUsd: parseFloat(serviceData.priceUsd) || 0,
                priceToman: parseInt(serviceData.priceToman) || 0,
                estimatedTime: serviceData.estimatedTime || '',
                requirements: serviceData.requirements || '',
                updatedAt: new Date().toISOString(),
                tags: this.generateServiceTags(serviceData)
            };

            // Update in services map
            this.services.set(serviceId, updatedService);

            // Update filters and render
            this.applyFilters();
            this.renderServices();

            // Close modal and show success
            Components.closeModal();
            Components.showNotification({
                type: 'success',
                title: 'Service Updated',
                message: `"${updatedService.title}" has been updated successfully!`,
                duration: 3000
            });

            // Log activity for team workspace
            const workspaceContext = AppState.getWorkspaceContext();
            if (workspaceContext.type === 'team') {
                this.logTeamActivity('service_updated', {
                    serviceId: serviceId,
                    serviceName: updatedService.title
                });
            }

        } catch (error) {
            console.error('Error updating service:', error);
            Components.showNotification({
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to update service. Please try again.',
                duration: 5000
            });
        }
    }

    /**
     * Delete service
     * @param {string} serviceId - Service ID
     */
    deleteService(serviceId) {
        try {
            const service = this.services.get(serviceId);
            if (!service) {
                throw new Error('Service not found');
            }

            // Remove from services map
            this.services.delete(serviceId);

            // Update filters and render
            this.applyFilters();
            this.renderServices();

            // Show success notification
            Components.showNotification({
                type: 'success',
                title: 'Service Deleted',
                message: `"${service.title}" has been deleted successfully.`,
                duration: 3000
            });

            // Log activity for team workspace
            const workspaceContext = AppState.getWorkspaceContext();
            if (workspaceContext.type === 'team') {
                this.logTeamActivity('service_deleted', {
                    serviceId: serviceId,
                    serviceName: service.title
                });
            }

        } catch (error) {
            console.error('Error deleting service:', error);
            Components.showNotification({
                type: 'error',
                title: 'Deletion Failed',
                message: 'Failed to delete service. Please try again.',
                duration: 5000
            });
        }
    }

    /**
     * Update service status
     * @param {string} serviceId - Service ID
     * @param {string} status - New status
     */
    updateServiceStatus(serviceId, status) {
        try {
            const service = this.services.get(serviceId);
            if (!service) {
                throw new Error('Service not found');
            }

            // Update status
            service.status = status;
            service.updatedAt = new Date().toISOString();

            // Update in services map
            this.services.set(serviceId, service);

            // Update filters and render
            this.applyFilters();
            this.renderServices();

            // Show success notification
            const statusText = status === 'active' ? 'activated' : 'deactivated';
            Components.showNotification({
                type: 'success',
                title: 'Status Updated',
                message: `"${service.title}" has been ${statusText}.`,
                duration: 3000
            });

            // Log activity for team workspace
            const workspaceContext = AppState.getWorkspaceContext();
            if (workspaceContext.type === 'team') {
                this.logTeamActivity('service_status_changed', {
                    serviceId: serviceId,
                    serviceName: service.title,
                    newStatus: status
                });
            }

        } catch (error) {
            console.error('Error updating service status:', error);
            Components.showNotification({
                type: 'error',
                title: 'Status Update Failed',
                message: 'Failed to update service status. Please try again.',
                duration: 5000
            });
        }
    }

    /**
     * Validate service data
     * @param {Object} serviceData - Service data to validate
     * @returns {Object} Validation result
     */
    validateServiceData(serviceData) {
        const errors = [];

        // Required fields
        if (!serviceData.title || serviceData.title.trim().length < 5) {
            errors.push('Service title must be at least 5 characters long');
        }

        if (!serviceData.description || serviceData.description.trim().length < 20) {
            errors.push('Service description must be at least 20 characters long');
        }

        if (!serviceData.serviceType) {
            errors.push('Service type is required');
        }

        // Pricing validation
        const goldPrice = parseInt(serviceData.priceGold);
        const usdPrice = parseFloat(serviceData.priceUsd);
        const tomanPrice = parseInt(serviceData.priceToman);

        if (isNaN(goldPrice) || goldPrice < 0) {
            errors.push('Gold price must be a valid positive number');
        }

        if (isNaN(usdPrice) || usdPrice < 0) {
            errors.push('USD price must be a valid positive number');
        }

        if (isNaN(tomanPrice) || tomanPrice < 0) {
            errors.push('Toman price must be a valid positive number');
        }

        // At least one price must be greater than 0
        if (goldPrice === 0 && usdPrice === 0 && tomanPrice === 0) {
            errors.push('At least one price must be greater than 0');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Generate service tags based on service data
     * @param {Object} serviceData - Service data
     * @returns {Array} Generated tags
     */
    generateServiceTags(serviceData) {
        const tags = [serviceData.serviceType];

        // Add pricing tags
        if (serviceData.priceGold > 0) tags.push('gold');
        if (serviceData.priceUsd > 0) tags.push('usd');
        if (serviceData.priceToman > 0) tags.push('toman');

        // Add time-based tags
        if (serviceData.estimatedTime) {
            if (serviceData.estimatedTime.includes('hour')) tags.push('hourly');
            if (serviceData.estimatedTime.includes('minute')) tags.push('quick');
        }

        return tags;
    }

    /**
     * Log team activity
     * @param {string} action - Action type
     * @param {Object} details - Action details
     */
    logTeamActivity(action, details) {
        // This would integrate with the team activity logging system
        console.log('Team Activity:', action, details);
    }

    /**
     * Render services interface
     */
    renderServices() {
        const contentArea = Utils.DOM.select('.content-area');
        if (!contentArea) return;

        // Clear existing content
        Utils.DOM.empty(contentArea);

        // Create service management interface
        const serviceManagement = Components.createServiceManagement({
            services: this.filteredServices,
            onCreateService: this.handleCreateService,
            onEditService: this.handleEditService,
            onDeleteService: this.handleDeleteService,
            onToggleService: this.handleToggleService
        });

        contentArea.appendChild(serviceManagement);

        // Set up filter event listeners
        this.setupFilterListeners();
    }

    /**
     * Set up filter event listeners
     */
    setupFilterListeners() {
        const typeFilter = Utils.DOM.select('select[name="serviceType"]');
        const statusFilter = Utils.DOM.select('select[name="status"]');
        const searchInput = Utils.DOM.select('input[name="search"]');

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.handleFilterChange('serviceType', e.target.value);
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.handleFilterChange('status', e.target.value);
            });
        }

        if (searchInput) {
            // Debounce search input
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleFilterChange('search', e.target.value);
                }, 300);
            });
        }
    }

    /**
     * Get service statistics
     * @returns {Object} Service statistics
     */
    getServiceStats() {
        const services = this.getServicesForWorkspace();
        
        return {
            total: services.length,
            active: services.filter(s => s.status === 'active').length,
            inactive: services.filter(s => s.status === 'inactive').length,
            byType: {
                mythic_plus: services.filter(s => s.serviceType === 'mythic_plus').length,
                leveling: services.filter(s => s.serviceType === 'leveling').length,
                delves: services.filter(s => s.serviceType === 'delves').length,
                custom_boost: services.filter(s => s.serviceType === 'custom_boost').length
            }
        };
    }
}

// Create global instance
window.ServiceManager = new ServiceManager();