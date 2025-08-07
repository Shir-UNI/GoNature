// Fetch posts for this group
export const getPostsByGroup = async (groupId) => {
  const res = await fetch(`/api/posts/groups/${groupId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load group posts');
  return await res.json();
};

// Render posts into #group-posts
export const renderGroupPosts = (posts) => {
  const postsContainer = document.getElementById('group-posts');
  if (!postsContainer) {
    console.error('renderGroupPosts: element #group-posts not found');
    return;
  }

  // for no posts - add message
  if (!posts.length) {
    postsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-images text-muted mb-3" style="font-size:3rem"></i>
        <h4 class="text-muted">No posts in this group yet</h4>
      </div>`;
    return;
  }

  // else: show posts
  postsContainer.innerHTML = '';
  posts.forEach(post => {
    const col = document.createElement('div');
    col.className = 'col-12 mb-4';
    col.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <!-- post header -->
          <div class="d-flex align-items-center mb-3">
            <img src="${post.user.profileImage}" 
                 class="rounded-circle me-3 border" 
                 width="45" height="45" alt="">
            <div>
              <div class="fw-semibold">${post.user.username}</div>
              <small class="text-muted">
                <i class="fas fa-clock me-1"></i>${new Date(post.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>
          <!-- post content -->
          <p class="mb-3">${post.content}</p>
          <!-- post media -->
          ${post.type === 'image'
            ? `<img src="${post.media}" class="img-fluid rounded shadow-sm" alt=""/>`
            : post.type === 'video'
              ? `<video controls class="w-100 rounded shadow-sm">
                   <source src="${post.media}" type="video/mp4">
                 </video>`
              : ''}
        </div>
      </div>`;
    postsContainer.appendChild(col);
  });
};
