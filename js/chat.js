const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("message");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  setTimeout(() => {
    addMessage("Das ist eine Beispiel-Antwort von Borin AI.", "bot");
  }, 600);
});

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "msg " + sender;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
