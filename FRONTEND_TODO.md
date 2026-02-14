# 🎨 Frontend Developer Checklist - Borin AI

Hey! Hier ist eine Übersicht über den aktuellen Frontend-Status und was noch zu tun ist.

---

## ✅ Aktuell Fertiggestellt

### Seiten
- ✅ **index.html** - Landing Page mit Hero, Features, CTA Buttons
- ✅ **start.html** - 6-Schritt Onboarding Wizard (Profiling)
- ✅ **chat.html** - Chat Interface (UI fertig, aber braucht Backend)
- ⚠️ **login.html** - Template vorhanden, aber nicht funktional
- ⚠️ **register.html** - Template vorhanden, aber nicht funktional

### Design & Styling
- ✅ **style.css** - Global Styles (839 Zeilen)
  - Glasmorphism Design
  - Animationen (fadeIn, slideUp, scaleIn, float, etc.)
  - Responsive Layout
  - Dark Mode Theme (Indigo → Purple Gradient)

- ✅ **start.css** - Onboarding spezifisch
  - Step Animations
  - Checkbox Grid
  - Progress Bar

### JavaScript
- ✅ **start.js** - Komplette Onboarding Logic
  - 6-Step Navigation
  - Form Validation
  - localStorage Persistence
  - Error Toasts

- ⚠️ **chat.js** - Chat Logic vorhanden, aber:
  - ✅ Message Sending (Frontend Part)
  - ✅ Backend Integration (localhost:3000)
  - ❌ Braucht Auth Token Handling
  - ❌ Braucht Message History Display Fix

---

## ⚠️ Noch zu Implementieren

### 1. **Login Page - PRIORITÄT: HOCH**

**Was nötig ist:**
- HTML Form mit Email + Password
- JavaScript für Login Request
- Token in localStorage speichern
- Navigation zu Dashboard/Chat nach Login
- "Passwort vergessen?" Link (optional)

**Workflow:**
```javascript
// Beispiel:
document.querySelector('.login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'chat.html'; // Zur Chat Seite
  } else {
    showError(data.error); // "Credentials ungültig"
  }
});
```

**Styling:** Sollte wie start.html aussehen (Glasmorphism, Animationen)

---

### 2. **Register Page - PRIORITÄT: HOCH**

**Aktueller Workflow:**
```
index.html → "Starte jetzt" Button → start.html (6 Steps) → localStorage
                                                              ↓
                                                        register.html???
```

**Problem:** Nach start.html gibt es keinen Button zur Registrierung!

**Lösung:**

**A) start.html - Step 7 hinzufügen**
Am Ende von Step 6 (Summary) einen Button:
```html
<button id="registerBtn" class="btn-primary">Jetzt registrieren</button>
```

Dann in start.js:
```javascript
document.querySelector('#registerBtn').addEventListener('click', () => {
  // Daten aus localStorage sind bereits gespeichert
  window.location.href = 'register.html';
});
```

**B) register.html - Erweitern**

Aktuell: Wahrscheinlich nur Email/Password

Neu brauchst:
```html
<!-- Pre-filled aus localStorage -->
<form id="registerForm">
  <!-- Bereits von start.html -->
  <input type="text" id="name" placeholder="Name" value="..." readonly>
  <input type="text" id="age" value="..." readonly>
  <input type="text" id="class" value="..." readonly>
  <input type="text" id="state" value="..." readonly>
  <div id="subjects">Fächer: Mathe, Physik, Deutsch</div>
  
  <!-- Neu für Register -->
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password (min. 8 Zeichen)" required>
  <input type="password" id="passwordConfirm" placeholder="Password wiederholen" required>
  
  <button type="submit" class="btn-primary">Profil erstellen</button>
</form>
```

JavaScript:
```javascript
document.querySelector('#registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Daten aus localStorage
  const userData = JSON.parse(localStorage.getItem('userData'));
  
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.querySelector('#email').value,
      password: document.querySelector('#password').value,
      name: userData.name,
      age: userData.age,
      class: userData.class,
      state: userData.state,
      subjects: userData.subjects
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.removeItem('userData'); // Cleanup
    window.location.href = 'chat.html';
  } else {
    showError(data.error); // z.B. "Email existiert bereits"
  }
});
```

---

### 3. **Chat.js - Auth Integration - PRIORITÄT: HOCH**

**Aktuell:**
```javascript
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage })
});
```

**Problem:** Kein Token mitgesendet → Backend kann User nicht zuordnen

**Neu (mit Auth):**
```javascript
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token) {
  showError('Du musst angemeldet sein');
  window.location.href = 'login.html';
  return;
}

const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // NEU
  },
  body: JSON.stringify({
    message: userMessage,
    userId: user.userId  // NEU
  })
});
```

---

### 4. **Navigation / Auth Guard - PRIORITÄT: MITTEL**

**Alle Seiten brauchen Checks:**

```javascript
// auth-helper.js (Neue Datei)
function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user')) || null;
}

function isLoggedIn() {
  return !!getToken();
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userData');
  window.location.href = 'index.html';
}
```

**In chat.html Head hinzufügen:**
```html
<script src="js/auth-helper.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    requireAuth(); // Chat nur für eingeloggte Users
  });
</script>
```

**Logout Button (überall wo sinnvoll):**
```html
<button onclick="logout()" class="btn-secondary">Abmelden</button>
```

---

### 5. **Chat History Anzeigen - PRIORITÄT: MITTEL**

**Neu zu implementieren:**

```javascript
// Beim Page Load
async function loadChatHistory() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/chat/history?limit=20', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (data.success) {
    data.messages.forEach(msg => {
      if (msg.role === 'user') {
        addUserMessage(msg.content);
      } else {
        addBotMessage(msg.content);
      }
    });
  }
}

// Im chat.js:
document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  loadChatHistory(); // History laden
});
```

---

### 6. **User Profile Display - PRIORITÄT: NIEDRIG**

**Navigation mit User Info:**

```html
<!-- In Navigation/Header -->
<div class="user-menu">
  <img src="avatar.png" alt="Avatar">
  <span id="userName">Max</span>
  <div class="dropdown">
    <button onclick="goToProfile()">Profil</button>
    <button onclick="logout()">Abmelden</button>
  </div>
</div>
```

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const user = getUser();
  if (user) {
    document.querySelector('#userName').textContent = user.name;
  }
});
```

---

## 📋 Implementierungs-Reihenfolge

### Woche 1:
1. [ ] login.html + login.js erstellen
2. [ ] register.html erweitern + register.js
3. [ ] auth-helper.js erstellen
4. [ ] chat.js Auth Integration

### Woche 2:
1. [ ] requireAuth() Guards auf chat.html
2. [ ] Chat History Loading
3. [ ] Logout Button überall
4. [ ] User Profile Display

### Optional:
- [ ] Password Recovery Flow
- [ ] User Settings Page
- [ ] Email Verification
- [ ] Theme Toggle

---

## 🎨 Styling Guidelines

**Alle neuen Components sollten folgen:**
- ✅ Glasmorphism (backdrop-filter: blur(20px))
- ✅ Indigo → Purple Gradients (#6366f1 → #c084fc)
- ✅ Smooth Animations (alle Transitions 0.3s)
- ✅ Dark Background (#0f0a1e, #1a1428)
- ✅ Responsive (Mobile-First)

**Copy from style.css:**
```css
.card {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #c084fc);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-primary:hover {
  transform: translateY(-2px);
}
```

---

## 🔗 File Links für Backend Dev

**Dein Backend Dev braucht:**
- [BACKEND_BRIEFING.md](BACKEND_BRIEFING.md) ← Gib ihm das!

**Das solltest du schon haben:**
- [README_SETUP.md](README_SETUP.md) ← Für Setup

---

## 🚀 Ready to Deploy?

**Vor Production:**
- [ ] Alle Auth Flows getestet
- [ ] HTTPS URLs statt localhost
- [ ] Error Handling überall
- [ ] Console Logs entfernt
- [ ] Password Fields mit autocomplete="off"
- [ ] Sensitive Data nicht in localStorage speichern

---

**Fragen?** Ich helfe gerne! 💬
