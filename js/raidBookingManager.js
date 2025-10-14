/**
 * Raid Booking Manager for Service Provider Dashboard
 * Handles raid listing, booking interface, management, and calendar view
 */

class RaidBookingManager {
    constructor() {
        this.initialized = false;
        this.currentView = 'list'; // 'list', 'calendar', 'manage'
        this.selectedRaid = null;
        this.bookings = new Map();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.renderRaidBooking = this.renderRaidBooking.bind(this);
        this.createRaidListView = this.createRaidListView.bind(this);
        this.createRaidCalendarView = this.createRaidCalendarView.bind(this);
        this.createRaidManagementView = this.createRaidManagementView.bind(this);
        this.handleBookRaid = this.handleBookRaid.bind(this);
        this.handleViewBookings = this.handleViewBookings.bind(this);
        this.handleCancelBooking = this.handleCancelBooking.bind(this);
    }

    /**
     * Initialize the raid booking manager
     */
    init() {
        if (this.initialized) return;
        
        // Load existing bookings from mock data
        this.loadBookings();
        
        this.initialized = true;
        console.log('RaidBookingManager initialized');
    }

    /**
     * Load bookings from mock data
     */
    loadBookings() {
        if (typeof MockData !== 'undefined' && MockData.adminRaids) {
            MockData.adminRaids.forEach(raid => {
                if (raid.bookings) {
                    raid.bookings.forEach(booking => {
                        this.bookings.set(booking.id, {
                            ...booking,
                            raidId: raid.id,
                            raidTitle: raid.title
                        });
                    });
                }
            });
        }
    }

    /**
     * Render raid booking interface
     */
    renderRaidBooking() {
        const contentArea = Utils.DOM.select('.content-area');
        Utils.DOM.empty(contentArea);

        const container = Utils.DOM.create('div', {
            className: 'raid-booking-container'
        });

        // Header with view switcher
        const header = this.createRaidBookingHeader();
        container.appendChild(header);

        // Main content based on current view
        let mainContent;
        switch (this.currentView) {
            case 'calendar':
                mainContent = this.createRaidCalendarView();
                break;
            case 'manage':
                mainContent = this.createRaidManagementView();
                break;
            default:
                mainContent = this.createRaidListView();
        }

        container.appendChild(mainContent);
        contentArea.appendChild(container);
    }

    /**
     * Create raid booking header with view switcher
     */
    createRaidBookingHeader() {
        const header = Utils.DOM.create('div', {
            className: 'raid-booking-header'
        });

        const title = Utils.DOM.create('h1', {
            className: 'page-title'
        }, '🏰 Raid Booking');

        const subtitle = Utils.DOM.create('p', {
            className: 'page-subtitle'
        }, 'Book raid slots for your buyers from admin-created raids');

        const viewSwitcher = Utils.DOM.create('div', {
            className: 'view-switcher'
        });

        const views = [
            { id: 'list', icon: '📋', label: 'Raid List' },
            { id: 'calendar', icon: '📅', label: 'Calendar View' },
            { id: 'manage', icon: '⚙️', label: 'My Bookings' }
        ];

        views.forEach(view => {
            const btn = Components.createButton({
                text: view.label,
                icon: view.icon,
                variant: this.currentView === view.id ? 'primary' : 'secondary',
                size: 'sm',
                onClick: () => this.switchView(view.id)
            });
            viewSwitcher.appendChild(btn);
        });

        header.appendChild(title);
        header.appendChild(subtitle);
        header.appendChild(viewSwitcher);

        return header;
    }

    /**
     * Switch between different views
     */
    switchView(viewId) {
        if (this.currentView === viewId) return;
        
        this.currentView = viewId;
        this.renderRaidBooking();
        
        Components.showNotification({
            type: 'info',
            message: `Switched to ${viewId} view`,
            duration: 2000
        });
    }

    /**
     * Create raid list view displaying admin-created raids
     */
    createRaidListView() {
        const container = Utils.DOM.create('div', {
            className: 'raid-list-view'
        });

        // Filters
        const filters = this.createRaidFilters();
        container.appendChild(filters);

        // Raids grid
        const raidsGrid = this.createRaidsGrid();
        container.appendChild(raidsGrid);

        return container;
    }

    /**
     * Create raid filters
     */
    createRaidFilters() {
        const filters = Utils.DOM.create('div', {
            className: 'raid-filters'
        });

        // Difficulty filter
        const difficultyFilter = Components.createFormGroup({
            label: 'Difficulty',
            type: 'select',
            name: 'difficulty',
            options: [
                { value: 'all', label: 'All Difficulties' },
                { value: 'normal', label: 'Normal' },
                { value: 'heroic', label: 'Heroic' },
                { value: 'mythic', label: 'Mythic' }
            ]
        });

        // Status filter
        const statusFilter = Components.createFormGroup({
            label: 'Status',
            type: 'select',
            name: 'status',
            options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'open_for_booking', label: 'Open for Booking' },
                { value: 'full', label: 'Full' },
                { value: 'completed', label: 'Completed' }
            ]
        });

        // Date range filter
        const dateFilter = Components.createFormGroup({
            label: 'Date Range',
            type: 'select',
            name: 'dateRange',
            options: [
                { value: 'all', label: 'All Dates' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' }
            ]
        });

        filters.appendChild(difficultyFilter);
        filters.appendChild(statusFilter);
        filters.appendChild(dateFilter);

        return filters;
    }

    /**
     * Create raids grid
     */
    createRaidsGrid() {
        const grid = Utils.DOM.create('div', {
            className: 'raids-grid'
        });

        const raids = this.getAvailableRaids();

        if (raids.length === 0) {
            const emptyState = Components.createCard({
                title: 'No Raids Available',
                content: `
                    <div class="empty-state">
                        <div class="empty-icon">🏰</div>
                        <p>No admin-created raids are currently available for booking.</p>
                        <p>Check back later or contact administrators for raid scheduling.</p>
                    </div>
                `,
                className: 'empty-state-card'
            });
            grid.appendChild(emptyState);
            return grid;
        }

        raids.forEach(raid => {
            const raidCard = this.createRaidCard(raid);
            grid.appendChild(raidCard);
        });

        return grid;
    }

    /**
     * Get available raids from mock data
     */
    getAvailableRaids() {
        if (typeof MockData === 'undefined' || !MockData.adminRaids) {
            return [];
        }

        return MockData.adminRaids.filter(raid => {
            // Only show raids that are open for booking
            return raid.status === 'open_for_booking' && raid.availableSlots > 0;
        });
    }

    /**
     * Create raid card
     */
    createRaidCard(raid) {
        const card = Utils.DOM.create('div', {
            className: `raid-card ${raid.difficulty}`
        });

        // Header
        const header = Utils.DOM.create('div', {
            className: 'raid-card-header'
        });

        const difficultyBadge = Components.createStatusBadge({
            status: raid.difficulty,
            text: raid.difficulty.charAt(0).toUpperCase() + raid.difficulty.slice(1)
        });

        const statusBadge = Components.createStatusBadge({
            status: raid.status.replace('_', '-'),
            text: raid.availableSlots > 0 ? `${raid.availableSlots} slots available` : 'Full'
        });

        header.appendChild(difficultyBadge);
        header.appendChild(statusBadge);
        card.appendChild(header);

        // Content
        const content = Utils.DOM.create('div', {
            className: 'raid-card-content'
        });

        const title = Utils.DOM.create('h3', {
            className: 'raid-title'
        }, raid.title);

        const description = Utils.DOM.create('p', {
            className: 'raid-description'
        }, raid.description);

        // Raid details
        const details = Utils.DOM.create('div', {
            className: 'raid-details'
        });

        const scheduleInfo = Utils.DOM.create('div', {
            className: 'detail-item'
        });
        scheduleInfo.innerHTML = `
            <span class="detail-icon">📅</span>
            <span class="detail-text">${this.formatRaidDate(raid.scheduledDate)}</span>
        `;

        const durationInfo = Utils.DOM.create('div', {
            className: 'detail-item'
        });
        durationInfo.innerHTML = `
            <span class="detail-icon">⏱️</span>
            <span class="detail-text">${raid.duration}</span>
        `;

        const slotsInfo = Utils.DOM.create('div', {
            className: 'detail-item'
        });
        slotsInfo.innerHTML = `
            <span class="detail-icon">👥</span>
            <span class="detail-text">${raid.maxSlots - raid.availableSlots}/${raid.maxSlots} booked</span>
        `;

        details.appendChild(scheduleInfo);
        details.appendChild(durationInfo);
        details.appendChild(slotsInfo);

        // Pricing
        const pricing = Utils.DOM.create('div', {
            className: 'raid-pricing'
        });

        const goldPrice = Utils.DOM.create('span', {
            className: 'price-item gold'
        }, `🪙 ${raid.pricePerSlot.gold}G`);

        const usdPrice = Utils.DOM.create('span', {
            className: 'price-item usd'
        }, `💵 $${raid.pricePerSlot.usd}`);

        const tomanPrice = Utils.DOM.create('span', {
            className: 'price-item toman'
        }, `﷼ ${raid.pricePerSlot.toman.toLocaleString()}`);

        pricing.appendChild(goldPrice);
        pricing.appendChild(usdPrice);
        pricing.appendChild(tomanPrice);

        // Requirements
        const requirements = Utils.DOM.create('div', {
            className: 'raid-requirements'
        });
        requirements.innerHTML = `
            <strong>Requirements:</strong>
            <p>${raid.requirements}</p>
        `;

        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(details);
        content.appendChild(pricing);
        content.appendChild(requirements);
        card.appendChild(content);

        // Actions
        const actions = Utils.DOM.create('div', {
            className: 'raid-card-actions'
        });

        const bookBtn = Components.createButton({
            text: 'Book Slot',
            icon: '📝',
            variant: 'primary',
            onClick: () => this.handleBookRaid(raid)
        });

        const detailsBtn = Components.createButton({
            text: 'View Details',
            icon: '👁️',
            variant: 'secondary',
            onClick: () => this.showRaidDetails(raid)
        });

        actions.appendChild(bookBtn);
        actions.appendChild(detailsBtn);
        card.appendChild(actions);

        return card;
    }

    /**
     * Create raid calendar view with scheduling capabilities
     */
    createRaidCalendarView() {
        const container = Utils.DOM.create('div', {
            className: 'raid-calendar-view'
        });

        // Calendar header
        const calendarHeader = Utils.DOM.create('div', {
            className: 'calendar-header'
        });

        const currentMonth = new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });

        const monthTitle = Utils.DOM.create('h2', {
            className: 'calendar-title'
        }, currentMonth);

        const navButtons = Utils.DOM.create('div', {
            className: 'calendar-nav'
        });

        const prevBtn = Components.createButton({
            text: 'Previous',
            icon: '◀️',
            variant: 'secondary',
            size: 'sm',
            onClick: () => this.navigateCalendar(-1)
        });

        const nextBtn = Components.createButton({
            text: 'Next',
            icon: '▶️',
            variant: 'secondary',
            size: 'sm',
            onClick: () => this.navigateCalendar(1)
        });

        navButtons.appendChild(prevBtn);
        navButtons.appendChild(nextBtn);

        calendarHeader.appendChild(monthTitle);
        calendarHeader.appendChild(navButtons);
        container.appendChild(calendarHeader);

        // Calendar grid
        const calendar = this.createCalendarGrid();
        container.appendChild(calendar);

        // Legend
        const legend = this.createCalendarLegend();
        container.appendChild(legend);

        return container;
    }

    /**
     * Create calendar grid
     */
    createCalendarGrid() {
        const calendar = Utils.DOM.create('div', {
            className: 'calendar-grid'
        });

        // Days of week header
        const daysHeader = Utils.DOM.create('div', {
            className: 'calendar-days-header'
        });

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayHeader = Utils.DOM.create('div', {
                className: 'calendar-day-header'
            }, day);
            daysHeader.appendChild(dayHeader);
        });

        calendar.appendChild(daysHeader);

        // Calendar days
        const daysGrid = Utils.DOM.create('div', {
            className: 'calendar-days-grid'
        });

        // Generate calendar days for current month
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayCell = this.createCalendarDay(date, currentMonth);
            daysGrid.appendChild(dayCell);
        }

        calendar.appendChild(daysGrid);

        return calendar;
    }

    /**
     * Create calendar day cell
     */
    createCalendarDay(date, currentMonth) {
        const dayCell = Utils.DOM.create('div', {
            className: `calendar-day ${date.getMonth() !== currentMonth ? 'other-month' : ''}`
        });

        const dayNumber = Utils.DOM.create('div', {
            className: 'day-number'
        }, date.getDate().toString());

        dayCell.appendChild(dayNumber);

        // Check for raids on this date
        const raidsOnDate = this.getRaidsForDate(date);
        if (raidsOnDate.length > 0) {
            const raidsContainer = Utils.DOM.create('div', {
                className: 'day-raids'
            });

            raidsOnDate.forEach(raid => {
                const raidEvent = Utils.DOM.create('div', {
                    className: `raid-event ${raid.difficulty}`,
                    title: `${raid.title} - ${this.formatTime(raid.scheduledDate)}`
                });

                const raidTitle = Utils.DOM.create('span', {
                    className: 'raid-event-title'
                }, raid.raidName);

                const raidSlots = Utils.DOM.create('span', {
                    className: 'raid-event-slots'
                }, `${raid.availableSlots} slots`);

                raidEvent.appendChild(raidTitle);
                raidEvent.appendChild(raidSlots);

                raidEvent.addEventListener('click', () => {
                    this.showRaidDetails(raid);
                });

                raidsContainer.appendChild(raidEvent);
            });

            dayCell.appendChild(raidsContainer);
        }

        return dayCell;
    }

    /**
     * Create calendar legend
     */
    createCalendarLegend() {
        const legend = Utils.DOM.create('div', {
            className: 'calendar-legend'
        });

        const legendTitle = Utils.DOM.create('h3', {}, 'Legend');

        const legendItems = Utils.DOM.create('div', {
            className: 'legend-items'
        });

        const difficulties = [
            { key: 'normal', label: 'Normal', color: '#4CAF50' },
            { key: 'heroic', label: 'Heroic', color: '#FF9800' },
            { key: 'mythic', label: 'Mythic', color: '#F44336' }
        ];

        difficulties.forEach(diff => {
            const item = Utils.DOM.create('div', {
                className: 'legend-item'
            });

            const color = Utils.DOM.create('div', {
                className: 'legend-color',
                style: `background-color: ${diff.color}`
            });

            const label = Utils.DOM.create('span', {}, diff.label);

            item.appendChild(color);
            item.appendChild(label);
            legendItems.appendChild(item);
        });

        legend.appendChild(legendTitle);
        legend.appendChild(legendItems);

        return legend;
    }

    /**
     * Create raid booking management view with status tracking and participant lists
     */
    createRaidManagementView() {
        const container = Utils.DOM.create('div', {
            className: 'raid-management-view'
        });

        // Management header
        const header = Utils.DOM.create('div', {
            className: 'management-header'
        });

        const title = Utils.DOM.create('h2', {}, 'My Raid Bookings');
        const subtitle = Utils.DOM.create('p', {}, 'Manage your raid bookings and track participant status');

        header.appendChild(title);
        header.appendChild(subtitle);
        container.appendChild(header);

        // Bookings table
        const bookingsTable = this.createBookingsTable();
        container.appendChild(bookingsTable);

        return container;
    }

    /**
     * Create bookings table
     */
    createBookingsTable() {
        const myBookings = this.getMyBookings();

        if (myBookings.length === 0) {
            return Components.createCard({
                title: 'No Bookings Yet',
                content: `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <p>You haven't made any raid bookings yet.</p>
                        <p>Go to the Raid List to book slots for your buyers.</p>
                    </div>
                `,
                className: 'empty-state-card'
            });
        }

        const columns = [
            {
                key: 'raidTitle',
                label: 'Raid',
                render: (value, booking) => `
                    <div class="booking-raid-info">
                        <strong>${booking.raidTitle}</strong>
                        <div class="raid-difficulty ${booking.difficulty}">${booking.difficulty}</div>
                    </div>
                `
            },
            {
                key: 'buyerInfo',
                label: 'Buyer',
                render: (value, booking) => `
                    <div class="buyer-info">
                        <img src="${booking.buyerAvatar || '/mock-images/default-avatar.png'}" alt="Avatar" class="buyer-avatar">
                        <span>${booking.buyerName || 'Unknown Buyer'}</span>
                    </div>
                `
            },
            {
                key: 'scheduledDate',
                label: 'Date & Time',
                render: (value, booking) => this.formatRaidDateTime(booking.scheduledDate)
            },
            {
                key: 'slotNumber',
                label: 'Slot',
                render: (value) => `Slot #${value}`
            },
            {
                key: 'status',
                label: 'Status',
                render: (value) => {
                    const badge = Components.createStatusBadge({
                        status: value,
                        text: value.charAt(0).toUpperCase() + value.slice(1)
                    });
                    return badge.outerHTML;
                }
            },
            {
                key: 'actions',
                label: 'Actions',
                render: (value, booking) => {
                    const actionsContainer = Utils.DOM.create('div', {
                        className: 'booking-actions'
                    });

                    const viewBtn = Components.createButton({
                        text: 'View',
                        icon: '👁️',
                        variant: 'secondary',
                        size: 'sm',
                        onClick: () => this.viewBookingDetails(booking)
                    });

                    const cancelBtn = Components.createButton({
                        text: 'Cancel',
                        icon: '❌',
                        variant: 'error',
                        size: 'sm',
                        onClick: () => this.handleCancelBooking(booking)
                    });

                    actionsContainer.appendChild(viewBtn);
                    if (booking.status === 'confirmed') {
                        actionsContainer.appendChild(cancelBtn);
                    }

                    return actionsContainer.outerHTML;
                }
            }
        ];

        return Components.createTable({
            columns: columns,
            data: myBookings,
            className: 'bookings-table',
            sortable: true
        });
    }

    /**
     * Handle raid booking
     */
    handleBookRaid(raid) {
        const bookingForm = this.createBookingForm(raid);
        
        Components.showModal({
            title: `Book Raid Slot - ${raid.title}`,
            content: bookingForm,
            size: 'large',
            footer: [
                Components.createButton({
                    text: 'Cancel',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Book Slot',
                    variant: 'primary',
                    onClick: () => this.submitBooking(raid)
                })
            ]
        });
    }

    /**
     * Create booking form
     */
    createBookingForm(raid) {
        const form = Utils.DOM.create('div', {
            className: 'booking-form'
        });

        // Raid summary
        const raidSummary = Utils.DOM.create('div', {
            className: 'raid-summary'
        });
        raidSummary.innerHTML = `
            <h3>Raid Details</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <strong>Raid:</strong> ${raid.title}
                </div>
                <div class="summary-item">
                    <strong>Difficulty:</strong> ${raid.difficulty.charAt(0).toUpperCase() + raid.difficulty.slice(1)}
                </div>
                <div class="summary-item">
                    <strong>Date:</strong> ${this.formatRaidDateTime(raid.scheduledDate)}
                </div>
                <div class="summary-item">
                    <strong>Duration:</strong> ${raid.duration}
                </div>
                <div class="summary-item">
                    <strong>Available Slots:</strong> ${raid.availableSlots}
                </div>
            </div>
        `;

        // Buyer selection
        const buyerSelection = Components.createFormGroup({
            label: 'Select Buyer',
            type: 'select',
            name: 'buyerId',
            required: true,
            options: [
                { value: '', label: 'Select a buyer...' },
                ...this.getAvailableBuyers().map(buyer => ({
                    value: buyer.id,
                    label: buyer.discordUsername
                }))
            ]
        });

        // Currency selection
        const currencySelection = Components.createFormGroup({
            label: 'Payment Currency',
            type: 'select',
            name: 'currency',
            required: true,
            options: [
                { value: '', label: 'Select currency...' },
                { value: 'gold', label: `Gold (${raid.pricePerSlot.gold}G)` },
                { value: 'usd', label: `USD ($${raid.pricePerSlot.usd})` },
                { value: 'toman', label: `Toman (${raid.pricePerSlot.toman.toLocaleString()})` }
            ]
        });

        // Special instructions
        const instructions = Components.createFormGroup({
            label: 'Special Instructions (Optional)',
            type: 'textarea',
            name: 'instructions',
            placeholder: 'Any special requirements or notes for this booking...'
        });

        form.appendChild(raidSummary);
        form.appendChild(buyerSelection);
        form.appendChild(currencySelection);
        form.appendChild(instructions);

        return form;
    }

    /**
     * Submit booking
     */
    submitBooking(raid) {
        const form = Utils.DOM.select('.booking-form');
        const formData = new FormData();
        
        // Collect form data
        const buyerSelect = Utils.DOM.select('select[name="buyerId"]', form);
        const currencySelect = Utils.DOM.select('select[name="currency"]', form);
        const instructionsTextarea = Utils.DOM.select('textarea[name="instructions"]', form);

        if (!buyerSelect.value || !currencySelect.value) {
            Components.showNotification({
                type: 'error',
                title: 'Validation Error',
                message: 'Please select a buyer and payment currency.',
                duration: 4000
            });
            return;
        }

        // Create booking
        const booking = {
            id: `booking_${Date.now()}`,
            raidId: raid.id,
            raidTitle: raid.title,
            difficulty: raid.difficulty,
            advertiserId: AppState.getState('user.id'),
            buyerId: buyerSelect.value,
            buyerName: buyerSelect.options[buyerSelect.selectedIndex].text,
            buyerAvatar: this.getBuyerAvatar(buyerSelect.value),
            slotNumber: this.getNextAvailableSlot(raid),
            scheduledDate: raid.scheduledDate,
            currency: currencySelect.value,
            amount: raid.pricePerSlot[currencySelect.value],
            instructions: instructionsTextarea.value,
            status: 'confirmed',
            bookedAt: new Date().toISOString()
        };

        // Add to bookings
        this.bookings.set(booking.id, booking);

        // Update raid available slots
        raid.availableSlots--;

        // Close modal
        Components.closeModal();

        // Show success notification
        Components.showNotification({
            type: 'success',
            title: 'Booking Confirmed',
            message: `Successfully booked slot #${booking.slotNumber} for ${booking.buyerName}`,
            duration: 4000
        });

        // Refresh view
        this.renderRaidBooking();
    }

    /**
     * Handle view bookings
     */
    handleViewBookings(raid) {
        this.selectedRaid = raid;
        this.currentView = 'manage';
        this.renderRaidBooking();
    }

    /**
     * Handle cancel booking
     */
    handleCancelBooking(booking) {
        Components.showModal({
            title: 'Cancel Booking',
            content: `
                <div class="cancel-booking-content">
                    <p>Are you sure you want to cancel this booking?</p>
                    <div class="booking-details">
                        <strong>Raid:</strong> ${booking.raidTitle}<br>
                        <strong>Buyer:</strong> ${booking.buyerName}<br>
                        <strong>Slot:</strong> #${booking.slotNumber}<br>
                        <strong>Date:</strong> ${this.formatRaidDateTime(booking.scheduledDate)}
                    </div>
                    <p class="warning-text">This action cannot be undone.</p>
                </div>
            `,
            footer: [
                Components.createButton({
                    text: 'Keep Booking',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Cancel Booking',
                    variant: 'error',
                    onClick: () => this.confirmCancelBooking(booking)
                })
            ]
        });
    }

    /**
     * Confirm cancel booking
     */
    confirmCancelBooking(booking) {
        // Remove booking
        this.bookings.delete(booking.id);

        // Update raid available slots
        const raid = this.getRaidById(booking.raidId);
        if (raid) {
            raid.availableSlots++;
        }

        // Close modal
        Components.closeModal();

        // Show success notification
        Components.showNotification({
            type: 'success',
            title: 'Booking Cancelled',
            message: `Booking for ${booking.buyerName} has been cancelled`,
            duration: 3000
        });

        // Refresh view
        this.renderRaidBooking();
    }

    /**
     * Show raid details
     */
    showRaidDetails(raid) {
        const detailsContent = this.createRaidDetailsContent(raid);
        
        Components.showModal({
            title: raid.title,
            content: detailsContent,
            size: 'large',
            footer: [
                Components.createButton({
                    text: 'Close',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                }),
                Components.createButton({
                    text: 'Book Slot',
                    variant: 'primary',
                    onClick: () => {
                        Components.closeModal();
                        this.handleBookRaid(raid);
                    }
                })
            ]
        });
    }

    /**
     * Create raid details content
     */
    createRaidDetailsContent(raid) {
        const content = Utils.DOM.create('div', {
            className: 'raid-details-content'
        });

        content.innerHTML = `
            <div class="raid-details-grid">
                <div class="detail-section">
                    <h3>Raid Information</h3>
                    <div class="detail-item">
                        <strong>Raid Name:</strong> ${raid.raidName}
                    </div>
                    <div class="detail-item">
                        <strong>Difficulty:</strong> ${raid.difficulty.charAt(0).toUpperCase() + raid.difficulty.slice(1)}
                    </div>
                    <div class="detail-item">
                        <strong>Scheduled Date:</strong> ${this.formatRaidDateTime(raid.scheduledDate)}
                    </div>
                    <div class="detail-item">
                        <strong>Duration:</strong> ${raid.duration}
                    </div>
                    <div class="detail-item">
                        <strong>Loot System:</strong> ${raid.lootSystem.replace('_', ' ').toUpperCase()}
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Availability</h3>
                    <div class="detail-item">
                        <strong>Total Slots:</strong> ${raid.maxSlots}
                    </div>
                    <div class="detail-item">
                        <strong>Available Slots:</strong> ${raid.availableSlots}
                    </div>
                    <div class="detail-item">
                        <strong>Booked Slots:</strong> ${raid.maxSlots - raid.availableSlots}
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Pricing</h3>
                    <div class="pricing-grid">
                        <div class="price-item">
                            <span class="currency-icon">🪙</span>
                            <span class="amount">${raid.pricePerSlot.gold} Gold</span>
                        </div>
                        <div class="price-item">
                            <span class="currency-icon">💵</span>
                            <span class="amount">$${raid.pricePerSlot.usd} USD</span>
                        </div>
                        <div class="price-item">
                            <span class="currency-icon">﷼</span>
                            <span class="amount">${raid.pricePerSlot.toman.toLocaleString()} Toman</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section full-width">
                    <h3>Description</h3>
                    <p>${raid.description}</p>
                </div>

                <div class="detail-section full-width">
                    <h3>Requirements</h3>
                    <p>${raid.requirements}</p>
                </div>
            </div>
        `;

        return content;
    }

    /**
     * View booking details
     */
    viewBookingDetails(booking) {
        const detailsContent = this.createBookingDetailsContent(booking);
        
        Components.showModal({
            title: `Booking Details - ${booking.raidTitle}`,
            content: detailsContent,
            size: 'medium',
            footer: [
                Components.createButton({
                    text: 'Close',
                    variant: 'secondary',
                    onClick: () => Components.closeModal()
                })
            ]
        });
    }

    /**
     * Create booking details content
     */
    createBookingDetailsContent(booking) {
        const content = Utils.DOM.create('div', {
            className: 'booking-details-content'
        });

        content.innerHTML = `
            <div class="booking-info-grid">
                <div class="info-section">
                    <h3>Booking Information</h3>
                    <div class="info-item">
                        <strong>Booking ID:</strong> ${booking.id}
                    </div>
                    <div class="info-item">
                        <strong>Status:</strong> 
                        <span class="status-badge ${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                    </div>
                    <div class="info-item">
                        <strong>Slot Number:</strong> #${booking.slotNumber}
                    </div>
                    <div class="info-item">
                        <strong>Booked At:</strong> ${this.formatDateTime(booking.bookedAt)}
                    </div>
                </div>

                <div class="info-section">
                    <h3>Buyer Information</h3>
                    <div class="buyer-info-detailed">
                        <img src="${booking.buyerAvatar || '/mock-images/default-avatar.png'}" alt="Avatar" class="buyer-avatar-large">
                        <div class="buyer-details">
                            <div class="info-item">
                                <strong>Name:</strong> ${booking.buyerName}
                            </div>
                            <div class="info-item">
                                <strong>Buyer ID:</strong> ${booking.buyerId}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="info-section">
                    <h3>Payment Information</h3>
                    <div class="info-item">
                        <strong>Currency:</strong> ${booking.currency.toUpperCase()}
                    </div>
                    <div class="info-item">
                        <strong>Amount:</strong> ${this.formatCurrency(booking.amount, booking.currency)}
                    </div>
                </div>

                ${booking.instructions ? `
                <div class="info-section full-width">
                    <h3>Special Instructions</h3>
                    <p>${booking.instructions}</p>
                </div>
                ` : ''}
            </div>
        `;

        return content;
    }

    // Helper methods

    /**
     * Navigate calendar
     */
    navigateCalendar(direction) {
        // This would implement calendar navigation
        Components.showNotification({
            type: 'info',
            message: `Calendar navigation: ${direction > 0 ? 'Next' : 'Previous'} month`,
            duration: 2000
        });
    }

    /**
     * Get raids for specific date
     */
    getRaidsForDate(date) {
        if (typeof MockData === 'undefined' || !MockData.adminRaids) {
            return [];
        }

        return MockData.adminRaids.filter(raid => {
            const raidDate = new Date(raid.scheduledDate);
            return raidDate.toDateString() === date.toDateString();
        });
    }

    /**
     * Get my bookings
     */
    getMyBookings() {
        const userId = AppState.getState('user.id');
        return Array.from(this.bookings.values()).filter(booking => 
            booking.advertiserId === userId
        );
    }

    /**
     * Get available buyers
     */
    getAvailableBuyers() {
        if (typeof MockData === 'undefined' || !MockData.buyers) {
            return [];
        }
        return MockData.buyers;
    }

    /**
     * Get buyer avatar
     */
    getBuyerAvatar(buyerId) {
        const buyer = this.getAvailableBuyers().find(b => b.id === buyerId);
        return buyer ? buyer.discordAvatarUrl : '/mock-images/default-avatar.png';
    }

    /**
     * Get next available slot
     */
    getNextAvailableSlot(raid) {
        const existingBookings = Array.from(this.bookings.values())
            .filter(booking => booking.raidId === raid.id)
            .map(booking => booking.slotNumber);
        
        for (let i = 1; i <= raid.maxSlots; i++) {
            if (!existingBookings.includes(i)) {
                return i;
            }
        }
        return raid.maxSlots - raid.availableSlots + 1;
    }

    /**
     * Get raid by ID
     */
    getRaidById(raidId) {
        if (typeof MockData === 'undefined' || !MockData.adminRaids) {
            return null;
        }
        return MockData.adminRaids.find(raid => raid.id === raidId);
    }

    /**
     * Format raid date
     */
    formatRaidDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format raid date and time
     */
    formatRaidDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Format time
     */
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Format date time
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Format currency
     */
    formatCurrency(amount, currency) {
        switch (currency) {
            case 'gold':
                return `${amount}G`;
            case 'usd':
                return `$${amount}`;
            case 'toman':
                return `${amount.toLocaleString()} Toman`;
            default:
                return amount.toString();
        }
    }
}

// Initialize raid booking manager
const RaidBookingManager_Instance = new RaidBookingManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RaidBookingManager;
} else if (typeof window !== 'undefined') {
    window.RaidBookingManager = RaidBookingManager;
}