# 🤖 Borin AI - Dein smarter Lernhelfer

Eine moderne Web-Anwendung mit KI-gesteuertem Chat für intelligentes Lernen.

## ✨ Features

- 💬 **KI Chat Agent** - Echte KI-Antworten mit Hugging Face Mistral
- 🎨 **Modernes Design** - Glasmorphism mit animierten Übergängen
- 📱 **Responsive** - Funktioniert auf allen Geräten
- ⚡ **Schnell** - Optimiert für beste Performance
- 🔐 **Datenschutz** - Keine Tracking, nur lokale Daten

## 🚀 Schnellstart

### 1. **Node.js installieren**
Falls noch nicht geschehen: [Node.js herunterladen](https://nodejs.org)

### 2. **Dependencies installieren**
```bash
npm install
```

### 3. **Backend starten**
```bash
npm start
# oder
node server.js
```

Server läuft dann unter: `http://localhost:3000`

### 4. **Website öffnen**
- Öffne `index.html` im Browser
- Oder nutze einen lokalen Server:
```bash
# Mit Python 3
python3 -m http.server 8000

# Mit Live Server in VS Code
```

## 📋 Seiten

- **`index.html`** - Startseite mit Hero-Section
- **`start.html`** - Onboarding mit 6-Schritt Formular
- **`chat.html`** - KI Chat Interface
- **`login.html`** - Login (Template)
- **`register.html`** - Registrierung (Template)

## 🔧 Technologie Stack

**Frontend:**
- HTML5
- CSS3 (Glasmorphism, Animationen)
- Vanilla JavaScript

**Backend:**
- Node.js
- Express.js
- Hugging Face Inference API (Mistral-7B)

## 🎯 Wie der Chat funktioniert

1. **User Messages** werden eingegeben
2. **Frontend sendet** die Nachricht zum Backend
3. **Backend ruft** die Hugging Face API auf
4. **KI generiert** eine Antwort
5. **Response wird** im Chat angezeigt
6. **Konversation** wird gespeichert für Kontext

## ⚙️ Konfiguration

### Chat für Live-Server konfigurieren

Falls du den Code auf einen echten Server deployest, ändere in `js/chat.js`:

```javascript
// Von:
const response = await fetch('http://localhost:3000/api/chat', {

// Zu:
const response = await fetch('https://deine-domain.com/api/chat', {
```

### API Token austauschen

In `server.js` findest du:
```javascript
Authorization: `Bearer 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`
```

Du kannst hier deinen eigenen Hugging Face Token einfügen für mehr Rate Limit.

## 🐛 Häufige Probleme

### ❌ "Backend läuft nicht!"
Stelle sicher, dass `server.js` läuft:
```bash
node server.js
```

### ❌ Port 3000 bereits in Verwendung
Ändere den Port in `server.js`:
```javascript
const PORT = 3001; // Statt 3000
```
Und auch in `js/chat.js`:
```javascript
const response = await fetch('http://localhost:3001/api/chat', {
```

### ❌ KI antwortet nicht
Hugging Face Modell lädt manchmal... Versuche es in 30 Sekunden erneut.

## 📦 Deployment

### Auf Vercel / Netlify (nur Frontend)
```bash
npm run build
# Exportiere nur HTML/CSS/JS Dateien
```

### Auf Heroku (mit Backend)
1. `Procfile` erstellen:
```
web: node server.js
```

2. Deployen:
```bash
git push heroku main
```

## 📄 Lizenz

MIT - Frei verwendbar

## 👨‍💻 Author

Borin AI Team 2026

---

**Viel Erfolg beim Lernen! 🎓**
