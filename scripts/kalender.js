
    (() => {
        const calendarView = document.getElementById('calendar-view');
        const monthLabel = document.getElementById('month-label');
        const panel = document.getElementById('appointment-panel');
        const panelTitle = document.getElementById('panel-title');
        const appointmentList = document.getElementById('appointment-list');
        const addAppointmentBtn = document.getElementById('add-appointment');
        const pastDateMessage = document.getElementById('past-date-message');
        const modal = document.getElementById('appointment-modal');
        const appointmentForm = document.getElementById('appointment-form');
        const timeSelect = document.getElementById('appointment-time');
        const durationSelect = document.getElementById('appointment-duration');
        const calendarContainer = document.getElementById('calendar-container');
        const toggleCalendarBtn = document.getElementById('toggle-calendar');
        let currentDate = new Date();
        let selectedDate = new Date();
        let dataStore = {};

        for (let h = 7; h <= 19; h++) {
            for (let m = 0; m < 60; m += 30) {
                const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                timeSelect.appendChild(option);
            }
        }

        const durations = [
            '10min', '20min', '30min', '40min', '50min',
            '1h', '1h30m', '2h', '2h30m', '3h', '3h30m', '4h', '4h30m', '5h', '5h30m', '6h',
            '6h30m', '7h', '7h30m', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h',
            '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h', '24h'
        ];
        durations.forEach(d => {
            const option = document.createElement('option');
            option.value = d;
            option.textContent = d;
            durationSelect.appendChild(option);
        });

        function getDateKey(date) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        function isPastDate(date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
        }

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
                    showAppointments(dateKey, d);
                };
                calendarView.appendChild(cell);
            }
        }

        function showAppointments(key, day) {
            panel.classList.add('active');
            panelTitle.textContent = `${day}. ${currentDate.toLocaleString('de-DE', { month: 'long' })} ${currentDate.getFullYear()}`;
            appointmentList.innerHTML = '';
            const isPast = isPastDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            addAppointmentBtn.disabled = isPast;
            pastDateMessage.style.display = isPast ? 'block' : 'none';
            const events = dataStore[key] || [];
            events.forEach((event, index) => {
                const item = document.createElement('div');
                item.className = 'appointment-item';
                item.innerHTML = `
                    <span>${event.time} (${event.duration}) - ${event.customer}: ${event.service} ${event.vehicle ? '(' + event.vehicle + ')' : ''}</span>
                    <div>
                        <button class="edit-btn"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                item.querySelector('.edit-btn').onclick = () => editAppointment(key, index, day);
                item.querySelector('.delete-btn').onclick = () => {
                    dataStore[key].splice(index, 1);
                    if (!dataStore[key].length) delete dataStore[key];
                    renderCalendar(currentDate);
                    showAppointments(key, day);
                };
                appointmentList.appendChild(item);
            });
        }

function openModal(day) {
    if (isPastDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))) {
        alert('Neue Termine können für vergangene Daten nicht erstellt werden.');
        return; // <--- WICHTIG
    }

    modal.style.display = 'flex';
    appointmentForm.reset();
    document.querySelector('.modal-title').textContent = `Neuer Termin am ${day}. ${currentDate.toLocaleString('de-DE', { month: 'long' })} ${currentDate.getFullYear()}`;
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
                modal.style.display = 'none';
                renderCalendar(currentDate);
                showAppointments(key, day);
            };
        }

addAppointmentBtn.onclick = () => {
    const day = selectedDate.getDate();
    const key = getDateKey(selectedDate);

    if (isPastDate(selectedDate)) {
        alert('Neue Termine können für vergangene Daten nicht erstellt werden.');
        return;
    }

    openModal(day);
    appointmentForm.onsubmit = (e) => {
        e.preventDefault();
        const time = document.getElementById('appointment-time').value;
        const duration = document.getElementById('appointment-duration').value;
        const customer = document.getElementById('appointment-customer').value;
        const vehicle = document.getElementById('appointment-vehicle').value;
        const service = document.getElementById('appointment-service').value;
        const note = document.getElementById('appointment-note').value;
        const price = document.getElementById('appointment-price').value;
        dataStore[key] = dataStore[key] || [];
        dataStore[key].push({ time, duration, customer, vehicle, service, note, price });
        modal.style.display = 'none';
        renderCalendar(currentDate);
        showAppointments(key, day);
    };
};


        toggleCalendarBtn.onclick = () => {
            isCalendarCollapsed = !isCalendarCollapsed;
            calendarContainer.classList.toggle('collapsed', isCalendarCollapsed);
            const icon = toggleCalendarBtn.querySelector('i');
            icon.classList.toggle('fa-chevron-up', !isCalendarCollapsed);
            icon.classList.toggle('fa-chevron-down', isCalendarCollapsed);
            toggleCalendarBtn.title = isCalendarCollapsed ? 'Kalender aufklappen' : 'Kalender zuklappen';
        };

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        document.getElementById('prev-month').onclick = () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            if (selectedDate.getMonth() !== currentDate.getMonth()) {
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            }
            renderCalendar(currentDate);
            panel.classList.remove('active');
            modal.style.display = 'none';
        };
        document.getElementById('next-month').onclick = () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            if (selectedDate.getMonth() !== currentDate.getMonth()) {
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            }
            renderCalendar(currentDate);
            panel.classList.remove('active');
            modal.style.display = 'none';
        };
        document.getElementById('today').onclick = () => {
            currentDate = new Date();
            selectedDate = new Date();
            renderCalendar(currentDate);
            panel.classList.remove('active');
            modal.style.display = 'none';
        };
        document.getElementById('close-panel').onclick = () => {
            panel.classList.remove('active');
        };
        document.querySelector('.modal-close').onclick = () => {
            modal.style.display = 'none';
        };
        document.querySelector('.modal-btn-secondary').onclick = () => {
            modal.style.display = 'none';
        };

        renderCalendar(currentDate);
    })();
    

// Notizenbereich einklappen/ausklappen über Titel ODER Pfeil
document.querySelectorAll(".notes-section").forEach(section => {
    const header = section.querySelector(".section-header");
    const toggleCheckbox = section.querySelector(".toggle-checkbox");

    if (header && toggleCheckbox) {
        header.addEventListener("click", (e) => {
            const ignoredTags = ["BUTTON", "INPUT", "SELECT", "TEXTAREA", "LABEL", "I"];
            if (ignoredTags.includes(e.target.tagName)) return;

            toggleCheckbox.checked = !toggleCheckbox.checked;
            section.classList.toggle("collapsed", !toggleCheckbox.checked);
        });
    }
});

