document.addEventListener("DOMContentLoaded", async function () {
  const usersList = document.getElementById("users");
  const messagesContainer = document.getElementById("messages");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");

  const token = localStorage.getItem("token");
  // Function to fetch users
  async function fetchUsers() {
    try {
      const response = await fetch("http://localhost:5000/users", {
        headers: { authorization: token },
      });
      const users = await response.json();

      users.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = user.Name;
        usersList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  // Function to fetch messages
  async function fetchMessages() {
    try {
      const response = await fetch("http://localhost:5000/messages", {
        headers: { authorization: token },
      });
      const messages = await response.json();

      messages.forEach((message) => {
        const div = document.createElement("div");
        div.classList.add("message");
        div.classList.add(message.user === "sat" ? "user" : "other");
        div.textContent = `${message.user}: ${message.text}`;
        messagesContainer.appendChild(div);
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  // Function to send a new message
  async function sendMessage(message) {
    try {
      const response = await fetch("http://localhost:5000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "token",
        },
        body: JSON.stringify({
          user: "sat", // Replace with the actual username
          text: message,
        }),
      });

      const data = await response.json();
      console.log("Message sent:", data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  // Fetch users and messages when the page loads
  await fetchUsers();
  await fetchMessages();

  // Handle message sending
  messageForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = messageInput.value.trim();
    if (message) {
      // Append the message to the chat
      const div = document.createElement("div");
      div.classList.add("message", "user");
      div.textContent = `You: ${message}`;
      messagesContainer.appendChild(div);

      // Send the message to the backend
      await sendMessage(message);

      messageInput.value = "";
    }
  });
});
