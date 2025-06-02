document.addEventListener("DOMContentLoaded", function() {
  const settingsBtn = document.querySelector('.fa-cog').closest('button');
  const settingsMenu = document.getElementById('settings-menu');
  const closeBtn = document.querySelector('.settings-panel__close');
  
  // Öffnen/Schließen durch Zahnrad
  settingsBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    settingsMenu.style.display = settingsMenu.style.display === "block" ? "none" : "block";
  });
  // Schließen durch X
  closeBtn.addEventListener('click', function() {
    settingsMenu.style.display = "none";
  });
  // Klick außerhalb schließt
  document.addEventListener('click', function(e) {
    if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
      settingsMenu.style.display = "none";
    }
  });
  // ESC schließt
  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") settingsMenu.style.display = "none";
  });

  // Kundenmodus Switch: Beispiel
  const kundenSwitch = document.getElementById('kundenmodus-switch');
  kundenSwitch.addEventListener('change', function() {
    if (this.checked) {
      // Kundenmodus aktiv
      // z.B. Theme, Backend, Localstorage, etc.
      console.log("Kundenmodus aktiviert!");
    } else {
      // Kundenmodus deaktiv
      console.log("Kundenmodus deaktiviert!");
    }
  });
});