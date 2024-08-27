document.addEventListener("DOMContentLoaded", function () {
  const groupsList = document.getElementById("groups");
  const messagesContainer = document.getElementById("messages");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");
  const createGroupBtn = document.getElementById("createGroupBtn");
  const createGroupModal = document.getElementById("createGroupModal");
  const closeCreateGroupModal = document.getElementById(
    "closeCreateGroupModal"
  );
  const createGroupForm = document.getElementById("createGroupForm");
  const groupName = document.getElementById("groupNameInput");
  const viewGroupDetailsBtn = document.getElementById("viewGroupDetailsBtn");
  const groupDetailsModal = document.getElementById("groupDetailsModal");
  const closeGroupDetailsModal = document.getElementById(
    "closeGroupDetailsModal"
  );
  const groupDetails = document.getElementById("groupDetails");
  const searchUserInput = document.getElementById("searchUserInput");
  const searchResults = document.getElementById("searchResults");
  const addUserModal = document.getElementById("addUserModal");
  const closeAddUserModal = document.getElementById("closeAddUserModal");
  const addUserList = document.getElementById("addUserList");

  let currentGroupId = null;
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const socket = new WebSocket("ws://localhost:5000"); // Replace with your WebSocket server URL

  socket.addEventListener("message", function (event) {
    const data = JSON.parse(event.data);
    if (data.type === "chat") {
      displayMessage(data.message);
    } else if (data.type === "group") {
      updateGroups(data.groups);
    } else if (data.type === "groupDetails") {
      showGroupDetails(data.groupDetails);
    }
  });

  socket.addEventListener("open", function () {
    console.log("WebSocket connection established");
    fetchGroups(); // Fetch groups once the WebSocket connection is open
  });

  socket.addEventListener("close", function () {
    console.log("WebSocket connection closed");
  });

  socket.addEventListener("error", function (error) {
    console.error("WebSocket error:", error);
  });

  function fetchGroups() {
    socket.send(JSON.stringify({ type: "fetchGroups", token }));
  }

  function switchGroup(groupId) {
    currentGroupId = groupId;
    socket.send(JSON.stringify({ type: "fetchGroupChats", groupId, token }));
  }

  function sendMessage(messageContent) {
    if (!currentGroupId) return;
    socket.send(
      JSON.stringify({
        type: "sendMessage",
        groupId: currentGroupId,
        message: messageContent,
        token,
      })
    );
  }

  function displayMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(message.User.username === username ? "user" : "other");
    div.textContent = `${message.User.username}: ${message.message}`;
    messagesContainer.appendChild(div);
  }

  function updateGroups(groups) {
    groupsList.innerHTML = "";
    groups.forEach((group) => {
      const li = document.createElement("li");
      li.textContent = group.groupname;
      li.dataset.groupId = group.groupid;
      li.addEventListener("click", () => {
        switchGroup(group.groupid);
      });
      groupsList.appendChild(li);
    });
  }

  function showGroupDetails(group) {
    const isAdmin = group.admins.some((admin) => admin.username === username);

    groupDetails.innerHTML = `
          <h3>${group.name}</h3>
          <p>Admins: ${group.admins
            .map((admin) => admin.username)
            .join(", ")}</p>
          <ul id="groupMembersList">
              ${group.members
                .map(
                  (member) => `
                  <li data-member-id="${member.id}">
                      ${member.username} ${
                    group.admins.some((admin) => admin.id === member.id)
                      ? "(Admin)"
                      : ""
                  }
                      ${
                        isAdmin &&
                        !group.admins.some((admin) => admin.id === member.id)
                          ? `
                          <button class="make-admin-btn">Make Admin</button>
                          <button class="remove-user-btn">Remove</button>`
                          : ""
                      }
                  </li>
              `
                )
                .join("")}
          </ul>
      `;

    groupDetailsModal.classList.add("show");

    searchUserInput.style.display = isAdmin ? "block" : "none";

    if (isAdmin) {
      document.querySelectorAll(".make-admin-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const memberId = button.closest("li").dataset.memberId;
          socket.send(
            JSON.stringify({
              type: "makeAdmin",
              groupId: currentGroupId,
              userId: memberId,
              token,
            })
          );
        });
      });

      document.querySelectorAll(".remove-user-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const memberId = button.closest("li").dataset.memberId;
          socket.send(
            JSON.stringify({
              type: "removeUser",
              groupId: currentGroupId,
              userId: memberId,
              token,
            })
          );
        });
      });
    }
  }

  createGroupBtn.addEventListener("click", () => {
    createGroupModal.classList.add("show");
  });

  closeCreateGroupModal.addEventListener("click", () => {
    createGroupModal.classList.remove("show");
  });

  createGroupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const groupNameValue = groupName.value;
    const groupUsers = document
      .getElementById("groupUsersInput")
      .value.split(",")
      .map((user) => user.trim());

    socket.send(
      JSON.stringify({
        type: "createGroup",
        groupName: groupNameValue,
        users: groupUsers,
        token,
      })
    );

    createGroupModal.classList.remove("show");
  });

  viewGroupDetailsBtn.addEventListener("click", () => {
    if (currentGroupId) {
      socket.send(
        JSON.stringify({
          type: "fetchGroupDetails",
          groupId: currentGroupId,
          token,
        })
      );
    }
  });

  closeGroupDetailsModal.addEventListener("click", () => {
    groupDetailsModal.classList.remove("show");
  });

  searchUserInput.addEventListener("input", () => {
    const query = searchUserInput.value.trim();
    if (query.length > 0 && currentGroupId) {
      socket.send(
        JSON.stringify({
          type: "searchUsers",
          groupId: currentGroupId,
          query,
          token,
        })
      );
    } else {
      searchResults.innerHTML = "";
    }
  });

  socket.addEventListener("message", function (event) {
    const data = JSON.parse(event.data);
    if (data.type === "searchResults") {
      searchResults.innerHTML = data.users
        .map(
          (user) => `
              <li>
                  ${user.username}
                  <button class="add-user-btn" data-user-id="${user.id}">Add User</button>
              </li>
          `
        )
        .join("");

      document.querySelectorAll(".add-user-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const userId = button.dataset.userId;
          socket.send(
            JSON.stringify({
              type: "addUserToGroup",
              groupId: currentGroupId,
              userId,
              token,
            })
          );
        });
      });
    }
  });

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(messageInput.value);
    messageInput.value = ""; // Clear input field after sending
  });
});
