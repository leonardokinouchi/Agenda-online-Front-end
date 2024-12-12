document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var upcomingEventsList = document.getElementById('upcomingEventsList');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 'auto',
        locale: 'pt',
        editable: true,
        droppable: true,
        eventDrop: function (info) {
            saveEvents();
            updateUpcomingEvents();
            updateMiniCalendar();  // Atualizar o mini calendário
        },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
        },
        events: [],
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
            separator: 'h'
        },
        eventClick: function (info) {
            const modal = document.getElementById('eventDetailsModal');
            modal.classList.remove('hidden');

            document.getElementById('detailsTitle').textContent = info.event.title;
            document.getElementById('detailsDate').textContent = `Data: ${info.event.start.toLocaleDateString()}`;
            document.getElementById('detailsTime').textContent = `Hora: ${info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            document.getElementById('detailsCategory').textContent = `Categoria: ${info.event.extendedProps.category || 'Não especificada'}`;
            document.getElementById('detailsDescription').textContent = `Descrição: ${info.event.extendedProps.description || 'Sem descrição'}`;

             // Função de salvar evento editado
             document.getElementById('saveEditBtn').onclick = function () {
                info.event.setProp('title', document.getElementById('editEventTitle').value);
                info.event.setExtendedProp('category', document.getElementById('editEventCategory').value);
                info.event.setStart(document.getElementById('editEventDate').value + 'T' + document.getElementById('editEventTime').value);
                info.event.setExtendedProp('description', document.getElementById('editEventDescription').value);

                saveEvents();
                updateUpcomingEvents();
                updateMiniCalendar();

                modal.classList.add('hidden');
            };

            document.getElementById('deleteEventBtn').onclick = function () {
                info.event.remove();
                saveEvents();
                updateUpcomingEvents();
                updateMiniCalendar();  // Atualizar o mini calendário
                modal.classList.add('hidden');
            };

            document.getElementById('cancelEventBtn').onclick = function () {
                modal.classList.add('hidden');
            };
        },
        eventDidMount: function (info) {
            const randomColor = getRandomColor();
            info.el.style.backgroundColor = randomColor;
            info.el.style.color = 'white';
        }
    });

    calendar.render();

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const loadEvents = () => {
        const savedEvents = JSON.parse(localStorage.getItem('events')) || [];
        savedEvents.forEach(event => calendar.addEvent(event));
        updateUpcomingEvents();
    };

    // Função de filtragem dos eventos
    const filterEvents = () => {
        const isPessoalChecked = document.getElementById('filterPessoal').checked;
        const isTrabalhoChecked = document.getElementById('filterTrabalho').checked;
        const isLembreteChecked = document.getElementById('filterLembrete').checked;

        return calendar.getEvents().filter(event => {
            const category = event.extendedProps.category;
            return (category === 'Pessoal' && isPessoalChecked) ||
                   (category === 'Trabalho' && isTrabalhoChecked) ||
                   (category === 'Lembrete' && isLembreteChecked);
        });
    };

    // Atualiza a lista de eventos futuros na tela
    const updateUpcomingEvents = () => {
        upcomingEventsList.innerHTML = '';
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const events = filterEvents()
            .filter(event => event.start >= now)
            .sort((a, b) => a.start - b.start);

        const eventsByMonth = {};
        events.forEach(event => {
            const monthYear = event.start.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            if (!eventsByMonth[monthYear]) {
                eventsByMonth[monthYear] = [];
            }
            eventsByMonth[monthYear].push(event);
        });

        for (const [monthYear, monthEvents] of Object.entries(eventsByMonth)) {
            const monthBox = document.createElement('div');
            monthBox.classList.add('month-box');

            const monthTitle = document.createElement('h3');
            monthTitle.textContent = monthYear;
            monthBox.appendChild(monthTitle);

            const eventList = document.createElement('ul');
            monthEvents.forEach(event => {
                const listItem = document.createElement('li');
                listItem.textContent = `${event.start.toLocaleDateString()} - ${event.title}`;
                eventList.appendChild(listItem);
            });

            monthBox.appendChild(eventList);
            upcomingEventsList.appendChild(monthBox);
        }
    };

    const saveEvents = () => {
        const events = calendar.getEvents().map(event => ({
            title: event.title,
            start: event.start.toISOString(),
            allDay: event.allDay,
            category: event.extendedProps.category,
            description: event.extendedProps.description
        }));
        localStorage.setItem('events', JSON.stringify(events));
    };

    loadEvents();

    // Função para abrir o modal de criação de evento
    document.getElementById('openModalBtn').addEventListener('click', function() {
        document.getElementById('eventModal').classList.remove('hidden');
    });

    // Função para cancelar o modal de criação de evento
    document.getElementById('cancelBtn').addEventListener('click', function() {
        document.getElementById('eventModal').classList.add('hidden');
    });

    // Função para adicionar evento ao calendário
    document.getElementById('eventForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('eventTitle').value;
        const category = document.getElementById('eventCategory').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDescription').value;

        const eventDate = new Date(`${date}T${time}`);
        
        calendar.addEvent({
            title: title,
            start: eventDate,
            extendedProps: {
                category: category,
                description: description
            }
        });

        saveEvents();
        updateUpcomingEvents();
        updateMiniCalendar();
        
        // Fechar o modal
        document.getElementById('eventModal').classList.add('hidden');
    });

    // Mini Calendário
    const miniCalendarEl = document.querySelector('#miniCalendar tbody');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const today = currentDate.getDate();

    const events = calendar.getEvents().reduce((acc, event) => {
        const eventStartDate = event.start;
        if (eventStartDate.getMonth() === currentMonth && eventStartDate.getFullYear() === currentYear) {
            const eventDay = eventStartDate.getDate();
            acc[eventDay] = acc[eventDay] || [];
            acc[eventDay].push(event.extendedProps.category || 'Sem categoria');
        }
        return acc;
    }, {});

    const eventColors = {
        'Pessoal': '#ff5722',
        'Trabalho': '#007bff',
        'Lembrete': '#4caf50',
        'Sem categoria': '#888'
    };

    const miniCalendarHeader = document.querySelector('#miniCalendarHeader');
    miniCalendarHeader.textContent = `${currentDate.toLocaleString('pt-BR', { month: 'long' })} ${currentYear}`;

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let day = 1;
    for (let row = 0; row < 6; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < 7; col++) {
            const td = document.createElement('td');
            if (row === 0 && col < firstDayOfMonth) {
                td.textContent = '';
            } else if (day > daysInMonth) {
                td.textContent = '';
            } else {
                td.textContent = day;

                if (day === today) {
                    td.classList.add('today');
                }

                const dayEvents = events[day];
                if (dayEvents) {
                    const indicatorCount = Math.min(2, dayEvents.length);
                    const indicatorContainer = document.createElement('div');
                    indicatorContainer.style.position = 'relative';
                    indicatorContainer.style.display = 'flex';
                    indicatorContainer.style.justifyContent = 'center';
                    indicatorContainer.style.gap = '3px';

                    for (let i = 0; i < indicatorCount; i++) {
                        const indicator = document.createElement('span');
                        indicator.classList.add('event-indicator');
                        indicator.style.backgroundColor = eventColors[dayEvents[i]] || eventColors['Sem categoria'];
                        indicator.style.width = '6px';
                        indicator.style.height = '6px';
                        indicator.style.borderRadius = '50%';
                        indicatorContainer.appendChild(indicator);
                    }

                    td.appendChild(indicatorContainer);
                }

                day++;
            }
            tr.appendChild(td);
        }
        miniCalendarEl.appendChild(tr);
        if (day > daysInMonth) break;
    }

    const updateMiniCalendar = () => {
        miniCalendarEl.innerHTML = '';

        const events = calendar.getEvents().reduce((acc, event) => {
            const eventStartDate = event.start;
            if (eventStartDate.getMonth() === currentMonth && eventStartDate.getFullYear() === currentYear) {
                const eventDay = eventStartDate.getDate();
                acc[eventDay] = acc[eventDay] || [];
                acc[eventDay].push(event.extendedProps.category || 'Sem categoria');
            }
            return acc;
        }, {});

        let day = 1;
        for (let row = 0; row < 6; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < 7; col++) {
                const td = document.createElement('td');
                if (row === 0 && col < firstDayOfMonth) {
                    td.textContent = '';
                } else if (day > daysInMonth) {
                    td.textContent = '';
                } else {
                    td.textContent = day;

                    if (day === today) {
                        td.classList.add('today');
                    }

                    const dayEvents = events[day];
                    if (dayEvents) {
                        const indicatorCount = Math.min(2, dayEvents.length);
                        const indicatorContainer = document.createElement('div');
                        indicatorContainer.style.position = 'relative';
                        indicatorContainer.style.display = 'flex';
                        indicatorContainer.style.justifyContent = 'center';
                        indicatorContainer.style.gap = '3px';

                        for (let i = 0; i < indicatorCount; i++) {
                            const indicator = document.createElement('span');
                            indicator.classList.add('event-indicator');
                            indicator.style.backgroundColor = eventColors[dayEvents[i]] || eventColors['Sem categoria'];
                            indicator.style.width = '6px';
                            indicator.style.height = '6px';
                            indicator.style.borderRadius = '50%';
                            indicatorContainer.appendChild(indicator);
                        }

                        td.appendChild(indicatorContainer);
                    }

                    day++;
                }
                tr.appendChild(td);
            }
            miniCalendarEl.appendChild(tr);
            if (day > daysInMonth) break;
        }
    };

    // Adicionando ou atualizando os filtros
    document.getElementById('filterPessoal').addEventListener('change', updateUpcomingEvents);
    document.getElementById('filterTrabalho').addEventListener('change', updateUpcomingEvents);
    document.getElementById('filterLembrete').addEventListener('change', updateUpcomingEvents);
});
