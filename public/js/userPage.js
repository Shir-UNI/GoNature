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
      const isFollowing = currentUser?.following?.includes(user._id);
      actionButtons.innerHTML = `
        <button class="btn ${
          isFollowing ? "btn-secondary" : "btn-outline-success"
        }" id="followUserBtn">
          ${isFollowing ? "Unfollow" : "Follow"}
        </button>
      `;
    }
  };

  const renderFollowedUsers = async () => {
    const res = await fetch(`/api/users/${userId}`, {
      credentials: "include",
    });

    if (!res.ok) return;

    const user = await res.json();
    const followedUsers = user.following;
    if (!Array.isArray(followedUsers) || followedUsers.length === 0) return;

    const list = document.getElementById("followingList");
    list.innerHTML = ""; // clear previous

    followedUsers.forEach((u) => {
      const row = document.createElement("div");
      row.className = "d-flex align-items-center gap-2";

      row.innerHTML = `
      <a href="/users/${u._id}" class="d-flex align-items-center text-decoration-none text-dark">
        <img src="${u.profileImage}" class="rounded-circle" width="32" height="32" alt="${u.username}" />
        <span>${u.username}</span>
      </a>
    `;

      list.appendChild(row);
    });
  };

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

      // Build post content
      let postHTML = `
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
    `;

      // Only show Edit/Delete buttons if current user is the owner
      if (currentUser && currentUser._id === post.user._id) {
        postHTML += `
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-sm btn-outline-primary edit-post-btn" data-id="${post._id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger delete-post-btn" data-id="${post._id}">Delete</button>
        </div>
      `;
      }

      postHTML += `</div>`; // Close card-body
      card.innerHTML = postHTML;
      postsContainer.appendChild(card);
    });
  };

  let editingPostId = null;

  document.addEventListener("click", (e) => {
    // 📝 Handle Edit click
    if (e.target.classList.contains("edit-post-btn")) {
      editingPostId = e.target.dataset.id;
      const card = e.target.closest(".card");
      const content = card.querySelector("p").textContent;

      document.getElementById("editPostContent").value = content;
      document.getElementById("editPostAlert").classList.add("d-none");

      const modal = new bootstrap.Modal(
        document.getElementById("editPostModal")
      );
      modal.show();
    }
  });

  document
    .getElementById("editPostForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const content = document.getElementById("editPostContent").value.trim();
      const alertBox = document.getElementById("editPostAlert");

      if (!content) {
        alertBox.textContent = "Content is required";
        alertBox.classList.remove("d-none");
        return;
      }

      try {
        const res = await fetch(`/api/posts/${editingPostId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content }),
        });

        const result = await res.json();

        if (!res.ok) {
          alertBox.textContent = result.message || "Update failed";
          alertBox.classList.remove("d-none");
          return;
        }

        // Close modal and refresh posts
        bootstrap.Modal.getInstance(
          document.getElementById("editPostModal")
        ).hide();
        await loadUserPosts();
      } catch (err) {
        alertBox.textContent = "Unexpected error";
        alertBox.classList.remove("d-none");
      }
    });

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

  try {
    await loadCurrentUser();
    await loadUserProfile();
    await loadUserPosts();
  } catch (err) {
    console.error("Failed to load user page:", err.message);
    postsContainer.innerHTML = `<div class="alert alert-danger">Error loading page.</div>`;
  }

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

  document.addEventListener("click", (e) => {
    if (e.target.id === "editProfileBtn") {
      document.getElementById("editUsername").value =
        currentUser.username || "";
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

  document
    .getElementById("editProfileImage")
    .addEventListener("change", (e) => {
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

  document.addEventListener("click", async (e) => {
    if (e.target.id === "toggleFollowingBtn") {
      const target = document.getElementById("followingCollapse");
      const alreadyLoaded = target.getAttribute("data-loaded");

      if (!alreadyLoaded) {
        await renderFollowedUsers();
        target.setAttribute("data-loaded", "true"); // avoid multiple fetches
      }
    }

    // Follow/Unfollow button
    if (e.target.id === "followUserBtn") {
      const isFollowing = e.target.textContent === "Unfollow";
      const endpoint = `/api/users/${userId}/${
        isFollowing ? "unfollow" : "follow"
      }`;

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Follow request failed");

        e.target.textContent = isFollowing ? "Follow" : "Unfollow";
        e.target.className = `btn ${
          isFollowing ? "btn-outline-success" : "btn-secondary"
        }`;
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  });
});
