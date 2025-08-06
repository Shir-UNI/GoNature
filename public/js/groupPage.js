let currentUser = null;
let groupInfo   = null;

export const getCurrentUser = () => currentUser;
export const setCurrentUser = (u) => { currentUser = u; };

export const getGroupInfo = () => groupInfo;
export const setGroupInfo = (g) => { groupInfo = g; };

// File: public/js/groupPage.js
import { loadGroupSidebar, initGroupSidebarEvents } from './groupPageSideBar.js';
import { getPostsByGroup, renderGroupPosts }   from './groupPagePosts.js';
import { initGroupMap }                        from './groupPageMap.js';
import { loadGroupStats, renderContributorBarChart } from './chartUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const groupId = window.groupId;

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
