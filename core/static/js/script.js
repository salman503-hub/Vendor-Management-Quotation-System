document.addEventListener('DOMContentLoaded', () => {
    
    // --- Dark Mode State Management ---
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply the saved theme on load
    if (currentTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
    } else {
        htmlElement.removeAttribute('data-theme');
    }

    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = 'light';
            if (!htmlElement.hasAttribute('data-theme')) {
                htmlElement.setAttribute('data-theme', 'dark');
                theme = 'dark';
            } else {
                htmlElement.removeAttribute('data-theme');
            }
            localStorage.setItem('theme', theme);
        });
    }

    // --- Dynamic Search & Filter Logic ---
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    
    // Filter rows in tables (e.g. Vendors, Proposals) or cards (e.g. Quotation Requests)
    const performFiltering = () => {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const filterVal = statusFilter ? statusFilter.value : 'all';
        
        // 1. Filter table rows
        const tableRows = document.querySelectorAll('[data-filterable-row]');
        tableRows.forEach(row => {
            const searchText = row.getAttribute('data-search-text').toLowerCase();
            const rowStatus = row.getAttribute('data-status-val');
            
            const matchesSearch = searchText.includes(query);
            const matchesFilter = filterVal === 'all' || rowStatus === filterVal;
            
            if (matchesSearch && matchesFilter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        // 2. Filter list cards
        const filterableCards = document.querySelectorAll('[data-filterable-card]');
        filterableCards.forEach(card => {
            const searchText = card.getAttribute('data-search-text').toLowerCase();
            const cardStatus = card.getAttribute('data-status-val');
            
            const matchesSearch = searchText.includes(query);
            const matchesFilter = filterVal === 'all' || cardStatus === filterVal;
            
            if (matchesSearch && matchesFilter) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    };

    if (searchInput) {
        searchInput.addEventListener('input', performFiltering);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', performFiltering);
    }

    // --- Auto-Dismiss Notifications / Alerts ---
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        const closeBtn = alert.querySelector('.alert-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 300);
            });
        }
        
        // Auto dismiss after 4 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            }
        }, 4000);
    });

    // --- PDF Export Trigger ---
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // --- Confirm Delete Operations ---
    const deleteForms = document.querySelectorAll('.confirm-delete-form');
    deleteForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const entityName = form.getAttribute('data-entity-name') || 'this item';
            if (!confirm(`Are you absolutely sure you want to delete ${entityName}? This action cannot be undone.`)) {
                e.preventDefault();
            }
        });
    });

    // --- Responsive Mobile Sidebar Toggle ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }
});
