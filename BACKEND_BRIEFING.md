# 📋 Backend Developer Briefing - Borin AI

## Überblick

Borin AI ist eine KI-gestützte Lern-Plattform mit:
- 🎓 6-Schritt Onboarding Wizard (Profiling)
- 💬 KI Chat mit Hugging Face Integration
- 🔐 User Authentication (Login/Register)
- 📱 Responsive Frontend

**Deine Aufgabe:** Backend erweitern für Chat + Auth

---

## 🎯 Anforderungen

### 1. **Chat-System (Bereits Teilweise Umgesetzt)**

**Status:** ✅ Express Server vorhanden, aber ausbaufähig

**Aktuell:**
- `server.js` existiert mit einfacher Hugging Face API Proxy
- `POST /api/chat` Endpoint vorhanden
- Basis-Konversationshistorie pro User

**Was Fehlt:**
- [ ] Database für Conversations speichern
- [ ] User-Context aus Onboarding integrieren (Alter, Klasse, Fächer)
- [ ] Bessere Fehlerbehandlung
- [ ] Rate Limiting
- [ ] Caching von häufigen Fragen

---

### 2. **Authentication System (Noch zu Implementieren)**

Folgende Endpoints müssen erstellt werden:

#### **POST /auth/register**
```javascript
Request Body:
{
  "email": "user@example.com",
  "password": "sicherespasswort123",
  "name": "Max Mustermann",
  "age": 16,
  "class": "11. Klasse",
  "state": "Bayern",
  "subjects": ["Mathe", "Physik", "Deutsch"]
}

Response (Success - 201):
{
  "success": true,
  "userId": "user_123456",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registrierung erfolgreich"
}

Response (Error - 400):
{
  "success": false,
  "error": "Email existiert bereits"
}
```

**Anforderungen:**
- Email-Validierung
- Password Hashing (bcrypt)
- Duplikat-Check für Emails
- User Profile speichern (name, age, class, state, subjects)

---

#### **POST /auth/login**
```javascript
Request Body:
{
  "email": "user@example.com",
  "password": "sicherespasswort123"
}

Response (Success - 200):
{
  "success": true,
  "userId": "user_123456",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Max Mustermann",
    "email": "user@example.com",
    "age": 16,
    "subjects": ["Mathe", "Physik"]
  }
}

Response (Error - 401):
{
  "success": false,
  "error": "Credentials ungültig"
}
```

**Anforderungen:**
- Email/Password Validierung
- JWT Token generieren (expires: 7 Tage)
- User Daten zurückgeben

---

#### **POST /auth/logout**
```javascript
Request Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "message": "Logout erfolgreich"
}
```

---

#### **GET /auth/me** (Profil abrufen)
```javascript
Request Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "user": {
    "userId": "user_123456",
    "name": "Max Mustermann",
    "email": "user@example.com",
    "age": 16,
    "class": "11. Klasse",
    "state": "Bayern",
    "subjects": ["Mathe", "Physik", "Deutsch"],
    "createdAt": "2026-02-14T10:30:00Z"
  }
}
```

---

### 3. **Chat Endpoint Erweitern**

#### **POST /api/chat**
```javascript
// Aktuell: Einfacher Proxy ohne User-Context

// Gewünscht: Mit User-Kontext

Request Body:
{
  "message": "Wie rechnet man Quadratwurzeln?",
  "userId": "user_123456",  // Neu
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // Neu
}

Response:
{
  "success": true,
  "response": "Die Quadratwurzel ist die Umkehrung von Quadrieren...",
  "userId": "user_123456",
  "timestamp": "2026-02-14T10:35:00Z"
}
```

**Verbesserungen:**
- JWT Token validieren
- Konversationen in Datenbank speichern
- User-Profil nutzen (z.B. Alter → einfacherer/komplexerer Content)
- Konversationshistorie abrufen

---

#### **GET /api/chat/history**
```javascript
Request Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Query Params:
?limit=20&offset=0

Response:
{
  "success": true,
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Was ist Photosynthese?",
      "timestamp": "2026-02-14T10:30:00Z"
    },
    {
      "id": "msg_002",
      "role": "bot",
      "content": "Photosynthese ist ein biologischer Prozess...",
      "timestamp": "2026-02-14T10:31:00Z"
    }
  ],
  "total": 42
}
```

---

## 🗄️ Database Schema

### **Users Tabelle**
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INT,
  class VARCHAR(100),
  state VARCHAR(100),
  subjects JSON,  -- ["Mathe", "Physik", "Deutsch"]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

### **Conversations Tabelle**
```sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **Messages Tabelle**
```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  role ENUM('user', 'bot') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

---

## 🔐 Security Checkliste

- [ ] Passwords hashen mit bcrypt
- [ ] JWT Secret sicher speichern (Environment Variable)
- [ ] CORS konfigurieren (nur Frontend Origin)
- [ ] Rate Limiting (z.B. 10 Requests/min pro User)
- [ ] SQL Injection verhindern (Prepared Statements)
- [ ] Inputs validieren und sanitizen
- [ ] HTTPS enforcen (Production)
- [ ] Password min. 8 Zeichen
- [ ] Email-Validierung
- [ ] Token Expiration (7 Tage)

---

## 🛠️ Tech Stack Empfehlung

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "node-fetch": "^3.3.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    "dotenv": "^16.3.1",
    "mysql2": "^3.6.5",
    "express-rate-limit": "^7.1.5",
    "joi": "^17.11.0"
  }
}
```

---

## 📡 Frontend Integration

### Login Flow
1. User trägt Email/Password ein
2. Frontend sendet `POST /auth/login`
3. Backend gibt Token zurück
4. Frontend speichert Token in `localStorage`
5. Bei Chat: Token im Header mitschicken

### Register Flow
1. User macht 6-Schritt Onboarding (start.html ✅ bereits gebaut)
2. Daten in localStorage gespeichert
3. User klickt "Registrieren"
4. Frontend sendet `POST /auth/register` mit:
   - Email, Password aus Register Form
   - Name, Age, Class, State, Subjects aus localStorage
5. Backend speichert alles + gibt Token
6. Frontend navigiert zu Chat

### Chat Flow
```javascript
// Frontend schickt:
fetch('http://your-backend/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: userMessage,
    userId: userId
  })
})
```

---

## 📝 Umgebungsvariablen (.env)

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password123
DB_NAME=borin_ai

# JWT
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRY=7d

# Hugging Face
HUGGING_FACE_API_TOKEN=hf_YOUR_TOKEN_HERE

# Frontend
FRONTEND_URL=http://localhost:8000
```

---

## ✅ TODO für Backend Dev

### Phase 1: Auth System (Priorität: HOCH)
- [ ] Register Endpoint erstellen
- [ ] Login Endpoint erstellen
- [ ] JWT Middleware schreiben
- [ ] Logout Endpoint
- [ ] Get Profile Endpoint

### Phase 2: Chat Improvements (Priorität: MITTEL)
- [ ] Konversationen in DB speichern
- [ ] Chat History Endpoint
- [ ] User-Kontext in AI Prompts nutzen
- [ ] Better Error Handling

### Phase 3: Optimierungen (Priorität: NIEDRIG)
- [ ] Rate Limiting
- [ ] Caching
- [ ] Analytics
- [ ] Email Verification

---

## 🧪 Testing

### Lokal Testen mit curl:
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123!",
    "name":"Max",
    "age":16,
    "class":"11. Klasse",
    "state":"Bayern",
    "subjects":["Mathe","Physik"]
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123!"
  }'

# Chat (mit Token)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message":"Hallo Borin!",
    "userId":"user_123"
  }'
```

---

## 📞 Frontend/Backend Contract

**Zeitsynchronisation:** Keine nötig (Backend generiert Timestamps)

**Error Codes:**
- 200/201 - Success
- 400 - Bad Request (Validierung)
- 401 - Unauthorized (Credentials/Token)
- 409 - Conflict (Email exists)
- 500 - Server Error

**Token Format:** JWT (HS256)

**CORS:** Muss konfiguriert sein für `http://localhost:8000` (local) und Production URL

---

## 🚀 Deployment Ready?

**Bevor Production:**
- [ ] MySQL Database aufgesetzt
- [ ] Environment Variables konfiguriert
- [ ] HTTPS Zertifikat bereit
- [ ] Rate Limiting aktiv
- [ ] Error Logging setup
- [ ] Backups konfiguriert

---

**Questions?** Frag jederzeit nach! 💬
