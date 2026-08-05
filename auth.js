const apiBase = '';

function request(url, options = {}) {
  return fetch(`${apiBase}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  }).then(async (response) => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  });
}

function setCurrentUser(user) {
  localStorage.setItem('smartEventUser', JSON.stringify(user));
}

function showMessage(message, kind = 'info') {
  const status = document.getElementById('authMessage');
  if (!status) {
    return;
  }
  status.textContent = message;
  status.dataset.kind = kind;
}

function bindLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
      const result = await request('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setCurrentUser(result.user);
      showMessage(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 900);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });
}

function bindRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    try {
      const result = await request('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      setCurrentUser(result.user);
      showMessage(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1100);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });
}

function bindDemoButtons() {
  const loginDemo = document.getElementById('fillLoginDemo');
  if (loginDemo) {
    loginDemo.addEventListener('click', () => {
      document.getElementById('loginEmail').value = 'member@smartevent.local';
      document.getElementById('loginPassword').value = 'Member@123';
      showMessage('Demo credentials loaded.', 'success');
    });
  }

  const registerDemo = document.getElementById('fillRegisterDemo');
  if (registerDemo) {
    registerDemo.addEventListener('click', () => {
      document.getElementById('registerName').value = 'Guest Member';
      document.getElementById('registerEmail').value = 'guest@example.com';
      document.getElementById('registerPassword').value = 'Guest@123';
      showMessage('Demo registration details loaded.', 'success');
    });
  }
}

bindLoginForm();
bindRegisterForm();
bindDemoButtons();