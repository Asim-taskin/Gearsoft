// Datei: ../scripts/auftraege.js
document.addEventListener('DOMContentLoaded', () => {
    const tbody    = document.getElementById('ordersBody');
    const empty    = document.querySelector('.empty-state');
    const tableDiv = document.querySelector('.parts-table');
  
    if (tbody.children.length === 0) {
      empty.style.display    = 'block';
      tableDiv.style.display = 'none';
    } else {
      empty.style.display    = 'none';
      tableDiv.style.display = 'block';
    }
  });
  