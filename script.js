const API = '';  // Empty = same origin (Azure App Service serves both)

let currentUser = null;

// --- TAB SWITCHING ---
function showTab(tabId, btn) {
  document.getElementById('registerTab').style.display = 'none';
  document.getElementById('loginTab').style.display = 'none';
  document.getElementById(tabId).style.display = 'block';
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

// --- MESSAGE HELPER ---
function setMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg ' + type;
}

// --- REGISTER ---
async function register() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (!name || !email || !password) {
    return setMsg('regMsg', 'Please fill in all fields.', 'error');
  }

  try {
    const res  = await fetch(API + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (res.ok) {
      setMsg('regMsg', '✅ ' + data.message + ' — Please login.', 'success');
    } else {
      setMsg('regMsg', '❌ ' + data.message, 'error');
    }
  } catch {
    setMsg('regMsg', '❌ Could not reach server.', 'error');
  }
}

// --- LOGIN ---
async function login() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    return setMsg('loginMsg', 'Please fill in all fields.', 'error');
  }

  try {
    const res  = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
      currentUser = { id: data.userId, name: data.name };
      document.getElementById('authSection').style.display  = 'none';
      document.getElementById('dashSection').style.display  = 'block';
      document.getElementById('userInfo').style.display     = 'flex';
      document.getElementById('welcomeMsg').textContent     = 'Hello, ' + data.name;
      viewPass();
    } else {
      setMsg('loginMsg', '❌ ' + data.message, 'error');
    }
  } catch {
    setMsg('loginMsg', '❌ Could not reach server.', 'error');
  }
}

// --- LOGOUT ---
function logout() {
  currentUser = null;
  document.getElementById('authSection').style.display = 'block';
  document.getElementById('dashSection').style.display = 'none';
  document.getElementById('userInfo').style.display    = 'none';
  document.getElementById('passContainer').innerHTML   = '';
  setMsg('applyMsg', '', '');
}

// --- APPLY PASS ---
async function applyPass() {
  const route       = document.getElementById('route').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const passType    = document.getElementById('passType').value;

  if (!route || !destination || !passType) {
    return setMsg('applyMsg', 'Please fill in all fields.', 'error');
  }

  try {
    const res  = await fetch(API + '/apply-pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, route, destination, passType })
    });
    const data = await res.json();

    if (res.ok) {
      setMsg('applyMsg', '✅ Pass applied! Number: ' + data.passNumber + ' | Price: ₹' + data.price, 'success');
      document.getElementById('route').value       = '';
      document.getElementById('destination').value = '';
      document.getElementById('passType').value    = '';
      viewPass();
    } else {
      setMsg('applyMsg', '❌ ' + data.message, 'error');
    }
  } catch {
    setMsg('applyMsg', '❌ Could not reach server.', 'error');
  }
}

// --- VIEW PASS ---
async function viewPass() {
  const container = document.getElementById('passContainer');
  container.innerHTML = '<p style="color:#666;font-size:0.9rem">Loading passes...</p>';

  try {
    const res  = await fetch(API + '/pass/' + currentUser.id);
    const data = await res.json();

    if (!res.ok) {
      container.innerHTML = '<p style="color:#999;font-size:0.9rem">No passes found yet.</p>';
      return;
    }

    container.innerHTML = data.map(pass => `
      <div class="pass-card">
        <h3>Bus Pass</h3>
        <div class="pass-number">${pass.pass_number}</div>
        <div class="pass-grid">
          <div><span>Route</span><strong>${pass.route}</strong></div>
          <div><span>Destination</span><strong>${pass.destination}</strong></div>
          <div><span>Pass Type</span><strong>${capitalize(pass.pass_type)}</strong></div>
          <div><span>Price</span><strong>₹${pass.price}</strong></div>
          <div><span>Issued On</span><strong>${new Date(pass.created_at).toLocaleDateString()}</strong></div>
        </div>
        <div class="pass-status">${pass.status}</div>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<p style="color:#c62828;font-size:0.9rem">Failed to load passes.</p>';
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
