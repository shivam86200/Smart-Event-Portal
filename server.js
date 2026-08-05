const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const state = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@smartevent.local', password: 'Admin@123', role: 'admin' },
    { id: 2, name: 'Guest Member', email: 'member@smartevent.local', password: 'Member@123', role: 'user' }
  ],
  events: [
    {
      id: 1,
      title: 'Tech Innovators Summit',
      date: '2026-09-14',
      time: '10:00 AM',
      venue: 'Grand Convention Hall',
      category: 'Conference',
      price: 2499,
      seats: 120,
      booked: 38,
      description: 'A high-energy summit for builders, founders, and technology leaders.'
    },
    {
      id: 2,
      title: 'Music Under the Stars',
      date: '2026-09-22',
      time: '07:30 PM',
      venue: 'Riverside Arena',
      category: 'Concert',
      price: 1599,
      seats: 300,
      booked: 142,
      description: 'A curated evening of live performances, lights, and outdoor celebration.'
    },
    {
      id: 3,
      title: 'Startup Networking Mixer',
      date: '2026-10-03',
      time: '06:00 PM',
      venue: 'Innovation Hub',
      category: 'Networking',
      price: 999,
      seats: 80,
      booked: 26,
      description: 'Meet investors, founders, and product teams in an informal business setting.'
    }
  ],
  bookings: []
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(text);
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  }[ext] || 'application/octet-stream';
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function nextId(collection) {
  return collection.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function sanitizeEvent(payload) {
  return {
    title: String(payload.title || '').trim(),
    date: String(payload.date || '').trim(),
    time: String(payload.time || '').trim(),
    venue: String(payload.venue || '').trim(),
    category: String(payload.category || 'Event').trim(),
    price: Number(payload.price || 0),
    seats: Number(payload.seats || 0),
    description: String(payload.description || '').trim()
  };
}

function isValidEvent(event) {
  return Boolean(event.title && event.date && event.time && event.venue && event.description && event.price >= 0 && event.seats > 0);
}

function sendStaticFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendText(res, 404, 'File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(content);
  });
}

async function handleApi(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/health') {
    sendJson(res, 200, { status: 'ok', service: 'Smart Event Management Portal API' });
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/events') {
    sendJson(res, 200, { events: state.events });
    return true;
  }

  if (req.method === 'GET' && pathname === '/api/bookings') {
    sendJson(res, 200, { bookings: state.bookings });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/register') {
    const body = await readBody(req);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();

    if (!name || !email || !password) {
      sendJson(res, 400, { message: 'Name, email, and password are required.' });
      return true;
    }

    if (state.users.some((user) => user.email === email)) {
      sendJson(res, 409, { message: 'Account already exists for this email.' });
      return true;
    }

    const user = { id: nextId(state.users), name, email, password, role: 'user' };
    state.users.push(user);
    sendJson(res, 201, {
      message: 'Registration successful.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/login') {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();

    const user = state.users.find((entry) => entry.email === email && entry.password === password);
    if (!user) {
      sendJson(res, 401, { message: 'Invalid email or password.' });
      return true;
    }

    sendJson(res, 200, {
      message: 'Login successful.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
    return true;
  }

  if (req.method === 'POST' && pathname === '/api/book') {
    const body = await readBody(req);
    const eventId = Number(body.eventId);
    const attendeeName = String(body.attendeeName || '').trim();
    const attendeeEmail = String(body.attendeeEmail || '').trim().toLowerCase();
    const tickets = Number(body.tickets || 1);

    const event = state.events.find((item) => item.id === eventId);
    if (!event) {
      sendJson(res, 404, { message: 'Event not found.' });
      return true;
    }

    const remainingSeats = event.seats - event.booked;
    if (!attendeeName || !attendeeEmail || tickets < 1 || tickets > remainingSeats) {
      sendJson(res, 400, { message: 'Please provide valid booking details and available ticket count.' });
      return true;
    }

    const booking = {
      id: nextId(state.bookings),
      eventId: event.id,
      eventTitle: event.title,
      attendeeName,
      attendeeEmail,
      tickets,
      total: tickets * event.price,
      bookedAt: new Date().toISOString()
    };

    state.bookings.unshift(booking);
    event.booked += tickets;

    sendJson(res, 201, { message: 'Booking confirmed.', booking });
    return true;
  }

  if (pathname === '/api/admin/events') {
    if (req.method === 'POST') {
      const body = await readBody(req);
      const event = sanitizeEvent(body);

      if (!isValidEvent(event)) {
        sendJson(res, 400, { message: 'Please complete all event fields.' });
        return true;
      }

      const newEvent = { id: nextId(state.events), booked: 0, ...event };
      state.events.unshift(newEvent);
      sendJson(res, 201, { message: 'Event created.', event: newEvent });
      return true;
    }

    if (req.method === 'PUT') {
      const body = await readBody(req);
      const eventId = Number(body.id);
      const index = state.events.findIndex((item) => item.id === eventId);
      if (index === -1) {
        sendJson(res, 404, { message: 'Event not found.' });
        return true;
      }

      const updatedEvent = {
        ...state.events[index],
        ...sanitizeEvent(body),
        id: eventId,
        booked: state.events[index].booked
      };

      if (!isValidEvent(updatedEvent)) {
        sendJson(res, 400, { message: 'Please complete all event fields.' });
        return true;
      }

      state.events[index] = updatedEvent;
      sendJson(res, 200, { message: 'Event updated.', event: updatedEvent });
      return true;
    }

    if (req.method === 'DELETE') {
      const body = await readBody(req);
      const eventId = Number(body.id);
      const index = state.events.findIndex((item) => item.id === eventId);
      if (index === -1) {
        sendJson(res, 404, { message: 'Event not found.' });
        return true;
      }

      state.events.splice(index, 1);
      state.bookings = state.bookings.filter((booking) => booking.eventId !== eventId);
      sendJson(res, 200, { message: 'Event deleted.' });
      return true;
    }
  }

  return false;
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url, `http://${req.headers.host}`);
      const { pathname } = requestUrl;

      if (pathname.startsWith('/api/')) {
        const handled = await handleApi(req, res, pathname);
        if (!handled) {
          sendJson(res, 404, { message: 'API route not found.' });
        }
        return;
      }

      if (pathname === '/' || pathname === '/index.html') {
        sendStaticFile(res, path.join(ROOT, 'index.html'));
        return;
      }

      const candidatePath = path.join(ROOT, pathname.replace(/^\//, ''));
      if (candidatePath.startsWith(ROOT) && fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
        sendStaticFile(res, candidatePath);
        return;
      }

      sendText(res, 404, 'Page not found');
    } catch (error) {
      sendJson(res, 500, { message: 'Internal server error.', error: error.message });
    }
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`Smart Event Management Portal running on http://localhost:${PORT}`);
  });
}

module.exports = { createServer, state };
