
document.addEventListener("DOMContentLoaded", function() {
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  const body = document.body;
  collapseBtn.addEventListener('click', function() {
    body.classList.toggle('sidebar-collapsed');
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-angle-double-left');
    icon.classList.toggle('fa-angle-double-right');
  });
});
