document.addEventListener("DOMContentLoaded", async () => {
  const postsContainer = document.getElementById("posts-container");
  let allPosts = [];

  // Load user info
  const loadUser = async () => {
    const res = await fetch("/api/users/me", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    const user = await res.json();

    document.getElementById("usernameDisplay").textContent = user.username;
    document.getElementById("userProfileImage").src = user.profileImage;
  };

  // Load groups the user belongs to
  const loadUserGroups = async () => {
  const res = await fetch("/api/groups/my-groups", {
    method: 'GET',
    credentials: "include",
  });
  if (!res.ok) {
    console.error("Failed to load groups");
    return;
  }

  const groups = await res.json();
  const groupSelect = document.getElementById("postGroup");

 groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group._id;
    option.textContent = group.name;
    groupSelect.appendChild(option);
  });
};

  // Load posts
  const loadPosts = async () => {
    const res = await fetch("/api/feed", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch posts");
    allPosts = await res.json();
    displayPosts(allPosts);
  };

  // Display posts
  const displayPosts = (posts) => {
    postsContainer.innerHTML = "";
    if (posts.length === 0) {
      postsContainer.innerHTML =
        '<p class="text-center">No posts to display.</p>';
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "card mb-3 shadow-sm";
      card.innerHTML = `
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <img src="${
              post.user.profileImage
            }" class="rounded-circle me-2" width="40" height="40" alt="${
        post.user.username
      }'s profile">
            <div>
              <strong>${post.user.username}</strong> <br/>
              <small class="text-muted">in ${post.group.name} • ${new Date(
        post.createdAt
      ).toLocaleString()}</small>
            </div>
          </div>
          <p>${post.content}</p>
          ${
            post.media
              ? `<img src="${post.media}" class="img-fluid mt-2 rounded" alt="Post media">`
              : ""
          }
        </div>
      `;
      postsContainer.appendChild(card);
    });
  };

  // Submit new post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const content = document.getElementById("newPostContent").value.trim();
    const mediaFile = document.getElementById("newPostMedia").files[0];
    const groupId = document.getElementById("postGroup").value;
    const lat = document.getElementById("locationLat").value;
    const lng = document.getElementById("locationLng").value;

    if (!content && !mediaFile) return;

    if (!groupId) {
      alert("Please select a group");
      return;
    }
   
    const formData = new FormData();
    formData.append("content", content);
    formData.append("group", groupId);
    if (mediaFile) formData.append("media", mediaFile);
    if (lat && lng) {
      formData.append("locationLat", lat);
      formData.append("locationLng", lng);
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      alert("Failed to post");
      return;
    }

    document.getElementById("newPostForm").reset();
    document.getElementById("mediaFileName").textContent = "No file selected";
    document.getElementById("mediaPreview").style.display = "none";
    await loadPosts();
  };

  // Filter posts
  const handleSearch = () => {
    const query = document
      .getElementById("postSearchInput")
      .value.toLowerCase();
    const filtered = allPosts.filter(
      (p) =>
        p.content.toLowerCase().includes(query) ||
        p.user.username.toLowerCase().includes(query) ||
        p.group.name.toLowerCase().includes(query)
    );
    displayPosts(filtered);
  };

  // Image preview
  const mediaInput = document.getElementById("newPostMedia");
  const uploadBtn = document.getElementById("mediaUploadBtn");
  const fileNameSpan = document.getElementById("mediaFileName");
  const previewContainer = document.getElementById("mediaPreview");
  const previewImage = document.getElementById("previewImage");

  uploadBtn?.addEventListener("click", () => mediaInput.click());

  mediaInput?.addEventListener("change", () => {
    const file = mediaInput.files[0];

    if (file) {
      fileNameSpan.textContent = file.name;

      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewContainer.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      fileNameSpan.textContent = "No file selected";
      previewContainer.style.display = "none";
    }
  });

  document
    .getElementById("postSubmitBtn")
    ?.addEventListener("click", handlePostSubmit);
  document
    .getElementById("postSearchInput")
    ?.addEventListener("input", handleSearch);

  try {
    await loadUser();
    await loadUserGroups();
    await loadPosts();
  } catch (err) {
    console.error("Error loading feed:", err.message);
    postsContainer.innerHTML =
      '<div class="alert alert-danger">Error loading feed.</div>';
  }
});

