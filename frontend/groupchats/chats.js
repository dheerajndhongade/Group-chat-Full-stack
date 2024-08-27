document.addEventListener("DOMContentLoaded", async function () {
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

  async function fetchGroups() {
    try {
      const response = await fetch("http://localhost:5000/groups", {
        headers: { authorization: token },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${data.message}`);
      }

      groupsList.innerHTML = "";
      data.groups.forEach((group) => {
        const li = document.createElement("li");
        li.textContent = group.groupname;
        li.dataset.groupId = group.groupid;
        li.addEventListener("click", () => {
          switchGroup(group.id);
        });
        groupsList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching groups:", error.message || error);
    }
  }

  async function switchGroup(groupId) {
    currentGroupId = groupId;
    try {
      const response = await fetch(
        `http://localhost:5000/groups/${groupId}/chats`,
        {
          headers: { authorization: token },
        }
      );

      if (!response.ok) {
        `throw new Error(Failed to fetch chats: ${response.statusText})`;
      }

      const data = await response.json();
      const messages = data.chats;

      messagesContainer.innerHTML = "";

      messages.forEach((message) => {
        const div = document.createElement("div");
        div.classList.add("message");
        div.classList.add(
          message.User && message.User.username === username ? "user" : "other"
        );
        div.textContent = `${
          message.User ? message.User.username : "Unknown"
        }: ${message.message}`;
        messagesContainer.appendChild(div);
      });

      document.getElementById("groupName").textContent = data.groupDetails.name;

      const groupDetailsElement = document.getElementById("group-details");
      groupDetailsElement.innerHTML = `
            <h2>${data.groupDetails.name}</h2>
            <p>Members: ${data.groupDetails.members
              .map((member) => member.username)
              .join(", ")}</p>
            <p>Admins: ${data.groupDetails.admins
              .map((admin) => admin.username)
              .join(", ")}</p>
        `;
    } catch (error) {
      console.error("Error switching group:", error.message || error);
    }
  }

  async function sendMessage(messageContent) {
    if (!currentGroupId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/groups/${currentGroupId}/chats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
          body: JSON.stringify({
            message: messageContent,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Failed to send message: ${data.message || "Unknown error"}`
        );
      }

      const div = document.createElement("div");
      div.classList.add("message");
      div.classList.add(username ? "user" : "other");
      div.textContent = `${username}: ${messageContent}`;
      messagesContainer.appendChild(div);
      messageInput.value = "";
    } catch (error) {
      console.error("Error sending message:", error.message || error);
    }
  }

  createGroupBtn.addEventListener("click", () => {
    createGroupModal.classList.add("show");
  });

  closeCreateGroupModal.addEventListener("click", () => {
    createGroupModal.classList.remove("show");
  });

  createGroupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const groupNameValue = groupName.value;
    const groupUsers = document
      .getElementById("groupUsersInput")
      .value.split(",")
      .map((user) => user.trim());

    try {
      const response = await fetch("http://localhost:5000/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({ groupName: groupNameValue, users: groupUsers }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to create group: ${data.message}`);
      }
      createGroupModal.classList.remove("show");
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error.message || error);
    }
  });

  viewGroupDetailsBtn.addEventListener("click", async () => {
    if (currentGroupId) {
      try {
        const response = await fetch(
          `http://localhost:5000/groups/${currentGroupId}/details`,
          {
            headers: { authorization: token },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Failed to fetch group details: ${data.message}`);
        }

        showGroupDetails(data);
      } catch (error) {
        console.error("Error fetching group details:", error.message || error);
      }
    }
  });

  function showGroupDetails(group) {
    const isAdmin = group.admins.some((admin) => admin.username === username);

    groupDetails.innerHTML = `
      <h3>${group.name}</h3>
      <p>Admins: ${group.admins.map((admin) => admin.username).join(", ")}</p>
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
              isAdmin && !group.admins.some((admin) => admin.id === member.id)
                ? `<button class="make-admin-btn">Make Admin</button>
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
          makeAdmin(memberId);
        });
      });

      document.querySelectorAll(".remove-user-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const memberId = button.closest("li").dataset.memberId;
          removeUser(memberId);
        });
      });
    }
  }

  closeGroupDetailsModal.addEventListener("click", () => {
    groupDetailsModal.classList.remove("show");
  });

  searchUserInput.addEventListener("input", async () => {
    const query = searchUserInput.value.trim();
    if (query.length > 0 && currentGroupId) {
      try {
        const response = await fetch(
          `http://localhost:5000/users/search?groupId=${currentGroupId}&query=${encodeURIComponent(
            query
          )}`,
          {
            headers: { authorization: token },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Failed to search users: ${data.message}`);
        }

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

        // Attach event listeners after the search results are updated
        document.querySelectorAll(".add-user-btn").forEach((button) => {
          button.addEventListener("click", () => {
            const userId = button.dataset.userId;
            console.log(userId);
            addUserToGroup(userId);
          });
        });
      } catch (error) {
        console.error("Error searching users:", error.message || error);
      }
    } else {
      searchResults.innerHTML = "";
    }
  });

  async function addUserToGroup(userId) {
    if (currentGroupId) {
      try {
        const response = await fetch(
          `http://localhost:5000/groups/${currentGroupId}/adduser`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: token,
            },
            body: JSON.stringify({ userId }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Failed to add user: ${data.message}`);
        }
        searchResults.innerHTML = "";
        showGroupDetails(data.group);
      } catch (error) {
        console.error("Error adding user:", error.message || error);
      }
    }
  }

  async function makeAdmin(userId) {
    console.log("aaaaaaaaa", userId);
    try {
      const response = await fetch(
        `http://localhost:5000/groups/${currentGroupId}/makeadmin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to make admin: ${data.message}`);
      }
      //switchGroup(currentGroupId);
      showGroupDetails(data.group);
    } catch (error) {
      console.error("Error making admin:", error.message || error);
    }
  }

  async function removeUser(userId) {
    try {
      const response = await fetch(
        `http://localhost:5000/groups/${currentGroupId}/removeuser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to remove user: ${data.message}`);
      }
      //switchGroup(currentGroupId);
      showGroupDetails(data.group);
    } catch (error) {
      console.error("Error removing user:", error.message || error);
    }
  }

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(messageInput.value);
  });

  fetchGroups();
});
