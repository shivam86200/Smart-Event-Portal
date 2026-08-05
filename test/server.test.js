const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createServer } = require('../server');

let server;
let baseUrl;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  return { response, data };
}

test.before(async () => {
  server = createServer();
  server.listen(0);
  await once(server, 'listening');
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('health endpoint responds with ok', async () => {
  const { response, data } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(data.status, 'ok');
});

test('user registration and booking flow works', async () => {
  const register = await request('/api/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'Secret123' })
  });

  assert.equal(register.response.status, 201);
  assert.equal(register.data.user.email, 'test@example.com');

  const booking = await request('/api/book', {
    method: 'POST',
    body: JSON.stringify({
      eventId: 1,
      attendeeName: 'Test User',
      attendeeEmail: 'test@example.com',
      tickets: 2
    })
  });

  assert.equal(booking.response.status, 201);
  assert.equal(booking.data.booking.eventId, 1);
});
