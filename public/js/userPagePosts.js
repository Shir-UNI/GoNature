import { getCurrentUser } from "./userPage.js";

let editingPostId = null;

// Load and display posts of the user
const loadUserPosts = async (userId) => {
  const postsContainer = document.getElementById("user-posts");

  try {
    const res = await fetch(`/api/posts/user/${userId}`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to load posts");

    const posts = await res.json();

    if (posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-images text-muted mb-3" style="font-size: 3rem;"></i>
          <h4 class="text-muted">No posts yet</h4>
          <p class="text-muted">This user hasn't shared anything yet.</p>
        </div>
      `;
      return;
    }

    postsContainer.innerHTML = "";

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "card mb-4 shadow-sm hover-shadow";
      card.style.transition = "all 0.2s ease";

      let postHTML = `
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center">
              <img src="${post.user.profileImage}" 
                   class="rounded-circle me-3 border" 
                   width="45" height="45">
              <div>
                <div class="fw-medium">${post.user.username}</div>
                <small class="text-muted">
                  <i class="fas fa-clock me-1"></i>
                  ${new Date(post.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
      `;

      const currentUser = getCurrentUser();
      if (currentUser && currentUser._id === post.user._id) {
        postHTML += `
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                    type="button" data-bs-toggle="dropdown">
              <i class="fas fa-ellipsis-h"></i>
            </button>
            <ul class="dropdown-menu">
              <li><button class="dropdown-item edit-post-btn" data-id="${post._id}">
                <i class="fas fa-edit me-2"></i>Edit
              </button></li>
              <li><button class="dropdown-item text-danger delete-post-btn" data-id="${post._id}">
                <i class="fas fa-trash me-2"></i>Delete
              </button></li>
            </ul>
          </div>
        `;
      }

      postHTML += `
          </div>
          <p class="mb-3">${post.content}</p>
          ${renderMedia(post)}
        </div>
      `;

      card.innerHTML = postHTML;

      // Hover effect
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-2px)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
      });

      postsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading posts:", err);
    postsContainer.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Error loading posts
      </div>
    `;
  }
};

// Render image/video if exists
const renderMedia = (post) => {
  if (!post.media) return "";
  if (post.type === "image") {
    return `
      <div class="position-relative">
        <img src="${post.media}" 
             class="img-fluid rounded shadow-sm w-100" 
             alt="Post image"
             style="max-height: 400px; object-fit: cover;">
      </div>
    `;
  }
  if (post.type === "video") {
    return `
      <div class="position-relative">
        <video controls class="w-100 rounded shadow-sm" style="max-height: 400px;">
          <source src="${post.media}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `;
  }
  return "";
};

// Global event listener
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-post-btn")) {
    const postId = e.target.dataset.id;
    const confirmed = confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete post");
      const userId = window.location.pathname.split("/").pop();
      await loadUserPosts(userId);
    } catch (err) {
      alert("Error deleting post: " + err.message);
    }
  }

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

// Edit post form
document
  .getElementById("editPostForm")
  ?.addEventListener("submit", async (e) => {
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

      bootstrap.Modal.getInstance(
        document.getElementById("editPostModal")
      ).hide();

      const userId = window.location.pathname.split("/").pop();
      await loadUserPosts(userId);
    } catch (err) {
      alertBox.textContent = "Unexpected error";
      alertBox.classList.remove("d-none");
    }
  });

export { loadUserPosts };
