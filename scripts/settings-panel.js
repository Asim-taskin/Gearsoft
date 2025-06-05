document.addEventListener("DOMContentLoaded", function() {
  // Defensive: Alles erst suchen!
  const settingsBtn = document.querySelector('.fa-cog')?.closest('button') || document.getElementById('settingsBtn');
  const settingsMenu = document.getElementById('settings-menu');
  const closeBtn = document.querySelector('.settings-panel__close');
  const kundenSwitch = document.getElementById('kundenmodus-switch');

  // Öffnen/Schließen durch Zahnrad/Settings-Button
  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      settingsMenu.style.display = settingsMenu.style.display === "block" ? "none" : "block";
    });
  }

  // Schließen durch X
  if (closeBtn && settingsMenu) {
    closeBtn.addEventListener('click', function() {
      settingsMenu.style.display = "none";
    });
  }

  // Klick außerhalb schließt Menü
  if (settingsMenu && settingsBtn) {
    document.addEventListener('click', function(e) {
      // Wenn Menü offen und Klick außerhalb
      if (
        settingsMenu.style.display === "block" &&
        !settingsMenu.contains(e.target) &&
        e.target !== settingsBtn
      ) {
        settingsMenu.style.display = "none";
      }
    });
  }

  // ESC schließt Menü
  if (settingsMenu) {
    document.addEventListener('keydown', function(e) {
      if (e.key === "Escape") settingsMenu.style.display = "none";
    });
  }

  // Kundenmodus Switch (Beispiel)
  if (kundenSwitch) {
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
  }
});
