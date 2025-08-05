document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get current user info (send session cookie!)
    const userRes = await fetch('/api/users/me', {
      method: 'GET',
      credentials: 'include' 
    });

    if (!userRes.ok) throw new Error('Failed to fetch user data');
    const user = await userRes.json();

    // Update navbar with user info
    const usernameElement = document.getElementById('navbar-username');
    const profileImageElement = document.getElementById('navbar-profile-img');

    if (usernameElement) usernameElement.textContent = user.username;
    if (profileImageElement) profileImageElement.src = user.profileImage;

    // Load feed posts (send session cookie!)
    const postsRes = await fetch('/api/feed', {
      method: 'GET',
      credentials: 'include' 
    });

    if (!postsRes.ok) throw new Error('Failed to fetch posts');
    const posts = await postsRes.json();

    const feedContainer = document.getElementById('feed-container');
    feedContainer.innerHTML = '';

    if (posts.length === 0) {
      feedContainer.innerHTML = '<p class="text-center mt-4">No posts to display yet...</p>';
    } else {
      posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('card', 'mb-3');

        postElement.innerHTML = `
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <img src="${post.user.profileImage}" class="rounded-circle me-2" width="40" height="40" alt="${post.user.username}'s profile">
              <strong>${post.user.username}</strong> in <em>${post.group.name}</em>
            </div>
            <p>${post.content}</p>
            ${post.media ? `<img src="${post.media}" class="img-fluid mt-2" alt="Post media">` : ''}
            <p class="text-muted mt-2 small">${new Date(post.createdAt).toLocaleString()}</p>
          </div>
        `;

        feedContainer.appendChild(postElement);
      });
    }

  } catch (err) {
    console.error('Error loading feed:', err.message);
    const feedContainer = document.getElementById('feed-container');
    if (feedContainer) {
      feedContainer.innerHTML = '<div class="alert alert-danger">An error occurred while loading the feed.</div>';
    }
  }
});
