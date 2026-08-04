const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const registerForm = document.querySelector('#register-form');
const loginForm = document.querySelector('#login-form');
const authMessage = document.querySelector('#auth-message');

function activateTab(targetId) {
  tabs.forEach((tab) =>{
    const isActive = tab.dataset.target === targetId;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  panels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.id === targetId);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.target));
});

function setAuthMessage(message, isError = false) {
  if (!authMessage) {
    return;
  }

  authMessage.textContent = message;
  authMessage.classList.toggle('is-error', isError);
  authMessage.classList.toggle('is-success', !isError && Boolean(message));
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      password: String(formData.get('password') || '')
    };

    try {
      const result = await postJson('/api/auth/register', payload);
      setAuthMessage(result.message || 'Registration successful. Please login now.');
      registerForm.reset();

      const loginEmailInput = document.querySelector('#login-email');
      if (loginEmailInput) {
        loginEmailInput.value = payload.email;
      }
    } catch (error) {
      setAuthMessage(error.message, true);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const payload = {
      email: String(formData.get('email') || '').trim(),
      password: String(formData.get('password') || '')
    };

    try {
      const result = await postJson('/api/auth/login', payload);
      setAuthMessage(result.message || 'Login successful.');
      loginForm.reset();
    } catch (error) {
      setAuthMessage(error.message, true);
    }
  });
}