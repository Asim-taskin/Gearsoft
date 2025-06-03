// Hilfsfunktion ganz oben in der Datei einfügen (nur einmal!)
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function renderCalendar(date) {
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarMonth = document.getElementById("calendar-month");
  if (!calendarGrid || !calendarMonth || !(date instanceof Date)) return;

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
    "August", "September", "Oktober", "November", "Dezember"
  ];
  calendarMonth.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

  // Heute immer mit 0 Uhr
  const realToday = new Date();
  realToday.setHours(0, 0, 0, 0);

  const holidays = [
    "2025-01-01", "2025-05-01", "2025-05-29",
    "2025-10-03", "2025-12-25", "2025-12-26"
  ];

  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  // Header
  calendarGrid.innerHTML = `
    <div class="calendar-day-header">Mo</div>
    <div class="calendar-day-header">Di</div>
    <div class="calendar-day-header">Mi</div>
    <div class="calendar-day-header">Do</div>
    <div class="calendar-day-header">Fr</div>
    <div class="calendar-day-header weekend">Sa</div>
    <div class="calendar-day-header weekend">So</div>
  `;

  // Leere Felder am Monatsanfang (Mo=0 ... So=6)
  const startDay = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startDay; i++) {
    calendarGrid.innerHTML += `<div class="calendar-day empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const loopDate = new Date(date.getFullYear(), date.getMonth(), day);
    loopDate.setHours(0, 0, 0, 0);

    const dateStr = `${loopDate.getFullYear()}-${String(loopDate.getMonth() + 1).padStart(2, "0")}-${String(loopDate.getDate()).padStart(2, "0")}`;
    const isHoliday = holidays.includes(dateStr);
    const wd = loopDate.getDay();

    const isToday = isSameDay(loopDate, realToday);
    const isSelected = window.selectedDate && isSameDay(window.selectedDate, loopDate);

    let className = "calendar-day";
    if (isHoliday) className += " holiday";
    if (wd === 0 || wd === 6) className += " weekend";
    if (isToday) className += " today";
    if (isSelected) className += " selected";

    calendarGrid.innerHTML += `<div class="${className}" data-date="${dateStr}">${day}</div>`;
  }

  // Click Handler neu setzen
  document.querySelectorAll(".calendar-day:not(.empty)").forEach(el => {
    el.addEventListener("click", () => {
      const [y, m, d] = el.getAttribute("data-date").split("-").map(Number);
      selectDay(new Date(y, m - 1, d));
    });
  });
}

// Diese Funktion ab jetzt: KEIN erneutes renderCalendar aufrufen!
function selectDay(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return;

  window.selectedDate = new Date(date);
  window.selectedDate.setHours(0, 0, 0, 0);

  // Markiere nur den aktuellen Tag als selected
  document.querySelectorAll("#calendar-grid .calendar-day").forEach(el => {
    const [y, m, d] = el.getAttribute("data-date")?.split("-") || [];
    if (y && m && d) {
      const thisDate = new Date(Number(y), Number(m) - 1, Number(d));
      thisDate.setHours(0, 0, 0, 0);
      if (isSameDay(thisDate, window.selectedDate)) {
        el.classList.add("selected");
      } else {
        el.classList.remove("selected");
      }
    }
  });

  const selectedDateElement = document.getElementById("selected-date");
  if (selectedDateElement) {
    selectedDateElement.textContent = `für ${window.selectedDate.toLocaleDateString("de-DE")}`;
  }

  renderSidebarAppointments();
  if (typeof renderAppointments === "function") renderAppointments(window.selectedDate);
}


function clearSidebarSelection() {
    document.querySelectorAll("#calendar-grid .calendar-day.selected").forEach(el => {
        el.classList.remove("selected");
    });
}

function renderSidebarAppointments() {
    const list = document.getElementById("sidebar-appointments-list");
    if (!list) return;

    const selected = (window.selectedDate instanceof Date) ? window.selectedDate : new Date();
    selected.setHours(0, 0, 0, 0);

    const key = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`;
    const stored = localStorage.getItem("appointments");
    let dayAppointments = [];

    try {
        const all = stored ? JSON.parse(stored) : [];
        dayAppointments = all.filter(a => a.date === key);
    } catch (e) {
        console.warn("Fehler beim Lesen von Terminen");
    }

    list.innerHTML = "";

    if (dayAppointments.length === 0) {
        list.innerHTML = '<li class="appointment-item no-appointments">Keine Termine für diesen Tag</li>';
        return;
    }

    for (const a of dayAppointments) {
        list.innerHTML += `
            <li class="appointment-item">
                <div class="appointment-time">${a.time}</div>
                <div class="appointment-details">
                    <div class="appointment-title">${a.title}</div>
                    <div class="appointment-location">${a.location}</div>
                </div>
            </li>`;
    }
}

if (!window.__sidebar_initialized__) {
    window.__sidebar_initialized__ = true;

    document.addEventListener("DOMContentLoaded", () => {
        window.today = new Date();
        window.today.setHours(0, 0, 0, 0);

        if (!(window.currentDate instanceof Date)) {
            window.currentDate = new Date(window.today);
        }
        if (!(window.selectedDate instanceof Date)) {
            window.selectedDate = new Date(window.today);
        }

        renderSidebarAppointments();
        renderCalendar(window.currentDate);
    });
}




// Hilfsfunktion ganz oben in der Datei einfügen (nur einmal!)
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function renderCalendar(date) {
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarMonth = document.getElementById("calendar-month");
  if (!calendarGrid || !calendarMonth || !(date instanceof Date)) return;

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
    "August", "September", "Oktober", "November", "Dezember"
  ];
  calendarMonth.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

  // Heute immer mit 0 Uhr
  const realToday = new Date();
  realToday.setHours(0, 0, 0, 0);

  const holidays = [
    "2025-01-01", "2025-05-01", "2025-05-29",
    "2025-10-03", "2025-12-25", "2025-12-26"
  ];

  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  // Header
  calendarGrid.innerHTML = `
    <div class="calendar-day-header">Mo</div>
    <div class="calendar-day-header">Di</div>
    <div class="calendar-day-header">Mi</div>
    <div class="calendar-day-header">Do</div>
    <div class="calendar-day-header">Fr</div>
    <div class="calendar-day-header weekend">Sa</div>
    <div class="calendar-day-header weekend">So</div>
  `;

  // Leere Felder am Monatsanfang (Mo=0 ... So=6)
  const startDay = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startDay; i++) {
    calendarGrid.innerHTML += `<div class="calendar-day empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const loopDate = new Date(date.getFullYear(), date.getMonth(), day);
    loopDate.setHours(0, 0, 0, 0);

    const dateStr = `${loopDate.getFullYear()}-${String(loopDate.getMonth() + 1).padStart(2, "0")}-${String(loopDate.getDate()).padStart(2, "0")}`;
    const isHoliday = holidays.includes(dateStr);
    const wd = loopDate.getDay();

    const isToday = isSameDay(loopDate, realToday);
    const isSelected = window.selectedDate && isSameDay(window.selectedDate, loopDate);

    let className = "calendar-day";
    if (isHoliday) className += " holiday";
    if (wd === 0 || wd === 6) className += " weekend";
    if (isToday) className += " today";
    if (isSelected) className += " selected";

    calendarGrid.innerHTML += `<div class="${className}" data-date="${dateStr}">${day}</div>`;
  }

  // Click Handler neu setzen
  document.querySelectorAll(".calendar-day:not(.empty)").forEach(el => {
    el.addEventListener("click", () => {
      const [y, m, d] = el.getAttribute("data-date").split("-").map(Number);
      selectDay(new Date(y, m - 1, d));
    });
  });
}

// Diese Funktion ab jetzt: KEIN erneutes renderCalendar aufrufen!
function selectDay(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return;

  window.selectedDate = new Date(date);
  window.selectedDate.setHours(0, 0, 0, 0);

  // Markiere nur den aktuellen Tag als selected
  document.querySelectorAll("#calendar-grid .calendar-day").forEach(el => {
    const [y, m, d] = el.getAttribute("data-date")?.split("-") || [];
    if (y && m && d) {
      const thisDate = new Date(Number(y), Number(m) - 1, Number(d));
      thisDate.setHours(0, 0, 0, 0);
      if (isSameDay(thisDate, window.selectedDate)) {
        el.classList.add("selected");
      } else {
        el.classList.remove("selected");
      }
    }
  });

  const selectedDateElement = document.getElementById("selected-date");
  if (selectedDateElement) {
    selectedDateElement.textContent = `für ${window.selectedDate.toLocaleDateString("de-DE")}`;
  }

  renderSidebarAppointments();
  if (typeof renderAppointments === "function") renderAppointments(window.selectedDate);
}


function clearSidebarSelection() {
    document.querySelectorAll("#calendar-grid .calendar-day.selected").forEach(el => {
        el.classList.remove("selected");
    });
}

function renderSidebarAppointments() {
    const list = document.getElementById("sidebar-appointments-list");
    if (!list) return;

    const selected = (window.selectedDate instanceof Date) ? window.selectedDate : new Date();
    selected.setHours(0, 0, 0, 0);

    const key = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`;
    const stored = localStorage.getItem("appointments");
    let dayAppointments = [];

    try {
        const all = stored ? JSON.parse(stored) : [];
        dayAppointments = all.filter(a => a.date === key);
    } catch (e) {
        console.warn("Fehler beim Lesen von Terminen");
    }

    list.innerHTML = "";

    if (dayAppointments.length === 0) {
        list.innerHTML = '<li class="appointment-item no-appointments">Keine Termine für diesen Tag</li>';
        return;
    }

    for (const a of dayAppointments) {
        list.innerHTML += `
            <li class="appointment-item">
                <div class="appointment-time">${a.time}</div>
                <div class="appointment-details">
                    <div class="appointment-title">${a.title}</div>
                    <div class="appointment-location">${a.location}</div>
                </div>
            </li>`;
    }
}

if (!window.__sidebar_initialized__) {
    window.__sidebar_initialized__ = true;

    document.addEventListener("DOMContentLoaded", () => {
        window.today = new Date();
        window.today.setHours(0, 0, 0, 0);

        if (!(window.currentDate instanceof Date)) {
            window.currentDate = new Date(window.today);
        }
        if (!(window.selectedDate instanceof Date)) {
            window.selectedDate = new Date(window.today);
        }

        renderSidebarAppointments();
        renderCalendar(window.currentDate);
    });
}




function initSidebarModules() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    window.today = now;
    window.currentDate = new Date(now);
    window.selectedDate = new Date(now);

    if (document.getElementById("calendar-grid")) renderCalendar(window.currentDate);
    if (document.getElementById("appointments-list")) renderAppointments(window.selectedDate);
    if (document.getElementById("sidebar-appointments-list")) renderSidebarAppointments();
    if (document.getElementById("notes-list")) renderNotes();

    document.querySelectorAll(".modal-close").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.closest(".modal").style.display = "none";
      });
    });
    document.querySelectorAll(".modal-btn-secondary").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.closest(".modal").style.display = "none";
      });
    });

    const addSidebarAppointmentBtn = document.getElementById("add-appointment");
    if (addSidebarAppointmentBtn) {
        addSidebarAppointmentBtn.addEventListener("click", () => {
            const modal = document.getElementById("appointment-modal");
            if (modal) modal.style.display = "flex";
        });
    }

    // Nur diese Zeile hinzufügen (ohne Deko!)
    initNotes();
}



function renderAppointments(date) {
    const appointmentsList = document.getElementById("appointments-list");
    if (!appointmentsList || !date) return;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const stored = localStorage.getItem("appointments");
    const allAppointments = stored ? JSON.parse(stored) : [];
    const dayAppointments = allAppointments.filter(a => a.date === dateStr);

    appointmentsList.innerHTML = "";

    if (dayAppointments.length === 0) {
        appointmentsList.innerHTML = `<li class="appointment-item no-appointments">Keine Termine für diesen Tag</li>`;
    } else {
        dayAppointments.forEach(a => {
            appointmentsList.innerHTML += `
                <li class="appointment-item">
                    <div class="appointment-time">${a.time}</div>
                    <div class="appointment-details">
                        <div class="appointment-title">${a.title}</div>
                        <div class="appointment-location">${a.location}</div>
                    </div>
                </li>
            `;
        });
    }
}

document.addEventListener("DOMContentLoaded", initSidebarModules);





function renderNotes() {
    const notesList = document.getElementById("notes-list");
    if (!notesList) return;

    const notes = JSON.parse(localStorage.getItem("dashboardNotes")) || [];

    notesList.innerHTML = "";

    if (notes.length === 0) {
        notesList.innerHTML = '<li class="note-item no-notes">Keine Notizen gespeichert.</li>';
        return;
    }

    notes.forEach((note, index) => {
        notesList.innerHTML += `
            <li class="note-item" data-index="${index}">
                <div class="note-content">${note.content}</div>
                <div class="note-meta">${new Date(note.timestamp).toLocaleString()}</div>
            </li>
        `;
    });
}

function initNotes() {
    const notesTextarea = document.getElementById("notes-textarea");
    const notesModal = document.getElementById("notes-modal");
    const notesList = document.getElementById("notes-list");
    const noteEditModal = document.getElementById("note-edit-modal");
    const noteEditForm = document.getElementById("note-edit-form");
    const noteContent = document.getElementById("note-content");

    if (!notesTextarea || !notesList) return;

    let notes = JSON.parse(localStorage.getItem("dashboardNotes")) || [];

    document.getElementById("save-notes-btn").addEventListener("click", () => {
        const val = notesTextarea.value.trim();
        if (val) {
            notes.push({ content: val, timestamp: Date.now() });
            localStorage.setItem("dashboardNotes", JSON.stringify(notes));
            notesTextarea.value = "";
            renderNotes();
            if (notesModal) {
                notesModal.classList.add("show");
                setTimeout(() => notesModal.classList.remove("show"), 2000);
            }
        }
    });

    notesList.addEventListener("click", (e) => {
        const item = e.target.closest(".note-item");
        const index = item ? parseInt(item.getAttribute("data-index")) : -1;
        if (item && index >= 0) {
            noteContent.value = notes[index].content;
            noteEditModal.style.display = "flex";

            noteEditForm.onsubmit = (e) => {
                e.preventDefault();
                const newContent = noteContent.value.trim();
                if (newContent) {
                    notes[index].content = newContent;
                    notes[index].timestamp = Date.now();
                    localStorage.setItem("dashboardNotes", JSON.stringify(notes));
                    renderNotes();
                    noteEditModal.style.display = "none";
                }
            };

            noteEditModal.querySelector(".modal-btn-delete").onclick = () => {
                notes.splice(index, 1);
                localStorage.setItem("dashboardNotes", JSON.stringify(notes));
                renderNotes();
                noteEditModal.style.display = "none";
            };

            noteEditModal.querySelector(".modal-btn-secondary").onclick = () => {
                noteEditModal.style.display = "none";
            };

            noteEditModal.querySelector(".modal-close").onclick = () => {
                noteEditModal.style.display = "none";
            };

            noteEditModal.addEventListener("click", e => {
                if (e.target === noteEditModal) noteEditModal.style.display = "none";
            }, { once: true });
        }
    });

    renderNotes();
}


function prevMonth() {
    window.currentDate.setMonth(window.currentDate.getMonth() - 1);
    renderCalendar(window.currentDate);
}
function nextMonth() {
    window.currentDate.setMonth(window.currentDate.getMonth() + 1);
    renderCalendar(window.currentDate);
}


document.querySelectorAll(".section-header").forEach(header => {
  header.addEventListener("click", () => {
    const checkbox = header.previousElementSibling;
    if (checkbox && checkbox.type === "checkbox") {
      checkbox.checked = !checkbox.checked;
    }
  });
});



function renderAppointments(date) {
    const appointmentsList = document.getElementById("appointments-list");
    if (!appointmentsList || !date) return;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const stored = localStorage.getItem("appointments");
    const allAppointments = stored ? JSON.parse(stored) : [];
    const dayAppointments = allAppointments.filter(a => a.date === dateStr);

    appointmentsList.innerHTML = "";

    if (dayAppointments.length === 0) {
        appointmentsList.innerHTML = `<li class="appointment-item no-appointments">Keine Termine für diesen Tag</li>`;
    } else {
        dayAppointments.forEach(a => {
            appointmentsList.innerHTML += `
                <li class="appointment-item">
                    <div class="appointment-time">${a.time}</div>
                    <div class="appointment-details">
                        <div class="appointment-title">${a.title}</div>
                        <div class="appointment-location">${a.location}</div>
                    </div>
                </li>
            `;
        });
    }
}

document.addEventListener("DOMContentLoaded", initSidebarModules);





function renderNotes() {
    const notesList = document.getElementById("notes-list");
    if (!notesList) return;

    const notes = JSON.parse(localStorage.getItem("dashboardNotes")) || [];

    notesList.innerHTML = "";

    if (notes.length === 0) {
        notesList.innerHTML = '<li class="note-item no-notes">Keine Notizen gespeichert.</li>';
        return;
    }

    notes.forEach((note, index) => {
        notesList.innerHTML += `
            <li class="note-item" data-index="${index}">
                <div class="note-content">${note.content}</div>
                <div class="note-meta">${new Date(note.timestamp).toLocaleString()}</div>
            </li>
        `;
    });
}

function initNotes() {
    const notesTextarea = document.getElementById("notes-textarea");
    const notesModal = document.getElementById("notes-modal");
    const notesList = document.getElementById("notes-list");
    const noteEditModal = document.getElementById("note-edit-modal");
    const noteEditForm = document.getElementById("note-edit-form");
    const noteContent = document.getElementById("note-content");

    if (!notesTextarea || !notesList) return;

    let notes = JSON.parse(localStorage.getItem("dashboardNotes")) || [];

    document.getElementById("save-notes-btn").addEventListener("click", () => {
        const val = notesTextarea.value.trim();
        if (val) {
            notes.push({ content: val, timestamp: Date.now() });
            localStorage.setItem("dashboardNotes", JSON.stringify(notes));
            notesTextarea.value = "";
            renderNotes();
            if (notesModal) {
                notesModal.classList.add("show");
                setTimeout(() => notesModal.classList.remove("show"), 2000);
            }
        }
    });

    notesList.addEventListener("click", (e) => {
        const item = e.target.closest(".note-item");
        const index = item ? parseInt(item.getAttribute("data-index")) : -1;
        if (item && index >= 0) {
            noteContent.value = notes[index].content;
            noteEditModal.style.display = "flex";

            noteEditForm.onsubmit = (e) => {
                e.preventDefault();
                const newContent = noteContent.value.trim();
                if (newContent) {
                    notes[index].content = newContent;
                    notes[index].timestamp = Date.now();
                    localStorage.setItem("dashboardNotes", JSON.stringify(notes));
                    renderNotes();
                    noteEditModal.style.display = "none";
                }
            };

            noteEditModal.querySelector(".modal-btn-delete").onclick = () => {
                notes.splice(index, 1);
                localStorage.setItem("dashboardNotes", JSON.stringify(notes));
                renderNotes();
                noteEditModal.style.display = "none";
            };

            noteEditModal.querySelector(".modal-btn-secondary").onclick = () => {
                noteEditModal.style.display = "none";
            };

            noteEditModal.querySelector(".modal-close").onclick = () => {
                noteEditModal.style.display = "none";
            };

            noteEditModal.addEventListener("click", e => {
                if (e.target === noteEditModal) noteEditModal.style.display = "none";
            }, { once: true });
        }
    });

    renderNotes();
}


function prevMonth() {
    window.currentDate.setMonth(window.currentDate.getMonth() - 1);
    renderCalendar(window.currentDate);
}
function nextMonth() {
    window.currentDate.setMonth(window.currentDate.getMonth() + 1);
    renderCalendar(window.currentDate);
}


document.querySelectorAll(".section-header").forEach(header => {
  header.addEventListener("click", () => {
    const checkbox = header.previousElementSibling;
    if (checkbox && checkbox.type === "checkbox") {
      checkbox.checked = !checkbox.checked;
    }
  });
});
