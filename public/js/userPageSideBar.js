import { getCurrentUser, setCurrentUser, getTargetUser, setTargetUser } from "./userPage.js"; 

// Check if the logged-in user is following the target user
const isUserFollowing = (currentUserData, targetUserId) => {
  const listOfIds = Array.isArray(currentUserData.following)
    ? currentUserData.following.map(entry =>
        typeof entry === "string"
          ? entry
          : entry && entry._id
            ? entry._id.toString()
            : ""
      )
    : [];

  const isFollowing = listOfIds.some(idStr => idStr === targetUserId.toString());
  
  console.log(
    "isUserFollowing? listOfIds:", 
    listOfIds, 
    "target:", 
    targetUserId.toString(), 
    "→", 
    isFollowing
  );
  return isFollowing;
};

// Update the action buttons according to user state
const updateActionButtons = () => {
  const currentUser = getCurrentUser();
  const targetUser = getTargetUser();
  const actionButtons = document.getElementById("user-actions");
  if (!targetUser) return;

  if (currentUser && currentUser._id === targetUser._id) {
    actionButtons.innerHTML = `
      <button class="btn btn-outline-primary me-2" id="editProfileBtn">
        <i class="fas fa-edit me-1"></i>Edit Profile
      </button>
      <button class="btn btn-outline-danger me-2" id="deleteUserBtn">
        <i class="fas fa-trash me-1"></i>Delete Account
      </button>
    `;
  } else if (currentUser) {
    const isFollowing = isUserFollowing(currentUser, targetUser._id);
    actionButtons.innerHTML = `
      <button class="btn ${isFollowing ? "btn-secondary" : "btn-outline-success"}" id="followUserBtn">
        <i class="fas fa-${isFollowing ? "user-minus" : "user-plus"} me-1"></i>
        ${isFollowing ? "Unfollow" : "Follow"}
      </button>
    `;
  } else {
    actionButtons.innerHTML = `
      <a href="/login" class="btn btn-outline-primary">Login to Follow</a>
    `;
  }
};

// Load the current logged-in user
const loadCurrentUser = async () => {
  try {
    const res = await fetch("/api/users/me", { credentials: "include" });
    if (res.ok) {
      const user = await res.json();
      setCurrentUser(user);
      console.log("Loaded currentUser:", user);
    } else {
      setCurrentUser(null);
    }
  } catch (err) {
    console.error("Error loading current user:", err);
    setCurrentUser(null);
  }
};

// Load the profile user
const loadUserProfile = async (userId) => {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch user");

    const user = await res.json();
    setTargetUser(user);

    document.title = `${user.username} | GoNature`;

    document.getElementById("user-profile").innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <img src="${user.profileImage}" 
                 class="rounded-circle me-4 border border-3 border-light shadow" 
                 width="100" height="100" alt="Profile">
            <div>
              <h2 class="mb-1">${user.username}</h2>
              <p class="text-muted mb-2">
                <i class="fas fa-calendar-alt me-1"></i>
                Joined ${new Date(user.createdAt).toLocaleDateString()}
              </p>
              <div class="d-flex gap-3">
                <span class="text-muted">
                  <strong>${user.following?.length || 0}</strong> Following
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    updateActionButtons();
  } catch (err) {
    console.error("Error loading user profile:", err);
    document.getElementById("user-profile").innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Error loading user profile
      </div>
    `;
  }
};

// Follow/Unfollow logic
const handleFollowAction = async () => {
  const currentUser = getCurrentUser();
  const targetUser = getTargetUser();
  const button = document.getElementById("followUserBtn");

  if (!currentUser || !targetUser) return;

  const isFollowing = isUserFollowing(currentUser, targetUser._id);
  const action = isFollowing ? "unfollow" : "follow";

  button.disabled = true;
  button.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>Processing...`;

    console.log("the user we in their feed:", targetUser);
  try {
    const res = await fetch(`/api/users/${targetUser._id}/${action}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Follow request failed");

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUser._id.toString()
      );
    } else {
      currentUser.following = [...(currentUser.following || []), targetUser._id];
    }

    updateActionButtons();
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    button.disabled = false;
  }
};

// Load following users
const renderFollowedUsers = async (userId) => {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      credentials: "include",
    });
    if (!res.ok) return;

    const user = await res.json();
    const followedUsers = user.following;
    const list = document.getElementById("followingList");

    if (!Array.isArray(followedUsers) || followedUsers.length === 0) {
      list.innerHTML = `
        <div class="text-center py-3">
          <i class="fas fa-users text-muted mb-2" style="font-size: 2rem;"></i>
          <p class="text-muted mb-0">Not following anyone yet</p>
        </div>
      `;
      return;
    }

    list.innerHTML = "";

    followedUsers.forEach((u) => {
      const row = document.createElement("div");
      row.className = "d-flex align-items-center p-2 mb-2 bg-light rounded hover-shadow";
      row.style.cursor = "pointer";

      row.innerHTML = `
        <a href="/users/${u._id}" class="d-flex align-items-center text-decoration-none text-dark w-100">
          <img src="${u.profileImage}" class="rounded-circle me-3 border" width="40" height="40" alt="${u.username}" />
          <div>
            <div class="fw-medium">${u.username}</div>
            <small class="text-muted">@${u.username.toLowerCase()}</small>
          </div>
        </a>
      `;

      list.appendChild(row);
    });
  } catch (err) {
    console.error("Error rendering followed users:", err);
  }
};

// Add sidebar-related event listeners
const initSidebarEvents = (userId) => {
  document.addEventListener("click", async (e) => {
    const currentUser = getCurrentUser();
    const targetUser = getTargetUser();

    if (e.target.id === "followUserBtn") {
      await handleFollowAction();
    }

    if (e.target.id === "deleteUserBtn") {
      const confirmed = confirm("Are you sure you want to delete your account?");
      if (!confirmed) return;

      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        window.location.href = "/login";
      } else {
        alert("Error deleting account.");
      }
    }

    if (e.target.id === "editProfileBtn") {
      document.getElementById("editUsername").value = currentUser.username || "";
      document.getElementById("editEmail").value = currentUser.email || "";
      document.getElementById("editPassword").value = "";

      const preview = document.getElementById("profileImagePreview");
      preview.src = currentUser.profileImage;
      preview.style.display = "block";

      const modal = new bootstrap.Modal(document.getElementById("editUserModal"));
      modal.show();
    }

    if (
      e.target.id === "toggleFollowingBtn" ||
      e.target.getAttribute("data-bs-target") === "#followingCollapse"
    ) {
      const target = document.getElementById("followingCollapse");
      const alreadyLoaded = target.getAttribute("data-loaded");

      if (!alreadyLoaded) {
        await renderFollowedUsers(userId);
        target.setAttribute("data-loaded", "true");
      }
    }
  });

  // Edit user form submission
  document.getElementById("editUserForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById("editUserAlert");
    alertBox.classList.add("d-none");

    const formData = new FormData();
    const username = document.getElementById("editUsername").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const password = document.getElementById("editPassword").value.trim();
    const profileImageFile = document.getElementById("editProfileImage").files[0];

    if (username) formData.append("username", username);
    if (email) formData.append("email", email);
    if (password) formData.append("password", password);
    if (profileImageFile) formData.append("profileImage", profileImageFile);

    try {
      const currentUser = getCurrentUser();
      const res = await fetch(`/api/users/${currentUser._id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        alertBox.textContent = result.message || "Update failed.";
        alertBox.classList.remove("d-none");
        return;
      }

      location.reload();
    } catch (err) {
      alertBox.textContent = "An unexpected error occurred.";
      alertBox.classList.remove("d-none");
    }
  });

  // Profile image preview
  document.getElementById("editProfileImage")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("profileImagePreview");

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = "none";
    }
  });
};

export {
  loadCurrentUser,
  loadUserProfile,
  renderFollowedUsers,
  updateActionButtons,
  handleFollowAction,
  initSidebarEvents
};
