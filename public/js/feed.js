document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch user data
    const userRes = await fetch('/api/users/me');
    const userData = await userRes.json();
    document.getElementById('username').textContent = userData.username;
    document.getElementById('profileImage').src = userData.profileImage;

    // Fetch feed posts
    const res = await fetch('/api/feed');
    const posts = await res.json();

    const container = document.getElementById('feedContainer');
    container.innerHTML = '';

    posts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'col-md-6';
      card.innerHTML = `
        <div class="card p-3">
          <div class="d-flex align-items-center mb-2">
            <img src="${post.user.profileImage}" class="rounded-circle me-2" width="40" height="40" />
            <strong>${post.user.username}</strong>
            <span class="text-muted ms-auto small">${new Date(post.createdAt).toLocaleString()}</span>
          </div>
          <p>${post.content}</p>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading feed:', err);
  }
});
