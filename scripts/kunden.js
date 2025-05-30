    
      document.addEventListener("DOMContentLoaded", function () {
        const input = document.querySelector(".search-input");
        const rows = document.querySelectorAll(".customer-table tbody tr");
        const statsSpan = document.querySelector(
          ".stat-item[data-type='kunden']"
        );
        const pageInfo = document.querySelector(".pagination-info");
        const deleteButton = document.querySelector(".action-btn.delete");
        const checkboxes = document.querySelectorAll(".customer-checkbox");

        const addCustomerBtn = document.querySelector(".action-btn.primary");
        const customerModal = document.getElementById("add-customer-modal");
        const customerClose = customerModal?.querySelector(".modal-close");
        const customerDiscardBtn =
          customerModal?.querySelector(".btn.secondary");

        const fahrzeugAdd = document.querySelector(".fahrzeug-add");
        const fahrzeugModal = document.getElementById("add-vehicle-modal");
        const fahrzeugClose = fahrzeugModal?.querySelector(".modal-close");
        const fahrzeugCancelBtn = fahrzeugModal?.querySelector(
          ".fahrzeug-footer .btn.secondary"
        );
        const fahrzeugeListe = document.getElementById("fahrzeuge-liste");
        const fahrzeugForm = fahrzeugModal?.querySelector("form");
        const imageInput = document.getElementById("vehicle-images");
        const imagePreview = document.getElementById("image-preview");

        let editTarget = null;
        let images = [];

        // Debug: Prüfen, ob Kunden-Modal beim Laden sichtbar ist
        console.log(
          "Initial customerModal display:",
          customerModal.style.display
        );

        // Kunde Modal
        if (addCustomerBtn) {
          addCustomerBtn.addEventListener("click", () => {
            console.log("Kunde hinzufügen geklickt");
            customerModal.style.display = "block";
          });
        } else {
          console.error("addCustomerBtn nicht gefunden");
        }

        customerClose?.addEventListener("click", () => {
          customerModal.style.display = "none";
        });

        customerDiscardBtn?.addEventListener("click", () => {
          customerModal.style.display = "none";
        });

        // Fahrzeug Modal öffnen
        fahrzeugAdd?.addEventListener("click", () => {
          fahrzeugModal.style.display = "flex";
          fahrzeugForm.reset();
          editTarget = null;
          images = [];
          imagePreview.innerHTML = "";
          populateVehicleForm(null);
        });

        // Modal schließen
        fahrzeugClose?.addEventListener("click", () => {
          fahrzeugModal.style.display = "none";
        });

        fahrzeugCancelBtn?.addEventListener("click", () => {
          fahrzeugModal.style.display = "none";
          fahrzeugForm.reset();
          imagePreview.innerHTML = "";
          images = [];
        });

        window.addEventListener("click", (e) => {
          if (e.target === customerModal) {
            customerModal.style.display = "none";
          }
          if (e.target === fahrzeugModal) {
            fahrzeugModal.style.display = "none";
          }
        });

        // Handle vehicle image upload
        imageInput?.addEventListener("change", function (e) {
          const files = Array.from(e.target.files);
          files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = function (event) {
              images.push(event.target.result);
              const imgElement = document.createElement("img");
              imgElement.src = event.target.result;
              imgElement.style.maxWidth = "100px";
              imgElement.style.maxHeight = "100px";
              imgElement.style.margin = "5px";
              imagePreview.appendChild(imgElement);
            };
            reader.readAsDataURL(file);
          });
        });

        fahrzeugForm?.addEventListener("submit", function (e) {
          e.preventDefault();

          const kennzeichenInput = fahrzeugForm.querySelectorAll("input")[1];
          const laufleistungInput = fahrzeugForm.querySelectorAll("input")[2];
          const modellInput = fahrzeugForm.querySelectorAll("input")[6];

          const kennzeichen = kennzeichenInput?.value.trim() || "-";
          const laufleistung = laufleistungInput?.value.trim() || "-";
          const modell = modellInput?.value.trim() || "-";

          const fahrzeugHTML = `
                    <div class="fahrzeug-eintrag" data-kennzeichen="${kennzeichen}" data-laufleistung="${laufleistung}" data-modell="${modell}" style="border:1px solid #ccc; padding:8px; margin-top:8px; border-radius:5px;">
                        <strong>Kennzeichen:</strong> ${kennzeichen}<br>
                        <strong>Modell:</strong> ${modell}<br>
                        <strong>Laufleistung:</strong> ${laufleistung} km
                        <div class="fahrzeug-actions" style="margin-top:5px;">
                            <button class="edit-fahrzeug" title="Bearbeiten" style="margin-right:10px;"><i class="fas fa-edit"></i></button>
                            <button class="delete-fahrzeug" title="Löschen"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;

          if (editTarget) {
            editTarget.outerHTML = fahrzeugHTML;
            editTarget = null;
          } else {
            fahrzeugeListe.insertAdjacentHTML("beforeend", fahrzeugHTML);
          }

          fahrzeugModal.style.display = "none";
          attachFahrzeugEvents();
        });

        function attachFahrzeugEvents() {
          fahrzeugeListe.querySelectorAll(".delete-fahrzeug").forEach((btn) => {
            btn.onclick = function () {
              const eintrag = this.closest(".fahrzeug-eintrag");
              if (eintrag) eintrag.remove();
            };
          });

          fahrzeugeListe.querySelectorAll(".edit-fahrzeug").forEach((btn) => {
            btn.onclick = function () {
              const eintrag = this.closest(".fahrzeug-eintrag");
              if (!eintrag) return;

              editTarget = eintrag;
              populateVehicleForm(eintrag);
              fahrzeugModal.style.display = "flex";
            };
          });
        }

        function populateVehicleForm(eintrag) {
          const kennzeichenInput = fahrzeugForm.querySelectorAll("input")[1];
          const laufleistungInput = fahrzeugForm.querySelectorAll("input")[2];
          const modellInput = fahrzeugForm.querySelectorAll("input")[6];

          if (eintrag) {
            kennzeichenInput.value = eintrag.dataset.kennzeichen;
            laufleistungInput.value = eintrag.dataset.laufleistung;
            modellInput.value = eintrag.dataset.modell;
          } else {
            kennzeichenInput.value = "";
            laufleistungInput.value = "";
            modellInput.value = "";
          }
        }

        function updateCountAndPage() {
          const visibleRows = Array.from(rows).filter(
            (r) => r.style.display !== "none"
          );
          statsSpan.innerHTML = `<i class='fas fa-users'></i> ${rows.length} Kunden gesamt`;
          pageInfo.textContent = `${visibleRows.length ? 1 : 0}-${
            visibleRows.length
          } von ${rows.length}`;
        }

        function updateDeleteButton() {
          deleteButton.style.display = Array.from(checkboxes).some(
            (cb) => cb.checked
          )
            ? "flex"
            : "none";
        }

        input.addEventListener("input", function () {
          const filter = input.value.toLowerCase().replace(/[^a-z0-9]/gi, "");
          rows.forEach((row) => {
            const text = Array.from(row.querySelectorAll("td"))
              .map((td) =>
                td.textContent.toLowerCase().replace(/[^a-z0-9]/gi, "")
              )
              .join("");
            row.style.display = text.includes(filter) ? "" : "none";
          });
          updateCountAndPage();
        });

        checkboxes.forEach((cb) =>
          cb.addEventListener("change", updateDeleteButton)
        );

        updateCountAndPage();
        updateDeleteButton();
        attachFahrzeugEvents();
      });
    