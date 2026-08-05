const apiBase = '';
let events = [];
let currentUser = JSON.parse(localStorage.getItem('smartEventUser') || 'null');

const elements = {
  eventsGrid: document.getElementById('eventsGrid'),
  eventSelect: document.getElementById('eventSelect'),
  bookingHistory: document.getElementById('bookingHistory'),
  toast: document.getElementById('toast'),
  authStatus: document.getElementById('authStatus'),
  seedDemoUser: document.getElementById('seedDemoUser'),
  clearDemoUser: document.getElementById('clearDemoUser'),
  jumpToEvents: document.getElementById('jumpToEvents'),
  openAdminHint: document.getElementById('openAdminHint'),
  bookingForm: document.getElementById('bookingForm'),
  eventForm: document.getElementById('eventForm'),
  resetEventForm: document.getElementById('resetEventForm')
};

function setCurrentUser(user) {
  currentUser = user;
  if (user) {
    localStorage.setItem('smartEventUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('smartEventUser');
  }
  syncAuthUi();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove('visible');
  }, 2600);
}

async function request(url, options = {}) {
  const response = await fetch(`${apiBase}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

function syncAuthUi() {
  if (currentUser) {
    elements.authStatus.textContent = `${currentUser.name} (${currentUser.role})`;
    if (elements.seedDemoUser) {
      elements.seedDemoUser.textContent = 'Demo Loaded';
    }
  } else {
    elements.authStatus.textContent = 'Guest';
    if (elements.seedDemoUser) {
      elements.seedDemoUser.textContent = 'Load Demo Member';
    }
  }
}

function renderEvents() {
  if (!events.length) {
    elements.eventsGrid.innerHTML = '<div class="event-card"><h3>No events available</h3><p>Add an event from the admin console to get started.</p></div>';
    elements.eventSelect.innerHTML = '<option value="">No events available</option>';
    return;
  }

  elements.eventsGrid.innerHTML = events.map((event) => {
    const remaining = event.seats - event.booked;
    return `
      <article class="event-card">
        <div class="event-card-top">
          <span class="meta-chip">${event.category}</span>
          <span class="status-tag">${remaining} seats left</span>
        </div>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <div class="event-card-meta">
          <span class="meta-chip">${formatDate(event.date)}</span>
          <span class="meta-chip">${event.time}</span>
          <span class="meta-chip">${event.venue}</span>
          <span class="meta-chip">${formatCurrency(event.price)}</span>
        </div>
        <div class="event-card-actions">
          <button class="ghost-btn small" data-edit-event="${event.id}">Edit</button>
          <button class="ghost-btn small" data-delete-event="${event.id}">Delete</button>
          <button class="primary-btn small" data-book-event="${event.id}">Book Now</button>
        </div>
      </article>
    `;
  }).join('');

  elements.eventSelect.innerHTML = events.map((event) => {
    const remaining = event.seats - event.booked;
    return `<option value="${event.id}">${event.title} - ${remaining} seats left</option>`;
  }).join('');
}

function renderHistory() {
  request('/api/bookings')
    .then(({ bookings }) => {
      if (!bookings.length) {
        elements.bookingHistory.innerHTML = '<div class="history-item"><strong>No bookings yet</strong><small>Complete a reservation to populate the history panel.</small></div>';
        return;
      }

      elements.bookingHistory.innerHTML = bookings.slice(0, 6).map((booking) => `
        <div class="history-item">
          <strong>${booking.eventTitle}</strong>
          <p>${booking.attendeeName} booked ${booking.tickets} ticket(s)</p>
          <small>${booking.attendeeEmail} · ${formatCurrency(booking.total)} · ${new Date(booking.bookedAt).toLocaleString('en-IN')}</small>
        </div>
      `).join('');
    })
    .catch(() => {
      elements.bookingHistory.innerHTML = '<div class="history-item"><strong>History unavailable</strong><small>Try refreshing the page.</small></div>';
    });
}

function fillEventForm(event) {
  document.getElementById('eventId').value = event.id || '';
  document.getElementById('eventTitle').value = event.title || '';
  document.getElementById('eventCategory').value = event.category || '';
  document.getElementById('eventDate').value = event.date || '';
  document.getElementById('eventTime').value = event.time || '';
  document.getElementById('eventVenue').value = event.venue || '';
  document.getElementById('eventPrice').value = event.price || '';
  document.getElementById('eventSeats').value = event.seats || '';
  document.getElementById('eventDescription').value = event.description || '';
}

function resetEventForm() {
  fillEventForm({});
}

async function loadEvents() {
  const data = await request('/api/events');
  events = data.events;
  renderEvents();
  renderHistory();
}

elements.seedDemoUser.addEventListener('click', () => {
  if (currentUser) {
    setCurrentUser(null);
    showToast('Logged out successfully.');
    return;
  }

  setCurrentUser({ name: 'Guest Member', email: 'member@smartevent.local', role: 'user' });
  showToast('Demo member loaded.');
});

if (elements.clearDemoUser) {
  elements.clearDemoUser.addEventListener('click', () => {
    setCurrentUser(null);
    showToast('Logged out successfully.');
  });
}

elements.bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const eventId = Number(elements.eventSelect.value);
  const eventDetails = events.find((entry) => entry.id === eventId);
  const attendeeName = document.getElementById('bookingName').value.trim();
  const attendeeEmail = document.getElementById('bookingEmail').value.trim();
  const tickets = Number(document.getElementById('ticketCount').value);

  if (!eventDetails) {
    showToast('Please select a valid event.');
    return;
  }

  try {
    const result = await request('/api/book', {
      method: 'POST',
      body: JSON.stringify({ eventId, attendeeName, attendeeEmail, tickets })
    });
    showToast(result.message);
    elements.bookingForm.reset();
    document.getElementById('ticketCount').value = 1;
    await loadEvents();
  } catch (error) {
    showToast(error.message);
  }
});

elements.eventForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    id: Number(document.getElementById('eventId').value) || undefined,
    title: document.getElementById('eventTitle').value.trim(),
    category: document.getElementById('eventCategory').value.trim(),
    date: document.getElementById('eventDate').value,
    time: document.getElementById('eventTime').value.trim(),
    venue: document.getElementById('eventVenue').value.trim(),
    price: Number(document.getElementById('eventPrice').value),
    seats: Number(document.getElementById('eventSeats').value),
    description: document.getElementById('eventDescription').value.trim()
  };

  try {
    const isEditing = Boolean(payload.id);
    const result = await request('/api/admin/events', {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });
    showToast(result.message);
    resetEventForm();
    await loadEvents();
  } catch (error) {
    showToast(error.message);
  }
});

elements.resetEventForm.addEventListener('click', () => {
  resetEventForm();
});

elements.eventsGrid.addEventListener('click', async (event) => {
  const editId = event.target.getAttribute('data-edit-event');
  const deleteId = event.target.getAttribute('data-delete-event');
  const bookId = event.target.getAttribute('data-book-event');

  if (editId) {
    const eventDetails = events.find((item) => item.id === Number(editId));
    if (eventDetails) {
      fillEventForm(eventDetails);
      showToast('Event loaded into the admin form.');
    }
    return;
  }

  if (deleteId) {
    try {
      const result = await request('/api/admin/events', {
        method: 'DELETE',
        body: JSON.stringify({ id: Number(deleteId) })
      });
      showToast(result.message);
      await loadEvents();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (bookId) {
    const selected = events.find((item) => item.id === Number(bookId));
    if (!selected) {
      showToast('Event unavailable.');
      return;
    }
    elements.eventSelect.value = String(selected.id);
    document.getElementById('bookingName').focus();
    showToast(`Selected ${selected.title} for booking.`);
  }
});

elements.jumpToEvents.addEventListener('click', () => {
  document.getElementById('eventsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

elements.openAdminHint.addEventListener('click', () => {
  document.getElementById('adminPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('Use the admin demo login to manage events.');
});

(async function init() {
  syncAuthUi();
  fillEventForm({});
  await loadEvents();
})();
