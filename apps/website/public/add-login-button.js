// Inject admin login button into page
(function() {
  // Create button styles
  const style = document.createElement('style');
  style.textContent = `
    .blakkhail-admin-login-btn {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 9999;
      padding: 0.75rem 1.5rem;
      background: #e8c56b;
      color: #000;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      font-family: Arial, sans-serif;
    }
    .blakkhail-admin-login-btn:hover {
      background: #f5d98d;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(232, 197, 107, 0.3);
    }
    .blakkhail-admin-logout {
      background: #22c55e;
      color: #fff;
    }
    .blakkhail-admin-logout:hover {
      background: #16a34a;
    }
    @media (max-width: 600px) {
      .blakkhail-admin-login-btn {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
        top: 1rem;
        right: 1rem;
      }
    }
  `;
  document.head.appendChild(style);

  // Function to update button state
  function updateLoginButton() {
    let btn = document.getElementById('blakkhail-admin-btn');
    const token = localStorage.getItem('blakkhail-admin-token');
    const user = localStorage.getItem('blakkhail-admin-user');

    if (!btn) {
      btn = document.createElement('a');
      btn.id = 'blakkhail-admin-btn';
      btn.className = 'blakkhail-admin-login-btn';
      document.body.appendChild(btn);
    }

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        btn.textContent = '✓ ' + userData.email;
        btn.href = '#';
        btn.className = 'blakkhail-admin-login-btn blakkhail-admin-logout';
        btn.onclick = function(e) {
          e.preventDefault();
          fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token })
          }).then(() => {
            localStorage.removeItem('blakkhail-admin-token');
            localStorage.removeItem('blakkhail-admin-user');
            window.location.reload();
          });
        };
      } catch (e) {
        console.error('Error parsing user data');
      }
    } else {
      btn.textContent = '🔐 Admin Login';
      btn.href = '/blakkhail-admin-tv-login.html';
      btn.className = 'blakkhail-admin-login-btn';
      btn.onclick = null;
    }
  }

  // Update on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLoginButton);
  } else {
    updateLoginButton();
  }

  // Listen for storage changes (logout from another tab)
  window.addEventListener('storage', updateLoginButton);
})();
