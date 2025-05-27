function renderCalendar(date) {
    const calendarGrid = document.getElementById("calendar-grid");
    const calendarMonth = document.getElementById("calendar-month");

    if (!calendarGrid || !calendarMonth || !date) return;

    const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    calendarMonth.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    const realToday = new Date(); // Aktuelles Datum
    realToday.setHours(0, 0, 0, 0);

    const holidays = [
        "2025-01-01", "2025-05-01", "2025-05-29",
        "2025-10-03", "2025-12-25", "2025-12-26"
    ];

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    calendarGrid.innerHTML = `
        <div class="calendar-day-header">Mo</div>
        <div class="calendar-day-header">Di</div>
        <div class="calendar-day-header">Mi</div>
        <div class="calendar-day-header">Do</div>
        <div class="calendar-day-header">Fr</div>
        <div class="calendar-day-header weekend">Sa</div>
        <div class="calendar-day-header weekend">So</div>
    `;

    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startDay; i++) {
        calendarGrid.innerHTML += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const wd = new Date(date.getFullYear(), date.getMonth(), day).getDay();
        const currentLoopDate = new Date(date.getFullYear(), date.getMonth(), day);
        currentLoopDate.setHours(0, 0, 0, 0);

        const isToday = currentLoopDate.getTime() === realToday.getTime();
        const isSelected = window.selectedDate &&
            window.selectedDate.getFullYear() === date.getFullYear() &&
            window.selectedDate.getMonth() === date.getMonth() &&
            window.selectedDate.getDate() === day;

        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const isHoliday = holidays.includes(dateStr);

        let className = "calendar-day";
        if (isHoliday) className += " holiday";
        else if (wd === 0 || wd === 6) className += " weekend";
        if (isToday) className += " today";
        if (isSelected) className += " selected";

        calendarGrid.innerHTML += `<div class="${className}" data-date="${dateStr}">${day}</div>`;
    }

    document.querySelectorAll(".calendar-day:not(.empty)").forEach(el => {
        el.addEventListener("click", () => {
            const [y, m, d] = el.getAttribute("data-date").split("-").map(Number);
            selectDay(new Date(y, m - 1, d));
        });
    });
}

function selectDay(date) {
    if (!date || isNaN(new Date(date).getTime())) return;

    window.selectedDate = new Date(date);
    window.selectedDate.setHours(0, 0, 0, 0);

    const selectedDateElement = document.getElementById("selected-date");
    if (selectedDateElement) {
        selectedDateElement.textContent = `für ${window.selectedDate.toLocaleDateString("de-DE")}`;
    }

    clearSidebarSelection();

    const formatted = `${window.selectedDate.getFullYear()}-${String(window.selectedDate.getMonth() + 1).padStart(2, "0")}-${String(window.selectedDate.getDate()).padStart(2, "0")}`;
    const selectedEl = document.querySelector(`[data-date='${formatted}']`);
    if (selectedEl) selectedEl.classList.add("selected");

    renderCalendar(window.currentDate);
    renderAppointments(window.selectedDate);
    renderSidebarAppointments();
}

function renderAppointments(date) {
    const appointmentsList = document.getElementById("appointments-list");
    if (!appointmentsList || !date) return;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const dayAppointments = appointments.filter(a => a.date === dateStr);
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

function clearSidebarSelection() {
    const allDays = document.querySelectorAll("#calendar-grid .calendar-day");
    allDays.forEach(el => el.classList.remove("selected"));
}

function renderSidebarAppointments() {
    const sidebarList = document.getElementById("sidebar-appointments-list");
    if (!sidebarList) return;

    const selected = window.selectedDate || new Date();
    selected.setHours(0, 0, 0, 0);

    const selectedKey = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`;

    try {
        const stored = localStorage.getItem("appointments");
        const allAppointments = stored ? JSON.parse(stored) : [];
        const dayAppointments = allAppointments.filter(a => a.date === selectedKey);

        sidebarList.innerHTML = "";
        if (dayAppointments.length === 0) {
            sidebarList.innerHTML = '<li class="appointment-item no-appointments">Keine Termine für diesen Tag</li>';
        } else {
            dayAppointments.forEach(a => {
                sidebarList.innerHTML += `
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
    } catch (e) {
        sidebarList.innerHTML = '<li class="appointment-item">Fehler beim Laden</li>';
    }
}


function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
}

function initializeModal() {
    const modal = document.getElementById("appointment-modal");
    const addBtn = document.getElementById("add-appointment");
    const form = document.getElementById("appointment-form");
    const timeSelect = document.getElementById("appointment-time");
    const durationSelect = document.getElementById("appointment-duration");

    for (let h = 7; h <= 19; h++) {
        for (let m = 0; m < 60; m += 30) {
            const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            const opt = document.createElement("option"); opt.value = time; opt.textContent = time;
            timeSelect.appendChild(opt);
        }
    }
    const durations = ["10min", "20min", "30min", "40min", "50min", "1h", "1h30m", "2h", "2h30m", "3h", "3h30m", "4h", "4h30m", "5h", "5h30m", "6h", "6h30m", "7h", "7h30m", "8h", "9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h", "23h", "24h"];
    durations.forEach(d => {
        const opt = document.createElement("option"); opt.value = d; opt.textContent = d;
        durationSelect.appendChild(opt);
    });

    function isPastDate(d) {
        const t = new Date(); t.setHours(0, 0, 0, 0);
        return d < t;
    }

    addBtn.addEventListener("click", () => {
        if (isPastDate(selectedDate)) {
            alert("Neue Termine können für vergangene Daten nicht erstellt werden.");
            return;
        }
        modal.style.display = "flex";
        form.reset();
        document.querySelector(".modal-title").textContent = `Neuer Termin am ${selectedDate.getDate()}. ${selectedDate.toLocaleDateString("de-DE", { month: "long" })} ${selectedDate.getFullYear()}`;
    });

    document.querySelector(".modal-close").addEventListener("click", () => modal.style.display = "none");
    document.querySelector(".modal-btn-secondary").addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

    form.addEventListener("submit", e => {
        e.preventDefault();
        const time = timeSelect.value;
        const duration = durationSelect.value;
        const customer = document.getElementById("appointment-customer").value;
        const vehicle = document.getElementById("appointment-vehicle").value;
        const service = document.getElementById("appointment-service").value;
        const note = document.getElementById("appointment-note").value;
        const price = parseFloat(document.getElementById("appointment-price").value) || 0;
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
        const title = `${service} - ${customer}${vehicle ? ` (${vehicle})` : ""}`;
        const newAppt = { date: dateStr, time, title, location: "Werkstatt", customer, service, vehicle, duration, note, price };
        appointments.push(newAppt);
        localStorage.setItem("appointments", JSON.stringify(appointments));
        modal.style.display = "none";
        renderAppointments(selectedDate);
    });
}

const today = new Date(2025, 4, 14);
let currentDate = new Date(2025, 4, 14);
let selectedDate = new Date(2025, 4, 14);
const defaultAppointments = [
  {
    "date": "2025-05-14",
    "time": "10:00",
    "title": "Ölwechsel - Herr Schmidt (Audi A4)",
    "location": "Werkstatt",
    "customer": "Herr Schmidt",
    "service": "Ölwechsel",
    "vehicle": "Audi A4",
    "duration": "1h",
    "note": "Bitte auch Reifenluftdruck prüfen",
    "price": 89.99
  },
  {
    "date": "2025-05-14",
    "time": "11:30",
    "title": "Inspektion - Frau Müller (BMW 3er)",
    "location": "Werkstatt",
    "customer": "Frau Müller",
    "service": "Inspektion",
    "vehicle": "BMW 3er",
    "duration": "2h",
    "note": "Kundin wartet vor Ort",
    "price": 199.50
  },
  {
    "date": "2025-05-14",
    "time": "09:00",
    "title": "Bremsenwechsel - Herr Yilmaz (VW Golf)",
    "location": "Werkstatt",
    "customer": "Herr Yilmaz",
    "service": "Bremsenwechsel",
    "vehicle": "VW Golf",
    "duration": "2h30m",
    "note": "",
    "price": 250.00
  },
  {
    "date": "2025-05-17",
    "time": "13:00",
    "title": "Reifenwechsel - Herr Steiner (Mercedes E-Klasse)",
    "location": "Werkstatt",
    "customer": "Herr Steiner",
    "service": "Reifenwechsel",
    "vehicle": "Mercedes E-Klasse",
    "duration": "1h",
    "note": "",
    "price": 79.00
  }
];

let appointments = [];

try {
  const stored = localStorage.getItem("appointments");
  appointments = stored ? JSON.parse(stored) : defaultAppointments;
} catch (e) {
  console.warn("Invalid appointments data, using default.");
  appointments = defaultAppointments;
}

let notes = JSON.parse(localStorage.getItem("dashboardNotes")) || [];

document.addEventListener("DOMContentLoaded", () => {
    const notesTextarea = document.getElementById("notes-textarea");
    const notesModal = document.getElementById("notes-modal");
    const notesList = document.getElementById("notes-list");
    const noteEditModal = document.getElementById("note-edit-modal");
    const noteEditForm = document.getElementById("note-edit-form");
    const noteContent = document.getElementById("note-content");

    function renderNotes() {
        notesList.innerHTML = "";
        if (notes.length === 0) {
            notesList.innerHTML = '<li class="note-item no-notes">Keine Notizen gespeichert.</li>';
        } else {
            notes.forEach((note, index) => {
                notesList.innerHTML += `
                    <li class="note-item" data-index="${index}">
                        <div class="note-content">${note.content}</div>
                        <div class="note-meta">${new Date(note.timestamp).toLocaleString()}</div>
                    </li>
                `;
            });
        }
    }

    document.getElementById("save-notes-btn").addEventListener("click", () => {
        const val = notesTextarea.value.trim();
        if (val) {
            notes.push({ content: val, timestamp: Date.now() });
            localStorage.setItem("dashboardNotes", JSON.stringify(notes));
            notesTextarea.value = "";
            renderNotes();
            notesModal.classList.add("show");
            setTimeout(() => notesModal.classList.remove("show"), 2000);
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


    document.querySelectorAll(".section-header .toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            btn.closest("section").classList.toggle("collapsed");
        });
    });


    document.querySelectorAll(".calendar-section, .appointments-section, .notes-section").forEach(section => {
        section.addEventListener("click", (e) => {
            const toggleCheckbox = section.querySelector(".toggle-checkbox");
            const sectionHeader = e.target.closest(".section-header");
            const interactiveElements = ["BUTTON", "INPUT", "SELECT", "TEXTAREA", "LABEL"];
            const excludedClasses = ".toggle-btn, .nav-arrow, .calendar-day, .appointment-item, .note-item";

            if (!toggleCheckbox.checked) {

                if (!interactiveElements.includes(e.target.tagName) && !e.target.closest(excludedClasses)) {
                    toggleCheckbox.checked = true;
                    section.classList.remove("collapsed");
                }
            } else if (sectionHeader && !e.target.closest(excludedClasses)) {
                
                toggleCheckbox.checked = false;
                section.classList.add("collapsed");
            }

        });
    });

    initializeModal();
    renderCalendar(currentDate);
    selectDay(currentDate);
    renderNotes();
});


document.addEventListener("DOMContentLoaded", () => {
    const sidebarAddBtn = document.getElementById("sidebar-add-appointment");
    const modal = document.getElementById("appointment-modal");
    const form = document.getElementById("appointment-form");

    if (sidebarAddBtn && modal && form) {
        sidebarAddBtn.addEventListener("click", () => {
            const today = new Date();
            const selected = window.selectedDate || today;

            // Prüfen ob vergangenes Datum
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);
            if (selected < todayMidnight) {
                alert("Neue Termine können für vergangene Daten nicht erstellt werden.");
                return;
            }

            // Modal öffnen
            form.reset();
            document.querySelector(".modal-title").textContent = `Neuer Termin am ${selected.getDate()}. ${selected.toLocaleString("de-DE", { month: "long" })} ${selected.getFullYear()}`;
            modal.style.display = "flex";
        });
    }
});






// === Sidebar-Termine & Modal ===

function renderSidebarAppointments() {
    const sidebarList = document.getElementById("sidebar-appointments-list");
    if (!sidebarList) return;

    let selected = window.selectedDate;
    if (!selected) selected = new Date();
    selected.setHours(0, 0, 0, 0);

    const selectedKey = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`;

    try {
        const stored = localStorage.getItem("appointments");
        const allAppointments = stored ? JSON.parse(stored) : [];
        const dayAppointments = allAppointments.filter(a => a.date === selectedKey);

        sidebarList.innerHTML = "";
        if (dayAppointments.length === 0) {
            sidebarList.innerHTML = '<li class="appointment-item no-appointments">Keine Termine für diesen Tag</li>';
        } else {
            dayAppointments.forEach(a => {
                sidebarList.innerHTML += `
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
    } catch (e) {
        sidebarList.innerHTML = '<li class="appointment-item">Fehler beim Laden</li>';
    }
}

function renderNotes() {
    const notesList = document.getElementById("notes-list");
    const notes = JSON.parse(localStorage.getItem("dashboardNotes")) || [];
    if (!notesList) return;
    notesList.innerHTML = "";
    if (notes.length === 0) {
        notesList.innerHTML = '<li class="note-item no-notes">Keine Notizen gespeichert.</li>';
    } else {
        notes.forEach((note, index) => {
            notesList.innerHTML += `
                <li class="note-item" data-index="${index}">
                    <div class="note-content">${note.content}</div>
                    <div class="note-meta">${new Date(note.timestamp).toLocaleString()}</div>
                </li>
            `;
        });
    }
}

if (!window.__sidebar_initialized__) {
    window.__sidebar_initialized__ = true;
    document.addEventListener("DOMContentLoaded", () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        window.today = new Date(now);
        window.currentDate = new Date(now);
        window.selectedDate = new Date(now);

        renderSidebarAppointments();
        renderNotes();

        if (typeof renderCalendar === "function") {
            renderCalendar(window.currentDate);
        }
    });
}

function clearSidebarSelection() {
    const allDays = document.querySelectorAll("#calendar-grid .calendar-day");
    allDays.forEach(el => el.classList.remove("selected"));
}

window.selectDay = function(date) {
    if (!date || isNaN(new Date(date).getTime())) return;

    window.selectedDate = new Date(date);
    window.selectedDate.setHours(0, 0, 0, 0);

    clearSidebarSelection();

    const formatted = `${window.selectedDate.getFullYear()}-${String(window.selectedDate.getMonth() + 1).padStart(2, "0")}-${String(window.selectedDate.getDate()).padStart(2, "0")}`;
    const selectedEl = document.querySelector(`[data-date='${formatted}']`);
    if (selectedEl) selectedEl.classList.add("selected");

    renderSidebarAppointments();
    renderNotes();

    if (typeof renderCalendar === "function") {
        renderCalendar(window.currentDate);
    }
};
