(() => {
    // --------- VARIABLEN UND SETUP ---------------
    const calendarView = document.getElementById('calendar-view');
    const monthLabel = document.getElementById('month-label');
    const panel = document.getElementById('appointment-panel');
    const panelTitle = document.getElementById('panel-title');
    const dayGrid = document.getElementById('day-grid'); // <- wichtig!
    const addAppointmentBtn = document.getElementById('add-appointment');
    const modal = document.getElementById('appointment-modal');
    const appointmentForm = document.getElementById('appointment-form');
    const timeSelect = document.getElementById('appointment-time');
    const durationSelect = document.getElementById('appointment-duration');
    const calendarContainer = document.getElementById('calendar-container');
    const toggleCalendarBtn = document.getElementById('toggle-calendar');

    let currentDate = new Date();
    let selectedDate = new Date();
    let dataStore = {};

    // Termine aus LocalStorage laden
    try {
        const stored = localStorage.getItem("appointments");
        const loaded = stored ? JSON.parse(stored) : [];
        loaded.forEach(entry => {
            const key = entry.date;
            if (!dataStore[key]) dataStore[key] = [];
            dataStore[key].push(entry);
        });
    } catch (e) {
        console.warn("Fehler beim Laden der Termine aus localStorage");
    }

    // Zeitoptionen & Dauern befüllen
    if (timeSelect && durationSelect) {
        for (let h = 7; h <= 19; h++) {
            for (let m = 0; m < 60; m += 30) {
                const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                timeSelect.appendChild(option);
            }
        }
        [
            '10min', '20min', '30min', '40min', '50min',
            '1h', '1h30m', '2h', '2h30m', '3h', '3h30m', '4h', '4h30m', '5h', '5h30m', '6h',
            '6h30m', '7h', '7h30m', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h',
            '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h', '24h'
        ].forEach(d => {
            const option = document.createElement('option');
            option.value = d;
            option.textContent = d;
            durationSelect.appendChild(option);
        });
    }

    // --------- HILFSFUNKTIONEN ---------------
    function getDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function isPastDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }

    // --------- MONATSKALENDER ---------------
    function renderCalendar(date) {
        calendarView.innerHTML = '';
        monthLabel.textContent = date.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
        ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            calendarView.appendChild(header);
        });

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const offset = (firstDay + 6) % 7;
        for (let i = 0; i < offset; i++) calendarView.appendChild(document.createElement('div'));

        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const selectedKey = getDateKey(selectedDate);

        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            const dateObj = new Date(date.getFullYear(), date.getMonth(), d);
            const dateKey = getDateKey(dateObj);

            if (dateKey === getDateKey(new Date())) cell.classList.add('today');
            if (dateKey === selectedKey) cell.classList.add('selected');
            if ([0, 6].includes(dateObj.getDay())) cell.classList.add('weekend');

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = d;
            cell.appendChild(dayNumber);

            const events = dataStore[dateKey] || [];
            if (events.length) {
                const indicator = document.createElement('span');
                indicator.className = 'event-indicator';
                indicator.textContent = events.length;
                cell.appendChild(indicator);

                const tooltip = document.createElement('div');
                tooltip.className = 'event-tooltip';
                tooltip.textContent = events.map(e => `${e.time} (${e.duration}) - ${e.customer}: ${e.service}`).join(', ');
                cell.appendChild(tooltip);
            }

            cell.onclick = () => {
                selectedDate = new Date(date.getFullYear(), date.getMonth(), d);
                renderCalendar(currentDate);
                showDayView(selectedDate);
            };

            calendarView.appendChild(cell);
        }
    }

    // --------- TAGESANSICHT: 07:00–19:00 als Zeitraster ---------------
 function showDayView(date) {
    panel.classList.add('active');
    panelTitle.textContent = date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const key = getDateKey(date);
    const events = dataStore[key] || [];

    dayGrid.innerHTML = '';
    const startHour = 7, endHour = 19;
    for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += 30) {
            const timeStr = `${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}`;
            // Linke Spalte: Zeitbeschriftung
            const hourDiv = document.createElement('div');
            hourDiv.className = 'day-grid-hour';
            hourDiv.textContent = timeStr;
            dayGrid.appendChild(hourDiv);

            // Rechte Spalte: Slot für mehrere Termine ODER frei
            const slotDiv = document.createElement('div');
            slotDiv.className = 'day-grid-slot free';

            // Alle Events für diesen Slot
            const slotEvents = events.filter(e => e.time === timeStr);

            if (slotEvents.length > 0) {
                slotDiv.className = 'day-grid-slot termin-multi';
                // Termin-Badges-Container
                const badgeContainer = document.createElement('div');
                badgeContainer.className = 'termin-badges';

                slotEvents.forEach((event, i) => {
                    const badge = document.createElement('div');
                    badge.className = 'termin-badge';
                    badge.innerHTML = `
                        <span>${event.time} (${event.duration}) - ${event.customer}: ${event.service} ${event.vehicle ? '(' + event.vehicle + ')' : ''}</span>
                        <div>
                            <button class="edit-btn" title="Bearbeiten"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" title="Löschen"><i class="fas fa-trash"></i></button>
                        </div>
                    `;
                    badge.querySelector('.edit-btn').onclick = () => editAppointment(key, events.indexOf(slotEvents[i]), date.getDate());
                    badge.querySelector('.delete-btn').onclick = () => {
                        dataStore[key].splice(events.indexOf(slotEvents[i]), 1);
                        if (!dataStore[key].length) delete dataStore[key];
                        showDayView(date);
                        renderCalendar(currentDate);
                    };
                    badgeContainer.appendChild(badge);
                });

                slotDiv.appendChild(badgeContainer);

                // Slot selbst klickbar für weiteren Termin
                slotDiv.onclick = (e) => {
                    // Nur wenn außerhalb der Buttons geklickt wird
                    if (e.target === slotDiv) {
                        selectedDate = new Date(date);
                        openModal(date.getDate());
                    }
                };
            } else {
                slotDiv.onclick = () => {
                    selectedDate = new Date(date);
                    openModal(date.getDate());
                };
            }
            dayGrid.appendChild(slotDiv);
        }
    }
}


    // --------- MODAL HANDLING (Termine anlegen/bearbeiten) ---------------
    function openModal(day) {
        const dateObj = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        if (isPastDate(dateObj)) {
            alert('Neue Termine können für vergangene Daten nicht erstellt werden.');
            return;
        }
        modal.style.display = 'flex';
        appointmentForm.reset();
        document.querySelector('.modal-title').textContent = `Neuer Termin am ${day}. ${currentDate.toLocaleString('de-DE', { month: 'long' })} ${currentDate.getFullYear()}`;

        appointmentForm.onsubmit = (e) => {
            e.preventDefault();
            const key = getDateKey(selectedDate);
            const time = document.getElementById('appointment-time').value;
            const duration = document.getElementById('appointment-duration').value;
            const customer = document.getElementById('appointment-customer').value;
            const vehicle = document.getElementById('appointment-vehicle').value;
            const service = document.getElementById('appointment-service').value;
            const note = document.getElementById('appointment-note').value;
            const price = document.getElementById('appointment-price').value;
            dataStore[key] = dataStore[key] || [];
            dataStore[key].push({ time, duration, customer, vehicle, service, note, price });
            localStorage.setItem("appointments", JSON.stringify(
                Object.values(dataStore).flat()
            ));
            modal.style.display = 'none';
            showDayView(selectedDate);
            renderCalendar(currentDate);
        };
    }

    function editAppointment(key, index, day) {
        const event = dataStore[key][index];
        openModal(day);
        document.getElementById('appointment-time').value = event.time;
        document.getElementById('appointment-duration').value = event.duration;
        document.getElementById('appointment-customer').value = event.customer;
        document.getElementById('appointment-vehicle').value = event.vehicle || '';
        document.getElementById('appointment-service').value = event.service;
        document.getElementById('appointment-note').value = event.note || '';
        document.getElementById('appointment-price').value = event.price || '';

        appointmentForm.onsubmit = (e) => {
            e.preventDefault();
            const time = document.getElementById('appointment-time').value;
            const duration = document.getElementById('appointment-duration').value;
            const customer = document.getElementById('appointment-customer').value;
            const vehicle = document.getElementById('appointment-vehicle').value;
            const service = document.getElementById('appointment-service').value;
            const note = document.getElementById('appointment-note').value;
            const price = document.getElementById('appointment-price').value;
            dataStore[key][index] = { time, duration, customer, vehicle, service, note, price };
            localStorage.setItem("appointments", JSON.stringify(
                Object.values(dataStore).flat()
            ));
            modal.style.display = 'none';
            showDayView(selectedDate);
            renderCalendar(currentDate);
        };
    }

    // --------- STEUERUNG DER KALENDER-NAVIGATION ---------------
    document.getElementById('prev-month').onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    };
    document.getElementById('next-month').onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    };
    document.getElementById('today').onclick = () => {
        currentDate = new Date();
        selectedDate = new Date();
        renderCalendar(currentDate);
        showDayView(selectedDate);
    };

    // Panel bleibt IMMER offen (nicht mehr schließbar)
    // Modal-Schließen
    document.querySelector('.modal-close').onclick = () => {
        modal.style.display = 'none';
    };
    document.querySelector('.modal-btn-secondary').onclick = () => {
        modal.style.display = 'none';
    };
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Kalender aus/einklappen
    let isCalendarCollapsed = false;
    toggleCalendarBtn.onclick = () => {
        isCalendarCollapsed = !isCalendarCollapsed;
        calendarContainer.classList.toggle('collapsed', isCalendarCollapsed);
        const icon = toggleCalendarBtn.querySelector('i');
        icon.classList.toggle('fa-chevron-up', !isCalendarCollapsed);
        icon.classList.toggle('fa-chevron-down', isCalendarCollapsed);
        toggleCalendarBtn.title = isCalendarCollapsed ? 'Kalender aufklappen' : 'Kalender zuklappen';
    };

    // Button "Neuen Termin hinzufügen" fügt Termin zum aktuell selektierten Zeit-Slot hinzu
    addAppointmentBtn.onclick = () => {
        openModal(selectedDate.getDate());
    };

    // --------- INIT ---------------
    renderCalendar(currentDate);
    showDayView(selectedDate);
})();
