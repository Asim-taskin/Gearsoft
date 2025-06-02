
    document.addEventListener('DOMContentLoaded', function() {
  const profileTrigger = document.getElementById('profileTrigger');
  const profileDropdown = document.getElementById('profileDropdown');

  // Toggle anzeigen/ausblenden
  profileTrigger.addEventListener('click', function(e) {
    profileDropdown.style.display = profileDropdown.style.display === 'flex' ? 'none' : 'flex';
    // Optional: Schließen, wenn außerhalb geklickt
    setTimeout(() => {
      document.addEventListener('click', closeDropdownOutside);
    }, 0);
    e.stopPropagation();
  });

  function closeDropdownOutside(e) {
    if (!profileDropdown.contains(e.target) && e.target !== profileTrigger) {
      profileDropdown.style.display = 'none';
      document.removeEventListener('click', closeDropdownOutside);
    }
  }

  // ESC schließen
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') profileDropdown.style.display = 'none';
  });
});
