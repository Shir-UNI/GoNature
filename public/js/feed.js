// Global variable to hold timeout ID
let alertTimeoutId;
/**
 * Display a styled alert box
 * @param {string} message - The message to show
 * @param {string} type - 'danger', 'success', 'info', 'warning'
 */
function showAlert(message, type = "danger") {
  const container = document.getElementById("alertContainer");
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
   if (timeout) {
    setTimeout(() => {
      container.innerHTML = "";
    }, timeout);
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  const postsContainer = document.getElementById("posts-container");
  let allPosts = [];

  // Load current user info
  const loadUser = async () => {
    const res = await fetch("/api/users/me", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch user");
    const user = await res.json();
    document.getElementById("usernameDisplay").textContent = user.username;
    document.getElementById("userProfileImage").src = user.profileImage;
  };

  // Initialize flatpickr for date range filtering
  flatpickr("#filterDateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
  });

  // Add clear (X) button handler for date filter
  document.getElementById("clearDateFilterBtn")?.addEventListener("click", () => {
  document.getElementById("filterDateRange")._flatpickr.clear();
  runDynamicFilter();
  });

  // Load user's groups and populate both dropdowns (post creation & filter)
  const loadUserGroups = async () => {
    const res = await fetch("/api/groups/my-groups", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to load groups");
      return;
    }

    const groups = await res.json();
    const postGroupSelect = document.getElementById("postGroup");
    const filterGroupSelect = document.getElementById("filterGroup");

    postGroupSelect.innerHTML = "<option selected disabled>-- Select a group --</option>";
    filterGroupSelect.innerHTML = '<option value="">All Groups</option>';

    groups.forEach((group) => {
      const postOption = document.createElement("option");
      postOption.value = group._id;
      postOption.textContent = group.name;
      postGroupSelect.appendChild(postOption);

      const filterOption = document.createElement("option");
      filterOption.value = group._id;
      filterOption.textContent = group.name;
      filterGroupSelect.appendChild(filterOption);
    });
  };

  // Load posts from server
  const loadPosts = async () => {
    const res = await fetch("/api/feed", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch posts");
    allPosts = await res.json();
    displayPosts(allPosts);
  };

  // Display given array of posts in the DOM
  const displayPosts = (posts) => {
    postsContainer.innerHTML = "";
    if (posts.length === 0) {
      postsContainer.innerHTML = '<p class="text-center">No posts to display.</p>';
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "card mb-3 shadow-sm";
      card.innerHTML = `
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <img src="${post.user.profileImage}" class="rounded-circle me-2" width="40" height="40" alt="${post.user.username}'s profile">
            <div>
              <strong>${post.user.username}</strong><br/>
              <small class="text-muted">in ${post.group.name} • ${new Date(post.createdAt).toLocaleString()}</small>
            </div>
          </div>
          <p>${post.content}</p>
          ${post.media ? `<img src="${post.media}" class="img-fluid mt-2 rounded" alt="Post media">` : ""}
        </div>
      `;
      postsContainer.appendChild(card);
    });
  };

  // Filter posts dynamically on input/change
  const runDynamicFilter = () => {
    const username = document.getElementById("filterUsername").value.trim().toLowerCase();
    const groupId = document.getElementById("filterGroup").value;
    const dateRangeValue = document.getElementById("filterDateRange").value;

    let startDate = null;
    let endDate = null;
    if (dateRangeValue.includes(" to ")) {
      const dates = dateRangeValue.split(" to ");
      startDate = new Date(dates[0]);
      endDate = new Date(dates[1] + "T23:59:59");
    }

    if (!username && !groupId && !dateRangeValue) {
      displayPosts(allPosts);
      return;
    }

    const filtered = allPosts.filter((post) => {
      const matchesUser = username ? post.user.username.toLowerCase().includes(username) : true;
      const matchesGroup = groupId ? post.group._id === groupId : true;
      const postDate = new Date(post.createdAt);
      const matchesDate = (!startDate || postDate >= startDate) && (!endDate || postDate <= endDate);
      return matchesUser && matchesGroup && matchesDate;
    });

    displayPosts(filtered);
  };

  // Bind dynamic filter events
  document.getElementById("filterUsername")?.addEventListener("input", runDynamicFilter);
  document.getElementById("filterGroup")?.addEventListener("change", runDynamicFilter);
  document.getElementById("filterDateRange")?.addEventListener("change", runDynamicFilter);

  // Submit a new post
  const handlePostSubmit = async (e) => {
    e.preventDefault();

    const content = document.getElementById("newPostContent").value.trim();
    const mediaFile = document.getElementById("newPostMedia").files[0];
    const groupId = document.getElementById("postGroup").value;
    const lat = document.getElementById("locationLat").value;
    const lng = document.getElementById("locationLng").value;

    const hasContent = content !== "";
    const hasMedia = !!mediaFile;

    if (!groupId) {
      showAlert("Please select a group", "danger");
      return;
    }

    if (!hasContent && !hasMedia) {
      showAlert("Post must include either text or media", "danger");
      return;
    }

    const type = hasMedia ? getMediaType(mediaFile) : "text";
    if (!["text", "image", "video"].includes(type)) {
      showAlert("Unsupported post type", "danger");
      return;
    }

    if ((type === "image" || type === "video") && !hasMedia) {
      showAlert("Media is required for image/video post", "danger");
      return;
    }

    // Build form data
    const formData = new FormData();
    formData.append("content", content);
    formData.append("group", groupId);
    formData.append("type", type);
    if (hasMedia) formData.append("media", mediaFile);
    if (lat && lng) {
      const location = JSON.stringify({
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      });
      formData.append("location", location);
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      showAlert("Error: " + error.message, "danger");
      return;
    }

    document.getElementById("newPostForm").reset();
    document.getElementById("mediaFileName").textContent = "No file selected";
    document.getElementById("mediaPreview").style.display = "none";
    await loadPosts();
  };

const getMediaType = (file) => {
  const type = file.type;
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  return "unknown";
};


  // Image upload preview
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

  document.getElementById("postSubmitBtn")?.addEventListener("click", handlePostSubmit);

  try {
    await loadUser();
    await loadUserGroups();
    await loadPosts();
  } catch (err) {
    console.error("Error loading feed:", err.message);
    postsContainer.innerHTML = '<div class="alert alert-danger">Error loading feed.</div>';
  }
});
