/**
 * Borin AI - Chat Frontend
 * Nutzt lokalen Backend-Server als Proxy für KI-Responses
 */

const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("message");

let conversationHistory = [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const text = input.value.trim();
  if (!text) return;

  // Benutzer-Nachricht im UI anzeigen
  addMessage(text, "user");
  input.value = "";
  input.focus();

  // Lade-Animation anzeigen
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "msg bot";
  loadingDiv.innerHTML = `<span class="typing-animation">Borin AI denkt nach</span>`;
  chat.appendChild(loadingDiv);
  chat.scrollTop = chat.scrollHeight;

  try {
    // KI-Antwort vom Backend abrufen
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Fehler ${response.status}`);
    }

    const data = await response.json();

    // Lade-Animation entfernen
    if (chat.contains(loadingDiv)) {
      chat.removeChild(loadingDiv);
    }
    
    // KI-Antwort anzeigen
    addMessage(data.response, "bot");
    conversationHistory.push({ role: "user", content: text });
    conversationHistory.push({ role: "assistant", content: data.response });

  } catch (error) {
    console.error("Chat Error:", error);
    
    // Lade-Animation entfernen
    if (chat.contains(loadingDiv)) {
      chat.removeChild(loadingDiv);
    }
    
    // Fehlerbehandlung
    let errorMessage = "❌ Verbindungsfehler!";
    
    if (error.message.includes("Failed to fetch")) {
      errorMessage = "⚠️ Backend läuft nicht! Starte es mit:\nnode server.js";
    } else if (error.message.includes("Currently loading")) {
      errorMessage = "⏳ Das KI-Modell lädt gerade... Versuche es in 30 Sekunden erneut.";
    } else if (error.message) {
      errorMessage = `⚠️ ${error.message}`;
    }
    
    addMessage(errorMessage, "bot");
  }
});

/**
 * Nachrichten zum Chat hinzufügen
 */
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "msg " + sender;
  
  // Text darstellen
  div.innerText = text;
  
  // Animation
  div.style.animation = "fadeInMessage 0.3s ease-out";
  
  chat.appendChild(div);
  
  // Automatisch nach unten scrollen
  setTimeout(() => {
    chat.scrollTop = chat.scrollHeight;
  }, 50);
}

// Scroll beim Laden
window.addEventListener("load", () => {
  chat.scrollTop = chat.scrollHeight;
});