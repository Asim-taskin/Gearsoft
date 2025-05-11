
document.addEventListener('DOMContentLoaded', function() {
    const tireCards = document.querySelectorAll('.tire-card');
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const sizeFilter = document.getElementById('sizeFilter');
    const filterBtns = document.querySelectorAll('.filter-btn');

    function filterTires() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedBrand = brandFilter.value;
        const selectedSize = sizeFilter.value;
        const stockFilter = document.querySelector('.filter-btn.active')?.dataset.filter;

        tireCards.forEach(card => {
            const brand = card.dataset.brand;
            const size = card.dataset.size;
            const textContent = card.textContent.toLowerCase();
            const isWarning = card.classList.contains('warning');

            const matchesSearch = textContent.includes(searchTerm);
            const matchesBrand = !selectedBrand || brand === selectedBrand;
            const matchesSize = !selectedSize || size === selectedSize;
            const matchesStock = !stockFilter || 
                              (stockFilter === 'warning' && isWarning) ||
                              (stockFilter === 'all');

            card.style.display = matchesSearch && matchesBrand && matchesSize && matchesStock 
                               ? 'block' 
                               : 'none';
        });
    }

    // Event Listeners
    searchInput.addEventListener('input', filterTires);
    brandFilter.addEventListener('change', filterTires);
    sizeFilter.addEventListener('change', filterTires);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterTires();
        });
    });
});
