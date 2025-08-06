document.addEventListener("DOMContentLoaded", async () => {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const userId = pathParts[pathParts.length - 1];
  const profileSection = document.getElementById("user-profile");
  const actionButtons = document.getElementById("user-actions");
  const postsContainer = document.getElementById("user-posts");

  let currentUser = null;

  // Fetch logged-in user
  const loadCurrentUser = async () => {
    const res = await fetch("/api/users/me", { credentials: "include" });
    if (res.ok) {
      currentUser = await res.json();
    }
  };

  // Fetch target user info and render
  const loadUserProfile = async () => {
    const res = await fetch(`/api/users/${userId}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch user");
    const user = await res.json();

    document.title = `${user.username} | GoNature`;
    profileSection.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${user.profileImage}" class="rounded-circle me-3 border" width="80" height="80" alt="Profile">
        <h2 class="mb-0">${user.username}</h2>
      </div>
    `;

    if (currentUser && currentUser._id === user._id) {
      actionButtons.innerHTML = `
        <button class="btn btn-outline-primary me-2" id="editProfileBtn">Edit Profile</button>
        <button class="btn btn-outline-danger me-2" id="deleteUserBtn">Delete Account</button>
      `;
    } else {
      actionButtons.innerHTML = `
        <button class="btn btn-outline-success" id="followUserBtn">Follow</button>
      `;
    }
  };

  // Fetch user posts and render
  const loadUserPosts = async () => {
    const res = await fetch(`/api/posts/user/${userId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load posts");
    const posts = await res.json();

    if (posts.length === 0) {
      postsContainer.innerHTML = "<p>No posts yet.</p>";
      return;
    }

    postsContainer.innerHTML = "";

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "card mb-3 shadow-sm";
      card.innerHTML = `
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center">
              <img src="${
                post.user.profileImage
              }" class="rounded-circle me-2" width="40" height="40">
              <strong>${post.user.username}</strong>
            </div>
            <small class="text-muted">${new Date(
              post.createdAt
            ).toLocaleString()}</small>
          </div>
          <p>${post.content}</p>
          ${renderMedia(post)}
        </div>
      `;
      postsContainer.appendChild(card);
    });
  };

  const renderMedia = (post) => {
    if (!post.media) return "";
    if (post.type === "image") {
      return `<img src="${post.media}" class="img-fluid mt-2 rounded" alt="Post image">`;
    }
    if (post.type === "video") {
      return `
        <video controls class="img-fluid mt-2 rounded" style="max-height: 300px;">
          <source src="${post.media}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
    }
    return "";
  };

  // Initial load
  try {
    await loadCurrentUser();
    await loadUserProfile();
    await loadUserPosts();
  } catch (err) {
    console.error("Failed to load user page:", err.message);
    postsContainer.innerHTML = `<div class="alert alert-danger">Error loading page.</div>`;
  }

  // Bind delete button
  document.addEventListener("click", async (e) => {
    if (e.target.id === "deleteUserBtn") {
      const confirmed = confirm(
        "Are you sure you want to delete your account?"
      );
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
  });

  // Open edit profile modal
document.addEventListener("click", (e) => {
  if (e.target.id === "editProfileBtn") {
    document.getElementById("editUsername").value = currentUser.username || "";
    document.getElementById("editEmail").value = currentUser.email || "";
    document.getElementById("editPassword").value = "";

    const preview = document.getElementById("profileImagePreview");
    preview.src = currentUser.profileImage;
    preview.style.display = "block";

    const modal = new bootstrap.Modal(
      document.getElementById("editUserModal")
    );
    modal.show();
  }
});


  // Handle edit profile form submit
  const editForm = document.getElementById("editUserForm");
  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById("editUserAlert");
      alertBox.classList.add("d-none");

      const formData = new FormData();
      const username = document.getElementById("editUsername").value.trim();
      const email = document.getElementById("editEmail").value.trim();
      const password = document.getElementById("editPassword").value.trim();
      const profileImageFile =
        document.getElementById("editProfileImage").files[0];

      if (username) formData.append("username", username);
      if (email) formData.append("email", email);
      if (password) formData.append("password", password);
      if (profileImageFile) formData.append("profileImage", profileImageFile);

      try {
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
  }
   // Preview profile picture
  document.getElementById("editProfileImage").addEventListener("change", (e) => {
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

});
