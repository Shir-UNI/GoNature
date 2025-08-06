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

let allPosts = [];    // נשמור פה את כל הפוסטים המקוריים

document.addEventListener('DOMContentLoaded', async () => {
  const groupId = window.groupId;

  // … Navbar, Sidebar, Posts loading כמו קודם …

  // 2. Posts  
  allPosts = await getPostsByGroup(groupId);
  renderGroupPosts(allPosts);

  // 3. Map  
  initGroupMap(allPosts);

  // 4. Stats  
  const stats = await loadGroupStats(groupId);
  renderContributorBarChart(stats, 'groupActivityChart');

  // 5. Setup Filters UI  
  setupFilters(allPosts);
});

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

//setup filter
function setupFilters(posts) {
  const authorSelect = document.getElementById('filterAuthor');
  const dateFrom     = document.getElementById('filterDateFrom');
  const dateTo       = document.getElementById('filterDateTo');
  const typeSelect   = document.getElementById('filterType');
  const applyBtn     = document.getElementById('applyFilters');

  // Fill authors dropdown
  const authors = Array.from(new Set(posts.map(p => p.user.username)));
  authors.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    authorSelect.appendChild(opt);
  });

  applyBtn.addEventListener('click', () => {
    // Gather filter values
    const author   = authorSelect.value;
    const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
    const toDate   = dateTo.value   ? new Date(dateTo.value)   : null;
    const type     = typeSelect.value;

    // Filter logic
    const filtered = posts.filter(p => {
      // by author
      if (author && p.user.username !== author) return false;
      // by date
      const created = new Date(p.createdAt);
      if (fromDate && created < fromDate) return false;
      if (toDate   && created > toDate)   return false;
      // by media type
      if (type === 'image' && p.type !== 'image')   return false;
      if (type === 'video' && p.type !== 'video')   return false;
      if (type === 'none'  && p.media)               return false;
      return true;
    });

    // Re-render posts + map
    renderGroupPosts(filtered);
    initGroupMap(filtered);
  });
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
