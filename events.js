/**
 * Events Page JavaScript (WEB API VERSION)
 * Fetch and display events from API Vercel
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

        this.API_BASE = "https://api-mvr.vercel.app"; 

        this.calendarDate = new Date();

        this.init();
    }
    
    this.calendarDate = new Date();
    
    init() {
        this.bindEvents();
        this.fetchEvents();
    }

    bindEvents() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.setSearchTerm(e.target.value);
        });

        document.getElementById('clearSearch').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.loadMoreEvents();
        });

        document.getElementById('retryBtn').addEventListener('click', () => {
            this.fetchEvents();
        });
    }

    async fetchEvents() {
        this.showLoading();

        try {
            // 🔥 FIX: Fetch bằng API Web, không dùng localhost
            const response = await fetch(`${this.API_BASE}/sukien`);

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
        this.events.forEach(event => {
            const eventDate = new Date(event.date);
            const now = new Date();
            const currentYear = now.getFullYear();

            event.isHoliday =
                event.title.includes('lễ') ||
                event.title.includes('Lễ') ||
                event.title.includes('Quốc khánh') ||
                event.title.includes('Tết');

            event.isUpcoming = eventDate > now;
            event.isCurrentYear = eventDate.getFullYear() === currentYear;
            event.displayDate = eventDate;

            event.month = eventDate.toLocaleDateString('vi-VN', { month: 'long' });
            event.day = eventDate.getDate();
            event.year = eventDate.getFullYear();
        });

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

        document.querySelectorAll('.filter-btn').forEach(btn =>
            btn.classList.remove('active')
        );
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
        }

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

        if (this.currentPage === 0) {
            eventsGrid.innerHTML = '';
        }

        newEvents.forEach(event => {
            eventsGrid.appendChild(this.createEventCard(event));
        });

        if (endIndex >= this.filteredEvents.length) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'flex';
        }

        if (this.filteredEvents.length === 0) {
            eventsGrid.innerHTML =
                '<div class="no-events">Không tìm thấy sự kiện nào phù hợp.</div>';
            loadMoreContainer.style.display = 'none';
        }
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.addEventListener('click', () => {
            this.openEventModal(event);
        });
        card.className =
            `event-card ${event.isHoliday ? 'holiday' : ''} ${event.isUpcoming ? 'upcoming' : ''}`;

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
    
    openEventModal(event) {
        const modal = document.getElementById('eventModal');

        document.getElementById('modalTitle').textContent = event.title;
        document.getElementById('modalDate').textContent =
            `${event.day} ${event.month}, ${event.year}`;
        document.getElementById('modalDescription').textContent = event.description;

        document.getElementById('modalType').textContent =
            event.isHoliday ? "Ngày lễ" : "Sự kiện";

        document.getElementById('modalDuration').textContent =
            event.lasting > 0 ? `${event.lasting} phút` : "Cả ngày";

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('eventModal').classList.remove('active');
    }
} // ⬅ hết class ở đây

// KHÔNG được bỏ hai hàm ra ngoài class nhé
document.addEventListener('DOMContentLoaded', () => {
    const manager = new EventsManager();

    // gắn nút đóng modal
    document.getElementById('modalClose').addEventListener('click', () => {
        manager.closeModal();
    });

    // copy nút
    document.getElementById('modalCopy').addEventListener('click', () => {
        const title = document.getElementById('modalTitle').textContent;
        navigator.clipboard.writeText(title);
    });
});

