/**
 * Events Page JavaScript
 * Handles fetching and displaying calendar events
 */

class EventsManager {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.displayedEvents = [];
        this.eventsPerPage = 12;
        this.currentPage = 0;
        this.currentFilter = 'all';
        this.searchTerm = '';

        this.init();
    }

    init() {
        this.bindEvents();
        this.fetchEvents();
    }

    bindEvents() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Search input
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.setSearchTerm(e.target.value);
        });

        // Clear search
        document.getElementById('clearSearch').addEventListener('click', () => {
            this.clearSearch();
        });

        // Load more button
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.loadMoreEvents();
        });

        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.fetchEvents();
        });
    }

    async fetchEvents() {
        this.showLoading();

        try {
            const response = await fetch('http://localhost:3001/sukien');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data && data.data.result) {
                this.events = data.data.result;
                this.processEvents();
                this.updateStats();
                this.applyFilters();
                this.renderEvents();
                this.hideLoading();
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Error fetching events:', error);
            this.showError(error.message);
        }
    }

    processEvents() {
        // Add additional properties for filtering and display
        this.events.forEach(event => {
            const eventDate = new Date(event.date);
            const now = new Date();
            const currentYear = now.getFullYear();

            event.isHoliday = event.title.includes('lễ') || event.title.includes('Lễ') ||
                            event.title.includes('Quốc khánh') || event.title.includes('Tết');
            event.isUpcoming = eventDate > now;
            event.isCurrentYear = eventDate.getFullYear() === currentYear;
            event.displayDate = eventDate;
            event.month = eventDate.toLocaleDateString('vi-VN', { month: 'long' });
            event.day = eventDate.getDate();
            event.year = eventDate.getFullYear();
        });

        // Sort events by date
        this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    updateStats() {
        const totalEvents = this.events.length;
        const upcomingEvents = this.events.filter(e => e.isUpcoming).length;
        const holidays = this.events.filter(e => e.isHoliday).length;

        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('upcomingEvents').textContent = upcomingEvents;
        document.getElementById('holidays').textContent = holidays;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.currentPage = 0;

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.applyFilters();
        this.renderEvents();
    }

    setSearchTerm(term) {
        this.searchTerm = term.toLowerCase();
        this.currentPage = 0;
        this.applyFilters();
        this.renderEvents();
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.setSearchTerm('');
    }

    applyFilters() {
        let filtered = [...this.events];

        // Apply category filter
        switch (this.currentFilter) {
            case 'holiday':
                filtered = filtered.filter(e => e.isHoliday);
                break;
            case 'upcoming':
                filtered = filtered.filter(e => e.isUpcoming);
                break;
            case 'current-year':
                filtered = filtered.filter(e => e.isCurrentYear);
                break;
            default:
                // 'all' - no additional filtering
                break;
        }

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(this.searchTerm) ||
                event.description.toLowerCase().includes(this.searchTerm)
            );
        }

        this.filteredEvents = filtered;
        this.displayedEvents = [];
        this.currentPage = 0;
    }

    loadMoreEvents() {
        this.currentPage++;
        this.renderEvents();
    }

    renderEvents() {
        const startIndex = this.currentPage * this.eventsPerPage;
        const endIndex = startIndex + this.eventsPerPage;
        const newEvents = this.filteredEvents.slice(startIndex, endIndex);

        this.displayedEvents = this.displayedEvents.concat(newEvents);

        const eventsGrid = document.getElementById('eventsGrid');
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        // Clear grid if this is the first page
        if (this.currentPage === 0) {
            eventsGrid.innerHTML = '';
        }

        // Render new events
        newEvents.forEach(event => {
            const eventCard = this.createEventCard(event);
            eventsGrid.appendChild(eventCard);
        });

        // Update load more button
        if (endIndex >= this.filteredEvents.length) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'flex';
            loadMoreBtn.disabled = false;
        }

        // Show message if no events found
        if (this.filteredEvents.length === 0) {
            eventsGrid.innerHTML = '<div class="no-events">Không tìm thấy sự kiện nào phù hợp với bộ lọc.</div>';
            loadMoreContainer.style.display = 'none';
        }
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = `event-card ${event.isHoliday ? 'holiday' : ''} ${event.isUpcoming ? 'upcoming' : ''}`;

        const durationText = event.lasting > 0 ? `${event.lasting} phút` : 'Cả ngày';
        const typeText = event.isHoliday ? 'Ngày lễ' : 'Sự kiện';

        card.innerHTML = `
            <div class="event-date">
                <span class="event-day">${event.day}</span>
                <div class="event-month-year">
                    <span class="event-month">${event.month}</span>
                    <span class="event-year">${event.year}</span>
                </div>
            </div>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${event.description}</p>
            <div class="event-meta">
                <span class="event-type">${typeText}</span>
                <span class="event-duration">${durationText}</span>
            </div>
        `;

        return card;
    }

    showLoading() {
        document.getElementById('loadingContainer').style.display = 'flex';
        document.getElementById('errorContainer').style.display = 'none';
        document.getElementById('eventsGrid').style.display = 'none';
        document.getElementById('loadMoreContainer').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('eventsGrid').style.display = 'grid';
    }

    showError(message) {
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('eventsGrid').style.display = 'none';
        document.getElementById('loadMoreContainer').style.display = 'none';
        document.getElementById('errorContainer').style.display = 'flex';
        document.getElementById('errorMessage').textContent = message;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EventsManager();
});
