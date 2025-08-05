document.addEventListener("DOMContentLoaded", () => {
  const feedContainer = document.getElementById("feedContainer");

  const fetchFeed = async () => {
    try {
      const response = await fetch("/api/feed");
      const posts = await response.json();

      if (!Array.isArray(posts)) {
        throw new Error("Unexpected response format");
      }

      // Clear existing content
      feedContainer.innerHTML = "";

      posts.forEach(post => {
        const postElement = createPostCard(post);
        feedContainer.appendChild(postElement);
      });

    } catch (err) {
      console.error("Failed to load feed:", err);
      feedContainer.innerHTML = `<div class="alert alert-danger">Failed to load feed</div>`;
    }
  };

  const createPostCard = (post) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    const card = document.createElement("div");
    card.className = "card h-100 shadow-sm";

    // User & group info
    const header = document.createElement("div");
    header.className = "card-header d-flex align-items-center gap-2";
    header.innerHTML = `
      <img src="${post.user.profileImage}" alt="User" class="rounded-circle" width="40" height="40">
      <div>
        <strong>${post.user.username}</strong><br/>
        <small class="text-muted">${post.group.name}</small>
      </div>
    `;

    // Post content
    const body = document.createElement("div");
    body.className = "card-body";

    const content = document.createElement("p");
    content.textContent = post.content;
    body.appendChild(content);

    // Media (if exists)
    if (post.type === "image" && post.imageUrl) {
      const img = document.createElement("img");
      img.src = post.imageUrl;
      img.className = "img-fluid rounded";
      body.appendChild(img);
    } else if (post.type === "video" && post.videoUrl) {
      const video = document.createElement("video");
      video.src = post.videoUrl;
      video.controls = true;
      video.className = "w-100 rounded";
      body.appendChild(video);
    }

    // Footer with time
    const footer = document.createElement("div");
    footer.className = "card-footer text-muted small";
    const date = new Date(post.createdAt);
    footer.textContent = `Posted on ${date.toLocaleString()}`;

    // Assemble card
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    col.appendChild(card);

    return col;
  };

  fetchFeed(); // Initial load
});
