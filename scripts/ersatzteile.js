document.addEventListener('DOMContentLoaded', function() {
    const rows = document.querySelectorAll('tbody tr');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const herstellerFilter = document.getElementById('herstellerFilter');
    const filterBtns = document.querySelectorAll('.filter-btn');

    function filterParts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedHersteller = herstellerFilter.value;
        const stockFilter = document.querySelector('.filter-btn.active')?.dataset.filter;

        rows.forEach(row => {
            const textContent = row.textContent.toLowerCase();
            const category = row.dataset.category;
            const hersteller = row.dataset.hersteller;
            const stock = parseInt(row.dataset.stock);
            const minStock = 5; // Beispielwert

            const matchesSearch = textContent.includes(searchTerm);
            const matchesCategory = !selectedCategory || category === selectedCategory;
            const matchesHersteller = !selectedHersteller || hersteller === selectedHersteller;
            const matchesStock = !stockFilter || 
                               (stockFilter === 'warning' && stock < minStock) ||
                               (stockFilter === 'all');

            row.style.display = matchesSearch && matchesCategory && matchesHersteller && matchesStock 
                              ? '' 
                              : 'none';
        });
    }

    // Event Listeners
    searchInput.addEventListener('input', filterParts);
    categoryFilter.addEventListener('change', filterParts);
    herstellerFilter.addEventListener('change', filterParts);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterParts();
        });
    });
});