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

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "GET",
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "/login";
    } else {
      showAlert("Logout failed", "danger");
    }
  } catch (err) {
    showAlert("Logout error", "danger");
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const postsContainer = document.getElementById("posts-container");
  let allPosts = [];

  // Load current user info
  // Load current user info
  const loadUser = async () => {
    const res = await fetch("/api/users/me", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch user");
    const user = await res.json();

    // Update username
    const usernameDisplay = document.getElementById("usernameDisplay");
    if (usernameDisplay) {
      usernameDisplay.textContent = user.username;
    }

    // Update profile image
    const profileImg = document.getElementById("userProfileImage");
    if (profileImg) {
      profileImg.src = user.profileImage || "/images/profile-default.png";
    }

    // Update profile link
    const profileLink = document.getElementById("profileLink");
    if (profileLink && user?._id) {
      profileLink.href = `/users/${user._id}`;
    }
  };

  // Initialize flatpickr for date range filtering
  flatpickr("#filterDateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
  });

  // Add clear (X) button handler for date filter
  document
    .getElementById("clearDateFilterBtn")
    ?.addEventListener("click", () => {
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

    postGroupSelect.innerHTML =
      "<option selected disabled>-- Select a group --</option>";
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

   // New Group button & modal
  const newGroupBtn = document.getElementById('newGroupBtn');
  const newGroupModal = document.getElementById('newGroupModal');
  const newGroupForm = document.getElementById('newGroupForm');
  const newGroupError = document.getElementById('newGroupError');
  const bsNewGroup = new bootstrap.Modal(newGroupModal);
  if (newGroupBtn) {
    newGroupBtn.addEventListener('click', () => {
      newGroupError?.classList.add('d-none');
      newGroupForm.reset();
      bsNewGroup.show();
    });
    newGroupForm.addEventListener('submit', async e => {
      e.preventDefault();
      newGroupError?.classList.add('d-none');
      const name = document.getElementById('groupName').value.trim();
      const description = document.getElementById('groupDesc').value.trim();
      try {
        const res = await fetch('/api/groups', {
          method: 'POST', credentials: 'include',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ name, description })
        });
        if (!res.ok) {
          const err = await res.json(); throw new Error(err.message);
        }
        const group = await res.json();
        bsNewGroup.hide();
        window.location.href = `/groups/${group._id}`;
      } catch (err) {
        newGroupError.textContent = err.message;
        newGroupError.classList.remove('d-none');
      }
    });
  }

  // Load posts from server
  const loadPosts = async () => {
    const res = await fetch("/api/feed", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch posts");
    allPosts = await res.json();
    displayPosts(allPosts);
  };

  // fetch weather to post with openweatherAPI
  async function fetchWeatherForPost(postId, lat, lon) {
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, {
        credentials: "include",
      });

      const el = document.getElementById(`weather-${postId}`);

      if (!res.ok) {
        el.textContent = "Weather data unavailable.";
        return;
      }

      const data = await res.json();
      el.innerHTML = `
        📍 <strong>${data.locationName}</strong><br/>
        🌤 ${data.description}, ${data.temperature}°C
        <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="weather icon" style="height: 24px; vertical-align: middle;" />
      `;
    } catch (err) {
      const el = document.getElementById(`weather-${postId}`);
      if (el) el.textContent = "Error loading weather.";
      console.error(err);
    }
  }

  // Display given array of posts in the DOM
  const displayPosts = (posts) => {
  const postsContainer = document.getElementById("posts-container");
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML =
      '<p class="text-center">No posts to display.</p>';
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";

    const sourceLabel = post.group
      ? `in ${post.group.name}`
      : `from followed user`;

    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex align-items-center mb-2">
          <img src="${post.user.profileImage}" class="rounded-circle me-2" width="40" height="40" alt="${post.user.username}'s profile">
          <div>
            <strong>${post.user.username}</strong><br/>
            <small class="text-muted">${sourceLabel} • ${new Date(post.createdAt).toLocaleString()}</small>
          </div>
        </div>
        <p>${post.content}</p>
        ${renderMedia(post)}
        <div class="weather-info text-muted small mt-2" id="weather-${post._id}">Loading weather...</div>
      </div>
    `;

    postsContainer.appendChild(card);

    // Fetch and display weather if location exists
    if (post.location?.coordinates?.length === 2) {
      const [lng, lat] = post.location.coordinates;
      fetchWeatherForPost(post._id, lat, lng);
    } else {
      const weatherEl = document.getElementById(`weather-${post._id}`);
      if (weatherEl) weatherEl.textContent = "No location data.";
    }
  });
};


  // Filter posts dynamically on input/change
  const runDynamicFilter = () => {
    const username = document
      .getElementById("filterUsername")
      .value.trim()
      .toLowerCase();
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
      const matchesUser = username
        ? post.user.username.toLowerCase().includes(username)
        : true;
      const matchesGroup = groupId ? post.group._id === groupId : true;
      const postDate = new Date(post.createdAt);
      const matchesDate =
        (!startDate || postDate >= startDate) &&
        (!endDate || postDate <= endDate);
      return matchesUser && matchesGroup && matchesDate;
    });

    displayPosts(filtered);
  };

  // Bind dynamic filter events
  document
    .getElementById("filterUsername")
    ?.addEventListener("input", runDynamicFilter);
  document
    .getElementById("filterGroup")
    ?.addEventListener("change", runDynamicFilter);
  document
    .getElementById("filterDateRange")
    ?.addEventListener("change", runDynamicFilter);

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

    // Collapse the post form
    const collapse = bootstrap.Collapse.getOrCreateInstance(
      document.getElementById("createPostCollapse")
    );
    collapse.hide();
  };

  const getMediaType = (file) => {
    const type = file.type;
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    return "unknown";
  };

  function renderMedia(post) {
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
  }

  // Image upload preview
  const mediaInput = document.getElementById("newPostMedia");
  const uploadBtn = document.getElementById("mediaUploadBtn");
  const fileNameSpan = document.getElementById("mediaFileName");
  const previewContainer = document.getElementById("mediaPreview");
  const previewImage = document.getElementById("previewImage");

  uploadBtn?.addEventListener("click", () => mediaInput.click());

  mediaInput?.addEventListener("change", () => {
    const file = mediaInput.files[0];
    const previewImage = document.getElementById("previewImage");
    const previewVideo = document.getElementById("previewVideo");
    const previewContainer = document.getElementById("mediaPreview");
    const removeBtn = document.getElementById("removeMediaBtn");

    if (file) {
      fileNameSpan.textContent = file.name;
      const type = getMediaType(file);

      if (type === "image") {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
          previewImage.style.display = "block";
          previewVideo.style.display = "none";
          previewContainer.style.display = "block";
          removeBtn.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else if (type === "video") {
        const videoURL = URL.createObjectURL(file);
        previewVideo.src = videoURL;
        previewVideo.style.display = "block";
        previewImage.style.display = "none";
        previewContainer.style.display = "block";
        removeBtn.style.display = "block";
      } else {
        fileNameSpan.textContent = "Unsupported file";
        previewImage.style.display = "none";
        previewVideo.style.display = "none";
        previewContainer.style.display = "none";
        removeBtn.style.display = "none";
      }
    } else {
      fileNameSpan.textContent = "No file selected";
      previewImage.style.display = "none";
      previewVideo.style.display = "none";
      previewContainer.style.display = "none";
      removeBtn.style.display = "none";
    }
  });

  // Clear button logic
  document.getElementById("removeMediaBtn")?.addEventListener("click", () => {
    mediaInput.value = "";
    previewImage.src = "";
    previewVideo.src = "";
    previewImage.style.display = "none";
    previewVideo.style.display = "none";
    previewContainer.style.display = "none";
    fileNameSpan.textContent = "No file selected";
    document.getElementById("removeMediaBtn").style.display = "none";
  });

  document
    .getElementById("postSubmitBtn")
    ?.addEventListener("click", handlePostSubmit);

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
