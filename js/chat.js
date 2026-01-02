/**
 * Borin AI - Chat Frontend Logic
 * Verbindet das UI mit dem Node.js Backend (server.js)
 */

const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const text = input.value.trim();
  if (!text) return;

  // 1. Benutzer-Nachricht im UI anzeigen
  addMessage(text, "user");
  input.value = "";

  // 2. Lade-Animation (Typing Indicator) anzeigen
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "msg bot typing";
  loadingDiv.textContent = "Borin AI denkt nach...";
  chat.appendChild(loadingDiv);
  chat.scrollTop = chat.scrollHeight;

  try {
    // 3. Anfrage an dein lokales Backend senden
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) {
      throw new Error('Netzwerk-Antwort war nicht ok');
    }

    const data = await response.json();

    // 4. Lade-Animation entfernen und KI-Antwort anzeigen
    chat.removeChild(loadingDiv);
    addMessage(data.response, "bot");

  } catch (error) {
    // Fehlerbehandlung (z.B. wenn der Server nicht läuft)
    if (chat.contains(loadingDiv)) {
      chat.removeChild(loadingDiv);
    }
    addMessage("Fehler: Ich konnte keine Verbindung zum Server herstellen. Stelle sicher, dass 'node server.js' läuft.", "bot");
    console.error("Fetch Error:", error);
  }
});

/**
 * Hilfsfunktion zum Erstellen der Nachrichten-Bubbles
 */
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "msg " + sender;
  
  //textContent ist sicher gegen XSS, erhält aber keine Zeilenumbrüche.
  //Wir ersetzen Zeilenumbrüche durch <br> Tags für eine schönere Darstellung.
  div.innerText = text; 
  
  chat.appendChild(div);
  
  // Automatisch nach unten scrollen
  chat.scrollTop = chat.scrollHeight;
}