// State for current user and group info
let currentUser = null;
let groupInfo   = null;

// Accessors for current user
export const getCurrentUser = () => currentUser;
export const setCurrentUser = (u) => { currentUser = u; };

// Accessors for group info
export const getGroupInfo = () => groupInfo;
export const setGroupInfo = (g) => { groupInfo = g; };

// File: public/js/groupPage.js
import { loadGroupSidebar, initGroupSidebarEvents } from './groupPageSideBar.js';
import { getPostsByGroup, renderGroupPosts }        from './groupPagePosts.js';
import { initGroupMap }                             from './groupPageMap.js';
import { loadGroupStats, renderContributorBarChart }from './chartUtils.js';

// Utility to update Navbar based on currentUser
function updateNavbar() {
  const loginBtn = document.getElementById('loginBtn');
  const profileLink = document.getElementById('profileLink');
  const avatar = document.getElementById('userProfileImage');
  const usernameDisplay = document.getElementById('usernameDisplay');
  const logoutBtn = document.getElementById('logoutBtn');

  if (currentUser) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileLink) { profileLink.style.display = 'inline-block'; profileLink.href = `/users/${currentUser._id}`; }
    if (avatar) { avatar.style.display = 'inline-block'; avatar.src = currentUser.profileImage; }
    if (usernameDisplay) { usernameDisplay.style.display = 'inline'; usernameDisplay.textContent = currentUser.username; }
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (profileLink) profileLink.style.display = 'none';
    if (avatar) avatar.style.display = 'none';
    if (usernameDisplay) usernameDisplay.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const groupId = window.groupId;

  // 0. Load current user for Navbar
  try {
    const res = await fetch('/api/users/me', { credentials: 'include' });
    if (res.ok) {
      const user = await res.json();
      setCurrentUser(user);
    }
  } catch (err) {
    console.error('Failed to load current user for Navbar:', err);
  }
  updateNavbar();

  try {
    // 1. Sidebar
    await loadGroupSidebar(groupId);
    initGroupSidebarEvents(groupId);

    // 2. Posts
    const posts = await getPostsByGroup(groupId);
    renderGroupPosts(posts);

    // 3. Map
    initGroupMap(posts);

    // 4. Stats
    const stats = await loadGroupStats(groupId);
    renderContributorBarChart(stats, 'groupActivityChart');
  } catch (err) {
    console.error('Failed to init Group Page:', err);
    const postsEl = document.getElementById('group-posts');
    if (postsEl) {
      postsEl.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Error loading group page: ${err.message}
        </div>`;
    }
  }
});
